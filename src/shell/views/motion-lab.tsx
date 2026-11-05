"use client"

/**
 * MotionLabView — layer two of the merged system: the Motion Lab.
 *
 * Nineteen master skills distilled from five public sources (Emil
 * Kowalski, GSAP, Remotion, Wiggle, iArt AI) into ONE grammar —
 * engine/motion-craft.ts — with eleven live stages you can scrub, race,
 * shuffle and feel by hand.
 *
 * The same registry is served to ANY agent at /api/skills in three
 * formats (json · tools · md) — the strip at the top of this view fetches
 * it live, so what you read here is exactly what an external agent gets.
 *
 * Deep-linkable (#/motion/<demo>), rendered through the edition tokens,
 * and every stage honours the OS motion nuke + prefers-reduced-motion:
 * when motion is off the stages render their final frame, complete.
 */

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react"
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion"
import gsap from "gsap"
import {
  ArrowDownUp,
  ArrowLeftRight,
  Bell,
  Clapperboard,
  ExternalLink,
  Film,
  Fingerprint,
  Gauge,
  Gem,
  LayoutGrid,
  MousePointerClick,
  Orbit,
  Waves,
  type LucideIcon,
} from "lucide-react"
import { MOTION_DEMOS, go, href, type MotionDemoId } from "@/engine/nav"
import {
  MOTION_SKILLS,
  SKILL_SOURCES,
  type SkillSourceId,
} from "@/engine/motion-skills"
import { CURVES, DURATIONS, SPRINGS } from "@/engine/motion-craft"
import {
  BrandMotionPanel,
  GlassPanel,
  MagneticWrap,
  WiggleText,
  useStill,
} from "@/modules/kit/advanced-motion"
import { useEdition } from "../edition-provider"
import { cn } from "@/lib/utils"

/* ── the stage registry ────────────────────────────────────────────── */

interface DemoDef {
  id: MotionDemoId
  name: string
  source: SkillSourceId
  icon: LucideIcon
  note: string
}

const DEMOS: DemoDef[] = [
  { id: "feel", name: "The Feel System", source: "emil", icon: Gauge, note: "Race the curves, press the springs — the exact values, never approximated." },
  { id: "presence", name: "Enter · Exit", source: "emil", icon: Bell, note: "Symmetric paths, retargeting transitions, 30–80ms stagger." },
  { id: "timeline", name: "Timeline Scrubber", source: "gsap", icon: Film, note: "A three-act choreography with labels — play, reverse, scrub by hand." },
  { id: "stagger-grid", name: "Stagger Sweeps", source: "gsap", icon: LayoutGrid, note: "One grid, three gestures: each, ripple from center, matrix sweep." },
  { id: "scrolltrack", name: "Scroll Track", source: "gsap", icon: ArrowDownUp, note: "The scrollbar is the playhead — parallax layers at different rates." },
  { id: "compositor", name: "The Compositor", source: "remotion", icon: Clapperboard, note: "Remotion-style tracks and a frame clock — deterministic, renderable." },
  { id: "personalities", name: "Brand Personalities", source: "wiggle", icon: Fingerprint, note: "Corporate · organic · bold · cinematic — four motions, four brands." },
  { id: "wiggle-text", name: "The Wiggle", source: "wiggle", icon: Waves, note: "Per-letter springs with phase offsets — the signature move, live controls." },
  { id: "micro", name: "Micro-Interactions", source: "iart", icon: MousePointerClick, note: "Magnetic pull, the like burst, layout reorder — 100–250ms feedback." },
  { id: "transitions", name: "Page Transitions", source: "iart", icon: ArrowLeftRight, note: "Shared axis, crossfade, exit-through-enter — the seam as a surface." },
  { id: "glass", name: "Glassmorphism", source: "iart", icon: Gem, note: "Backdrop blur, layered translucency — depth without weight." },
]

const sourceOf = (id: SkillSourceId) => SKILL_SOURCES.find((s) => s.id === id)!

/* ── small shared bits ─────────────────────────────────────────────── */

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <span className="inline-flex items-baseline gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 shadow-sm">
      <b className="font-mono text-sm font-bold text-primary">{v}</b>
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{k}</span>
    </span>
  )
}

function StageNote({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-[11.5px] leading-relaxed text-muted-foreground">{children}</p>
}

const btn =
  "inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors hover:bg-accent disabled:opacity-50"
const chip =
  "inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors"

/* ══ the view ══════════════════════════════════════════════════════ */

export function MotionLabView({ demo }: { demo: string | null }) {
  const { edition } = useEdition()
  const still = useStill()

  const active: MotionDemoId = (MOTION_DEMOS as readonly string[]).includes(demo ?? "")
    ? (demo as MotionDemoId)
    : "feel"

  const fontVars = {
    "--ed-font-display": edition.fonts.display,
    "--ed-font-body": edition.fonts.body,
  } as CSSProperties

  const gradientText: CSSProperties = {
    backgroundImage: "linear-gradient(100deg, var(--primary) 0%, var(--accent) 55%, var(--primary) 100%)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  }

  const bound = useMemo(() => MOTION_SKILLS.filter((s) => s.demo === active), [active])

  return (
    <div className="h-full min-h-0 overflow-y-auto overscroll-contain" style={fontVars}>
      <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        {/* ── header ── */}
        <header className="flex flex-col gap-4">
          <div className="min-w-0">
            <p className="ed-eyebrow flex items-center gap-2">
              <Orbit className="size-3.5 text-primary" aria-hidden />
              The Motion Intelligence layer · layer two of the merged system
            </p>
            <h1 className="ed-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl" style={gradientText}>
              Motion Lab — five master skills, one grammar.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Nineteen skills distilled from five public sources into one runtime —{" "}
              <span className="font-medium text-foreground">curves, springs, timelines, brand personalities</span>.
              Every stage below is live: scrub it, race it, feel it. The same registry is served to{" "}
              <span className="font-medium text-foreground">any agent</span> at one URL.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Stat k="sources" v={String(SKILL_SOURCES.length)} />
            <Stat k="skills" v={String(MOTION_SKILLS.length)} />
            <Stat k="live stages" v={String(DEMOS.length)} />
            <Stat k="manifest formats" v="3" />
          </div>
        </header>

        {/* ── the any-agent strip ── */}
        <AgentStrip />

        {/* ── the five sources ── */}
        <section className="mt-8" aria-label="The five master sources">
          <h2 className="ed-display text-lg font-semibold tracking-tight">The five master sources</h2>
          <p className="mt-1 text-sm text-muted-foreground">Distilled with credit — every principle traceable to its origin.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {SKILL_SOURCES.map((s) => {
              const n = MOTION_SKILLS.filter((m) => m.source.url === s.url).length
              return (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ background: s.accent }} aria-hidden />
                    <span className="text-xs font-bold leading-tight">{s.label}</span>
                  </div>
                  <p className="mt-2 text-[11px] leading-snug text-muted-foreground">{s.note}</p>
                  <p className="mt-3 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                    <span>{n} skills distilled</span>
                    <ExternalLink className="size-3 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                  </p>
                </a>
              )
            })}
          </div>
        </section>

        {/* ── the stages ── */}
        <section className="mt-10 grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)]" aria-label="Live stages">
          {/* rail */}
          <nav className="lab-rail" aria-label="Stages">
            {DEMOS.map((d) => {
              const s = sourceOf(d.source)
              const on = d.id === active
              return (
                <button
                  key={d.id}
                  type="button"
                  className={cn("lab-chip", on && "on")}
                  aria-current={on ? "page" : undefined}
                  onClick={() => go(`/motion/${d.id}`)}
                >
                  <span className="dot" style={{ background: s.accent }} aria-hidden />
                  <d.icon className="size-4 shrink-0" aria-hidden />
                  <span className="min-w-0">
                    <span className="block truncate">{d.name}</span>
                    <span className="block truncate text-[10px] font-medium text-muted-foreground">{s.label.split(" — ")[0]}</span>
                  </span>
                </button>
              )
            })}
          </nav>

          {/* the active stage */}
          <div className="lab-stage p-5 sm:p-6">
            {(() => {
              const def = DEMOS.find((d) => d.id === active)!
              const src = sourceOf(def.source)
              return (
                <div key={active} className="animate-in fade-in duration-300">
                  <header className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <def.icon className="size-4 text-primary" aria-hidden />
                    <h3 className="ed-display text-xl font-semibold tracking-tight">{def.name}</h3>
                    <span
                      className="ml-auto inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: src.accent, borderColor: `${src.accent}55` }}
                    >
                      <span className="size-1.5 rounded-full" style={{ background: src.accent }} aria-hidden />
                      {src.label}
                    </span>
                  </header>
                  <p className="mt-1 text-sm text-muted-foreground">{def.note}</p>

                  <div className="relative z-10 mt-5">
                    {active === "feel" && <FeelStage />}
                    {active === "presence" && <PresenceStage />}
                    {active === "timeline" && <TimelineStage />}
                    {active === "stagger-grid" && <StaggerStage />}
                    {active === "scrolltrack" && <ScrollTrackStage />}
                    {active === "compositor" && <CompositorStage />}
                    {active === "personalities" && <PersonalitiesStage />}
                    {active === "wiggle-text" && <WiggleStage />}
                    {active === "micro" && <MicroStage />}
                    {active === "transitions" && <TransitionsStage />}
                    {active === "glass" && <GlassStage />}
                  </div>

                  {still && (
                    <p className="relative z-10 mt-4 rounded-lg border border-dashed px-3 py-2 text-[11px] text-muted-foreground">
                      Motion is off — this stage shows its final frame, complete. The 60fps contract keeps working for
                      everyone: fewer and gentler, never broken.
                    </p>
                  )}

                  {/* bound skills — the manifest bridge */}
                  <footer className="relative z-10 mt-6 flex flex-wrap items-center gap-2 border-t pt-4">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">bound skills</span>
                    {bound.map((s) => (
                      <a key={s.id} href={`/api/skills/${s.id}?format=md`} target="_blank" rel="noopener noreferrer" className={cn(chip, "bg-card hover:bg-accent")}>
                        <ExternalLink className="size-3 text-primary" aria-hidden />
                        {s.name}
                      </a>
                    ))}
                    <a href={href(`/motion/${active}`)} className={cn(chip, "ml-auto bg-card font-mono hover:bg-accent")} title="The canonical deep link">
                      #{`/motion/${active}`}
                    </a>
                  </footer>
                </div>
              )
            })()}
          </div>
        </section>

        {/* ── the ai bridge ── */}
        <section className="mt-10 rounded-2xl border bg-card p-5 sm:p-6 shadow-sm" aria-label="The unified stack">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <h2 className="ed-display text-lg font-semibold tracking-tight">Two layers, one stack</h2>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Layer one reasons, layer two moves. An agent that can read a manifest can drive both — and the motion
                layer feeds the video engine the same grammar it renders live here.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={cn(btn, "hover:bg-accent")} onClick={() => go("/ai")}>
                <Orbit className="size-3.5" aria-hidden /> Layer one — AI Studio
              </button>
              <a href="/api/skills?format=md" target="_blank" rel="noopener noreferrer" className={btn}>
                <ExternalLink className="size-3.5" aria-hidden /> The whole registry, as markdown
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

/* ══ the any-agent strip ═══════════════════════════════════════════ */

function AgentStrip() {
  const [format, setFormat] = useState<"json" | "tools" | "md" | "skillmd">("tools")
  const [snippet, setSnippet] = useState<{ format: string; text: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const url = `/api/skills?format=${format}`

  useEffect(() => {
    const ctrl = new AbortController()
    let done = false
    fetch(url, { signal: ctrl.signal })
      .then((r) => r.text())
      .then((t) => {
        done = true
        setSnippet({ format, text: t.slice(0, 560) })
      })
      .catch(() => {
        done = true
        setSnippet({ format, text: "// unreachable — the dev server should be up" })
      })
    return () => {
      if (!done) ctrl.abort()
    }
  }, [format, url])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <section
      className="mt-6 rounded-2xl border bg-card p-5 shadow-sm sm:p-6"
      aria-label="The any-agent manifest API"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="ed-display text-lg font-semibold tracking-tight">One URL, every agent</h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            The full registry — 19 motion skills + the 8 AI engine skills — served in four formats. Claude, GPT,
            LangChain, n8n, a local model: no SDK, no dialect, no lock-in. CORS open, cache never.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Manifest format">
          {(["json", "tools", "md", "skillmd"] as const).map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={format === f}
              onClick={() => setFormat(f)}
              className={cn(
                "rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition-colors",
                format === f ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-accent",
              )}
            >
              ?format={f}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-lg border bg-muted/50 px-3 py-2 font-mono text-xs">
          <span className="font-bold text-primary">GET</span> {url}
        </code>
        <button type="button" className={btn} onClick={copy}>
          {copied ? "Copied ✓" : "Copy URL"}
        </button>
        <a href={url} target="_blank" rel="noopener noreferrer" className={btn}>
          <ExternalLink className="size-3.5" aria-hidden /> Open raw
        </a>
      </div>

      <pre className="factory-scroll mt-3 max-h-36 overflow-auto whitespace-pre-wrap break-all rounded-lg border bg-muted/40 p-3 font-mono text-[10px] leading-relaxed text-muted-foreground" aria-live="polite">
        {snippet && snippet.format === format ? snippet.text : "// fetching…"}
      </pre>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] text-muted-foreground">
        <span>27 skills</span>
        <span>·</span>
        <span>5 sources</span>
        <span>·</span>
        <span>OpenAI tools / agent markdown / plain json / portable SKILL.md files</span>
        <span>·</span>
        <span>Access-Control-Allow-Origin: *</span>
      </div>
    </section>
  )
}

/* ══ stage 01 · the feel system ════════════════════════════════════ */

function FeelStage() {
  const still = useStill()
  const trackRef = useRef<HTMLDivElement>(null)
  const [distance, setDistance] = useState(240)
  const [ms, setMs] = useState(250)
  const [go, setGo] = useState(false)

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const measure = () => setDistance(Math.max(80, el.clientWidth - 24))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const lanes: { id: keyof typeof CURVES; note: string }[] = [
    { id: "ease-out", note: "entrances & exits — the default" },
    { id: "enter", note: "fast pickup, long glide" },
    { id: "overshoot", note: "playful arrivals only" },
    { id: "standard", note: "generic movement" },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">duration</span>
        {[150, 250, 500].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setMs(v)}
            className={cn(chip, ms === v ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-accent")}
          >
            {v}ms{v === 500 ? " · marketing only" : ""}
          </button>
        ))}
        <button type="button" className={cn(btn, "ml-auto")} onClick={() => setGo((g) => !g)}>
          {go ? "Reset" : "Race"}
        </button>
      </div>

      <div ref={trackRef} className="space-y-2">
        {lanes.map(({ id, note }) => {
          const c = CURVES[id]
          return (
            <div key={id}>
              <div className="lab-lane">
                <span className="absolute left-2 top-1 z-10 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{id}</span>
                {!still ? (
                  <motion.span
                    className="runner bg-primary shadow-sm"
                    animate={{ x: go ? distance : 0 }}
                    transition={{ duration: ms / 1000, ease: c.motion }}
                  />
                ) : (
                  <span className="runner bg-primary shadow-sm" style={{ transform: go ? `translateX(${distance}px)` : undefined }} />
                )}
              </div>
              <p className="mt-1 flex flex-wrap justify-between gap-2 font-mono text-[9.5px] text-muted-foreground">
                <span>{c.css}</span>
                <span>{note}</span>
              </p>
            </div>
          )
        })}
      </div>

      <div>
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          springs — press and hold to feel the difference
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {Object.values(SPRINGS).map((s, i) => (
            <motion.button
              key={s.id}
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: i === 2 ? 12 : 30 }}
              className="rounded-xl border bg-card px-4 py-3 text-left shadow-sm"
            >
              <span className="block text-xs font-bold">{s.label}</span>
              <span className="block font-mono text-[10px] text-muted-foreground">
                {s.id === "apple" ? "duration .5 · bounce .2" : s.id === "layout" ? "500 / 40" : s.id === "alive" ? "400 / 12" : "400 / 30"}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      <StageNote>
        UI stays under {DURATIONS.map((d) => `${d.id} ${d.ms[0]}–${d.ms[1]}ms`).join(" · ")}. Ease-out at 200ms feels
        faster than ease-in at 200ms — the values are the skill.
      </StageNote>
    </div>
  )
}

/* ══ stage 02 · presence ═══════════════════════════════════════════ */

interface Toast {
  id: number
  kind: "success" | "info" | "error"
  text: string
}
let toastSeq = 0

function PresenceStage() {
  const still = useStill()
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = (kind: Toast["kind"], text: string) => {
    const id = ++toastSeq
    setToasts((t) => [...t.slice(-4), { id, kind, text }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600)
  }
  const burst = () => {
    for (let i = 0; i < 3; i++) setTimeout(() => push("info", `burst ${i + 1} — retarget, never restart`), i * 220)
  }

  const tone: Record<Toast["kind"], string> = {
    success: "border-l-emerald-500",
    info: "border-l-sky-500",
    error: "border-l-rose-500",
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btn} onClick={() => push("success", "Saved — enter bottom, exit bottom")}>
          Success
        </button>
        <button type="button" className={btn} onClick={() => push("error", "Failed — symmetric path home")}>
          Error
        </button>
        <button type="button" className={btn} onClick={() => push("info", "Heads up — transitions, not keyframes")}>
          Info
        </button>
        <button type="button" className={cn(btn, "ml-auto")} onClick={burst}>
          Fire ×3 rapidly
        </button>
      </div>

      <div className="relative min-h-44 overflow-hidden rounded-xl border bg-muted/30 p-4" aria-live="polite">
        {still ? (
          <div className="space-y-2">
            {toasts.map((t) => (
              <div key={t.id} className={cn("rounded-lg border border-l-4 bg-card px-3 py-2 text-xs shadow-sm", tone[t.kind])}>
                {t.text}
              </div>
            ))}
            {!toasts.length && <p className="p-2 text-xs text-muted-foreground">The feed is quiet — fire one.</p>}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.97 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className={cn("mb-2 rounded-lg border border-l-4 bg-card px-3 py-2 text-xs shadow-sm", tone[t.kind])}
              >
                {t.text}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {!toasts.length && !still && <p className="absolute inset-0 grid place-items-center text-xs text-muted-foreground">The feed is quiet — fire one.</p>}
      </div>

      <StageNote>
        Exits mirror entrances — a toast that slides in from the bottom leaves through the bottom. popLayout lets
        leaving toasts hold no space; transitions retarget from the current value, so rapid fire never restarts from
        zero.
      </StageNote>
    </div>
  )
}

/* ══ stage 03 · timeline ═══════════════════════════════════════════ */

function TimelineStage() {
  const still = useStill()
  const rootRef = useRef<HTMLDivElement>(null)
  const [prog, setProg] = useState(0)
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    if (still || !rootRef.current) return
    const q = (sel: string) => rootRef.current!.querySelector(sel) as HTMLElement
    const tl = gsap.timeline({
      paused: true,
      defaults: { duration: 0.6, ease: "power3.out" },
      onUpdate: () => setProg(tl.progress()),
    })
    tl.addLabel("curtain")
      .from(q(".tl-veil"), { scaleY: 1, transformOrigin: "top" }, "curtain")
      .from(q(".tl-title"), { y: 26, opacity: 0 }, "curtain+=0.15")
      .addLabel("cast")
      .from(q(".tl-sub"), { y: 18, opacity: 0 }, "cast")
      .from(q(".tl-cta"), { scale: 0.94, opacity: 0 }, "cast+=0.1")
      .addLabel("lights")
      .to(q(".tl-veil"), { display: "none" }, "lights")
    tl.progress(1).progress(0)
    tlRef.current = tl
    return () => {
      tl.kill()
      tlRef.current = null
    }
  }, [still])

  const jump = (label: string) => tlRef.current?.play(label)

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-xl border bg-card">
        <div ref={rootRef} className="relative h-44">
          <div className="tl-veil absolute inset-0 bg-primary/15" />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="tl-title text-lg font-bold tracking-tight">The three-act build</p>
            <p className="tl-sub max-w-sm text-xs text-muted-foreground">Curtain → cast → lights. Labels make it readable; reverse is free.</p>
            <span className="tl-cta mt-1 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm">Scrub me</span>
          </div>
        </div>
      </div>

      {!still && (
        <>
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={prog}
            aria-label="Scrub the timeline"
            onChange={(e) => {
              const v = Number(e.target.value)
              tlRef.current?.progress(v)
              setProg(v)
            }}
            className="w-full accent-[var(--primary)]"
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" className={btn} onClick={() => tlRef.current?.play()}>Play</button>
            <button type="button" className={btn} onClick={() => tlRef.current?.reverse()}>Reverse</button>
            <button type="button" className={btn} onClick={() => tlRef.current?.restart()}>Restart</button>
            <span className="mx-1 w-px bg-border" />
            {["curtain", "cast", "lights"].map((l) => (
              <button key={l} type="button" className={cn(chip, "bg-card font-mono hover:bg-accent")} onClick={() => jump(l)}>
                play(“{l}”)
              </button>
            ))}
            <span className="ml-auto self-center font-mono text-[10px] text-muted-foreground">
              progress {prog.toFixed(3)}
            </span>
          </div>
        </>
      )}

      <StageNote>
        The position parameter places every tween absolutely, relatively, or at a label —{" "}
        <code className="font-mono">“curtain+=0.15”</code> starts 0.15s after the curtain label. One timeline, auditable
        and scrubbable; delays drift, timelines don’t.
      </StageNote>
    </div>
  )
}

/* ══ stage 04 · stagger ════════════════════════════════════════════ */

type StagPattern = "each" | "center" | "grid"

function StaggerStage() {
  const still = useStill()
  const gridRef = useRef<HTMLDivElement>(null)
  const [pattern, setPattern] = useState<StagPattern>("center")
  const [seq, setSeq] = useState(0)

  const cfgFor = (p: StagPattern) =>
    p === "each" ? "0.06" : p === "center" ? '{ each: 0.06, from: "center" }' : '{ grid: [3,3], from: "center", each: 0.07 }'

  const replay = () => {
    setSeq((s) => s + 1)
    if (still || !gridRef.current) return
    const tiles = gridRef.current.querySelectorAll(".st-tile")
    gsap.killTweensOf(tiles)
    gsap.from(tiles, {
      opacity: 0,
      y: 18,
      scale: 0.92,
      duration: 0.5,
      ease: "power3.out",
      stagger:
        pattern === "each"
          ? 0.06
          : pattern === "center"
            ? { each: 0.06, from: "center" }
            : { grid: [3, 3], from: "center", each: 0.07 },
      overwrite: "auto",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(["each", "center", "grid"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPattern(p)}
            className={cn(chip, pattern === p ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-accent")}
          >
            {p === "each" ? "each" : p === "center" ? "ripple from center" : "grid sweep"}
          </button>
        ))}
        <button type="button" className={cn(btn, "ml-auto")} onClick={replay}>
          Replay
        </button>
      </div>

      <div key={seq} ref={gridRef} className="grid max-w-md grid-cols-3 gap-2.5">
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} className="st-tile flex h-20 items-center justify-center rounded-xl border bg-card text-sm font-bold shadow-sm">
            {i + 1}
          </div>
        ))}
      </div>

      <pre className="factory-scroll overflow-x-auto rounded-lg border bg-muted/40 p-3 font-mono text-[10px] leading-relaxed text-muted-foreground">{`gsap.from('.tile', {
  opacity: 0, y: 18, scale: 0.92,
  duration: 0.5, ease: 'power3.out',
  stagger: ${cfgFor(pattern)},
})`}</pre>

      <StageNote>
        30–80ms apart is the sweet spot — faster reads as one block, slower reads as lag. The ripple from center is
        the same gesture as the grid sweep, just radial.
      </StageNote>
    </div>
  )
}

/* ══ stage 05 · scroll track ═══════════════════════════════════════ */

function ScrollTrackStage() {
  const still = useStill()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ container: ref })
  const [pct, setPct] = useState(0)
  useMotionValueEvent(scrollYProgress, "change", (v) => setPct(Math.round(v * 100)))

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "-16%"])
  const fgY = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"])
  const fgO = useTransform(scrollYProgress, [0, 0.7, 1], [1, 1, 0.25])

  return (
    <div className="space-y-4">
      <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        scroll inside the frame ↓ {still ? "(motion off — layers hold)" : ""}
      </p>
      <div
        ref={ref}
        className="relative h-72 overflow-y-auto rounded-xl border factory-scroll"
        aria-label="Scroll-driven parallax frame"
      >
        <div className="relative h-[260%]">
          <div className="sticky top-0 h-72 overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-[radial-gradient(120%_100%_at_20%_10%,--alpha(var(--color-primary)/18%),transparent 55%)]"
              style={still ? undefined : { y: bgY }}
            />
            <motion.div className="absolute inset-x-0 top-16 px-8 text-center" style={still ? undefined : { y: fgY, opacity: fgO }}>
              <p className="text-xl font-bold tracking-tight">The scrollbar is the playhead</p>
              <p className="mt-2 max-w-sm mx-auto text-xs text-muted-foreground">
                Background drifts at −16%, foreground at −10% — two rates on one progress. Pin the stage; let the
                layers move.
              </p>
            </motion.div>
            <div className="absolute inset-x-0 bottom-4 flex justify-center">
              <span className="rounded-full border bg-card/80 px-3 py-1 font-mono text-[10px] backdrop-blur">
                progress {pct}%
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-muted/50">
              <motion.div className="h-full origin-left bg-primary" style={still ? { scaleX: pct / 100 || 0, transform: "none", width: `${pct}%` } : { scaleX: scrollYProgress }} />
            </div>
          </div>
          <div className="spacer h-[160%]" aria-hidden />
        </div>
      </div>
      <StageNote>
        scrub: 1 maps the playhead 1:1 to scroll; scrub: 0.6 lags behind — smoother feel. ScrollTrigger on the
        timeline, never on tweens inside it.
      </StageNote>
    </div>
  )
}

/* ══ stage 06 · the compositor ═════════════════════════════════════ */

const COMP_TRACKS = [
  { name: "Curtain", color: "#8848ee", from: 0, to: 30 },
  { name: "Title", color: "#0a9396", from: 12, to: 48 },
  { name: "Bars", color: "#f59e0b", from: 24, to: 60 },
] as const
const COMP_FPS = 30
const COMP_FRAMES = 60

function CompositorStage() {
  const still = useStill()
  const rootRef = useRef<HTMLDivElement>(null)
  const [frame, setFrame] = useState(0)
  const [playing, setPlaying] = useState(false)
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    if (still || !rootRef.current) return
    const q = (s: string) => rootRef.current!.querySelector(s) as HTMLElement
    const tl = gsap.timeline({
      paused: true,
      onUpdate: () => setFrame(Math.round(tl.progress() * COMP_FRAMES)),
      onReverseComplete: () => setFrame(0),
    })
    tl.set(q(".cp-curtain"), { transformOrigin: "top", scaleY: 1 })
      .to(q(".cp-curtain"), { scaleY: 0, duration: 1, ease: "power2.inOut" }, 0)
      .from(q(".cp-title"), { scale: 0.9, opacity: 0, y: 12, duration: 1.2, ease: "back.out(1.4)" }, 0.4)
      .from(q(".cp-bar"), { scaleY: 0.15, transformOrigin: "bottom", duration: 0.5, ease: "power3.out", stagger: 0.05 }, 0.8)
    tl.progress(1).progress(0)
    tlRef.current = tl
    return () => {
      tl.kill()
      tlRef.current = null
    }
  }, [still])

  const toggle = () => {
    const tl = tlRef.current
    if (!tl) return
    if (playing) {
      tl.pause()
      setPlaying(false)
    } else {
      if (tl.progress() >= 1) tl.progress(0)
      tl.play()
      setPlaying(true)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={btn} onClick={toggle} disabled={still}>
          {playing ? "Pause" : frame >= COMP_FRAMES ? "Replay" : "Play"}
        </button>
        <span className="font-mono text-[11px] text-muted-foreground">
          f {frame} / {COMP_FRAMES} · {COMP_FPS}fps · 2.0s
        </span>
        <span className="ml-auto rounded-full border bg-card px-2.5 py-1 font-mono text-[10px] text-muted-foreground">
          deterministic — same frame in, same pixels out
        </span>
      </div>

      {/* the preview */}
      <div ref={rootRef} className="relative h-40 overflow-hidden rounded-xl border bg-zinc-950">
        <div className="cp-curtain absolute inset-0 bg-[linear-gradient(120deg,#8848ee33,#0b0d12)]" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3">
          <p className="cp-title text-lg font-bold tracking-[0.2em] text-zinc-100">THE REEL</p>
          <div className="flex items-end gap-1.5">
            {[0.9, 0.6, 0.8, 0.5, 0.75, 0.55, 0.85].map((h, i) => (
              <span key={i} className="cp-bar w-2 rounded-full bg-amber-500" style={{ height: 8 + h * 26 }} />
            ))}
          </div>
        </div>
      </div>

      {/* the tracks */}
      <div className="space-y-1.5" role="img" aria-label="Composition tracks">
        {COMP_TRACKS.map((t) => (
          <div key={t.name} className="flex items-center gap-3">
            <span className="w-14 shrink-0 text-right font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{t.name}</span>
            <div className="relative h-5 flex-1 rounded-md bg-muted/50">
              <span
                className="absolute top-0 h-full rounded-md opacity-80"
                style={{ left: `${(t.from / COMP_FRAMES) * 100}%`, width: `${((t.to - t.from) / COMP_FRAMES) * 100}%`, background: t.color }}
              />
            </div>
          </div>
        ))}
        <div className="relative h-0">
          <span className="absolute top-0 h-8 w-px bg-primary" style={{ left: `calc(3.5rem + (100% - 3.5rem) * ${frame / COMP_FRAMES})` }} />
        </div>
      </div>

      <StageNote>
        Sequences are tracks with from/to; spring() and interpolate() are first-class values over useCurrentFrame().
        The Player plays this in the browser — the server renders the identical frames to MP4. That determinism is the
        whole pipeline.
      </StageNote>
    </div>
  )
}

/* ══ stage 07 · personalities ══════════════════════════════════════ */

function PersonalitiesStage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {["personality → who the brand is", "emotion → what motion evokes", "metaphor → how it moves"].map((q, i) => (
          <span key={q} className={cn(chip, "bg-card")}>
            <span className="font-mono text-primary">{i + 1}.</span> {q}
          </span>
        ))}
      </div>
      <BrandMotionPanel />
      <StageNote>
        Thirty seconds of philosophy before any keyframe — it saves fifteen minutes of iteration. Corporate ≠ startup
        ≠ audio brand: match the motion to the brand or don’t ship it.
      </StageNote>
    </div>
  )
}

/* ══ stage 08 · the wiggle ═════════════════════════════════════════ */

function WiggleStage() {
  const still = useStill()
  const [text, setText] = useState("Growth OS")
  const [mode, setMode] = useState<"enter" | "loop">("loop")
  const [amp, setAmp] = useState(10)
  const [each, setEach] = useState(0.07)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 24))}
          placeholder="type a headline"
          aria-label="Wiggle text"
          className="h-9 w-48 rounded-lg border bg-card px-3 text-sm shadow-sm"
        />
        <div className="flex gap-1.5">
          {(["enter", "loop"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(chip, mode === m ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-accent")}
            >
              {m === "enter" ? "entrance (once)" : "loop (the wave)"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex min-w-40 items-center gap-3 text-xs text-muted-foreground">
          amplitude {amp}px
          <input type="range" min={4} max={24} value={amp} onChange={(e) => setAmp(Number(e.target.value))} className="w-32 accent-[var(--primary)]" />
        </label>
        <label className="flex min-w-40 items-center gap-3 text-xs text-muted-foreground">
          phase {each.toFixed(2)}s/letter
          <input type="range" min={0.03} max={0.14} step={0.01} value={each} onChange={(e) => setEach(Number(e.target.value))} className="w-32 accent-[var(--primary)]" />
        </label>
      </div>

      <div className="grid min-h-32 place-items-center rounded-xl border bg-card p-6">
        {still ? (
          <span className="text-3xl font-black tracking-tight sm:text-4xl">{text || "…"}</span>
        ) : (
          <WiggleText
            key={`${mode}-${text}`}
            text={text || "…"}
            mode={mode}
            amplitude={amp}
            each={mode === "enter" ? 0.045 : each}
            className="text-3xl font-black tracking-tight sm:text-4xl"
          />
        )}
      </div>

      <pre className="factory-scroll overflow-x-auto rounded-lg border bg-muted/40 p-3 font-mono text-[10px] leading-relaxed text-muted-foreground">{`animate={{ y: [0, -${amp}, 0], rotate: [0, 4, 0] }}
transition={{ duration: 1.7, repeat: Infinity, delay: i * ${each.toFixed(2)} }}`}</pre>

      <StageNote>
        The phase offset IS the wiggle — letters, not blocks. 15 frames subtle · 30 frames noticeable (most common) ·
        45 frames dramatic two-act. Perfect loops need the last frame to equal the first.
      </StageNote>
    </div>
  )
}

/* ══ stage 09 · micro ══════════════════════════════════════════════ */

function MicroStage() {
  const still = useStill()
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(128)
  const [burst, setBurst] = useState(0)
  const [items, setItems] = useState(["First — layout animates any position change", "Second — reorder with springs 500/40", "Third — transform + opacity only", "Fourth — 100–250ms, felt before seen"])

  const shuffle = () => setItems((xs) => [...xs.slice(1), xs[0]])
  const tapLike = () => {
    if (liked) return
    setLiked(true)
    setLikes((n) => n + 1)
    setBurst((b) => b + 1)
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {/* magnetic */}
      <div className="rounded-xl border bg-card p-4">
        <p className="text-xs font-bold">Magnetic pull</p>
        <div className="mt-4 grid place-items-center py-4">
          <MagneticWrap radius={110} strength={0.4}>
            <span className="rounded-xl bg-primary px-5 py-3 text-xs font-bold text-primary-foreground shadow-md">
              Hover near me
            </span>
          </MagneticWrap>
        </div>
        <p className="font-mono text-[10px] leading-relaxed text-muted-foreground">
          leans toward the pointer · springs home · press 0.96 at 400/30
        </p>
      </div>

      {/* the like */}
      <div className="rounded-xl border bg-card p-4">
        <p className="text-xs font-bold">The like</p>
        <div className="relative mt-4 grid place-items-center py-4">
          <motion.button
            type="button"
            onClick={tapLike}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            aria-pressed={liked}
            aria-label="Like"
            className="relative z-10 flex size-14 items-center justify-center rounded-2xl border shadow-sm"
            style={{ borderColor: liked ? "#f43f5e66" : undefined, background: liked ? "#f43f5e14" : undefined }}
          >
            <motion.span
              animate={still ? undefined : { scale: liked ? 1.12 : 1 }}
              className={liked ? "text-rose-500" : "text-muted-foreground"}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </motion.span>
          </motion.button>
          {!still && (
            <AnimatePresence>
              {burst > 0 && (
                <motion.span
                  key={burst}
                  initial={{ scale: 0.9, opacity: 0.6 }}
                  animate={{ scale: 1.6, opacity: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="pointer-events-none absolute size-14 rounded-2xl border-2 border-rose-400"
                />
              )}
            </AnimatePresence>
          )}
          <span className="mt-3 rounded-full border bg-card px-2.5 py-1 font-mono text-[10px] text-muted-foreground">
            {likes} likes
          </span>
        </div>
        <p className="font-mono text-[10px] leading-relaxed text-muted-foreground">state, not decoration — one continuous morph</p>
      </div>

      {/* reorder */}
      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold">Layout reorder</p>
          <button type="button" className={cn(btn, "h-8 px-2.5")} onClick={shuffle}>
            Shuffle
          </button>
        </div>
        <ul className="mt-3 space-y-1.5">
          {items.map((it) => (
            <motion.li
              key={it}
              layout
              transition={still ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 40 }}
              className="rounded-lg border bg-muted/40 px-3 py-2 text-[11px] leading-snug"
            >
              {it}
            </motion.li>
          ))}
        </ul>
        <p className="mt-3 font-mono text-[10px] leading-relaxed text-muted-foreground">layout on the li — position changes animate through transforms</p>
      </div>
    </div>
  )
}

/* ══ stage 10 · transitions ════════════════════════════════════════ */

type TStyle = "axis" | "crossfade" | "overlap"

function TransitionsStage() {
  const still = useStill()
  const [style, setStyle] = useState<TStyle>("axis")
  const [page, setPage] = useState(0)

  const pages = [
    { title: "Overview", lines: "Spatial model: pages that sit beside each other slide on the shared axis." },
    { title: "Details", lines: "Hierarchical pages push; peers crossfade — continuity over teleporting." },
  ]
  const p = pages[page]

  const motionProps =
    style === "axis"
      ? { initial: { opacity: 0, x: 24 }, exit: { opacity: 0, x: -24 } }
      : style === "crossfade"
        ? { initial: { opacity: 0 }, exit: { opacity: 0, y: 8 } }
        : { initial: { opacity: 0, y: 16, scale: 0.98 }, exit: { opacity: 0, y: -12, scale: 0.98 } }

  const notes: Record<TStyle, string> = {
    axis: "shared axis — mode=\"wait\", x travel, 280ms ease-out family",
    crossfade: "crossfade — opacity only, the quietest swap",
    overlap: "exit-through-enter — no blank frame: the old leaves as the new arrives",
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(["axis", "crossfade", "overlap"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStyle(s)}
            className={cn(chip, style === s ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-accent")}
          >
            {s === "axis" ? "shared axis" : s}
          </button>
        ))}
        <button type="button" className={cn(btn, "ml-auto")} onClick={() => setPage((v) => (v + 1) % 2)}>
          Swap view
        </button>
      </div>

      <div className="relative min-h-40 overflow-hidden rounded-xl border bg-muted/30 p-4">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2 border-b pb-2">
            <span className="size-2 rounded-full bg-primary" aria-hidden />
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">the chrome stays pinned</span>
          </div>
          {still ? (
            <div key={page}>
              <p className="text-sm font-bold">{p.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{p.lines}</p>
            </div>
          ) : (
            <AnimatePresence mode={style === "overlap" ? "sync" : "wait"} initial={false}>
              <motion.div
                key={`${style}-${page}`}
                {...motionProps}
                transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
              >
                <p className="text-sm font-bold">{p.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{p.lines}</p>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      <StageNote>{notes[style]} — reduced motion: a 120ms opacity fade keeps the spatial logic for everyone.</StageNote>
    </div>
  )
}

/* ══ stage 11 · glass ══════════════════════════════════════════════ */

function GlassStage() {
  const still = useStill()
  const [blur, setBlur] = useState(18)
  const [radius, setRadius] = useState(18)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-6">
        <label className="flex min-w-40 items-center gap-3 text-xs text-muted-foreground">
          blur {blur}px
          <input type="range" min={6} max={30} value={blur} onChange={(e) => setBlur(Number(e.target.value))} className="w-32 accent-[var(--primary)]" aria-label="Backdrop blur" />
        </label>
        <label className="flex min-w-40 items-center gap-3 text-xs text-muted-foreground">
          radius {radius}px
          <input type="range" min={8} max={28} value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="w-32 accent-[var(--primary)]" aria-label="Corner radius" />
        </label>
      </div>

      <div className="relative h-64 overflow-hidden rounded-2xl border" style={{ background: "linear-gradient(135deg, #0f2e25 0%, #134e4a 45%, #1e3a5f 100%)" }}>
        {!still && (
          <>
            <motion.span
              className="absolute -left-10 top-6 size-44 rounded-full bg-emerald-400/35 blur-2xl"
              animate={{ x: [0, 46, -22, 0], y: [0, -34, 22, 0] }}
              transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden
            />
            <motion.span
              className="absolute bottom-2 right-4 size-52 rounded-full bg-rose-400/25 blur-2xl"
              animate={{ x: [0, -38, 18, 0], y: [0, 26, -18, 0] }}
              transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden
            />
          </>
        )}
        <div className="absolute inset-0 grid place-items-center p-6">
          <GlassPanel blur={blur} radius={radius} className="w-full max-w-sm p-5 text-zinc-50" >
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-300/90">GlassPanel</p>
            <p className="mt-1 text-lg font-bold tracking-tight text-white">Depth without weight</p>
            <p className="mt-2 text-xs leading-relaxed text-zinc-200/90">
              A translucent fill over backdrop-blur, one light border, an ambient shadow. Glass needs something behind
              it to refract — the orbs do that work here.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">blur {blur}px</span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">saturate 160%</span>
            </div>
          </GlassPanel>
        </div>
      </div>

      <StageNote>
        The recipe: fill 8–16% · backdrop-blur 12–24px · saturate 140–180% · 1px inner light border · soft ambient
        shadow. Text stays full opacity — the material dims, the content must not.
      </StageNote>
    </div>
  )
}
