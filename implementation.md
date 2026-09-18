# ORDACITI CAPSTONE
## implementation.md

**Status:** Build specification / source of truth
**Track:** Transparency & Accountability
**Initial geography:** Kaduna State, Nigeria
**Deployment:** Vercel
**Repository:** GitHub

## 1. Executive summary

Ordaciti is a public-decision intelligence platform for transparency and accountability.

The core idea:

> Government projects should not be understood as isolated contracts. They are decisions made within systems that persist over time.

Ordaciti connects government project and procurement records across time, geography, project history, infrastructure context, contractor history, population context, and available lifecycle evidence.

It should answer:

- What did government do?
- Where did it happen?
- How much was recorded?
- What happened before?
- Has a similar intervention happened there before?
- Who received related contracts?
- What changed across available records?
- What evidence is missing?
- How does the intervention compare with geographic/population context?
- What questions should a human reviewer investigate?

Ordaciti is **not** a corruption detector, fraud detector, political ranking system, accusation engine, or autonomous policy-maker.

A pattern is a signal for scrutiny, not proof of wrongdoing.

---

## 2. Product thesis

A government project is normally represented as:

```text
Project
Contract
Contractor
Amount
Date
Location
```

Ordaciti changes the analytical unit to:

```text
Project
+
History
+
Location
+
Existing infrastructure
+
Population/context
+
Related interventions
+
Contractor history
+
Lifecycle evidence
+
Missing information
```

The product moves from:

> What contract was awarded?

to:

> What does this intervention mean within the history and wider system around it?

---

## 3. Core problem

Public transparency data can establish that government awarded a contract.

It is harder to determine:

- whether similar interventions happened before,
- whether the same location repeatedly received related interventions,
- how much recorded value exists across those interventions,
- whether the intervention is construction, rehabilitation, repair, replacement, expansion, or maintenance,
- whether implementation evidence exists,
- whether contract records changed,
- whether the same contractor appears repeatedly,
- how expenditure is distributed geographically,
- what infrastructure surrounds the intervention,
- and what questions deserve further scrutiny.

Ordaciti connects these records.

---

## 4. Central capstone question

> **Can real public project records be reconstructed across time and context to reveal patterns that are difficult to see when contracts are viewed individually?**

The capstone must demonstrate:

```text
individual project
        ↓
historical context
        ↓
related projects
        ↓
signals
        ↓
context
        ↓
evidence gaps
        ↓
AI evidence brief
        ↓
human review questions
```

---

## 5. Scope

### Initial geography

**Kaduna State, Nigeria.**

Do not attempt national coverage for the capstone.

Do not attempt pan-African coverage.

The architecture should be reusable so additional states can later be added through new data adapters.

### Primary source

Kaduna State Open Contracting Data Standard (OCDS) public data.

### Secondary/context sources

- administrative boundaries such as geoBoundaries,
- population data such as WorldPop,
- OpenStreetMap where useful for geographic/infrastructure context.

Do not build a complex GIS platform.

---

## 6. Data ingestion

Use a two-stage process.

### Stage 1: project discovery

Retrieve the available Kaduna project inventory.

Preserve the original source response.

### Stage 2: targeted deep inspection

Analyze the inventory locally to discover candidate relationships based on:

- similar titles/descriptions,
- same LGA,
- same location,
- same sector/category,
- similar intervention type,
- contractor recurrence,
- MDA recurrence.

Retrieve deeper OCDS lifecycle records for relevant candidates where required.

Do not design the analysis around a preconceived accusation.

---

## 7. Data layers

Create:

```text
data/raw/
data/processed/
```

Raw data must not be manually edited.

Example:

```text
data/raw/
├── kaduna_projects.json
├── kaduna_releases/
├── kaduna_lga_boundaries.geojson
└── population/
```

Processed outputs:

```text
data/processed/
├── projects.json
├── project_history.json
├── signals.json
├── lgas.json
├── population.json
└── ordaciti.json
```

---

## 8. Canonical project schema

Each normalized project should support:

```text
project_id
ocid
title
description
mda
sector
category
lga
location_text
latitude
longitude
procurement_method
budget_year
budget_amount
contract_amount
date_of_advert
date_of_award
contract_start
contract_end
contractor
status
source_url
source_release_id
source_updated_at
retrieved_at
```

Additional source fields may be retained.

Preserve original source values where auditability matters.

Do not convert unavailable values into fabricated defaults.

---

## 9. Project identity and clustering

The source project/OCID remains authoritative.

Ordaciti additionally creates an analytical:

### Project Cluster

A cluster groups records that may relate to the same underlying asset, infrastructure, location, public problem, or intervention type.

A cluster is an Ordaciti analytical construct, not an official government designation.

Preserve:

```text
source project
```

separately from:

```text
analytical cluster
```

---

## 10. Normalization

Normalize where practical:

- casing,
- punctuation,
- whitespace,
- common abbreviations,
- LGA names,
- MDA names,
- contractor names,
- dates,
- monetary fields.

Preserve originals:

```text
original_title
normalized_title
```

Do not over-normalize distinct entities into one.

---

## 11. Clustering approach

Use a transparent hybrid method.

Do not build a complex ML clustering system unless necessary.

Use:

1. normalized text similarity,
2. semantic similarity where useful,
3. same LGA,
4. geographic proximity where coordinates exist,
5. same sector/category,
6. intervention keywords.

Suggested intervention vocabulary:

```text
construction
rehabilitation
repair
renovation
reconstruction
maintenance
upgrade
expansion
replacement
```

Store:

```text
cluster_id
project_id
similarity_score
matching_features
```

Similarity scores are internal analytical metadata and should not be presented as certainty.

---

# 12. Core signals

Implement exactly five primary signals:

1. **REPEAT_INTERVENTION**
2. **CONTRACTOR_RECURRENCE**
3. **EVIDENCE_GAP**
4. **RECORD_CHANGE**
5. **ALLOCATION_CONTEXT**

Do not add arbitrary scoring systems.

---

# 13. Repeat intervention

Detect related interventions around the same location, asset, project cluster, or infrastructure function.

Example:

```text
2019 Construction
2022 Rehabilitation
2025 Repair
```

Output:

```text
signal_type = REPEAT_INTERVENTION
```

Supporting fields:

```text
project_count
first_project_date
latest_project_date
intervals
cumulative_recorded_contract_value
matching_features
```

Neutral UI wording:

> Related interventions were recorded multiple times over this period.

Never automatically call it waste.

---

# 14. Contractor recurrence

Detect repeated appearance of the same contractor across related projects.

Output:

```text
signal_type = CONTRACTOR_RECURRENCE
```

Display:

- contractor,
- related project count,
- recorded related contract value,
- date range,
- project IDs.

Neutral wording:

> The same contractor appears in multiple related records.

Do not infer favoritism, collusion, political connections, or procurement abuse.

---

# 15. Evidence gap

Create an evidence matrix for lifecycle stages supported by the source:

```text
planning
tender
award
contract
amendment
implementation
payment
completion
termination
```

Represent each as:

```text
available
partial
missing
unknown
```

Critical rule:

> Not found in the available source is not the same as did not happen.

---

# 16. Record change

Where multiple OCDS releases exist, compare:

```text
contract_amount
contractor
status
implementation_status
completion_date
contract_end
```

Store:

```text
field
old_value
new_value
release_date
source_id
```

Example:

```text
Previous contract value: ₦64,200,000
Current contract value:  ₦71,800,000
Change:                   +₦7,600,000
```

Neutral wording:

> The recorded contract value changed between available releases.

Do not infer why.

---

# 17. Allocation context

Aggregate project records at LGA level.

Calculate where data permits:

```text
project_count
recorded_contract_value
population
value_per_100k_population
projects_per_100k_population
```

Where reliable, calculate sector-specific versions.

Example:

```text
LGA A
9% of population
23% of recorded sector expenditure

LGA B
18% of population
7% of recorded sector expenditure
```

Neutral interpretation:

> Available records show expenditure concentration that differs from population distribution.

Then:

> This may warrant review alongside documented service needs, existing infrastructure, government planning priorities, and other relevant context.

Do not treat population-normalized expenditure as a definitive budget formula.

---

## 18. System dependency context

The long-term Ordaciti vision includes system-level infrastructure reasoning.

For the capstone, implement only lightweight contextual relationships.

Examples:

```text
Road
↓
nearby roads
↓
transport corridor
```

```text
Hospital
↓
nearby health facilities
↓
health-service network
```

```text
School
↓
nearby schools
↓
education-service network
```

These are contextual relationships, not official dependency declarations.

Do not build traffic simulation, route optimization, digital twins, or network-flow optimization.

---

## 19. Relevance/context elsewhere

The broader vision is to help examine whether an intervention addresses a relevant documented need within a wider system.

The capstone must not decide:

> This project should have been built somewhere else.

Instead surface questions such as:

> How does this intervention's location compare with the distribution of related projects and population?

> Are there documented service gaps elsewhere that should be considered alongside this intervention?

> Does the available evidence show a broader strategy for addressing this infrastructure need?

This preserves the product vision without making Ordaciti an autonomous policy recommender.

---

## 20. Critical infrastructure example

The product vision includes critical corridors such as Kara/OPIC/Berger-area infrastructure.

The intended reasoning is not:

> The government should stop repairing this road.

It is:

> If a critical corridor repeatedly requires intervention and carries significant economic activity, what wider infrastructure decisions could reduce dependence on that single corridor?

This is a conceptual example only.

Do not fabricate traffic volumes or claims about the corridor.

Do not build a traffic model for the hackathon.

---

# 21. Evidence model

Each analyzed project must generate:

```json
{
  "project_id": "...",
  "facts": [],
  "signals": [],
  "unknowns": [],
  "context": {},
  "questions_for_review": [],
  "sources": []
}
```

Example:

```json
{
  "project_id": "KD-123",
  "facts": [
    {
      "text": "Three related interventions were recorded between 2019 and 2025.",
      "source_ids": ["SRC-1", "SRC-2", "SRC-3"]
    }
  ],
  "signals": [
    {
      "type": "REPEAT_INTERVENTION",
      "severity": "medium",
      "evidence": "3 related interventions in 6 years"
    }
  ],
  "unknowns": [
    "Implementation evidence is not available in the retrieved records."
  ],
  "questions_for_review": [
    "What explains the repeated interventions?",
    "Were the interventions planned maintenance, expansion, replacement, or remediation?"
  ],
  "sources": [
    {
      "id": "SRC-1",
      "url": "..."
    }
  ]
}
```

---

# 22. Signal severity

Do not create:

```text
corruption_score
fraud_probability
waste_score
```

Allowed:

```text
LOW
MEDIUM
HIGH
```

Severity describes the strength/relevance of the detected evidence pattern.

It does not describe likelihood of wrongdoing.

---

# 23. AI role

AI is an interpretation layer over structured evidence.

AI is not the source of truth.

Input to the AI:

- normalized project information,
- project history,
- deterministic signals,
- contextual metrics,
- missing evidence,
- source IDs,
- source metadata.

Preferred flow:

```text
trusted dataset
      ↓
evidence object
      ↓
structured prompt
      ↓
LLM
      ↓
structured JSON
      ↓
validation
      ↓
UI
```

Do not allow the model to invent evidence.

---

# 24. AI output schema

Return:

```json
{
  "summary": "...",
  "what_we_know": [],
  "what_changed": [],
  "signals": [],
  "what_is_missing": [],
  "questions_for_review": [],
  "sources_used": []
}
```

---

# 25. AI system rules

The system prompt must enforce:

1. Use only supplied evidence.
2. Never invent facts.
3. Never invent numbers.
4. Never invent dates.
5. Never invent contractors.
6. Never infer political motivation.
7. Never infer corruption.
8. Never infer fraud.
9. Never infer collusion.
10. Never treat missing evidence as evidence of absence.
11. Distinguish fact, signal, and question.
12. State uncertainty.
13. Reference supplied source IDs.
14. Avoid sensational language.
15. Do not rank political actors.
16. Do not recommend political choices.
17. Do not make unsupported policy conclusions.
18. Do not turn analytical signals into accusations.

---

# 26. Application pages

Build four primary experiences.

## Landing / Overview

Hero:

> **Public decisions leave traces.**

Supporting text:

> Government projects are often visible as individual contracts. Ordaciti connects those records across time, location and infrastructure context to help reveal patterns, gaps and questions that are difficult to see one project at a time.

CTA:

> **Explore public projects**

Metrics must come from real data:

```text
Projects analyzed
Recorded contract value
Repeat intervention signals
Evidence gaps
```

## Project Explorer

Include:

- search,
- map,
- project list,
- LGA filter,
- sector/category filter,
- year filter,
- signal filter,
- MDA filter.

Project card:

```text
Project title
Location
MDA
Recorded contract value
Year
Signal badges
```

## Project Intelligence

Primary demo screen:

```text
PROJECT
────────────────────────
Title
Location
MDA
Contractor
Recorded contract value
Status

ORDACITI SIGNALS
Repeat Intervention
Contractor Recurrence
Evidence Gap
Allocation Context

PROJECT HISTORY
2019
  ↓
2022
  ↓
2025

WHAT WE KNOW
...

WHAT CHANGED
...

WHAT IS MISSING
...

QUESTIONS FOR REVIEW
...

AI EVIDENCE BRIEF
...

SOURCE RECORDS
...
```

## AI Evidence Brief

Provide:

> Ask about this project

Suggested prompts:

- Why is this project flagged?
- What happened before this project?
- What changed?
- How much recorded value exists across related interventions?
- What evidence is missing?
- What should a reviewer investigate?

---

# 27. Map

Use a simple interactive map.

Display:

- project points,
- LGA context,
- optional nearby infrastructure.

Clicking a project should navigate to its intelligence page.

Do not build:

- live traffic,
- route optimization,
- 3D maps,
- satellite analytics,
- traffic simulation.

---

# 28. Visual design

Ordaciti should feel like a serious civic-data product:

- clean,
- modern,
- restrained,
- evidence-oriented,
- trustworthy,
- readable,
- data-dense without clutter.

Avoid:

- generic AI gradients,
- excessive futuristic effects,
- fake government branding,
- sensational red warning interfaces,
- "corruption detector" aesthetics.

Signals are analytical findings, not criminal verdicts.

---

# 29. Source traceability

Every important factual claim must be traceable.

For each project show:

```text
Source
Source type
Source URL
Retrieved date
Relevant record/release
```

Provide:

> View source

where appropriate.

---

# 30. Data quality

Use:

```text
AVAILABLE
PARTIAL
MISSING
UNKNOWN
```

Never silently convert null to zero.

Example:

```text
completion_amount = null
```

must remain unknown/missing unless the source explicitly reports zero.

---

# 31. Project timeline

For a cluster:

```text
2019
Construction
₦400M
Contractor A

        ↓

2022
Rehabilitation
₦120M
Contractor B

        ↓

2025
Repair
₦95M
Contractor A
```

Clearly distinguish:

- project date,
- award date,
- contract date,
- implementation date,
- source release date.

---

# 32. Cumulative recorded value

Calculate:

```text
cumulative_recorded_contract_value =
sum(known contract amounts for related projects)
```

Use the label:

> Recorded contract value

not:

> Total government spending

unless the source establishes complete expenditure.

---

# 33. Time between interventions

Calculate:

```text
days_between_related_projects
```

Provide:

```text
first intervention
latest intervention
number of interventions
intervals
median interval
```

Do not create an arbitrary "too soon" threshold without evidence.

---

# 34. Backend API

Required AI endpoint:

```text
POST /api/explain
```

Input:

```json
{
  "project_id": "..."
}
```

Server:

1. receives project ID,
2. resolves project against trusted dataset,
3. loads evidence object,
4. constructs structured prompt,
5. calls LLM,
6. validates JSON,
7. returns response.

Do not let arbitrary client-provided evidence become the factual context.

---

# 35. AI caching and failure

Caching is optional.

Preferred cache key:

```text
project_id + evidence_version
```

If AI fails, show:

> AI evidence brief temporarily unavailable.

Still show:

- facts,
- signals,
- history,
- context,
- evidence gaps,
- sources,
- review questions.

The application must function without AI.

---

# 36. Technology stack

### Frontend

- Next.js
- TypeScript
- App Router

### Styling

- Tailwind CSS or existing styling system

### Map

- MapLibre GL or Leaflet

Choose the fastest stable option.

### Data processing

Python:

- pandas,
- requests/httpx,
- rapidfuzz,
- numpy where needed,
- geopandas only if genuinely necessary,
- shapely only if genuinely necessary.

---

# 37. Explicitly avoid unnecessary infrastructure

Do not introduce solely for complexity:

- Spark,
- dbt,
- BigQuery,
- Postgres,
- Kubernetes,
- Kestra,
- Airflow,
- Kafka,
- Flink,
- vector databases,
- RAG infrastructure,
- full agent frameworks,
- microservices,
- authentication,
- user accounts.

The capstone is a product demonstration, not a showcase of every available data-engineering technology.

---

# 38. Repository structure

Use approximately:

```text
ordaciti/
├── app/
│   ├── page.tsx
│   ├── projects/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   └── api/
│       └── explain/
│           └── route.ts
├── components/
│   ├── project-card.tsx
│   ├── project-map.tsx
│   ├── project-timeline.tsx
│   ├── signal-card.tsx
│   ├── evidence-panel.tsx
│   ├── allocation-context.tsx
│   └── ai-brief.tsx
├── lib/
│   ├── data.ts
│   ├── signals.ts
│   ├── clustering.ts
│   ├── evidence.ts
│   └── ai.ts
├── scripts/
│   ├── fetch_kaduna.py
│   ├── normalize_ocds.py
│   ├── discover_patterns.py
│   ├── enrich_population.py
│   └── build_dataset.py
├── data/
│   ├── raw/
│   └── processed/
├── docs/
│   ├── methodology.md
│   ├── data-sources.md
│   ├── limitations.md
│   └── ai-log.md
├── public/
│   └── screenshots/
├── README.md
├── implementation.md
├── package.json
├── requirements.txt
├── .env.example
└── vercel.json
```

Exact structure may adapt to the chosen Next.js implementation, but the separation of ingestion, analysis, evidence, frontend, and documentation must remain.

---

# 39. Pipeline

```text
PUBLIC DATA
    ↓
RAW INGESTION
    ↓
NORMALIZATION
    ↓
PROJECT CLUSTERING
    ↓
CONTEXT ENRICHMENT
    ↓
SIGNAL GENERATION
    ↓
EVIDENCE OBJECTS
    ↓
NEXT.JS APPLICATION
    ↓
AI EVIDENCE BRIEF
```

---

# 40. Script responsibilities

## `fetch_kaduna.py`

- discover/validate Kaduna data endpoints,
- retrieve project data,
- retrieve relevant releases,
- save raw responses,
- record retrieval timestamps,
- fail clearly on source/API errors.

## `normalize_ocds.py`

- normalize field names,
- normalize text,
- normalize LGA names,
- normalize contractor names,
- parse dates,
- parse monetary fields,
- preserve originals.

## `discover_patterns.py`

- similarity,
- clustering,
- repeat interventions,
- contractor recurrence,
- project history,
- cumulative values,
- demo-case discovery.

## `enrich_population.py`

- associate LGAs with population,
- calculate contextual metrics,
- preserve source metadata.

## `build_dataset.py`

- combine outputs,
- validate schema,
- create final frontend dataset,
- fail on invalid required data.

---

# 41. Demo case selection

Do not invent a case.

After ingestion, discover candidate clusters.

Prioritize:

1. multiple related interventions,
2. meaningful time span,
3. known recorded values,
4. geographic coherence,
5. lifecycle information,
6. contractor recurrence,
7. evidence quality,
8. usefulness for demonstrating the thesis.

Select one primary case and optionally one secondary case.

The selected case must be supported by actual source records.

---

# 42. Anti-cherry-picking rule

It is acceptable to select the clearest case for demonstrating the prototype.

It is not acceptable to:

- modify source data,
- manufacture relationships,
- invent values,
- hide contradictory evidence,
- imply the selected case represents every project.

State clearly that this is a bounded prototype using a defined dataset.

---

# 43. Dashboard metrics

All metrics must be calculated from actual processed data.

Possible metrics:

```text
Projects analyzed
LGAs represented
Recorded contract value
Repeat intervention clusters
Contractor recurrence signals
Evidence gaps
```

No fake statistics.

---

# 44. Product copy

### Hero

> **Public decisions leave traces.**

### Supporting copy

> Government projects are often visible as individual contracts. Ordaciti connects those records across time, location and infrastructure context to help reveal patterns, gaps and questions that are difficult to see one project at a time.

### Primary CTA

> **Explore public projects**

### Tagline

> **Public decision intelligence for better infrastructure and accountability.**

Optional:

> **Government changes. Public assets remain. Ordaciti remembers.**

---

# 45. Pitch deck

Create a 7-slide deck.

## Slide 1 — Problem

> Government projects are visible. Government decisions are harder to see.

Show:

```text
individual contract
vs.
system + history + context
```

## Slide 2 — Question

> What if we could see what government has already done before asking what it should do next?

Show:

```text
Project A
   ↓
Project B
   ↓
Project C
```

## Slide 3 — Ordaciti

```text
Government records
        ↓
Project history
        ↓
Geographic context
        ↓
System context
        ↓
Signals
        ↓
AI evidence brief
        ↓
Human scrutiny
```

## Slide 4 — Real data

Show actual Kaduna metrics.

No fabricated statistics.

## Slide 5 — Live case

Show:

- history,
- recorded value,
- contractor recurrence,
- location,
- signals,
- evidence gaps.

## Slide 6 — AI

Headline:

> **AI explains the evidence. It does not decide the verdict.**

Show:

```text
Facts
Signals
Unknowns
Questions
Sources
```

## Slide 7 — Vision

```text
Kaduna
  ↓
Nigeria
  ↓
Africa
```

Closing:

> **Public money should be evaluated across the life of the thing it builds.**

---

# 46. Demo video

Target duration: **2.5–3 minutes**

## 0:00–0:20

Explain the problem:

> Government spending is usually visible one contract at a time. But people experience roads, hospitals, schools and other public infrastructure as systems that persist over time.

## 0:20–0:45

Show:

- dashboard,
- project count,
- map,
- filters.

## 0:45–1:30

Open the selected project.

Show:

- location,
- recorded value,
- project history,
- repeat intervention,
- contractor recurrence.

## 1:30–1:55

Show:

- population context,
- project concentration,
- infrastructure context,
- evidence availability.

## 1:55–2:25

Ask:

> Why is this project flagged?

Show AI evidence brief.

## 2:25–2:45

Open source records.

## 2:45–3:00

Close:

> Ordaciti does not tell citizens what to think. It helps them see what happened, what changed, what is missing, and what deserves scrutiny.

Then show:

> ORDACITI
> Public decision intelligence for better infrastructure and accountability.

---

# 47. Documentation

Create:

```text
docs/methodology.md
docs/data-sources.md
docs/limitations.md
docs/ai-log.md
```

### methodology.md

Explain:

- normalization,
- clustering,
- repeat intervention detection,
- contractor recurrence,
- evidence completeness,
- allocation context,
- record change detection,
- system context,
- AI interpretation.

### data-sources.md

For each source:

```text
Source name
Organization
URL
Data used
Retrieval date
Coverage
Known limitations
```

### limitations.md

Include:

1. Kaduna-only scope.
2. Source availability limitations.
3. Missing implementation records.
4. Population-data limitations.
5. Location ambiguity.
6. Project-clustering uncertainty.
7. Incomplete lifecycle information.
8. No causal inference.
9. No corruption determination.
10. No political-motivation inference.
11. Allocation context is not a normative budget formula.
12. AI output requires human review.

### ai-log.md

Record:

```text
Date
Task
AI model/tool
Prompt purpose
Human review
Changes accepted
Tests performed
```

---

# 48. Testing

## Data

Verify:

- project IDs exist,
- dates parse,
- monetary fields are numeric,
- nulls are not converted to zero,
- LGA normalization works,
- source URLs exist.

## Analytics

Verify:

- expected records cluster,
- cumulative values are correct,
- contractor recurrence counts are correct,
- evidence-gap logic works,
- record changes compare correct releases.

## Frontend

Verify:

- homepage loads,
- explorer loads,
- filters work,
- map renders,
- project page loads,
- source links work,
- AI endpoint works,
- mobile layout works.

## Production

Verify:

- Vercel URL loads,
- environment variables work,
- AI works in production,
- no secrets are exposed,
- build succeeds,
- no major console errors.

---

# 49. AI test cases

### Case 1: Missing implementation

Expected:

> Implementation evidence is unavailable in the retrieved records.

Never:

> The project was not implemented.

### Case 2: Repeated project

Expected:

> Repeat intervention signal.

Never:

> Waste.

### Case 3: Recurring contractor

Expected:

> Contractor recurrence signal.

Never:

> Favoritism.

### Case 4: Geographic concentration

Expected:

> Recorded expenditure concentration differs from population distribution.

Never:

> Misallocation.

### Case 5: Contract change

Expected:

> Recorded contract value changed from X to Y.

Never:

> Contract inflation.

---

# 50. Responsible language

Use:

- available records show,
- recorded value,
- related intervention,
- signal,
- evidence gap,
- warrants review,
- question for investigation,
- not established by the available data,
- not found in the retrieved records.

Avoid unsupported:

- corrupt,
- fraudulent,
- stolen,
- wasteful,
- rigged,
- favoritism,
- collusion,
- politically motivated.

---

# 51. Reproducibility

GitHub must contain:

```text
requirements.txt
package.json
.env.example
README.md
implementation.md
```

README setup:

```text
1. Clone repository.
2. Install dependencies.
3. Configure environment variables.
4. Fetch source data.
5. Normalize data.
6. Discover patterns.
7. Build processed dataset.
8. Start application.
9. Open local URL.
```

---

# 52. Environment variables

Example:

```text
AI_API_KEY=
AI_MODEL=
```

Never commit secrets.

If using a different AI provider or Vercel AI Gateway, use its required environment variables.

---

# 53. Security

- AI credentials remain server-side.
- Never expose API keys in client JavaScript.
- Do not collect private personal data.
- Do not add unnecessary authentication.
- No user accounts are required.

---

# 54. Vercel deployment

Deployment:

```text
GitHub
   ↓
Vercel
   ↓
Build
   ↓
Production
```

Before submission verify:

- homepage,
- explorer,
- map,
- project detail,
- filters,
- source links,
- AI endpoint,
- mobile layout,
- environment variables,
- build logs,
- browser console.

---

# 55. Optional periodic monitoring

Long-term Ordaciti can monitor new government records periodically.

Optional capstone implementation:

```text
scheduled source refresh
        ↓
new snapshot
        ↓
compare against previous snapshot
        ↓
new/changed records
        ↓
updated signals
```

Do not claim real-time monitoring if it is not real-time.

Do not let this feature delay the MVP.

---

# 56. Long-term vision

Ordaciti can eventually connect:

```text
PROCUREMENT
    ↓
PROJECT
    ↓
ASSET
    ↓
LOCATION
    ↓
POPULATION
    ↓
SERVICE NEED
    ↓
DEPENDENCY
    ↓
ALTERNATIVE CAPACITY
    ↓
LIFECYCLE
    ↓
PUBLIC OUTCOME
```

Future expansion may include:

- multiple Nigerian states,
- national coverage,
- additional infrastructure categories,
- budget data,
- completion data,
- service accessibility,
- maintenance history,
- environmental context,
- public reporting,
- investigative workflows.

None of these should be implemented before the capstone MVP is complete.

---

# 57. Differentiation

Do not position Ordaciti simply as:

> A platform for monitoring government projects.

Position it as:

> **Contextual and longitudinal public-decision intelligence.**

Traditional project monitoring asks:

> Did the project happen?

Ordaciti asks:

> What happened before?

> What already exists here?

> What changed?

> Has this intervention happened before?

> What is recorded across its lifecycle?

> What evidence is missing?

> What does the wider geographic context show?

> What questions should a human reviewer ask?

This is the core distinction.

---

# 58. Ordaciti decision loop

```text
WHAT DID GOVERNMENT DO?
          ↓
WHAT ALREADY EXISTS?
          ↓
WHAT PROBLEM DOES IT ADDRESS?
          ↓
WHAT HAPPENED BEFORE?
          ↓
WHAT HAS CHANGED?
          ↓
WHAT DEPENDS ON IT?
          ↓
WHAT CONTEXT EXISTS ELSEWHERE?
          ↓
WHAT DOES THE DATA SHOW?
          ↓
WHAT EVIDENCE IS MISSING?
          ↓
WHAT DESERVES HUMAN REVIEW?
```

---

# 59. Product philosophy

## Evidence before accusation

Start with records.

## Context before judgment

Understand the project within its history and environment.

## Patterns before narratives

Let relationships emerge from data.

## Uncertainty remains visible

Missing information stays missing.

## Humans make decisions

Ordaciti supports citizens, journalists, researchers, civil society, auditors, and reviewers.

It does not replace them.

---

# 60. Success criteria

The capstone is complete when a reviewer can:

1. Open the Vercel URL.
2. Understand the problem within 30 seconds.
3. Explore real Kaduna projects.
4. Filter projects.
5. See project locations.
6. Select a project.
7. See historical related interventions.
8. See recorded cumulative contract value.
9. See contractor recurrence where applicable.
10. See evidence gaps.
11. See contextual allocation information.
12. Understand why signals were generated.
13. Ask the AI about the project.
14. Receive an evidence-grounded response.
15. Trace important claims to public sources.
16. Open GitHub.
17. Understand the data pipeline.
18. Understand the methodology.
19. Understand the limitations.
20. Watch the demo video and understand the product within three minutes.

---

# 61. Build priority

## P0 — Mandatory

```text
Kaduna data
    ↓
Normalization
    ↓
Project clustering
    ↓
Repeat intervention detection
    ↓
Evidence model
    ↓
Project explorer
    ↓
Project intelligence page
    ↓
Source links
    ↓
GitHub
    ↓
Vercel deployment
```

## P1 — Strong submission requirements

```text
Contractor recurrence
Evidence gaps
Allocation context
Record change detection
AI evidence brief
Map
Methodology
README
Pitch deck
Demo video
```

## P2 — Only after P0/P1 are stable

```text
OSM enrichment
Improved map layers
Periodic refresh
Additional contextual metrics
UI refinement
```

Never implement P2 before P0 and P1 are stable.

---

# 62. Implementation order

## Phase 1 — Repository

Create project structure.

## Phase 2 — Source discovery

Identify and validate Kaduna OCDS endpoints/datasets.

Do not guess endpoint structures.

## Phase 3 — Data ingestion

Download real source data and preserve raw snapshots.

## Phase 4 — Normalization

Build canonical project records.

## Phase 5 — Pattern discovery

Run similarity, clustering, and project-history analysis.

## Phase 6 — Signal generation

Implement the five core signals.

## Phase 7 — Evidence model

Build evidence objects containing facts, signals, unknowns, context, questions, and sources.

## Phase 8 — Frontend

Build landing page, explorer, map, and project intelligence page.

## Phase 9 — Context enrichment

Add population and geographic context.

## Phase 10 — AI

Add evidence-bound AI endpoint and evidence brief.

## Phase 11 — QA

Run data, analytics, UI, AI, and deployment tests.

## Phase 12 — Deploy

Deploy to Vercel.

## Phase 13 — Document

Complete README, methodology, sources, limitations, and AI log.

## Phase 14 — Present

Create deck, demo video, and screenshots.

## Phase 15 — Freeze

After final QA, no new features unless required to fix a critical defect.

---

# 63. Implementation-LLM rules

The LLM implementing this document must:

1. Never invent data.
2. Never invent source URLs.
3. Never fabricate demo cases.
4. Never expand scope without explicit instruction.
5. Prefer deterministic logic over unnecessary AI.
6. Keep the structured dataset authoritative.
7. Never create corruption/fraud/waste scores.
8. Never hide uncertainty.
9. Never hardcode production statistics.
10. Never sacrifice deployment stability for optional features.
11. Verify external APIs/endpoints before implementation.
12. Preserve source traceability.
13. Build the smallest complete vertical slice first.
14. Fix real errors before adding features.
15. Keep all claims proportional to the available evidence.

---

# 64. Final architecture

```text
                    ORDACITI
                       │
                       ▼
              PUBLIC RECORDS
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
     PROJECTS        ASSETS        LOCATION
        │              │              │
        └──────────────┼──────────────┘
                       ▼
                PROJECT HISTORY
                       │
                       ▼
                SYSTEM CONTEXT
                       │
       ┌───────────────┼────────────────┐
       ▼               ▼                ▼
   RECURRENCE      ALLOCATION       DEPENDENCY
     SIGNAL          CONTEXT          CONTEXT
       │               │                │
       └───────────────┼────────────────┘
                       ▼
                 EVIDENCE MODEL
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
          AI BRIEF          HUMAN REVIEW
             │                   │
             └─────────┬─────────┘
                       ▼
              BETTER PUBLIC SCRUTINY
```

---

# 65. Final product statement

> **Government projects should not be understood as isolated transactions. They are decisions made within systems that persist over time.**
>
> **Ordaciti connects public projects, assets, locations, procurement records and contextual data to reveal what happened, what changed, what is missing and what deserves scrutiny.**
>
> **It does not decide what citizens should believe. It gives them a clearer evidence base from which to ask better questions.**

---

# 66. One-sentence description

> **Ordaciti is a public-decision intelligence platform that connects government projects, infrastructure and contextual data across time to reveal patterns, evidence gaps and system-level questions around public expenditure.**

---

# 67. Short hackathon description

> **Ordaciti helps citizens see government projects as systems rather than isolated contracts. It connects public procurement records across time and location, identifies recurring interventions, contractor recurrence, evidence gaps and allocation patterns, then uses AI to turn the evidence into transparent review questions without making accusations or political judgments.**

---

# 68. Final commandment

**Do not build a system that tells people what to think about government.**

Build a system that makes it significantly harder to miss what government has already done.

That is Ordaciti.
