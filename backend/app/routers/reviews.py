from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.review import AnalyzeRequest, ReviewResponse, HistoryItem
from app.services.scraper import scrape_page
from app.services.llm import generate_review
from app.services.review_service import save_review, get_review, get_history, parse_review
from typing import List

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post("/analyze", response_model=ReviewResponse)
async def analyze(request: AnalyzeRequest, db: Session = Depends(get_db)):
    """
    Main endpoint: scrape → LLM review → save → return.
    """
    # 1. Scrape
    try:
        page_data = await scrape_page(request.url)
    except RuntimeError as e:
        raise HTTPException(status_code=422, detail=f"Scraping failed: {e}")

    # 2. LLM review
    try:
        result = await generate_review(page_data)
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=f"LLM failed: {e}")

    # 3. Persist
    review = save_review(db, request.url, result)

    return parse_review(review)


@router.get("/history", response_model=List[HistoryItem])
def history(db: Session = Depends(get_db)):
    """Return last 5 reviews (summary only, no full issue list)."""
    rows = get_history(db)
    return [
        HistoryItem(id=r.id, url=r.url, score=r.score, created_at=r.created_at)
        for r in rows
    ]


@router.get("/{review_id}", response_model=ReviewResponse)
def get_single_review(review_id: int, db: Session = Depends(get_db)):
    """Fetch a full review by ID (used by history page)."""
    review = get_review(db, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return parse_review(review)
