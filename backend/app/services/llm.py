"""
LLM service: sends structured page data to Gemini and parses the response.
Includes:
- Strict prompting
- Safe JSON extraction
- Field normalization
- Retry logic
- Health check
"""

import json
import re
import google.generativeai as genai
from app.config import settings
from app.schemas.review import ScrapedPage, LLMReviewOutput

# ──────────────────────────────────────────────────────────────────────────────
# Configure Gemini
# ──────────────────────────────────────────────────────────────────────────────

genai.configure(api_key=settings.gemini_api_key)
model = genai.GenerativeModel("models/gemini-2.5-flash")

# ──────────────────────────────────────────────────────────────────────────────
# Prompts
# ──────────────────────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are an expert UX auditor with deep knowledge of web accessibility (WCAG 2.1),
conversion rate optimisation, information architecture, and interaction design.

Your job: analyse structured data extracted from a real webpage and produce a rigorous,
evidence-based UX review.

STRICT RULES:
- Identify 8–12 distinct UX issues.
- Group them into EXACTLY these categories: Clarity, Layout, Navigation, Accessibility, Trust.
- Each issue MUST contain:
  title, category, severity, why, proof, suggested_fix
- Severity must be one of: Low, Medium, High.
- top_fixes must contain exactly 3 objects.
- Each top_fix MUST contain:
  issue_title, before, after
- Score must be 0–100.
- Return ONLY valid JSON.
- No markdown.
- No explanations.
"""


def _build_user_prompt(page: ScrapedPage) -> str:
    forms_text = json.dumps(page.forms, indent=2) if page.forms else "None found"

    return f"""
Analyse the UX of this webpage and return your review as strict JSON.

URL: {page.url}

TITLE: {page.title or "Not set"}

META DESCRIPTION: {page.meta_description or "Not set"}

HEADINGS (H1-H3):
{chr(10).join(f"- {h}" for h in page.headings) if page.headings else "None found"}

BUTTONS:
{chr(10).join(f"- {b}" for b in page.buttons) if page.buttons else "None found"}

NAVIGATION LINKS:
{chr(10).join(f"- {l}" for l in page.nav_links) if page.nav_links else "None found"}

FORM FIELDS:
{forms_text}

MAIN CONTENT SAMPLE (first 2000 chars):
{page.main_content or "No main content extracted"}

Return ONLY the JSON object.
"""


# ──────────────────────────────────────────────────────────────────────────────
# JSON Extraction
# ──────────────────────────────────────────────────────────────────────────────

def _extract_json(text: str) -> dict:
    """
    Extracts first JSON object from Gemini response.
    Handles markdown wrapping or extra text.
    """
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        raise ValueError("No JSON object found in LLM response")

    return json.loads(match.group(0))


# ──────────────────────────────────────────────────────────────────────────────
# Normalization Layer (CRITICAL FOR GEMINI)
# ──────────────────────────────────────────────────────────────────────────────

def _normalize_output(data: dict) -> dict:
    """
    Gemini may slightly change field names.
    This ensures compatibility with strict Pydantic schema.
    """

    normalized_issues = []
    for issue in data.get("issues", []):
        normalized_issues.append({
            "title": issue.get("title") or issue.get("issue") or "UX Issue",
            "category": issue.get("category", "Clarity"),
            "severity": issue.get("severity", "Medium"),
            "why": issue.get("why") or issue.get("reason") or "Explanation missing.",
            "proof": issue.get("proof") or "Not specified.",
            "suggested_fix": issue.get("suggested_fix") or issue.get("fix") or "Improve this area."
        })

    normalized_top = []
    for fix in data.get("top_fixes", []):
        normalized_top.append({
            "issue_title": fix.get("issue_title") or fix.get("issue") or "Important Fix",
            "before": fix.get("before", "Current state unclear."),
            "after": fix.get("after", "Improved state description.")
        })

    return {
        "score": data.get("score", 70),
        "issues": normalized_issues,
        "top_fixes": normalized_top
    }


# ──────────────────────────────────────────────────────────────────────────────
# Core LLM Call
# ──────────────────────────────────────────────────────────────────────────────

async def generate_review(page: ScrapedPage) -> LLMReviewOutput:
    user_prompt = _build_user_prompt(page)

    full_prompt = f"""
{SYSTEM_PROMPT}

{user_prompt}
"""

    last_error = None

    for attempt in range(1, settings.max_retries + 2):
        try:
            response = model.generate_content(full_prompt)

            raw_text = response.text.strip()

            # Extract JSON
            parsed = _extract_json(raw_text)

            # Normalize structure
            normalized = _normalize_output(parsed)

            # Validate against Pydantic schema
            return LLMReviewOutput.model_validate(normalized)

        except Exception as e:
            last_error = e
            continue

    raise RuntimeError(
        f"Gemini failed after {settings.max_retries + 1} attempts: {last_error}"
    )


# ──────────────────────────────────────────────────────────────────────────────
# Health Check
# ──────────────────────────────────────────────────────────────────────────────

async def llm_health_check() -> str:
    try:
        response = model.generate_content("Reply with exactly the word: ok")
        return "ok" if "ok" in response.text.lower() else "unexpected response"
    except Exception as e:
        return f"error: {e}"