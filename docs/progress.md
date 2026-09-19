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
