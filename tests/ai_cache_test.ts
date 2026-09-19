// Phase 10 cache and malformed-response tests
// Run: node tests/ai_cache_test.js

import { explainProject, isValidExplainResponse, getEvidenceVersion, readCache, writeCache, type ExplainResponse } from '../lib/ai.js'
import fs from 'node:fs/promises'
import path from 'node:path'

const CACHE_DIR = path.join(process.cwd(), 'data', 'AI_cache')

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`FAIL: ${message}`)
    process.exitCode = 1
  } else {
    console.log(`PASS: ${message}`)
  }
}

async function setup() {
  // Clean cache dir for test isolation
  try { await fs.rm(CACHE_DIR, { recursive: true, force: true }) } catch { /* ignore */ }
}

async function testCacheHitAvoidsModelCall() {
  console.log('\n--- Test: Cache hit avoids model call ---')

  // Arrange: write a mock cached response
  const evidenceVersion = getEvidenceVersion()
  const mockResponse: ExplainResponse = {
    summary: 'Cached summary for project 847',
    what_we_know: ['This is a cached fact'],
    what_changed: [],
    signals: [],
    what_is_missing: ['Cached missing'],
    questions_for_review: ['Cached question'],
    sources_used: [],
  }

  await writeCache('847', evidenceVersion, mockResponse)

  // Act: call explainProject (should hit cache, no model call)
  const result = await explainProject({ project_id: '847' })

  // Assert: got cached response, not an error
  if ('error' in result) {
    assert(false, `Expected cache hit but got error: ${result.error} (${result.status})`)
    return
  }

  assert(result.summary === 'Cached summary for project 847', 'Cache returned correct summary')
  assert(result.what_we_know[0] === 'This is a cached fact', 'Cache returned correct what_we_know')
  assert(result.what_is_missing[0] === 'Cached missing', 'Cache returned correct what_is_missing')

  // Cleanup
  await fs.rm(path.join(CACHE_DIR, '847.json'), { force: true })
}

async function testChangedEvidenceVersionInvalidatesCache() {
  console.log('\n--- Test: Changed evidence version invalidates cache ---')

  const currentVersion = getEvidenceVersion()
  const oldVersion = '000000000000' // deliberately old version

  // Arrange: write a cached response with old version
  const mockResponse: ExplainResponse = {
    summary: 'Stale cached summary',
    what_we_know: ['Stale fact'],
    what_changed: [],
    signals: [],
    what_is_missing: [],
    questions_for_review: [],
    sources_used: [],
  }

  const cacheFile = path.join(CACHE_DIR, '847.json')
  await fs.mkdir(CACHE_DIR, { recursive: true })
  await fs.writeFile(cacheFile, JSON.stringify({
    metadata: { evidence_version: oldVersion, cached_at: new Date().toISOString() },
    response: mockResponse,
  }, null, 2))

  // Act: call explainProject (should miss cache due to version mismatch)
  const result = await explainProject({ project_id: '847' })

  // Assert: got an error (AI unavailable since no API key), NOT the cached stale response
  if ('error' in result) {
    assert(result.status === 503, `Expected 503 (AI unavailable) but got ${result.status}`)
    assert(result.error === 'AI evidence brief temporarily unavailable', 'Got expected AI unavailable error (cache was invalidated by version mismatch)')
  } else {
    assert(false, 'Expected cache miss (error 503) but got a valid response — cache was not invalidated')
  }

  // Cleanup
  await fs.rm(cacheFile, { force: true })
}

async function testMalformedModelJsonRejected() {
  console.log('\n--- Test: Malformed model JSON rejected with 502 ---')

  // Mock: override getOpenAi to return a client that returns malformed JSON
  const originalEnv = process.env.AI_API_KEY
  const originalModel = process.env.AI_MODEL

  // Set minimal env to get past the config check
  process.env.AI_API_KEY = 'sk-mock-test-key-for-malformed-test'
  process.env.AI_MODEL = 'gpt-4o-mini'

  // We can't easily mock OpenAI client at runtime without dependency injection.
  // Instead, test the validation logic directly.
  const testCases = [
    { name: 'not an object', value: 'just a string', shouldFail: true },
    { name: 'missing summary', value: { what_we_know: [], what_changed: [], signals: [], what_is_missing: [], questions_for_review: [], sources_used: [] }, shouldFail: true },
    { name: 'null source entry note rejected', value: { summary: 'ok', what_we_know: [], what_changed: [], signals: [], what_is_missing: [], questions_for_review: [], sources_used: [{ id: 'SRC-1', note: null }] }, shouldFail: true },
    { name: 'array instead of string in what_we_know', value: { summary: 'ok', what_we_know: [[]], what_changed: [], signals: [], what_is_missing: [], questions_for_review: [], sources_used: [] }, shouldFail: true },
    { name: 'valid response', value: { summary: 'ok', what_we_know: ['fact'], what_changed: [], signals: [], what_is_missing: [], questions_for_review: ['q?'], sources_used: [{ id: 'SRC-1' }] }, shouldFail: false },
  ]

  for (const tc of testCases) {
    const valid = isValidExplainResponse(tc.value)
    if (tc.shouldFail) {
      assert(!valid, `Malformed "${tc.name}" should be rejected`)
    } else {
      assert(valid, `Valid "${tc.name}" should be accepted`)
    }
  }

  // Cleanup
  process.env.AI_API_KEY = originalEnv
  process.env.AI_MODEL = originalModel
}

async function main() {
  await setup()
  await testCacheHitAvoidsModelCall()
  await testChangedEvidenceVersionInvalidatesCache()
  await testMalformedModelJsonRejected()

  console.log('\n=== Test Summary ===')
  if (process.exitCode === 1) {
    console.log('Some tests FAILED')
    process.exit(1)
  } else {
    console.log('All tests PASSED')
  }
}

main().catch(err => {
  console.error('Test harness error:', err)
  process.exit(1)
})
