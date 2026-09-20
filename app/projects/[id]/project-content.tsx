'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Building2, MapPin, FileText, AlertTriangle, HelpCircle, Layers } from 'lucide-react'
import { getEvidenceById, getNormalizedById, getClusterForProject, getSignalsForProject, getAllocationContext } from '@/lib/data'
import { Card, CardContent } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { SectionHeader } from '@/components/SectionHeader'
import { Breadcrumb } from '@/components/Breadcrumb'
import { StatusBadge } from '@/components/StatusBadge'
import { SignalCard } from '@/components/SignalCard'
import AIEvidenceBrief from '@/components/AIEvidenceBrief'

export default function ProjectContent() {
  const params = useParams()
  const id = params.id as string

  const project = getEvidenceById(id)
  const normalized = getNormalizedById(id)
  const cluster = getClusterForProject(id)
  const signals = getSignalsForProject(id)
  const allocation = getAllocationContext(normalized?.normalized_lga ?? '')

  if (!project) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Card className="p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <HelpCircle className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-foreground">Project not found</h2>
          <p className="mt-1 text-muted-foreground">
            No evidence exists for project ID &ldquo;{id}&rdquo;.
          </p>
          <Link
            href="/projects"
            className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to explorer
          </Link>
        </Card>
      </div>
    )
  }

  const titleFact = project.facts.find((f: { text: string }) =>
    f.text.startsWith('Project title:')
  )
  const title = titleFact
    ? titleFact.text.slice('Project title: '.length)
    : 'Untitled'

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/60 bg-white/90 backdrop-blur supports-backdrop-blur:bg-white/80">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <Breadcrumb href="/projects" label="Back to explorer" />
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/projects" className="font-medium text-foreground">
                Explorer
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Project Identity */}
        <Card className="mb-6" elevated>
          <div className="flex flex-col gap-4 p-1">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg font-mono shadow-sm">
                {id}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-semibold tracking-tight text-foreground truncate">
                  {title}
                </h1>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {normalized?.normalized_lga && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {normalized.normalized_lga}
                    </span>
                  )}
                  {normalized?.normalized_sector && (
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" />
                      {normalized.normalized_sector}
                    </span>
                  )}
                  {normalized?.normalized_mda && <span>{normalized.normalized_mda}</span>}
                </div>
              </div>
            </div>

            {/* Source link */}
            {normalized?.source_url && (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2.5">
                <a
                  href={normalized.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 px-2 py-1 rounded transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View source
                </a>
                <span className="text-xs text-muted-foreground/70 truncate flex-1">
                  {normalized.source_url}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Recorded facts */}
        <SectionHeader
          title="Recorded facts"
          description="Information extracted from source data"
        />
        <Card className="mb-6">
          <CardContent>
            <ul className="space-y-2">
              {project.facts.map((fact: { text: string }, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-foreground/90">{fact.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Intelligence signals */}
        {signals.length > 0 && (
          <>
            <SectionHeader
              title="Intelligence signals"
              description={
                `${signals.length} signal${signals.length !== 1 ? 's' : ''} detected from evidence patterns`
              }
            />
            <div className="space-y-3 mb-6">
              {signals.map((signal, idx) => {
                const d = signal.data
                switch (signal.type) {
                  case 'REPEAT_INTERVENTION': {
                    const related = (d.project_ids as string[])?.filter(
                      (p: string) => p !== id
                    ) ?? []
                    const intervals = d.intervals_days as number[] ?? []
                    return (
                      <SignalCard key={idx} type={signal.type} title="Repeat intervention pattern">
                        <div className="mb-3 flex items-center gap-2">
                          <Badge variant="warning">Cluster {d.cluster_id}</Badge>
                          <Badge variant="muted">
                            {d.project_count} related project{d.project_count !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          {d.first_project_date && (
                            <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                              <span className="text-muted-foreground">First recorded</span>
                              <span className="text-foreground font-medium">
                                {d.first_project_date}
                              </span>
                            </div>
                          )}
                          {d.latest_project_date && (
                            <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                              <span className="text-muted-foreground">Latest recorded</span>
                              <span className="text-foreground font-medium">
                                {d.latest_project_date}
                              </span>
                            </div>
                          )}
                          {intervals.length > 0 && (
                            <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                              <span className="text-muted-foreground">Intervals</span>
                              <span className="text-foreground font-medium">
                                {intervals.join(', ')} days
                              </span>
                            </div>
                          )}
                          {d.cumulative_recorded_contract_value != null && (
                            <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                              <span className="text-muted-foreground">Cumulative recorded value</span>
                              <span className="text-foreground font-medium">
                                N{(d.cumulative_recorded_contract_value as number).toLocaleString(
                                  undefined,
                                  { maximumFractionDigits: 0 }
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                        {related.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border/50">
                            <p className="text-xs text-muted-foreground mb-1.5">Related projects:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {related.map((r) => (
                                <Badge key={r} variant="outline">
                                  #{r}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </SignalCard>
                    )
                  }
                  case 'CONTRACTOR_RECURRENCE': {
                    const related = (d.project_ids as string[])?.filter(
                      (p: string) => p !== id
                    ) ?? []
                    return (
                      <SignalCard key={idx} type={signal.type} title="Contractor recurrence">
                        <div className="mb-3 flex items-center gap-2">
                          <Badge variant="primary">{d.contractor}</Badge>
                          <Badge variant="muted">
                            {d.project_count} project{d.project_count !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          {d.first_project_date && (
                            <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                              <span className="text-muted-foreground">First appearance</span>
                              <span className="text-foreground font-medium">
                                {d.first_project_date}
                              </span>
                            </div>
                          )}
                          {d.latest_project_date && (
                            <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                              <span className="text-muted-foreground">Latest appearance</span>
                              <span className="text-foreground font-medium">
                                {d.latest_project_date}
                              </span>
                            </div>
                          )}
                          {d.recorded_related_contract_value != null && (
                            <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                              <span className="text-muted-foreground">Recorded related value</span>
                              <span className="text-foreground font-medium">
                                N{(d.recorded_related_contract_value as number).toLocaleString(
                                  undefined,
                                  { maximumFractionDigits: 0 }
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                        {related.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border/50">
                            <p className="text-xs text-muted-foreground mb-1.5">Related projects:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {related.map((r) => (
                                <Badge key={r} variant="outline">
                                  #{r}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </SignalCard>
                    )
                  }
                  case 'EVIDENCE_GAP': {
                    const lifecycle = (d.lifecycle_assessment as unknown as Record<string, string>) ?? {}
                    const summary = (d.summary as unknown as {
                      available: number
                      partial: number
                      missing: number
                      unknown: number
                    }) ?? {}
                    const stages = [
                      'planning',
                      'tender',
                      'award',
                      'contract',
                      'amendment',
                      'implementation',
                      'payment',
                      'completion',
                      'termination'
                    ]
                    return (
                      <SignalCard key={idx} type={signal.type} title="Evidence gap assessment">
                        <div className="mb-4">
                          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                            {stages.slice(0, 5).map((stage) => (
                              <div key={stage} className="rounded px-2 py-1.5 text-center">
                                <div className="text-xs text-muted-foreground mb-1 capitalize">
                                  {stage}
                                </div>
                                <StatusBadge status={lifecycle[stage] ?? 'unknown'} />
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                            {stages.slice(5).map((stage) => (
                              <div key={stage} className="rounded px-2 py-1.5 text-center">
                                <div className="text-xs text-muted-foreground mb-1 capitalize">
                                  {stage}
                                </div>
                                <StatusBadge status={lifecycle[stage] ?? 'unknown'} />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-green-500" />
                            Available: {summary.available ?? 0}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                            Partial: {summary.partial ?? 0}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-red-500" />
                            Missing: {summary.missing ?? 0}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-gray-400" />
                            Unknown: {summary.unknown ?? 0}
                          </span>
                        </div>
                      </SignalCard>
                    )
                  }
                  default:
                    return null
                }
              })}
            </div>
          </>
        )}

        {/* Unknowns */}
        {project.unknowns.length > 0 && (
          <>
            <SectionHeader
              title="Unknowns & unavailable information"
              description="Information that could not be determined from available sources"
            />
            <Card className="mb-6 border-l-4 border-l-red-400">
              <CardContent>
                <ul className="space-y-2">
                  {project.unknowns.map((u: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                      <span className="text-muted-foreground">{u}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </>
        )}

        {/* Context */}
        {cluster || allocation ? (
          <>
            <SectionHeader
              title="Context"
              description="Related project clusters and allocation patterns"
            />
            <Card className="mb-6">
              <CardContent>
                <div className="space-y-5">
                  {cluster && (
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                        <Layers className="h-4 w-4" />
                        Cluster context
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Project belongs to cluster {cluster.cluster_id} with{' '}
                        {cluster.project_count} project{cluster.project_count !== 1 ? 's' : ''}.
                      </p>
                      {cluster.cumulative_recorded_contract_value != null && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Cumulative recorded contract value: N
                          {cluster.cumulative_recorded_contract_value.toLocaleString(
                            undefined,
                            { maximumFractionDigits: 0 }
                          )}
                        </p>
                      )}
                      {cluster.history && cluster.history.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                            Cluster history
                          </p>
                          <div className="space-y-1">
                            {cluster.history.map(
                              (
                                h: {
                                  project_id: string
                                  title: string
                                  date_of_advert?: string | null
                                  contract_amount?: number | null
                                },
                                i: number
                              ) => (
                                <div key={i} className="rounded-lg bg-muted/30 px-3 py-2 text-sm">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-foreground">
                                      #{h.project_id}: {h.title}
                                    </span>
                                    <Badge variant="muted">{h.project_id}</Badge>
                                  </div>
                                  <div className="mt-1 text-xs text-muted-foreground">
                                    {h.date_of_advert && <span>Advert: {h.date_of_advert}</span>}
                                    {h.contract_amount != null && (
                                      <span className="ml-2">
                                        Value: N{h.contract_amount.toLocaleString(
                                          undefined,
                                          { maximumFractionDigits: 0 }
                                        )}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {allocation && (
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                        <MapPin className="h-4 w-4" />
                        LGA allocation context
                      </h3>
                      <div className="rounded-lg bg-muted/30 px-3 py-2">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">{allocation.lga}</span>
                          {' '}&middot; {allocation.project_count} projects
                          {' '}&middot; Recorded value: N
                          {(allocation.recorded_contract_value as number).toLocaleString(
                            undefined,
                            { maximumFractionDigits: 0 }
                          )}
                        </p>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Population data: {!(allocation.population_data_available as boolean)
                          ? 'not available — population-normalized metrics not computed'
                          : 'available'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}

        {/* AI Evidence Brief */}
        <AIEvidenceBrief projectId={id} />

        {/* Questions for review */}
        {project.questions_for_review.length > 0 && (
          <>
            <SectionHeader
              title="Questions for review"
              description="Open questions grounded in available evidence"
            />
            <Card className="mb-6 border-l-4 border-l-amber-500">
              <CardContent>
                <ul className="space-y-2">
                  {project.questions_for_review.map((q: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="mt-0.5 shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800">
                        Q{i + 1}
                      </span>
                      <span className="text-foreground">{q}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </>
        )}

        {/* Sources */}
        {project.sources.length > 0 && (
          <>
            <SectionHeader
              title="Sources & provenance"
              description="Where this information came from"
            />
            <Card>
              <CardContent>
                <ul className="space-y-2">
                  {project.sources.map((src: { id: string; url?: string | null; note?: string | null; type?: string | null }, i: number) => {
                    if (src.url) {
                      return (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            {src.url}
                          </a>
                          <span className="ml-2 shrink-0 text-muted-foreground">
                            ({src.id})
                          </span>
                        </li>
                      )
                    }
                    return (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="shrink-0 font-medium">{src.id}:</span>
                        {src.note ?? src.type ?? 'No URL'}
                      </li>
                    )
                  })}
                </ul>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}
