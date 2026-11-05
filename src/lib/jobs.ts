/**
 * Generic in-memory job store for long-running AI pipelines. The Next.js dev
 * server is a long-lived process, so module-level state persists across
 * requests. Long work must never block the HTTP response — the gateway in
 * front of this app times out long requests and returns HTML error pages, so
 * every slow pipeline (image generation, copilot builds, video) runs through
 * this store: POST starts a job and returns an id instantly, GET polls.
 */

export type JobStatus = 'pending' | 'done' | 'error'

export interface Job<T = unknown> {
  status: JobStatus
  result?: T
  error?: string
  createdAt: number
}

export type SkillId =
  | 'llm'
  | 'search'
  | 'page-reader'
  | 'vlm'
  | 'asr'
  | 'tts'
  | 'image-gen'
  | 'image-search'
  | 'video'

export interface PipelineStep {
  skill: SkillId
  label: string
  status: 'pending' | 'running' | 'done' | 'error'
  detail?: string
}

export interface PipelineJob extends Job {
  steps: PipelineStep[]
}

const JOB_TTL_MS = 20 * 60 * 1000

const jobs = new Map<string, PipelineJob>()

function pruneJobs() {
  const now = Date.now()
  for (const [id, job] of jobs) {
    if (now - job.createdAt > JOB_TTL_MS) jobs.delete(id)
  }
}

export function createPipelineJob(steps: PipelineStep[]): string {
  pruneJobs()
  const id = crypto.randomUUID()
  jobs.set(id, { status: 'pending', steps, createdAt: Date.now() })
  return id
}

export function getPipelineJob(id: string): PipelineJob | undefined {
  pruneJobs()
  return jobs.get(id)
}

export function updateStep(jobId: string, index: number, patch: Partial<PipelineStep>) {
  const job = jobs.get(jobId)
  if (!job) return
  const step = job.steps[index]
  if (!step) return
  job.steps[index] = { ...step, ...patch }
}

export function finishJob(jobId: string, result: unknown) {
  const job = jobs.get(jobId)
  if (!job) return
  job.status = 'done'
  job.result = result
}

export function failJob(jobId: string, error: string) {
  const job = jobs.get(jobId)
  if (!job) return
  job.status = 'error'
  job.error = error
}
