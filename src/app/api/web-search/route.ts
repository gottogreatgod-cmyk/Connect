import { NextResponse } from 'next/server'
import { getZAI } from '@/lib/sdk'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { query?: string; num?: number }
    const query = typeof body.query === 'string' ? body.query.trim() : ''

    if (!query) {
      return NextResponse.json({ error: 'A query is required.' }, { status: 400 })
    }

    const num = typeof body.num === 'number' && body.num >= 1 && body.num <= 10 ? Math.floor(body.num) : 5

    const zai = await getZAI()
    const results = await zai.functions.invoke('web_search', { query, num })

    return NextResponse.json({
      results: Array.isArray(results)
        ? results.map((result) => ({
            name: result.name,
            url: result.url,
            snippet: result.snippet,
            host_name: result.host_name,
          }))
        : [],
    })
  } catch (error) {
    console.error('[api/web-search]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Search failed.' },
      { status: 500 },
    )
  }
}
