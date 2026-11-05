/**
 * The AI Intelligence layer — shared async job registry.
 *
 * The sandbox gateway cuts any request at ~60s, but image generation
 * runs 30–90s and video generation runs minutes. Every long operation
 * therefore runs as a JOB: the POST returns 202 + a jobId immediately,
 * the work continues in-process, and the client polls GET ?jobId= until
 * the job resolves (or its TTL sweeps it).
 *
 * Jobs live in a module-level Map with a TTL sweep — no external
 * broker needed, and hot reloads simply start a fresh registry.
 */

export type JobStatus = "pending" | "done" | "error"

export interface AiJob<T = unknown> {
  id: string
  kind: "image" | "video"
  status: JobStatus
  /** optional progress label the poll can surface ("rendering…") */
  stage?: string
  result?: T
  error?: string
  createdAt: number
  doneAt?: number
}

const TTL_MS = 20 * 60 * 1000 // 20 minutes — video can be slow
const SWEEP_EVERY = 5 * 60 * 1000

const jobs = new Map<string, AiJob>()

let sweeper: ReturnType<typeof setInterval> | null = null

function ensureSweeper() {
  if (sweeper) return
  sweeper = setInterval(() => {
    const now = Date.now()
    for (const [id, job] of jobs) {
      const age = (job.doneAt ?? job.createdAt) + TTL_MS
      if (now > age) jobs.delete(id)
    }
    if (jobs.size === 0 && sweeper) {
      clearInterval(sweeper)
      sweeper = null
    }
  }, SWEEP_EVERY)
  // don't hold the process open for the sweeper
  if (typeof sweeper.unref === "function") sweeper.unref()
}

export function createJob(kind: AiJob["kind"]): AiJob {
  const id = crypto.randomUUID()
  const job: AiJob = { id, kind, status: "pending", createdAt: Date.now() }
  jobs.set(id, job)
  ensureSweeper()
  return job
}

export function getJob(id: string): AiJob | undefined {
  return jobs.get(id)
}

export function setStage(id: string, stage: string) {
  const job = jobs.get(id)
  if (job && job.status === "pending") job.stage = stage
}

export function finishJob<T>(id: string, result: T) {
  const job = jobs.get(id)
  if (!job) return
  job.status = "done"
  job.result = result
  job.doneAt = Date.now()
}

export function failJob(id: string, error: string) {
  const job = jobs.get(id)
  if (!job) return
  job.status = "error"
  job.error = error
  job.doneAt = Date.now()
}

/** The public poll projection — never leaks internal fields. */
export function jobView(job: AiJob) {
  return {
    jobId: job.id,
    kind: job.kind,
    status: job.status,
    stage: job.stage,
    result: job.status === "done" ? job.result : undefined,
    error: job.status === "error" ? job.error : undefined,
    elapsedMs: Date.now() - job.createdAt,
  }
}
