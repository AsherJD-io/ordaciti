# Methodology

*This document explains the analytical methods used by Ordaciti.*

**Status:** Draft — to be completed after data processing.

## Overview

Ordaciti transforms individual government contract records into contextual intelligence by connecting projects across time, geography, and infrastructure context.

## Normalization

[To be completed after Phase 4 — describe text normalization, LGA/MDA/contractor name canonicalization, date parsing, monetary field parsing, original preservation strategy.]

## Project Clustering

[To be completed after Phase 5 — describe the hybrid clustering approach: normalized text similarity via rapidfuzz, semantic similarity, same-LGA rules, geographic proximity, sector/category matching, and intervention keyword detection.]

## Repeat Intervention Detection

[To be completed after Phase 6 — describe how REPEAT_INTERVENTION signals are identified from clustered projects sharing location/asset/infrastructure function across time.]

## Contractor Recurrence

[To be completed after Phase 6 — describe CONTRACTOR_RECURRENCE detection: same contractor appearing across related project clusters.]

## Evidence Completeness

[To be completed after Phase 7 — describe the lifecycle evidence matrix: planning, tender, award, contract, amendment, implementation, payment, completion, termination — each rated available/partial/missing/unknown.]

## Allocation Context

[To be completed after Phase 9 — describe LGA-level aggregation: project_count, recorded_contract_value, population, value_per_100k_population, projects_per_100k_population, and sector-specific versions where data permits.]

## Record Change Detection

[To be completed after Phase 7 — describe comparison of multiple OCDS releases for contract_amount, contractor, status, implementation_status, completion_date, contract_end.]

## System Context

[To be completed after Phase 9 — describe lightweight contextual relationships: road → nearby roads → transport corridor; hospital → nearby health facilities → health-service network; school → nearby schools → education-service network.]

## AI Interpretation

[To be completed after Phase 10 — describe how the LLM serves as an interpretation layer over structured evidence objects, the system prompt rules, input construction, output validation, and limitations.]

## Limitations of Methods

- Clustering is an analytical construct, not an official designation.
- Similarity scores are internal metadata, not certainty.
- Population data has known limitations (see data-sources.md).
- Location ambiguity in source data affects geographic analysis.
- No causal inference is performed.
