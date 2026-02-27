# AI Notes

## What AI Was Used For

This project was developed with Claude (Anthropic) as the primary code generation assistant.

AI was used to:
- Generate the full project scaffold and file structure
- Write the FastAPI backend including routers, services, models, and schemas
- Write the Playwright scraper service
- Design and write the LLM system prompt and user prompt template
- Write the Next.js frontend including all pages and components
- Write documentation (README, this file, PROMPTS_USED.md)

## What Was Manually Reviewed

Every generated file was reviewed for:
- Correctness of import paths and module structure
- Logic of the scraping extraction (JS evaluation expressions)
- JSON schema alignment between LLM output and Pydantic models
- Correct use of SQLAlchemy session management (yield-based dependency)
- CORS configuration correctness
- Tailwind class usage and responsive layout logic

## Why OpenAI gpt-4o-mini

- Supports `response_format: {"type": "json_object"}` natively — eliminates the need for manual JSON extraction from markdown fences
- Fast (typically <10s for structured analysis)
- Cost-effective for this use case (~$0.01–0.03 per review)
- Sufficient reasoning capability for UX pattern recognition

Alternative considered: `gpt-4o` for higher quality, but `gpt-4o-mini` performs well enough for structured UX analysis at much lower cost.

## Prompt Design Reasoning

**System prompt** establishes:
- Expert persona (UX auditor with specific domains)
- Exact output schema (prevents creative formatting)
- Strict rules (8–12 issues, exact category names, exact severity values)
- "Return ONLY valid JSON" instruction — critical for `json_object` mode to work cleanly

**User prompt** provides:
- Structured, labelled sections (not raw HTML) — reduces token waste
- All UX-relevant elements extracted by Playwright
- Only first 2000 chars of main content — prevents context overflow

**Temperature = 0.3**: Low enough for consistent structured output, high enough to vary analysis across different sites.

**Retry mechanism**: If Pydantic validation fails (even with `json_object` mode, field values can be wrong types), the prompt is augmented and retried up to `MAX_RETRIES` times.

## What Was Verified Manually

- Playwright JS evaluation expressions produce correct data structures
- SQLAlchemy model fields match the schema fields
- The history pruning logic (keep last 5) works correctly
- CORS allows the frontend origin during development and after deployment
- Environment variable loading via `pydantic-settings` works without `.env` file in production (reads from actual env)
