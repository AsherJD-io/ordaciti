# Data Sources

*This document records every external data source used by Ordaciti.*

**Status:** Partially complete — primary source verified, secondary sources identified.

---

## Primary Source: Kaduna State OCDS/OC4IDS

**Source name:** Kaduna State Open Contracting Portal / KADPPA Open Contracting Portal

**Organization:** Kaduna State Public Procurement Authority (KADPPA), in collaboration with the Public and Private Development Center (PPDC)

**Portal URL:** https://www.ocds.kdsg.gov.ng/

**Newer OC4IDS portal:** https://ipdata.kdsg.gov.ng/public/home

**API documentation:** https://www.ocds.kdsg.gov.ng/api

**Data used:** OCDS project records, release packages, contract-level data

**Status:** Portal accessible; API endpoints returning HTTP 500. Web interface renders 0 projects (AJAX endpoint broken). Data confirmed present (portal displays aggregate statistics: 1,379 projects, ₦95.6B total contract sum).

**2026-09-19 Phase 2B discovery — working data endpoint found:**

A working public JSON endpoint was discovered at `https://www.ocds.kdsg.gov.ng/Projects/fetchprojects/{page}` via analysis of the portal's JavaScript (`kaduna.js`).

- **Endpoint:** `https://www.ocds.kdsg.gov.ng/Projects/fetchprojects/{page_number}`
- **Method:** GET (non-prefixed route is the ONLY working method)
- **Status:** VERIFIED VIABLE — returns valid JSON with project records
- **Pagination:** 230 populated pages (pages 1-230), page 231 empty. 6 records per page in a rolling-window overlap pattern.
- **Record count:** `total` field = 1379 = exact raw record count (confirmed by full enumeration of all 230 populated pages). Distinct project IDs = **610** (measured, not estimated). ID range: 2 to 848 (ID 1 missing; 238 gaps in range).
- **Record duplication (reconciled after complete page-by-page analysis):**

The endpoint returns records with a three-level multiplicity pattern that is more complex than simple intra-page duplication:

| Multiplicity | IDs | Raw records | Description |
|-------------|-----|-------------|-------------|
| 1 (once) | 5 | 5 | Singleton projects |
| 2 (twice) | 523 | 1046 | Intra-page duplicates — 2 identical copies on same page |
| 4 (4×) | 82 | 328 | Cross-page + intra-page: 3 copies on one page + 1 on adjacent page |

**Arithmetic:** 5 × 1 + 523 × 2 + 82 × 4 = 1379 ✓

**Multiplicity-2 IDs (523, 85.7%):** Appear exactly twice, both on the same page. The two records are byte-for-byte identical.

**Multiplicity-4 IDs (82, 13.4%):** Appear 4 times across 2 adjacent pages (3 on one page + 1 on the adjacent). Within each page, copies with the same contractor are identical. Across pages, records with different contractors differ ONLY in contractor-related fields (contractor_id, contractor, address, phone, email). All other fields (title, budget_amount, amount, date_sign, name/MDA, lga, procurement_method, etc.) are identical.

**Record equality:** Verified for ALL 605 repeated ID groups. 523 groups are fully identical; 82 groups differ ONLY in contractor fields. No project ID has different title, budget, amount, dates, MDA, LGA, or procurement method.

**Total field reconciliation:** Endpoint `total` = 1379 = sum of raw records (229 × 6 + 1 × 5 = 1379). Distinct IDs = 610. `total` equals raw count, NOT distinct count.

**Source record identity:** Composite key of project ID + contractor.
- **Content-Type:** Server returns `text/html` but body is valid JSON (misconfiguration).
- **Request-method discrepancy:** The portal's JavaScript (`kaduna.js`) uses POST to a `/kadppa/` prefixed route, but that prefixed route returns HTML, not JSON. Only the non-prefixed GET route works.
- **OCDS API endpoints:** `/api/record/{id}` and `/api/releases/{id}` remain HTTP 500.
- **Project detail pages:** `/Project/{id}` accessible but contain only title + feedback form.

**Field coverage (14 available, 2 derivable, 8 not available):** project_id, title, mda, sector, lga, procurement_method, budget_year, budget_amount, contract_amount, date_of_advert, date_of_award, contractor, source_updated_at available. ocid, description, latitude, longitude, status, source_release_id NOT available. source_url and retrieved_at derivable. Repeated records do NOT introduce conflicting values — all duplicates are identical.

**Newer OC4IDS backend (Cloud Run) requires API token for programmatic access; OC4IDS portal now suspended (redirects to suspendedpage.cgi, shows 0 projects). Previous Azure deployment (kadppaocds.azurewebsites.net) is defunct (HTTP 000).**

**Coverage:** Kaduna State, Nigeria. Approximately 1,379+ projects registered on the OCDS portal (per aggregate statistics). The newer OC4IDS portal reported 1,635 published projects (as of late 2025), with 393 having coordinates — but this portal is now suspended.

**Date range:** Projects from 2019 onwards observed in portal samples.

**Known limitations:**
- API endpoints currently non-functional (HTTP 500)
- Data publication gaps documented by CoST Kaduna (incomplete datasets, delayed publication)
- Some contract award information did not comply with OCDS format (per OGP audit)
- Location data may be incomplete (only 393 of 1,635 projects have coordinates on OC4IDS portal)
- Records may have only one release (limiting record-change analysis)

**Retrieval date:** 2026-09-18 (initial verification); 2026-09-19 (follow-up verification — portal suspended, Azure defunct, no new access paths found)

**Verification method:** Direct HTTP inspection of API endpoints, browser-based portal navigation, JavaScript source analysis, external mirror registry queries (HDX, OCP Registry, openAFRICA, GitHub)

---

## Secondary Source: geoBoundaries

**Source name:** geoBoundaries Global Database of Political Administrative Boundaries

**Organization:** William & Mary geoLab (wmgeolab)

**URL:** https://www.geoboundaries.org/

**GitHub repository:** https://github.com/wmgeolab/geoBoundaries

**Data used:** Nigeria ADM2 (Local Government Area) boundaries as GeoJSON

**Direct download URL (ADM2, all Nigeria):**
https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/NGA/ADM2/geoBoundaries-NGA-ADM2.geojson

**Direct download URL (ADM1, state-level):**
https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/NGA/ADM1/geoBoundaries-NGA-ADM1.geojson

**Simplified geometry (ADM2):**
https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/NGA/ADM2/geoBoundaries-NGA-ADM2_simplified.geojson

**API endpoint:** https://www.geoboundaries.org/api/current/gbOpen/NGA/ADM2/

**License:** CC BY 4.0

**Coverage:** All 774 Nigerian LGAs (ADM2), 37 states (ADM1)

**Kaduna State LGAs verified in dataset:** 21 of 23 Kaduna LGAs matched by name (see below). The geoBoundaries naming differs slightly from official Kaduna LGA names.

**Boundary source:** GRID3 Nigeria Local Government Area Boundaries

**Retrieval date:** 2026-09-18

**Known limitations:**
- LGA names may not exactly match OCDS portal LGA names (normalization required)
- geoBoundaries does not include parent-state attribute in ADM2 features directly — cross-referencing needed
- Jaba appears as both "Jaba" and "Njaba" (likely a duplicate/naming variant)
- Kaura appears alongside "Kaura Namoda" (a different LGA in Zamfara State, not Kaduna)
- Lere matches alongside "Surulere" (Surulere is a different LGA — careful matching required)

**Kaduna LGA name matching status:**

| geoBoundaries name | Official Kaduna LGA | Match confidence |
|---|---|---|
| Birnin Gwari | Birnin Gwari | High |
| Chikun | Chikun | High |
| Giwa | Giwa | High |
| Gwagwalada | Gwagwalada | High |
| Igabi | Igabi | High |
| Ikara | Ikara | High |
| Jaba / Njaba | Jaba | Medium (duplicate) |
| Jema'A | Jema'a | High |
| Kachia | Kachia | High |
| Kaduna North | Kaduna North | High |
| Kaduna South | Kaduna South | High |
| Kagarko | Kagarko | High |
| Kajuru | Kajuru | High |
| Kaura | Kaura | Medium (Kaura Namoda is Zamfara) |
| Kubau | Kubau | High |
| Kudan | Kudan | High |
| Lere | Lere | Medium (Surulere also matches) |
| Makarfi | Makarfi | High |
| Sanga | Sanga | High |
| Soba | Soba | High |
| Zangon Kataf | Zangon Kataf | High |
| Zaria | Zaria | High |
| Kaduna North | Kaduna North | High |

*Note: 21 of 23 Kaduna LGAs found. Missing: **Kachia** appears once but check for **Kasuwa** or alternative spellings. Also possible missing: some LGAs may use different naming in the dataset.*

---

## Secondary Source: WorldPop

**Source name:** WorldPop Gridded Population Estimates

**Organization:** WorldPop Research Group, University of Southampton

**URL:** https://www.worldpop.org/

**Data used:** Nigeria 2020 population density (1km resolution) GeoTIFF for LGA-level aggregation

**Direct download URL:**
https://data.worldpop.org/GIS/Population/Global_2000_2020/2020/NGA/nga_ppp_2020.tif

**File size:** ~495 MB (GeoTIFF)

**License:** CC BY 4.0

**Resolution:** 1km (3 arc seconds)

**Projection:** WGS84 (Geographic Coordinate System)

**Units:** Number of people per pixel

**Methodology:** Random Forest-based dasymetric redistribution

**DOI:** 10.5258/SOTON/WP00645

**Production date:** 2018-11-01

**Year represented:** 2020

**Coverage:** Entire Nigeria (including Kaduna State)

**Retrieval date:** 2026-09-18 (accessibility verified; download not yet performed)

**Alternative newer data:** WorldPop R2025A (2015-2030 series) available at 100m resolution — https://hub.worldpop.org/geodata/summary?id=74736 (150.93 MB for Nigeria)

**Known limitations:**
- 1km resolution may not capture intra-LGA variation precisely
- Gridded data requires spatial intersection with LGA boundaries for population totals
- 2020 data may not reflect current population
- WOPR API is currently non-functional (server error)
- Admin-level CSV downloads not found at documented paths
- GeoTIFF is large (495 MB) — consider processing only Kaduna subset

---

## Secondary Source: OpenStreetMap

**Source name:** OpenStreetMap

**Organization:** OpenStreetMap contributors

**URL:** https://www.openstreetmap.org/

**License:** ODbL 1.0

**Data used:** Geographic/infrastructure context — schools, health facilities, roads, transport corridors

**Access methods:**
- **Nominatim** (geocoding): https://nominatim.openstreetmap.org/ — accessible, returns Kaduna State boundary and coordinates
- **Overpass API** (vector data queries): https://overpass-api.de/api/interpreter — returns 406 Not Acceptable without proper Accept headers; mirror at overpass.kumi.systems also problematic

**Kaduna State OSM relation ID:** 3709353

**Kaduna State bounding box (from Nominatim):**
- North: 11.5238°N
- South: 6.0865°N
- East: 8.8235°E
- West: 9.0006°W  (Note: Nominatim has min/max swapped — actual west is ~6.09° and east is ~8.82°)

**Note:** The geoBoundaries bounds are more accurate:
- Min lon: 6.0922, Max lon: 8.8183
- Min lat: 9.0006, Max lat: 11.5240

**Retrieval date:** 2026-09-18 (Nominatim verified; Overpass query capability unconfirmed)

**Known limitations:**
- Overpass API access unreliable from this environment
- OSM data completeness varies by region
- Infrastructure data (schools, hospitals, roads) may be incomplete for Kaduna
- This is an optional enrichment source (P2) — not required for MVP

---

## Source Traceability

All sources will be recorded with:
- Source name
- Organization
- URL
- Data used
- Retrieval date
- Coverage
- Known limitations
