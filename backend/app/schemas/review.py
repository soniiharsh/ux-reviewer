from pydantic import BaseModel, HttpUrl, field_validator
from typing import List, Literal
from datetime import datetime


# ── Scraping ──────────────────────────────────────────────────────────────────

class ScrapedPage(BaseModel):
    url: str
    title: str
    meta_description: str
    headings: List[str]
    buttons: List[str]
    nav_links: List[str]
    forms: List[dict]          # [{label, placeholder, type}]
    main_content: str          # first 2000 chars


# ── LLM Output ────────────────────────────────────────────────────────────────

class Issue(BaseModel):
    title: str
    category: Literal["Clarity", "Layout", "Navigation", "Accessibility", "Trust"]
    severity: Literal["Low", "Medium", "High"]
    why: str
    proof: str
    suggested_fix: str


class TopFix(BaseModel):
    issue_title: str
    before: str
    after: str


class LLMReviewOutput(BaseModel):
    score: float
    issues: List[Issue]
    top_fixes: List[TopFix]

    @field_validator("score")
    @classmethod
    def clamp_score(cls, v):
        return max(0.0, min(100.0, v))


# ── API Request / Response ────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    url: str

    @field_validator("url")
    @classmethod
    def validate_url(cls, v):
        v = v.strip()
        if not v.startswith(("http://", "https://")):
            raise ValueError("URL must start with http:// or https://")
        return v


class ReviewResponse(BaseModel):
    id: int
    url: str
    score: float
    issues: List[Issue]
    top_fixes: List[TopFix]
    created_at: datetime

    class Config:
        from_attributes = True


class HistoryItem(BaseModel):
    id: int
    url: str
    score: float
    created_at: datetime

    class Config:
        from_attributes = True


class StatusResponse(BaseModel):
    backend: str
    database: str
    llm: str
    scraper: str
