export async function POST(request: Request) {
  return new Response(
    JSON.stringify({ error: 'AI endpoint not yet implemented' }),
    { status: 501, headers: { 'Content-Type': 'application/json' } }
  )
}
