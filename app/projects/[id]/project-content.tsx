'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getEvidenceById, getNormalizedById, getClusterForProject, getSignalsForProject, getAllocationContext } from '@/lib/data'

export default function ProjectContent() {
  const { id } = useParams<{ id: string }>()
  const project = getEvidenceById(id)
  const normalized = getNormalizedById(id)
  const cluster = getClusterForProject(id)
  const signals = getSignalsForProject(id)
  const allocation = getAllocationContext(normalized?.normalized_lga ?? '')

  if (!project) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <h2 className="text-2xl font-bold">Project not found</h2>
        <p className="mt-2 text-muted-foreground">No evidence exists for project ID &ldquo;{id}&rdquo;.</p>
        <Link href="/projects" className="mt-4 inline-block text-primary hover:underline">
          Return to explorer
        </Link>
      </div>
    )
  }

  const title = project.facts.find(f => f.text.startsWith('Project title:'))?.text.slice('Project title: '.length) ?? 'Untitled'

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <Link href="/projects" className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to explorer
      </Link>

      <div className="mb-6 rounded-lg border bg-card p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
            {id}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold truncate">{title}</h1>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {normalized?.normalized_lga && <span>LGA: {normalized.normalized_lga}</span>}
              {normalized?.normalized_sector && <span>Sector: {normalized.normalized_sector}</span>}
              {normalized?.normalized_mda && <span>MDA: {normalized.normalized_mda}</span>}
              {normalized?.normalized_procurement_method && (
                <span className="whitespace-normal">Method: {normalized.normalized_procurement_method}</span>
              )}
            </div>
          </div>
        </div>
        {normalized?.source_url && (
          <div className="mt-4">
            <a href={normalized.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs bg-muted hover:bg-muted/80 text-muted-foreground">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View source: {normalized.source_url}
            </a>
          </div>
        )}
      </div>

      <section className="mb-6 rounded-lg border bg-card p-4 sm:p-6">
        <h2 className="text-lg font-semibold mb-3">Recorded facts</h2>
        <ul className="space-y-2">
          {project.facts.map((fact: { text: string }, i: number) => (
            <li key={i} className="text-sm">{fact.text}</li>
          ))}
        </ul>
      </section>

      {signals.length > 0 && (
        <section className="mb-6 rounded-lg border bg-card p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-3">Signals ({signals.length})</h2>
          <div className="space-y-4">
            {signals.map((signal, idx) => {
              const d = signal.data
              switch (signal.type) {
                case 'REPEAT_INTERVENTION': {
                  const related = (d.project_ids as string[])?.filter((p: string) => p !== id) ?? []
                  const intervals = d.intervals_days as number[] ?? []
                  return (
                    <div key={idx} className="rounded-lg border bg-muted/50 p-4">
                      <h3 className="font-medium text-sm mb-2">Repeat intervention &mdash; Cluster {d.cluster_id}</h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>{d.project_count} related project{d.project_count !== 1 ? 's' : ''} in this cluster</p>
                        {d.first_project_date && <p>First recorded: {d.first_project_date}</p>}
                        {d.latest_project_date && <p>Latest recorded: {d.latest_project_date}</p>}
                        {intervals.length > 0 && <p>Intervals: {intervals.join(', ')} days</p>}
                        {d.cumulative_recorded_contract_value != null && (
                          <p>Cumulative recorded contract value: N{(d.cumulative_recorded_contract_value as number).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                        )}
                      </div>
                      {related.length > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Related: {related.join(', ')}
                        </div>
                      )}
                    </div>
                  )
                }
                case 'CONTRACTOR_RECURRENCE': {
                  const related = (d.project_ids as string[])?.filter((p: string) => p !== id) ?? []
                  return (
                    <div key={idx} className="rounded-lg border bg-muted/50 p-4">
                      <h3 className="font-medium text-sm mb-2">Contractor recurrence &mdash; {d.contractor}</h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Appears in {d.project_count} project{d.project_count !== 1 ? 's' : ''}</p>
                        {d.first_project_date && <p>First appearance: {d.first_project_date}</p>}
                        {d.latest_project_date && <p>Latest appearance: {d.latest_project_date}</p>}
                        {d.recorded_related_contract_value != null && (
                          <p>Recorded related contract value: N{(d.recorded_related_contract_value as number).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                        )}
                      </div>
                      {related.length > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Related: {related.join(', ')}
                        </div>
                      )}
                    </div>
                  )
                }
                case 'EVIDENCE_GAP': {
                  const lifecycle = (d.lifecycle_assessment as unknown as Record<string, string>) ?? {}
                  const summary = (d.summary as unknown as { available: number; partial: number; missing: number; unknown: number }) ?? {}
                  const stages = ['planning', 'tender', 'award', 'contract', 'amendment', 'implementation', 'payment', 'completion', 'termination']
                  return (
                    <div key={idx} className="rounded-lg border bg-muted/50 p-4">
                      <h3 className="font-medium text-sm mb-2">Evidence gap &mdash; lifecycle assessment</h3>
                      <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                        {stages.map(stage => (
                          <div key={stage} className="rounded px-2 py-1 text-center">
                            <div className="text-xs text-muted-foreground">{stage}</div>
                            <StatusBadge status={lifecycle[stage] ?? 'unknown'} />
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Available: {summary.available ?? 0} &middot; Partial: {summary.partial ?? 0} &middot; Missing: {summary.missing ?? 0} &middot; Unknown: {summary.unknown ?? 0}
                      </div>
                    </div>
                  )
                }
                default:
                  return null
              }
            })}
          </div>
        </section>
      )}

      {project.unknowns.length > 0 && (
        <section className="mb-6 rounded-lg border bg-card p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-3">Unknowns &amp; unavailable information</h2>
          <ul className="space-y-2">
            {project.unknowns.map((u: string, i: number) => (
              <li key={i} className="text-sm text-muted-foreground">{u}</li>
            ))}
          </ul>
        </section>
      )}

      {(cluster || allocation) && (
        <section className="mb-6 rounded-lg border bg-card p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-3">Context</h2>
          <div className="space-y-4">
            {cluster && (
              <div>
                <h3 className="font-medium text-sm mb-2">Cluster context</h3>
                <p className="text-sm text-muted-foreground">
                  Project belongs to cluster {cluster.cluster_id} with {cluster.project_count} project{cluster.project_count !== 1 ? 's' : ''}.
                </p>
                {cluster.cumulative_recorded_contract_value != null && (
                  <p className="text-sm text-muted-foreground">
                    Cumulative recorded contract value: N{cluster.cumulative_recorded_contract_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                )}
                {cluster.history && cluster.history.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Cluster history:</p>
                    {cluster.history.map((h: { project_id: string; title: string; date_of_advert?: string | null; contract_amount?: number | null }, i: number) => (
                      <div key={i} className="text-xs text-muted-foreground">
                        #{h.project_id}: {h.title}
                        {h.date_of_advert && ` &mdash; Advert ${h.date_of_advert}`}
                        {h.contract_amount != null && ` &middot; N${h.contract_amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {allocation && (
              <div>
                <h3 className="font-medium text-sm mb-2">LGA allocation context</h3>
                <p className="text-sm text-muted-foreground">
                  LGA: {allocation.lga} &middot; {allocation.project_count} projects &middot; Recorded value: N{(allocation.recorded_contract_value as number).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Population data: {!(allocation.population_data_available as boolean) ? 'not available &mdash; population-normalized metrics not computed' : 'available'}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {project.questions_for_review.length > 0 && (
        <section className="mb-6 rounded-lg border bg-card p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-3">Questions for review</h2>
          <ul className="space-y-2">
            {project.questions_for_review.map((q: string, i: number) => (
              <li key={i} className="text-sm">
                <span className="text-muted-foreground">Q{i + 1}:</span> {q}
              </li>
            ))}
          </ul>
        </section>
      )}

      {project.sources.length > 0 && (
        <section className="rounded-lg border bg-card p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-3">Sources</h2>
          <ul className="space-y-2">
            {project.sources.map((src: { id: string; url?: string | null; note?: string | null; type?: string | null }, i: number) => {
              if (src.url) {
                return (
                  <li key={i} className="text-sm">
                    <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{src.url}</a>
                    <span className="text-muted-foreground ml-1">({src.id})</span>
                  </li>
                )
              }
              return (
                <li key={i} className="text-sm text-muted-foreground">
                  {src.id}: {src.note ?? src.type ?? 'No URL'}
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    available: 'bg-green-100 text-green-800',
    partial: 'bg-yellow-100 text-yellow-800',
    missing: 'bg-red-100 text-red-800',
    unknown: 'bg-gray-100 text-gray-800',
  }
  return (
    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${colors[status] ?? colors.unknown}`}>
      {status}
    </span>
  )
}
