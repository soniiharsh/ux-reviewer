from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.database import get_db
from app.schemas.review import StatusResponse
from app.services.scraper import scraper_health_check
from app.services.llm import llm_health_check

router = APIRouter(prefix="/status", tags=["status"])


@router.get("", response_model=StatusResponse)
async def status(db: Session = Depends(get_db)):
    # Database ping
    try:
        db.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception as e:
        db_status = f"error: {e}"

    # LLM and scraper run in parallel for speed
    import asyncio
    llm_status, scraper_status = await asyncio.gather(
        llm_health_check(),
        scraper_health_check(),
    )

    return StatusResponse(
        backend="ok",
        database=db_status,
        llm=llm_status,
        scraper=scraper_status,
    )
