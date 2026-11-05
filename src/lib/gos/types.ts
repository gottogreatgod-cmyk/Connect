// ─── Growth OS shared types ──────────────────────────────────────────────

export type Intent =
  | "question"
  | "new_site"
  | "edit_site"
  | "analyze"
  | "clarify"
  | "remember"
  | "media"

export interface AgentStep {
  id: string
  label: string
  detail?: string
  status: "active" | "done" | "error"
  ms?: number
  layer?: LayerId
}

// ─── Engine layers (the blueprint made visible) ──────────────────────────

export type LayerId =
  | "interfaces"
  | "orchestrator"
  | "context"
  | "tools"
  | "sandbox"
  | "verification"
  | "memory"

export const STEP_LAYER: Record<string, LayerId> = {
  "Load context": "context",
  "Classify intent": "orchestrator",
  "Verify build": "verification",
  "tool: site.generate": "tools",
  "tool: site.edit": "tools",
  "tool: site.analyze": "tools",
  "tool: knowledge.answer": "tools",
  "tool: clarify": "tools",
  "tool: media.image": "tools",
  "tool: media.speak": "tools",
  "tool: media.video": "tools",
  "tool: memory.write": "memory",
  "Persist site": "sandbox",
  "Write memory": "memory",
  "Compose reply": "interfaces",
}

export function layerForStep(label: string): LayerId {
  return STEP_LAYER[label] ?? "orchestrator"
}

// ─── Streaming protocol (SSE) ────────────────────────────────────────────

export type StreamEvent =
  | { type: "run_start"; conversationId: string }
  | { type: "layer"; layer: LayerId | null }
  | { type: "step"; step: AgentStep }
  | { type: "intent"; intent: Intent; confidence: number; reasoning: string }
  | { type: "site"; site: SiteMeta & { html?: string } }
  | { type: "verification"; verification: Verification }
  | { type: "media"; media: MediaRef }
  | { type: "reply_start" }
  | { type: "reply_delta"; delta: string }
  | { type: "build_phase"; phase: BuildPhaseKind; label: string }
  | { type: "build_delta"; phase: "design" | "document"; delta: string }
  | { type: "done"; response: AgentResponse }
  | { type: "error"; error: string }

// ─── Live build streaming (site.generate / site.edit) ────────────────────
// The preview panel renders the document WHILE it is being written:
// phase events mark stage transitions, delta events carry the raw code.

export type BuildPhaseKind = "design" | "document" | "complete"

export interface BuildPhase {
  phase: BuildPhaseKind
  label: string
}

export type StreamBuildEvent =
  | { type: "build_phase"; phase: BuildPhaseKind; label: string }
  | { type: "build_delta"; phase: "design" | "document"; delta: string }

// ─── Generated media (studio + chat share one pipeline) ───────────────────

export type MediaKind = "image" | "audio" | "video"

export interface MediaRef {
  id: string
  kind: MediaKind
  prompt: string
  url?: string | null // remote url (video)
  pending?: boolean // video still rendering
}

// ─── Domain models ───────────────────────────────────────────────────────

export interface DesignSeed {
  name?: string
  palette?: string
  typography?: string
  archetype?: string
  motion?: string
  voice?: string
}

export interface CheckResult {
  id: string
  label: string
  pass: boolean
  detail?: string
}

export interface Verification {
  score: number
  checks: CheckResult[]
}

export interface SiteMeta {
  id: string
  name: string
  brief: string
  score: number | null
  version: number
  designSeed: DesignSeed | null
  createdAt: string
  updatedAt: string
}

export interface AgentResponse {
  conversationId: string
  messageId: string
  reply: string
  intent: Intent
  steps: AgentStep[]
  site?: SiteMeta & { html?: string }
  verification?: Verification
  clarify?: string[]
  media?: MediaRef[]
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  meta?: {
    intent?: Intent
    steps?: AgentStep[]
    siteId?: string
    verification?: Verification
    media?: MediaRef[]
  }
  createdAt: string
}

// ─── Telemetry (Engine view) ─────────────────────────────────────────────

export interface RunFeedItem {
  id: string
  task: string
  intent: Intent
  toolCalls: number
  durationMs: number
  success: boolean
  createdAt: string
}

export interface MemoryItem {
  id: string
  scope: string
  key: string
  body: string
  updatedAt: string
}

export interface EngineStats {
  sites: number
  runs: number
  messages: number
  memories: number
  conversations: number
  toolCalls: number
  avgScore: number | null
  media: number
  mediaByKind: { kind: string; count: number }[]
  intents: { intent: Intent; count: number }[]
  recentRuns: RunFeedItem[]
  memoriesList: MemoryItem[]
}
