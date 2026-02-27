import httpx
from bs4 import BeautifulSoup
from app.schemas.review import ScrapedPage


async def scrape_page(url: str) -> ScrapedPage:
    async with httpx.AsyncClient(follow_redirects=True, timeout=20) as client:
        response = await client.get(url)
        html = response.text

    soup = BeautifulSoup(html, "html.parser")

    # Title
    title = soup.title.string.strip() if soup.title and soup.title.string else None

    # Meta description
    meta = soup.find("meta", attrs={"name": "description"})
    meta_description = meta["content"].strip() if meta and meta.get("content") else None

    # Headings
    headings = []
    for tag in ["h1", "h2", "h3"]:
        headings.extend([h.get_text(strip=True) for h in soup.find_all(tag)])

    # Buttons
    buttons = [b.get_text(strip=True) for b in soup.find_all("button")]

    # Navigation links
    nav_links = []
    for nav in soup.find_all("nav"):
        for a in nav.find_all("a"):
            nav_links.append(a.get_text(strip=True))

    # Forms
    forms = []
    for form in soup.find_all("form"):
        inputs = form.find_all(["input", "textarea"])
        for inp in inputs:
            forms.append({
                "type": inp.get("type", "text"),
                "placeholder": inp.get("placeholder", ""),
                "label": ""
            })

    # Main content sample
    main = soup.find("main")
    main_content = main.get_text(strip=True)[:2000] if main else html[:2000]

    return ScrapedPage(
        url=url,
        title=title,
        meta_description=meta_description,
        headings=headings,
        buttons=buttons,
        nav_links=nav_links,
        forms=forms,
        main_content=main_content
    )
async def scraper_health_check():
    try:
        await scrape_page("https://example.com")
        return "ok"
    except Exception as e:
        return f"error: {str(e)}"