import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { generateImage, IMAGE_SIZES, type ImageSize } from "@/lib/media/sdk"

export const maxDuration = 300
export const dynamic = "force-dynamic"

const VALID_SIZES = new Set<string>(IMAGE_SIZES.map((s) => s.id))

// ── in-process job registry ─────────────────────────────────────────────────
// Generation takes ~30–60s, longer than some proxy timeouts, so the route
// answers instantly with a jobId and the client polls for the result.

interface ImageJob {
  id: string
  status: "processing" | "done" | "failed"
  mediaId?: string
  mediaUrl?: string
  error?: string
  createdAt: number
}

const g = globalThis as unknown as {
  __gosImageJobs: Map<string, ImageJob> | undefined
}
const jobs: Map<string, ImageJob> = (g.__gosImageJobs ??= new Map())

// opportunistic cleanup — jobs are tiny, this is just hygiene
function sweep() {
  if (jobs.size < 50) return
  const cutoff = Date.now() - 30 * 60_000
  for (const [id, job] of jobs) if (job.createdAt < cutoff) jobs.delete(id)
}

/** POST { prompt, size? } → { jobId } — generation runs in the background. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const prompt = typeof body?.prompt === "string" ? body.prompt : ""
  const size = VALID_SIZES.has(body?.size) ? (body.size as ImageSize) : "1024x1024"

  if (!prompt.trim()) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 })
  }

  sweep()
  const jobId = `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const job: ImageJob = { id: jobId, status: "processing", createdAt: Date.now() }
  jobs.set(jobId, job)

  // fire and forget — errors land on the job, never on the request
  void (async () => {
    try {
      const { base64, mimeType } = await generateImage(prompt, size)
      const row = await db.media.create({
        data: {
          kind: "image",
          prompt: prompt.slice(0, 500),
          data: base64,
          mimeType,
        },
      })
      job.mediaId = row.id
      job.mediaUrl = `/api/media/${row.id}?raw=1`
      job.status = "done"
    } catch (err) {
      job.error = err instanceof Error ? err.message : String(err)
      job.status = "failed"
      console.error("[media/image]", job.error)
    }
  })()

  return NextResponse.json({ jobId })
}

/** GET ?jobId= → { status, mediaUrl?, id?, error? } */
export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get("jobId") ?? ""
  const job = jobs.get(jobId)
  if (!job) {
    return NextResponse.json({ status: "failed", error: "Unknown image job — it may have expired. Please retry." }, { status: 404 })
  }
  return NextResponse.json({
    status: job.status,
    mediaUrl: job.mediaUrl ?? null,
    id: job.mediaId ?? null,
    error: job.error ?? null,
  })
}
