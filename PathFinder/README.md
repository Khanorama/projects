# PathFinder — Level Up
### D211 + D15 Student Career Quest System

PathFinder helps high school and college students find real volunteer and
internship opportunities near them. It searches the web based on the student's
profile, ranks what it finds with AI, drafts outreach emails in one click, and
rewards progress with XP and levels.

**Tech stack:** React 19 + Vite (frontend) · FastAPI + Python (backend) ·
OpenAI GPT-4o-mini · `ddgs` web search · BeautifulSoup

---

## Quick start

You need Python 3.10+, Node.js 20.19+ (or 22.12+), and an OpenAI API key
(get one at https://platform.openai.com/api-keys).

### Step 1: Create your `.env` files

```bash
cp backend/.env.example backend/.env      # then paste your OpenAI key into it
cp frontend/.env.example frontend/.env
```

On Windows, use `copy backend\.env.example backend\.env` (and the same for `frontend`).

`.env` files are git-ignored, so your key never gets committed.

---

### Terminal 1: backend

**Mac / Linux:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Windows (PowerShell):**
```powershell
cd backend
powershell -ExecutionPolicy Bypass -File run.ps1
```

**Windows (Command Prompt):**
```cmd
cd backend
run.bat
```

Or manually in PowerShell:
```powershell
cd backend
python -m venv venv
venv\Scripts\python.exe -m pip install -r requirements.txt
venv\Scripts\uvicorn.exe main:app --reload --port 8000
```

---

### Terminal 2: frontend

**Mac / Linux:**
```bash
cd frontend
npm install
npm run dev
```

**Windows (PowerShell):**
```powershell
cd frontend
powershell -ExecutionPolicy Bypass -File run.ps1
```

**Windows (Command Prompt):**
```cmd
cd frontend
run.bat
```

Open **http://localhost:5173**

---

## How it works

1. Student enters their name, location and a few optional basics (age, grade,
   school, interests) on the welcome page. No sign-up or password.
2. Fills out the rest of their Profile: skills, goals, experience, and an optional
   resume upload (PDF or Word .docx) that suggests any new skills and interests it finds.
3. On Dashboard, clicks **Find my opportunities**.
4. Backend builds search queries from the profile and runs them through the
   [`ddgs`](https://pypi.org/project/ddgs/) metasearch library (no API key;
   DuckDuckGo's own page now blocks scripts with a CAPTCHA). It fetches and
   parses each result page, then streams the results to the AI.
5. GPT-4o-mini ranks all results, explains why each fits, and streams a live
   thought log to the UI. If the AI is unavailable (e.g. no OpenAI key), the
   raw search results are shown instead, sorted by profile-keyword relevance.
6. Student clicks **Draft email** and a personalised outreach email is generated
   with one click, no prompting required.
7. Student clicks **Accept** on an opportunity to earn XP and level up.
   Each organisation can be accepted once; XP thresholds increase each level
   (30 → 42 → 59 → ...).

There are no accounts or logins. Each student's data is saved in their own
browser (localStorage), and **Start over** in the navbar erases it.

Without an OpenAI key, resume parsing, email drafting and the Workshop fall back
to templates, and the app labels them as such.

---

## Project structure

```
backend/
  main.py           FastAPI app: search stream, resume parsing, email + workshop drafts
  scraper.py        Builds search queries from the profile, fetches and parses result pages
frontend/src/
  pages/            Welcome, Dashboard, Profile, Workshop
  components/       Navbar, route guard, app shell
  context/          UserContext: profile, XP and saved results (localStorage)
  services/         Backend calls, template fallbacks, storage, XP maths
```

---

## API endpoints

| Method | Route | Description |
|---|---|---|
| `POST` | `/search/stream`      | SSE: scrape + AI rank + stream |
| `POST` | `/parse-resume`       | Read a PDF/.docx resume       |
| `POST` | `/draft-email`        | One-click outreach email      |
| `POST` | `/workshop`           | Essay / guidance drafts       |
| `GET`  | `/health`             | Server status                 |
