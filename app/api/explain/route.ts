import { NextRequest, NextResponse } from 'next/server'
import { explainProject, type ExplainResponse, type AiError } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body', status: 400 },
        { status: 400 }
      )
    }

    const result = await explainProject(body)

    if ('error' in result) {
      const err = result as AiError
      return NextResponse.json(
        {
          error: err.error,
          detail: err.detail,
          status: err.status,
        },
        { status: err.status }
      )
    }

    const ok = result as ExplainResponse
    return NextResponse.json(ok, { status: 200 })
  } catch (err) {
    console.error('Unexpected error in /api/explain:', err)
    return NextResponse.json(
      {
        error: 'Internal server error',
        detail: 'An unexpected error occurred. Please try again.',
        status: 500,
      },
      { status: 500 }
    )
  }
}
