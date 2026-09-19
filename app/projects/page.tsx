'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { buildProjectList, filterAndSort, getFilterOptions, type FilterValues, type ProjectListItem } from '@/lib/data'

export default function ProjectsPage() {
  const allProjects = buildProjectList()
  const options = getFilterOptions(allProjects)

  const [filters, setFilters] = useState<FilterValues>({
    query: '',
    lga: 'all',
    sector: 'all',
    mda: 'all',
    hasSignals: null,
    sortBy: 'id',
    sortDir: 'asc',
  })

  const filtered = useMemo(() => filterAndSort(allProjects, filters), [allProjects, filters])

  const update = (key: keyof FilterValues, value: string | boolean | null) => {
    setFilters(f => ({ ...f, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      query: '', lga: 'all', sector: 'all', mda: 'all',
      hasSignals: null, sortBy: 'id', sortDir: 'asc',
    })
  }

  const hasActiveFilters = filters.query || filters.lga !== 'all' || filters.sector !== 'all' ||
    filters.mda !== 'all' || filters.hasSignals !== null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to home
            </Link>
            <nav className="flex gap-6 text-sm">
              <Link href="/" className="text-muted-foreground hover:text-foreground">Home</Link>
              <Link href="/projects" className="font-medium text-foreground">Explorer</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Project Explorer</h1>
          <p className="mt-1 text-muted-foreground">
            {filtered.length.toLocaleString()} of {allProjects.length.toLocaleString()} projects
          </p>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="search"
            placeholder="Search by project ID, title, LGA, sector, or MDA..."
            className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
            value={filters.query}
            onChange={e => update('query', e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">LGA</label>
            <select className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring" value={filters.lga} onChange={e => update('lga', e.target.value)}>
              <option value="all">All LGAs</option>
              {options.lgas.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Sector</label>
            <select className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring" value={filters.sector} onChange={e => update('sector', e.target.value)}>
              <option value="all">All sectors</option>
              {options.sectors.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">MDA</label>
            <select className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring" value={filters.mda} onChange={e => update('mda', e.target.value)}>
              <option value="all">All MDAs</option>
              {options.mdas.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Has signals</label>
            <select className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring" value={filters.hasSignals === null ? 'all' : filters.hasSignals ? 'yes' : 'no'} onChange={e => update('hasSignals', e.target.value === 'yes' ? true : e.target.value === 'no' ? false : null)}>
              <option value="all">All projects</option>
              <option value="yes">With signals only</option>
              <option value="no">Without signals</option>
            </select
            >
          </div>
        </div>

        {/* Sort and clear */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <select className="rounded-md border bg-background px-3 py-1 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring" value={filters.sortBy} onChange={e => update('sortBy', e.target.value)}>
              <option value="id">Project ID</option>
              <option value="title">Title</option>
              <option value="lga">LGA</option>
              <option value="sector">Sector</option>
              <option value="contract_value">Contract value</option>
              <option value="date_advert">Date of advert</option>
            </select
            >
            <button className="rounded-md border bg-background px-2 py-1 text-sm hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring" onClick={() => update('sortDir', filters.sortDir === 'asc' ? 'desc' : 'asc')}>
              {filters.sortDir === 'asc' ? '↑ Ascending' : '↓ Descending'}
            </button>
          </div>
          {hasActiveFilters && (
            <button className="rounded-md text-sm text-muted-foreground hover:text-foreground focus:outline-none focus:ring-1 focus:ring-ring" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center">
            <p className="text-muted-foreground">No projects match the current filters.</p>
            <button className="mt-2 text-sm text-primary hover:underline" onClick={clearFilters}>Clear all filters</button>
          </div>
        ) : (
          /* Project list */
          <div className="space-y-2">
            {filtered.map(project => (
              <Link
                key={project.project_id}
                href={`/projects/${project.project_id}`}
                className="rounded-lg border bg-card p-4 hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono font-medium">#{project.project_id}</span>
                      {project.has_signals && (
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                          {project.signal_count} signal{project.signal_count !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1 text-sm font-medium truncate">{project.title}</h3>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {project.lga && <span>LGA: {project.lga}</span>}
                      {project.sector && <span>Sector: {project.sector}</span>}
                      {project.mda && <span>MDA: {project.mda}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    {project.contract_amount != null ? (
                      <div className="text-sm font-medium">₦{project.contract_amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    ) : (
                      <div className="text-sm text-muted-foreground">No contract value</div>
                    )}
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {project.date_of_advert ?? 'No advert date'}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
