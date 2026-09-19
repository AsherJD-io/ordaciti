#!/usr/bin/env python3
"""
Phase 6 — Signal generation.

Produces deterministic signal objects for the five core signals:
  - REPEAT_INTERVENTION
  - CONTRACTOR_RECURRENCE
  - EVIDENCE_GAP
  - RECORD_CHANGE
  - ALLOCATION_CONTEXT

Input:
  - data/processed/patterns.json     (Phase 5 output)
  - data/processed/normalized_projects.json (Phase 4 output)

Output:
  - data/processed/signals.json

All signals are deterministic. No randomness, no timestamps in output.
"""

import json
import sys
from collections import defaultdict
from datetime import date
from typing import Any

PATTERNS_PATH = "data/processed/patterns.json"
NORMALIZED_PATH = "data/processed/normalized_projects.json"
OUTPUT_PATH = "data/processed/signals.json"

LIFECYCLE_STAGES = [
    "planning",
    "tender",
    "award",
    "contract",
    "amendment",
    "implementation",
    "payment",
    "completion",
    "termination",
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _load_json(path: str) -> dict:
    with open(path) as f:
        return json.load(f)


def _project_lookup(normalized: dict) -> dict[str, dict]:
    """project_id (str) -> project dict."""
    return {str(p["project_id"]): p for p in normalized["projects"]}


def _parse_date(s: Any) -> date | None:
    if not s or not isinstance(s, str):
        return None
    try:
        y, m, d = s.split("-")
        return date(int(y), int(m), int(d))
    except (ValueError, AttributeError):
        return None


def _interval_days(d1: date, d2: date) -> int:
    return abs((d2 - d1).days)


# ---------------------------------------------------------------------------
# Signal 1: REPEAT_INTERVENTION
# ---------------------------------------------------------------------------

def generate_repeat_intervention_signals(
    patterns: dict, project_lookup: dict[str, dict]
) -> list[dict]:
    """One signal per cluster with 2+ projects that have date information."""
    signals: list[dict] = []

    for cluster in patterns.get("clusters", []):
        cluster_id = cluster["cluster_id"]
        history = cluster.get("history", [])
        if not history:
            continue

        # Filter to projects with at least one date
        dated = [h for h in history if _parse_date(h.get("date_of_advert")) or _parse_date(h.get("date_of_award"))]
        if len(dated) < 2:
            continue

        # Determine date range
        first_date = None
        latest_date = None
        for h in dated:
            d = _parse_date(h.get("date_of_advert")) or _parse_date(h.get("date_of_award"))
            if d:
                if first_date is None or d < first_date:
                    first_date = d
                if latest_date is None or d > latest_date:
                    latest_date = d

        if not first_date or not latest_date:
            continue

        # Intervals between consecutive dated projects
        sorted_history = sorted(dated, key=lambda h: _parse_date(h.get("date_of_advert")) or _parse_date(h.get("date_of_award")) or date(1900, 1, 1))
        intervals = []
        for i in range(1, len(sorted_history)):
            d_prev = _parse_date(sorted_history[i - 1].get("date_of_advert")) or _parse_date(sorted_history[i - 1].get("date_of_award"))
            d_curr = _parse_date(sorted_history[i].get("date_of_advert")) or _parse_date(sorted_history[i].get("date_of_award"))
            if d_prev and d_curr:
                intervals.append(_interval_days(d_prev, d_curr))

        cumulative_value = cluster.get("cumulative_recorded_contract_value")
        matching_features = cluster.get("similarity_relationships", [])
        # Extract unique matching feature dimensions from cluster relationships
        feature_dims: set[str] = set()
        for rel in matching_features:
            mf = rel.get("matching_features", [])
            for f in mf:
                dim = f.get("dimension", "")
                if dim:
                    feature_dims.add(dim)
        unique_features = sorted(feature_dims) if feature_dims else []

        signals.append({
            "signal_type": "REPEAT_INTERVENTION",
            "cluster_id": cluster_id,
            "project_count": cluster["project_count"],
            "project_ids": cluster["project_ids"],
            "first_project_date": first_date.isoformat(),
            "latest_project_date": latest_date.isoformat(),
            "intervals_days": intervals,
            "cumulative_recorded_contract_value": cumulative_value,
            "matching_features": unique_features,
        })

    return signals


# ---------------------------------------------------------------------------
# Signal 2: CONTRACTOR_RECURRENCE
# ---------------------------------------------------------------------------

def generate_contractor_recurrence_signals(
    patterns: dict, project_lookup: dict[str, dict]
) -> list[dict]:
    """
    Detect contractors appearing across multiple projects.

    A contractor is 'recurring' if they appear in 2+ distinct projects.
    We use normalized contractor names from Phase 4.

    Relatedness is determined by cluster membership: contractors that appear
    in projects within the same cluster are 'related contractor recurrence'.
    Contractors appearing across different clusters or singletons are also
    recorded but flagged as cross-cluster.
    """
    # Map contractor_name -> set of project_ids
    contractor_projects: dict[str, set[str]] = defaultdict(set)
    # Map contractor_name -> dict of project_id -> contract_amount
    contractor_values: dict[str, dict[str, float]] = defaultdict(dict)

    for pid, proj in project_lookup.items():
        contractors = proj.get("contractors", [])
        for c in contractors:
            name = c.get("contractor", "").strip()
            if not name or name.upper() in ("N/A", "NULL", ""):
                continue
            contractor_projects[name].add(pid)
            amount = proj.get("normalized_contract_amount")
            if amount is not None:
                contractor_values[name][pid] = amount

    signals: list[dict] = []

    for contractor_name, pids in contractor_projects.items():
        if len(pids) < 2:
            continue

        # Determine which clusters these projects belong to
        pid_to_cluster: dict[str, int | None] = {}
        for cluster in patterns.get("clusters", []):
            for pid in cluster.get("project_ids", []):
                pid_to_cluster[pid] = cluster["cluster_id"]

        cluster_ids = set()
        related_pids: set[str] = set()
        cross_cluster_pids: set[str] = set()

        for pid in pids:
            cid = pid_to_cluster.get(pid)
            if cid is not None:
                cluster_ids.add(cid)
                related_pids.add(pid)
            else:
                cross_cluster_pids.add(pid)

        total_value = sum(
            v for pid, v in contractor_values[contractor_name].items() if pid in pids
        )

        # Date range
        dates: list[date] = []
        for pid in pids:
            proj = project_lookup.get(pid)
            if proj:
                d = _parse_date(proj.get("normalized_date_of_advert")) or _parse_date(proj.get("normalized_date_of_award"))
                if d:
                    dates.append(d)

        first_date = min(dates).isoformat() if dates else None
        latest_date = max(dates).isoformat() if dates else None

        signals.append({
            "signal_type": "CONTRACTOR_RECURRENCE",
            "contractor": contractor_name,
            "project_count": len(pids),
            "project_ids": sorted(pids),
            "related_cluster_ids": sorted(cluster_ids) if cluster_ids else [],
            "in_cluster_projects": sorted(related_pids),
            "cross_cluster_project_ids": sorted(cross_cluster_pids),
            "recorded_related_contract_value": total_value,
            "first_project_date": first_date,
            "latest_project_date": latest_date,
        })

    return signals


# ---------------------------------------------------------------------------
# Signal 3: EVIDENCE_GAP
# ---------------------------------------------------------------------------

def _assess_lifecycle_stage(proj: dict) -> dict[str, str]:
    """
    Return lifecycle stage assessment for a single project.

    Each stage is one of: available, partial, missing, unknown.
    """
    assessment: dict[str, str] = {}

    # Planning: budget_amount present
    budget = proj.get("normalized_budget_amount")
    if budget is not None and budget > 0:
        assessment["planning"] = "available"
    else:
        assessment["planning"] = "missing"

    # Tender: procurement_method present
    method = proj.get("normalized_procurement_method")
    if method and method not in ("N/A", "Null", ""):
        assessment["tender"] = "available"
    else:
        assessment["tender"] = "missing"

    # Award: date_of_award present
    award = _parse_date(proj.get("normalized_date_of_award"))
    if award:
        assessment["award"] = "available"
    else:
        assessment["award"] = "missing"

    # Contract: contract_amount present
    contract = proj.get("normalized_contract_amount")
    if contract is not None and contract > 0:
        assessment["contract"] = "available"
    else:
        assessment["contract"] = "missing"

    # Amendment: not tracked in source
    assessment["amendment"] = "unknown"

    # Implementation: contract_start/end present
    start = _parse_date(proj.get("normalized_contract_start"))
    end = _parse_date(proj.get("normalized_contract_end"))
    if start and end:
        assessment["implementation"] = "available"
    elif start or end:
        assessment["implementation"] = "partial"
    else:
        assessment["implementation"] = "missing"

    # Payment: not tracked in source
    assessment["payment"] = "unknown"

    # Completion: contract_end with reasonable date
    if end and end >= date(2015, 1, 1):
        assessment["completion"] = "available"
    elif end:
        assessment["completion"] = "partial"
    else:
        assessment["completion"] = "missing"

    # Termination: not tracked in source
    assessment["termination"] = "unknown"

    return assessment


def generate_evidence_gap_signals(
    patterns: dict, project_lookup: dict[str, dict]
) -> list[dict]:
    """
    One evidence gap assessment per project.

    Returns the lifecycle matrix for each project.
    """
    signals: list[dict] = []

    # Use only project IDs that exist in the normalized dataset
    all_project_ids = [str(pid) for pid in project_lookup.keys()]

    for pid in sorted(all_project_ids, key=lambda x: int(x)):
        proj = project_lookup.get(pid)
        if not proj:
            continue

        assessment = _assess_lifecycle_stage(proj)

        # Count stages by status
        counts = {"available": 0, "partial": 0, "missing": 0, "unknown": 0}
        for status in assessment.values():
            counts[status] += 1

        signals.append({
            "signal_type": "EVIDENCE_GAP",
            "project_id": pid,
            "title": proj.get("normalized_title", ""),
            "lifecycle_assessment": assessment,
            "summary": {
                "available": counts["available"],
                "partial": counts["partial"],
                "missing": counts["missing"],
                "unknown": counts["unknown"],
            },
        })

    return signals


# ---------------------------------------------------------------------------
# Signal 4: RECORD_CHANGE
# ---------------------------------------------------------------------------

def generate_record_change_signals(
    patterns: dict, project_lookup: dict[str, dict]
) -> list[dict]:
    """
    Compare multiple OCDS releases for the same project.

    The Kaduna OCDS source does NOT provide release data (source_release_id
    is null for all projects, OCDS API endpoints are broken). Therefore this
    signal cannot be generated from the available data.

    We return a single signal documenting this limitation,
    per implementation.md: "If a signal cannot be supported by the current
    dataset, follow the exact unavailable/unknown behaviour specified by
    implementation.md and document the limitation."
    """
    # Check if any project has a non-null source_release_id
    has_releases = False
    for pid, proj in project_lookup.items():
        if proj.get("source_release_id"):
            has_releases = True
            break

    if not has_releases:
        return [{
            "signal_type": "RECORD_CHANGE",
            "unavailable": True,
            "reason": "No OCDS release data available in source. All projects have null source_release_id. OCDS API endpoints return HTTP 500. Record change detection requires multiple releases/versions per project which are not present in the current dataset.",
            "fields_checked": [
                "contract_amount",
                "contractor",
                "status",
                "implementation_status",
                "completion_date",
                "contract_end",
            ],
            "projects_affected": len(project_lookup),
        }]

    # If releases existed, we would compare them here.
    # This branch is unreachable with current data but kept for completeness.
    signals: list[dict] = []
    return signals


# ---------------------------------------------------------------------------
# Signal 5: ALLOCATION_CONTEXT
# ---------------------------------------------------------------------------

def generate_allocation_context_signals(
    patterns: dict, project_lookup: dict[str, dict]
) -> list[dict]:
    """
    Aggregate project records at LGA level and compute population-normalized
    metrics where population data is available.

    Per implementation.md section 17: "use the documented population-normalized
    metrics only when the required population/context data exists."

    The current dataset does NOT contain population data. Therefore we return
    LGA-level aggregation of available project data and mark population-dependent
    metrics as unavailable.
    """
    # Aggregate by LGA
    lga_data: dict[str, dict] = defaultdict(lambda: {
        "project_count": 0,
        "total_contract_value": 0.0,
        "total_budget_value": 0.0,
        "project_ids": [],
        "sector_breakdown": defaultdict(lambda: {"count": 0, "value": 0.0}),
    })

    for pid, proj in project_lookup.items():
        lga = proj.get("normalized_lga", "Unknown")
        if not lga or lga in ("N/A", "Null", ""):
            lga = "Unspecified"

        lga_data[lga]["project_count"] += 1
        lga_data[lga]["project_ids"].append(pid)

        contract = proj.get("normalized_contract_amount")
        if contract is not None:
            lga_data[lga]["total_contract_value"] += contract

        budget = proj.get("normalized_budget_amount")
        if budget is not None:
            lga_data[lga]["total_budget_value"] += budget

        sector = proj.get("normalized_sector", "Unknown")
        if sector and sector not in ("N/A", "Null", ""):
            lga_data[lga]["sector_breakdown"][sector]["count"] += 1
            if contract is not None:
                lga_data[lga]["sector_breakdown"][sector]["value"] += contract

    signals: list[dict] = []

    for lga, data in sorted(lga_data.items()):
        signal = {
            "signal_type": "ALLOCATION_CONTEXT",
            "lga": lga,
            "project_count": data["project_count"],
            "project_ids": data["project_ids"],
            "recorded_contract_value": data["total_contract_value"],
            "recorded_budget_value": data["total_budget_value"],
            "sector_breakdown": {
                sector: {"project_count": d["count"], "recorded_value": d["value"]}
                for sector, d in data["sector_breakdown"].items()
            },
            "population": None,
            "value_per_100k_population": None,
            "projects_per_100k_population": None,
            "population_data_available": False,
            "note": "Population data not available in current dataset. Population-normalized metrics (value_per_100k_population, projects_per_100k_population) cannot be computed. Per implementation.md section 17: use population-normalized metrics only when required population/context data exists.",
        }
        signals.append(signal)

    return signals


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    patterns = _load_json(PATTERNS_PATH)
    normalized = _load_json(NORMALIZED_PATH)
    project_lookup = _project_lookup(normalized)

    signals = {
        "manifest": {
            "input_patterns": PATTERNS_PATH,
            "input_normalized": NORMALIZED_PATH,
            "output_file": OUTPUT_PATH,
            "generated_from_phase": 5,
            "signals_generated": [],
        },
        "signals": [],
    }

    # 1. REPEAT_INTERVENTION
    ri_signals = generate_repeat_intervention_signals(patterns, project_lookup)
    signals["signals"].extend(ri_signals)
    signals["manifest"]["signals_generated"].append({
        "type": "REPEAT_INTERVENTION",
        "count": len(ri_signals),
    })

    # 2. CONTRACTOR_RECURRENCE
    cr_signals = generate_contractor_recurrence_signals(patterns, project_lookup)
    signals["signals"].extend(cr_signals)
    signals["manifest"]["signals_generated"].append({
        "type": "CONTRACTOR_RECURRENCE",
        "count": len(cr_signals),
    })

    # 3. EVIDENCE_GAP
    eg_signals = generate_evidence_gap_signals(patterns, project_lookup)
    signals["signals"].extend(eg_signals)
    signals["manifest"]["signals_generated"].append({
        "type": "EVIDENCE_GAP",
        "count": len(eg_signals),
    })

    # 4. RECORD_CHANGE
    rc_signals = generate_record_change_signals(patterns, project_lookup)
    signals["signals"].extend(rc_signals)
    signals["manifest"]["signals_generated"].append({
        "type": "RECORD_CHANGE",
        "count": len(rc_signals),
    })

    # 5. ALLOCATION_CONTEXT
    ac_signals = generate_allocation_context_signals(patterns, project_lookup)
    signals["signals"].extend(ac_signals)
    signals["manifest"]["signals_generated"].append({
        "type": "ALLOCATION_CONTEXT",
        "count": len(ac_signals),
    })

    with open(OUTPUT_PATH, "w") as f:
        json.dump(signals, f, indent=2)

    print(f"Generated {len(signals['signals'])} signals across 5 types.")
    for sg in signals["manifest"]["signals_generated"]:
        print(f"  {sg['type']}: {sg['count']}")


if __name__ == "__main__":
    main()
