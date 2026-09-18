#!/bin/bash
# Collect Project 255 data using curl (bypasses Mod_Security that blocks Python requests)
# Runs in batches to avoid timeouts

BASE="https://project255.kdsg.gov.ng/project255AJAX.php"
OUT_DIR="/home/asher/ordaciti/data/raw"
TMP_DIR=$(mktemp -d)

echo "=== Project 255 Data Collection ==="
echo "Started: $(date)"
echo ""

# Phase 1: Collect all project list pages
echo "Phase 1: Collecting project list pages..."
page=1
all_ids_file="$TMP_DIR/all_ids.txt"

while [ $page -le 30 ]; do
    html=$(curl -s --max-time 10 "$BASE?fetchProjects=1&page=$page" 2>/dev/null)

    if [ -z "$html" ] || echo "$html" | grep -q "Not Acceptable"; then
        echo "Page $page: blocked/empty"
        page=$((page + 1))
        sleep 0.2
        continue
    fi

    # Extract IDs
    ids=$(echo "$html" | grep -oP "viewProjectDetails\(\d+" | grep -oP '\d+' | sort -u)
    count=$(echo "$ids" | grep -c .)

    if [ "$count" -eq 0 ]; then
        echo "Page $page: 0 projects"
        break
    fi

    echo "$ids" >> "$all_ids_file"
    echo "Page $page: $count projects (cumulative IDs: $(sort -u "$all_ids_file" | grep -c .))"

    page=$((page + 1))
    sleep 0.2
done

TOTAL_IDS=$(sort -u "$all_ids_file" | grep -c .)
echo ""
echo "Total unique project IDs: $TOTAL_IDS"
echo ""

# Phase 2: Collect details for each project (in batches)
echo "Phase 2: Collecting project details..."
> "$TMP_DIR/parsed_projects.json"

count=0
while IFS= read -r pid; do
    [ -z "$pid" ] && continue

    detail=$(curl -s --max-time 5 "$BASE?fetchDetails=$pid" 2>/dev/null)

    if [ -z "$detail" ] || echo "$detail" | grep -q "Not Acceptable"; then
        continue
    fi

    # Parse with Python (faster than bash)
    echo "$detail" | python3 -c "
import sys, json, re

html = sys.stdin.read()
pid = int('$pid')

data = {'project_id': pid, 'source': 'Project 255'}

# Title
title_m = re.search(r'<h5[^>]*>(.*?)</h5>', html, re.DOTALL)
if title_m:
    t = re.sub(r'<[^>]+>', '', title_m.group(1)).strip()
    t = t.replace('&#039;', \"'\").replace('&amp;', '&')
    data['title'] = t

# Status
stat_m = re.search(r'badge\s+(\w+)\"[^>]*>(.*?)<', html)
if stat_m:
    data['status'] = stat_m.group(2).strip()

# Fields
for fn, fv in re.findall(r'<strong>([^<]+):</strong>\s*<div[^>]*>(.*?)</div>', html, re.DOTALL):
    fn = fn.strip()
    fv = re.sub(r'<[^>]+>', '', fv).strip()
    fv = fv.replace('&#039;', \"'\").replace('&amp;', '&').replace('₦', 'NGN')
    if fn == 'LGA': data['lga'] = fv
    elif fn == 'Ward': data['ward'] = fv
    elif fn == 'Sector': data['sector'] = fv
    elif fn == 'Key Achievement': data['key_achievement'] = fv
    elif fn == 'Contractor': data['contractor'] = fv or None
    elif fn == 'Consultant': data['consultant'] = fv or None
    elif fn == 'Funder': data['funder'] = fv or None
    elif fn == 'Contract Sum': data['contract_sum'] = fv
    elif fn == 'Value Done': data['value_done'] = fv
    elif fn == 'Paid to Date': data['paid_to_date'] = fv

print(json.dumps(data))
" >> "$TMP_DIR/parsed_projects.json"

    count=$((count + 1))
    if [ $((count % 50)) -eq 0 ]; then
        echo "  Processed $count / $TOTAL_IDS projects..."
    fi

    sleep 0.05
done < "$all_ids_file"

echo ""
echo "Phase 2 complete: $count projects parsed"

# Phase 3: Assemble final JSON
echo ""
echo "Phase 3: Assembling final JSON..."

FIRST=1
PROJECTS=""

while IFS= read -r line; do
    [ -z "$line" ] && continue
    if [ $FIRST -eq 1 ]; then
        PROJECTS="$line"
        FIRST=0
    else
        PROJECTS="$PROJECTS,$line"
    fi
done < "$TMP_DIR/parsed_projects.json"

cat > "$OUT_DIR/project255_projects.json" << EOF
{
  "source": "Kaduna State Government Project 255 Portal",
  "url": "https://project255.kdsg.gov.ng/",
  "endpoint": "project255AJAX.php?fetchProjects=1&page=N and project255AJAX.php?fetchDetails=N",
  "collected_at": "2026-09-18",
  "total_projects": $TOTAL_IDS,
  "projects": [$PROJECTS]
}
EOF

# Save raw HTML dump too
echo "" > "$TMP_DIR/all_details.html"
while IFS= read -r pid; do
    [ -z "$pid" ] && continue
    echo "<!-- Project ID: $pid -->" >> "$TMP_DIR/all_details.html"
    curl -s --max-time 5 "$BASE?fetchDetails=$pid" 2>/dev/null >> "$TMP_DIR/all_details.html"
    echo "" >> "$TMP_DIR/all_details.html"
done < "$all_ids_file"

mv "$TMP_DIR/all_details.html" "$OUT_DIR/project255_raw_details.html"

# Cleanup
rm -rf "$TMP_DIR"

echo ""
echo "=== Collection Complete ==="
echo "Ended: $(date)"
echo ""
echo "Files created:"
ls -la "$OUT_DIR/project255_"*
echo ""
echo "Summary:"
python3 -c "
import json
with open('$OUT_DIR/project255_projects.json') as f:
    data = json.load(f)

projects = data.get('projects', [])
print(f'Total projects: {len(projects)}')
print(f'Fields: {sorted(set(k for p in projects for k in p.keys()))}')

# LGAs
lgas = sorted(set(p.get('lga', '') for p in projects if p.get('lga')))
print(f'LGAs ({len(lgas)}): {lgas}')

# Sectors
sectors = sorted(set(p.get('sector', '') for p in projects if p.get('sector')))
print(f'Sectors ({len(sectors)}): {sectors}')

# Statuses
statuses = sorted(set(p.get('status', '') for p in projects if p.get('status')))
print(f'Statuses: {statuses}')

# With amounts
with_amounts = [p for p in projects if p.get('contract_sum') and p['contract_sum'] not in ('NGN0.00', 'NGN0', '0.00', '0', None, '')]
print(f'Projects with contract amounts: {len(with_amounts)}')

# Sample
print()
print('Sample (first 3):')
for p in projects[:3]:
    print(f'  ID {p[\"project_id\"]}: {p.get(\"title\", \"N/A\")}')
    print(f'    LGA: {p.get(\"lga\", \"N/A\")} | Sector: {p.get(\"sector\", \"N/A\")} | Status: {p.get(\"status\", \"N/A\")}')
    if p.get('contract_sum'):
        print(f'    Contract Sum: {p[\"contract_sum\"]}')
"
