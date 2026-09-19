# Ordaciti — Phase 1 & Phase 2 Completion Report

**Date:** 2026-09-18
**Author:** Hermes Agent (Solar Pro4)
**Spec:** implementation.md (sections 1-68, authoritative)

---

## 1. Files and Directories Created

### Phase 1 — Repository Skeleton

**Directory structure** (matches implementation.md section 38):

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
├── components/                 # Empty directory (stubs TBD)
├── lib/
│   ├── data.ts                 # Data utilities (stub)
│   ├── signals.ts              # Signal logic (stub)
│   ├── clustering.ts           # Clustering (stub)
│   ├── evidence.ts             # Evidence objects (stub)
│   └── ai.ts                   # AI logic (stub)
├── scripts/
│   ├── fetch_kaduna.py         # Ingestion (placeholder)
│   ├── normalize_ocds.py       # Normalization (placeholder)
│   ├── discover_patterns.py    # Pattern discovery (placeholder)
│   ├── enrich_population.py    # Population enrichment (placeholder)
│   └── build_dataset.py        # Dataset build (placeholder)
├── data/
│   ├── raw/                    # Raw ingestion (with .gitkeep)
│   └── processed/              # Processed outputs (with .gitkeep)
├── docs/
│   ├── methodology.md          # Methodology (draft stub)
│   ├── data-sources.md         # Data sources (partial, primary verified)
│   ├── limitations.md          # Limitations (draft stub)
│   ├── ai-log.md               # AI log (empty, ready)
│   └── source-discovery-report.md  # Phase 2 report (this document's sibling)
├── public/
│   └── screenshots/            # Screenshots (with .gitkeep)
├── .env.example                # AI_API_KEY=, AI_MODEL=
├── .gitignore                  # Node, Python, env, data, IDE ignores
├── package.json                # Next.js 14, React 18, MapLibre GL, Tailwind
├── tsconfig.json               # TypeScript strict, App Router paths
├── requirements.txt            # Python: requests, pandas, rapidfuzz, python-dateutil, orjson
├── README.md                   # Full setup instructions per implementation.md section 51
└── vercel.json                 # Vercel v3 config, Next.js build
```

**Total: 27 files, 15 directories**

### Config file details

- **package.json:** Next.js 14.2+, React 18.3+, MapLibre GL 4.7+, Tailwind CSS 3.4+
- **tsconfig.json:** ES2017 target, strict mode, App Router paths (`@/*` → `.//*`)
- **.env.example:** Only `AI_API_KEY=` and `AI_MODEL=` (no real secrets)
- **vercel.json:** Vercel v3, Next.js build via `@vercel/next`
- **requirements.txt:** Minimal Python deps — requests/httpx, pandas, numpy, rapidfuzz, python-dateutil, orjson. Geopandas/shapely commented out (only if genuinely necessary per spec section 36).
- **.gitignore:** Comprehensive — Node, Python, env, IDE, OS, large data files

---

## 2. Kaduna OCDS Sources Discovered

### Primary Source 1: Legacy OCDS Portal

**URL:** https://www.ocds.kdsg.gov.ng/
**API docs:** https://www.ocds.kdsg.gov.ng/api
**Organization:** Kaduna State Public Procurement Authority (KADPPA) + PPDC
**Technology:** "Powered by Budeshi" (Open Contracting for Nigeria platform)
**Standard:** OCDS (Open Contracting Data Standard)

**Verification results:**

| Endpoint | Expected | Actual | Status |
|---|---|---|---|
| `/api/project_list` | JSON list of projects | HTTP 500, empty body | **NON-FUNCTIONAL** |
| `/api/mda_list` | JSON list of MDAs | HTTP 200, 18+ MDAs returned | **WORKING** |
| `/api/mda_records?mda_id=N` | OCDS Record package | HTTP 500, empty body | **NON-FUNCTIONAL** |
| `/api/record/{project_id}` | OCDS Record package | HTTP 500, empty body | **NON-FUNCTIONAL** |
| `/api/releases/{project_id}/{type}` | OCDS Release package | HTTP 500, empty body | **NON-FUNCTIONAL** |
| `/Home/table_data` (POST) | Data table JSON | HTTP 500, empty body | **NON-FUNCTIONAL** |

**Portal evidence that data exists:**
- Projects page renders server-side: 1,379 total projects, ₦95,663,978,669.04 total contract sum, ₦4,284,000,000.00 highest, ₦21,000.00 lowest
- One project card rendered in HTML (Igabi LGA, 2019, ₦7M budget, ₦6.7M contract, Ziarum Partners Nig. LTD)
- JavaScript `table.js` reveals DataTable server-side processing via POST to `/Home/table_data`

**Root cause:** All project-data endpoints return HTTP 500. This likely indicates a database connection failure, backend migration issue (Budeshi platform), or server misconfiguration.

**Mda_list working data:**
```json
[{"name":"Customary Court of Apeal","id":"1","sector":"Justice"},
 {"name":"Drugs and Medical Supplies Management Agency","id":"2","sector":"Health"},
 ... 18+ MDAs total]
```

### Primary Source 2: OC4IDS Portal (Newer)

**URL:** https://ipdata.kdsg.gov.ng/public/home
**Backend:** https://kadppa-backend-972168318932.us-central1.run.app/
**Standard:** OC4IDS (Open Contracting for Infrastructure Data Standard)
**Launched:** October 2025
**Claimed coverage:** 1,635 published projects, 393 with coordinates

**Verification results:**

| Endpoint | Method | Actual | Status |
|---|---|---|---|
| `/api/v1/projects` | GET | HTTP 500 — "buffering timed out after 10000ms" | **NON-FUNCTIONAL** |
| `/api/v1/exports/oc4ids` | GET | HTTP 500 — "Failed to fetch OC4IDS data" | **NON-FUNCTIONAL** |
| `/api/v1/projects` | POST (JSON body) | HTTP 401 — "No token provided" | **AUTH REQUIRED** |
| `/api/v1/exports/oc4ids` | POST | HTTP 404 — "Route not found" | **ROUTE MISSING** |

**Implication:** The backend is running but queries time out (database likely too large for the 10s Cloud Run timeout) or require an API token not publicly documented.

### Source page data extraction (fallback evidence)

From the OCDS Projects page HTML, one project is rendered server-side as an example:

| Field | Value |
|---|---|
| Ministry | Igabi Local Government Area Council |
| Budget Year | 2019 |
| Location | Igabi |
| Date of Advert | 2019-05-05 |
| Procurement Method | Single Source Award |
| Budget Amount | ₦7,000,000.00 |
| Contract Amount | ₦6,744,159.19 |
| Date of Award | 2019-05-15 |
| Contractor | Ziarum Partners Nig. LTD |
| Email | salehrabiu4@gmail.com |
| Phone | 08036277516 |

This confirms the data format matches OCDS expectations and the portal does contain real procurement records.

---

## 3. Exact Validated Endpoint URLs

### Working endpoints
- **MDA list:** `https://www.ocds.kdsg.gov.ng/api/mda_list` (GET, returns JSON)
- **API documentation:** `https://www.ocds.kdsg.gov.ng/api` (HTML page)

### Non-functional endpoints (confirmed HTTP 500)
- `https://www.ocds.kdsg.gov.ng/api/project_list`
- `https://www.ocds.kdsg.gov.ng/api/mda_records`
- `https://www.ocds.kdsg.gov.ng/api/record/{id}`
- `https://www.ocds.kdsg.gov.ng/api/releases/{id}/{type}`
- `https://www.ocds.kdsg.gov.ng/Home/table_data` (POST)
- `https://kadppa-backend-972168318932.us-central1.run.app/api/v1/projects`
- `https://kadppa-backend-972168318932.us-central1.run.app/api/v1/exports/oc4ids`

### Authenticated endpoints (need token)
- `https://kadppa-backend-972168318932.us-central1.run.app/api/v1/projects` (POST)

### Portal URLs (accessible, no data API)
- `https://www.ocds.kdsg.gov.ng/` — Main portal
- `https://www.ocds.kdsg.gov.ng/Projects` — Projects page (server-rendered sample)
- `https://www.ocds.kdsg.gov.ng/Home/table` — Data table (AJAX broken)
- `https://www.ocds.kdsg.gov.ng/Home/visual` — Visualization page
- `https://ipdata.kdsg.gov.ng/public/home` — OC4IDS portal

---

## 4. Data Format and Important Fields

### OCDS portal project fields (from rendered HTML sample)

The portal uses these field names in its data table (from `table.js`):
- `ocid` — Open Contracting ID
- `title` — Project title
- `budget_amount` — Budget amount (numeric)
- `amount` — Contract amount (numeric)
- `lga` — Local Government Area
- `name` — Contractor/Supplier name
- `contractor_id` — Contractor identifier
- `year` — Budget year
- `mda` — Ministry/Department/Agency
- `date_updated` — Record update date
- `status` — Project status

### Project detail fields (from rendered card)

- Ministry
- Budget Year
- Location
- Date of Advert
- Procurement Method
- Budget Amount (₦ format)
- Contract Amount (₦ format)
- Date of Award
- Contractor/Supplier
- Email
- Phone

### OCDS schema mapping (to implementation.md canonical schema)

| Canonical field | OCDS portal field | Notes |
|---|---|---|
| `project_id` | `id` (from URL routing) | `project/{id}` pattern |
| `ocid` | `ocid` | OCDS identifier |
| `title` | `title` | |
| `mda` | `mda` / `name` (from mda_list) | |
| `sector` | Not directly available | Inferred from MDA |
| `category` | `procurement_category` (from visual page) | Construction, Supplies, Consultancy, etc. |
| `lga` | `lga` | Needs normalization |
| `location_text` | `location` | |
| `latitude` / `longitude` | Not in sample | Only 393/1,635 have coords on OC4IDS |
| `procurement_method` | `procurement_method` | e.g., "Single Source Award", "Competitive" |
| `budget_year` | `year` | |
| `budget_amount` | `budget_amount` | ₦ format, needs parsing |
| `contract_amount` | `amount` | ₦ format, needs parsing |
| `date_of_advert` | `date_of_advert` | YYYY-MM-DD |
| `date_of_award` | `date_of_award` | YYYY-MM-DD |
| `contractor` | `name` (contractor) | Needs normalization |
| `status` | `status` | |

### Release data
The API docs mention releases by type: `planning`, `tender`, `award`, `contract`. Record changes would compare these across releases for the same OCID.

---

## 5. Date/Release Coverage Discovered

### From portal displays
- **Total projects:** 1,379 (OCDS portal) / 1,635 (OC4IDS portal, as of late 2025)
- **Total contract value:** ₦95,663,978,669.04
- **Date range:** Projects from 2019 onwards observed in sample data
- **Sample project:** 2019 (Igabi LGA)

### From web research (secondary sources)
- Kaduna State has been publishing OCDS data **since 2016** (per CoST Kaduna and OGP documents)
- The OGP commitment NGKD0007 (2024-2027) aims to improve "adherence to data standards, integration with other portals, timeliness, completeness, and accuracy"
- A prior OGP commitment (KAD0002, 2018-2020) focused on "Full implementation of Open Contracting Data Standards in the public sector"
- CoST Kaduna launched September 2023, OC4IDS portal launched October 2025
- By June 2025, the OC4IDS portal was "granted an OC4IDS badge as the winner of 2025, publishing data on 1,149 projects" (later updated to 1,635)

### Release coverage
Unknown. The portal supports multiple release types (planning, tender, award, contract) but the releases endpoint is non-functional. The actual number of releases per project cannot be determined without a working API.

---

## 6. Secondary Sources Validated

### geoBoundaries (VALIDATED — FULLY ACCESSIBLE)

- **URL:** https://www.geoboundaries.org/
- **Download (ADM2, all Nigeria):** https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/NGA/ADM2/geoBoundaries-NGA-ADM2.geojson
- **Download (ADM1, states):** https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/NGA/ADM1/geoBoundaries-NGA-ADM1.geojson
- **Download (ADM2 simplified):** https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/NGA/ADM2/geoBoundaries-NGA-ADM2_simplified.geojson
- **API:** https://www.geoboundaries.org/api/current/gbOpen/NGA/ADM2/
- **License:** CC BY 4.0
- **Size:** ADM2 GeoJSON = 9.4 MB (774 features), simplified = 3.7 MB
- **Status:** Fully downloadable, parseable, contains all Nigerian LGAs including Kaduna State
- **Kaduna LGAs found:** 21 of 23 by name (see data-sources.md for cross-reference)
- **Kaduna State ADM1:** shapeName="Kaduna", shapeISO="NG-KD", boundary confirmed

### WorldPop (VALIDATED — FILE ACCESSIBLE, NOT DOWNLOADED)

- **URL:** https://www.worldpop.org/
- **Nigeria 2020 population (1km GeoTIFF):** https://data.worldpop.org/GIS/Population/Global_2000_2020/2020/NGA/nga_ppp_2020.tif
- **Size:** 495,162,703 bytes (~495 MB)
- **License:** CC BY 4.0
- **DOI:** 10.5258/SOTON/WP00645
- **Year:** 2020
- **Resolution:** 1km (3 arc seconds), WGS84
- **Status:** HTTP HEAD confirms accessible (200 OK). File is large — downloading and processing will require spatial subsetting to Kaduna.
- **WOPR API:** Non-functional (Slim Application Error)
- **Admin-level CSV:** Documented paths return 404
- **Newer R2025A data:** Available at 100m resolution (150.93 MB for Nigeria)

### OpenStreetMap (VALIDATED — NOMINIM WORKING, OVERPASS UNRELIABLE)

- **Nominatim:** https://nominatim.openstreetmap.org/ — Functional. Returns Kaduna State boundary (relation ID 3709353), centroid (lat 10.38, lon 7.85), bounding box.
- **Overpass API:** https://overpass-api.de/api/interpreter — Returns 406 Not Acceptable with proper User-Agent. Mirror overpass.kumi.systems returns 400 parse errors.
- **Status:** Nominatim works for geocoding. Overpass is unreliable from this environment. This is a P2 enrichment source, not required for MVP.

### Additional sources identified (not yet investigated)

- **GRID3 Nigeria:** https://data.grid3.org/ — LGA boundaries used by geoBoundaries
- **Humanitarian Data Exchange (HDX):** https://data.humdata.org/ — Nigeria administrative boundaries (ADM0/1/2), WorldPop population density
- **openAFRICA:** https://open.africa/ — Kaduna LGA boundaries (GeoJSON, 2019)
- **World Bank Data Catalog:** Nigeria administrative boundaries

---

## 7. Blockers and Incompatibilities

### CRITICAL BLOCKER: Primary data API non-functional

**Severity:** Blocks Phase 3 entirely.
**Description:** Neither the legacy OCDS portal nor the newer OC4IDS backend provides working programmatic access to Kaduna project procurement data. All project-data endpoints return HTTP 500.

**Impact:** Cannot retrieve the project inventory, individual project records, release data, or bulk download. The data exists (confirmed by portal displays) but cannot be accessed programmatically.

**Possible mitigations (in order of feasibility):**
1. **Check for data mirrors:** opencontracting.org data registry, NOCOPO, openAFRICA, GitHub repositories
2. **Scrape the web interface:** If the Table page supports pagination in the browser, data might be extractable via browser automation
3. **Contact KADPPA:** Request API access or data export (kadppa@kdsg.gov.ng)
4. **Use browser automation:** With the browser session, navigate the portal's Table page and extract paginated results — but the AJAX endpoint is also returning 500
5. **Wait for API recovery:** Transient server issue — but cannot be relied upon
6. **Use minimal data:** Work with the single project visible in the page HTML plus any data discoverable through the web interface — would severely limit the demo

### SECONDARY BLOCKER: OC4IDS backend requires authentication

**Severity:** Moderate — alternative data source inaccessible.
**Description:** The newer OC4IDS backend at `kadppa-backend-...run.app` requires a token for POST requests and GET requests time out.

**Impact:** Even if the OCDS portal APIs were working, the OC4IDS backend (which has richer infrastructure data per the OC4IDS standard) would require authentication.

### TERTIARY ISSUE: LGA name mismatch between OCDS data and geoBoundaries

**Severity:** Low — resolvable with normalization.
**Description:** geoBoundaries uses different LGA naming than the OCDS portal. Some LGAs have duplicate names (Jaba/Njaba) or naming ambiguity (Kaura vs Kaura Namoda in Zamfara, Lere vs Surulere).

**Impact:** LGA-based filtering and allocation context will require a normalization crosswalk.

### Quarternary ISSUE: WorldPop data size

**Severity:** Low — manageable.
**Description:** The WorldPop 2020 population GeoTIFF is 495 MB. Processing requires either full download + spatial subsetting, or using a library that reads subsets.

**Impact:** Download and processing time, but not a blocker. Alternative: admin-level population totals would be smaller but are currently not found at documented paths.

---

## 8. Whether Phase 3 Can Safely Begin

**No.** Phase 3 (data ingestion) requires a working data source to retrieve and save raw snapshots. The primary OCDS data APIs are non-functional.

### What would need to happen before Phase 3

**Option A — API recovery or alternative access:**
1. Verify if the OCDS portal APIs recover (retry at a later time)
2. Find a data mirror or bulk download somewhere
3. Obtain API credentials for the OC4IDS backend
4. Extract data via browser automation from the portal's web interface

**Option B — Limited data collection:**
1. Use the browser to navigate the Table page and extract whatever data is rendered
2. Document the limitation clearly
3. Proceed with whatever data can be collected (may be a small subset)

**Option C — Document and pause:**
1. Document the blocker in the repository
2. Wait for intervention (API fix, data access granted, alternative source found)
3. Resume Phase 3 when data access is available

The implementation.md section 63 rules state: "Verify external APIs/endpoints before implementation" and "Never fabricate data." Proceeding to Phase 3 without a working data source would violate these rules.

**2026-09-19 Follow-up Investigation Result:** A full source-access recovery investigation was conducted on 2026-09-19. All documented OCDS and OC4IDS endpoints were re-verified and confirmed non-functional. Seven additional access paths were investigated. **A new working endpoint was discovered: `https://www.ocds.kdsg.gov.ng/Projects/fetchprojects/{page}`.** This endpoint provides programmatic access to 610 unique Kaduna State procurement projects across 1,379 raw records with a three-level multiplicity pattern (5 singletons, 523 double-occurrence, 82 quadruple-occurrence). Full record-identity and deduplication verification was completed on 2026-09-19. See Phase 2B documentation in `docs/progress.md` for full details.

**Conclusion:** The Phase 2 blocker is RESOLVED. A viable primary data source is available. Phase 3 is ready to begin but must NOT be started in this task.

---

## 9. Tests/Validation Commands Run and Results

### API endpoint tests

```bash
# OCDS portal - project_list
curl -s -w "%{http_code}" "https://www.ocds.kdsg.gov.ng/api/project_list"
# Result: 500 (empty body)

# OCDS portal - mda_list
curl -s -w "%{http_code}" "https://www.ocds.kdsg.gov.ng/api/mda_list"
# Result: 200, 18+ MDAs returned

# OCDS portal - mda_records
curl -s -w "%{http_code}" "https://www.ocds.kdsg.gov.ng/api/mda_records?mda_id=1"
# Result: 500 (empty body)

# OCDS portal - record
curl -s -w "%{http_code}" "https://www.ocds.kdsg.gov.ng/api/record/1"
# Result: 500 (empty body)

# OCDS portal - releases
curl -s -w "%{http_code}" "https://www.ocds.kdsg.gov.ng/api/releases/1"
# Result: 500 (empty body)

# OCDS portal - table_data (POST)
curl -X POST -H "Content-Type: application/json" -d '{}' "https://www.ocds.kdsg.gov.ng/Home/table_data"
# Result: 500 (empty body)

# OC4IDS backend - projects
curl -s -w "%{http_code}" "https://kadppa-backend-972168318932.us-central1.run.app/api/v1/projects?limit=2"
# Result: 500, "Operation projects.find() buffering timed out after 10000ms"

# OC4IDS backend - oc4ids export
curl -s -w "%{http_code}" "https://kadppa-backend-972168318932.us-central1.run.app/api/v1/exports/oc4ids?limit=2"
# Result: 500, "Failed to fetch OC4IDS data"

# OC4IDS backend - POST (auth check)
curl -X POST -H "Content-Type: application/json" -d '{"limit": 3}' "https://kadppa-backend-...run.app/api/v1/projects"
# Result: 401, "No token provided"
```

### Secondary source validation tests

```bash
# geoBoundaries API
curl "https://www.geoboundaries.org/api/current/gbOpen/NGA/ADM2/"
# Result: 200, JSON metadata with download URLs

# geoBoundaries ADM2 download
curl -L -o /tmp/test.geojson "https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/NGA/ADM2/geoBoundaries-NGA-ADM2.geojson"
# Result: 200, 9,422,551 bytes, 774 features, Kaduna LGAs found

# geoBoundaries ADM1 download
curl -L -o /tmp/kaduna_adm1.geojson "https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/NGA/ADM1/geoBoundaries-NGA-ADM1.geojson"
# Result: 200, 2,289,696 bytes, Kaduna State boundary confirmed

# WorldPop population GeoTIFF HEAD
curl -I "https://data.worldpop.org/GIS/Population/Global_2000_2020/2020/NGA/nga_ppp_2020.tif"
# Result: 200 OK, Content-Length: 495,162,703

# WorldPop WOPR API
curl "https://wopr.worldpop.org/api/v1.0/data"
# Result: 500, Slim Application Error

# Nominatim geocoding
curl "https://nominatim.openstreetmap.org/search?q=Kaduna+State&format=json&limit=1"
# Result: 200, Kaduna State relation returned (ID 3709353)

# Overpass API
curl -X POST -d '...query...' "https://overpass-api.de/api/interpreter"
# Result: 406 Not Acceptable
```

### Configuration validation

```bash
# Node.js package.json — valid JSON
# tsconfig.json — valid JSON
# vercel.json — valid JSON
# .env.example — contains only AI_API_KEY= and AI_MODEL= (no real secrets)
# requirements.txt — parseable Python requirements
```

---

## 10. Git Status and Commit Recommendation

### Git status

- **Repository:** Not initialized. No `.git` directory exists in `/home/asher/ordaciti/`.
- **Action needed:** `git init` then `git add .` then `git commit`

### Commit recommendation

**Do commit Phase 1 (repository skeleton).** All files are scaffolding, stubs, and documentation. No secrets, no fabricated data, no product scope beyond what implementation.md specifies.

**Do NOT commit Phase 3 data** until it exists and is verified. The `data/raw/` and `data/processed/` directories have `.gitkeep` files but no actual data.

**Commit message suggestion:**
```
feat: Add Ordaciti repository skeleton and source discovery report

- Phase 1: Create project structure per implementation.md section 38
  - Next.js App Router pages (landing, explorer, project detail, API)
  - Component and library stubs
  - Python script placeholders
  - Config files (package.json, tsconfig, vercel.json, .env.example, requirements.txt)
  - Documentation stubs (README, methodology, data-sources, limitations, ai-log)
- Phase 2: Source discovery report documenting Kaduna OCDS API status
  - Primary source APIs confirmed non-functional (HTTP 500)
  - Secondary sources (geoBoundaries, WorldPop, OSM) validated
  - Blocker identified: cannot proceed to Phase 3 until data access resolved
```

### Pre-commit verification

- [x] `.env.example` contains no real secrets
- [x] No fabricated data in any file
- [x] No product scope beyond implementation.md
- [x] No modifications to implementation.md
- [x] All required directories present per section 38
- [x] All required config files present per sections 36-37, 51-52

---

*End of report.*
