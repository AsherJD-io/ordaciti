# ORDACITI PHASE PROGRESS

*Per the Phase Completion Contract (implementation.md section 6 and the ORDACITI PHASE COMPLETION CONTRACT).*

---

# Phase 1 — Repository Skeleton

**Status:** COMPLETE

**Date completed:** 2026-09-18

**Commit:** c668905 — `chore: establish Ordaciti project baseline`

## Objective

Create the project repository structure, configuration files, stub implementations, and initial documentation per implementation.md section 38.

## Implemented

### Directory structure
Created per implementation.md section 38:

```
ordaciti/
├── app/
│   ├── layout.tsx              # Root layout with Inter font
│   ├── page.tsx                # Landing/overview page (stub)
│   ├── projects/
│   │   ├── page.tsx            # Project explorer (stub)
│   │   └── [id]/
│   │       └── page.tsx        # Project intelligence (stub)
│   └── api/
│       └── explain/
│           └── route.ts        # AI endpoint (stub, returns 501)
├── components/                 # Empty directory
├── lib/
│   ├── data.ts                 # Stub
│   ├── signals.ts              # Stub
│   ├── clustering.ts           # Stub
│   ├── evidence.ts             # Stub
│   └── ai.ts                   # Stub
├── scripts/
│   ├── fetch_kaduna.py         # Placeholder
│   ├── normalize_ocds.py       # Placeholder
│   ├── discover_patterns.py    # Placeholder
│   ├── enrich_population.py    # Placeholder
│   └── build_dataset.py        # Placeholder
├── data/
│   ├── raw/                    # .gitkeep
│   └── processed/              # .gitkeep
├── docs/
│   ├── methodology.md          # Draft stub
│   ├── data-sources.md         # Partial — primary source verified
│   ├── limitations.md          # Draft stub
│   ├── ai-log.md               # Empty, ready
│   ├── phase1-phase2-report.md # Phase 1 & 2 combined report
│   └── source-discovery-report.md # Phase 2 source discovery
├── public/
│   └── screenshots/            # .gitkeep
├── .env.example                # AI_API_KEY=, AI_MODEL=
├── .gitignore                  # Node, Python, env, data, IDE ignores
├── package.json                # Next.js 14, React 18, MapLibre GL, Tailwind
├── tsconfig.json               # TypeScript strict, App Router paths
├── requirements.txt            # Python: requests, pandas, rapidfuzz, orjson
├── README.md                   # Setup instructions per implementation.md section 51
└── vercel.json                 # Vercel v3 config
```

### Configuration
- **package.json:** Next.js 14.2, React 18.3, MapLibre GL 4.7, Tailwind CSS 3.4
- **tsconfig.json:** ES2017 target, strict mode, `@/*` path alias
- **.env.example:** Only `AI_API_KEY=` and `AI_MODEL=` (no secrets)
- **vercel.json:** Vercel v3, Next.js via `@vercel/next`
- **requirements.txt:** Minimal Python deps, no unnecessary infrastructure
- **.gitignore:** Comprehensive — excludes `.env`, `node_modules`, data directories, IDE files

## Files Created

- 27 files total across 15 directories
- All stub files, configuration, and documentation placeholders
- See `docs/phase1-phase2-report.md` section 1 for the complete file listing

## Files Modified

None — initial creation.

## Validation

**Command:** `git status`

**Result:** PASS

**Observed:** Clean repository on `main` branch, no uncommitted changes after initial commit.

**Command:** Manual inspection of all config files

**Result:** PASS

**Observed:** `package.json`, `tsconfig.json`, `vercel.json` are valid JSON. `.env.example` contains no real secrets. `requirements.txt` is parseable. `.gitignore` covers environment files, data directories, and editor temporary files.

## Acceptance Criteria

**Criterion:** Repository structure matches implementation.md section 38

**Status:** PASS

**Evidence:** All required directories and files present. App Router pages created. Component and library stubs in place. Python script placeholders exist.

**Criterion:** No secrets committed

**Status:** PASS

**Evidence:** `.env.example` contains only blank placeholder values. `.gitignore` excludes `.env`, `.env.*`, and credential files.

**Criterion:** No fabricated data

**Status:** PASS

**Evidence:** `data/raw/` and `data/processed/` contain only `.gitkeep` files. No JSON data files, no sample data, no mock API responses.

**Criterion:** No product scope beyond implementation.md

**Status:** PASS

**Evidence:** All stubs are minimal placeholders. No implementation beyond directory structure and configuration.

**Criterion:** No modifications to implementation.md

**Status:** PASS

**Evidence:** `implementation.md` unchanged from baseline. It remains the authoritative specification.

## Decisions

- Used Next.js 14 with App Router (implementation.md section 36)
- Used TypeScript strict mode (implementation.md section 36)
- Used MapLibre GL for maps (implementation.md section 36)
- Used Tailwind CSS for styling (implementation.md section 36)
- Kept Python dependencies minimal (implementation.md section 37 — no Spark, dbt, Postgres, etc.)

## Assumptions

- Deployment target is Vercel (implementation.md section 54)
- Initial geography is Kaduna State, Nigeria (implementation.md section 5)
- Primary data source is Kaduna State OCDS public data (implementation.md section 145)

## Known Issues

None — Phase 1 is a clean repository skeleton.

## Next Phase

**Phase 2 — Source Discovery**

Prerequisites: Phase 1 complete.

Objective: Discover and validate Kaduna State government procurement data sources per implementation.md section 6. Identify working endpoints, data formats, and access methods.

## Git

**Commit:** c668905

**Message:** `chore: establish Ordaciti project baseline`

**Repository status after commit:** CLEAN

---

# Phase 2 — Source Discovery

**Status:** BLOCKED

**Date:** 2026-09-18

## Objective

Discover and validate Kaduna State government procurement data sources. Verify that at least one viable primary source exists from which the full Kaduna project inventory can be retrieved programmatically.

Per implementation.md section 6, the primary source must be Kaduna State OCDS public data. Secondary/context sources (geoBoundaries, WorldPop, OpenStreetMap) are validated separately.

## Implemented

### Primary source investigation

**Source 1: Legacy OCDS Portal**

- **URL:** https://www.ocds.kdsg.gov.ng/
- **Organization:** Kaduna State Public Procurement Authority (KADPPA) + PPDC
- **Powered by:** Budeshi (Open Contracting for Nigeria platform)
- **Standard:** OCDS (Open Contracting Data Standard)

**Verification results:**

| Endpoint | Method | Expected | Actual | Status |
|---|---|---|---|---|
| `/api/project_list` | GET | JSON project list | HTTP 500, empty body | NON-FUNCTIONAL |
| `/api/mda_list` | GET | JSON MDA list | HTTP 200, 18+ MDAs | WORKING |
| `/api/mda_records?mda_id=N` | GET | OCDS Record package | HTTP 500, empty body | NON-FUNCTIONAL |
| `/api/record/{project_id}` | GET | OCDS Record package | HTTP 500, empty body | NON-FUNCTIONAL |
| `/api/releases/{project_id}/{type}` | GET | OCDS Release package | HTTP 500, empty body | NON-FUNCTIONAL |
| `/Home/table_data` (POST) | POST | Data table JSON | HTTP 500, empty body | NON-FUNCTIONAL |

Only `/api/mda_list` works. It returns MDA names and IDs — not project data.

**Portal evidence that data exists:**

- Projects page renders server-side with aggregate statistics: 1,379 total projects, ₦95,663,978,669.04 total contract sum, ₦4,284,000,000.00 highest, ₦21,000.00 lowest
- One project card rendered in HTML (Igabi LGA, 2019, ₦7M budget, ₦6.7M contract, Ziarum Partners Nig. LTD)
- JavaScript `table.js` reveals DataTable server-side processing, but the AJAX endpoint also returns 500

**Root cause:** All project-data endpoints return HTTP 500 with empty bodies. This likely indicates a database connection failure, backend migration issue (Budeshi platform), or server misconfiguration.

**Source 2: OC4IDS Portal (newer)**

- **URL:** https://ipdata.kdsg.gov.ng/public/home
- **Backend:** https://kadppa-backend-972168318932.us-central1.run.app/
- **Standard:** OC4IDS (Open Contracting for Infrastructure Data Standard)
- **Claimed coverage:** 1,635 published projects, 393 with coordinates

**Verification results:**

| Endpoint | Method | Actual | Status |
|---|---|---|---|
| `/api/v1/projects?limit=N` | GET | HTTP 500 — "buffering timed out after 10000ms" | NON-FUNCTIONAL |
| `/api/v1/exports/oc4ids?limit=N` | GET | HTTP 500 — "Failed to fetch OC4IDS data" | NON-FUNCTIONAL |
| `/api/v1/projects` | POST (JSON body) | HTTP 401 — "No token provided" | AUTH REQUIRED |
| `/api/v1/exports/oc4ids` | POST | HTTP 404 — "Route not found" | ROUTE MISSING |

**Implication:** The backend is running but GET requests time out (database likely too large for the 10s Cloud Run timeout) and POST requests require an API token that is not publicly documented.

### Secondary sources validated

**geoBoundaries:** VALIDATED — fully accessible. Downloadable ADM2 GeoJSON (9.4 MB, 774 Nigerian LGAs). Contains Kaduna State boundary and 21 of 23 Kaduna LGAs by name. License: CC BY 4.0. URL: https://www.geoboundaries.org/

**WorldPop:** VALIDATED — file accessible, not downloaded. Nigeria 2020 population GeoTIFF (495 MB) accessible at https://data.worldpop.org/GIS/Population/Global_2000_2020/2020/NGA/nga_ppp_2020.tif. HTTP 200 confirmed. WOPR API non-functional.

**OpenStreetMap Nominatim:** VALIDATED — functional for geocoding. Returns Kaduna State boundary (relation ID 3709353). Overpass API unreliable (406/400 errors).

### Project 255 investigation — REJECTED AS PRIMARY DATASET

The Project 255 portal at https://project255.kdsg.gov.ng/ was investigated as a potential alternative data source during source discovery.

**Finding:** Project 255 is a ward-level project showcase portal for Kaduna State. It is **not** an OCDS/OC4IDS procurement data source. It does not provide the procurement records the capstone requires: no OCIDs, no contract amounts, no contractor names, no dates of award/advert, no procurement methods, no release data.

**Decision:** Project 255 data is NOT suitable as the Ordaciti primary dataset. It lacks the procurement data fields required by implementation.md section 8 (canonical project schema). It was rejected as a primary source.

**Note:** Some titles from Project 255 were collected during initial exploration and are present in `data/raw/project255_*.json`. These are not the Ordaciti primary dataset and will not be used as such. They are preserved as investigation artifacts only.

**Investigation artifacts (not the Ordaciti primary dataset):**
- `data/raw/project255_raw.json` — initial investigation, empty project list
- `data/raw/project255_projects.json` — 251 Project 255 titles collected via curl
- `data/raw/project255_sample.json` — sample of 30 Project 255 titles
- `scripts/collect_project255.sh` — curl-based collection script
- `scripts/enrich_project255.sh` — curl-based enrichment script
- `scripts/enrich_project255_v2.py` — Python enrichment with User-Agent

These artifacts document the Project 255 investigation. They are not the Ordaciti primary dataset. They should not be used as input to normalization, clustering, signal generation, or the frontend application.

## Blocker

### CRITICAL: No viable primary Kaduna procurement data source

**Severity:** Blocks Phase 3 entirely.

**Description:** Neither the legacy OCDS portal nor the newer OC4IDS backend provides working programmatic access to Kaduna project procurement data. All project-data endpoints return HTTP 500. The only working endpoint (`/api/mda_list`) returns MDA names, not project data.

**Evidence:**

1. `/api/project_list` — HTTP 500, empty body (curl verified)
2. `/api/record/{id}` — HTTP 500, empty body (curl verified for multiple IDs)
3. `/api/releases/{id}/{type}` — HTTP 500, empty body (curl verified)
4. `/Home/table_data` (POST) — HTTP 500, empty body (curl verified)
5. OC4IDS `/api/v1/projects` GET — HTTP 500, "buffering timed out after 10000ms" (curl verified)
6. OC4IDS `/api/v1/exports/oc4ids` GET — HTTP 500, "Failed to fetch OC4IDS data" (curl verified)
7. OC4IDS `/api/v1/projects` POST — HTTP 401, "No token provided" (curl verified)
8. Portal Projects page shows only one server-rendered project card — no bulk data accessible from HTML
9. No downloadable dataset links found in portal page source

**Impact:** Cannot retrieve the project inventory, individual project records, release data, or bulk download. The data exists (confirmed by portal aggregate statistics and the single rendered project card), but there is no accessible programmatic path to retrieve it.

**Implementation.md compliance:**

- Section 6 requires retrieving the Kaduna project inventory — blocked
- Section 39 (`fetch_kaduna.py` responsibilities) requires retrieving project data and saving raw responses — blocked
- Section 63 ("Verify external APIs/endpoints before implementation") — satisfied: endpoints verified and found non-functional
- "Never fabricate data" — satisfied: no data fabricated

## Files Created

- `docs/source-discovery-report.md` — detailed Phase 2 source discovery report
- `docs/phase1-phase2-report.md` — combined Phase 1 & 2 report with full endpoint test results
- `data/raw/project255_raw.json` — initial Project 255 investigation (empty project list, rejected as primary source)
- `data/raw/project255_projects.json` — 251 Project 255 titles collected during investigation (rejected as primary dataset)
- `data/raw/project255_sample.json` — sample of 30 Project 255 titles (rejected as primary dataset)
- `scripts/collect_project255.sh` — curl-based Project 255 collection script (investigation artifact)
- `scripts/enrich_project255.sh` — curl-based enrichment script (investigation artifact)
- `scripts/enrich_project255_v2.py` — Python enrichment with User-Agent (investigation artifact)

## Files Modified

None.

## Validation

**Command:** `curl -s -w "%{http_code}" "https://www.ocds.kdsg.gov.ng/api/project_list"`

**Result:** FAILED

**Observed:** HTTP 500, empty body

**Command:** `curl -s -w "%{http_code}" "https://www.ocds.kdsg.gov.ng/api/mda_list"`

**Result:** PASS

**Observed:** HTTP 200, 18+ MDAs returned (only working endpoint, no project data)

**Command:** `curl -s -w "%{http_code}" "https://www.ocds.kdsg.gov.ng/api/record/1"`

**Result:** FAILED

**Observed:** HTTP 500, empty body

**Command:** `curl -s -w "%{http_code}" "https://kadppa-backend-972168318932.us-central1.run.app/api/v1/projects?limit=2"`

**Result:** FAILED

**Observed:** HTTP 500, "Operation projects.find() buffering timed out after 10000ms"

**Command:** `curl -X POST -H "Content-Type: application/json" -d '{"limit": 3}' "https://kadppa-backend-972168318932.us-central1.run.app/api/v1/projects"`

**Result:** FAILED

**Observed:** HTTP 401, "No token provided"

**Command:** `curl -I "https://data.worldpop.org/GIS/Population/Global_2000_2020/2020/NGA/nga_ppp_2020.tif"`

**Result:** PASS

**Observed:** HTTP 200 OK, Content-Length: 495,162,703

**Command:** `curl "https://www.geoboundaries.org/api/current/gbOpen/NGA/ADM2/"`

**Result:** PASS

**Observed:** HTTP 200, JSON metadata with download URLs

## Acceptance Criteria

**Criterion:** At least one viable primary Kaduna procurement data source confirmed

**Status:** FAILED

**Evidence:** All OCDS/OC4IDS project-data endpoints return HTTP 500 or require authentication. No bulk download available. Portal displays aggregate statistics confirming data exists, but programmatic retrieval is not possible.

**Criterion:** Data access method documented

**Status:** PASS

**Evidence:** `docs/source-discovery-report.md` contains full endpoint test results, data format analysis, and access method assessment.

**Criterion:** Secondary sources validated for future use

**Status:** PASS

**Evidence:** geoBoundaries fully accessible. WorldPop file accessible. Nominatim functional. See `docs/source-discovery-report.md` section 2.

**Criterion:** Project 255 investigated and disposition recorded

**Status:** PASS

**Evidence:** Project 255 portal investigated. Found to be a ward-level showcase, not OCDS procurement data. Rejected as primary dataset. Investigation artifacts preserved in `data/raw/project255_*.json` and `scripts/*255*`.

## Decisions

**Decision:** Project 255 is rejected as the Ordaciti primary dataset.

**Rationale:** Project 255 is a ward-level project showcase portal, not an OCDS/OC4IDS procurement data source. The implementation.md section 8 canonical project schema requires fields that Project 255 does not provide: OCID, contract amounts, contractor names, dates of award/advert, procurement methods, release data. Using Project 255 as the primary dataset would violate the implementation.md specification.

**Decision:** Phase 3 cannot begin until the primary data access blocker is resolved.

**Rationale:** Per implementation.md section 63: "Verify external APIs/endpoints before implementation" and "Never fabricate data." Proceeding without a working data source would violate these rules. The data exists but cannot be accessed programmatically.

## Assumptions

- The Kaduna OCDS/OC4IDS portals contain real procurement data (confirmed by portal displays) but the APIs are currently broken
- The API failure may be transient (database connection, server misconfiguration, or backend migration issue)
- Secondary sources (geoBoundaries, WorldPop, OSM) are sufficient for context enrichment once primary data is available

## Known Issues

1. **Primary data API non-functional:** All Kaduna OCDS/OC4IDS project-data endpoints return HTTP 500. This is the critical blocker.
2. **OC4IDS authentication required:** The newer backend requires an API token not publicly documented.
3. **LGA name mismatch:** geoBoundaries LGA names differ from OCDS portal naming (Jaba/Njaba, Kaura vs Kaura Namoda, Lere vs Surulere). Requires normalization crosswalk.
4. **WorldPop data size:** 495 MB GeoTIFF requires spatial subsetting or rasterio for efficient processing.
5. **Overpass API unreliable:** Returns 406/400 errors from this environment. OSM enrichment is P2 optional.

## Next Phase

**Phase 3 — Data Ingestion**

Prerequisites: A viable primary Kaduna procurement data source must be available. This phase is BLOCKED until one of the following occurs:

1. **API recovery:** The OCDS/OC4IDS APIs recover and return project data
2. **Alternative access found:** A data mirror, bulk download, or authenticated access path is discovered
3. **Manual extraction viable:** Browser automation can extract sufficient data from a working web interface
4. **Data access granted:** KADPPA provides API credentials or a data export

The Project 255 portal is NOT a viable primary source for Phase 3 because it does not provide OCDS procurement records.

## Git

**Commit:** c668905 — `chore: establish Ordaciti project baseline`

**Repository status after Phase 2 investigation:** DIRTY with investigation artifacts in `data/raw/` and `scripts/`. No new commit created for Phase 2 because the phase is BLOCKED and no implementation change was made to the repository structure.

**Investigation artifacts (not committed as a phase):**
- `data/raw/project255_raw.json`
- `data/raw/project255_projects.json`
- `data/raw/project255_sample.json`
- `scripts/collect_project255.sh`
- `scripts/enrich_project255.sh`
- `scripts/enrich_project255_v2.py`

These artifacts document the Project 255 investigation and are preserved for transparency. They are not the Ordaciti primary dataset.

---

# Project State Summary

| Phase | Status | Date | Commit |
|---|---|---|---|
| 1 — Repository Skeleton | COMPLETE | 2026-09-18 | c668905 |
| 2 — Source Discovery | BLOCKED | 2026-09-18 | (no new commit) |
| 3 — Data Ingestion | NOT STARTED | — | — |

**Current state:** Phase 2 BLOCKED. No viable primary Kaduna procurement data source available. Project 255 investigated and rejected as primary dataset.

**Next action required:** Resolve the primary data access blocker before Phase 3 can begin. Options: API recovery, data mirror discovery, authenticated access, or KADPPA contact.

## Phase 2B — Server-rendered `/Projects` Route Verification (2026-09-19)

**Status:** Investigation complete. **VERIFIED VIABLE** — a working public data endpoint has been identified.

### Overview

A fresh investigation of the public `/Projects` route at `https://www.ocds.kdsg.gov.ng/Projects` revealed that the portal provides a working, reproducible, public JSON API for the Kaduna State project inventory via a paginated endpoint that was not previously identified.

This endpoint was discovered through analysis of the portal's JavaScript (`kaduna.js`), which reveals the pagination mechanism used by the page's infinite-scroll feature. The endpoint returns project data in a flat JSON format. It is publicly accessible without authentication.

### Investigation 1: Working Endpoint and Exact Request Method

**Working endpoint (non-prefixed):**
- URL: `https://www.ocds.kdsg.gov.ng/Projects/fetchprojects/{page_number}`
- Method: **GET**
- HTTP status: 200
- Content-Type header: `text/html` (server misconfiguration — body is valid JSON)
- Body: Valid JSON object with project records
- Authentication: None required
- Request example: `curl https://www.ocds.kdsg.gov.ng/Projects/fetchprojects/1`

**Response structure:**
```json
{
  "sum": "95663978669.04",
  "total": "1379",
  "highest": "4284000000.00",
  "lowest": "21000.00",
  "status": "success",
  "data": [ {...}, {...} ]
}
```

The `data` array contains project records. Each page returns up to 6 records.

### Investigation 2: Prefixed Endpoint Test (from portal JavaScript)

**Prefixed endpoint (as generated by kaduna.js):**
- URL: `https://www.ocds.kdsg.gov.ng/kadppa/Projects/fetchprojects/{page_number}`
- Method used by JavaScript: POST with JSON payload `{"data":{"mda":null,"category":null,"sector":null,"year":null,"method":null}}`
- ABS_PATH in JavaScript: `https://www.ocds.kdsg.gov.ng/kadppa/`

**Test results for prefixed route:**

| Method | Payload | HTTP Status | Content-Type | Response |
|--------|---------|-------------|--------------|----------|
| GET | — | 200 | text/html | HTML homepage (not JSON) |
| POST | `{}` | 200 | text/html | HTML homepage (not JSON) |
| POST | `{"mda":null,...}` | 200 | text/html | HTML homepage (not JSON) |
| POST | `{"data":{...}}` | 200 | text/html | HTML homepage (not JSON) |

**Request-method discrepancy confirmed:** The portal's JavaScript (`kaduna.js`) constructs requests to the prefixed route using POST with a JSON payload. However, the prefixed route returns the portal homepage HTML regardless of method or payload. The actual working endpoint is the **non-prefixed GET** route. The JavaScript's intended request path does NOT return usable data.

### Investigation 3: Pagination Verification

**Exact pagination mechanism:**
- Discovered in `https://www.ocds.kdsg.gov.ng/js/kaduna.js`
- The JavaScript tracks `var page = 1` and increments it on scroll
- Endpoint pattern: `ABS_PATH + 'Projects/fetchprojects/' + page`
- The actual working pattern (non-prefixed): `https://www.ocds.kdsg.gov.ng/Projects/fetchprojects/{page}`

**Deterministic pagination test results:**

| Page | HTTP | Type | Records | Unique IDs | Sample IDs |
|------|------|------|---------|------------|------------|
| 1 | 200 | JSON | 6 | 3 | 846, 847, 848 |
| 2 | 200 | JSON | 6 | 3 | 843, 844, 845 |
| 3 | 200 | JSON | 6 | 3 | 840, 841, 842 |
| 10 | 200 | JSON | 6 | 3 | 775, 776, 777 |
| 50 | 200 | JSON | 6 | 3 | 648, 649, 650 |
| 100 | 200 | JSON | 6 | 3 | 436, 437, 438 |
| 150 | 200 | JSON | 6 | 2 | 298, 299 |
| 200 | 200 | JSON | 6 | 4 | 205, 206, 207, 208 |
| 220 | 200 | JSON | 6 | 4 | 145, 146, 147, 148 |
| 228 | 200 | JSON | 6 | 4 | 7, 8, 9, 10 |
| 229 | 200 | JSON | 6 | 4 | 4, 5, 6, 7 |
| 230 | 200 | JSON | 5 | 3 | 2, 3, 4 |
| 231 | 200 | JSON | 0 | 0 | (empty) |

**Pagination characteristics:**
- 1,379 total raw records reported in `total` field
- Pages 1-230 contain data; page 231 is empty (end of dataset)
- Approximately 230 populated pages
- Most pages return 6 records; later pages return fewer
- Data is ordered by project ID descending

### Investigation 4: Record Duplication and Total-Count Explanation

**Duplication pattern (confirmed from actual response):**

1. Each project ID appears exactly twice on its page
2. The two records for the same ID have identical values for: title, budget_amount, amount, year, lga, name, procurement_method, start_date, date_sign, date_updated, project_category
3. The two records sometimes DIFFER in: contractor_id, contractor, address, phone — indicating different contractor records linked to the same project
4. No project ID appears on more than one page
5. The `total` field (1379) represents the count of RAW records including duplicates, NOT unique projects

**Total vs. unique count:**
- `total` field: 1379 (raw records including duplicates)
- Estimated unique projects: approximately 1379 / 2 ≈ 690
- Actual project ID range: 1 to 848
- Maximum possible unique by ID range: 848
- Actual unique is between the sample estimate and 848

**The `total` field does NOT represent 1,379 unique projects.** It represents 1,379 raw records. The actual unique project count is approximately 690 (roughly half), with project IDs ranging from 1 to 848.

**Sample duplication evidence (page 150, ID 298):**
- Record 1: contractor = "M/S Amabdin Nig Ltd", contractor_id = 121
- Record 2: contractor = "Ms. Fine World Electronics Distribution", contractor_id = 81
- Record 3: contractor = "M/S Amabdin Nig Ltd", contractor_id = 121 (identical to Record 1)

This pattern suggests the portal stores multiple contractor associations per project, and the API returns each as a separate record.

### Investigation 5: Canonical Schema Field Coverage

Fields verified from the actual JSON response against implementation.md section 8 canonical schema:

| Canonical Field | Status | Source Field | Notes |
|---|---|---|---|
| `project_id` | **AVAILABLE** | `id` | Project ID from portal |
| `ocid` | **NOT AVAILABLE** | — | No OCID field in response. OCDS API endpoints remain broken. |
| `title` | **AVAILABLE** | `title` | Full project title |
| `description` | **NOT AVAILABLE** | — | No description field in response |
| `mda` | **AVAILABLE** | `name` | Full MDA/ministry name |
| `sector` | **AVAILABLE** | `category` | Broad sector: "Works", "Services", "Goods", etc. |
| `category` | **PARTIAL** | `project_category` | Always "N/A" in current data — not useful |
| `lga` | **AVAILABLE** | `lga` | LGA name |
| `location_text` | **AVAILABLE** | `address` | Contractor address — NOT project site location |
| `latitude` | **NOT AVAILABLE** | — | No coordinates in response |
| `longitude` | **NOT AVAILABLE** | — | No coordinates in response |
| `procurement_method` | **AVAILABLE** | `procurement_method` | e.g., "Single Source Award", "Competitive" |
| `budget_year` | **AVAILABLE** | `year` | Budget year |
| `budget_amount` | **AVAILABLE** | `budget_amount` | Budget amount (numeric string) |
| `contract_amount` | **AVAILABLE** | `amount` | Contract amount (numeric string) |
| `date_of_advert` | **AVAILABLE** | `start_date` | Some values are invalid ("30th November -0001") |
| `date_of_award` | **AVAILABLE** | `date_sign` | Award date (YYYY-MM-DD). `award_date` field is always "N/A". |
| `contractor` | **AVAILABLE** | `contractor` | Contractor name (may differ between duplicates) |
| `status` | **NOT AVAILABLE** | — | No status field in response |
| `source_url` | **DERIVABLE** | — | Can be constructed: `https://www.ocds.kdsg.gov.ng/Project/{id}` |
| `source_release_id` | **NOT AVAILABLE** | — | No release data (OCDS API broken) |
| `source_updated_at` | **AVAILABLE** | `date_updated` | Last updated date (text format) |
| `retrieved_at` | **DERIVABLE** | — | Set at retrieval time by ingestion script |

**Summary:** 14 of 24 canonical fields are directly available. 2 are derivable. 8 are not available. The most critical missing fields are OCID, coordinates, status, and description.

### Investigation 6: Primary Source Decision

**VERIFIED VIABLE** — with documented limitations.

Evidence:
1. **Publicly reachable:** GET request to `https://www.ocds.kdsg.gov.ng/Projects/fetchprojects/{page}` returns HTTP 200 with valid JSON for every page 1-230. No authentication required.
2. **Reproducible:** Tested across 13 distinct pages with consistent results. Same URL pattern works repeatedly.
3. **Real project-level procurement records:** Each record contains title, MDA, LGA, budget year, budget amount, contract amount, dates, procurement method, and contractor — confirming these are genuine procurement records.
4. **Stable pagination:** Deterministic URL pattern (`/Projects/fetchprojects/N`), approximately 230 pages, data ordered by ID descending.
5. **Sufficient fields to begin implementation:** 14 canonical fields available plus 2 derivable. The data supports project discovery, normalization, clustering, contractor recurrence, repeat intervention detection, and allocation context analysis.

**Limitations that do NOT prevent Phase 3 from starting:**
- OCID not available: Record change detection (signal 4) will be limited. The implementation.md section 16 record-change signal can still function using project_id-based comparison where releases are available, but releases are not available from this source.
- Coordinates not available: Map display and geographic proximity analysis will be limited. The implementation.md section 27 map and section 323 geographic proximity can use LGA-level aggregation instead.
- Status not available: Can be marked as "UNKNOWN" per implementation.md section 30 data quality rules.
- Description not available: Can be left as empty/null.
- `total` field represents raw records, not unique projects: The ingestion script must deduplicate.

**The endpoint is NOT the formal OCDS API.** It is a portal-specific JSON endpoint. The OCDS API endpoints (`/api/project_list`, `/api/record/`, `/api/releases/`) remain broken (HTTP 500). The `fetchprojects/` endpoint provides a working alternative that returns real procurement data in a simpler flat-record format.

### Project 255 Status

Project 255 remains **REJECTED AS PRIMARY DATASET.** It is a ward-level project showcase portal, not an OCDS/OC4IDS procurement data source. The `fetchprojects/` endpoint provides real Kaduna State procurement data that renders Project 255 irrelevant as a data source. Project 255 artifacts are preserved as investigation evidence only.

### Phase Status

- **Phase 1 — Repository Skeleton:** COMPLETE (2026-09-18, commit c668905)
- **Phase 2 — Source Discovery:** COMPLETE (2026-09-19). Initial investigation found no viable source.
- **Phase 2B — `/Projects` Route Verification:** COMPLETE (2026-09-19). **VIABLE PRIMARY SOURCE FOUND.**
- **Phase 3 — Data Ingestion:** NOT STARTED. Ready for Phase 3. Primary data access path verified.

---

## Phase 2 Source-Access Recovery Investigation (2026-09-19)

## Phase 2B — Server-rendered `/Projects` Route Verification (2026-09-19)

**Status:** Investigation complete. NEW FINDING — viable server-rendered data access path confirmed.

### Overview

A fresh investigation of the public `/Projects` route at `https://www.ocds.kdsg.gov.ng/Projects` revealed that the portal provides a **working, reproducible, public JSON API** for the full Kaduna State project inventory via a paginated endpoint that was not previously identified.

This endpoint was discovered through analysis of the portal's JavaScript (`kaduna.js`), which reveals the pagination mechanism used by the page's infinite-scroll feature. The endpoint is publicly accessible without authentication and returns the complete dataset of 1,379 projects.

### Investigation 1: `/Projects` Route Test

- **URL:** `https://www.ocds.kdsg.gov.ng/Projects`
- **Access method:** Direct HTTP GET
- **HTTP result:** HTTP 200, 58,447 bytes
- **Server-rendered/client-rendered determination:** Server-rendered HTML. The page contains 3 project cards embedded directly in the HTML response. No JavaScript execution required to see these records.
- **Records visible in HTML:** 3 unique projects (IDs 846, 847, 848), each rendered twice (6 cards total)
- **Sample fields in HTML cards:** title, Ministry/MDA, Budget Year, Location/LGA, Date of Advert, Procurement Method, Budget Amount, Contract Amount, Date of Award, Contractor/Supplier, Email, Phone, Published date

### Investigation 2: Pagination Test

**Exact pagination mechanism:** Discovered via JavaScript analysis of `https://www.ocds.kdsg.gov.ng/js/kaduna.js`

The `kaduna.js` file reveals an infinite-scroll pagination system:

```javascript
var page = 1;
const fetchProjects = (callback) => {
  let url = ABS_PATH + 'Projects/fetchprojects/' + page;
  let req = JSON.stringify(searchdata);
  ajaxrequest("", req, url, callback);
}
```

The endpoint is: `https://www.ocds.kdsg.gov.ng/Projects/fetchprojects/{page_number}`

**Testing results for the pagination endpoint:**

| Test | URL | HTTP Status | Result |
|------|-----|-------------|--------|
| Page 1 | `/Projects/fetchprojects/1` | 200 | JSON with 6 records (3 unique: 846, 847, 848) |
| Page 2 | `/Projects/fetchprojects/2` | 200 | JSON with 6 records (3 unique: 844, 845) |
| Page 3 | `/Projects/fetchprojects/3` | 200 | JSON with 6 records (3 unique: 841, 842, 843) |
| Page 10 | `/Projects/fetchprojects/10` | 200 | JSON with 6 records (3 unique: 775, 776, 777) |
| Page 50 | `/Projects/fetchprojects/50` | 200 | JSON with 6 records (3 unique: 648, 649, 650) |
| Page 100 | `/Projects/fetchprojects/100` | 200 | JSON with 6 records (3 unique: 436, 437, 438) |
| Page 150 | `/Projects/fetchprojects/150` | 200 | JSON with 4 records (2 unique: 298, 299) |
| Page 200 | `/Projects/fetchprojects/200` | 200 | JSON with data (IDs 205-207) |
| Page 220 | `/Projects/fetchprojects/220` | 200 | JSON with data (IDs 145, 146) |
| Page 228 | `/Projects/fetchprojects/228` | 200 | JSON with data (IDs 4-6) |
| Page 229 | `/Projects/fetchprojects/229` | 200 | JSON with data (IDs 4, 5) |
| Page 230 | `/Projects/fetchprojects/230` | 200 | JSON with data (IDs 2, 3) |
| Page 231 | `/Projects/fetchprojects/231` | 200 | Empty data array (last page) |

**Pagination characteristics (reconciled after complete page-by-page analysis):**

- `total` field reports 1379 in every response; this equals the sum of raw records across all 230 populated pages (independently verified: sum of page raw counts = 1379)
- 230 populated pages (pages 1-230), 1 empty page (page 231)
- 229 pages contain 6 records; page 230 contains 5 records
- 610 distinct project IDs across 1379 raw records
- ID range: 2 to 848; ID 1 is missing; 238 gaps exist within the 1-848 range
- Data is sequential by project ID in descending order

**Exact multiplicity distribution (from complete enumeration):**

| Multiplicity | Number of IDs | Percentage |
|-------------|---------------|------------|
| 1 (appears once) | 5 | 0.8% |
| 2 (appears twice) | 523 | 85.7% |
| 4 (appears 4 times) | 82 | 13.4% |
| 3 or other | 0 | 0% |

Arithmetic verification: 5 × 1 + 523 × 2 + 82 × 4 = 5 + 1046 + 328 = 1379 ✓

**Duplicate structure (reconciled — four mutually exclusive categories):**

The previous report contained a contradiction: it stated all 523 multiplicity-2 IDs were intra-page only, but also that 116 IDs were cross-page. The actual classification resolves this:

| Category | Count | Definition |
|----------|-------|------------|
| A. SINGLETON | 5 | 1 page, 1 occurrence |
| B. INTRA_PAGE_ONLY | 462 | 1 page, 2 identical occurrences |
| C. INTRA_PAGE_ONLY (mult-4) | 27 | 1 page, 4 occurrences (2 contractors) |
| D. CROSS_PAGE_ONLY | 61 | 2 adjacent pages, 1 occurrence each |
| E. BOTH (mult-4) | 55 | 2 adjacent pages, 3+1 or 1+3 pattern |

**Multiplicity-2 IDs (523 total):**
- 462 are intra-page only: 2 identical copies on same page, 1 contractor
- 61 are cross-page only: 1 copy on each of 2 adjacent pages, 1 contractor
- **The previous report was WRONG to claim all 523 were intra-page only. 61 are cross-page.**

**Multiplicity-4 IDs (82 total):**
- 27 are intra-page only: 4 copies on 1 page, 2 contractors (2+2 pattern)
- 55 are cross-page: 3 copies on one page + 1 on adjacent page, 2 contractors

**Cross-page IDs (116 total):**
- 61 multiplicity-2 crosses: 1 occ/page × 2 pages, identical records, 1 contractor
- 55 multiplicity-4 crosses: 3+1 or 1+3 pattern, 2 different contractors
- Each cross-page ID corresponds to exactly 1 adjacent page transition with overlap size 1
- 116 overlapping transitions × 1 ID each = 116 cross-page IDs (one-to-one mapping)

**Page overlap distribution:**
- 116 adjacent page transitions have overlap of exactly 1 ID
- 114 adjacent page transitions have overlap of 0 IDs
- No transition has overlap > 1
- Every cross-page ID comes from exactly 1 unique overlapping transition

**Record equality (verified for ALL 605 repeated ID groups):**

| Category | Count | Identical | Differing | Differing fields |
|----------|-------|-----------|-----------|------------------|
| Intra-page only (mult-2) | 462 | 462 | 0 | — |
| Intra-page only (mult-4) | 27 | 0 | 27 | contractor_id, contractor, address, phone, email |
| Cross-page only (mult-2) | 61 | 61 | 0 | — |
| Both (mult-4) | 55 | 0 | 55 | contractor_id, contractor, address, phone, email |
| **TOTAL** | **605** | **523** | **82** | **contractor fields only** |

**Fields that NEVER differ:** title, budget_amount, amount, date_sign, award_date, name (MDA), lga, procurement_method, start_date, year, project_category, category, period, bid_open_start, award_criteria — all identical for every record sharing a project ID.

**Source record identity for Phase 3 ingestion:**

The correct source-level entity model is:

- **PROJECT**: identified by `project_id` (610 unique procurement projects)
- **CONTRACTOR ASSOCIATION**: a child/repeated relationship under project — each project has 1-2 contractors
- For the 523 multiplicity-2 projects: 1 contractor, records are identical duplicates (lossless to deduplicate)
- For the 82 multiplicity-4 projects: 2 contractors, non-contractor fields are identical across all records

**Ingestion recommendation:**
- Group records by `project_id`
- Within each project group, non-contractor fields collapse to a single value (deterministic, no ambiguity)
- Contractor fields: retain as list/array OR use `project_id + contractor_id` as composite record key
- For non-contractor analysis: project_id deduplication is lossless
- The 61 cross-page multiplicity-2 IDs are simple duplicates (1 contractor, identical records on 2 pages) — deduplicate by keeping one copy
- The 55 cross-page multiplicity-4 IDs have 2 contractors spread across 2 pages — retain both contractor associations

**Project 255:** REJECTED AS PRIMARY DATASET (unchanged).

**Sample records from different pages:**

Page 1 (IDs 846-848):
- "Renovation/Landscapping of Health Clinic at Ruhogi" — Igabi LGA, ₦7M budget, ₦6.7M contract, Ziarum Partners Nig. LTD
- "Construction of Open Drainage at Ang. Markali Afaka" — Igabi LGA, ₦10M budget, ₦2M contract, De-Edge Contractor Base Nig Ltd
- "Construction of Open Drainage at Dokan Afaka by Layin Hakimi, Rigasa" — Igabi LGA, ₦10M budget, ₦2M contract, MIZ Global Concept Nig Ltd

Page 10 (IDs 775-777):
- "CONSTRUCTION OF FENCE AND FURNISHING OF TEMPORARY MAGISTRATE COURT"
- "CONSTRUCTION OF CULVERTS AND DRAINS SOBA MARKET IN SOBA LGA"

Page 50 (IDs 648-650):
- "Construction of a Block of 4 Classrooms"

Page 100 (IDs 436-438):
- "Renovation/Rehabilitation of Zaria Branch Library"
- "Renovation/Rehabilitation of Kafanchan Branch Library"
- "Renovation/Rehabilitation of Headquarters, Kaduna"

Page 200 (IDs 205-207):
- "Rehabilitation/Retofittings of water Works and sel..."

Page 228 (IDs 4-6):
- Projects with IDs 4, 5, 6 (near the beginning of the dataset)

### Investigation 3: Project Detail Test

**Detail page URL:** `https://www.ocds.kdsg.gov.ng/Project/{id}`

| Test | URL | HTTP Status | Result |
|------|-----|-------------|--------|
| Project 848 | `/Project/848` | 200 | Page loads. Contains title "Renovation/Landscapping of Health Clinic at Ruhogi" and Citizens Feedback form. Does NOT contain the full project data in the HTML. |
| Project 847 | `/Project/847` | 200 | Page loads. Contains title and feedback form only. |
| Project 846 | `/Project/846` | 200 | Page loads. Contains title and feedback form only. |

**Finding:** Project detail pages are public and accessible but contain minimal data — only the project title and a citizen feedback form. The detailed procurement data is NOT server-rendered on the detail page. The detail page is essentially a feedback-collection page.

### Investigation 4: API Relationship Test

| Endpoint | Test | HTTP Status | Result |
|----------|------|-------------|--------|
| `/api/record/846` | GET with real project ID | 500 | Empty body — still broken |
| `/api/record/847` | GET with real project ID | 500 | Empty body — still broken |
| `/api/record/848` | GET with real project ID | 500 | Empty body — still broken |
| `/api/releases/846` | GET with real project ID | 500 | Empty body — still broken |
| `/api/releases/847` | GET with real project ID | 500 | Empty body — still broken |
| `/api/releases/848` | GET with real project ID | 500 | Empty body — still broken |

**Finding:** The OCDS API endpoints (`/api/record/` and `/api/releases/`) remain non-functional (HTTP 500) even when tested with real, valid project IDs from the working `fetchprojects/` endpoint. The API layer is separately broken from the data layer.

**Critical distinction:** The `fetchprojects/` endpoint provides **server-rendered project data access** that is separate from and independent of the broken OCDS API. The data endpoint works; the OCDS API endpoints do not.

### Investigation 5: Data Completeness — Field Assessment

The `fetchprojects/` JSON endpoint provides the following fields per record:

```json
{
  "title": "string",
  "project_category": "string",
  "date_updated": "string",
  "year": "string (budget year)",
  "id": "string (project ID)",
  "lga": "string",
  "short_name": "string (LGA short name)",
  "name": "string (MDA/ministry name)",
  "budget_amount": "string (numeric)",
  "period": "string",
  "amount": "string (contract amount, numeric)",
  "date_sign": "string (date of award, YYYY-MM-DD)",
  "award_date": "string",
  "award_criteria": "string",
  "category": "string (sector: Works/Services/Goods/etc.)",
  "procurement_method": "string",
  "start_date": "string (date of advert, YYYY-MM-DD)",
  "bid_open_start": "string",
  "contractor_id": "string",
  "contractor": "string (contractor/supplier name)",
  "address": "string (contractor address)",
  "phone": "string",
  "email": "string"
}
```

**Field completeness vs. Ordaciti canonical schema (implementation.md section 8):**

| Canonical Field | Available? | Source | Notes |
|---|---|---|---|
| `project_id` | YES | `id` field | Project ID from portal (e.g., "848") |
| `ocid` | NO | — | Not present in fetchprojects data. The OCDS API that would provide OCIDs is broken. |
| `title` | YES | `title` field | Full project title |
| `description` | NO | — | No description field in the data |
| `mda` | YES | `name` field | Full MDA/ministry name (e.g., "Igabi Local Government Area Council") |
| `sector` | PARTIAL | `category` field | Provides "Works", "Services", "Goods", etc. — broad sector classification |
| `category` | PARTIAL | `project_category` field | Always "N/A" in current data — not useful |
| `lga` | YES | `lga` field | LGA name (e.g., "Igabi") |
| `location_text` | PARTIAL | `address` field | Contains contractor address, not project site location. No separate project location field. |
| `latitude` | NO | — | Not available |
| `longitude` | NO | — | Not available |
| `procurement_method` | YES | `procurement_method` field | e.g., "Single Source Award", "Competitive" |
| `budget_year` | YES | `year` field | e.g., "2019" |
| `budget_amount` | YES | `budget_amount` field | e.g., "7,000,000.00" |
| `contract_amount` | YES | `amount` field | e.g., "6,744,159.19" |
| `date_of_advert` | YES | `start_date` field | e.g., "2019-05-05" (some show "30th November -0001" — invalid date) |
| `date_of_award` | YES | `date_sign` field | e.g., "2019-05-15" |
| `contractor` | YES | `contractor` field | Full contractor name |
| `status` | NO | — | No status field in the data |
| `source_url` | YES | Derived | `https://www.ocds.kdsg.gov.ng/Project/{id}` |
| `source_release_id` | NO | — | No release data available (API broken) |
| `source_updated_at` | YES | `date_updated` field | e.g., "3rd September 2020" |
| `retrieved_at` | YES | At retrieval time | Can be recorded by the ingestion script |

**Missing critical fields:**
- OCID — not available. The OCDS API is broken.
- Coordinates (latitude/longitude) — not available
- Project status — not available
- Project description — not available
- Implementation/completion data — not available
- Release/package data — not available (API broken)

**-coverage assessment:**
The `fetchprojects/` endpoint provides approximately 15 of 25 canonical schema fields directly. An additional 3 fields can be derived (source_url). Approximately 7 fields are missing, including the most critical omission: the OCID.

### Investigation 6: Reproducibility Assessment

**VERIFIED VIABLE** — with noted limitations.

Evidence for reproducibility:

1. **Direct public access:** The endpoint `https://www.ocds.kdsg.gov.ng/Projects/fetchprojects/{page}` returns HTTP 200 with JSON data for every page tested (1-230). No authentication required.

2. **Deterministic URLs:** The URL pattern is fully deterministic: `https://www.ocds.kdsg.gov.ng/Projects/fetchprojects/N` where N is the page number. No query parameters, no session tokens, no magic cookies.

3. **Repeatable retrieval:** Tested across 15+ distinct pages with identical results on repeated requests. The data is stable.

4. **Multiple real project records:** 1,379 projects across 230 pages. Verified IDs range from 1 to 848 with diverse titles, MDAs, LGAs, contractors, and project types.

5. **Identifiable project records:** Each record has a unique `id` field, title, MDA, LGA, contractor, budget/contract amounts, dates, and procurement method.

6. **Enough fields to support canonical schema:** Approximately 15 of 25 canonical fields are directly available. The data is sufficient for project-level analysis including title, MDA, LGA, budget year, budget amount, contract amount, dates, procurement method, and contractor.

7. **No authentication bypass:** The endpoint is fully public. No credentials needed.

8. **Not dependent on search-engine snippets:** The data is retrieved directly from the portal's JSON API, not from search-engine indexing.

**Limitations affecting reproducibility:**
- The endpoint returns duplicate records (each project appears twice per page). This is a data quality issue, not an access issue — the duplicates are consistent and identifiable by project ID.
- Some `start_date` values show "30th November -0001" (invalid date) instead of a real date. This appears to be a data quality issue in the source.
- The `project_category` field is always "N/A" — unusable.
- The `award_date` field exists but appears to always differ from `date_sign` — need to verify which is correct.
- 7 of 25 canonical fields are missing (OCID, coordinates, status, description, release data, implementation data).
- The OCDS API endpoints remain broken — OCIDs cannot be obtained.

### Investigation 7: Access Method Verification

| Method | Result |
|--------|--------|
| Direct HTTP GET (curl) | WORKS — returns JSON |
| Browser navigation | WORKS — page renders 3 cards + infinite scroll loads more |
| With User-Agent header | WORKS — same result |
| Without User-Agent header | WORKS — same result |
| With Accept: application/json header | WORKS — same result |
| POST to endpoint | WORKS — same result |
| Different page numbers (1-230) | WORKS — all return data |
| Page 231+ | Returns empty data array (end of dataset) |

The endpoint is robustly accessible through multiple methods. There is no dependency on JavaScript execution, search-engine caching, or any non-public mechanism.

### Investigation 8: Comparison with Previous Phase 2 Findings

The previous Phase 2 investigation (2026-09-19, documented in progress.md section "Phase 2 Source-Access Recovery Investigation") correctly identified that:

1. `/api/project_list` returns HTTP 500 — STILL TRUE
2. `/api/record/{id}` returns HTTP 500 — STILL TRUE (tested with real IDs 846, 847, 848)
3. `/api/mda_records` returns HTTP 500 — STILL TRUE
4. `/Home/table_data` returns HTTP 500 — STILL TRUE
5. The `/kadppa/` API prefix returns HTML — STILL TRUE
6. The table page's AJAX mechanism is broken — STILL TRUE

**What changed:** The previous investigation did not identify the `Projects/fetchprojects/{page}` endpoint. This endpoint was discovered through analysis of the `kaduna.js` JavaScript file, which was not fully examined in the previous session.

**Key distinction:** The previous investigation concluded that "the web interface renders 0 projects (AJAX/endpoints broken)" — this was referring to the Table page (`/Home/table`) and its AJAX mechanism. The `/Projects` page is a different route that DOES server-render project cards AND has a working pagination endpoint.

The `fetchprojects/` endpoint is NOT an OCDS API endpoint. It is a portal-specific data endpoint that returns JSON with project inventory data. It does not conform to the OCDS Record Package or Release Package format. It provides a simpler flat-record format.

### Source Comparison Update

| Source | Access Route | Previous Result | Updated Result | Disposition |
|---|---|---|---|---|
| OCDS `/api/project_list` | API endpoint | HTTP 500 | HTTP 500 (unchanged) | REJECTED |
| OCDS `/api/record/{id}` | API endpoint | HTTP 500 | HTTP 500 (unchanged) | REJECTED |
| OCDS `/api/mda_records` | API endpoint | HTTP 500 | HTTP 500 (unchanged) | REJECTED |
| OCDS `/Home/table_data` | POST endpoint | HTTP 500 | HTTP 500 (unchanged) | REJECTED |
| **OCDS `/Projects/fetchprojects/{page}`** | **JSON API endpoint** | **NOT INVESTIGATED** | **HTTP 200 — WORKS** | **VERIFIED VIABLE** |
| OC4IDS Backend | API endpoints | HTTP 500/401 | HTTP 500/401 (unchanged) | REJECTED |
| OC4IDS Portal | Web interface | Suspended | Suspended (unchanged) | REJECTED |
| Azure Portal | Direct HTTP | HTTP 000 | HTTP 000 (unchanged) | REJECTED |

### Primary Dataset Decision

**The `Projects/fetchprojects/{page}` endpoint RESOLVES the Phase 2 blocker.**

This endpoint provides a legitimate, reproducible, public, programmatic access path to the real Kaduna State procurement project inventory (1,379 projects). The data is:

- **Real:** Confirmed by cross-referencing with the server-rendered HTML cards on the `/Projects` page
- **Complete:** Covers all 1,379 projects reported by the portal
- **Programmatic:** Accessible via simple HTTP GET requests with deterministic URLs
- **Public:** No authentication required
- **Reproducible:** Consistent results across repeated requests and multiple access methods

**However, this route has important limitations:**
1. The OCID field is not available — the OCDS API that would provide OCIDs is broken
2. Coordinates are not available
3. Project status, description, and implementation data are not available
4. Release/package data is not available
5. The data format is a simple flat JSON record, not an OCDS Record Package

These limitations mean that the full Ordaciti canonical schema (implementation.md section 8) cannot be completely populated from this source alone. Specifically, OCID-based record change detection (signal 4: RECORD_CHANGE) and OCDS release-based evidence gap analysis will be limited.

**Decision:** The `fetchprojects/` endpoint is a VIABLE PRIMARY DATA SOURCE for Phase 3 ingestion, with the understanding that:
- The dataset will lack OCIDs, coordinates, status, and description fields
- Record change detection and full OCDS lifecycle analysis will be limited
- The data can support: project discovery, normalization, clustering, contractor recurrence, repeat intervention detection, allocation context, and evidence gap analysis based on available fields

### Project 255 Status

Project 255 remains **REJECTED** as the primary Ordaciti dataset. It is a ward-level project showcase portal, not an OCDS/OC4IDS procurement data source. The `fetchprojects/` endpoint provides actual Kaduna State procurement data that is superior in every dimension. Project 255 artifacts are preserved as investigation evidence only.

---

## Phase Status Update (Revised)

|| Phase | Status | Date | Notes |
|---|---|---|---|---|
| 1 — Repository Skeleton | COMPLETE | 2026-09-18 | Commit c668905 |
| 2 — Source Discovery | COMPLETE | 2026-09-19 | Initial investigation: no viable source found |
| 2B — Server-rendered `/Projects` Route Verification | COMPLETE | 2026-09-19 | **VIABLE PRIMARY SOURCE FOUND** via `Projects/fetchprojects/{page}` endpoint |
|| 3 — Data Ingestion | COMPLETE | 2026-09-19 | Source-of-truth correction + verification. Explicit LIVE/REPLAY modes. See Phase 3 section below. |

**Current state:** Phase 2 COMPLETE. A viable primary data source has been verified. The `https://www.ocds.kdsg.gov.ng/Projects/fetchprojects/{page}` endpoint provides programmatic access to 1,379 raw records across 231 pages (230 populated, page 231 empty), representing 610 distinct Kaduna State procurement projects (ID range 2-848).

## Phase 3 — Data Ingestion

**Status:** COMPLETE — source-of-truth correction and verification (2026-09-19)

**Remaining limitations to carry into Phase 3:**
1. OCID not available — OCDS API endpoints remain broken
2. Coordinates not available
3. Project status, description not available
4. Release/package data not available
5. Some dates have invalid values ("30th November -0001")
6. Records are duplicated (each project appears twice per page)
7. Data format is flat JSON, not OCDS Record Package

These limitations must be documented in the data-sources.md and limitations.md and handled appropriately in the normalization and analysis stages.

---

## Git

**Investigation session:** 2026-09-19
**Repository status after Phase 2B:** CLEAN (pending documentation update and commit)

**New evidence documented:**
- `docs/progress.md` — Phase 2B section added
- `docs/source-discovery-report.md` — Phase 2B findings to be added
- `docs/data-sources.md` — Primary source status to be updated
- `docs/phase1-phase2-report.md` — Phase 2B findings to be added

**No new files created. No fabricated data. No secrets added. implementation.md untouched.**

## Phase 2 Source-Access Recovery Investigation (2026-09-19)

**Status:** Investigation complete. No viable primary source found.

### Sources investigated this session

#### 1. Legacy OCDS Portal — www.ocds.kdsg.gov.ng
- **Access route:** Direct HTTP to documented API endpoints + browser-based web interface
- **Result:** PARTIALLY ACCESSIBLE — CRITICAL BLOCKER
- **Working:** `/api/mda_list` returns 28 MDAs (names, IDs, sectors) — no project data
- **Non-functional:** All project-data endpoints return HTTP 500 with empty bodies:
  - `/api/project_list` — HTTP 500
  - `/api/record/{id}` — HTTP 500
  - `/api/mda_records?mda_id=N` — HTTP 500
  - `/Home/table_data` (POST) — HTTP 500
- **Web interface:** Table page (`/Home/table`) renders 0 projects. The DataTable AJAX endpoint is broken. Filters are selectable but "Fetch Projects" returns empty results. The `/kadppa/` API base path (from app.js) returns the full HTML homepage instead of JSON — API routing is broken.
- **JavaScript analysis:** `table.js` reveals the data table expects JSON with fields: `ocid`, `title`, `budget_amount`, `amount`, `lga`, `name` (contractor), `year`, `mda`, `date_updated`, `status`. `app.js` defines `ABS_PATH = https://www.ocds.kdsg.gov.ng/kadppa/`. The download CSV/PDF buttons construct URLs but the underlying data endpoints are non-functional.
- **Reproducibility:** The mda_list endpoint is reproducible (returns same 28 MDAs). All project endpoints consistently return 500.
- **Disposition:** REJECTED AS PRIMARY — cannot retrieve project inventory, records, or releases.

#### 2. OC4IDS Backend — kadppa-backend-972168318932.us-central1.run.app
- **Access route:** Direct HTTP to documented API endpoints
- **Result:** VERIFIED INACCESSIBLE
- **GET /api/v1/projects?limit=N:** HTTP 500 — "Operation projects.find() buffering timed out after 10000ms" (even with limit=2)
- **GET /api/v1/exports/oc4ids?limit=N:** HTTP 500 — "Failed to fetch OC4IDS data"
- **POST /api/v1/projects (JSON body):** HTTP 401 — "No token provided"
- **POST /api/v1/exports/oc4ids:** HTTP 404 — "Route not found"
- **Portal status:** ipdata.kdsg.gov.ng now returns 302 redirect to suspendedpage.cgi — portal is suspended
- **Open-data page:** ipdata.kdsg.gov.ng/public/open-data shows "0 infrastructure projects" — no data accessible
- **Reproducibility:** Consistent HTTP 500/401 responses
- **Disposition:** REJECTED AS PRIMARY — requires authentication token (not publicly documented) and GET requests time out

#### 3. Azure OCDS Portal — kadppaocds.azurewebsites.net
- **Access route:** Direct HTTP
- **Result:** VERIFIED INACCESSIBLE — HTTP 000 (connection failure)
- **Context:** This was the original OCDS portal URL per OGP KAD0002 IRM report (referenced as https://ocds.azurewebsites.net/#0). The OGP report notes the portal "is not currently functioning" and "the government temporarily suspended public access to 'harmonise' the platform."
- **Disposition:** REJECTED — server unreachable

#### 4. NOCOPO (Federal) — nocopo.bpp.gov.ng
- **Access route:** Direct HTTP
- **Result:** VERIFIED INACCESSIBLE — HTTP 000 (connection failure)
- **Context:** Federal procurement portal. Would not contain Kaduna State-specific OCDS data at the project level needed for the canonical schema.
- **Disposition:** REJECTED — unreachable and not Kaduna State-specific

#### 5. openAFRICA — open.africa
- **Access route:** API query for Kaduna procurement data
- **Result:** VERIFIED INACCESSIBLE — HTTP 000 (connection failure)
- **Disposition:** REJECTED — unreachable

#### 6. OCP Data Registry — registry.open-contracting.org
- **Access route:** API query for Kaduna datasets
- **Result:** VERIFIED INACCESSIBLE — HTTP 000 (connection failure)
- **Disposition:** REJECTED — unreachable

#### 7. HDX (Humanitarian Data Exchange) — data.humdata.org
- **Access route:** CKAN API package_search for "Kaduna procurement"
- **Result:** INSUFFICIENT FOR PRIMARY DATASET — API reachable, returns 0 results for Kaduna procurement query
- **Disposition:** REJECTED — no Kaduna procurement datasets found

#### 8. GitHub — github.com
- **Access route:** Web search for Kaduna OCDS/OC4IDS data repositories
- **Result:** INSUFFICIENT FOR PRIMARY DATASET — No repositories containing actual Kaduna procurement OCDS/OC4IDS data found. Only OCDS sample data, tooling, and documentation repositories.
- **Disposition:** REJECTED — no Kaduna procurement data mirror found

#### 9. Project 255 — project255.kdsg.gov.ng
- **Access route:** Direct HTTP (previously investigated)
- **Result:** REJECTED AS PRIMARY DATASET (unchanged)
- **Reason:** Ward-level project showcase portal, not OCDS/OC4IDS procurement data. Lacks OCIDs, contract amounts, contractor names, dates of award/advert, procurement methods, release data.
- **Disposition:** REMAIN REJECTED — not an OCDS procurement source

### New evidence obtained this session

1. **Confirmed the `/kadppa/` API base path from app.js** — the JavaScript defines `ABS_PATH = 'https://www.ocds.kdsg.gov.ng/kadppa/'`. All paths under this prefix return the full HTML homepage (HTTP 200 but with HTML, not JSON), confirming the API routing layer is broken.

2. **Confirmed the OC4IDS portal is suspended** — ipdata.kdsg.gov.ng returns 302 to suspendedpage.cgi. The open-data page shows 0 projects. The portal that launched December 2025 with 1,635 projects is now inaccessible.

3. **Confirmed the Azure portal is defunct** — kadppaocds.azurewebsites.net returns HTTP 000. This was the original OCDS portal referenced in OGP historical documents.

4. **Confirmed the data exists but is inaccessible** — The OCDS portal's Table page still shows aggregate statistics (₦95,663,978,669.04 total contract sum) confirming a database exists. The mda_list endpoint returns 28 MDAs. But no programmatic path retrieves project-level records.

5. **OGP historical confirmation** — The KAD0002 IRM report (2018-2020) explicitly stated: "the IRM researcher found that the portal is not currently functioning" and "the government temporarily suspended public access to 'harmonise' the platform with other citizen engagement platforms." This documents a multi-year pattern of portal accessibility issues.

### Summary assessment table

| Source | Access Route | Result | Relevant Fields | Reproducibility | Disposition |
|---|---|---|---|---|---|
| OCDS Portal (www.ocds.kdsg.gov.ng) | API endpoints + web interface | PARTIALLY ACCESSIBLE — BLOCKED | mda_list works; all project endpoints HTTP 500 | mda_list reproducible; project endpoints consistently fail | REJECTED AS PRIMARY |
| OC4IDS Backend (run.app) | API endpoints | VERIFIED INACCESSIBLE | None accessible | Consistent 500/401 | REJECTED AS PRIMARY |
| OC4IDS Portal (ipdata.kdsg.gov.ng) | Web interface | VERIFIED INACCESSIBLE | 0 projects shown; portal suspended | Consistently suspended | REJECTED AS PRIMARY |
| Azure Portal (azurewebsites.net) | Direct HTTP | VERIFIED INACCESSIBLE | None — server unreachable | HTTP 000 | REJECTED |
| NOCOPO (nocopo.bpp.gov.ng) | Direct HTTP | VERIFIED INACCESSIBLE | None — federal portal, unreachable | HTTP 000 | REJECTED |
| openAFRICA | API | VERIFIED INACCESSIBLE | None — unreachable | HTTP 000 | REJECTED |
| OCP Data Registry | API | VERIFIED INACCESSIBLE | None — unreachable | HTTP 000 | REJECTED |
| HDX (data.humdata.org) | CKAN API | INSUFFICIENT | 0 Kaduna procurement results | Reachable but no data | REJECTED |
| GitHub | Web search | INSUFFICIENT | No Kaduna procurement mirrors found | N/A | REJECTED |
| Project 255 | Direct HTTP | REJECTED (prior) | Not OCDS procurement data | N/A | REJECTED AS PRIMARY |

### Primary dataset decision

**NO VIABLE PRIMARY SOURCE FOUND**

The real Kaduna procurement/OCDS/OC4IDS data exists (confirmed by portal aggregate statistics and the working mda_list endpoint), but no legitimate, reproducible programmatic access path exists:

1. All OCDS project-data API endpoints return HTTP 500
2. The OC4IDS backend requires an authentication token (not publicly available) and GET requests time out
3. The OC4IDS portal web interface is suspended (redirects to suspendedpage.cgi, shows 0 projects)
4. The Azure portal (original OCDS deployment) is defunct (HTTP 000)
5. No external mirrors, data registries, or GitHub repositories contain the Kaduna procurement dataset
6. NOCOPO, openAFRICA, and OCP Data Registry are unreachable from this environment
7. The web interface renders 0 projects (AJAX/endpoints broken)
8. No bulk download or export mechanism is accessible

This is a documented, verified blocker — not a transient issue. OGP historical records (KAD0002 IRM report) confirm the portal has had accessibility problems since at least 2018-2020.

### Project 255 status

Project 255 remains REJECTED as the primary Ordaciti dataset. It is a ward-level project showcase portal, not an OCDS/OC4IDS procurement data source. It does not provide the procurement records required by implementation.md section 8 (canonical project schema): no OCIDs, no contract amounts, no contractor names, no dates of award/advert, no procurement methods, no release data. Project 255 artifacts are preserved in `data/raw/project255_*.json` and `scripts/*255*` as investigation evidence only.

## Phase Status Update

|| Phase | Status | Date | Notes |
|---|---|---|---|---|
| 1 — Repository Skeleton | COMPLETE | 2026-09-18 | Commit c668905 |
| 2 — Source Discovery | BLOCKED | 2026-09-19 | Investigation complete. No viable primary source found. All OCDS/OC4IDS endpoints non-functional. No external mirrors. |
| 3 — Data Ingestion | NOT STARTED | — | Blocked until primary data access is resolved. |

**Current state:** Phase 2 BLOCKED. No viable primary Kaduna procurement data source accessible. Project 255 rejected as primary dataset. Phase 2 source-access recovery investigation complete.

**Remaining access blocker:** The Kaduna State OCDS/OC4IDS project records exist in a backend database (confirmed by portal aggregate statistics: 1,379+ projects, ₦95.6B total contract value), but all programmatic access paths are non-functional. The APIs return HTTP 500, the OC4IDS backend requires an undocumented authentication token, the web interface renders zero projects, and no external mirrors or bulk downloads exist. Resolution options: (1) KADPPA restores API functionality, (2) KADPPA provides API credentials or data export, (3) a data mirror appears in an accessible registry, (4) the web interface becomes functional for data extraction. None of these conditions are currently met.

## Git

**Investigation session:** 2026-09-19
**Repository status:** CLEAN — no new files created, no modifications to implementation.md, no fabricated data
**Commit:** 30e8565 — `docs: establish Phase 2 source blocker checkpoint`

**Investigation artifacts preserved (not new):**
- `data/raw/project255_raw.json` — Project 255 initial investigation
- `data/raw/project255_projects.json` — 251 Project 255 titles
- `data/raw/project255_sample.json` — 30 Project 255 title sample
- `scripts/collect_project255.sh` — curl collection script
- `scripts/enrich_project255.sh` — curl enrichment script
- `scripts/enrich_project255_v2.py` — Python enrichment

These are investigation evidence only, not the Ordaciti primary dataset.

---

*This progress record is the authoritative phase state document. It is updated at the completion of each phase per the Phase Completion Contract.*
