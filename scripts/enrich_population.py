#!/usr/bin/env python3
"""
Phase 9: Context Enrichment — Population and LGA context for Ordaciti.

Associates Kaduna State LGA population data from WorldPop with
project allocation context. Computes population-normalised metrics
where population data is available.

 NEVER FABRICATES population values. Where LGA is not a recognised
 Kaduna LGA, population stays null and the signal notes the limitation.
"""

import json
import sys
from pathlib import Path
from collections import defaultdict

DATA_DIR = Path(__file__).parent.parent / 'data' / 'processed'
EVIDENCE_PATH = DATA_DIR / 'evidence.json'
NORMALIZED_PATH = DATA_DIR / 'normalized_projects.json'
SIGNALS_PATH = DATA_DIR / 'signals.json'
POPULATION_PATH = DATA_DIR / 'population.json'

KADUNA_CANONICAL_LGAS = {
    'Igabi', 'Giwa', 'Kaduna North', 'Kaduna South', 'Chikun', 'Kachia',
    'Jaba', "Jema'a", 'Kagarko', 'Kajuru', 'Kaura', 'Kudan', 'Lere',
    'Makarfi', 'Sabon Gari', 'Sanga', 'Soba', 'Zangon Kataf', 'Zaria',
    'Ikara', 'Birnin Gwari', 'Kauru', 'Kubau'
}

# Variants that map to canonical LGAs
LGA_VARIANTS = {
    'birnin gwari local government': 'Birnin Gwari',
    'ikara lg': 'Ikara',
    'ikara lga': 'Ikara',
    "jema'a local government": "Jema'a",
    'kachia local government': 'Kachia',
    'kaura lga': 'Kaura',
    'kudan lga': 'Kudan',
    'lere local government': 'Lere',
    'rigachukun': 'Igabi',
    'rigachikun': 'Igabi',
    'rigachikun, igabi local government': 'Igabi',
    'sabon gari, sabon gari l.g.a.': 'Sabon Gari',
    'zaria local government': 'Zaria',
    'zaria, kaduna, kafanchan': 'Zaria',
    'kaduna, kafanchan and zaria metropolis.': 'Zaria',
    'kaduna north, zaria and kafanchan': 'Kaduna North',
    'kaduna north to chikun': 'Kaduna North',
}


def load_json(path):
    with open(path) as f:
        return json.load(f)


def normalise_lga(lga: str) -> str | None:
    """Map a project LGA value to a canonical Kaduna LGA if recognisable."""
    if not lga or not lga.strip():
        return None
    lga = lga.strip()

    if lga in KADUNA_CANONICAL_LGAS:
        return lga

    key = lga.lower()
    if key in LGA_VARIANTS:
        return LGA_VARIANTS[key]

    # Fuzzy match: check if any canonical LGA name appears within the value
    lga_lower = lga.lower()
    for canonical in sorted(KADUNA_CANONICAL_LGAS, key=len, reverse=True):
        cl = canonical.lower()
        if len(cl) > 3 and cl in lga_lower:
            if canonical in ('Kaduna North', 'Kaduna South'):
                continue  # special-cased below
            return canonical

    # Special cases for Kaduna North/South
    if 'kaduna' in lga_lower:
        if 'south' in lga_lower:
            return 'Kaduna South'
        if 'north' in lga_lower:
            return 'Kaduna North'

    return None


def enrich():
    population_data = load_json(POPULATION_PATH)
    population = population_data['lgas']
    pop_metadata = population_data['metadata']

    normalized = load_json(NORMALIZED_PATH)
    evidence = load_json(EVIDENCE_PATH)
    signals = load_json(SIGNALS_PATH)

    proj_by_id = {str(p['project_id']): p for p in normalized['projects']}

    # Build LGA -> projects mapping using canonical LGAs
    lga_projects = defaultdict(list)
    lga_value = defaultdict(float)
    lga_budget = defaultdict(float)
    lga_sector = defaultdict(lambda: defaultdict(lambda: {'pc': 0, 'rv': 0.0}))
    unmapped_count = 0

    for proj in normalized['projects']:
        pid = str(proj['project_id'])
        raw_lga = proj.get('normalized_lga', '') or ''
        canonical_lga = normalise_lga(raw_lga)

        contract_val = proj.get('normalized_contract_amount') or 0
        budget_val = proj.get('normalized_budget_amount') or 0

        if canonical_lga:
            lga_projects[canonical_lga].append(pid)
            lga_value[canonical_lga] += contract_val
            lga_budget[canonical_lga] += budget_val
            sector = proj.get('normalized_sector') or 'Unknown'
            lga_sector[canonical_lga][sector]['pc'] += 1
            lga_sector[canonical_lga][sector]['rv'] += contract_val
        else:
            unmapped_count += 1

    # Rebuild ALLOCATION_CONTEXT signals from scratch
    # Keep all non-AC signals unchanged
    new_signals = [s for s in signals['signals'] if s['signal_type'] != 'ALLOCATION_CONTEXT']

    # Add AC signals for canonical LGAs that have projects
    for canonical_lga in sorted(KADUNA_CANONICAL_LGAS):
        proj_ids = lga_projects.get(canonical_lga, [])
        if not proj_ids:
            continue

        recorded_value = lga_value.get(canonical_lga, 0)
        recorded_budget = lga_budget.get(canonical_lga, 0)

        pop_entry = population.get(canonical_lga)
        if pop_entry:
            pop = pop_entry['population']
            pop_data_available = True
            value_per_100k = (recorded_value / pop) * 100000 if pop > 0 else None
            projects_per_100k = (len(proj_ids) / pop) * 100000 if pop > 0 else None
        else:
            pop = None
            pop_data_available = False
            value_per_100k = None
            projects_per_100k = None

        sb = {}
        for sector, data in lga_sector[canonical_lga].items():
            sb[sector] = {'project_count': data['pc'], 'recorded_value': round(data['rv'], 2)}

        new_signal = {
            'signal_type': 'ALLOCATION_CONTEXT',
            'lga': canonical_lga,
            'project_count': len(proj_ids),
            'project_ids': sorted(proj_ids),
            'recorded_contract_value': round(recorded_value, 2),
            'recorded_budget_value': round(recorded_budget, 2),
            'sector_breakdown': sb,
            'population': pop,
            'value_per_100k_population': round(value_per_100k, 4) if value_per_100k is not None else None,
            'projects_per_100k_population': round(projects_per_100k, 6) if projects_per_100k is not None else None,
            'population_data_available': pop_data_available,
            'population_source': pop_metadata['source'] if pop_data_available else None,
            'population_source_url': pop_metadata['source_url'] if pop_data_available else None,
            'population_reference_year': pop_metadata['reference_year'] if pop_data_available else None,
            'note': (
                f"Population data from {pop_metadata['source']} ({pop_metadata['reference_year']}). "
                f"LGA: {canonical_lga}. "
                + (f"Population: {pop:,}. Value per 100k: ₦{value_per_100k:,.2f}. "
                   f"Projects per 100k: {projects_per_100k:.4f}."
                   if pop_data_available else
                   "Population data not available for this LGA. Population-normalised metrics cannot be computed.")
            )
        }
        new_signals.append(new_signal)

    # Update manifest
    signals['manifest'] = signals.get('manifest', {})
    signals['manifest']['population_enrichment'] = {
        'date': pop_metadata['retrieval_date'],
        'source': pop_metadata['source'],
        'lgas_with_population': len([l for l in KADUNA_CANONICAL_LGAS if population.get(l)]),
        'total_kaduna_lgas': len(KADUNA_CANONICAL_LGAS),
        'projects_with_mappable_lga': sum(len(v) for v in lga_projects.values()),
        'total_projects': len(normalized['projects']),
        'projects_without_mappable_lga': unmapped_count,
    }

    signals['signals'] = new_signals

    with open(SIGNALS_PATH, 'w') as f:
        json.dump(signals, f, indent=2)

    # Update evidence objects with population context
    evidence_updated = 0
    for ev in evidence['evidence']:
        pid = ev['project_id']
        proj = proj_by_id.get(pid)
        if not proj:
            continue

        raw_lga = proj.get('normalized_lga', '') or ''
        canonical_lga = normalise_lga(raw_lga)
        pop_entry = population.get(canonical_lga) if canonical_lga else None

        if canonical_lga and pop_entry:
            pop = pop_entry['population']
            recorded_value = lga_value.get(canonical_lga, 0)
            value_per_100k = (recorded_value / pop) * 100000 if pop > 0 else None
            ev.setdefault('context', {})['lga_population'] = {
                'lga': canonical_lga,
                'population': pop,
                'population_source': pop_metadata['source'],
                'population_reference_year': pop_metadata['reference_year'],
                'lga_recorded_contract_value': round(recorded_value, 2),
                'value_per_100k_population': round(value_per_100k, 2) if value_per_100k else None,
            }
            evidence_updated += 1
        elif canonical_lga:
            ev.setdefault('context', {})['lga_population'] = {
                'lga': canonical_lga,
                'population': None,
                'population_available': False,
                'note': f'Population data not available for {canonical_lga} in WorldPop dataset.',
            }
            evidence_updated += 1
        else:
            ev.setdefault('context', {})['lga_population'] = {
                'lga': None,
                'population': None,
                'population_available': False,
                'note': 'Project LGA is not a recognised Kaduna State LGA. Population context unavailable.',
            }
            evidence_updated += 1

    with open(EVIDENCE_PATH, 'w') as f:
        json.dump(evidence, f, indent=2)

    print(f"Phase 9 enrichment complete.")
    print(f"  Population data source: {pop_metadata['source']}")
    print(f"  Population reference year: {pop_metadata['reference_year']}")
    print(f"  Kaduna LGAs in WorldPop: {len(population)}")
    print(f"  Canonical Kaduna LGAs recognised: {len(KADUNA_CANONICAL_LGAS)}")
    print(f"  Projects with mappable LGA: {sum(len(v) for v in lga_projects.values())} / {len(normalized['projects'])}")
    print(f"  Projects without mappable LGA: {unmapped_count}")
    print(f"  LGAs with both projects and population: {sum(1 for l in KADUNA_CANONICAL_LGAS if lga_projects.get(l) and population.get(l))}")
    print(f"  Evidence objects updated with LGA population context: {evidence_updated}")
    print(f"  ALLOCATION_CONTEXT signals: {len(new_signals) - len([s for s in signals['signals'] if s['signal_type'] != 'ALLOCATION_CONTEXT'])}")


if __name__ == '__main__':
    enrich()
