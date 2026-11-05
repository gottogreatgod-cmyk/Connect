/**
 * build-activity — the engine's global heartbeat.
 *
 * The agent loop streams its steps (context → plan → designer ∥ copywriter
 * → verify → memory → respond) wherever it runs — the Agent Chat, the
 * Builder — and this module-level store mirrors that stream so EVERY view
 * can show what the engine is doing, live. The Preview Dock in the AI
 * Studio reads it; the shell could too. Survives view switches because the
 * store lives at module scope (same pattern as the Builder store).
 */

import { useSyncExternalStore } from "react"

export type EngineStepId =
  | "context"
  | "plan"
  | "designer"
  | "copywriter"
  | "verify"
  | "memory"
  | "respond"
  | "answer"
  | "error"
  | (string & {})

/** One streamed loop step — the same shape the NDJSON route emits. */
export interface EngineStep {
  id: EngineStepId
  label: string
  detail: string
  ms: number
}

export type BuildStatus = "idle" | "building" | "done" | "error"

export interface BuildActivity {
  status: BuildStatus
  /** the streamed steps, in arrival order */
  steps: EngineStep[]
  /** a transient notice — "gateway 502 — retrying…" */
  notice: string | null
  /** what the user asked for (the prompt that started this run) */
  prompt: string
  /** wall clock, ms since epoch — the dock's timer reads it */
  startedAt: number
  endedAt: number | null
  error: string | null
  /** the site this run staged, if any (the dock previews it) */
  siteSlug: string | null
  siteName: string | null
}

const IDLE: BuildActivity = {
  status: "idle",
  steps: [],
  notice: null,
  prompt: "",
  startedAt: 0,
  endedAt: null,
  error: null,
  siteSlug: null,
  siteName: null,
}

let activity: BuildActivity = IDLE
const listeners = new Set<() => void>()

function emit() {
  for (const l of listeners) l()
}

/** A run begins — the user asked the engine for something. */
export function beginBuild(prompt: string) {
  activity = { ...IDLE, status: "building", prompt, startedAt: Date.now() }
  emit()
}

/** A streamed step lands — the loop is visibly working. */
export function pushStep(step: EngineStep) {
  activity = { ...activity, status: "building", steps: [...activity.steps, step], notice: null }
  emit()
}

/** A transient transport note — retries, reconnects. Never ends the run. */
export function noteBuild(note: string | null) {
  if (activity.status !== "building") return
  activity = { ...activity, notice: note }
  emit()
}

/** The run finished — ok (optionally with the site it staged) or failed. */
export function endBuild(opts: { ok: boolean; siteSlug?: string | null; siteName?: string | null; error?: string | null } ) {
  if (activity.status !== "building") return
  activity = {
    ...activity,
    status: opts.ok ? "done" : "error",
    notice: null,
    endedAt: Date.now(),
    siteSlug: opts.siteSlug ?? activity.siteSlug,
    siteName: opts.siteName ?? activity.siteName,
    error: opts.error ?? null,
  }
  emit()
}

/** Stage a site reference without ending a run (auto-staging mid-stream). */
export function setBuildSite(slug: string, name: string) {
  activity = { ...activity, siteSlug: slug, siteName: name }
  emit()
}

/** Back to nothing — the dock collapses to its placeholder. */
export function clearBuild() {
  activity = IDLE
  emit()
}

export function subscribeBuild(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getBuildActivity(): BuildActivity {
  return activity
}

/* the React binding — one subscription per consumer, module-scope truth */
export function useBuildActivity(): BuildActivity {
  return useSyncExternalStore(subscribeBuild, getBuildActivity, getBuildActivity)
}
