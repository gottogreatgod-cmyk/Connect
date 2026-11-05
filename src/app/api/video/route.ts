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

const POLL_INTERVAL_MS = 10_000
const TIMEOUT_MS = 7 * 60 * 1000

/** Video generation is a long async task — job pattern with background polling. */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { prompt?: string }
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''

    if (!prompt) {
      return NextResponse.json({ error: 'A prompt is required.' }, { status: 400 })
    }
    if (prompt.length > 600) {
      return NextResponse.json({ error: 'Prompt must be under 600 characters.' }, { status: 400 })
    }

    const jobId = createPipelineJob([
      { skill: 'video', label: 'Generating your video', status: 'pending' },
    ])

    void (async () => {
      try {
        updateStep(jobId, 0, { status: 'running' })
        const zai = await getZAI()

        const created = await zai.video.generations.create({
          prompt,
          quality: 'speed',
          with_audio: false,
          duration: 5,
        })

        if (!created?.id) {
          throw new Error('The video service did not accept the prompt.')
        }

        const startedAt = Date.now()
        for (;;) {
          if (Date.now() - startedAt > TIMEOUT_MS) {
            throw new Error('Video generation timed out.')
          }
          await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))

          const result = await zai.async.result.query(created.id)
          if (result?.task_status === 'SUCCESS') {
            const videoUrl =
              result.video_result?.[0]?.url ?? result.video_url ?? result.url ?? result.video
            if (typeof videoUrl === 'string' && videoUrl) {
              updateStep(jobId, 0, { status: 'done' })
              finishJob(jobId, { videoUrl })
              return
            }
            throw new Error('The video finished but no file URL was returned.')
          }
          if (result?.task_status === 'FAIL') {
            throw new Error('Video generation failed on the service side.')
          }
          // still PROCESSING — keep polling
        }
      } catch (error) {
        console.error('[api/video job]', error)
        updateStep(jobId, 0, { status: 'error' })
        failJob(jobId, error instanceof Error ? error.message : 'Video generation failed.')
      }
    })()

    return NextResponse.json({ jobId }, { status: 202 })
  } catch (error) {
    console.error('[api/video POST]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not start generation.' },
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
      { status: 'error', error: 'Job not found — it may have expired. Please generate again.' },
      { status: 404 },
    )
  }
  const result = job.result as { videoUrl?: string } | undefined
  return NextResponse.json({
    status: job.status,
    steps: job.steps,
    videoUrl: job.status === 'done' ? result?.videoUrl ?? null : null,
    error: job.error ?? null,
  })
}
