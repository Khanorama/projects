"""Finds local opportunities: searches the web from the student's profile, then scrapes each result page."""

import re
import requests
from datetime import date
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urlparse
from ddgs import DDGS

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
)

PAGE_HEADERS = {
    "User-Agent": USER_AGENT,
    "Accept-Language": "en-US,en;q=0.9",
}

FETCH_TIMEOUT  = 10
SEARCH_TIMEOUT = 8

# tried in order until one returns results (DuckDuckGo's own page blocks scripts with a captcha)
SEARCH_BACKENDS = ["yahoo", "auto"]

SEARCH_WORKERS = 4
FETCH_WORKERS  = 8


def _build_queries(profile: dict) -> list[str]:
    """Build diverse search queries from the student profile."""
    location  = profile.get("location") or ""
    interests = profile.get("interests") or []
    if isinstance(interests, str):
        interests = [i.strip() for i in interests.split(",") if i.strip()]
    skills = profile.get("skills") or []
    if isinstance(skills, str):
        skills = [s.strip() for s in skills.split(",") if s.strip()]
    goals   = str(profile.get("career_goals") or "")
    level   = "college" if "college" in str(profile.get("grade") or "").lower() else "high school"
    year    = date.today().year

    queries = []

    # interest-based volunteering
    if interests:
        queries.append(f'site:volunteermatch.org OR site:idealist.org {" ".join(interests[:2])} volunteer {location}')
        queries.append(f'{" ".join(interests[:2])} volunteer near {location} {level} student')

    # internships in the field they want
    if goals:
        first_word = goals.split()[0]
        queries.append(f'{first_word} internship {location} {level} student {year} OR {year + 1}')

    # skill-based
    if skills:
        queries.append(f'{skills[0]} volunteer OR internship {location} youth OR teenager')

    # general local volunteering
    queries.append(f'volunteer opportunities {location} nonprofit {level}')

    # general local internships
    queries.append(f'summer internship program {location} area {level} {year}')

    # community service
    queries.append(f'community service {location} youth program volunteer')

    # VolunteerMatch listings
    queries.append(f'site:volunteermatch.org {location} volunteer')

    # dedupe (and fix double spaces when there's no location)
    seen, unique = set(), []
    for q in (" ".join(q.split()) for q in queries):
        if q not in seen:
            seen.add(q)
            unique.append(q)

    return unique[:8]


def _web_search(query: str, max_results: int = 6) -> list[dict]:
    """Returns [{title, url, snippet}] from the first backend that finds anything."""
    for backend in SEARCH_BACKENDS:
        try:
            hits = DDGS(timeout=SEARCH_TIMEOUT).text(query, max_results=max_results, backend=backend)
        except Exception as e:
            print(f"  [search:{backend}] '{query[:55]}' failed: {str(e)[:80]}")
            continue
        results = [
            {"title": h.get("title", ""), "url": h.get("href", ""), "snippet": h.get("body", "")}
            for h in hits if h.get("href")
        ]
        if results:
            print(f"  [search:{backend}] '{query[:55]}' -> {len(results)} results")
            return results
    return []


SKIP_DOMAINS = {
    "facebook.com", "twitter.com", "x.com", "instagram.com", "linkedin.com",
    "youtube.com", "tiktok.com", "pinterest.com",
    "indeed.com", "glassdoor.com", "ziprecruiter.com", "monster.com",
    "google.com", "bing.com", "yahoo.com", "reddit.com",
    "wikipedia.org", "wikihow.com",
    "yelp.com", "tripadvisor.com",
    "amazon.com", "ebay.com",
}

def _is_useful_url(url: str) -> bool:
    if not url or not url.startswith("http"):
        return False
    domain = urlparse(url).netloc.lower().replace("www.", "")
    if any(skip in domain for skip in SKIP_DOMAINS):
        return False
    if url.lower().endswith((".pdf", ".doc", ".docx", ".xls", ".xlsx")):
        return False
    return True


def _fetch(url: str) -> BeautifulSoup | None:
    try:
        r = requests.get(url, headers=PAGE_HEADERS, timeout=FETCH_TIMEOUT,
                         allow_redirects=True)
        if r.status_code != 200:
            return None
        return BeautifulSoup(r.text, "html.parser")
    except Exception as e:
        print(f"  [fetch] {url[:60]} -> {e}")
        return None


def _extract_email(text: str) -> str:
    m = re.search(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", text)
    return m.group(0) if m else ""


def _extract_description(soup: BeautifulSoup, kw: list[str], fallback: str) -> str:
    """Pull the most relevant visible paragraph from the page."""
    best, best_score = fallback, 0
    for el in soup.find_all(["p", "li"], limit=100):
        text = el.get_text(" ", strip=True)
        if len(text) < 60 or len(text) > 700:
            continue
        score = sum(1 for k in kw if k.lower() in text.lower())
        if score > best_score:
            best, best_score = text[:420], score
    return best


def _extract_org_name(soup: BeautifulSoup, fallback: str, url: str) -> str:
    og = soup.find("meta", property="og:site_name")
    if og and og.get("content", "").strip():
        return og["content"].strip()
    t = soup.find("title")
    if t:
        raw = t.get_text().strip()
        for sep in [" | ", " - ", " – ", " · ", ": "]:
            if sep in raw:
                return raw.split(sep)[0].strip()[:80]
        if len(raw) < 80:
            return raw
    netloc = urlparse(url).netloc.replace("www.", "")
    return netloc.split(".")[0].replace("-", " ").title()


def _guess_category(text: str) -> str:
    cats = {
        "Health Sciences":      ["health", "hospital", "nurse", "medical", "patient", "clinic", "pre-med"],
        "STEM & Engineering":   ["engineering", "stem", "technology", "robotics", "computer", "coding", "science", "cad"],
        "Arts & Media":         ["art", "music", "design", "media", "photography", "film", "theater", "creative"],
        "Business & Marketing": ["business", "marketing", "finance", "entrepreneur", "commerce"],
        "Community Service":    ["community", "food", "shelter", "nonprofit", "outreach", "social service"],
        "Education & Tutoring": ["tutor", "teach", "education", "library", "mentor", "literacy"],
        "Environment":          ["environment", "garden", "nature", "wildlife", "conservation", "sustainability"],
        "Animal Care":          ["animal", "pet", "cat", "dog", "rescue", "shelter", "wildlife"],
        "Civic & Leadership":   ["civic", "government", "policy", "leadership", "rotary", "chamber"],
    }
    for cat, kws in cats.items():
        if any(kw in text for kw in kws):
            return cat
    return "Community Service"


def _guess_xp(text: str) -> int:
    if any(w in text for w in ["paid", "stipend", "compensation"]):
        return 40
    if any(w in text for w in ["intern", "internship", "research"]):
        return 30
    if any(w in text for w in ["hospital", "clinic", "lab"]):
        return 25
    return 15


def _extract_schedule(text: str) -> str:
    patterns = [
        r"(monday|tuesday|wednesday|thursday|friday|saturday|sunday)[^\n.]{0,60}(am|pm)",
        r"\b(weekdays?|weekends?|saturdays?|sundays?|mornings?|evenings?|afternoons?)\b[^\n.]{0,50}",
        r"\d{1,2}:\d{2}\s*(am|pm)[^\n.]{0,50}",
        r"(flexible|varies|part.?time|full.?time|your own hours)[^\n.]{0,40}",
    ]
    for pat in patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            return m.group(0).strip()[:100]
    return "See website for schedule details"


def _extract_age(text: str) -> int | None:
    m = re.search(r"(?:age|must be|at least|minimum age)[^\d]{0,10}(\d{1,2})", text, re.IGNORECASE)
    if m:
        age = int(m.group(1))
        if 12 <= age <= 21:
            return age
    return None


def _extract_tags(text: str) -> list[str]:
    tag_map = {
        "animals":    ["animal", "cat", "dog", "pet", "rescue", "shelter"],
        "healthcare": ["health", "hospital", "nurse", "medical", "patient"],
        "STEM":       ["stem", "engineering", "coding", "computer", "science", "tech"],
        "leadership": ["leadership", "rotary", "chamber", "officer"],
        "environment":["environment", "garden", "nature", "wildlife", "conservation"],
        "arts":       ["art", "music", "theater", "design", "creative"],
        "community":  ["community", "nonprofit", "outreach", "service"],
        "education":  ["tutor", "teach", "education", "mentor", "library"],
        "business":   ["business", "marketing", "finance", "entrepreneur"],
        "paid":       ["paid", "stipend", "compensation", "hourly", "wage"],
        "flexible":   ["flexible", "remote", "hybrid", "your own schedule"],
        "food":       ["food", "pantry", "hunger", "meal"],
        "seniors":    ["senior", "elderly", "older adult"],
        "youth":      ["youth", "teen", "teenager", "student"],
    }
    return [tag for tag, kws in tag_map.items()
            if any(kw in text for kw in kws)][:6]


def _relevance(text: str, kw: list[str]) -> int:
    return sum(1 for k in kw if k.lower() in text.lower())


def _parse_page(result: dict, kw: list[str], student_location: str) -> dict | None:
    url     = result["url"]
    title   = result["title"]
    snippet = result["snippet"]

    if not _is_useful_url(url):
        return None

    soup      = _fetch(url)
    page_text = soup.get_text(" ", strip=True) if soup else snippet

    desc = (
        _extract_description(soup, kw + ["volunteer", "intern", "apply", "community"], snippet)
        if soup else snippet
    )
    org_name = _extract_org_name(soup, title, url) if soup else title
    email    = _extract_email(page_text)

    text_lower = page_text.lower()

    # only show the student's town if the page mentions it
    city = student_location.split(",")[0].strip().lower()
    location = student_location if city and city in text_lower else ""

    is_intern = any(w in text_lower for w in ["intern", "internship", "stipend", "paid position"])

    return {
        "name":            org_name,
        "type":            "Internship" if is_intern else "Volunteer",
        "location":        location,
        "xp_category":     _guess_category(text_lower),
        "xp_value":        _guess_xp(text_lower),
        "contact":         email,
        "website":         url,
        "description":     desc,
        "schedule":        _extract_schedule(page_text),
        "age_requirement": _extract_age(page_text),
        "tags":            _extract_tags(text_lower),
        "source":          "live",
        "relevance_score": _relevance(text_lower, kw),
    }


def _profile_keywords(profile: dict) -> list[str]:
    tokens = []
    for field in ("interests", "skills"):
        val = profile.get(field, "")
        items = val if isinstance(val, list) else [i.strip() for i in str(val).split(",")]
        tokens.extend([i.lower() for i in items if len(i.strip()) > 2])
    tokens.extend(str(profile.get("career_goals", "")).lower().split())
    return [t for t in tokens if len(t) > 2]


def get_personalized_orgs(profile: dict) -> list[dict]:
    """Everything found for this profile, most relevant first."""
    queries  = _build_queries(profile)
    kw       = _profile_keywords(profile)
    location = profile.get("location") or ""

    print(f"  [scraper] {len(queries)} search queries | location: {location}")
    print(f"  [scraper] keywords: {kw[:8]}")

    # run the searches and collect unique urls
    seen_urls: set[str] = set()
    raw_results: list[dict] = []

    with ThreadPoolExecutor(SEARCH_WORKERS) as pool:
        for results in pool.map(_web_search, queries):
            for r in results:
                url = r.get("url", "")
                if url and url not in seen_urls and _is_useful_url(url):
                    seen_urls.add(url)
                    raw_results.append(r)

    print(f"  [scraper] {len(raw_results)} unique URLs to fetch")

    # fetch and parse each page
    def parse(result):
        try:
            return _parse_page(result, kw, location)
        except Exception as e:
            print(f"  [parse] {result.get('url', '')[:60]} -> {e}")
            return None

    with ThreadPoolExecutor(FETCH_WORKERS) as pool:
        orgs = [org for org in pool.map(parse, raw_results) if org]

    # most relevant first
    orgs.sort(key=lambda o: o.get("relevance_score", 0), reverse=True)
    print(f"  [scraper] returning {len(orgs)} opportunities")
    return orgs

