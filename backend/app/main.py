import asyncio
import sys

# Fix Playwright subprocess issue on Windows + Python 3.12
if sys.platform.startswith("win"):
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db.database import init_db
from app.routers import reviews, status

app = FastAPI(
    title="UX Reviewer API",
    description="Scrape a URL, analyse its UX with Gemini, and track history.",
    version="1.0.0",
)

# CORS — allow the Next.js frontend to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(reviews.router)
app.include_router(status.router)


@app.on_event("startup")
def startup():
    init_db()


@app.get("/")
def root():
    return {"message": "UX Reviewer API is running with Gemini."}