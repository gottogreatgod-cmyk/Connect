"use client"

import {
  ArrowRight,
  AudioLines,
  Boxes,
  BrainCircuit,
  CheckCircle2,
  Clapperboard,
  Cpu,
  Database,
  Eye,
  FlaskConical,
  ImageIcon,
  Layers3,
  MessageSquare,
  Sparkles,
  Terminal,
  Volume2,
  Wrench,
  Zap,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { AgentStep, EngineStats, LayerId } from "@/lib/gos/types"
import { REPO_INTEGRATIONS } from "@/lib/gos/repos"
import type { StudioTab } from "@/components/gos/studio-view"
import { cn } from "@/lib/utils"

const LAYER_ICONS: Record<LayerId, React.ComponentType<{ className?: string }>> = {
  interfaces: MessageSquare,
  orchestrator: Cpu,
  context: BrainCircuit,
  tools: Wrench,
  sandbox: Eye,
  verification: FlaskConical,
  memory: Database,
}

const LAYERS: {
  id: LayerId
  name: string
  role: string
  detail: string
}[] = [
  {
    id: "interfaces",
    name: "Interfaces",
    role: "Chat workspace · live preview · sites library",
    detail: "Every reply streams token-by-token; every build renders the moment it lands.",
  },
  {
    id: "orchestrator",
    name: "Orchestrator",
    role: "Agent loop — classify → route → verify → respond",
    detail: "One message in, one routed run out. Never free-forms around its tools.",
  },
  {
    id: "context",
    name: "Context Engine",
    role: "History · site state · memory index",
    detail: "Loaded into every run — the agent never answers in a vacuum.",
  },
  {
    id: "tools",
    name: "Tool layer",
    role: "site.generate · site.edit · media.image · media.speak · media.video",
    detail: "Small, single-purpose, typed tools. Sites build in two stages; media renders through the same loop.",
  },
  {
    id: "sandbox",
    name: "Preview sandbox",
    role: "Versioned renders at any device width",
    detail: "Each save is a new version — reopen or download any of them, forever.",
  },
  {
    id: "verification",
    name: "Verification",
    role: "13-point structural + richness check",
    detail: "Hero composition, visual richness, motion craft, substance. No pass — no done.",
  },
  {
    id: "memory",
    name: "Memory",
    role: "user · project · business scopes",
    detail: "Say \"remember…\" and it survives every future run and build.",
  },
]

const TOOLS = [
  { id: "site.generate", desc: "two-stage build — art direction + CSS, then the full document", intent: "new_site" },
  { id: "site.edit", desc: "surgical CSS patch + complete body regeneration", intent: "edit_site" },
  { id: "site.analyze", desc: "fetch a reference, read it, distill what to steal", intent: "analyze" },
  { id: "media.image", desc: "prompt → artwork, seven aspect ratios, stored in the library", intent: "media" },
  { id: "media.speak", desc: "text → natural speech, seven voices, any pace", intent: "media" },
  { id: "media.video", desc: "scene → clip on the async render farm, live progress", intent: "media" },
  { id: "media.transcribe", desc: "voice → exact text — powers the chat mic", intent: "media" },
  { id: "knowledge.answer", desc: "system knowledge with full run context", intent: "question" },
  { id: "memory.write", desc: "durable facts, scoped and recalled forever", intent: "remember" },
]

const STUDIO_CARDS: { tab: StudioTab; label: string; icon: React.ReactNode; blurb: string }[] = [
  { tab: "asr", label: "Voice → Text", icon: <AudioLines className="h-4 w-4" />, blurb: "speak or upload — exact transcription" },
  { tab: "tts", label: "Text → Voice", icon: <Volume2 className="h-4 w-4" />, blurb: "7 voices · any pace · wav" },
  { tab: "image", label: "Photos", icon: <ImageIcon className="h-4 w-4" />, blurb: "prompt → artwork · 7 ratios" },
  { tab: "video", label: "Video", icon: <Clapperboard className="h-4 w-4" />, blurb: "scene → clip · async render" },
]

interface EngineViewProps {
  stats: EngineStats | null
  activeLayer: LayerId | null
  liveSteps: AgentStep[]
  onStartBuilding: () => void
  onOpenStudio: (tab: StudioTab) => void
}

export function EngineView({ stats, activeLayer, liveSteps, onStartBuilding, onOpenStudio }: EngineViewProps) {
  const layerStat = (id: LayerId): string | null => {
    if (!stats) return null
    switch (id) {
      case "interfaces":
        return `${stats.messages} messages`
      case "orchestrator":
        return `${stats.runs} runs`
      case "context":
        return `${stats.conversations} threads`
      case "tools":
        return `${stats.toolCalls} calls`
      case "sandbox":
        return `${stats.sites} sites`
      case "verification":
        return stats.avgScore != null ? `avg ${stats.avgScore}/100` : "no builds yet"
      case "memory":
        return `${stats.memories} facts`
    }
  }

  const intentCount = (intent: string) =>
    stats?.intents.find((i) => i.intent === intent)?.count ?? 0

  const mediaCount = (kind: string) =>
    stats?.mediaByKind.find((k) => k.kind === kind)?.count ?? 0

  const running = activeLayer !== null

  return (
    <div className="gos-scroll h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        {/* header */}
        <div className="gos-rise flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="gos-glow flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
                <Cpu className="h-4.5 w-4.5 text-primary" />
              </span>
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                Intelligence Engine
              </h2>
              <span
                className={cn(
                  "flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest",
                  running
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-muted/60 text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    running ? "gos-pulse-dot bg-primary" : "bg-muted-foreground/50",
                  )}
                />
                {running ? "running" : "idle"}
              </span>
            </div>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Seven layers, one loop. Every message is classified, routed to a tool,
              verified, remembered — and streamed to you live. This is the machine while it thinks.
            </p>
          </div>
          <button
            onClick={onStartBuilding}
            className="group flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
          >
            Start building
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* media studio strip */}
        <section aria-label="Media studio" className="gos-rise mt-6">
          <div className="flex items-end justify-between gap-3">
            <SectionLabel>media studio · generate anything</SectionLabel>
            {stats && stats.media > 0 && (
              <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                {stats.media} assets generated
              </span>
            )}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            {STUDIO_CARDS.map((card) => {
              const count =
                card.tab === "asr"
                  ? null
                  : card.tab === "tts"
                    ? mediaCount("audio")
                    : card.tab === "image"
                      ? mediaCount("image")
                      : mediaCount("video")
              return (
                <button
                  key={card.tab}
                  onClick={() => onOpenStudio(card.tab)}
                  className="group flex flex-col gap-2 rounded-xl border border-border/70 bg-card/40 p-3.5 text-left transition-all hover:border-primary/40 hover:bg-accent/40 hover:shadow-md"
                >
                  <span className="flex items-center gap-2 text-primary">
                    {card.icon}
                    <span className="font-display text-[13px] font-semibold text-foreground">{card.label}</span>
                    {count != null && count > 0 && (
                      <span className="ml-auto rounded bg-primary/15 px-1.5 font-mono text-[9px] text-primary">
                        {count}
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-[10px] leading-snug text-muted-foreground">{card.blurb}</span>
                  <span className="mt-auto flex items-center gap-1 font-mono text-[10px] text-primary/70 transition-colors group-hover:text-primary">
                    open <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {/* telemetry strip */}
        <div className="gos-rise mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          <Metric icon={<Layers3 className="h-3.5 w-3.5" />} label="sites built" value={stats?.sites ?? 0} />
          <Metric icon={<Zap className="h-3.5 w-3.5" />} label="agent runs" value={stats?.runs ?? 0} />
          <Metric icon={<Wrench className="h-3.5 w-3.5" />} label="tool calls" value={stats?.toolCalls ?? 0} />
          <Metric icon={<ImageIcon className="h-3.5 w-3.5" />} label="media assets" value={stats?.media ?? 0} />
          <Metric
            icon={<FlaskConical className="h-3.5 w-3.5" />} 
            label="avg verify"
            value={stats?.avgScore != null ? `${stats.avgScore}` : "—"}
          />
          <Metric icon={<Database className="h-3.5 w-3.5" />} label="memories" value={stats?.memories ?? 0} />
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          {/* layer stack */}
          <section aria-label="Engine layers" className="space-y-2">
            <SectionLabel>the stack · live</SectionLabel>
            <ol className="relative space-y-2">
              {/* spine */}
              <span
                aria-hidden
                className="absolute bottom-4 left-[27px] top-4 w-px bg-border/80"
              />
              {LAYERS.map((layer, i) => {
                const Icon = LAYER_ICONS[layer.id]
                const isActive = activeLayer === layer.id
                const layerSteps = liveSteps.filter((s) => s.layer === layer.id)
                const liveDetail =
                  layerSteps.findLast((s) => s.status === "active")?.detail ??
                  layerSteps.findLast((s) => s.status !== "active")?.detail
                const touched = layerSteps.length > 0
                return (
                  <li key={layer.id} className="relative">
                    <div
                      className={cn(
                        "flex gap-3.5 rounded-xl border p-3.5 transition-all duration-300",
                        isActive
                          ? "gos-glow border-primary/50 bg-accent/60 shadow-md"
                          : touched
                            ? "border-primary/25 bg-card/70"
                            : "border-border/70 bg-card/40",
                      )}
                    >
                      <span
                        className={cn(
                          "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
                          isActive
                            ? "border-primary/50 bg-primary/15 text-primary"
                            : touched
                              ? "border-primary/25 bg-primary/8 text-primary/80"
                              : "border-border bg-muted/60 text-muted-foreground",
                        )}
                      >
                        {isActive ? (
                          <Icon className="h-4 w-4 animate-pulse" />
                        ) : touched ? (
                          <CheckCircle2 className="h-4 w-4 text-primary/80" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[10px] text-muted-foreground/70">
                            L{i + 1}
                          </span>
                          <h3 className="font-display text-sm font-semibold">{layer.name}</h3>
                          {isActive && (
                            <span className="gos-pulse-dot ml-auto h-2 w-2 rounded-full bg-primary" />
                          )}
                          {!isActive && layerStat(layer.id) && (
                            <span className="ml-auto rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                              {layerStat(layer.id)}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 truncate font-mono text-[11px] text-primary/80">
                          {layer.role}
                        </p>
                        {isActive && liveDetail ? (
                          <p className="gos-rise mt-1 font-mono text-[11px] text-foreground/80">
                            → {liveDetail}
                          </p>
                        ) : (
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                            {layer.detail}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>
          </section>

          {/* right column */}
          <div className="space-y-5">
            {/* tool registry */}
            <section aria-label="Tool registry" className="rounded-xl border border-border/70 bg-card/40 p-4">
              <SectionLabel>tool registry</SectionLabel>
              <ul className="mt-3 space-y-2">
                {TOOLS.map((t) => {
                  const used = intentCount(t.intent)
                  return (
                    <li
                      key={t.id}
                      className={cn(
                        "flex items-start gap-2.5 rounded-lg border p-2.5 transition-colors",
                        activeLayer === "tools" && used >= 0
                          ? "border-primary/30 bg-accent/40"
                          : "border-border/60 bg-background/50",
                      )}
                    >
                      <Terminal className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/80" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <code className="font-mono text-xs font-semibold">{t.id}</code>
                          {used > 0 && (
                            <span className="rounded bg-muted px-1.5 font-mono text-[9px] text-muted-foreground">
                              ×{used}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{t.desc}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>

            {/* recent runs */}
            <section aria-label="Recent runs" className="rounded-xl border border-border/70 bg-card/40 p-4">
              <SectionLabel>run feed</SectionLabel>
              {stats && stats.recentRuns.length > 0 ? (
                <ul className="gos-scroll mt-3 max-h-56 space-y-1.5 overflow-y-auto pr-1">
                  {stats.recentRuns.map((r) => (
                    <li
                      key={r.id}
                      className="flex items-center gap-2 rounded-lg border border-border/50 bg-background/50 px-2.5 py-2"
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 shrink-0 rounded-full",
                          r.success ? "bg-primary" : "bg-destructive",
                        )}
                      />
                      <span className="min-w-0 flex-1 truncate text-xs">{r.task}</span>
                      <Badge variant="outline" className="shrink-0 px-1.5 font-mono text-[9px] uppercase">
                        {r.intent.replace("_", " ")}
                      </Badge>
                      <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                        {(r.durationMs / 1000).toFixed(1)}s
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 rounded-lg border border-dashed border-border/70 p-4 text-center font-mono text-[11px] text-muted-foreground">
                  no runs yet — the loop is warm and waiting
                </p>
              )}
            </section>

            {/* memory bank */}
            <section aria-label="Memory bank" className="rounded-xl border border-border/70 bg-card/40 p-4">
              <SectionLabel>memory bank</SectionLabel>
              {stats && stats.memoriesList.length > 0 ? (
                <ul className="gos-scroll mt-3 max-h-48 space-y-1.5 overflow-y-auto pr-1">
                  {stats.memoriesList.map((m) => (
                    <li
                      key={m.id}
                      className="rounded-lg border border-border/50 bg-background/50 px-2.5 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-primary/10 px-1.5 font-mono text-[9px] uppercase text-primary">
                          {m.scope}
                        </span>
                        <code className="font-mono text-[11px] text-muted-foreground">{m.key}</code>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-snug">{m.body}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 rounded-lg border border-dashed border-border/70 p-4 text-center font-mono text-[11px] text-muted-foreground">
                  empty — say &quot;remember…&quot; in chat to write the first fact
                </p>
              )}
            </section>
          </div>
        </div>

        {/* skills strip */}
        <section aria-label="Integrated skills" className="mt-6">
          <SectionLabel>skills · nine integrated repos</SectionLabel>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {REPO_INTEGRATIONS.map((r) => (
              <div
                key={r.id}
                className="group rounded-xl border border-border/70 bg-card/40 p-3 transition-colors hover:border-primary/30 hover:bg-accent/30"
              >
                <div className="flex items-center gap-2">
                  <Boxes className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                  <span className="truncate font-mono text-xs font-semibold">{r.repo}</span>
                  <span
                    className={cn(
                      "ml-auto shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px] uppercase",
                      r.status === "active" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {r.status}
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">{r.role}</p>
                <p className="mt-1 font-mono text-[10px] text-primary/60">→ {r.layer} layer</p>
              </div>
            ))}
          </div>
        </section>

        {/* footer note */}
        <p className="mt-8 flex items-center justify-center gap-2 text-center font-mono text-[10px] text-muted-foreground/60">
          <Sparkles className="h-3 w-3" />
          same model + own skills + own tools + own memory + strict verification = output nobody else can reproduce
        </p>
      </div>
    </div>
  )
}

// ─── small pieces ─────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80">
      {children}
    </p>
  )
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-card/40 px-3.5 py-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="font-mono text-[10px] uppercase tracking-widest">{label}</span>
      </div>
      <p className="mt-1 font-display text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  )
}
