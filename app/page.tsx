import Link from 'next/link'
import { evidence, patterns, signals } from '@/lib/data'

export const metadata = {
  title: 'Ordaciti — Public Decision Intelligence',
  description: 'Connecting government projects across time and location to reveal patterns, evidence gaps and system-level questions around public expenditure.',
}

export default function Home() {
  const projectCount = evidence.length
  const clusterCount = patterns.clusters.length
  const singletonCount = patterns.singletons.length

  // Count signals by type
  const signalCounts: Record<string, number> = {}
  for (const e of evidence) {
    for (const s of e.signals) {
      signalCounts[s.type] = (signalCounts[s.type] ?? 0) + 1
    }
  }

  const repeatCount = signalCounts['REPEAT_INTERVENTION'] ?? 0
  const contractorCount = signalCounts['CONTRACTOR_RECURRENCE'] ?? 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm">
                O
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">Ordaciti</h1>
                <p className="text-xs text-muted-foreground">Public Decision Intelligence</p>
              </div>
            </div>
            <nav className="flex gap-6 text-sm">
              <Link href="/" className="font-medium text-foreground">Home</Link>
              <Link href="/projects" className="font-medium text-muted-foreground hover:text-foreground">Explorer</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b bg-background">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Government projects are not isolated transactions.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            Ordaciti connects public procurement records across time and location,
            identifies recurring interventions, contractor recurrence, evidence gaps
            and allocation patterns, then presents the evidence for human review.
          </p>
          <div className="mt-8 flex gap-4">
            <Link
              href="/projects"
              className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Explore {projectCount.toLocaleString()} projects
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Key figures */}
      <section className="border-b bg-background">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border bg-card p-4">
              <div className="text-2xl font-bold">{projectCount.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Projects analysed</div>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="text-2xl font-bold">{clusterCount}</div>
              <div className="text-xs text-muted-foreground">Related project clusters</div>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="text-2xl font-bold">{singletonCount}</div>
              <div className="text-xs text-muted-foreground">Projects without detected links</div>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="text-2xl font-bold">{repeatCount + contractorCount}</div>
              <div className="text-xs text-muted-foreground">Pattern signals detected</div>
            </div>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="border-b bg-background">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <h3 className="text-xl font-semibold mb-4">How Ordaciti works</h3>
          <div className="space-y-6">
            <div className="rounded-lg border bg-card p-4">
              <h4 className="font-medium mb-2">Recorded evidence, not assertions</h4>
              <p className="text-sm text-muted-foreground">
                Every project page shows the facts recorded in source data, the signals
                derived from those facts, and what is missing. Missing evidence is described
                as unavailable — not as proof that something did not happen.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <h4 className="font-medium mb-2">Patterns across time and location</h4>
              <p className="text-sm text-muted-foreground">
                Related projects are connected by shared location, sector, and documented
                intervention patterns. The system surfaces repeated interventions and
                recurring contractors without making judgements about why.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <h4 className="font-medium mb-2">Questions for human review</h4>
              <p className="text-sm text-muted-foreground">
                Each project includes neutral review questions grounded in the available
                evidence. Ordaciti does not decide what citizens should believe — it gives
                them a clearer evidence base for asking better questions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Evidence gaps */}
      <section className="border-b bg-background">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <h3 className="text-xl font-semibold mb-4">What is missing matters</h3>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              Across the {projectCount.toLocaleString()} projects analysed, most lack implementation-stage
              evidence: completion reports, payment records, and photographs are not available
              in the retrieved source data. This does not mean those activities did not happen —
              it means the available public records do not show them.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Ordaciti represents each lifecycle stage as available, partial, missing, or unknown.
              The evidence gap signal helps identify where recorded evidence is thin, so reviewers
              can decide what additional information to seek.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-6">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-muted-foreground">
          <p>Ordaciti — built from public procurement records.</p>
          <p className="mt-1">Evidence is synthesised from available data. Missing information is not fabricated.</p>
        </div>
      </footer>
    </div>
  )
}
