'use client'

import { useState, useCallback } from 'react'
import { Brain, Loader2, AlertCircle, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/Card'
import { SectionHeader } from '@/components/SectionHeader'
import type { ExplainResponse } from '@/lib/ai'

interface AIEvidenceBriefProps {
  projectId: string
}

export default function AIEvidenceBrief({ projectId }: AIEvidenceBriefProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ExplainResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleExplain = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.detail ?? data.error ?? 'Failed to generate AI brief')
        return
      }

      if (data.error) {
        setError(data.detail ?? data.error ?? 'AI brief unavailable')
        return
      }

      setResult(data as ExplainResponse)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  return (
    <section className="border-b border-border/60 bg-white mb-6">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <SectionHeader
          title="AI evidence brief"
          description="Structured interpretation of this project's evidence by Citizen, Ordaciti's evidence assistant."
        />

        <Card className="mb-4">
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">Citizen</p>
                <p className="text-xs text-muted-foreground">
                  Ordaciti's evidence assistant
                </p>
              </div>
              <button
                onClick={handleExplain}
                disabled={isLoading}
                className="shrink-0 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4" />
                    Explain this project
                  </>
                )}
              </button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="mb-4 border-l-4 border-l-amber-500">
            <CardContent>
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-foreground">AI brief unavailable</p>
                  <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                  <p className="mt-2 text-xs text-muted-foreground/70">
                    The project page remains fully usable without AI. Try again later or contact the site administrator.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card className="mb-4">
            <CardContent>
              <div className="space-y-5">
                {/* Summary */}
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                    <Brain className="h-4 w-4" />
                    Summary
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
                </div>

                {/* What we know */}
                {result.what_we_know.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                      <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        Known
                      </span>
                      What the evidence shows
                    </h3>
                    <ul className="space-y-1.5">
                      {result.what_we_know.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="mt-1 shrink-0 rounded-full bg-green-500/20 px-1.5 py-0.5 text-xs font-medium text-green-700">
                            {i + 1}
                          </span>
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* What changed */}
                {result.what_changed.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                      <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                        Change
                      </span>
                      Patterns and changes
                    </h3>
                    <ul className="space-y-1.5">
                      {result.what_changed.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="mt-1 shrink-0 rounded-full bg-blue-500/20 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                            {i + 1}
                          </span>
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Signals */}
                {result.signals.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                      <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Signal
                      </span>
                      Signals detected
                    </h3>
                    <ul className="space-y-1.5">
                      {result.signals.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="mt-1 shrink-0 rounded-full bg-amber-500/20 px-1.5 py-0.5 text-xs font-medium text-amber-700">
                            {i + 1}
                          </span>
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* What is missing */}
                {result.what_is_missing.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                      <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                        Missing
                      </span>
                      What is missing
                    </h3>
                    <ul className="space-y-1.5">
                      {result.what_is_missing.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="mt-1 shrink-0 rounded-full bg-red-500/20 px-1.5 py-0.5 text-xs font-medium text-red-700">
                            {i + 1}
                          </span>
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Sources used */}
                {result.sources_used.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                      <ExternalLink className="h-4 w-4" />
                      Sources used
                    </h3>
                    <ul className="space-y-1.5">
                      {result.sources_used.map((src) => (
                        <li key={src.id} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="shrink-0 font-medium text-foreground">{src.id}:</span>
                          {src.note ?? 'Source referenced'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}
