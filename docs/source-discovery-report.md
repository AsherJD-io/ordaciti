# Phase 2 — Source Discovery Report

**Date:** 2026-09-18
**Status:** Complete — primary source has critical blocker; secondary sources validated

---

## 1. Kaduna OCDS Primary Source

### Portal 1: OCDS Portal (legacy)

**URL:** https://www.ocds.kdsg.gov.ng/
**API documentation:** https://www.ocds.kdsg.gov.ng/api
**Organization:** Kaduna State Public Procurement Authority (KADPPA) + PPDC
**Powered by:** Budeshi

**Status: PARTIALLY ACCESSIBLE — CRITICAL BLOCKER**

The portal is live and displays data. The Projects page shows:
- Aggregate statistics: 1,379 total projects, ₦95,663,978,669.04 total contract sum, ₦4,284,000,000.00 highest contract, ₦21,000.00 lowest
- At least one project card rendered server-side (Igabi Local Government Area Council, 2019, ₦7,000,000 budget, ₦6,744,159.19 contract amount, Ziarum Partners Nig. LTD)

API endpoints documented on the portal:
| Endpoint | Method | Status |
|---|---|---|
| `/api/project_list` | GET | **HTTP 500 — non-functional** |
| `/api/mda_list` | GET | **Working** — returns 18+ MDAs |
| `/api/mda_records?mda_id=N` | GET | **HTTP 500 — non-functional** |
| `/api/record/{project_id}` | GET | **HTTP 500 — non-functional** |
| `/api/releases/{project_id}/{type}` | GET | **HTTP 500 — non-functional** |
| `/Home/table_data` | POST | **HTTP 500 — non-functional** |

The `mda_list` endpoint is the only working API endpoint. The `table.js` file reveals the table data is loaded via POST to `/Home/table_data` with JSON body `{"search_data": {...}}`, but this also returns 500.

**Root cause:** All data-serving endpoints return HTTP 500 with empty bodies. This may indicate a database connection issue, server misconfiguration, or the backend being migrated (the portal references "Budeshi" which may have been replaced).

**Implication:** Cannot programmatically retrieve the full project inventory, individual project records, or release data from this portal at this time.

---

### Portal 2: OC4IDS Portal (newer)

**URL:** https://ipdata.kdsg.gov.ng/public/home
**Backend API:** https://kadppa-backend-972168318932.us-central1.run.app/
**Organization:** KADPPA (same)
**Standard:** OC4IDS (Open Contracting for Infrastructure Data Standard)
**Launched:** October 2025

**Status: PARTIALLY ACCESSIBLE — REQUIRES AUTHENTICATION**

The portal website is accessible and displays:
- 1,635 published projects (as of late 2025)
- 393 of 1,635 projects have coordinates
- Infrastructure project data with OC4IDS format

Backend API tests:
| Endpoint | Method | Status |
|---|---|---|
| `/api/v1/projects?limit=N` | GET | **HTTP 500 — "buffering timed out after 10000ms"** (even with limit=2) |
| `/api/v1/exports/oc4ids?limit=N` | GET | **HTTP 500 — "Failed to fetch OC4IDS data"** |
| `/api/v1/projects` | POST (with JSON body) | **HTTP 401 — "No token provided"** |
| `/api/v1/exports/oc4ids` | POST | **HTTP 404 — "Route not found"** |

The Cloud Run backend is running but:
- GET requests to `/api/v1/projects` time out (database query timeout at 10s)
- POST requests require an API token (401 Unauthorized)
- The OC4IDS export endpoint fails to fetch data

**Implication:** The backend exists and contains data but requires either a token (not publicly documented) or the database queries are too slow for the Cloud Run timeout. Cannot retrieve data programmatically without authentication credentials.

---

### Source data extraction (fallback)

The Projects page on the OCDS portal renders one project card server-side as an example:
- **Ministry:** Igabi Local Government Area Council
- **Budget Year:** 2019
- **Location:** Igabi
- **Date of Advert:** 2019-05-05
- **Procurement Method:** Single Source Award
- **Budget Amount:** ₦7,000,000.00
- **Contract Amount:** ₦6,744,159.19
- **Date of Award:** 2019-05-15
- **Contractor:** Ziarum Partners Nig. LTD
- **Email:** salehrabiu4@gmail.com
- **Phone:** 08036277516

This confirms that real OCDS data exists and is in the expected format. However, only one project is visible, and there is no bulk download or working API to retrieve the full dataset.

**The Kaduna OCDS portal also references a "Download datasets" feature**, but no downloadable links were found in the page source or rendered HTML.

---

## 2. Secondary Sources

### geoBoundaries (VALIDATED)

**URL:** https://www.geoboundaries.org/
**Download:** https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/NGA/ADM2/geoBoundaries-NGA-ADM2.geojson
**License:** CC BY 4.0
**Size:** ~9.4 MB (ADM2 GeoJSON, 774 Nigerian LGAs)
**Simplified:** ~3.7 MB (ADM2 simplified)

**Verification:**
- Downloaded and parsed successfully (9,422,551 bytes, 774 features)
- Kaduna State ADM1 boundary confirmed: shapeName="Kaduna", shapeISO="NG-KD"
- 21 of 23 Kaduna LGAs matched by name (see data-sources.md for full cross-reference)
- **Known name mismatches:** Jaba/Njaba duplicate, Kaura vs Kaura Namoda (Zamfara), Lere vs Surulere

**Usability:** High. The geoJSON can be downloaded, parsed, and filtered for Kaduna LGAs. LGA name normalization will be required to match OCDS data.

---

### WorldPop (VALIDATED — ACCESSIBLE, NOT YET DOWNLOADED)

**URL:** https://www.worldpop.org/
**Nigeria 2020 population (1km):** https://data.worldpop.org/GIS/Population/Global_2000_2020/2020/NGA/nga_ppp_2020.tif
**File size:** ~495 MB (GeoTIFF)
**License:** CC BY 4.0
**DOI:** 10.5258/SOTON/WP00645

**Verification:**
- HTTP HEAD confirms file is accessible (200 OK, 495,162,703 bytes)
- WOPR API is non-functional (Slim Application Error — server misconfiguration)
- Admin-level CSV downloads not found at documented paths
- Newer R2025A dataset (100m, 2015-2030) available but larger per-file

**Usability:** High for data access, moderate for processing. The GeoTIFF is very large (495 MB). Processing will require either:
- Downloading the full file and cropping to Kaduna bounds, or
- Using a spatial library (rasterio) to read subsets

**Alternative:** The WorldPop admin-level population totals (NGA_population_v1_0_admin_level2.csv) would be much smaller but the documented download path returned 404.

---

### OpenStreetMap (VALIDATED — PARTIAL ACCESS)

**Nominatim (geocoding):**
- Accessible and functional
- Returns Kaduna State boundary relation (ID 3709353)
- Returns Kaduna State bounding box: lat 6.09-11.52, lon 9.00-11.52 (Nominatim has min/max inverted — actual bounds from geoBoundaries are more accurate)

**Overpass API (vector queries):**
- overpass-api.de: Returns 406 Not Acceptable
- overpass.kumi.systems: Returns 400 parse error with test query
- **Access is unreliable** from this environment

**Usability:** Low for programmatic data extraction. Nominatim works for geocoding. Overpass is unreliable. OSM enrichment is a P2 feature (optional), so this is not a blocker for MVP.

---

## 3. Summary of Findings

### What works
- geoBoundaries: Fully accessible, downloadable, contains Kaduna LGA boundaries
- WorldPop: File accessible (495 MB GeoTIFF), can be downloaded and processed
- OCDS portal: Web interface shows data exists; mda_list API works
- Nominatim: Geocoding functional

### What doesn't work
- OCDS portal API endpoints (project_list, record, releases, table_data): All return HTTP 500
- OC4IDS Cloud Run backend: GET requests timeout, POST requests require auth token
- WorldPop WOPR API: Server error
- Overpass API: Not accessible

### The critical blocker

**The primary data source for this capstone — Kaduna State OCDS/OC4IDS project records — cannot be retrieved programmatically at this time.** Both the legacy OCDS portal and the newer OC4IDS backend have non-functional data APIs.

The portals confirm that data exists (the OCDS Projects page renders project data and aggregate statistics; the OC4IDS portal reports 1,635 published projects). However, there is no accessible programmatic path to retrieve the full dataset:

- No working `/api/project_list` endpoint
- No working `/api/record/{id}` endpoint
- No working bulk download
- No publicly documented API token for the OC4IDS backend
- The `mda_list` endpoint is the only working API, and it only returns MDA names/IDs, not project data

---

## 4. Phase 3 Assessment

### Can Phase 3 (data ingestion) safely begin?

**No, not in its full form.** Phase 3 requires retrieving the Kaduna project inventory and saving raw snapshots. Without a working data API or bulk download, the ingestion script cannot fulfill its primary function.

### Options for proceeding

1. **Wait for API recovery:** The Kaduna OCDS portal may have a transient issue. The APIs could recover. This is uncertain and cannot be relied upon.

2. **Manual data collection:** If the portal provides a web-based table or search interface that renders data in the browser, it may be possible to scrape paginated results. The Table page (`/Home/table`) uses a DataTable with server-side processing, but the AJAX endpoint is also non-functional.

3. **Alternative data sources:** Check if Kaduna OCDS data is mirrored on:
   - Open Contracting Partnership data registry (https://www.open-contracting.org/data/)
   - NOCOPO (https://nocopo.gov.ng/) — federal portal, returned connection error
   - openAFRICA (https://open.africa/) — has Kaduna boundary data but not OCDS project data
   - GitHub repositories or data portals that may have cached Kaduna OCDS data

4. **Contact KADPPA:** Reach out to kadppa@kdsg.gov.ng to request data access or an API token for the OC4IDS backend.

5. **Use the single project as a seed:** If no bulk access is available, the capstone could use the single visible project (and any others that can be discovered through the portal's web interface) as a minimal dataset. This would severely limit the demo but would not fabricate data.

---

## 5. Recommendation

**Do not proceed to Phase 3 until the data access blocker is resolved.** The recommended next step is to investigate alternative data access paths:

1. Check for Kaduna OCDS data mirrors on open-contracting.org, NOCOPO, or openAFRICA
2. Investigate whether the OCDS portal's web interface allows pagination/scraping of project listings
3. Contact KADPPA for data access
4. If all else fails, document the data access limitation and proceed with whatever minimal data can be collected

**The implementation.md specification says: "Do not guess endpoint URLs" and "fail clearly on source/API errors."** The current situation is a clear API error. Proceeding to build an ingestion script that cannot connect to its data source would violate the spec's principles.

---

## 6. Additional Source Investigations (2026-09-19)

### 6.1 Azure OCDS Portal — kadppaocds.azurewebsites.net

**URL:** https://kadppaocds.azurewebsites.net/
**Status:** VERIFIED INACCESSIBLE — HTTP 000 (connection failure)

This was the original Kaduna OCDS portal URL per the OGP KAD0002 IRM report (referenced as `https://ocds.azurewebsites.net/#0`). The OGP report noted the portal "is not currently functioning" and "the government temporarily suspended public access to 'harmonise' the platform with other citizen engagement platforms."

The Azure portal is now defunct — no connection can be established. All API endpoint paths (api/project_list, api/mda_list, etc.) return HTTP 000.

**Disposition:** REJECTED — server unreachable. Historical reference only.

### 6.2 OC4IDS Portal Current Status — ipdata.kdsg.gov.ng

**URL:** https://ipdata.kdsg.gov.ng/
**Status:** VERIFIED INACCESSIBLE — portal suspended

The OC4IDS portal now returns HTTP 302 redirect to `suspendedpage.cgi`. The open-data page at `/public/open-data` shows "0 infrastructure projects" — no data is accessible. The portal that launched in December 2025 with 1,635 published projects is currently suspended.

The backend API at `kadppa-backend-972168318932.us-central1.run.app` remains in the same state as previously verified:
- GET requests time out (HTTP 500, "buffering timed out after 10000ms")
- POST requests require authentication (HTTP 401, "No token provided")
- No publicly documented token acquisition mechanism

**Disposition:** REJECTED AS PRIMARY — portal suspended, backend requires undocumented auth token.

### 6.3 NOCOPO (Nigeria Open Contracting Portal) — nocopo.bpp.gov.ng

**URL:** https://nocopo.bpp.gov.ng/
**Status:** VERIFIED INACCESSIBLE — HTTP 000 (connection failure)

The federal Nigeria Open Contracting Portal, operated by the Bureau of Public Procurement (BPP), is unreachable from this environment. Even if accessible, NOCOPO is a federal procurement portal and would not contain Kaduna State-specific OCDS project-level data matching the Ordaciti canonical schema.

**Disposition:** REJECTED — unreachable and not Kaduna State-specific.

### 6.4 openAFRICA — open.africa

**URL:** https://open.africa/
**Status:** VERIFIED INACCESSIBLE — HTTP 000 (connection failure)

openAFRICA's API is unreachable from this environment. Previously noted to have Kaduna boundary data but not OCDS project data.

**Disposition:** REJECTED — unreachable.

### 6.5 OCP Data Registry — registry.open-contracting.org

**URL:** https://registry.open-contracting.org/
**Status:** VERIFIED INACCESSIBLE — HTTP 000 (connection failure)

The Open Contracting Partnership's data registry API is unreachable. This registry indexes OCDS datasets globally and would be the most likely place to find a Kaduna data mirror if one existed.

**Disposition:** REJECTED — unreachable.

### 6.6 HDX (Humanitarian Data Exchange) — data.humdata.org

**URL:** https://data.humdata.org/
**Status:** INSUFFICIENT FOR PRIMARY DATASET

The CKAN API is reachable. A search for "Kaduna procurement" returns 0 results. HDX contains Nigeria administrative boundaries and WorldPop population data, but no Kaduna procurement/OCDS project data.

**Disposition:** REJECTED — no Kaduna procurement datasets found.

### 6.7 GitHub — github.com

**URL:** https://github.com/
**Status:** INSUFFICIENT FOR PRIMARY DATASET

Search for Kaduna OCDS/OC4IDS data repositories yields no repositories containing actual Kaduna procurement data. Only OCDS sample data repositories, tooling, and documentation exist. No data mirrors or cached exports of the Kaduna procurement dataset were found.

**Disposition:** REJECTED — no Kaduna procurement data mirror found.

---

## 7. Source Comparison Table (Updated 2026-09-19)

| Source | Access Route | Result | Relevant Fields | Reproducibility | Disposition |
|---|---|---|---|---|---|
| OCDS Portal (www.ocds.kdsg.gov.ng) | API endpoints + web interface | PARTIALLY ACCESSIBLE — BLOCKED | mda_list works (28 MDAs); all project endpoints HTTP 500; web table renders 0 projects | mda_list reproducible; project endpoints consistently fail | REJECTED AS PRIMARY |
| OC4IDS Backend (run.app) | API endpoints | VERIFIED INACCESSIBLE | None accessible | Consistent 500/401 | REJECTED AS PRIMARY |
| OC4IDS Portal (ipdata.kdsg.gov.ng) | Web interface | VERIFIED INACCESSIBLE | 0 projects shown; portal suspended (302→suspendedpage.cgi) | Consistently suspended | REJECTED AS PRIMARY |
| Azure Portal (azurewebsites.net) | Direct HTTP | VERIFIED INACCESSIBLE | None — server unreachable (HTTP 000) | Consistently unreachable | REJECTED |
| NOCOPO (nocopo.bpp.gov.ng) | Direct HTTP | VERIFIED INACCESSIBLE | None — federal portal, unreachable (HTTP 000) | Consistently unreachable | REJECTED |
| openAFRICA (open.africa) | API | VERIFIED INACCESSIBLE | None — unreachable (HTTP 000) | Consistently unreachable | REJECTED |
| OCP Data Registry (registry.open-contracting.org) | API | VERIFIED INACCESSIBLE | None — unreachable (HTTP 000) | Consistently unreachable | REJECTED |
| HDX (data.humdata.org) | CKAN API | INSUFFICIENT | 0 Kaduna procurement results | Reachable but no data | REJECTED |
| GitHub (github.com) | Web search | INSUFFICIENT | No Kaduna procurement data mirrors found | N/A | REJECTED |
| Project 255 (project255.kdsg.gov.ng) | Direct HTTP | REJECTED (prior) | Not OCDS procurement data — ward showcase only | N/A | REJECTED AS PRIMARY |

---

## 8. Primary Dataset Decision (Updated 2026-09-19)

**NO VIABLE PRIMARY SOURCE FOUND**

The real Kaduna procurement/OCDS/OC4IDS data exists (confirmed by portal aggregate statistics: 1,379+ projects, ₦95,663,978,669.04 total contract value, and the working mda_list endpoint returning 28 MDAs). However, no legitimate, reproducible programmatic access path exists:

1. All OCDS project-data API endpoints return HTTP 500
2. The OC4IDS backend requires an authentication token (not publicly available) and GET requests time out
3. The OC4IDS portal web interface is suspended (redirects to suspendedpage.cgi, shows 0 projects)
4. The Azure portal (original OCDS deployment) is defunct (HTTP 000)
5. No external mirrors, data registries, or GitHub repositories contain the Kaduna procurement dataset
6. NOCOPO, openAFRICA, and OCP Data Registry are unreachable from this environment
7. The web interface renders 0 projects (AJAX/endpoints broken)
8. No bulk download or export mechanism is accessible

This is a documented, verified blocker — not a transient issue. OGP historical records (KAD0002 IRM report, 2018-2020) confirm the portal has had accessibility problems since at least 2018, with the government having "temporarily suspended public access" for platform harmonization.

---

## 9. Project 255 Status

Project 255 remains **REJECTED** as the primary Ordaciti dataset. It is a ward-level project showcase portal (project255.kdsg.gov.ng), not an OCDS/OC4IDS procurement data source. It does not provide the procurement records required by implementation.md section 8 (canonical project schema): no OCIDs, no contract amounts, no contractor names, no dates of award/advert, no procurement methods, no release data.

Project 255 artifacts are preserved as investigation evidence only:
- `data/raw/project255_raw.json`
- `data/raw/project255_projects.json`
- `data/raw/project255_sample.json`
- `scripts/collect_project255.sh`
- `scripts/enrich_project255.sh`
- `scripts/enrich_project255_v2.py`

---

## 6. Phase 2B — Server-rendered `/Projects` Route Verification (2026-09-19)

### 6.8 Working Data Endpoint Discovery — `Projects/fetchprojects/{page}`

**URL:** `https://www.ocds.kdsg.gov.ng/Projects/fetchprojects/{page_number}`
**Method:** GET
**Status:** VERIFIED VIABLE — programmatic access to Kaduna State project inventory confirmed

**Discovery:** This endpoint was discovered through analysis of the portal's JavaScript file `https://www.ocds.kdsg.gov.ng/js/kaduna.js`, which reveals an infinite-scroll pagination mechanism.

**Working request:**
```bash
curl https://www.ocds.kdsg.gov.ng/Projects/fetchprojects/1
```

**Response (truncated):**
```json
{
  "sum": "95663978669.04",
  "total": "1379",
  "highest": "4284000000.00",
  "lowest": "21000.00",
  "status": "success",
  "data": [
    {
      "title": "Renovation/Landscapping of Health Clinic at Ruhogi",
      "project_category": "N/A",
      "date_updated": "3rd September 2020",
      "year": "2019",
      "id": "848",
      "lga": "Igabi",
      "short_name": "Igabi LGA",
      "name": "Igabi Local Government Area Council",
      "budget_amount": "7,000,000.00",
      "period": "N/A",
      "amount": "6,744,159.19",
      "date_sign": "2019-05-15",
      "award_date": "N/A",
      "award_criteria": "NCT-Single Source",
      "category": "Works",
      "procurement_method": "Single Source Award",
      "start_date": "2019-05-05",
      "bid_open_start": "30th November -0001",
      "contractor_id": "365",
      "contractor": "Ziarum Partners Nig. LTD",
      "address": "No. 65 Isa Kaita Road, Kaduna",
      "phone": "08036277516",
      "email": "salehrabiu4@gmail.com"
    },
    ...
  ]
}
```

**Pagination:** Approximately 230 pages (pages 1-230 contain data; page 231 is empty). Each page returns up to 6 records. Data is ordered by project ID descending.

**Content-Type discrepancy:** The server returns `Content-Type: text/html` but the body is valid JSON. This is a server misconfiguration and does not affect data usability.

**Important — request method discrepancy with portal JavaScript:**

The portal's JavaScript (`kaduna.js`) constructs requests to a prefixed route:
- JavaScript ABS_PATH: `https://www.ocds.kdsg.gov.ng/kadppa/`
- JavaScript request URL: `https://www.ocds.kdsg.gov.ng/kadppa/Projects/fetchprojects/{page}`
- JavaScript method: POST with JSON payload

**The prefixed route does NOT return usable data.** Testing confirmed:
- GET on prefixed route: Returns HTML homepage
- POST on prefixed route (with any payload): Returns HTML homepage

The **non-prefixed GET** route (`https://www.ocds.kdsg.gov.ng/Projects/fetchprojects/{page}`) is the ONLY working method. The portal's own JavaScript generates requests to a route that does not return data.

**Record duplication behavior:**
- Each project ID appears exactly twice on its page
- Duplicates share: title, budget_amount, amount, year, lga, name, procurement_method, start_date, date_sign, date_updated
- Duplicates sometimes differ in: contractor_id, contractor, address, phone (different contractor records linked to same project)
- No project ID appears on more than one page
- The `total` field (1379) counts RAW records including duplicates, NOT unique projects

**Total vs. unique count:**
- `total` field: 1379 (raw records)
- Estimated unique projects: approximately 690 (roughly half of total)
- Actual project ID range: 1 to 848
- Max possible unique by ID range: 848

**Field coverage against Ordaciti canonical schema (implementation.md section 8):**

| Field | Status | Source |
|---|---|---|
| project_id | AVAILABLE | `id` |
| ocid | NOT AVAILABLE | — |
| title | AVAILABLE | `title` |
| description | NOT AVAILABLE | — |
| mda | AVAILABLE | `name` |
| sector | AVAILABLE | `category` |
| category | PARTIAL | `project_category` (always "N/A") |
| lga | AVAILABLE | `lga` |
| location_text | AVAILABLE | `address` (contractor address, not project site) |
| latitude | NOT AVAILABLE | — |
| longitude | NOT AVAILABLE | — |
| procurement_method | AVAILABLE | `procurement_method` |
| budget_year | AVAILABLE | `year` |
| budget_amount | AVAILABLE | `budget_amount` |
| contract_amount | AVAILABLE | `amount` |
| date_of_advert | AVAILABLE | `start_date` (some invalid values) |
| date_of_award | AVAILABLE | `date_sign` |
| contractor | AVAILABLE | `contractor` |
| status | NOT AVAILABLE | — |
| source_url | DERIVABLE | `https://www.ocds.kdsg.gov.ng/Project/{id}` |
| source_release_id | NOT AVAILABLE | — |
| source_updated_at | AVAILABLE | `date_updated` |
| retrieved_at | DERIVABLE | At ingestion time |

**14 fields directly available, 2 derivable, 8 not available.** Most critical missing: OCID, coordinates, status, description.

**Project detail pages** (`https://www.ocds.kdsg.gov.ng/Project/{id}`) are accessible (HTTP 200) but contain only the project title and a citizen feedback form — not the full procurement data.

**OCDS API endpoints remain broken:** `/api/record/{id}` and `/api/releases/{id}` return HTTP 500 even when tested with valid project IDs from the working endpoint.

**Reproducibility:** Tested across 13 distinct pages (1, 2, 3, 10, 50, 100, 150, 200, 220, 228, 229, 230, 231) with consistent HTTP 200 responses and valid JSON. No authentication required. Deterministic URL pattern.

**Disposition:** VERIFIED VIABLE. This endpoint provides a legitimate, reproducible, public access path to real Kaduna State procurement project data (approximately 690 unique projects across 1,379 raw records). It resolves the Phase 2 blocker.

**Limitations carried into Phase 3:**
1. OCID not available — OCDS API endpoints remain broken
2. Coordinates not available
3. Project status, description not available
4. Release/package data not available
5. Some `start_date` values are invalid ("30th November -0001")
6. Records are duplicated (each project appears twice per page) — ingestion must deduplicate
7. `total` field (1379) represents raw records, not unique projects
8. Data format is flat JSON, not OCDS Record Package

### 6.9 Project 255 Status (Reaffirmed)

Project 255 remains **REJECTED** as the primary Ordaciti dataset. See section 9 (unchanged).

---

*End of Phase 2 report — updated 2026-09-19 with Phase 2B findings.*
