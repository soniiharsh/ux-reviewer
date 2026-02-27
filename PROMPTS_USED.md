# Prompts Used

## System Prompt (LLM Service)

Used in `backend/app/services/llm.py`:

```
You are an expert UX auditor with deep knowledge of web accessibility (WCAG 2.1),
conversion rate optimisation, information architecture, and interaction design.

Your job: analyse structured data extracted from a real webpage and produce a rigorous,
evidence-based UX review.

RULES:
- Identify 8–12 distinct UX issues.
- Group them into EXACTLY these categories: Clarity, Layout, Navigation, Accessibility, Trust.
- For each issue provide real proof from the data (quote element text or describe the selector).
- Severity must be one of: Low, Medium, High.
- The top_fixes array must contain the 3 issues with the highest severity, showing concrete before/after.
- Score 0–100 (higher = better UX). Base it on the proportion and severity of issues found.
- Return ONLY valid JSON — no markdown fences, no prose.

OUTPUT SCHEMA (strict):
{
  "score": <number 0-100>,
  "issues": [
    {
      "title": "<short issue title>",
      "category": "<Clarity|Layout|Navigation|Accessibility|Trust>",
      "severity": "<Low|Medium|High>",
      "why": "<why this is a UX problem>",
      "proof": "<exact text or CSS selector from the page>",
      "suggested_fix": "<actionable recommendation>"
    }
  ],
  "top_fixes": [
    {
      "issue_title": "<matches an issue title>",
      "before": "<current state>",
      "after": "<improved state>"
    }
  ]
}
```

## User Prompt Template (LLM Service)

```
Analyse the UX of this webpage and return your review as strict JSON.

URL: {url}

TITLE: {title}

META DESCRIPTION: {meta_description}

HEADINGS (H1-H3):
{headings_list}

BUTTONS:
{buttons_list}

NAVIGATION LINKS:
{nav_links_list}

FORM FIELDS:
{forms_json}

MAIN CONTENT SAMPLE (first 2000 chars):
{main_content}

Return ONLY the JSON object, no markdown.
```

## Development Prompts Used to Generate Code

These are the prompts used with Claude to produce this codebase:

1. **Project scaffold**: The full task specification document (included in the conversation as the system document) — requesting full-stack implementation with FastAPI backend, Next.js frontend, Playwright scraper, OpenAI LLM, SQLite database.

2. **Iteration prompts** (applied during review):
   - "Ensure the SQLAlchemy session is closed after each request using a yield-based dependency"
   - "Make the Playwright scraper block image/font requests to reduce load time"
   - "Add `response_format: json_object` to the OpenAI call to enforce JSON output"
   - "Ensure the history pruning deletes oldest reviews beyond 5, not newest"

---

*No API keys are included in this file. No raw LLM outputs are included.*
