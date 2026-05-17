# FlintReach

Agentic GTM tool for [Flint](https://flintk12.com) — a K-12 AI tutoring platform. Given a target geography, the agent finds real school district administrators and conferences, then generates a personalized outreach email and a custom interactive product demo tailored to that administrator's district.

Built as a Track 2 (Agentic GTM) submission for Flint's BSV program.

---

## How it works

### User workflow

```
1. Click a state on the US map
        ↓
2. Optionally narrow to a specific city
        ↓
3. Agent discovers:
   - Upcoming EdTech conferences in that area
   - Real superintendents / curriculum directors at large districts
        ↓
4. Select an administrator you want to reach
        ↓
5. Agent generates:
   - Personalized outreach email (subject + body)
   - A unique demo link just for them
        ↓
6. The demo link opens a guided product walkthrough:
   - Step 1: Watch Sparky build a lesson activity for their district
   - Step 2: See a live student session auto-play
   - Step 3: Review the teacher analytics dashboard
   - Step 4: CTA to start a free pilot
```

### Under the hood

**Discovery phase** (`POST /discover`)
- Two separate Gemini 2.5 Flash calls with Google Search grounding
- One finds administrators (name, title, district, enrollment, AI policy, why target)
- One finds upcoming EdTech conferences in the region
- Seed conference data fills in gaps when search results are sparse

**Generation phase** (`POST /generate-for-person`)
- Builds a district profile from the selected person's data
- Gemini generates a personalized email (subject + body)
- Gemini generates a full demo activity object:
  - Activity title, grade level, subject
  - Teacher setup prompt + Sparky's response
  - A 6-message student–Flint interaction sequence
  - Strengths, areas to improve, follow-up suggestion for the analytics dashboard

**Demo link**
- All demo data is base64-encoded into the URL — no server storage required
- The `/demo` page decodes it and runs a fully personalized, auto-play product tour

---

## Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- A Gemini API key (free tier works; get one at [aistudio.google.com](https://aistudio.google.com))

### 1. Add your API key

Create a `.env` file at the repo root:
```
GEMINI_API=your_gemini_api_key_here
```

### 2. Install backend dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 3. Install frontend dependencies
```bash
cd frontend
npm install
```

---

## Running locally

Open two terminals from the repo root:

**Terminal 1 — Backend**
```bash
cd backend
uvicorn api:app --reload
```
API runs at `http://localhost:8000`

**Terminal 2 — Frontend**
```bash
cd frontend
npm run dev
```
UI runs at `http://localhost:5173`

Open `http://localhost:5173`, click a state, follow the steps. Discovery takes ~15–25 seconds; email + demo generation takes ~10–15 seconds.

---

## Project structure

```
outreach/
├── backend/
│   ├── flintreach.py       # Core agent logic
│   │                         _discover_people() — finds real administrators
│   │                         _discover_conferences() — finds EdTech events
│   │                         discover_targets() — orchestrates discovery
│   │                         generate_email_for_person() — email + demo activity
│   ├── api.py              # FastAPI: POST /discover, POST /generate-for-person
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── App.jsx             # 6-step wizard: map → drilldown → discover → people → generate → email
│       ├── pages/
│       │   └── DemoPage.jsx    # Interactive product demo (decoded from URL param)
│       └── components/
│           ├── USMap.jsx           # Clickable SVG US map (react-simple-maps)
│           ├── DrilldownPanel.jsx  # City selector after state pick
│           ├── DiscoveryPanel.jsx  # Conference + administrator grid
│           ├── PersonCard.jsx      # Administrator card with photo + badges
│           └── EmailOutput.jsx     # Outreach email + personalized demo link
└── .env                    # GEMINI_API key (not committed)
```

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API` | Yes | Gemini API key |
| `ALLOWED_ORIGINS` | No | Comma-separated CORS origins (defaults to localhost) |

For the frontend in production, set `VITE_API_URL` in `frontend/.env.production`:
```
VITE_API_URL=https://your-backend-url.com
```
