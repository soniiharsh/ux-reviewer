"""
Database service layer: CRUD operations for reviews.
Keeps all DB logic out of routers.
"""
import json
from sqlalchemy.orm import Session
from app.models.review import Review
from app.schemas.review import LLMReviewOutput, ReviewResponse, HistoryItem
from typing import List, Optional


def save_review(db: Session, url: str, result: LLMReviewOutput) -> Review:
    """Persist a completed review. Prune so only the last 5 are kept."""
    review = Review(
        url=url,
        score=result.score,
        issues_json=json.dumps([i.model_dump() for i in result.issues]),
        top_fixes_json=json.dumps([f.model_dump() for f in result.top_fixes]),
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    # Keep only 5 most recent reviews
    all_ids = (
        db.query(Review.id)
        .order_by(Review.created_at.desc())
        .all()
    )
    if len(all_ids) > 5:
        ids_to_delete = [row.id for row in all_ids[5:]]
        db.query(Review).filter(Review.id.in_(ids_to_delete)).delete(synchronize_session=False)
        db.commit()

    return review


def get_review(db: Session, review_id: int) -> Optional[Review]:
    return db.query(Review).filter(Review.id == review_id).first()


def get_history(db: Session) -> List[Review]:
    return db.query(Review).order_by(Review.created_at.desc()).limit(5).all()


def parse_review(review: Review) -> ReviewResponse:
    """Convert a DB row back into the full response schema."""
    from app.schemas.review import Issue, TopFix
    return ReviewResponse(
        id=review.id,
        url=review.url,
        score=review.score,
        issues=[Issue(**i) for i in json.loads(review.issues_json)],
        top_fixes=[TopFix(**f) for f in json.loads(review.top_fixes_json)],
        created_at=review.created_at,
    )
