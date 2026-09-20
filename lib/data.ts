// Data loading utilities for Ordaciti frontend
// Loads processed JSON data from the repository

import evidenceData from '@/data/processed/evidence.json'
import normalizedData from '@/data/processed/normalized_projects.json'
import patternsData from '@/data/processed/patterns.json'
import signalsData from '@/data/processed/signals.json'

export const evidence = evidenceData.evidence
export const evidenceManifest = evidenceData.manifest
export const normalized = normalizedData.projects
export const patterns = patternsData
export const signals = signalsData.signals

export function getEvidenceById(id: string | number) {
  const pid = String(id)
  return evidence.find(e => e.project_id === pid) ?? null
}

export function getNormalizedById(id: string | number) {
  const pid = String(id)
  return normalized.find(p => String(p.project_id) === pid) ?? null
}

export function getClusterForProject(pid: string) {
  for (const c of patterns.clusters) {
    if (c.project_ids.includes(pid)) return c
  }
  return null
}

export function getSignalsForProject(pid: string) {
  const project = evidence.find(e => String(e.project_id) === pid)
  if (!project) return []

  return project.signals.map(s => ({
    type: s.type,
    data: s as Record<string, string | number | string[] | number[] | boolean | null | undefined>
  }))
}

export function getAllocationContext(lga: string) {
  return signals.find(s => s.signal_type === 'ALLOCATION_CONTEXT' && String(s.lga) === lga) ?? null
}

// Explorer helpers
export interface ProjectListItem {
  project_id: string
  title: string
  lga: string | null
  sector: string | null
  mda: string | null
  contract_amount: number | null
  budget_amount: number | null
  date_of_advert: string | null
  date_of_award: string | null
  signal_count: number
  contractor_count: number
  source_url: string | null
  has_signals: boolean
}

export function buildProjectList(): ProjectListItem[] {
  const normalizedMap = new Map<string, typeof normalized[0]>()
  for (const p of normalized) {
    normalizedMap.set(String(p.project_id), p)
  }

  return evidence.map(e => {
    const np = normalizedMap.get(e.project_id)
    const titleFact = e.facts.find(f => f.text.startsWith('Project title:'))
    return {
      project_id: e.project_id,
      title: titleFact ? titleFact.text.slice('Project title: '.length) : (np?.title ?? 'Untitled'),
      lga: np?.normalized_lga ?? null,
      sector: np?.normalized_sector ?? null,
      mda: np?.normalized_mda ?? null,
      contract_amount: np?.normalized_contract_amount ?? null,
      budget_amount: np?.normalized_budget_amount ?? null,
      date_of_advert: np?.normalized_date_of_advert ?? null,
      date_of_award: np?.normalized_date_of_award ?? null,
      signal_count: e.signals.length,
      contractor_count: np?.contractor_count ?? 0,
      source_url: np?.source_url ?? null,
      has_signals: e.signals.length > 0,
    }
  })
}

export type SortField = 'id' | 'title' | 'lga' | 'sector' | 'contract_value' | 'date_advert'
export type FilterValues = {
  query: string
  lga: string
  sector: string
  mda: string
  hasSignals: boolean | null
  sortBy: SortField
  sortDir: 'asc' | 'desc'
}

export function filterAndSort(projects: ProjectListItem[], filters: FilterValues): ProjectListItem[] {
  let result = [...projects]

  if (filters.query.trim()) {
    const q = filters.query.toLowerCase()
    result = result.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.project_id.toLowerCase().includes(q) ||
      p.lga?.toLowerCase().includes(q) ||
      p.sector?.toLowerCase().includes(q) ||
      p.mda?.toLowerCase().includes(q)
    )
  }

  if (filters.lga && filters.lga !== 'all') {
    result = result.filter(p => p.lga === filters.lga)
  }
  if (filters.sector && filters.sector !== 'all') {
    result = result.filter(p => p.sector === filters.sector)
  }
  if (filters.mda && filters.mda !== 'all') {
    result = result.filter(p => p.mda === filters.mda)
  }
  if (filters.hasSignals === true) {
    result = result.filter(p => p.has_signals)
  } else if (filters.hasSignals === false) {
    result = result.filter(p => !p.has_signals)
  }

  const dir = filters.sortDir === 'asc' ? 1 : -1
  result.sort((a, b) => {
    let cmp = 0
    switch (filters.sortBy) {
      case 'id':
        cmp = parseInt(a.project_id) - parseInt(b.project_id)
        break
      case 'title':
        cmp = a.title.localeCompare(b.title)
        break
      case 'lga':
        cmp = (a.lga ?? '').localeCompare(b.lga ?? '')
        break
      case 'sector':
        cmp = (a.sector ?? '').localeCompare(b.sector ?? '')
        break
      case 'contract_value':
        cmp = (a.contract_amount ?? 0) - (b.contract_amount ?? 0)
        break
      case 'date_advert':
        cmp = (a.date_of_advert ?? '').localeCompare(b.date_of_advert ?? '')
        break
    }
    return cmp * dir
  })

  return result
}

export function getFilterOptions(projects: ProjectListItem[]) {
  const lgas = new Set<string>()
  const sectors = new Set<string>()
  const mdas = new Set<string>()
  for (const p of projects) {
    if (p.lga) lgas.add(p.lga)
    if (p.sector) sectors.add(p.sector)
    if (p.mda) mdas.add(p.mda)
  }
  return {
    lgas: [...lgas].sort(),
    sectors: [...sectors].sort(),
    mdas: [...mdas].sort(),
  }
}
