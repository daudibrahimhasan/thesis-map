"""
Scrape research areas for all faculty with empty researchAreas in faculty.json.
Updates faculty.json in place.
Run from: D:/Projects/thesisMap/scrape/
Usage: .venv/Scripts/python fill_empty_research.py
"""
import requests
import json
import time
from pathlib import Path
from bs4 import BeautifulSoup

FACULTY_JSON = Path(__file__).parent.parent / "frontend/src/data/faculty.json"
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}


def extract_tab_content(html: str, tab_name: str) -> list[str]:
    """Extract <p> and <li> text from a tab section identified by Alpine.js sectionTab pattern."""
    # Try new pattern: sectionTab=='Tab Name' || 'hidden'
    patterns = [
        f"sectionTab=='{tab_name}' || 'hidden'",
        f'sectionTab=="{tab_name}" || \'hidden\'',
        f"x-show=\"{tab_name.lower().replace(' ', '')}\"",
        f"x-show=\"{tab_name.lower()}\"",
    ]
    idx = -1
    for pat in patterns:
        idx = html.find(pat)
        if idx >= 0:
            break
    if idx < 0:
        return []
    chunk = html[idx:idx + 4000]
    ck_idx = chunk.find("ck-content")
    if ck_idx < 0:
        return []
    soup = BeautifulSoup(chunk[ck_idx:ck_idx + 2000], "html.parser")
    items = []
    for tag in soup.find_all(["p", "li"]):
        text = tag.get_text(strip=True)
        if text and len(text) > 3:
            items.append(text)
    return items


def extract_research_areas(html: str) -> list[str]:
    return extract_tab_content(html, "Research Interest")


def get_bio(html: str) -> str | None:
    lines = extract_tab_content(html, "Biography")
    paras = [l for l in lines if len(l) > 20]
    return " ".join(paras[:5]).strip() or None


faculty = json.loads(FACULTY_JSON.read_text(encoding="utf-8"))
targets = [f for f in faculty if not f.get("researchAreas") and f.get("profileLink")]

print(f"Faculty with empty research areas: {len(targets)}\n")

updated = 0
failed = []

for i, f in enumerate(targets, 1):
    url = f["profileLink"]
    name = f["name"]
    print(f"[{i}/{len(targets)}] {name}")

    html = None
    for attempt in range(3):
        try:
            r = requests.get(url, headers=HEADERS, timeout=30)
            r.raise_for_status()
            html = r.text
            break
        except Exception as e:
            print(f"  attempt {attempt + 1} failed: {e}")
            time.sleep(3)

    if html is None:
        print(f"  FAIL: {name}")
        failed.append(name)
        continue

    areas = extract_research_areas(html)
    bio = get_bio(html)

    if areas:
        f["researchAreas"] = areas
        updated += 1
        print(f"  OK  : {len(areas)} areas found")
    else:
        print(f"  NONE: no research areas found")
        failed.append(name)

    if bio and (not f.get("bio") or len(f.get("bio", "")) < 30):
        f["bio"] = bio

    time.sleep(1.2)

FACULTY_JSON.write_text(json.dumps(faculty, indent=2, ensure_ascii=False), encoding="utf-8")

print(f"\n--- Done ---")
print(f"Updated: {updated}/{len(targets)}")
print(f"Failed/empty ({len(failed)}):")
for name in failed:
    print(f"  - {name}")
