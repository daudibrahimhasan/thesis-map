"""Retry the 15 faculty on the supervising list that timed out. Updates faculty.json in place."""
import requests, json, re, time
from pathlib import Path
from bs4 import BeautifulSoup

FACULTY_JSON = Path(__file__).parent.parent / "frontend/src/data/faculty.json"
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

TARGETS = [
    "Anindita Labonno", "Fardin Zubair Nafis", "Fatiha Ishrar Chowdhury",
    "MD Ajmain Mahtab", "Md Sabbir Hossain", "Md. Anonto Shuvo",
    "Mohammad Rakibul Hasan Mahin", "Mr. Sifat Tanvir", "Mr. Tamkin Mahmud Tan",
    "Mr. Zaber Mohammad", "Pollock Nag", "Sanjida Tasnim",
    "Showvik Biswas", "Sukarna Sarker", "Swattic Ghose",
]

def extract_research_areas(html: str) -> list[str]:
    idx = html.find('x-show="interest"')
    if idx < 0:
        return []
    chunk = html[idx:idx+3000]
    ck_idx = chunk.find("ck-content")
    if ck_idx < 0:
        return []
    soup = BeautifulSoup(chunk[ck_idx:ck_idx+1000], "html.parser")
    return [p.get_text(strip=True) for p in soup.find_all("p") if p.get_text(strip=True)]

def get_tab_content(html: str, tab_name: str) -> str | None:
    pattern = f"sectionTab=='{tab_name}' || 'hidden'"
    idx = html.find(pattern)
    if idx < 0:
        return None
    chunk = html[idx:idx+5000]
    ck_idx = chunk.find("ck-content")
    if ck_idx < 0:
        return None
    soup = BeautifulSoup(chunk[ck_idx:ck_idx+2000], "html.parser")
    paras = [p.get_text(" ", strip=True) for p in soup.find_all("p") if len(p.get_text(strip=True)) > 20]
    return " ".join(paras[:4]).strip() or None

faculty = json.loads(FACULTY_JSON.read_text(encoding="utf-8"))

for f in faculty:
    if f["name"] not in TARGETS:
        continue
    url = f.get("profileLink")
    if not url:
        print(f"SKIP (no url): {f['name']}")
        continue

    for attempt in range(3):
        try:
            r = requests.get(url, headers=HEADERS, timeout=25)
            r.raise_for_status()
            break
        except Exception as e:
            print(f"  attempt {attempt+1} failed: {e}")
            time.sleep(3)
    else:
        print(f"FAIL: {f['name']}")
        continue

    areas = extract_research_areas(r.text)
    bio = get_tab_content(r.text, "Biography")

    if areas:
        f["researchAreas"] = areas
    if bio and (not f.get("bio") or f["bio"] == "Biography not available."):
        f["bio"] = bio

    print(f"OK: {f['name']} | areas={len(areas)} bio={'y' if bio else 'n'}")
    time.sleep(1)

FACULTY_JSON.write_text(json.dumps(faculty, indent=2, ensure_ascii=False), encoding="utf-8")
print(f"\nUpdated faculty.json")
