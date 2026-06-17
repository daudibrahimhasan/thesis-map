"""
Scrape research interests, bio, and publications from BRACU CSE faculty profiles.
Uses only requests + bs4 (already installed globally). No browser needed.
Run: python scrape/scrape_faculty.py
Output: scrape/faculty_scraped.json
"""

import json
import re
import concurrent.futures
from pathlib import Path

import requests
from bs4 import BeautifulSoup

FACULTY_JSON = Path(__file__).parent.parent / "frontend/src/data/faculty.json"
OUTPUT = Path(__file__).parent / "faculty_scraped.json"
WORKERS = 10
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}


def get_tab_section(soup: BeautifulSoup, tab_name: str) -> BeautifulSoup | None:
    """Find a tab-view div whose Alpine :class references the given tab name."""
    for div in soup.find_all("div", class_="tab-view"):
        cls_attr = div.get(":class", "")
        if tab_name in cls_attr:
            return div
    return None


def extract_research_areas(soup: BeautifulSoup) -> list[str]:
    """Extract research interest items from the x-show='interest' modal."""
    # The "Research Interest" button toggles x-show="interest" (Alpine.js)
    # Inside is a modal with a .ck-content div containing <p> tags
    interest_div = soup.find(attrs={"x-show": "interest"})
    if interest_div:
        ck = interest_div.find("div", class_=lambda c: c and "ck-content" in c)
        if ck:
            items = [p.get_text(strip=True) for p in ck.find_all("p")
                     if p.get_text(strip=True) and len(p.get_text(strip=True)) > 1]
            if items:
                return items
        # Fallback: any <p> inside the modal
        items = [p.get_text(strip=True) for p in interest_div.find_all("p")
                 if p.get_text(strip=True) and "research interest" not in p.get_text(strip=True).lower()]
        return items[:20]

    return []


def extract_bio(soup: BeautifulSoup) -> str | None:
    tab = get_tab_section(soup, "Biography")
    if not tab:
        return None
    # Get all <p> text, join into one bio string
    paras = [p.get_text(" ", strip=True) for p in tab.find_all("p") if len(p.get_text(strip=True)) > 20]
    return " ".join(paras[:4]).strip() or None


def extract_publications(soup: BeautifulSoup) -> list[dict]:
    tab = get_tab_section(soup, "Publication")
    if not tab:
        return []
    pubs = []
    for li in tab.find_all("li"):
        title_el = li.find(["i", "em", "a"])
        title = title_el.get_text(strip=True) if title_el else li.get_text(" ", strip=True)
        link_el = li.find("a")
        url = link_el["href"] if link_el and link_el.get("href") else ""
        # Try to extract year from text
        year_match = re.search(r"\b(19|20)\d{2}\b", li.get_text())
        year = int(year_match.group()) if year_match else None
        if title and len(title) > 10 and "scholar" not in title.lower() and "researchgate" not in title.lower():
            pubs.append({"title": title, "year": year, "url": url})
    return pubs


def scrape_profile(f: dict) -> dict:
    url = f["profileLink"]
    name = f["name"]
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        r.raise_for_status()
    except Exception as e:
        print(f"  FAIL : {name} — {e}")
        return f

    soup = BeautifulSoup(r.text, "html.parser")

    # Find the faculty-page Livewire component
    faculty_el = None
    for el in soup.find_all(attrs={"wire:initial-data": True}):
        raw = el["wire:initial-data"].replace("&quot;", '"')
        try:
            data = json.loads(raw)
            if "faculty-page" in data.get("fingerprint", {}).get("name", ""):
                faculty_el = el
                break
        except Exception:
            pass

    if not faculty_el:
        print(f"  NONE : {name} (no faculty component)")
        return f

    research = extract_research_areas(faculty_el)
    bio = extract_bio(faculty_el)
    pubs = extract_publications(faculty_el)

    status = "OK  " if (research or pubs or bio) else "NONE"
    print(f"  {status}: {name} | areas={len(research)} pubs={len(pubs)} bio={'y' if bio else 'n'}")

    result = dict(f)
    if research:
        result["researchAreas"] = research
    if bio:
        result["bio"] = bio
    if pubs:
        result["recentPapers"] = pubs
    return result


def main():
    faculty = json.loads(FACULTY_JSON.read_text(encoding="utf-8"))
    targets = [f for f in faculty if f.get("profileLink")]
    print(f"Scraping {len(targets)} profiles ({WORKERS} threads)...\n")

    results_map = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=WORKERS) as ex:
        futures = {ex.submit(scrape_profile, f): f for f in targets}
        for done in concurrent.futures.as_completed(futures):
            r = done.result()
            results_map[r.get("id", r["name"])] = r

    # Preserve original order
    results = []
    for f in faculty:
        key = f.get("id", f["name"])
        results.append(results_map.get(key, f))

    OUTPUT.write_text(json.dumps(results, indent=2, ensure_ascii=False), encoding="utf-8")

    found_r = sum(1 for v in results if v.get("researchAreas"))
    found_p = sum(1 for v in results if v.get("recentPapers"))
    found_b = sum(1 for v in results if v.get("bio") and v["bio"] != "Biography not available.")
    n = len(results)
    print(f"\nSaved -> {OUTPUT}")
    print(f"Research areas : {found_r}/{n}")
    print(f"Publications   : {found_p}/{n}")
    print(f"Bio/Synopsis   : {found_b}/{n}")


if __name__ == "__main__":
    main()
