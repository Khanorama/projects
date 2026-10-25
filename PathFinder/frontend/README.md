# PathFinder frontend

React 19 + Vite app for PathFinder. See the [main README](../README.md) for
what the project does and how to run the backend.

## Running it

```bash
cp .env.example .env   # sets VITE_API_URL (defaults to http://localhost:8000)
npm install
npm run dev            # http://localhost:5173
```

Other scripts: `npm run build`, `npm run preview`, `npm run lint`.

## Structure

```
src/
├── App.jsx                 # Routes
├── main.jsx                # Entry point
├── components/
│   ├── AppShell.jsx        # Layout with the navbar
│   ├── Navbar.jsx          # Navigation, profile status, "Start over"
│   └── ProtectedRoute.jsx  # Sends visitors to the welcome form until it's filled in
├── context/
│   └── UserContext.jsx     # Profile, XP and saved search results
├── pages/
│   ├── Welcome.jsx         # First-visit form: name, location, basics
│   ├── Dashboard.jsx       # Search, results, outreach emails, XP
│   ├── Profile.jsx         # Full profile and resume upload
│   └── Workshop.jsx        # Essay, email and application-guidance tools
└── services/
    ├── opportunityService.js  # Streams search results from the backend
    ├── resumeService.js       # Resume upload and parsing
    ├── workshopService.js     # Workshop + email drafts from the backend
    ├── resumeFallback.js      # Template suggestions when the AI is unavailable
    ├── workshopFallback.js    # Template drafts when the AI is unavailable
    ├── storage.js             # localStorage persistence
    ├── profileUtils.js        # Profile defaults and completion %
    └── xp.js                  # Level maths for the XP bar
```

## Routes

- `/`: welcome form (redirects to the dashboard once filled in)
- `/dashboard`, `/profile`, `/workshop`: need the welcome form filled in first

## Data

There are no accounts. Everything is stored in the browser's localStorage, and
"Start over" in the navbar clears it. When the backend's AI is unavailable,
template fallbacks are used and labelled as such in the UI.
