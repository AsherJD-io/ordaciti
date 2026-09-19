// AI evidence brief — structured interpretation of project evidence
// Uses OpenAI-compatible API. Model and key from environment only.

import OpenAI from 'openai'
import { readFileSync, mkdir, writeFile } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { getEvidenceById } from './data'

// ---------------------------------------------------------------------------
// Cache configuration
// ---------------------------------------------------------------------------

const CACHE_DIR = path.join(process.cwd(), 'data', 'AI_cache')

function getEvidenceVersion(): string {
  const evidencePath = path.join(process.cwd(), 'data', 'processed', 'evidence.json')
  try {
    const content = JSON.parse(readFileSync(evidencePath, 'utf-8'))
    const manifestStr = JSON.stringify(content.manifest, Object.keys(content.manifest).sort())
    return crypto.createHash('md5').update(manifestStr).digest('hex').substring(0, 12)
  } catch {
    return 'unknown'
  }
}

async function readCache(projectId: string, expectedVersion: string): Promise<ExplainResponse | null> {
  const cacheFile = path.join(CACHE_DIR, `${projectId}.json`)
  try {
    const content = await fs.readFile(cacheFile, 'utf-8')
    const cached = JSON.parse(content) as { metadata?: { evidence_version?: string }; response?: unknown }
    if (cached.metadata?.evidence_version === expectedVersion && cached.response) {
      return cached.response as ExplainResponse
    }
    return null
  } catch {
    return null
  }
}

async function writeCache(projectId: string, evidenceVersion: string, response: ExplainResponse): Promise<void> {
  await fs.mkdir(CACHE_DIR, { recursive: true })
  const cacheFile = path.join(CACHE_DIR, `${projectId}.json`)
  await fs.writeFile(cacheFile, JSON.stringify({
    metadata: { evidence_version: evidenceVersion, cached_at: new Date().toISOString() },
    response,
  }, null, 2))
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ExplainRequest {
  project_id: string
}

export interface ExplainResponse {
  summary: string
  what_we_know: string[]
  what_changed: string[]
  signals: string[]
  what_is_missing: string[]
  questions_for_review: string[]
  sources_used: SourceRef[]
}

export interface SourceRef {
  id: string
  note?: string
}

export interface AiError {
  error: string
  status: number
  detail?: string
}

export type AiResult = ExplainResponse | AiError

// ---------------------------------------------------------------------------
// Schema validation
// ---------------------------------------------------------------------------

function isValidExplainResponse(obj: unknown): obj is ExplainResponse {
  if (!obj || typeof obj !== 'object') return false
  const o = obj as Record<string, unknown>
  if (typeof o.summary !== 'string') return false
  if (!Array.isArray(o.what_we_know)) return false
  if (!Array.isArray(o.what_changed)) return false
  if (!Array.isArray(o.signals)) return false
  if (!Array.isArray(o.what_is_missing)) return false
  if (!Array.isArray(o.questions_for_review)) return false
  if (!Array.isArray(o.sources_used)) return false

  for (const item of o.what_we_know) {
    if (typeof item !== 'string') return false
  }
  for (const item of o.what_changed) {
    if (typeof item !== 'string') return false
  }
  for (const item of o.signals) {
    if (typeof item !== 'string') return false
  }
  for (const item of o.what_is_missing) {
    if (typeof item !== 'string') return false
  }
  for (const item of o.questions_for_review) {
    if (typeof item !== 'string') return false
  }
  for (const src of o.sources_used) {
    if (!src || typeof src !== 'object') return false
    if (typeof src.id !== 'string') return false
    if (src.note !== undefined && typeof src.note !== 'string') return false
  }

  return true
}

// ---------------------------------------------------------------------------
// Prompt construction
// ---------------------------------------------------------------------------

interface EvidenceForPrompt {
  project_id: string
  facts: string[]
  signals: Array<{ type: string; data: Record<string, unknown> }>
  unknowns: string[]
  context: Record<string, unknown>
  questions: string[]
  sources: Array<{ id: string; url?: string | null; note?: string | null; type?: string | null }>
}

function buildEvidencePrompt(ev: EvidenceForPrompt): string {
  const lines: string[] = []
  const ctx = ev.context as Record<string, unknown>

  lines.push(`You are Ordaciti, a public-decision intelligence assistant.`)
  lines.push(``)
  lines.push(`You interpret structured project evidence for a human reviewer.`)
  lines.push(`You do NOT decide whether wrongdoing occurred. You explain what the`)
  lines.push(`evidence shows, what it does not show, and what questions a reviewer`)
  lines.push(`may want to investigate.`)
  lines.push(``)
  lines.push(`--- RULES ---`)
  lines.push(`1. Use ONLY the evidence supplied below.`)
  lines.push(`2. NEVER invent facts, dates, amounts, contractors, population values,`)
  lines.push(`   releases, or sources.`)
  lines.push(`3. NEVER infer corruption, fraud, collusion, waste, political motive, or`)
  lines.push(`   intent.`)
  lines.push(`4. NEVER produce political rankings, recommendations, or accusations.`)
  lines.push(`5. State uncertainty explicitly.`)
  lines.push(`6. Distinguish recorded fact from signal from question.`)
  lines.push(`7. A signal is an analytical indicator for scrutiny, not proof of any`)
  lines.push(`   conclusion.`)
  lines.push(`8. Missing or unavailable information must remain described as missing or`)
  lines.push(`   unavailable. Never turn null/unknown into zero, false, or evidence of`)
  lines.push(`   absence.`)
  lines.push(`9. cite source IDs from the evidence where relevant.`)
  lines.push(`10. Keep the response concise and evidence-linked.`)
  lines.push(``)
  lines.push(`--- PROJECT ---`)
  lines.push(`Project ID: ${ev.project_id}`)
  lines.push(``)
  lines.push(`--- RECORDED FACTS ---`)
  for (const fact of ev.facts) {
    lines.push(`- ${fact}`)
  }
  lines.push(``)
  lines.push(`--- SIGNALS ---`)
  if (ev.signals.length === 0) {
    lines.push(`No analytical signals attached to this project.`)
  } else {
    for (const sig of ev.signals) {
      const t = sig.type
      const d = sig.data
      lines.push(`Type: ${t}`)
      for (const [k, v] of Object.entries(d)) {
        if (k === 'population_data_available') continue
        if (k === 'lifecycle_assessment') {
          lines.push(`  lifecycle_assessment:`)
          const stages = d as Record<string, string>
          for (const [stage, status] of Object.entries(stages)) {
            lines.push(`    ${stage}: ${status}`)
          }
        } else if (k === 'summary') {
          const s = d as Record<string, number>
          lines.push(`  summary: available=${s.available}, partial=${s.partial}, missing=${s.missing}, unknown=${s.unknown}`)
        } else if (typeof v === 'number') {
          lines.push(`  ${k}: ${v.toLocaleString()}`)
        } else if (Array.isArray(v)) {
          if (v.length > 0 && typeof v[0] === 'number') {
            lines.push(`  ${k}: [${v.map(n => n.toLocaleString()).join(', ')}]`)
          } else {
            lines.push(`  ${k}: [${v.join(', ')}]`)
          }
        } else if (typeof v === 'object' && v !== null) {
          lines.push(`  ${k}: ${JSON.stringify(v)}`)
        } else {
          lines.push(`  ${k}: ${v}`)
        }
      }
      lines.push(``)
    }
  }
  lines.push(`--- UNKNOWN / UNAVAILABLE ---`)
  if (ev.unknowns.length === 0) {
    lines.push(`No explicitly recorded unknowns for this project.`)
  } else {
    for (const u of ev.unknowns) {
      lines.push(`- ${u}`)
    }
  }
  lines.push(``)
  lines.push(`--- CONTEXT ---`)
  if (ctx.cluster) {
    const cluster = ctx.cluster as { cluster_id: string | number; project_count: number; cumulative_recorded_contract_value?: number; history?: Array<{ project_id: string; title: string }> } | null
    if (cluster) {
      lines.push(`Cluster context:`)
      lines.push(`  cluster_id: ${cluster.cluster_id}`)
      lines.push(`  project_count: ${cluster.project_count}`)
      if (cluster.cumulative_recorded_contract_value != null) {
        lines.push(`  cumulative_recorded_contract_value: ₦${cluster.cumulative_recorded_contract_value.toLocaleString()}`)
      }
      if (cluster.history && cluster.history.length > 0) {
        lines.push(`  history:`)
        for (const h of cluster.history) {
          lines.push(`    - ${h.project_id}: ${h.title}`)
        }
      }
    }
  }
  if (ctx.lga_allocation) {
    const la = ctx.lga_allocation as Record<string, unknown>
    lines.push(`LGA allocation context:`)
    lines.push(`  lga: ${la.lga}`)
    lines.push(`  project_count: ${la.project_count}`)
    if (la.recorded_contract_value != null) {
      lines.push(`  recorded_contract_value: ₦${(la.recorded_contract_value as number).toLocaleString()}`)
    }
    lines.push(`  population_data_available: ${la.population_data_available}`)
  }
  if (ctx.lga_population) {
    const lp = ctx.lga_population as Record<string, unknown>
    if (lp.population != null && (lp.population as number) > 0) {
      lines.push(`LGA population context:`)
      lines.push(`  lga: ${lp.lga ?? 'N/A'}`)
      lines.push(`  population: ${(lp.population as number).toLocaleString()}`)
      lines.push(`  population_source: ${lp.population_source}`)
      lines.push(`  population_reference_year: ${lp.population_reference_year}`)
      if (lp.value_per_100k_population != null) {
        lines.push(`  lga_recorded_contract_value: ₦{(lp.lga_recorded_contract_value as number).toLocaleString()}`)
        lines.push(`  value_per_100k_population: ₦{(lp.value_per_100k_population as number).toLocaleString()}`)
      }
    } else if (lp.lga) {
      lines.push(`LGA population context:`)
      lines.push(`  lga: ${lp.lga}`)
      lines.push(`  population: not available`)
      if (lp.note) lines.push(`  note: ${lp.note}`)
    }
  }
  lines.push(``)
  lines.push(`--- QUESTIONS FOR REVIEW (from evidence) ---`)
  for (const q of ev.questions) {
    lines.push(`- ${q}`)
  }
  lines.push(``)
  lines.push(`--- SOURCES ---`)
  if (ev.sources.length === 0) {
    lines.push(`No sources recorded.`)
  } else {
    for (const src of ev.sources) {
      if (src.url) {
        lines.push(`- ${src.id}: ${src.url}`)
      } else {
        lines.push(`- ${src.id}: ${src.note ?? src.type ?? 'No URL'}`)
      }
    }
  }
  lines.push(``)
  lines.push(`--- YOUR TASK ---`)
  lines.push(`Produce a JSON object with exactly these fields:`)
  lines.push(``)
  lines.push(`{
  "summary": "A concise 2-4 sentence summary of what the evidence shows about this project.",
  "what_we_know": ["Each item is a recorded fact or determinate analytical result from the evidence, stated plainly."],
  "what_changed": ["Each item describes a change across available records or a notable analytical pattern, if any. Leave empty if nothing changed or no pattern is indicated."],
  "signals": ["Each item names a signal type present in the evidence and describes what it indicates in plain language. Leave empty if no signals."],
  "what_is_missing": ["Each item describes evidence that is missing, unavailable, or unknown, as stated in the evidence."],
  "questions_for_review": ["Each item is a neutral review question a human reviewer could investigate. Use the questions from the evidence where provided, and add no more than 2 additional neutral questions grounded in the actual evidence."],
  "sources_used": [{"id": "source ID from the evidence", "note": "optional short note"}]
}`)
  lines.push(``)
  lines.push(`Return ONLY the JSON object. No other text.`)

  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// AI client factory
// ---------------------------------------------------------------------------

function getOpenAi(): Promise<OpenAI | null> {
  const apiKey = process.env.AI_API_KEY
  const model = process.env.AI_MODEL

  if (!apiKey || !model) {
    return Promise.resolve(null)
  }

  try {
    return Promise.resolve(new OpenAI({
      apiKey,
      baseURL: process.env.OPENAI_BASE_URL ?? undefined,
    }))
  } catch {
    return Promise.resolve(null)
  }
}

export async function explainProject(request: ExplainRequest, forceRefresh = false): Promise<AiResult> {
  const { project_id } = request

  if (!project_id || typeof project_id !== 'string' || !project_id.trim()) {
    return { error: 'Invalid request', status: 400, detail: 'project_id is required and must be a non-empty string' }
  }

  const trimmedId = project_id.trim()

  // Resolve evidence from processed data
  const ev = getEvidenceById(trimmedId)
  if (!ev) {
    return { error: 'Project not found', status: 404, detail: `No evidence exists for project_id "${trimmedId}"` }
  }

  // Check cache (unless forced refresh)
  if (!forceRefresh) {
    const evidenceVersion = getEvidenceVersion()
    const cached = await readCache(trimmedId, evidenceVersion)
    if (cached) {
      return cached
    }
  }

  // Build prompt from evidence
  // evidence.json signals have { type, ...data_fields } — transform to { type, data }
  const promptEvidence: EvidenceForPrompt = {
    project_id: ev.project_id,
    facts: ev.facts.map(f => f.text),
    signals: (ev.signals as Array<{ type: string; [key: string]: unknown }> || []).map(s => {
      const { type, ...data } = s
      return { type, data: data as Record<string, unknown> }
    }),
    unknowns: ev.unknowns,
    context: ev.context ?? {},
    questions: ev.questions_for_review,
    sources: ev.sources,
  }

  const userMessage = buildEvidencePrompt(promptEvidence)

  // AI unavailable — return structured degradation
  const client = await getOpenAi()
  if (!client) {
    return {
      error: 'AI evidence brief temporarily unavailable',
      status: 503,
      detail: 'AI_API_KEY and/or AI_MODEL environment variables are not configured. The application functions without AI.',
    }
  }

  try {
    const model = process.env.AI_MODEL
    if (!model) {
      return { error: 'AI model not configured', status: 503, detail: 'AI_MODEL environment variable is not set.' }
    }

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: 'You are Ordaciti, a public-decision intelligence assistant. Follow the rules in the user message exactly.' },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 2048,
      response_format: { type: 'json_object' },
    })

    const raw = response.choices[0]?.message?.content
    if (!raw) {
      return { error: 'AI response empty', status: 502, detail: 'The model returned an empty response.' }
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      return { error: 'AI response not valid JSON', status: 502, detail: 'The model returned a response that could not be parsed as JSON.' }
    }

    if (!isValidExplainResponse(parsed)) {
      return {
        error: 'AI response invalid',
        status: 502,
        detail: 'The model returned a JSON object that does not match the required schema. The response was not passed through.',
      }
    }

    // Write to cache
    const evidenceVersion = getEvidenceVersion()
    await writeCache(trimmedId, evidenceVersion, parsed as ExplainResponse)

    return parsed as ExplainResponse
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    // Distinguish rate limits / auth errors from timeouts
    if (message.includes('429')) {
      return { error: 'AI service rate limited', status: 503, detail: 'The AI service is currently rate-limited. Please try again later.' }
    }
    if (message.includes('401') || message.includes('403')) {
      return { error: 'AI service authentication error', status: 503, detail: 'The AI service rejected the credentials. Check AI_API_KEY configuration.' }
    }
    return { error: 'AI service error', status: 502, detail: `The AI service returned an error: ${message}` }
  }
}

// Export only the public API
export { getEvidenceVersion, readCache, writeCache }
export { isValidExplainResponse }
