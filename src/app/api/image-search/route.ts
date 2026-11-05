import { NextResponse } from 'next/server'
import { getZAI } from '@/lib/sdk'
import {
  createPipelineJob,
  failJob,
  finishJob,
  getPipelineJob,
  updateStep,
} from '@/lib/jobs'

export const dynamic = 'force-dynamic'

/**
 * Image search re-hosts photos on OSS and can take longer than the gateway
 * timeout for a single request, so it runs through the job store: POST starts
 * the search and returns a jobId instantly, GET polls for the results.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { query?: string; count?: number }
    const query = typeof body.query === 'string' ? body.query.trim() : ''

    if (!query) {
      return NextResponse.json({ error: 'A query is required.' }, { status: 400 })
    }

    const count =
      typeof body.count === 'number' && body.count >= 1 && body.count <= 6 ? Math.floor(body.count) : 4

    const jobId = createPipelineJob([
      { skill: 'image-search', label: `Searching the web for “${query.slice(0, 40)}”`, status: 'pending' },
    ])

    void (async () => {
      try {
        updateStep(jobId, 0, { status: 'running' })
        const zai = await getZAI()
        const response = await zai.images.search.create({
          query,
          count,
          rank: false,
          gl: 'us',
        })
        const images = (response.results ?? [])
          .map((result) => result.original_url)
          .filter((url): url is string => typeof url === 'string' && url.startsWith('http'))
        updateStep(jobId, 0, { status: 'done', detail: `${images.length} photos` })
        finishJob(jobId, { images })
      } catch (error) {
        console.error('[api/image-search job]', error)
        updateStep(jobId, 0, { status: 'error' })
        failJob(jobId, error instanceof Error ? error.message : 'Image search failed.')
      }
    })()

    return NextResponse.json({ jobId }, { status: 202 })
  } catch (error) {
    console.error('[api/image-search POST]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not start the search.' },
      { status: 500 },
    )
  }
}

export async function GET(request: Request) {
  const jobId = new URL(request.url).searchParams.get('jobId')
  if (!jobId) {
    return NextResponse.json({ error: 'A jobId is required.' }, { status: 400 })
  }
  const job = getPipelineJob(jobId)
  if (!job) {
    return NextResponse.json(
      { status: 'error', error: 'Job not found — it may have expired. Please search again.' },
      { status: 404 },
    )
  }
  const result = job.result as { images?: string[] } | undefined
  return NextResponse.json({
    status: job.status,
    steps: job.steps,
    images: job.status === 'done' ? result?.images ?? [] : [],
    error: job.error ?? null,
  })
}
