import requests, json, re
from bs4 import BeautifulSoup

# Get facIds from the supervising list page
r = requests.get("https://cse.sds.bracu.ac.bd/thesis/supervising/list",
                 headers={"User-Agent": "Mozilla/5.0"}, timeout=15)
soup = BeautifulSoup(r.text, "html.parser")

supervising_ids = set()
for el in soup.find_all(attrs={"wire:initial-data": True}):
    raw = el["wire:initial-data"].replace("&quot;", '"')
    data = json.loads(raw)
    if "faculty-card" in data.get("fingerprint", {}).get("name", ""):
        fid = data["serverMemo"]["data"].get("facId")
        if fid:
            supervising_ids.add(str(fid))

print(f"Faculty on supervising list: {len(supervising_ids)}")

# Load our faculty.json and extract facId from profileLink
faculty = json.loads(open("../frontend/src/data/faculty.json", encoding="utf-8").read())

def get_fac_id(profile_link):
    m = re.search(r"/faculty_profile/(\d+)/", profile_link or "")
    return m.group(1) if m else None

# Find faculty on supervising list with no research areas
missing = []
for f in faculty:
    fid = get_fac_id(f.get("profileLink", ""))
    if fid in supervising_ids and not f.get("researchAreas"):
        missing.append(f["name"])

print(f"\nOn supervising list but still no research areas: {len(missing)}")
for name in missing:
    print(f"  - {name}")
