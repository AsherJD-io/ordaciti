import Link from 'next/link'
import { ArrowRight, MapPin, FileSearch, Layers, Shield } from 'lucide-react'
import { evidence, patterns } from '@/lib/data'
import { Card } from '@/components/Card'
import { Badge } from '@/components/Badge'

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
  const evidenceGapCount = signalCounts['EVIDENCE_GAP'] ?? 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/60 bg-white/90 backdrop-blur supports-backdrop-blur:bg-white/80">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/brand/ordaciti-logo-navbar.svg"
                alt="Ordaciti — Public Decision Intelligence"
                className="h-9 w-auto"
              />
            </div>
            <nav className="hidden sm:flex items-center gap-8 text-sm">
              <Link href="/" className="font-medium text-foreground">Home</Link>
              <Link href="/projects" className="font-medium text-muted-foreground hover:text-foreground transition-colors">Explorer</Link>
            </nav>
            <nav className="flex sm:hidden items-center gap-4 text-sm">
              <Link href="/" className="font-medium text-foreground">Home</Link>
              <Link href="/projects" className="font-medium text-muted-foreground hover:text-foreground transition-colors">Explorer</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-gradient border-b border-border/60">
        <div className="absolute inset-0 bg-grid-subtle opacity-30" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <Badge variant="primary" size="md" className="mb-6">
              610 projects analysed
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.1]">
              Government projects are not isolated transactions.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Ordaciti connects public procurement records across time and location,
              identifies recurring interventions, contractor recurrence, evidence gaps
              and allocation patterns, then presents the evidence for human review.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/projects"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Explore projects
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-sm text-muted-foreground">
                Browse {projectCount.toLocaleString()} government projects with evidence analysis
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key figures */}
      <section className="border-b border-border/60 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card elevated className="p-5">
              <div className="text-3xl font-bold tracking-tight text-foreground">{projectCount.toLocaleString()}</div>
              <div className="mt-1 text-sm text-muted-foreground">Projects analysed</div>
            </Card>
            <Card elevated className="p-5">
              <div className="text-3xl font-bold tracking-tight text-foreground">{clusterCount}</div>
              <div className="mt-1 text-sm text-muted-foreground">Related project clusters</div>
            </Card>
            <Card elevated className="p-5">
              <div className="text-3xl font-bold tracking-tight text-foreground">{singletonCount}</div>
              <div className="mt-1 text-sm text-muted-foreground">Projects without detected links</div>
            </Card>
            <Card elevated className="p-5">
              <div className="text-3xl font-bold tracking-tight text-foreground">{repeatCount + contractorCount + evidenceGapCount}</div>
              <div className="mt-1 text-sm text-muted-foreground">Intelligence signals detected</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Intelligence signals */}
      <section className="border-b border-border/60 bg-background">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Intelligence signals</h2>
            <p className="mt-2 text-muted-foreground">
              Ordaciti surfaces observable patterns from the available evidence — without making judgements.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Card hover className="signal-repeat">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                  <Layers className="h-5 w-5 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground">Repeat interventions</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    Projects cluster around recurring interventions in the same location and sector — flagging potential program patterns for review.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="outline">{repeatCount} signals</Badge>
                  </div>
                </div>
              </div>
            </Card>
            <Card hover className="signal-contractor">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <FileSearch className="h-5 w-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground">Contractor recurrence</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    Identifies contractors appearing across multiple projects — useful for understanding procurement patterns.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="outline">{contractorCount} signals</Badge>
                  </div>
                </div>
              </div>
            </Card>
            <Card hover className="signal-evidence">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50">
                  <Shield className="h-5 w-5 text-red-500" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground">Evidence gaps</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    Maps the project lifecycle against available evidence — highlighting where documentation is thin or absent.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="outline">{evidenceGapCount} signals</Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="border-b border-border/60 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">How Ordaciti works</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            <Card>
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground">Recorded evidence, not assertions</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Every project page shows the facts recorded in source data, the signals
                    derived from those facts, and what is missing. Missing evidence is described
                    as unavailable — not as proof that something did not happen.
                  </p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Layers className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground">Patterns across time and location</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Related projects are connected by shared location, sector, and documented
                    intervention patterns. The system surfaces repeated interventions and
                    recurring contractors without making judgements about why.
                  </p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground">Questions for human review</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Each project includes neutral review questions grounded in the available
                    evidence. Ordaciti does not decide what citizens should believe — it gives
                    them a clearer evidence base for asking better questions.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Evidence gaps */}
      <section className="border-b border-border/60 bg-section-subtle">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-lg border-l-4 border-l-amber-500 bg-white p-6 sm:p-8 shadow-card">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">What is missing matters</h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Across the {projectCount.toLocaleString()} projects analysed, most lack implementation-stage
              evidence: completion reports, payment records, and photographs are not available
              in the retrieved source data. This does not mean those activities did not happen —
              it means the available public records do not show them.
            </p>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Ordaciti represents each lifecycle stage as available, partial, missing, or unknown.
              The evidence gap signal helps identify where recorded evidence is thin, so reviewers
              can decide what additional information to seek.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 text-center sm:text-left">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2">
              <img
                src="/brand/ordaciti-icon.svg"
                alt="Ordaciti"
                className="h-6 w-auto"
              />
              <span className="text-sm font-medium text-foreground">Ordaciti</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built from public procurement records. Evidence is synthesised from available data. Missing information is not fabricated.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
