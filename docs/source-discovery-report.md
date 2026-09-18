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

*End of Phase 2 report.*
