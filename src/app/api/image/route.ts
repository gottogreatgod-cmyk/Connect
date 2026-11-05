import { NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

const SUPPORTED_SIZES = [
  '1024x1024',
  '768x1344',
  '864x1152',
  '1344x768',
  '1152x864',
  '1440x720',
  '720x1440',
] as const

const MAX_PROMPT_LENGTH = 1000
const JOB_TTL_MS = 15 * 60 * 1000

type JobStatus = 'pending' | 'done' | 'error'

type Job = {
  status: JobStatus
  image?: string
  error?: string
  createdAt: number
}

/**
 * In-memory job store. The Next.js dev server is a long-lived process, so
 * module-level state persists across requests. Jobs are pruned by TTL to keep
 * memory bounded.
 */
const jobs = new Map<string, Job>()

function pruneJobs() {
  const now = Date.now()
  for (const [id, job] of jobs) {
    if (now - job.createdAt > JOB_TTL_MS) {
      jobs.delete(id)
    }
  }
}

// Never cache poll responses
export const dynamic = 'force-dynamic'

/**
 * POST /api/image — starts an image generation job in the background and
 * returns a jobId immediately. Long-running work must not block the HTTP
 * response, otherwise gateway/proxy timeouts return HTML error pages that
 * break client JSON parsing.
 */
export async function POST(request: Request) {
  try {
    pruneJobs()

    const body = (await request.json()) as {
      prompt?: string
      size?: string
    }

    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''

    if (!prompt) {
      return NextResponse.json(
        { error: 'A prompt is required.' },
        { status: 400 }
      )
    }

    if (prompt.length > MAX_PROMPT_LENGTH) {
      return NextResponse.json(
        { error: `Prompt must be under ${MAX_PROMPT_LENGTH} characters.` },
        { status: 400 }
      )
    }

    const size = (SUPPORTED_SIZES as readonly string[]).includes(
      body.size ?? ''
    )
      ? (body.size as (typeof SUPPORTED_SIZES)[number])
      : '1024x1024'

    const jobId = crypto.randomUUID()
    jobs.set(jobId, { status: 'pending', createdAt: Date.now() })

    // Fire-and-forget: generate in the background, update the job when done.
    void (async () => {
      try {
        const zai = await ZAI.create()

        const response = await zai.images.generations.create({
          prompt,
          size,
        })

        const base64 = response.data[0]?.base64

        if (!base64) {
          jobs.set(jobId, {
            status: 'error',
            error: 'The model returned no image. Please try again.',
            createdAt: Date.now(),
          })
          return
        }

        jobs.set(jobId, {
          status: 'done',
          image: `data:image/png;base64,${base64}`,
          createdAt: Date.now(),
        })
      } catch (err) {
        console.error(`[api/image] Job ${jobId} failed:`, err)
        jobs.set(jobId, {
          status: 'error',
          error:
            err instanceof Error
              ? err.message
              : 'Image generation failed. Please try again.',
          createdAt: Date.now(),
        })
      }
    })()

    return NextResponse.json({ jobId }, { status: 202 })
  } catch (error) {
    console.error('[api/image] Error starting job:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Could not start image generation.',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/image?jobId=... — polls the status of a generation job.
 */
export async function GET(request: Request) {
  const jobId = new URL(request.url).searchParams.get('jobId')

  if (!jobId) {
    return NextResponse.json(
      { error: 'A jobId query parameter is required.' },
      { status: 400 }
    )
  }

  pruneJobs()

  const job = jobs.get(jobId)

  if (!job) {
    return NextResponse.json(
      { status: 'error', error: 'Job not found — it may have expired. Please generate again.' },
      { status: 404 }
    )
  }

  if (job.status === 'pending') {
    return NextResponse.json({ status: 'pending' })
  }

  if (job.status === 'done') {
    return NextResponse.json({ status: 'done', image: job.image })
  }

  return NextResponse.json({ status: 'error', error: job.error })
}
