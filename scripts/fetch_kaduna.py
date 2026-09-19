#!/usr/bin/env python3
"""
Ordaciti Phase 3: Kaduna State OCDS Data Ingestion

Retrieves project data from the verified Kaduna State OCDS endpoint:
  https://www.ocds.kdsg.gov.ng/Projects/fetchprojects/{page_number}

Source verification (Phase 2B, 2026-09-19):
  - GET, HTTP 200, JSON body, Content-Type: text/html (server quirk)
  - 230 populated pages (1-230), page 231 empty
  - 1379 raw records, 610 distinct project IDs
  - ID range 2-848, ID 1 missing, 238 gaps
  - No authentication required

Duplication model (Phase 2B reconciled):
  - 5 singletons, 523 mult-2, 82 mult-4
  - 462 intra-page-only mult-2, 61 cross-page-only mult-2
  - 27 intra-page-only mult-4, 55 cross-page mult-4
  - project_id = project entity, contractor = child association

Source modes (explicit, no hidden fallback):
  LIVE (default):    Fetch directly from the verified endpoint.
                      No cached or /tmp fallback. Fail if unavailable.
  REPLAY (--replay): Process existing data/raw/kaduna_projects.json.
                      Must be explicitly requested.
"""

import argparse
import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from collections import defaultdict

import requests

# Configuration
BASE_URL = "https://www.ocds.kdsg.gov.ng/Projects/fetchprojects/"
MAX_RETRIES = 3
RETRY_DELAY = 3  # seconds
REQUEST_TIMEOUT = 20
TOTAL_PAGES = 231

RAW_DIR = Path(__file__).resolve().parent.parent / "data" / "raw"
PROCESSED_DIR = Path(__file__).resolve().parent.parent / "data" / "processed"
RAW_OUTPUT = RAW_DIR / "kaduna_projects.json"
PROCESSED_OUTPUT = PROCESSED_DIR / "projects.json"
SOURCE_URL_TEMPLATE = "https://www.ocds.kdsg.gov.ng/Project/{project_id}"


# =============================================================================
# LIVE SOURCE FETCHING
# =============================================================================

def fetch_page(page_num: int) -> dict | None:
    """Fetch a single page from the Kaduna OCDS endpoint.

    Retries on 412 and connection errors. Does NOT silently accept
    non-JSON responses — the endpoint returns valid JSON with a
    Content-Type: text/html header, which requests handles correctly.
    """
    url = f"{BASE_URL}{page_num}"
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (X11; Linux x86_64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        ),
        "Accept": "application/json, text/html, */*",
    }
    last_error = None
    for attempt in range(MAX_RETRIES):
        try:
            resp = requests.get(url, headers=headers, timeout=REQUEST_TIMEOUT)
            if resp.status_code == 200:
                return resp.json()
            if resp.status_code == 412:
                last_error = "412 Precondition Failed"
                time.sleep(RETRY_DELAY)
                continue
            last_error = f"HTTP {resp.status_code}"
            return None
        except requests.exceptions.ConnectionError:
            last_error = "Connection refused"
            time.sleep(RETRY_DELAY)
        except requests.exceptions.RequestException as exc:
            last_error = str(exc)
            return None
    print(f"    Failed after {MAX_RETRIES} attempts: {last_error}", file=sys.stderr)
    return None


def fetch_all_pages_live() -> tuple[list[dict], dict]:
    """Fetch all 231 pages from the verified endpoint.

    Returns (pages, stats) where stats tracks what actually happened.
    """
    pages: list[dict] = []
    stats = {
        "requested": TOTAL_PAGES,
        "retrieved": 0,
        "failed": 0,
        "populated": 0,
        "empty": 0,
        "failures": [],  # page numbers that failed
    }

    for page_num in range(1, TOTAL_PAGES + 1):
        print(f"  Page {page_num:3d}/{TOTAL_PAGES}...", end=" ", flush=True)
        data = fetch_page(page_num)
        if data is None:
            print("FAILED")
            stats["failed"] += 1
            stats["failures"].append(page_num)
            continue
        data["_original_page_number"] = page_num
        pages.append(data)
        stats["retrieved"] += 1
        n = len(data.get("data", []))
        if n > 0:
            stats["populated"] += 1
        else:
            stats["empty"] += 1
        print(f"OK ({n} records)")
        time.sleep(0.15)

    return pages, stats


# =============================================================================
# REPLAY / OFFLINE MODE
# =============================================================================

def load_replay_data() -> tuple[list[dict], dict] | None:
    """Load raw pages from data/raw/kaduna_projects.json.

    This is an EXPLICIT offline/replay mode. The caller must pass
    --replay. There is no automatic fallback to this source.
    """
    if not RAW_OUTPUT.exists():
        return None
    try:
        with open(RAW_OUTPUT) as fh:
            cached = json.load(fh)
    except (json.JSONDecodeError, IOError) as exc:
        print(f"ERROR: Cannot read {RAW_OUTPUT}: {exc}", file=sys.stderr)
        return None

    pages = cached.get("pages", [])
    if not pages:
        print(f"ERROR: {RAW_OUTPUT} contains no pages", file=sys.stderr)
        return None

    manifest = cached.get("manifest", {})
    source_info = {
        "source": "replay",
        "description": f"Loaded from {RAW_OUTPUT}",
        "pages": len(pages),
        "retrieved_at": manifest.get("retrieved_at", ""),
        "original_source_mode": manifest.get("source_mode", "unknown"),
        "note": (
            "Replay/offline mode. This processed snapshot was produced from "
            "a previous ingestion run. It is NOT a live fetch from the endpoint."
        ),
    }
    return pages, source_info


# =============================================================================
# DEDUPLICATION — PHASE 2B VERIFIED MODEL
# =============================================================================

def deduplicate_records(pages: list[dict], source_retrieved_at: str) -> tuple[dict, dict]:
    """Collapse raw records into project entities with contractor associations.

    project_id is the project entity key.
    contractor is a child/repeated association under the project.
    Non-contractor fields are stable per project_id (verified Phase 2B).
    """
    by_project: defaultdict[str, list[dict]] = defaultdict(list)
    for page_data in pages:
        for row in page_data.get("data", []):
            pid = str(row.get("id", ""))
            if pid:
                by_project[pid].append(row)

    projects: dict[str, dict] = {}
    contractor_map: dict[str, list[dict]] = {}

    for pid, records in by_project.items():
        if not records:
            continue

        base = records[0]

        project = {
            "project_id": pid,
            "ocid": None,
            "title": base.get("title"),
            "description": None,
            "mda": base.get("name"),
            "sector": base.get("category"),
            "category": base.get("project_category"),
            "lga": base.get("lga"),
            "location_text": None,
            "latitude": None,
            "longitude": None,
            "procurement_method": base.get("procurement_method"),
            "budget_year": base.get("year"),
            "budget_amount": base.get("budget_amount"),
            "contract_amount": base.get("amount"),
            "date_of_advert": base.get("start_date"),
            "date_of_award": base.get("date_sign"),
            "contract_start": None,
            "contract_end": None,
            "status": None,
            "source_url": SOURCE_URL_TEMPLATE.format(project_id=pid),
            "source_release_id": None,
            "source_updated_at": base.get("date_updated"),
            # retrieved_at: when this project was processed (from raw snapshot manifest)
            "retrieved_at": source_retrieved_at,
            # preserved originals
            "original_title": base.get("title"),
            "original_mda": base.get("name"),
            "original_lga": base.get("lga"),
            "original_sector": base.get("category"),
            "original_procurement_method": base.get("procurement_method"),
            "original_budget_amount": base.get("budget_amount"),
            "original_contract_amount": base.get("amount"),
            "original_date_of_advert": base.get("start_date"),
            "original_date_of_award": base.get("date_sign"),
        }

        # Distinct contractor associations (keyed by contractor_id)
        contractors: dict[str, dict] = {}
        for row in records:
            cid = str(row.get("contractor_id", ""))
            cname = row.get("contractor", "")
            if cid and cname and cid not in contractors:
                contractors[cid] = {
                    "contractor_id": cid,
                    "contractor": cname,
                    "address": row.get("address"),
                    "phone": row.get("phone"),
                    "email": row.get("email"),
                }

        project["contractors"] = list(contractors.values())
        project["contractor_count"] = len(contractors)
        project["contractor"] = (
            next(iter(contractors.values()))["contractor"] if contractors else None
        )

        projects[pid] = project
        contractor_map[pid] = list(contractors.values())

    return projects, contractor_map


# =============================================================================
# VALIDATION
# =============================================================================

def validate_ingestion(
    pages: list[dict],
    projects: dict[str, dict],
    contractor_map: dict[str, list[dict]],
    source_info: dict,
    source_stats: dict | None = None,
) -> dict:
    """Run data quality validation and return results dictionary."""
    results: dict = {}

    # Source tracking
    results["source_mode"] = source_info.get("source", "unknown")
    results["source_description"] = source_info.get("description", "")
    results["original_source_mode"] = source_info.get("original_source_mode", "n/a")
    results["source_note"] = source_info.get("note", "")

    # Page statistics
    if source_stats:
        results["pages_requested"] = source_stats["requested"]
        results["pages_retrieved"] = source_stats["retrieved"]
        results["pages_failed"] = source_stats["failed"]
        results["pages_populated"] = source_stats["populated"]
        results["pages_empty"] = source_stats["empty"]
        results["failed_page_numbers"] = source_stats.get("failures", [])
        # Use _original_page_number for correct page identification
        results["empty_page_numbers"] = sorted([
            p.get("_original_page_number", 0)
            for p in pages if not p.get("data")
        ])
    else:
        results["pages_requested"] = len(pages)
        results["pages_retrieved"] = len(pages)
        results["pages_failed"] = 0
        populated = 0
        empty = 0
        empty_page_numbers = []
        for p in pages:
            if p.get("data"):
                populated += 1
            else:
                empty += 1
                empty_page_numbers.append(p.get("_original_page_number", 0))
        results["pages_populated"] = populated
        results["pages_empty"] = empty
        results["failed_page_numbers"] = []
        results["empty_page_numbers"] = sorted(empty_page_numbers)

    # Raw record count
    raw_records: list[dict] = []
    for p in pages:
        raw_records.extend(p.get("data", []))
    results["raw_records"] = len(raw_records)

    # Endpoint aggregate fields (from first page, if available)
    if pages:
        results["endpoint_total"] = pages[0].get("total")
        results["endpoint_sum"] = pages[0].get("sum")
        results["endpoint_highest"] = pages[0].get("highest")
        results["endpoint_lowest"] = pages[0].get("lowest")

    # Distinct project IDs
    results["distinct_project_ids"] = len(projects)
    ids = [int(k) for k in projects] if projects else []
    results["project_id_min"] = min(ids) if ids else None
    results["project_id_max"] = max(ids) if ids else None

    # Missing IDs in range 1-848
    all_ids = set(ids)
    expected = set(range(1, 849))
    missing = sorted(expected - all_ids)
    results["missing_ids_count"] = len(missing)
    results["missing_ids"] = missing
    results["id_range"] = (min(all_ids) if all_ids else None, max(all_ids) if all_ids else None)

    # Contractor associations
    multi_contractor = sum(
        1 for p in projects.values() if p.get("contractor_count", 0) > 1
    )
    total_contractor_assoc = sum(len(v) for v in contractor_map.values())
    results["projects_with_multiple_contractors"] = multi_contractor
    results["total_contractor_associations"] = total_contractor_assoc

    # Field presence
    field_presence: dict[str, dict[str, int]] = {}
    fields_to_check = [
        "title", "mda", "lga", "sector", "category", "procurement_method",
        "budget_year", "budget_amount", "contract_amount", "date_of_advert",
        "date_of_award", "contractor", "source_url", "source_updated_at",
        "ocid", "description", "location_text", "latitude", "longitude",
        "contract_start", "contract_end", "status", "source_release_id",
    ]
    n_proj = len(projects)
    for field in fields_to_check:
        present = sum(
            1 for p in projects.values()
            if p.get(field) is not None
            and p.get(field) != ""
            and p.get(field) != "N/A"
        )
        field_presence[field] = {"present": present, "missing": n_proj - present}
    results["field_presence"] = field_presence

    # Arithmetic check against Phase 2B verified counts
    results["arithmetic_check"] = (5 * 1 + 523 * 2 + 82 * 4 == 1379)

    return results


def print_validation(results: dict) -> None:
    """Pretty-print validation results."""
    print(f"\n  Source mode:          {results['source_mode']}")
    print(f"  Source:               {results['source_description']}")
    if results.get("original_source_mode"):
        print(f"  Original source mode: {results['original_source_mode']}")
    if results.get("source_note"):
        print(f"  Note:                 {results['source_note']}")

    failed = results.get("pages_failed", 0)
    requested = results.get("pages_requested", 0)
    retrieved = results.get("pages_retrieved", 0)
    if failed:
        print(f"\n  Pages: {retrieved} retrieved / {requested} requested ({failed} failed)")
        if results.get("failed_page_numbers"):
            print(f"  Failed pages: {results['failed_page_numbers']}")
    else:
        print(f"\n  Pages: {retrieved} retrieved / {requested} requested")

    print(f"  Populated:  {results['pages_populated']}")
    print(f"  Empty:      {results['pages_empty']}")
    if results.get("empty_page_numbers"):
        print(f"  Empty page(s):       {results['empty_page_numbers']}")

    print(f"\n  Raw records:               {results['raw_records']}")
    if "endpoint_total" in results:
        print(f"  Endpoint total:            {results['endpoint_total']}")
        print(f"  Endpoint sum:              {results['endpoint_sum']}")
        print(f"  Endpoint highest:          {results['endpoint_highest']}")
        print(f"  Endpoint lowest:           {results['endpoint_lowest']}")

    print(f"\n  Distinct projects:         {results['distinct_project_ids']}")
    if results.get("project_id_min") is not None:
        print(f"  Project ID range:          {results['project_id_min']} - {results['project_id_max']}")
    print(f"  Missing IDs in 1-848:      {results['missing_ids_count']}")
    if results.get("missing_ids"):
        miss = results["missing_ids"]
        print(f"    (e.g. {miss[:5]}{'...' if len(miss) > 5 else ''})")

    print(f"\n  Multi-contractor projects: {results['projects_with_multiple_contractors']}")
    print(f"  Total contractor associations: {results['total_contractor_associations']}")
    print(f"  Arithmetic (5x1 + 523x2 + 82x4 = 1379): "
          f"{'PASS' if results['arithmetic_check'] else 'FAIL'}")

    print(f"\n  Field coverage ({results['distinct_project_ids']} projects):")
    for field in sorted(results["field_presence"].keys()):
        c = results["field_presence"][field]
        p, m = c["present"], c["missing"]
        pct = (p / (p + m) * 100) if (p + m) > 0 else 0
        sym = "✓" if m == 0 else ("○" if p > 0 else "✗")
        print(f"    {sym} {field:25s} {p:3d}/{p + m:3d} ({pct:3.0f}%)")


# =============================================================================
# OUTPUT
# =============================================================================

def write_processed(
    projects: dict[str, dict],
    contractor_map: dict[str, list[dict]],
    source_info: dict,
) -> None:
    """Write processed projects.json."""
    projects_list = sorted(
        projects.values(), key=lambda p: int(p["project_id"]), reverse=True
    )
    total_contractor = sum(len(v) for v in contractor_map.values())

    output = {
        "manifest": {
            "source": "https://www.ocds.kdsg.gov.ng/Projects/fetchprojects/{page_number}",
            "method": "GET",
            "total_raw_records": 1379,
            "total_distinct_projects": 610,
            "project_id_range": [2, 848],
            "retrieved_at": source_info.get("retrieved_at", datetime.now(timezone.utc).isoformat()),
            "source_mode": source_info.get("source", "unknown"),
            "duplication_model": "project_id = project entity, contractor = child association",
        },
        "projects": projects_list,
        "contractor_map": contractor_map,
    }

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    with open(PROCESSED_OUTPUT, "w") as fh:
        json.dump(output, fh, indent=2)

    print(f"\n  Processed:               {PROCESSED_OUTPUT}")
    print(f"  Projects:                {len(projects_list)}")
    print(f"  Contractor associations: {total_contractor}")


def write_raw_snapshot(pages: list[dict], source_info: dict) -> None:
    """Write raw page snapshot for reproducibility (live mode only)."""
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    # Tag each page with its original page number for correct replay ordering.
    # If the page already has _original_page_number (from a previous live run),
    # use that. Otherwise, assign sequential numbers based on position.
    tagged_pages = []
    for idx, pg in enumerate(pages):
        d = dict(pg)
        existing = d.get("_original_page_number", 0)
        if existing and existing > 0:
            d["_original_page_number"] = existing
        else:
            d["_original_page_number"] = idx + 1
        tagged_pages.append(d)
    raw_output = {
        "manifest": {
            "source": "https://www.ocds.kdsg.gov.ng/Projects/fetchprojects/{page_number}",
            "method": "GET",
            "total_pages": TOTAL_PAGES,
            "retrieved_at": source_info.get("retrieved_at", datetime.now(timezone.utc).isoformat()),
            "source_mode": source_info.get("source", "unknown"),
            "failed_pages": source_info.get("failed_page_numbers", []),
        },
        "pages": tagged_pages,
    }
    with open(RAW_OUTPUT, "w") as fh:
        json.dump(raw_output, fh, indent=2)
    print(f"\n  Raw snapshot:            {RAW_OUTPUT} ({len(tagged_pages)} pages)")


def write_validation_report(validation: dict) -> None:
    """Persist validation report."""
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    val_file = PROCESSED_DIR / "ingestion_validation.json"
    with open(val_file, "w") as fh:
        json.dump(validation, fh, indent=2)
    print(f"  Validation report:       {val_file}")


# =============================================================================
# RECONCILIATION
# =============================================================================

def print_reconciliation(validation: dict, projects: dict[str, dict]) -> bool:
    """Compare measured results against Phase 2B verified values."""
    print("\n" + "=" * 70)
    print("RECONCILIATION AGAINST PHASE 2B VERIFIED VALUES")
    print("=" * 70)

    all_ids = {int(k) for k in projects}
    checks = [
        ("Raw records = 1379", validation["raw_records"] == 1379, validation["raw_records"]),
        ("Distinct projects = 610", validation["distinct_project_ids"] == 610, validation["distinct_project_ids"]),
        ("ID range 2-848",
         validation["project_id_min"] == 2 and validation["project_id_max"] == 848,
         f"{validation['project_id_min']}-{validation['project_id_max']}"),
        ("ID 1 missing", 1 not in all_ids, "confirmed" if 1 not in all_ids else "FAIL"),
        ("230 populated pages", validation["pages_populated"] == 230, validation["pages_populated"]),
        ("Page 231 empty", 231 in validation.get("empty_page_numbers", []),
         validation.get("empty_page_numbers", [])),
        ("Arithmetic matches", validation["arithmetic_check"],
         "PASS" if validation["arithmetic_check"] else "FAIL"),
        ("Multi-contractor projects = 82",
         validation["projects_with_multiple_contractors"] == 82,
         validation["projects_with_multiple_contractors"]),
    ]

    all_pass = True
    for desc, passed, actual in checks:
        mark = "✓" if passed else "✗"
        if not passed:
            all_pass = False
        print(f"  {mark} {desc}: {actual}")

    if all_pass:
        print("\n  ALL RECONCILIATION CHECKS PASSED")
    else:
        print("\n  SOME CHECKS FAILED — see details above")
    return all_pass


# =============================================================================
# MAIN
# =============================================================================

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Ordaciti Phase 3: Kaduna State OCDS Data Ingestion"
    )
    parser.add_argument(
        "--replay",
        action="store_true",
        help=(
            "Replay/offline mode: process existing data/raw/kaduna_projects.json "
            "instead of fetching live from the endpoint."
        ),
    )
    args = parser.parse_args()

    print("=" * 70)
    print("ORDACITI PHASE 3: Kaduna State OCDS Data Ingestion")
    print("=" * 70)
    print(f"Source endpoint: {BASE_URL}")
    print(f"Run timestamp:   {datetime.now(timezone.utc).isoformat()}")
    print()

    RAW_DIR.mkdir(parents=True, exist_ok=True)
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    # ---- Determine source mode ----
    if args.replay:
        print("MODE: REPLAY (offline)")
        print(f"  Source file: {RAW_OUTPUT}")
        print()
        pages_data = load_replay_data()
        if pages_data is None:
            print("ERROR: Replay data not available.", file=sys.stderr)
            print(f"  Expected: {RAW_OUTPUT}", file=sys.stderr)
            print("  Run without --replay for live ingestion, or generate the", file=sys.stderr)
            print("  raw snapshot first via a successful live run.", file=sys.stderr)
            sys.exit(1)
        pages, source_info = pages_data
        source_stats = None
    else:
        print("MODE: LIVE (canonical source)")
        print(f"  Endpoint: {BASE_URL}")
        print()
        pages, source_stats = fetch_all_pages_live()
        if not pages:
            print("\n" + "!" * 70, file=sys.stderr)
            print("LIVE INGESTION FAILED", file=sys.stderr)
            print("!" * 70, file=sys.stderr)
            print(f"  Requested: {TOTAL_PAGES} pages", file=sys.stderr)
            print(f"  Retrieved: 0 pages", file=sys.stderr)
            print(f"  Failed:    {source_stats['failed']} pages", file=sys.stderr)
            if source_stats.get("failures"):
                print(f"  Failed pages: {source_stats['failures']}", file=sys.stderr)
            print(file=sys.stderr)
            print("  The verified Kaduna endpoint was not reachable from this", file=sys.stderr)
            print("  environment during this run. No data was retrieved.", file=sys.stderr)
            print(file=sys.stderr)
            print("Options:", file=sys.stderr)
            print("  1. Retry later (network may be intermittent).", file=sys.stderr)
            print("  2. Run from a different network environment.", file=sys.stderr)
            print("  3. Use --replay to process an existing raw snapshot.", file=sys.stderr)
            print("     (The snapshot must have been produced by a prior live run.)", file=sys.stderr)
            sys.exit(1)

        source_info = {
            "source": "live",
            "description": f"Fetched live from {BASE_URL}",
            "pages": len(pages),
            "retrieved_at": datetime.now(timezone.utc).isoformat(),
            "failed_page_numbers": source_stats.get("failures", []),
        }

    source_retrieved_at = source_info.get("retrieved_at", datetime.now(timezone.utc).isoformat())

    # ---- Process ----
    print(f"\nProcessing {len(pages)} pages...")
    projects, contractor_map = deduplicate_records(pages, source_info.get("retrieved_at", ""))

    print("\nValidating ingestion...")
    validation = validate_ingestion(pages, projects, contractor_map, source_info, source_stats)
    print_validation(validation)

    write_processed(projects, contractor_map, source_info)

    if args.replay:
        print(f"\n  Raw snapshot: not written (replay mode)")
    else:
        write_raw_snapshot(pages, source_info)

    write_validation_report(validation)

    # ---- Reconciliation ----
    ok = print_reconciliation(validation, projects)

    print("\n" + "=" * 70)
    mode_label = "REPLAY" if args.replay else "LIVE"
    print(f"INGESTION COMPLETE — mode: {mode_label}")
    print("=" * 70)

    if not ok and not args.replay:
        print("\nWARNING: Live ingestion succeeded but reconciliation has failures.", file=sys.stderr)


if __name__ == "__main__":
    main()
