# FlintReach

Agentic GTM tool for [Flint](https://flintk12.com). Enter a school district and administrator — the agent researches the district using Google Search, then generates a personalized outreach email, state-compliant one-pager, and demo Flint activity.

## How it works

- **Phase 1 (Research):** Gemini + Google Search grounding pulls real district data — enrollment, demographics, Title I status, ELL %, state privacy law, administrator background, AI policy stance
- **Phase 2 (Generate):** Gemini produces a tailored outreach package based on the research
- **Frontend:** React UI renders the results in three tabs (Email / One-Pager / Demo Activity)

## Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- A Gemini API key (free tier works)

### 1. Add your API key

Create a `.env` file at the repo root:
```
GEMINI_API=your_gemini_api_key_here
```

### 2. Install backend dependencies
```bash
cd backend
python -m pip install -r requirements.txt
```

### 3. Install frontend dependencies
```bash
cd frontend
npm install
```

## Running

Open two terminals from the repo root:

**Terminal 1 — Backend (API)**
```bash
cd backend
python -m uvicorn api:app --reload
```
API runs at `http://localhost:8000`

**Terminal 2 — Frontend (UI)**
```bash
cd frontend
npm run dev
```
UI runs at `http://localhost:5173`

Open `localhost:5173` in your browser. Enter a district + administrator name and title, then click **Generate Package**. Takes ~30 seconds.

## Example districts to try

| District | Contact | Title |
|---|---|---|
| Chicago Public Schools | Pedro Martinez | CEO |
| Los Angeles Unified School District | Alberto Carvalho | Superintendent |
| Wake County Public Schools | Robert Taylor | Superintendent |

## Project structure

```
outreach/
├── backend/
│   ├── flintreach.py   # Two-phase agent: research_district() + generate_outreach_package()
│   ├── api.py          # FastAPI — POST /generate
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── App.jsx
│       └── components/
│           ├── InputForm.jsx
│           └── OutputPanel.jsx
└── .env                # Your GEMINI_API key (not committed)
```
