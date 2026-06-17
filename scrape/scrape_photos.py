"""
Scrape faculty profile photos from BRACU CSE faculty profile pages.
Downloads each photo and saves to frontend/public/faculty_photos/.
Updates photoUrl in faculty.json.

Run: python scrape/scrape_photos.py
"""

import json
import re
import concurrent.futures
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

BASE_URL = "https://cse.sds.bracu.ac.bd"
FACULTY_JSON = Path(__file__).parent.parent / "frontend/src/data/faculty.json"
PHOTO_DIR = Path(__file__).parent.parent / "frontend/public/faculty_photos"
WORKERS = 6
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

PHOTO_DIR.mkdir(parents=True, exist_ok=True)


def find_photo_url(soup: BeautifulSoup) -> str | None:
    """Find the faculty profile photo src from the page."""
    # The photo lives in a /storage/media/... path
    for img in soup.find_all("img"):
        src = img.get("src", "")
        if "/storage/media/" in src:
            return src
    return None


def safe_filename(name: str, initials: str, ext: str) -> str:
    """Build a URL-safe filename: Name_(INITIALS).ext"""
    clean = re.sub(r"[^\w\s\-.]", "", name).strip()
    clean = re.sub(r"\s+", "_", clean)
    return f"{clean}_({initials}){ext}"


def scrape_photo(f: dict) -> dict:
    name = f["name"]
    initials = f.get("initials", "")
    url = f.get("profileLink")

    if not url:
        print(f"  SKIP : {name} — no profileLink")
        return f

    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        r.raise_for_status()
    except Exception as e:
        print(f"  FAIL : {name} — {e}")
        return f

    soup = BeautifulSoup(r.text, "html.parser")
    photo_path = find_photo_url(soup)

    if not photo_path:
        print(f"  NONE : {name} — no photo on page")
        result = dict(f)
        result["photoUrl"] = None
        return result

    photo_url = urljoin(BASE_URL, photo_path)

    # Determine extension from URL
    ext_match = re.search(r"\.(jpg|jpeg|png|gif|webp)(\?.*)?$", photo_path, re.IGNORECASE)
    ext = ("." + ext_match.group(1).lower()) if ext_match else ".jpg"

    filename = safe_filename(name, initials, ext)
    dest = PHOTO_DIR / filename

    try:
        img_r = requests.get(photo_url, headers=HEADERS, timeout=20)
        img_r.raise_for_status()

        # Reject tiny placeholder images (real photos are >10KB)
        if len(img_r.content) < 10_000:
            print(f"  TINY : {name} — {len(img_r.content)}B (placeholder), skipping")
            result = dict(f)
            result["photoUrl"] = None
            return result

        dest.write_bytes(img_r.content)
        print(f"  OK   : {name} — {len(img_r.content)//1024}KB → {filename}")

        result = dict(f)
        result["photoUrl"] = f"/faculty_photos/{filename}"
        return result

    except Exception as e:
        print(f"  ERR  : {name} — photo download failed: {e}")
        return f


def main():
    faculty = json.loads(FACULTY_JSON.read_text(encoding="utf-8"))
    print(f"Scraping photos for {len(faculty)} faculty ({WORKERS} threads)...\n")

    results_map = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=WORKERS) as ex:
        futures = {ex.submit(scrape_photo, f): f for f in faculty}
        for done in concurrent.futures.as_completed(futures):
            r = done.result()
            results_map[r.get("id", r["name"])] = r

    # Preserve original order
    results = [results_map.get(f.get("id", f["name"]), f) for f in faculty]

    FACULTY_JSON.write_text(json.dumps(results, indent=2, ensure_ascii=False), encoding="utf-8")

    total = len(faculty)
    got_photo = sum(1 for f in results if f.get("photoUrl"))
    print(f"\nDone. {got_photo}/{total} faculty have photos.")
    print(f"Photos saved to: {PHOTO_DIR}")


if __name__ == "__main__":
    main()
