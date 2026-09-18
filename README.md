"""
Ordaciti — Public Decision Intelligence Platform
==================================================

Government projects should not be understood as isolated contracts.
They are decisions made within systems that persist over time.

Ordaciti connects government project and procurement records across
time, geography, project history, infrastructure context, contractor
history, population context, and available lifecycle evidence.

## Setup

1. Clone repository.
2. Install dependencies.
3. Configure environment variables.
4. Fetch source data.
5. Normalize data.
6. Discover patterns.
7. Build processed dataset.
8. Start application.
9. Open local URL.

## Requirements

### Frontend
- Node.js 18+
- `npm install` (or `npm ci`)

### Data processing
- Python 3.10+
- `pip install -r requirements.txt`

### Environment variables
Copy `.env.example` to `.env` and configure:

- `AI_API_KEY` — API key for the LLM provider (server-side only)
- `AI_MODEL` — Model identifier for the LLM

Do not commit `.env` to version control.

## Data pipeline

```text
PUBLIC DATA
    ↓
RAW INGESTION (scripts/fetch_kaduna.py)
    ↓
NORMALIZATION (scripts/normalize_ocds.py)
    ↓
PROJECT CLUSTERING (scripts/discover_patterns.py)
    ↓
CONTEXT ENRICHMENT (scripts/enrich_population.py)
    ↓
SIGNAL GENERATION
    ↓
EVIDENCE OBJECTS
    ↓
NEXT.JS APPLICATION
    ↓
AI EVIDENCE BRIEF
```

## Quick start

```bash
# Install frontend dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt

# Fetch and process data
python scripts/fetch_kaduna.py
python scripts/normalize_ocds.py
python scripts/discover_patterns.py
python scripts/enrich_population.py
python scripts/build_dataset.py

# Start development server
npm run dev
```

Open http://localhost:3000.

## Project structure

```text
ordaciti/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Landing / overview
│   ├── projects/
│   │   ├── page.tsx        # Project explorer
│   │   └── [id]/
│   │       └── page.tsx    # Project intelligence
│   └── api/
│       └── explain/
│           └── route.ts    # AI evidence brief endpoint
├── components/             # React components
├── lib/                    # Shared utilities (data, signals, clustering, evidence, ai)
├── scripts/                # Python data pipeline
├── data/
│   ├── raw/                # Preserved source responses (do not edit)
│   └── processed/          # Normalized, analyzed outputs
├── docs/                   # Methodology, sources, limitations, AI log
├── public/
│   └── screenshots/
├── implementation.md       # Build specification (source of truth)
├── package.json
├── requirements.txt
├── .env.example
└── vercel.json
```

## Data sources

- **Primary:** Kaduna State Open Contracting Data Standard (OCDS) public data
- **Secondary:** geoBoundaries (administrative boundaries), WorldPop (population), OpenStreetMap (geographic/infrastructure context)

See `docs/data-sources.md` for full source documentation.

## Limitations

Ordaciti is a bounded prototype for Kaduna State, Nigeria. It is not a
corruption detector, fraud detector, political ranking system, accusation
engine, or autonomous policy-maker. Signals are analytical findings for
human review, not proof of wrongdoing.

See `docs/limitations.md` for full discussion.

## AI use

AI is an interpretation layer over structured evidence. It does not
generate facts. See `docs/ai-log.md` for AI usage records and
`implementation.md` section 23-25 for system rules.

## License

See LICENSE file (if applicable).
"""
