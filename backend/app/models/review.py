from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.sql import func
from app.db.database import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String(2048), nullable=False)
    score = Column(Float, nullable=False)
    issues_json = Column(Text, nullable=False)   # JSON-serialized list of issues
    top_fixes_json = Column(Text, nullable=False) # JSON-serialized top 3 fixes
    created_at = Column(DateTime(timezone=True), server_default=func.now())
