#!/usr/bin/env python3
"""
Phase 7 — Evidence model.

Generates one structured evidence object per project per implementation.md
section 21. Evidence objects separate facts, signals, unknowns, context,
questions, and sources.

Input:
  - data/processed/normalized_projects.json  (Phase 4)
  - data/processed/patterns.json             (Phase 5)
  - data/processed/signals.json              (Phase 6)

Output:
  - data/processed/evidence.json
"""

import json
import sys
from collections import defaultdict
from typing import Any

NORMALIZED_PATH = "data/processed/normalized_projects.json"
PATTERNS_PATH = "data/processed/patterns.json"
SIGNALS_PATH = "data/processed/signals.json"
OUTPUT_PATH = "data/processed/evidence.json"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _load_json(path: str) -> dict:
    with open(path) as f:
        return json.load(f)


def _project_lookup(normalized: dict) -> dict[str, dict]:
    return {str(p["project_id"]): p for p in normalized["projects"]}


def _parse_date(s: Any) -> str | None:
    """Return ISO date string or None."""
    if not s or not isinstance(s, str):
        return None
    # Already ISO format in normalized data
    if len(s) >= 10 and s[4] == "-" and s[7] == "-":
        return s[:10]
    return None


# ---------------------------------------------------------------------------
# Facts
# ---------------------------------------------------------------------------

def _build_facts(proj: dict, patterns: dict, project_lookup: dict[str, dict]) -> list[dict]:
    """
    Build deterministic facts from the project record and Phase 5/6 data.

    Each fact is a dict with 'text' and 'source_ids'.
    """
    facts: list[dict] = []
    pid = str(proj["project_id"])
    source_ids: list[str] = [f"SRC-{pid}"]

    # Basic project facts
    title = proj.get("normalized_title") or proj.get("title")
    if title:
        facts.append({
            "text": f"Project title: {title}",
            "source_ids": source_ids,
        })

    mda = proj.get("normalized_mda")
    if mda:
        facts.append({
            "text": f"Executing MDA: {mda}",
            "source_ids": source_ids,
        })

    lga = proj.get("normalized_lga")
    if lga and lga not in ("N/A", "Null", ""):
        facts.append({
            "text": f"Location (LGA): {lga}",
            "source_ids": source_ids,
        })

    sector = proj.get("normalized_sector")
    if sector and sector not in ("N/A", "Null", ""):
        facts.append({
            "text": f"Sector: {sector}",
            "source_ids": source_ids,
        })

    # Budget fact
    budget = proj.get("normalized_budget_amount")
    if budget is not None and budget > 0:
        facts.append({
            "text": f"Recorded budget: ₦{budget:,.2f}",
            "source_ids": source_ids,
        })

    # Contract value fact
    contract = proj.get("normalized_contract_amount")
    if contract is not None and contract > 0:
        facts.append({
            "text": f"Recorded contract value: ₦{contract:,.2f}",
            "source_ids": source_ids,
        })

    # Date facts
    advert = _parse_date(proj.get("normalized_date_of_advert"))
    if advert:
        facts.append({
            "text": f"Date of advert: {advert}",
            "source_ids": source_ids,
        })

    award = _parse_date(proj.get("normalized_date_of_award"))
    if award:
        facts.append({
            "text": f"Date of award: {award}",
            "source_ids": source_ids,
        })

    # Procurement method
    method = proj.get("normalized_procurement_method")
    if method and method not in ("N/A", "Null", ""):
        facts.append({
            "text": f"Procurement method: {method}",
            "source_ids": source_ids,
        })

    # Contractor facts
    contractors = proj.get("contractors", [])
    if contractors:
        names = [c.get("contractor", "Unknown") for c in contractors if c.get("contractor")]
        if names:
            facts.append({
                "text": f"Contractor(s): {', '.join(names)}",
                "source_ids": source_ids,
            })

    # Cluster membership fact (from Phase 5)
    for cluster in patterns.get("clusters", []):
        if pid in cluster.get("project_ids", []):
            cluster_id = cluster["cluster_id"]
            cluster_pids = cluster["project_ids"]
            other_pids = [p for p in cluster_pids if p != pid]
            if other_pids:
                facts.append({
                    "text": f"Project is in cluster {cluster_id} with {len(other_pids)} other related project(s)",
                    "source_ids": source_ids + ["PATTERNS"],
                })
            else:
                facts.append({
                    "text": f"Project is in cluster {cluster_id} (single-project cluster)",
                    "source_ids": source_ids + ["PATTERNS"],
                })
            break

    return facts


# ---------------------------------------------------------------------------
# Signals
# ---------------------------------------------------------------------------

def _build_signals(pid: str, proj: dict, signals_data: dict) -> list[dict]:
    """
    Attach signals that reference this project from signals.json.

    Does NOT recreate signal logic. Uses the actual Phase 6 output.
    """
    signals: list[dict] = []
    sig_list = signals_data.get("signals", [])

    for sig in sig_list:
        # Check if this signal references the project
        refs_pid = False

        # EVIDENCE_GAP: direct project_id match
        if sig.get("signal_type") == "EVIDENCE_GAP":
            if str(sig.get("project_id")) == pid:
                refs_pid = True
                lifecycle = sig.get("lifecycle_assessment", {})
                summary = sig.get("summary", {})
                signals.append({
                    "type": "EVIDENCE_GAP",
                    "source": "phase6",
                    "lifecycle_assessment": lifecycle,
                    "summary": summary,
                })

        # REPEAT_INTERVENTION: check if pid in project_ids
        if sig.get("signal_type") == "REPEAT_INTERVENTION":
            if pid in [str(p) for p in sig.get("project_ids", [])]:
                refs_pid = True
                signals.append({
                    "type": "REPEAT_INTERVENTION",
                    "source": "phase6",
                    "cluster_id": sig.get("cluster_id"),
                    "project_count": sig.get("project_count"),
                    "related_project_ids": [str(p) for p in sig.get("project_ids", []) if str(p) != pid],
                    "first_project_date": sig.get("first_project_date"),
                    "latest_project_date": sig.get("latest_project_date"),
                    "intervals_days": sig.get("intervals_days"),
                    "cumulative_recorded_contract_value": sig.get("cumulative_recorded_contract_value"),
                    "matching_features": sig.get("matching_features"),
                })

        # CONTRACTOR_RECURRENCE: check if pid in project_ids
        if sig.get("signal_type") == "CONTRACTOR_RECURRENCE":
            if pid in [str(p) for p in sig.get("project_ids", [])]:
                refs_pid = True
                signals.append({
                    "type": "CONTRACTOR_RECURRENCE",
                    "source": "phase6",
                    "contractor": sig.get("contractor"),
                    "project_count": sig.get("project_count"),
                    "related_project_ids": [str(p) for p in sig.get("project_ids", []) if str(p) != pid],
                    "recorded_related_contract_value": sig.get("recorded_related_contract_value"),
                    "first_project_date": sig.get("first_project_date"),
                    "latest_project_date": sig.get("latest_project_date"),
                })

        # RECORD_CHANGE: unavailable — only include if signals.json explicitly
        # references this project. The Phase 6 RECORD_CHANGE signal is global
        # (no project-specific reference), so it must NOT be attached as a
        # project signal. The limitation is preserved in unknowns/context.
        if sig.get("signal_type") == "RECORD_CHANGE":
            # Check whether this signal references a specific project
            sig_project_refs = []
            sig_pids = sig.get("project_ids", [])
            if sig_pids:
                sig_project_refs = [str(p) for p in sig_pids]
            # Also check project_id field
            sig_proj_id = sig.get("project_id")
            if sig_proj_id and str(sig_proj_id) == pid:
                sig_project_refs.append(str(sig_proj_id))

            if pid in sig_project_refs:
                refs_pid = True
                signals.append({
                    "type": "RECORD_CHANGE",
                    "source": "phase6",
                    "unavailable": True,
                    "reason": sig.get("reason"),
                })

        # ALLOCATION_CONTEXT: include LGA-level context
        if sig.get("signal_type") == "ALLOCATION_CONTEXT":
            lga = proj.get("normalized_lga", "")
            if lga and str(sig.get("lga")) == str(lga):
                refs_pid = True
                signals.append({
                    "type": "ALLOCATION_CONTEXT",
                    "source": "phase6",
                    "lga": sig.get("lga"),
                    "lga_project_count": sig.get("project_count"),
                    "lga_recorded_contract_value": sig.get("recorded_contract_value"),
                    "population_data_available": sig.get("population_data_available", False),
                })

    # Deduplicate signals: keep distinct analytical signals.
    # For CONTRACTOR_RECURRENCE, each contractor is a distinct signal.
    # For REPEAT_INTERVENTION, each cluster is a distinct signal.
    # For ALLOCATION_CONTEXT, the LGA match is a single signal per project.
    # For EVIDENCE_GAP and RECORD_CHANGE, one per project max.
    seen: set[tuple] = set()
    unique: list[dict] = []
    for s in signals:
        st = s["type"]
        if st == "CONTRACTOR_RECURRENCE":
            # Key on contractor name — each contractor is distinct
            key = (st, s.get("contractor", ""))
        elif st == "REPEAT_INTERVENTION":
            # Key on cluster_id — each cluster is distinct
            key = (st, str(s.get("cluster_id")))
        elif st == "ALLOCATION_CONTEXT":
            # Key on LGA — one allocation context per project
            key = (st, str(s.get("lga")))
        else:
            # EVIDENCE_GAP, RECORD_CHANGE: one per project
            key = (st, pid)
        if key not in seen:
            seen.add(key)
            unique.append(s)

    return unique


# ---------------------------------------------------------------------------
# Unknowns
# ---------------------------------------------------------------------------

def _build_unknowns(proj: dict, signals: list[dict]) -> list[str]:
    """
    Build unknowns list from missing data and signal-derived gaps.

    Never convert missing information into zero or evidence of absence.
    """
    unknowns: list[str] = []
    pid = str(proj["project_id"])
    source_ids = [f"SRC-{pid}"]

    # OCID unavailable
    if not proj.get("ocid"):
        unknowns.append("OCID not available in source record")

    # Release data unavailable
    if not proj.get("source_release_id"):
        unknowns.append("No OCDS release data available for this project")

    # Record change unavailable (from signals)
    for sig in signals:
        if sig.get("type") == "RECORD_CHANGE" and sig.get("unavailable"):
            unknowns.append("Record change detection unavailable: no OCDS release data in source")
            break

    # Lifecycle gaps from EVIDENCE_GAP signal
    for sig in signals:
        if sig.get("type") == "EVIDENCE_GAP":
            lifecycle = sig.get("lifecycle_assessment", {})
            for stage, status in lifecycle.items():
                if status == "missing":
                    unknowns.append(f"{stage.capitalize()} evidence is not available in the retrieved records")
                elif status == "unknown":
                    unknowns.append(f"{stage.capitalize()} evidence status is unknown (not tracked in source)")
            break

    # Implementation evidence
    contract_start = _parse_date(proj.get("normalized_contract_start"))
    contract_end = _parse_date(proj.get("normalized_contract_end"))
    if not contract_start and not contract_end:
        unknowns.append("Implementation period evidence is not available in the retrieved records")

    # Payment evidence
    unknowns.append("Payment evidence is not tracked in the available source")

    # Completion evidence
    if not contract_end:
        unknowns.append("Completion evidence is not available in the retrieved records")

    # Population context
    unknowns.append("Population context data not available — allocation context metrics limited")

    # Remove duplicates while preserving order
    seen: set[str] = set()
    unique: list[str] = []
    for u in unknowns:
        if u not in seen:
            seen.add(u)
            unique.append(u)

    return unique


# ---------------------------------------------------------------------------
# Context
# ---------------------------------------------------------------------------

def _build_context(proj: dict, patterns: dict, signals: list[dict]) -> dict:
    """
    Build context object from cluster history, cumulative values, and signals.

    Does NOT include unimplemented geographic/population context.
    """
    context: dict[str, Any] = {}
    pid = str(proj["project_id"])

    # Cluster context
    for cluster in patterns.get("clusters", []):
        if pid in cluster.get("project_ids", []):
            context["cluster_id"] = cluster["cluster_id"]
            context["cluster_project_count"] = cluster["project_count"]
            context["cluster_cumulative_recorded_contract_value"] = cluster.get("cumulative_recorded_contract_value")
            context["cluster_history"] = [
                {
                    "project_id": str(h["project_id"]),
                    "title": h.get("title", ""),
                    "date_of_advert": h.get("date_of_advert"),
                    "date_of_award": h.get("date_of_award"),
                    "contract_amount": h.get("contract_amount"),
                }
                for h in cluster.get("history", [])
            ]
            context["cluster_matching_features"] = cluster.get("similarity_relationships", [])
            break

    # Contractor context (from project record)
    contractors = proj.get("contractors", [])
    if contractors:
        context["contractors"] = [
            {
                "name": c.get("contractor", "Unknown"),
                "address": c.get("address"),
                "phone": c.get("phone"),
                "email": c.get("email"),
            }
            for c in contractors
        ]

    # LGA allocation context (from signals)
    for sig in signals:
        if sig.get("type") == "ALLOCATION_CONTEXT":
            context["lga_allocation"] = {
                "lga": sig.get("lga"),
                "project_count": sig.get("lga_project_count"),
                "recorded_contract_value": sig.get("lga_recorded_contract_value"),
                "population_data_available": sig.get("population_data_available", False),
            }
            break

    return context


# ---------------------------------------------------------------------------
# Questions
# ---------------------------------------------------------------------------

def _build_questions(proj: dict, facts: list[dict], signals: list[dict], unknowns: list[str]) -> list[str]:
    """
    Generate neutral review questions grounded in actual evidence.

    Questions are never accusations or conclusions.
    """
    questions: list[str] = []
    pid = str(proj["project_id"])

    # Questions from REPEAT_INTERVENTION
    for sig in signals:
        if sig.get("type") == "REPEAT_INTERVENTION":
            related = sig.get("related_project_ids", [])
            if related:
                questions.append(
                    f"What is the relationship between this project and the {len(related)} other related project(s) in the same cluster?"
                )
            if sig.get("intervals_days"):
                questions.append(
                    "Do the recorded dates suggest a pattern of repeated intervention at this location or asset?"
                )
            questions.append(
                "Were the related interventions planned maintenance, expansion, replacement, or remediation?"
            )
            break

    # Questions from CONTRACTOR_RECURRENCE
    for sig in signals:
        if sig.get("type") == "CONTRACTOR_RECURRENCE":
            questions.append(
                f"The same contractor appears in multiple related records. What explains this pattern?"
            )
            break

    # Questions from evidence gaps
    has_missing = any("not available" in u.lower() for u in unknowns)
    if has_missing:
        questions.append("What additional evidence would help confirm whether the recorded project activities occurred as described?")

    # Questions from missing lifecycle stages
    for sig in signals:
        if sig.get("type") == "EVIDENCE_GAP":
            lifecycle = sig.get("lifecycle_assessment", {})
            missing_stages = [s for s, st in lifecycle.items() if st == "missing"]
            if missing_stages:
                questions.append(
                    f"What evidence is available for the {', '.join(missing_stages)} stage(s) of this project?"
                )
            break

    # General questions for all projects
    questions.append(
        "Does the available evidence show a broader strategy for addressing this infrastructure need?"
    )

    return questions


# ---------------------------------------------------------------------------
# Sources
# ---------------------------------------------------------------------------

def _build_sources(proj: dict) -> list[dict]:
    """
    Build source list from project record.

    Preserves source_url and source identifiers where available.
    Does NOT invent OCIDs or release IDs.
    """
    sources: list[dict] = []
    pid = str(proj["project_id"])

    # Primary source
    source_url = proj.get("source_url")
    if source_url:
        sources.append({
            "id": f"SRC-{pid}",
            "url": source_url,
            "type": "Kaduna OCDS Portal Project Page",
        })

    # Source record metadata
    sources.append({
        "id": f"SRC-{pid}-RECORD",
        "project_id": pid,
        "source_release_id": proj.get("source_release_id"),
        "retrieved_at": proj.get("retrieved_at"),
        "source_updated_at": proj.get("source_updated_at"),
        "type": "OCDS Portal Project Record",
    })

    # Note about OCID availability
    if not proj.get("ocid"):
        sources.append({
            "id": f"SRC-{pid}-NOTE",
            "note": "OCID not available in source. OCDS API endpoints return HTTP 500.",
            "type": "Data Availability Note",
        })

    return sources


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    normalized = _load_json(NORMALIZED_PATH)
    patterns = _load_json(PATTERNS_PATH)
    signals_data = _load_json(SIGNALS_PATH)

    project_lookup = _project_lookup(normalized)

    evidence_objects: list[dict] = []

    for pid_str in sorted(project_lookup.keys(), key=lambda x: int(x)):
        proj = project_lookup[pid_str]

        facts = _build_facts(proj, patterns, project_lookup)
        sigs = _build_signals(pid_str, proj, signals_data)
        unknowns = _build_unknowns(proj, sigs)
        context = _build_context(proj, patterns, sigs)
        questions = _build_questions(proj, facts, sigs, unknowns)
        sources = _build_sources(proj)

        evidence_objects.append({
            "project_id": pid_str,
            "facts": facts,
            "signals": sigs,
            "unknowns": unknowns,
            "context": context,
            "questions_for_review": questions,
            "sources": sources,
        })

    output = {
        "manifest": {
            "input_normalized": NORMALIZED_PATH,
            "input_patterns": PATTERNS_PATH,
            "input_signals": SIGNALS_PATH,
            "output_file": OUTPUT_PATH,
            "generated_from_phase": 7,
            "project_count": len(evidence_objects),
        },
        "evidence": evidence_objects,
    }

    with open(OUTPUT_PATH, "w") as f:
        json.dump(output, f, indent=2)

    print(f"Generated {len(evidence_objects)} evidence objects.")


if __name__ == "__main__":
    main()
