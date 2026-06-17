"""
Reads research_areas_normalization.csv, adds researchCategories to each
faculty entry in faculty.json based on their researchAreas.
"""
import json, csv
from pathlib import Path

FACULTY_JSON = Path(__file__).parent.parent / "frontend/src/data/faculty.json"
CSV = Path(__file__).parent / "research_areas_normalization.csv"

# Build area -> category lookup
area_to_category = {}
with open(CSV, encoding="utf-8") as f:
    for row in csv.DictReader(f):
        area_to_category[row["original_area"]] = row["category"]

faculty = json.loads(FACULTY_JSON.read_text(encoding="utf-8"))

for f in faculty:
    cats = []
    for area in f.get("researchAreas", []):
        cat = area_to_category.get(area)
        if cat and cat not in cats:
            cats.append(cat)
    f["researchCategories"] = cats

FACULTY_JSON.write_text(json.dumps(faculty, indent=2, ensure_ascii=False), encoding="utf-8")

# Print stats
with_cats = sum(1 for f in faculty if f.get("researchCategories"))
print(f"Faculty with categories: {with_cats}/{len(faculty)}")

# Print unique categories used
all_cats = set()
for f in faculty:
    all_cats.update(f.get("researchCategories", []))
print(f"Unique categories: {sorted(all_cats)}")
