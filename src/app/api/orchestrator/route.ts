// ─── Orchestrator HTTP surface: background job + event polling ───────────
// WHY NOT a single streaming POST: gateways in front of the app kill long
// single requests (~60s) with 502s no matter how many heartbeat bytes flow.
// So a POST now only STARTS the run (returns a runId in milliseconds), and
// the run itself keeps executing in this process, appending events to an
// in-memory record. The client polls GET /api/orchestrator?runId=…&cursor=…
// — every request is short, so no proxy can ever time the build out, and
// the run even survives client reloads (the client re-attaches by runId).
import { NextRequest } from "next/server"
import { runAgent } from "@/lib/agent/orchestrator"
import type { StreamEvent } from "@/lib/gos/types"

export const dynamic = "force-dynamic"
export const maxDuration = 300

interface RunRecord {
  id: string
  events: StreamEvent[]
  done: boolean
  startedAt: number
}

const g = globalThis as unknown as { __gosRuns?: Map<string, RunRecord> }

function runs(): Map<string, RunRecord> {
  if (!g.__gosRuns) g.__gosRuns = new Map()
  return g.__gosRuns
}

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

/** Drop finished runs older than 10 minutes and cap the registry. */
function sweep() {
  const map = runs()
  const cutoff = Date.now() - 10 * 60_000
  for (const [id, rec] of map) {
    if (rec.done && rec.startedAt < cutoff) map.delete(id)
  }
  while (map.size > 24) {
    let oldestKey: string | null = null
    let oldestAt = Infinity
    for (const [id, rec] of map) {
      if (rec.done && rec.startedAt < oldestAt) {
        oldestAt = rec.startedAt
        oldestKey = id
      }
    }
    if (!oldestKey) break
    map.delete(oldestKey)
  }
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  })
}

/** POST — start an agent run in the background. Returns { runId } immediately. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const message = typeof body?.message === "string" ? body.message.trim() : ""
  if (!message) return json({ error: "message is required" }, 400)

  const conversationId = typeof body?.conversationId === "string" ? body.conversationId : undefined
  const siteId = typeof body?.siteId === "string" ? body.siteId : undefined

  sweep()
  const rec: RunRecord = { id: uid(), events: [], done: false, startedAt: Date.now() }
  runs().set(rec.id, rec)

  // fire-and-forget: the loop keeps running in this process even if the
  // client disconnects, reloads, or the gateway hiccups — it re-attaches
  // by runId and never loses an event (cursor-based replay)
  void (async () => {
    try {
      await runAgent({ message, conversationId, siteId }, (ev) => {
        rec.events.push(ev)
      })
    } catch (err) {
      rec.events.push({
        type: "error",
        error: err instanceof Error ? err.message : String(err),
      })
    } finally {
      rec.done = true
    }
  })()

  return json({ runId: rec.id })
}

/** GET — poll a run: returns every event after `cursor`, plus the new cursor. */
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const runId = url.searchParams.get("runId")
  const cursor = Number(url.searchParams.get("cursor") ?? "0") || 0
  if (!runId) return json({ error: "runId is required" }, 400)

  const rec = runs().get(runId)
  if (!rec) {
    return json(
      { error: "run not found — it may have expired or the server reloaded; retry the message" },
      404,
    )
  }
  const events = rec.events.slice(cursor)
  return json({ events, cursor: rec.events.length, done: rec.done })
}
