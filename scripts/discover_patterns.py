#!/usr/bin/env python3
"""
Ordaciti Phase 5: Pattern Discovery and Project Clustering

Reads the Phase 4 normalized dataset and produces:
- Similarity relationships between projects
- Analytical clusters (connected components of related projects)
- Project history timelines for clusters
- Cumulative recorded contract values per cluster
- Demo-case candidates for the prototype

IMPORTANT: This is Phase 5 only. Phase 6 signals (REPEAT_INTERVENTION,
CONTRACTOR_RECURRENCE, EVIDENCE_GAP, RECORD_CHANGE, ALLOCATION_CONTEXT)
are NOT implemented here.

Input:  data/processed/normalized_projects.json (Phase 4 output)
Output: data/processed/patterns.json

Deterministic: same input -> same output. No randomness. No timestamps
in analytical output. No LLM. No external APIs.
"""

import json
import re
import sys
from datetime import datetime
from pathlib import Path
from collections import defaultdict, Counter
from rapidfuzz import fuzz

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
INPUT_FILE = BASE_DIR / "data" / "processed" / "normalized_projects.json"
OUTPUT_FILE = BASE_DIR / "data" / "processed" / "patterns.json"

# =========================================================================
# KNOWN KADUNA LGAS (from Phase 4 normalization / official source)
# =========================================================================
# Only exact matches to these 23 LGAs count as valid same-LGA evidence.
# Descriptive location strings (e.g. "12 Schools") and placeholder values
# (Null, N/A) do NOT count as same-LGA evidence.
# Source: Kaduna State official LGA list.
# ---------------------------------------------------------------------------

KNOWN_KADUNA_LGAS = frozenset([
    "Birnin Gwari", "Chikun", "Giwa", "Igabi", "Ikara", "Jaba", "Jema'a",
    "Kachia", "Kaduna North", "Kaduna South", "Kagarko", "Kajuru", "Kaura",
    "Kauru", "Kubau", "Kudan", "Lere", "Makarfi", "Sabon Gari", "Sanga",
    "Soba", "Zangon Kataf", "Zaria",
])

# Values that represent missing/unknown location — must NOT count as LGA evidence.
MISSING_LGA_VALUES = frozenset([
    "", "null", "none", "n/a", "na", "nil", "unknown", "undefined",
    "not available", "not applicable", "nill", "nillual",
])


def _is_missing_lga(value):
    """Return True if the LGA value represents missing/unknown location."""
    if value is None:
        return True
    s = str(value).strip()
    if not s:
        return True
    if s.lower() in MISSING_LGA_VALUES:
        return True
    return False


def _is_valid_known_lga(value):
    """Return True if value is a non-missing exact match to a known Kaduna LGA."""
    if _is_missing_lga(value):
        return False
    return str(value).strip() in KNOWN_KADUNA_LGAS
INTERVENTION_KEYWORDS = [
    "construction",
    "rehabilitation",
    "repair",
    "renovation",
    "reconstruction",
    "maintenance",
    "upgrade",
    "expansion",
    "replacement",
]

# =========================================================================
# SIMILARITY THRESHOLDS (transparent, documented)
# =========================================================================
# Text similarity threshold for considering two projects potentially related.
# Below this, text similarity contributes 0 to the hybrid score.
TEXT_SIMILARITY_MIN = 60  # rapidfuzz ratio 0-100

# Hybrid score threshold for establishing a cluster relationship.
# A pair must score >= this to be linked.
# Threshold raised to 85 after data analysis showed threshold 75 produced
# a 594-project giant cluster (over-merging). At 85, only pairs with
# strong text similarity (>= ~70) plus same-LGA/same-sector bonuses,
# or very high text similarity alone (>= 85), will link.
CLUSTER_LINK_THRESHOLD = 85  # 0-100+ scale

# =========================================================================
# TEXT SIMILARITY
# =========================================================================


def text_similarity(title_a, title_b):
    """Compute normalized text similarity between two project titles.

    Uses rapidfuzz ratio (0-100). Deterministic.
    Returns 0 if either title is missing.
    """
    if not title_a or not title_b:
        return 0
    return fuzz.ratio(str(title_a).lower(), str(title_b).lower())


def keyword_overlap_score(title_a, title_b):
    """Compute intervention keyword overlap between two titles.

    Returns a score 0-30 based on how many intervention keywords appear
    in both titles.
    """
    if not title_a or not title_b:
        return 0

    a_lower = str(title_a).lower()
    b_lower = str(title_b).lower()

    a_keywords = {kw for kw in INTERVENTION_KEYWORDS if kw in a_lower}
    b_keywords = {kw for kw in INTERVENTION_KEYWORDS if kw in b_lower}

    if not a_keywords or not b_keywords:
        return 0

    overlap = a_keywords & b_keywords
    if not overlap:
        return 0

    # Score: 10 points per overlapping keyword, max 30
    return min(30, len(overlap) * 10)


# =========================================================================
# DIMENSIONAL MATCH SCORES
# =========================================================================


def same_lga_score(lga_a, lga_b):
    """Score for same LGA match.

    Only awards points when both LGAs are exact matches to known Kaduna LGAs.
    Placeholder values (Null, N/A, empty) do NOT count as valid LGA evidence.

    Returns 25 if both are valid known Kaduna LGAs and match exactly, else 0.
    """
    if not (_is_valid_known_lga(lga_a) and _is_valid_known_lga(lga_b)):
        return 0
    if str(lga_a).strip() == str(lga_b).strip():
        return 25
    return 0


def same_sector_score(sector_a, sector_b, lga_a, lga_b):
    """Score for same sector match.

    Sector bonus only applies when projects are also co-located
    (same known Kaduna LGA). Without geographic co-location, same sector is too
    common (e.g. 284/610 projects are "Works") to be a meaningful
    clustering signal. Also rejects N/A and placeholder sector values.

    Returns 15 if both have valid non-placeholder sectors, same known LGA,
    and the sectors match exactly, else 0.
    """
    # Require same known Kaduna LGA first
    if not (_is_valid_known_lga(lga_a) and _is_valid_known_lga(lga_b)):
        return 0
    if str(lga_a).strip() != str(lga_b).strip():
        return 0
    # Reject placeholder/N/A sector values
    if _is_missing_lga(sector_a) or _is_missing_lga(sector_b):
        return 0
    if str(sector_a).strip() == str(sector_b).strip():
        return 15
    return 0


def same_category_score(category_a, category_b, lga_a, lga_b, sector_a, sector_b):
    """Score for same category match.

    Category bonus only applies when projects are also co-located
    (same known Kaduna LGA) AND in the same sector. Rejects N/A and
    placeholder category values.

    Returns 10 if both have valid non-placeholder categories, same known LGA,
    same sector, and the categories match exactly, else 0.
    """
    # Require same known Kaduna LGA and same sector
    if not (_is_valid_known_lga(lga_a) and _is_valid_known_lga(lga_b)):
        return 0
    if str(lga_a).strip() != str(lga_b).strip():
        return 0
    if _is_missing_lga(sector_a) or _is_missing_lga(sector_b):
        return 0
    if str(sector_a).strip() != str(sector_b).strip():
        return 0
    # Reject placeholder/N/A category values
    if _is_missing_lga(category_a) or _is_missing_lga(category_b):
        return 0
    if str(category_a).strip() == str(category_b).strip():
        return 10
    return 0


def geographic_proximity_score(lat_a, lon_a, lat_b, lon_b):
    """Score for geographic proximity.

    NOT USED in this dataset — no coordinates are available.
    Returns 0 and documents the limitation.
    """
    # Implementation.md section 11 specifies geographic proximity where
    # coordinates exist. This dataset has 0 projects with coordinates.
    # The function is present for completeness but returns 0.
    if lat_a is not None and lon_a is not None and lat_b is not None and lon_b is not None:
        # Haversine distance would go here if coordinates were available
        pass
    return 0


def contextual_link_gate(text_sim, lga_score, sector_score, cat_score, kw_score, geo_score):
    """Determine whether a pair is eligible for cluster membership.

    Text similarity alone is NOT sufficient for cluster membership.
    At least one independent contextual feature must be present.

    Contextual features that count toward the gate:
    - same known Kaduna LGA (lga_score > 0)
    - geographic proximity (geo_score > 0) — not available in this dataset

    Notes on other dimensions:
    - same_sector_score already requires same known LGA, so sector_score > 0
      implies lga_score > 0. It is not an independent gate criterion.
    - same_category_score already requires same known LGA + same sector, so
      cat_score > 0 implies lga_score > 0. It is not an independent gate
      criterion.
    - keyword_overlap_score is recorded in matching_features for transparency
      but does NOT by itself establish cluster membership (STEP 14:
      "keyword overlap may be noted as analytical context but must not by
      itself establish cluster membership").

    The special case for text_sim >= 95 requires same known Kaduna LGA
    (lga_score > 0). Near-identical text without valid geographic co-location
    is NOT sufficient. Different known LGAs or missing LGAs do NOT qualify.

    Returns True if the pair should be linked in the cluster graph.
    """
    # Special case: near-identical or identical titles (text_sim >= 95) with
    # same known Kaduna LGA. This allows very similar titles in the same LGA
    # to cluster. Different known LGAs or missing LGAs do NOT qualify.
    if text_sim >= 95 and lga_score > 0:
        return True

    # Standard rule: text similarity >= 60 AND same known Kaduna LGA
    if text_sim >= TEXT_SIMILARITY_MIN and lga_score > 0:
        return True

    # Geographic proximity would also qualify, but no coordinates exist.
    if text_sim >= TEXT_SIMILARITY_MIN and geo_score > 0:
        return True

    # Text similarity alone is NEVER sufficient for cluster membership.
    # Keyword overlap alone is NEVER sufficient for cluster membership.
    return False


# =========================================================================
# HYBRID SIMILARITY
# =========================================================================


def hybrid_similarity(project_a, project_b):
    """Compute hybrid similarity score between two projects.

    Components:
    - Text similarity (rapidfuzz ratio, full value)
    - Keyword overlap (max 25)
    - Same LGA (max 25)
    - Same sector, only with same LGA (max 15)
    - Same category, only with same LGA + same sector (max 10)
    - Geographic proximity (max 10, NOT USED - no coordinates)

    Total possible: ~100. Threshold CLUSTER_LINK_THRESHOLD determines
    when a pair is considered potentially related.
    """
    text_sim = text_similarity(
        project_a.get("normalized_title"),
        project_b.get("normalized_title"),
    )
    text_contribution = text_sim  # Full text ratio used; not capped

    kw_score = keyword_overlap_score(
        project_a.get("normalized_title"),
        project_b.get("normalized_title"),
    )

    lga_a = project_a.get("normalized_lga")
    lga_b = project_b.get("normalized_lga")
    lga_score = same_lga_score(lga_a, lga_b)

    sector_a = project_a.get("normalized_sector")
    sector_b = project_b.get("normalized_sector")
    # Sector bonus only applies with same LGA
    sector_score = same_sector_score(sector_a, sector_b, lga_a, lga_b)

    cat_a = project_a.get("normalized_category")
    cat_b = project_b.get("normalized_category")
    # Category bonus only applies with same LGA + same sector
    cat_score = same_category_score(cat_a, cat_b, lga_a, lga_b, sector_a, sector_b)

    geo_score = geographic_proximity_score(
        project_a.get("latitude"),
        project_a.get("longitude"),
        project_b.get("latitude"),
        project_b.get("longitude"),
    )

    total = text_contribution + kw_score + lga_score + sector_score + cat_score + geo_score

    # Determine which features matched (for transparency)
    matching_features = []
    if text_contribution >= TEXT_SIMILARITY_MIN:
        matching_features.append({
            "dimension": "text_similarity",
            "score": text_contribution,
            "detail": f"rapidfuzz ratio={text_sim}",
        })
    if kw_score > 0:
        matching_features.append({
            "dimension": "intervention_keywords",
            "score": kw_score,
            "detail": f"overlap keywords matched",
        })
    if lga_score > 0:
        matching_features.append({
            "dimension": "same_lga",
            "score": lga_score,
            "detail": f"LGA={project_a.get('normalized_lga')}",
        })
    if sector_score > 0:
        matching_features.append({
            "dimension": "same_sector",
            "score": sector_score,
            "detail": f"sector={project_a.get('normalized_sector')}",
        })
    if cat_score > 0:
        matching_features.append({
            "dimension": "same_category",
            "score": cat_score,
            "detail": f"category={project_a.get('normalized_category')}",
        })
    if geo_score > 0:
        matching_features.append({
            "dimension": "geographic_proximity",
            "score": geo_score,
            "detail": "coordinates available",
        })

    return total, matching_features


# =========================================================================
# CLUSTERING
# =========================================================================


class UnionFind:
    """Disjoint-set union-find for building connected components."""

    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n

    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]
            x = self.parent[x]
        return x

    def union(self, x, y):
        rx, ry = self.find(x), self.find(y)
        if rx == ry:
            return
        if self.rank[rx] < self.rank[ry]:
            rx, ry = ry, rx
        self.parent[ry] = rx
        if self.rank[rx] == self.rank[ry]:
            self.rank[rx] += 1


def build_clusters(projects, threshold):
    """Build analytical clusters using union-find on similarity pairs.

    Two-stage process:
    1. Compute full similarity scores for all pairs.
    2. Apply contextual link gate: text similarity alone is NOT sufficient
       for cluster membership. At least one independent contextual feature
       must be present (same known Kaduna LGA, same sector, same category,
       meaningful keyword overlap, or geographic proximity).

    Returns:
    - uf: UnionFind instance (only cluster-eligible links)
    - candidate_pairs: list of (idx_a, idx_b, score, features, is_cluster_link)
             for all pairs that met the score threshold.
             is_cluster_link=True means the pair passed the contextual gate
             and was used for clustering.
    """
    n = len(projects)
    uf = UnionFind(n)
    candidate_pairs = []

    # O(n^2) pairwise evaluation — acceptable for 610 projects (185,745 pairs)
    for i in range(n):
        for j in range(i + 1, n):
            score, features = hybrid_similarity(projects[i], projects[j])
            if score >= threshold:
                # Determine if this pair passes the contextual link gate
                text_sim = features[0]["score"] if features and features[0]["dimension"] == "text_similarity" else 0
                lga_score = next((f["score"] for f in features if f["dimension"] == "same_lga"), 0)
                sector_score = next((f["score"] for f in features if f["dimension"] == "same_sector"), 0)
                cat_score = next((f["score"] for f in features if f["dimension"] == "same_category"), 0)
                kw_score = next((f["score"] for f in features if f["dimension"] == "intervention_keywords"), 0)
                geo_score = next((f["score"] for f in features if f["dimension"] == "geographic_proximity"), 0)

                is_link = contextual_link_gate(text_sim, lga_score, sector_score, cat_score, kw_score, geo_score)
                candidate_pairs.append((i, j, score, features, is_link))
                if is_link:
                    uf.union(i, j)

    return uf, candidate_pairs


def extract_clusters(projects, uf, pairs):
    """Extract cluster groups from union-find structure.

    Returns:
    - clusters: dict cluster_id -> list of project dicts
    - cluster_pairs: dict cluster_id -> list of relationship records
    - singleton_ids: set of project indices that are singletons
    """
    # Group indices by root
    root_to_indices = defaultdict(list)
    for i in range(len(projects)):
        root_to_indices[uf.find(i)].append(i)

    # Assign cluster IDs (cluster_id 1 = first multi-project cluster)
    clusters = {}
    cluster_pairs = {}
    singleton_indices = set()
    cluster_id = 0

    for root, indices in sorted(root_to_indices.items(), key=lambda x: -len(x[1])):
        if len(indices) == 1:
            singleton_indices.add(indices[0])
            continue

        cluster_id += 1
        cluster_projects = [projects[i] for i in indices]
        clusters[cluster_id] = cluster_projects

        # Collect pairs within this cluster (only cluster links)
        member_set = set(indices)
        cpairs = []
        for i, j, score, features, is_link in pairs:
            if is_link and i in member_set and j in member_set:
                cpairs.append({
                    "project_id_a": projects[i]["project_id"],
                    "project_id_b": projects[j]["project_id"],
                    "similarity_score": score,
                    "matching_features": features,
                    "is_cluster_link": True,
                })
        cluster_pairs[cluster_id] = cpairs

    return clusters, cluster_pairs, singleton_indices


# =========================================================================
# PROJECT HISTORY
# =========================================================================


def build_project_history(clusters):
    """Build chronological history for each cluster.

    For each cluster, sort member projects by date_of_advert (or date_of_award
    if advert missing, or just project_id as fallback) and produce a timeline.

    Returns dict: cluster_id -> list of timeline entries.
    """
    histories = {}

    for cid, projects in clusters.items():
        entries = []
        for p in projects:
            # Determine sort date: prefer advert, then award, then fallback
            sort_date = p.get("normalized_date_of_advert")
            if not sort_date:
                sort_date = p.get("normalized_date_of_award")
            if not sort_date:
                # Fallback: use project_id as integer for stable ordering
                sort_date = f"id_{p['project_id']}"

            entries.append({
                "project_id": p["project_id"],
                "title": p.get("normalized_title"),
                "date_of_advert": p.get("normalized_date_of_advert"),
                "date_of_award": p.get("normalized_date_of_award"),
                "contract_amount": p.get("normalized_contract_amount"),
                "budget_amount": p.get("normalized_budget_amount"),
                "lga": p.get("normalized_lga"),
                "sector": p.get("normalized_sector"),
                "contractors": [c["contractor"] for c in p.get("contractors", [])],
                "sort_date": sort_date,
            })

        # Sort by sort_date (strings sort chronologically for ISO dates,
        # and id_XXX falls after all dates)
        entries.sort(key=lambda e: e["sort_date"])

        histories[cid] = entries

    return histories


# =========================================================================
# CUMULATIVE VALUES
# =========================================================================


def build_cumulative_values(clusters):
    """Calculate cumulative recorded contract value for each cluster.

    Uses only known contract amounts. Projects with None or N/A are excluded.
    Returns dict: cluster_id -> cumulative value and contributor list.
    """
    cum_values = {}

    for cid, projects in clusters.items():
        contributors = []
        total = 0.0

        for p in projects:
            amount = p.get("normalized_contract_amount")
            if amount is not None and amount != 0:
                contributors.append({
                    "project_id": p["project_id"],
                    "contract_amount": amount,
                })
                total += amount

        cum_values[cid] = {
            "cumulative_recorded_contract_value": total if contributors else None,
            "contributor_count": len(contributors),
            "contributors": contributors,
        }

    return cum_values


# =========================================================================
# DEMO-CASE DISCOVERY
# =========================================================================


def discover_demo_cases(clusters, histories, cum_values):
    """Discover demo-case candidates from actual clusters.

    Prioritization criteria from implementation.md section 41:
    1. Multiple related interventions
    2. Meaningful time span
    3. Known recorded values
    4. Geographic coherence
    5. Lifecycle information
    6. Contractor recurrence
    7. Evidence quality
    8. Usefulness for demonstrating the thesis

    Returns list of candidates with scores and evidence.
    """
    candidates = []

    for cid, projects in clusters.items():
        if len(projects) < 2:
            continue

        history = histories.get(cid, [])
        cv = cum_values.get(cid, {})

        # Criterion 1: Multiple related interventions (different dates)
        dates = set()
        for e in history:
            if e["date_of_advert"]:
                dates.add(e["date_of_advert"])
            if e["date_of_award"]:
                dates.add(e["date_of_award"])
        num_interventions = len(dates)

        # Criterion 2: Meaningful time span
        ad_dates = [e["date_of_advert"] for e in history if e["date_of_advert"]]
        aw_dates = [e["date_of_award"] for e in history if e["date_of_award"]]
        all_dates_list = sorted(ad_dates + aw_dates) if (ad_dates or aw_dates) else []

        time_span = None
        if len(all_dates_list) >= 2:
            try:
                d1 = datetime.strptime(all_dates_list[0], "%Y-%m-%d")
                d2 = datetime.strptime(all_dates_list[-1], "%Y-%m-%d")
                time_span = (d2 - d1).days
            except (ValueError, TypeError):
                time_span = None

        # Criterion 3: Known recorded values
        has_values = cv.get("cumulative_recorded_contract_value") is not None
        value_amount = cv.get("cumulative_recorded_contract_value") or 0

        # Criterion 4: Geographic coherence — not evaluable (no coordinates)
        geographic_coherence = "not_evaluable_no_coordinates"

        # Criterion 5: Lifecycle information — count distinct procurement methods
        methods = set(e.get("title", "") for e in history)  # proxy via title variety
        lifecycle_signals = len(set(p.get("normalized_procurement_method") for p in projects if p.get("normalized_procurement_method")))

        # Criterion 6: Contractor recurrence
        all_contractors = set()
        for p in projects:
            for c in p.get("contractors", []):
                all_contractors.add(c.get("contractor"))
        contractor_overlap = contractor_recurrence_score(projects)

        # Criterion 7: Evidence quality — how many projects have dates + values
        projects_with_dates = sum(1 for e in history if e["date_of_advert"] or e["date_of_award"])
        projects_with_values = sum(1 for p in projects if p.get("normalized_contract_amount") is not None)
        evidence_quality = (projects_with_dates + projects_with_values) / len(projects)

        # Criterion 8: Usefulness — cluster size + intervention diversity
        usefulness = len(projects) * (1 + num_interventions / 10)

        # Composite score (deterministic, transparent)
        score = (
            num_interventions * 20 +
            (time_span or 0) / 365 * 15 +
            (1 if has_values else 0) * 15 +
            lifecycle_signals * 5 +
            contractor_overlap * 10 +
            evidence_quality * 10 +
            usefulness
        )

        candidates.append({
            "cluster_id": cid,
            "project_count": len(projects),
            "project_ids": [p["project_id"] for p in projects],
            "num_interventions": num_interventions,
            "time_span_days": time_span,
            "has_recorded_values": has_values,
            "cumulative_recorded_contract_value": value_amount,
            "geographic_coherence": geographic_coherence,
            "lifecycle_signals": lifecycle_signals,
            "contractor_overlap_score": contractor_overlap,
            "evidence_quality": round(evidence_quality, 3),
            "composite_score": round(score, 2),
            "selection_evidence": {
                "criteria_evaluation": {
                    "multiple_interventions": num_interventions,
                    "meaningful_time_span": time_span,
                    "known_recorded_values": has_values,
                    "geographic_coherence": geographic_coherence,
                    "lifecycle_information": lifecycle_signals,
                    "contractor_recurrence": contractor_overlap,
                    "evidence_quality": round(evidence_quality, 3),
                }
            },
        })

    # Sort by composite score descending
    candidates.sort(key=lambda c: -c["composite_score"])
    return candidates


def contractor_recurrence_score(projects):
    """Count how many contractors appear in multiple projects within a cluster.

    This is an analytical count, NOT a Phase 6 CONTRACTOR_RECURRENCE signal.
    Returns the number of contractors that appear in >1 project.
    """
    contractor_projects = defaultdict(set)
    for p in projects:
        pid = p["project_id"]
        for c in p.get("contractors", []):
            contractor_projects[c.get("contractor")].add(pid)

    recurring = sum(1 for pids in contractor_projects.values() if len(pids) > 1)
    return recurring


# =========================================================================
# MAIN
# =========================================================================


def load_input(path):
    """Load and validate Phase 4 input."""
    if not path.exists():
        raise FileNotFoundError(f"Phase 4 input not found: {path}")

    with open(path) as f:
        data = json.load(f)

    projects = data.get("projects", [])
    if len(projects) != 610:
        raise ValueError(f"Expected 610 projects, got {len(projects)}")

    # Verify all 610 unique IDs
    ids = set(p["project_id"] for p in projects)
    if len(ids) != 610:
        raise ValueError(f"Expected 610 unique IDs, got {len(ids)}")

    return data


def run_phase5():
    """Run the complete Phase 5 pattern discovery pipeline."""
    print("=" * 70)
    print("ORDACITI PHASE 5: Pattern Discovery and Project Clustering")
    print("=" * 70)
    print()
    print(f"Input:  {INPUT_FILE}")
    print(f"Output: {OUTPUT_FILE}")
    print()

    # Load and validate input
    data = load_input(INPUT_FILE)
    projects = data["projects"]
    print(f"Loaded {len(projects)} projects from Phase 4 normalized dataset")
    print()

    # Build similarity pairs and clusters
    print("Building similarity relationships...")
    uf, pairs = build_clusters(projects, CLUSTER_LINK_THRESHOLD)
    print(f"  Similarity pairs above threshold: {len(pairs)}")
    print()

    # Extract clusters
    print("Extracting clusters...")
    clusters, cluster_pairs, singleton_indices = extract_clusters(projects, uf, pairs)
    num_clusters = len(clusters)
    num_singletons = len(singleton_indices)
    print(f"  Analytical clusters: {num_clusters}")
    print(f"  Singleton projects: {num_singletons}")
    print()

    # Cluster size distribution
    sizes = [len(v) for v in clusters.values()]
    if sizes:
        print(f"  Cluster size distribution:")
        size_counts = Counter(sizes)
        for size, cnt in sorted(size_counts.items()):
            print(f"    size {size}: {cnt} clusters")
        print(f"    largest cluster: {max(sizes)} projects")
    print()

    # Build project history
    print("Building project history timelines...")
    histories = build_project_history(clusters)
    print(f"  Histories built for {len(histories)} clusters")
    print()

    # Build cumulative values
    print("Calculating cumulative recorded contract values...")
    cum_values = build_cumulative_values(clusters)
    clusters_with_values = sum(1 for v in cum_values.values() if v["cumulative_recorded_contract_value"] is not None)
    print(f"  Clusters with recorded values: {clusters_with_values}")
    print()

    # Discover demo cases
    print("Discovering demo-case candidates...")
    demo_candidates = discover_demo_cases(clusters, histories, cum_values)
    print(f"  Candidates found: {len(demo_candidates)}")
    if demo_candidates:
        top = demo_candidates[0]
        print(f"  Top candidate: cluster {top['cluster_id']} "
              f"({top['project_count']} projects, score {top['composite_score']})")
    print()

    # Build output
    print("Building output...")

    # Similarity relationships (all pairs above threshold, across clusters)
    # These include both cluster links and candidate relationships that did not
    # pass the contextual gate. Each record carries the pair's score and features.
    similarity_relationships = []
    for i, j, score, features, is_link in pairs:
        similarity_relationships.append({
            "project_id_a": projects[i]["project_id"],
            "project_id_b": projects[j]["project_id"],
            "similarity_score": score,
            "matching_features": features,
            "is_cluster_link": is_link,
        })

    # Sort for deterministic output
    similarity_relationships.sort(key=lambda r: (-r["similarity_score"], r["project_id_a"], r["project_id_b"]))

    # Build cluster records with full metadata
    cluster_records = []
    for cid in sorted(clusters.keys()):
        projects_in_cluster = clusters[cid]
        history = histories.get(cid, [])
        cv = cum_values.get(cid, {})
        pairs_in_cluster = cluster_pairs.get(cid, [])

        cluster_records.append({
            "cluster_id": cid,
            "project_count": len(projects_in_cluster),
            "project_ids": [p["project_id"] for p in projects_in_cluster],
            "similarity_relationships": pairs_in_cluster,
            "history": history,
            "cumulative_recorded_contract_value": cv.get("cumulative_recorded_contract_value"),
            "cumulative_contributor_count": cv.get("contributor_count", 0),
            "cumulative_contributors": cv.get("contributors", []),
        })

    # Singleton records
    singleton_records = []
    for idx in sorted(singleton_indices):
        p = projects[idx]
        singleton_records.append({
            "project_id": p["project_id"],
            "title": p.get("normalized_title"),
            "lga": p.get("normalized_lga"),
            "sector": p.get("normalized_sector"),
        })

    # Build the complete output
    output = {
        "manifest": {
            "input_file": str(INPUT_FILE),
            "output_file": str(OUTPUT_FILE),
            "input_projects": len(projects),
            "input_project_ids": sorted([int(p["project_id"]) for p in projects]),
            "similarity_threshold": CLUSTER_LINK_THRESHOLD,
            "text_similarity_min": TEXT_SIMILARITY_MIN,
            "clustering_method": "deterministic_union_find_hybrid_similarity",
            "similarity_method": "rapidfuzz_ratio + keyword_overlap + same_lga + same_sector + same_category + geographic_proximity",
            "semantic_similarity": "not_implemented_no_embedding_model_specified_in_spec",
            "geographic_proximity": "not_evaluable_no_coordinates_in_dataset",
            "intervention_keywords": INTERVENTION_KEYWORDS,
        },
        "similarity_relationships": similarity_relationships,
        "clusters": cluster_records,
        "singletons": singleton_records,
        "project_history": histories,
        "cumulative_values": cum_values,
        "demo_case_candidates": demo_candidates,
        "qa_summary": {
            "total_projects": len(projects),
            "projects_in_relationships": len(set(
                r["project_id_a"] for r in similarity_relationships
            ) | set(
                r["project_id_b"] for r in similarity_relationships
            )),
            "singleton_projects": num_singletons,
            "non_singleton_projects": len(projects) - num_singletons,
            "number_of_clusters": num_clusters,
            "cluster_size_distribution": dict(Counter(sizes)),
            "largest_cluster_size": max(sizes) if sizes else 0,
            "number_of_similarity_relationships": len(similarity_relationships),
            "projects_with_dates": sum(1 for p in projects if p.get("normalized_date_of_advert") or p.get("normalized_date_of_award")),
            "projects_with_coordinates": sum(1 for p in projects if p.get("latitude") is not None),
            "projects_with_monetary_values": sum(1 for p in projects if p.get("normalized_contract_amount") is not None),
            "demo_case_candidates_count": len(demo_candidates),
        },
    }

    # Write output
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(output, f, indent=2)

    print(f"Output written to {OUTPUT_FILE}")
    print()
    print("=" * 70)
    print("PHASE 5 COMPLETE")
    print("=" * 70)

    return output


if __name__ == "__main__":
    output = run_phase5()

    # Print QA summary
    print()
    print("=" * 70)
    print("QA SUMMARY")
    print("=" * 70)
    qa = output["qa_summary"]
    print(f"  Total projects:                  {qa['total_projects']}")
    print(f"  Projects in relationships:       {qa['projects_in_relationships']}")
    print(f"  Singleton projects:              {qa['singleton_projects']}")
    print(f"  Non-singleton projects:          {qa['non_singleton_projects']}")
    print(f"  Number of clusters:              {qa['number_of_clusters']}")
    print(f"  Largest cluster size:            {qa['largest_cluster_size']}")
    print(f"  Similarity relationships:        {qa['number_of_similarity_relationships']}")
    print(f"  Projects with dates:             {qa['projects_with_dates']}")
    print(f"  Projects with coordinates:       {qa['projects_with_coordinates']}")
    print(f"  Projects with monetary values:   {qa['projects_with_monetary_values']}")
    print(f"  Demo case candidates:            {qa['demo_case_candidates_count']}")
    print()

    # Print top demo candidate
    if output["demo_case_candidates"]:
        top = output["demo_case_candidates"][0]
        print("TOP DEMO CASE CANDIDATE:")
        print(f"  Cluster ID: {top['cluster_id']}")
        print(f"  Project count: {top['project_count']}")
        print(f"  Project IDs: {top['project_ids']}")
        print(f"  Num interventions (distinct dates): {top['num_interventions']}")
        print(f"  Time span (days): {top['time_span_days']}")
        print(f"  Has recorded values: {top['has_recorded_values']}")
        print(f"  Cumulative contract value: {top['cumulative_recorded_contract_value']}")
        print(f"  Geographic coherence: {top['geographic_coherence']}")
        print(f"  Contractor overlap: {top['contractor_overlap_score']}")
        print(f"  Evidence quality: {top['evidence_quality']}")
        print(f"  Composite score: {top['composite_score']}")
