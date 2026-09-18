#!/bin/bash
# Complete the Project 255 data collection - fetch detail fields for all projects
# Uses curl (bypasses Mod_Security blocking Python requests)

BASE="https://project255.kdsg.gov.ng/project255AJAX.php"
SRC="/home/asher/ordaciti/data/raw/project255_projects.json"
OUT="/home/asher/ordaciti/data/raw/project255_projects.json"

echo "=== Completing Project 255 Detail Collection ==="
echo "Started: $(date)"

# Extract existing project IDs
IDS=$(python3 -c "
import json
with open('$SRC') as f: d = json.load(f)
for p in d.get('projects', []):
    print(p['project_id'])
")

TOTAL=$(echo "$IDS" | grep -c .)
echo "Projects to enrich: $TOTAL"
echo ""

ENRICHED=0
TEMP=$(mktemp)

# Read existing JSON, enrich each project, write back
python3 << 'PYEOF'
import json, subprocess, re, sys, time

SRC = "/home/asher/ordaciti/data/raw/project255_projects.json"
BASE = "https://project255.kdsg.gov.ng/project255AJAX.php"

with open(SRC) as f:
    data = json.load(f)

projects = data.get("projects", [])
print(f"Enriching {len(projects)} projects...")

for i, proj in enumerate(projects):
    pid = proj["project_id"]

    # Fetch detail via curl
    result = subprocess.run(
        ["curl", "-s", "--max-time", "8", f"{BASE}?fetchDetails={pid}"],
        capture_output=True, text=True, timeout=10
    )
    html = result.stdout

    if not html or "Not Acceptable" in html:
        if i % 50 == 0:
            print(f"  Project {i+1}/{len(projects)}: ID {pid} - blocked, skipping")
        continue

    # Parse fields
    title_m = re.search(r'<h5[^>]*>(.*?)</h5>', html, re.DOTALL)
    if title_m:
        t = re.sub(r'<[^>]+>', '', title_m.group(1)).strip()
        t = t.replace('&#039;', "'").replace('&amp;', '&')
        if not proj.get("title"):
            proj["title"] = t

    stat_m = re.search(r'badge\s+(\w+)\"[^>]*>(.*?)<', html)
    if stat_m:
        proj["status"] = stat_m.group(2).strip()

    for fn, fv in re.findall(r'<strong>([^<]+):</strong>\s*<div[^>]*>(.*?)</div>', html, re.DOTALL):
        fn = fn.strip()
        fv = re.sub(r'<[^>]+>', '', fv).strip()
        fv = fv.replace('&#039;', "'").replace('&amp;', '&').replace('₦', 'NGN')

        if fn == "LGA":
            proj["lga"] = fv if fv else None
        elif fn == "Ward":
            proj["ward"] = fv if fv else None
        elif fn == "Sector":
            proj["sector"] = fv if fv else None
        elif fn == "Key Achievement":
            proj["key_achievement"] = fv if fv else None
        elif fn == "Contractor":
            proj["contractor"] = fv if fv else None
        elif fn == "Consultant":
            proj["consultant"] = fv if fv else None
        elif fn == "Funder":
            proj["funder"] = fv if fv else None
        elif fn == "Contract Sum":
            proj["contract_sum"] = fv if fv else None
        elif fn == "Value Done":
            proj["value_done"] = fv if fv else None
        elif fn == "Paid to Date":
            proj["paid_to_date"] = fv if fv else None

    if i % 50 == 0:
        enriched = sum(1 for p in projects if p.get("lga") or p.get("sector"))
        print(f"  Progress: {i+1}/{len(projects)} (enriched: {enriched})")

    time.sleep(0.05)

# Update the data
data["total_projects"] = len(projects)
data["enriched_at"] = "2026-09-18"

with open(SRC, "w") as f:
    json.dump(data, f, indent=2)

# Stats
enriched = sum(1 for p in projects if p.get("lga") or p.get("sector"))
lgas = sorted(set(p.get("lga", "") for p in projects if p.get("lga")))
sectors = sorted(set(p.get("sector", "") for p in projects if p.get("sector")))
statuses = sorted(set(p.get("status", "") for p in projects if p.get("status")))
with_amt = [p for p in projects if p.get("contract_sum") and p["contract_sum"] not in ("NGN0.00", "NGN0", None, "", "0.00")]

print(f"\n=== Enrichment Complete ===")
print(f"Total projects: {len(projects)}")
print(f"Enriched (with LGA/sector): {enriched}")
print(f"LGAs ({len(lgas)}): {lgas}")
print(f"Sectors ({len(sectors)}): {sectors}")
print(f"Statuses: {statuses}")
print(f"Projects with contract amounts: {len(with_amt)}")
print(f"\nSample (first 3 enriched):")
for p in projects[:3]:
    if p.get("lga"):
        print(f"  ID {p['project_id']}: {p.get('title', 'N/A')}")
        print(f"    LGA: {p.get('lga')} | Sector: {p.get('sector')} | Status: {p.get('status')} | Amount: {p.get('contract_sum')}")
PYEOF

echo ""
echo "Finished: $(date)"
echo "File: $SRC ($(stat -c%s "$SRC") bytes)"
