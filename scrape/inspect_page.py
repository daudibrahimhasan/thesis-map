import requests, json
from bs4 import BeautifulSoup

r = requests.get(
    "https://cse.sds.bracu.ac.bd/faculty_profile/510/md_arif_hasan",
    headers={"User-Agent": "Mozilla/5.0"},
    timeout=15
)

soup = BeautifulSoup(r.text, "html.parser")

for el in soup.find_all(attrs={"wire:initial-data": True}):
    raw = el["wire:initial-data"].replace("&quot;", '"')
    data = json.loads(raw)
    if "faculty-page" in data.get("fingerprint", {}).get("name", ""):
        inner = el.decode_contents()[4000:]  # skip header part
        print(inner[:8000])
