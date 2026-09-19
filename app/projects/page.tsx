'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Filter, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { buildProjectList, filterAndSort, getFilterOptions, type FilterValues } from '@/lib/data'
import { Card } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { SectionHeader } from '@/components/SectionHeader'
import { Breadcrumb } from '@/components/Breadcrumb'
import { SortButton } from '@/components/SortButton'

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
      <header className="sticky top-0 z-10 border-b border-border/60 bg-white/90 backdrop-blur supports-backdrop-blur:bg-white/80">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <Breadcrumb href="/" label="Back to home" />
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
              <Link href="/projects" className="font-medium text-foreground">Explorer</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Project Explorer</h1>
          <p className="mt-1 text-muted-foreground">
            Browse {allProjects.length.toLocaleString()} government projects with evidence analysis
          </p>
        </div>

        {/* Search and filters */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search by project ID, title, LGA, sector, or MDA..."
              className="w-full rounded-lg border border-border bg-white pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/50 transition-colors shadow-sm"
              value={filters.query}
              onChange={e => update('query', e.target.value)}
            />
          </div>

          {/* Filter options */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">LGA</label>
              <div className="relative">
                <Filter className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <select
                  className="w-full rounded-lg border border-border bg-white pl-8 pr-8 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/50 transition-colors appearance-none cursor-pointer shadow-sm"
                  value={filters.lga}
                  onChange={e => update('lga', e.target.value)}
                >
                  <option value="all">All LGAs</option>
                  {options.lgas.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2">
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">Sector</label>
              <div className="relative">
                <Filter className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <select
                  className="w-full rounded-lg border border-border bg-white pl-8 pr-8 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/50 transition-colors appearance-none cursor-pointer shadow-sm"
                  value={filters.sector}
                  onChange={e => update('sector', e.target.value)}
                >
                  <option value="all">All sectors</option>
                  {options.sectors.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2">
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">MDA</label>
              <div className="relative">
                <Filter className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <select
                  className="w-full rounded-lg border border-border bg-white pl-8 pr-8 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/50 transition-colors appearance-none cursor-pointer shadow-sm"
                  value={filters.mda}
                  onChange={e => update('mda', e.target.value)}
                >
                  <option value="all">All MDAs</option>
                  {options.mdas.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2">
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">Has signals</label>
              <div className="relative">
                <Filter className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <select
                  className="w-full rounded-lg border border-border bg-white pl-8 pr-8 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/50 transition-colors appearance-none cursor-pointer shadow-sm"
                  value={filters.hasSignals === null ? 'all' : filters.hasSignals ? 'yes' : 'no'}
                  onChange={e => update('hasSignals', e.target.value === 'yes' ? true : e.target.value === 'no' ? false : null)}
                >
                  <option value="all">All projects</option>
                  <option value="yes">With signals only</option>
                  <option value="no">Without signals</option>
                </select
                >
                <div className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2">
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>

          {/* Sort controls */}
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Sort:</span>
              <select
                className="rounded-md border-0 bg-transparent px-3 py-1 text-sm focus:outline-none focus:ring-0"
                value={filters.sortBy}
                onChange={e => update('sortBy', e.target.value)}
              >
                <option value="id">Project ID</option>
                <option value="title">Title</option>
                <option value="lga">LGA</option>
                <option value="sector">Sector</option>
                <option value="contract_value">Contract value</option>
                <option value="date_advert">Date of advert</option>
              </select>
            </div>
            <SortButton
              label={filters.sortDir === 'asc' ? 'Ascending' : 'Descending'}
              active
              direction={filters.sortDir}
              onClick={() => update('sortDir', filters.sortDir === 'asc' ? 'desc' : 'asc')}
            />
            {hasActiveFilters && (
              <button
                type="button"
                className="ml-auto flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                onClick={clearFilters}
              >
                <X className="h-3.5 w-3.5" />
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filtered.length.toLocaleString()}</span> of {allProjects.length.toLocaleString()} projects
          </p>
        </div>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">No projects match</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
            <button
              type="button"
              className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              onClick={clearFilters}
            >
              Clear all filters
            </button>
          </Card>
        ) : (
          /* Project list */
          <div className="space-y-2.5">
            {filtered.map(project => (
              <Link
                key={project.project_id}
                href={`/projects/${project.project_id}`}
                className="group block rounded-lg border border-border bg-card p-4 transition-card hover:shadow-card-hover hover:border-primary/40 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <Badge variant="muted">#{project.project_id}</Badge>
                      {project.has_signals && (
                        <Badge variant="primary">
                          {project.signal_count} signal{project.signal_count !== 1 ? 's' : ''}
                        </Badge>
                      )}
                      {project.contractor_count > 0 && (
                        <Badge variant="outline">
                          {project.contractor_count} contractor{project.contractor_count !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                      {project.title}
                    </h3>
                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {project.lga && <span>LGA: {project.lga}</span>}
                      {project.sector && <span>Sector: {project.sector}</span>}
                      {project.mda && <span>MDA: {project.mda}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {project.contract_amount != null ? (
                      <span className="text-sm font-semibold text-foreground">
                        ₦{project.contract_amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground/70">No contract value</span>
                    )}
                    <span className="text-xs text-muted-foreground/60">
                      {project.date_of_advert ?? 'No advert date'}
                    </span>
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
