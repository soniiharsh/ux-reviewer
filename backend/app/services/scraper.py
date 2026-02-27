"""
Scraper service: uses Playwright headless browser to extract
UX-relevant structured data from a given URL.
We deliberately avoid sending raw HTML to the LLM.
"""
import asyncio
from playwright.async_api import async_playwright, TimeoutError as PWTimeout
from app.schemas.review import ScrapedPage
from app.config import settings


async def scrape_page(url: str) -> ScrapedPage:
    """
    Launch headless Chromium, navigate to URL, and extract key UX elements.
    Raises RuntimeError on failure so the router can return a clean 422.
    """
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        try:
            page = await browser.new_page()
            # Block unnecessary resources to speed up load
            await page.route("**/*.{png,jpg,jpeg,gif,svg,woff,woff2,ttf}", lambda r: r.abort())

            try:
                await page.goto(url, timeout=settings.scraper_timeout, wait_until="domcontentloaded")
            except PWTimeout:
                raise RuntimeError(f"Page load timed out after {settings.scraper_timeout}ms")

            title = await page.title()

            meta_desc = await page.evaluate("""
                () => {
                    const m = document.querySelector('meta[name="description"]');
                    return m ? m.getAttribute('content') : '';
                }
            """)

            headings = await page.evaluate("""
                () => [...document.querySelectorAll('h1, h2, h3')]
                    .map(h => h.innerText.trim())
                    .filter(t => t.length > 0)
                    .slice(0, 20)
            """)

            buttons = await page.evaluate("""
                () => [...document.querySelectorAll('button, [role="button"], input[type="submit"], input[type="button"]')]
                    .map(b => (b.innerText || b.value || b.getAttribute('aria-label') || '').trim())
                    .filter(t => t.length > 0)
                    .slice(0, 20)
            """)

            nav_links = await page.evaluate("""
                () => {
                    const navs = document.querySelectorAll('nav, [role="navigation"], header');
                    const links = [];
                    navs.forEach(nav => {
                        nav.querySelectorAll('a').forEach(a => {
                            const text = a.innerText.trim();
                            if (text) links.push(text);
                        });
                    });
                    return [...new Set(links)].slice(0, 20);
                }
            """)

            forms = await page.evaluate("""
                () => {
                    return [...document.querySelectorAll('input, textarea, select')]
                        .filter(el => el.type !== 'hidden')
                        .map(el => {
                            const id = el.id || el.name;
                            const label = id
                                ? (document.querySelector(`label[for="${id}"]`) || {}).innerText || ''
                                : '';
                            return {
                                type: el.tagName.toLowerCase() === 'select' ? 'select' : (el.type || 'text'),
                                placeholder: el.placeholder || '',
                                label: label.trim()
                            };
                        })
                        .slice(0, 15);
                }
            """)

            # Extract main text content (prioritise <main>, fall back to <body>)
            main_content = await page.evaluate("""
                () => {
                    const main = document.querySelector('main') || document.body;
                    // Remove script/style nodes before reading text
                    const clone = main.cloneNode(true);
                    clone.querySelectorAll('script, style, nav, header, footer').forEach(n => n.remove());
                    return clone.innerText.replace(/\s+/g, ' ').trim().slice(0, 2000);
                }
            """)

            return ScrapedPage(
                url=url,
                title=title or "",
                meta_description=meta_desc or "",
                headings=headings,
                buttons=buttons,
                nav_links=nav_links,
                forms=forms,
                main_content=main_content,
            )

        finally:
            await browser.close()


async def scraper_health_check() -> str:
    """Quick check that Playwright + Chromium are available."""
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            await browser.close()
        return "ok"
    except Exception as e:
        return f"error: {e}"
