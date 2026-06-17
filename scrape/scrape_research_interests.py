"""
Scrape research interests, synopsis/bio, and publications from BRACU CSE faculty profiles.
Run from: D:/Projects/thesisMap/scrape/
Usage:  .venv/Scripts/python scrape_research_interests.py
Output: faculty_scraped.json
"""

import asyncio
import json
import re
import sys
from pathlib import Path

from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode

FACULTY_JSON = Path(__file__).parent.parent / "frontend/src/data/faculty.json"
OUTPUT = Path(__file__).parent / "faculty_scraped.json"

# Click all visible tabs/buttons so all section content is rendered
JS_CLICK_ALL_TABS = """
(async () => {
    const els = [...document.querySelectorAll('a.nav-link, button.nav-link, li.nav-item a, .tab-link, [role="tab"]')];
    for (const el of els) {
        try { el.click(); await new Promise(r => setTimeout(r, 300)); } catch(e) {}
    }
})();
"""

def extract_section(lines: list[str], keywords: list[str], stop_keywords: list[str]) -> list[str]:
    """Collect non-empty lines after a matching header until a stop header."""
    collecting = False
    results = []
    for line in lines:
        stripped = line.strip()
        lower = stripped.lower()
        if any(kw in lower for kw in keywords):
            collecting = True
            continue
        if collecting:
            if stripped.startswith("#") and any(kw in lower for kw in stop_keywords):
                break
            if stripped.startswith("##") or stripped.startswith("==="):
                # new section — check if it's a stop
                if any(kw in lower for kw in stop_keywords):
                    break
            if len(stripped) < 3:
                continue
            clean = stripped.lstrip("*-•·>|# ").strip()
            if clean and len(clean) > 2:
                results.append(clean)
            if len(results) >= 30:
                break
    return results


def parse_profile(markdown: str, name: str) -> dict:
    lines = markdown.splitlines()

    research = extract_section(
        lines,
        keywords=["research interest"],
        stop_keywords=["publication", "biography", "synopsis", "contact", "course", "award"]
    )

    synopsis_lines = extract_section(
        lines,
        keywords=["biography", "synopsis", "about", "profile summary"],
        stop_keywords=["research", "publication", "contact", "course", "award"]
    )
    bio = " ".join(synopsis_lines).strip() or None

    pub_lines = extract_section(
        lines,
        keywords=["publication"],
        stop_keywords=["research", "biography", "synopsis", "contact", "course", "award"]
    )
    # Publications are usually numbered or bulleted lines
    publications = [p for p in pub_lines if len(p) > 15]

    return {
        "researchAreas": research,
        "bio": bio,
        "publications": publications,
    }


async def scrape_one(crawler, url: str, name: str) -> dict:
    config = CrawlerRunConfig(
        js_code=JS_CLICK_ALL_TABS,
        wait_for="css:body",
        cache_mode=CacheMode.BYPASS,
        page_timeout=25000,
        word_count_threshold=0,
    )
    result = await crawler.arun(url=url, config=config)
    if not result.success:
        print(f"  FAIL : {name}")
        return {}

    data = parse_profile(result.markdown or "", name)
    r = data["researchAreas"]
    p = data["publications"]
    b = bool(data["bio"])
    print(f"  {'OK  ' if r or p or b else 'NONE'}: {name} | areas={len(r)} pubs={len(p)} bio={'y' if b else 'n'}")
    return data


async def main():
    faculty = json.loads(FACULTY_JSON.read_text(encoding="utf-8"))
    targets = [f for f in faculty if f.get("profileLink")]
    print(f"Scraping {len(targets)} faculty profiles...\n")

    browser_cfg = BrowserConfig(headless=True, verbose=False)
    results = {}

    async with AsyncWebCrawler(config=browser_cfg) as crawler:
        batch_size = 5
        for i in range(0, len(targets), batch_size):
            batch = targets[i:i + batch_size]
            tasks = [scrape_one(crawler, f["profileLink"], f["name"]) for f in batch]
            scraped = await asyncio.gather(*tasks)
            for f, data in zip(batch, scraped):
                results[f["email"]] = {"name": f["name"], **data}
            print(f"  --- batch {i//batch_size + 1}/{(len(targets)-1)//batch_size + 1} done\n")

    OUTPUT.write_text(json.dumps(results, indent=2, ensure_ascii=False), encoding="utf-8")
    found_r = sum(1 for v in results.values() if v.get("researchAreas"))
    found_p = sum(1 for v in results.values() if v.get("publications"))
    found_b = sum(1 for v in results.values() if v.get("bio"))
    print(f"\nSaved → {OUTPUT}")
    print(f"Research areas: {found_r}/{len(targets)}")
    print(f"Publications  : {found_p}/{len(targets)}")
    print(f"Bio/Synopsis  : {found_b}/{len(targets)}")


if __name__ == "__main__":
    asyncio.run(main())
