# Limitations

*This document describes the known limitations of the Ordaciti capstone.*

**Status:** Draft — to be reviewed and completed after full implementation.

---

## 1. Kaduna-only scope

Ordaciti is a bounded prototype for Kaduna State, Nigeria. Findings and patterns discovered here do not generalize to other Nigerian states or to Nigeria as a whole. The architecture is designed to be reusable through new data adapters, but no other geography is implemented in this capstone.

## 2. Source availability limitations

The Kaduna State OCDS portal (https://www.ocds.kdsg.gov.ng/) and the newer OC4IDS portal (https://ipdata.kdsg.gov.ng/) are the primary data sources. As of the initial verification date (2026-09-18), both portals' API endpoints returned HTTP 500 errors. The portals display data (the OCDS Projects page shows aggregate statistics and at least one project record), confirming that a database exists, but programmatic access is currently unreliable. This may affect the completeness of the dataset used in the capstone.

## 3. Missing implementation records

Many projects in the Kaduna OCDS data lack implementation-stage evidence (completion reports, payment records, photographs). The evidence-gap signal will reflect this. "Not found in the available source" is not the same as "did not happen."

## 4. Population data limitations

WorldPop 2020 gridded population data (1km resolution) is used as the population context source. Limitations include:
- 2020 data may not reflect current population
- 1km resolution provides aggregate-level accuracy, not household-level precision
- Gridded estimates are model-based and carry uncertainty
- LGA-level population totals require spatial intersection that may introduce edge effects

## 5. Location ambiguity

Project location data in the OCDS portal is often textual (e.g., "Igabi", "Kawo District") rather than coordinate-based. Only 393 of 1,635 projects on the OC4IDS portal have coordinates. This limits geographic proximity analysis and map displays. Textual locations require normalization and matching to LGA boundaries.

## 6. Project clustering uncertainty

Project clusters are analytical constructs, not official government designations. Similarity scores are internal metadata and should not be presented as certainty. Clustering may group unrelated projects or fail to group related ones. The hybrid approach (text similarity + geographic + sector + intervention keywords) reduces but does not eliminate this uncertainty.

## 7. Incomplete lifecycle information

OCDS releases for individual projects may not cover all lifecycle stages (planning, tender, award, contract, amendment, implementation, payment, completion, termination). Record-change detection requires multiple releases per OCID. Many projects may have only one release, making RECORD_CHANGE analysis sparse.

## 8. No causal inference

Ordaciti does not perform causal inference. It identifies patterns and signals in available records. It does not determine why a pattern exists, whether a contract was executed as described, or what caused any observed change.

## 9. No corruption determination

Ordaciti is not a corruption detector, fraud detector, or accusation engine. Signals (REPEAT_INTERVENTION, CONTRACTOR_RECURRENCE, EVIDENCE_GAP, RECORD_CHANGE, ALLOCATION_CONTEXT) are analytical findings that warrant human review. They are not proof of wrongdoing.

## 10. No political-motivation inference

The system does not infer political motivation, favoritism, collusion, or procurement abuse from contractor recurrence or allocation patterns. It reports what the records show, not what they imply about intent.

## 11. Allocation context is not a normative budget formula

Population-normalized expenditure (value_per_100k_population, projects_per_100k_population) is a descriptive metric, not a prescription. Expenditure concentration that differs from population distribution may reflect service needs, existing infrastructure, government planning priorities, or other factors. It does not by itself indicate misallocation.

## 12. AI output requires human review

The AI evidence brief is an interpretation layer over structured evidence. It can misrepresent, omit, or overstate information despite system prompt constraints. All AI output must be reviewed by a human before use in any decision-making context. The application functions without AI (facts, signals, history, context, evidence gaps, sources, and review questions are all available without the AI endpoint).

## 13. API reliability

The Kaduna OCDS and OC4IDS APIs were non-responsive at the time of verification. The data pipeline may need to adapt to API availability, use alternative access methods, or work with cached/snapshot data. The capstone should clearly state which data snapshot was used and when.

## 14. Data currency

The processed dataset represents a point-in-time snapshot. Government procurement data changes. The capstone does not guarantee that the data remains current after retrieval.

## 15. Scale limitations

The capstone processes data for one state. Performance characteristics at state scale may not hold at national scale. The architecture is designed for extensibility but has not been tested at larger scale.
