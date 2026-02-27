# UX Reviewer

An AI-powered website UX analysis tool. Paste a URL, get a structured review of 8–12 UX issues grouped by category, with severity scores and before/after fix suggestions.

---

## Architecture

```
User → Next.js Frontend → FastAPI Backend → Playwright Scraper → OpenAI LLM
                                          ↓
                                     SQLite Database (last 5 reviews)
```

## Tech Stack

| Layer     | Tech                               | Reason                                              |
|-----------|------------------------------------|-----------------------------------------------------|
| Frontend  | Next.js 14 + Tailwind CSS          | App Router, SSR-ready, fast iteration               |
| Backend   | FastAPI + Uvicorn                  | Async-native, auto OpenAPI docs, clean routing      |
| Scraping  | Playwright (headless Chromium)     | Handles JS-rendered pages; blocks images for speed  |
| Database  | SQLite + SQLAlchemy                | Zero-config, file-based, sufficient for this scope  |
| LLM       | OpenAI gpt-4o-mini                 | Fast, cheap, supports `response_format: json_object`|

---

## Local Setup

### 1. Clone & configure

```bash
git clone <repo>
cd ux-reviewer
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium
cp .env.example .env       # Fill in OPENAI_API_KEY
uvicorn app.main:app --reload --port 8000
```

Backend runs at `http://localhost:8000`  
API docs at `http://localhost:8000/docs`

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local  # Set NEXT_PUBLIC_API_URL if backend is not on 8000
npm run dev
```

Frontend runs at `http://localhost:3000`

---

## Environment Variables

### Backend (`backend/.env`)

| Variable          | Description                          | Default                      |
|-------------------|--------------------------------------|------------------------------|
| `OPENAI_API_KEY`  | Your OpenAI API key (required)       | —                            |
| `DATABASE_URL`    | SQLAlchemy DB URL                    | `sqlite:///./reviews.db`     |
| `CORS_ORIGINS`    | Comma-separated allowed origins      | `http://localhost:3000`      |
| `SCRAPER_TIMEOUT` | Page load timeout in ms              | `30000`                      |
| `MAX_RETRIES`     | LLM retry attempts on bad JSON       | `2`                          |

### Frontend (`frontend/.env.local`)

| Variable               | Description                    | Default                    |
|------------------------|--------------------------------|----------------------------|
| `NEXT_PUBLIC_API_URL`  | URL of the FastAPI backend     | `http://localhost:8000`    |

---

## What Is Implemented

- ✅ URL input with validation
- ✅ Playwright headless scraping (structured extraction, not raw HTML)
- ✅ LLM review via OpenAI with retry logic on malformed JSON
- ✅ 8–12 issues grouped by: Clarity, Layout, Navigation, Accessibility, Trust
- ✅ Severity badges (High / Medium / Low)
- ✅ UX Score 0–100 as animated ring
- ✅ Before/After for top 3 issues
- ✅ History page (last 5 reviews, auto-pruned)
- ✅ Status page (backend / DB / LLM / scraper health)
- ✅ CORS configured for deployment
- ✅ No hardcoded secrets — environment variables only

## What Is Not Implemented

- ❌ User authentication / multi-tenant history
- ❌ PDF export of report
- ❌ Screenshot capture of the page
- ❌ Webhook / async job queue for long scrapes
- ❌ Rate limiting on the API

---

## Deployment

### Backend → Render / Railway

1. Set environment variables in the dashboard.
2. Build command: `pip install -r requirements.txt && playwright install chromium`
3. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Update `CORS_ORIGINS` to include your Vercel frontend URL.

> **Note on Playwright on Render/Railway**: ensure the runtime has Chromium system dependencies. Use `playwright install-deps chromium` in the build step, or use a Docker-based deployment with a Playwright-compatible base image.

### Frontend → Vercel

1. Connect your Git repo to Vercel.
2. Set `NEXT_PUBLIC_API_URL` to your backend URL (e.g. `https://your-api.onrender.com`).
3. Deploy — Vercel handles the Next.js build automatically.
