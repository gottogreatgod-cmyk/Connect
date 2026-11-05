"use client"

/**
 * BuilderView — the Website Builder: the direct, anyone-can-use path.
 *
 * One flow, six steps, zero jargon:
 *
 *   brief    → describe the business, get honest template picks
 *   design   → live preview, one-click skins, shuffle the look
 *   content  → the business's own name/city/pitch → AI launch copy
 *   art      → per-section generations — hero image, brand mark,
 *              editorial still, cinematic reel, site voiceover
 *   motion   → four motion personalities, felt live, from the
 *              19-skill motion registry
 *   launch   → the assembled site + take-it-to-any-AI exports
 *
 * The whole build lives in a module-level store (useSyncExternalStore)
 * so navigating away and back never loses progress — running renders
 * keep polling in the background and settle into the store.
 *
 * Deep-linkable (#/build/<step>), plain language throughout, every
 * generation a REAL API call (image/video as background jobs, TTS and
 * copy synchronous).
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  AudioLines,
  BadgeCheck,
  Camera as CameraIcon,
  Check,
  Clapperboard,
  Copy,
  Dices,
  Download,
  ExternalLink,
  Film,
  Image as ImageIcon,
  LayoutGrid,
  Lightbulb,
  MessageSquare,
  Monitor,
  Music4,
  Orbit,
  Palette,
  PenLine,
  Play,
  Rocket,
  Smartphone,
  Sparkles,
  Square,
  Stamp,
  Wand2,
  type LucideIcon,
} from "lucide-react"
import { BUILDER_STEPS, go, href, type BuilderStepId } from "@/engine/nav"
import { CONCIERGE_CHIPS, askConcierge, type ConciergeAnswer } from "@/engine/concierge"
import { TEMPLATES, findTemplate, industryOf, type TemplateDef } from "@/engine/registry"
import { NATIVE, type Genome } from "@/engine/genome"
import { EDITIONS, EDITION_ORDER, EDITION_SITE, type EditionId } from "@/engine/editions"
import { randomGenome } from "@/engine/randomizer"
import { PERSONALITIES } from "@/engine/motion-craft"
import { MOTION_SKILLS } from "@/engine/motion-skills"
import { track } from "@/engine/analytics"
import { SiteFrame } from "../site-frame"
import {
  Busy,
  BuildProgress,
  EngineThinking,
  ErrorNote,
  ErrorRetry,
  Field,
  btnGhostCx,
  btnPrimaryCx,
  inputCx,
  postJson,
  pollJob,
  streamAgent,
  useSequentialAudio,
  type AgentStreamStep,
  type PollState,
} from "./ai-kit"

/* ══ the store — survives view switches, runs renders in the background ══ */

type AssetId = "hero" | "mark" | "still" | "reel" | "voice"
type AssetStatus = "idle" | "running" | "done" | "error"

interface AssetState {
  status: AssetStatus
  prompt: string
  /** the user edited this prompt by hand — never re-seed it */
  touched?: boolean
  size?: string
  voice?: string
  speed?: number
  image?: string
  video?: string
  audio?: string[]
  error?: string
  startedAt?: number
}

interface CopyBlock {
  headline: string
  tagline: string
  cta: string
  about: string
}

interface BuilderState {
  brief: string
  tplSlug: string | null
  /** null = as designed; otherwise the edition skin id */
  edition: EditionId | null
  genome: Genome
  name: string
  city: string
  pitch: string
  /** the copywriter persona — how the launch copy should sound */
  persona: string
  copy: CopyBlock | null
  copyRaw: string
  copyBusy: boolean
  copyError: string | null
  refBusy: boolean
  refError: string | null
  refNote: string | null
  personality: string | null
  assets: Record<AssetId, AssetState>
}

const IMAGE_SIZES = [
  { value: "1344x768", label: "Wide — hero & banners (1344×768)" },
  { value: "1024x1024", label: "Square — marks & social (1024×1024)" },
  { value: "864x1152", label: "Portrait — covers (864×1152)" },
  { value: "1152x864", label: "Landscape — cards (1152×864)" },
  { value: "1536x768", label: "Cinematic strip (1536×768)" },
]

const VOICES = [
  { value: "tongtong", label: "Tongtong — young woman · warm & friendly" },
  { value: "xiaochen", label: "Xiaochen — woman · composed & professional" },
  { value: "jam", label: "Jam — mature man · British gentleman" },
  { value: "kazi", label: "Kazi — man · clear announcer" },
  { value: "luodo", label: "Luodo — man · expressive storyteller" },
]

/** The copywriter personas — the agency-agents pattern: a named
 * specialist with a voice, injected into the copy system prompt. */
const PERSONAS = [
  { id: "warm", label: "Warm & local", note: "neighbourly, human, plain words", style: "Write in a warm, neighbourly, human voice — plain words, short sentences, like a local business owner talking to a regular." },
  { id: "premium", label: "Premium & minimal", note: "restrained, confident, few words", style: "Write in a restrained, premium voice — few words, no exclamation marks, confidence through specificity, never hype." },
  { id: "bold", label: "Bold & playful", note: "energetic, direct, a little cheeky", style: "Write in a bold, playful, energetic voice — direct address, a little cheeky, but never cringe." },
] as const

function initialAssets(tpl: TemplateDef | null): Record<AssetId, AssetState> {
  const seed = tpl ?? TEMPLATES[0]
  const pos = seed.positioning.split("—")[0].trim()
  return {
    hero: {
      status: "idle",
      prompt: `${pos}, ${seed.city}, hero website background, soft natural light, photographic, no text`,
      size: "1344x768",
    },
    mark: {
      status: "idle",
      prompt: `minimal monogram for a business called "${seed.name}", premium, ${seed.kind.toLowerCase()}, flat vector, centered on plain background, no text effects`,
      size: "1024x1024",
    },
    still: {
      status: "idle",
      prompt: `editorial detail photograph for ${seed.kind.toLowerCase()} — ${pos}, ${seed.city}, shallow depth of field, magazine quality`,
      size: "1152x864",
    },
    reel: {
      status: "idle",
      prompt: `cinematic slow camera move through ${pos.toLowerCase()}, ${seed.city}, warm light, premium mood, no text overlays`,
    },
    voice: {
      status: "idle",
      prompt: "",
      voice: "tongtong",
      speed: 1,
    },
  }
}

/** session persistence — the build survives reloads; heavy results
 * (base64 images, video urls, audio) are dropped, prompts and picks stay */
const SS_KEY = "gos:builder"

function persist(s: BuilderState) {
  if (typeof window === "undefined" || typeof sessionStorage === "undefined") return
  try {
    const light: BuilderState = {
      ...s,
      copyBusy: false,
      copyError: null,
      refBusy: false,
      refError: null,
      refNote: null,
      assets: Object.fromEntries(
        Object.entries(s.assets).map(([k, a]) => [
          k,
          {
            ...a,
            image: undefined,
            video: undefined,
            audio: undefined,
            status: a.status === "running" || a.status === "done" ? "idle" : a.status,
            startedAt: undefined,
          },
        ]),
      ) as Record<AssetId, AssetState>,
    }
    sessionStorage.setItem(SS_KEY, JSON.stringify(light))
  } catch {
    /* quota exceeded or storage blocked — the in-memory build still works */
  }
}

function loadPersisted(): BuilderState {
  const fallback: BuilderState = {
    brief: "",
    tplSlug: null,
    edition: null,
    genome: { ...NATIVE },
    name: "",
    city: "",
    pitch: "",
    persona: "warm",
    copy: null,
    copyRaw: "",
    copyBusy: false,
    copyError: null,
    refBusy: false,
    refError: null,
    refNote: null,
    personality: null,
    assets: initialAssets(null),
  }
  try {
    if (typeof window === "undefined" || typeof sessionStorage === "undefined") return fallback
    const raw = sessionStorage.getItem(SS_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as BuilderState
    if (!parsed || typeof parsed !== "object" || !parsed.assets) return fallback
    /* genome shape guard — a stale or foreign payload falls back cleanly */
    if (!parsed.genome || typeof parsed.genome !== "object") parsed.genome = { ...NATIVE }
    return { ...fallback, ...parsed }
  } catch {
    return fallback
  }
}

let state: BuilderState = loadPersisted()

const listeners = new Set<() => void>()

function setState(patch: Partial<BuilderState>) {
  state = { ...state, ...patch }
  persist(state)
  listeners.forEach((l) => l())
}

function setAsset(id: AssetId, patch: Partial<AssetState>) {
  setState({ assets: { ...state.assets, [id]: { ...state.assets[id], ...patch } } })
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

/** read the shared build from anywhere — the AI Studio's agent chat uses
 *  this so its context (staged template, business, motion) is always live */
export function useBuilder(): BuilderState {
  return useSyncExternalStore(subscribe, () => state, () => state)
}

/* ── the generation actions — module-level so they outlive the view ── */

async function generateImage(id: "hero" | "mark" | "still") {
  const a = state.assets[id]
  if (!a.prompt.trim() || a.status === "running") return
  track("ai_skill_used", `builder/image-${id}`)
  setAsset(id, { status: "running", error: undefined, image: undefined, startedAt: Date.now() })
  try {
    const { jobId } = await postJson<{ jobId: string }>("/api/ai/image", { prompt: a.prompt, size: a.size })
    await pollJob("image", jobId, (s: PollState) => {
      if (s.status === "done") setAsset(id, { status: "done", image: s.result?.image })
      else if (s.status === "error") setAsset(id, { status: "error", error: s.error })
      else setAsset(id, { status: "running" })
    })
  } catch (e) {
    setAsset(id, { status: "error", error: e instanceof Error ? e.message : "Could not start the render." })
  }
}

async function generateReel() {
  const a = state.assets.reel
  if (!a.prompt.trim() || a.status === "running") return
  track("ai_skill_used", "builder/video-reel")
  setAsset("reel", { status: "running", error: undefined, video: undefined, startedAt: Date.now() })
  try {
    const { jobId } = await postJson<{ jobId: string }>("/api/ai/video", { prompt: a.prompt, quality: "quality" })
    await pollJob("video", jobId, (s: PollState) => {
      if (s.status === "done") setAsset("reel", { status: "done", video: s.result?.video })
      else if (s.status === "error") setAsset("reel", { status: "error", error: s.error })
      else setAsset("reel", { status: "running" })
    })
  } catch (e) {
    setAsset("reel", { status: "error", error: e instanceof Error ? e.message : "Could not start the render." })
  }
}

async function generateVoice() {
  const a = state.assets.voice
  const text = a.prompt.trim()
  if (!text || a.status === "running") return
  track("ai_skill_used", "builder/tts-voiceover")
  setAsset("voice", { status: "running", error: undefined, audio: undefined, startedAt: Date.now() })
  try {
    const res = await postJson<{ parts?: string[]; error?: string }>("/api/ai/tts", {
      text,
      voice: a.voice ?? "tongtong",
      speed: a.speed ?? 1,
    })
    if (res.parts?.length) setAsset("voice", { status: "done", audio: res.parts })
    else throw new Error(res.error ?? "No audio came back.")
  } catch (e) {
    setAsset("voice", { status: "error", error: e instanceof Error ? e.message : "Speech synthesis failed." })
  }
}

function templateDigest(t: TemplateDef): string {
  return [
    `Name: ${t.name}`,
    `Business: ${t.kind}, ${t.city}`,
    `Positioning: ${t.positioning}`,
    `Conversion goal: ${t.conversion}`,
    `Signature details: ${t.signature.join("; ")}`,
  ].join("\n")
}

/* ══ the agent bridge — the same unified agent that drives the AI chat ══ */

/** A validated `site` action from POST /api/ai/agent. */
export interface AgentSitePick {
  slug: string
  why?: string
  brief?: string
  name?: string
  city?: string
  pitch?: string
  headline?: string
  tagline?: string
  cta?: string
  about?: string
  motion?: string
}

/**
 * Stage a full build from an agent pick — template, launch copy, motion
 * personality and re-seeded asset prompts, all in one write. Used by the
 * Builder's "Generate my website" button AND the Agent chat; the two
 * doors share one store, so whatever either one stages, the other sees.
 */
export function applyAgentBuild(pick: AgentSitePick): TemplateDef | null {
  const t = findTemplate(pick.slug)
  if (!t) return null
  const name = (pick.name ?? "").trim() || ""
  const city = (pick.city ?? "").trim() || t.city
  const pos = (pick.pitch ?? "").trim() || t.positioning.split("—")[0].trim()
  const copy: CopyBlock | null =
    pick.headline || pick.tagline || pick.about
      ? {
          headline: pick.headline ?? "",
          tagline: pick.tagline ?? "",
          cta: pick.cta ?? "",
          about: pick.about ?? "",
        }
      : null
  /* asset prompts seeded from the CLIENT'S business, never the demo brand */
  const assets = initialAssets(t)
  if (name || city) {
    if (!assets.hero.touched) assets.hero = { ...assets.hero, prompt: `${pos}, ${city}, hero website background, soft natural light, photographic, no text` }
    if (!assets.mark.touched) assets.mark = { ...assets.mark, prompt: `minimal monogram for a business called "${name || t.name}", premium, flat vector, centered on plain background, no text effects` }
    if (!assets.still.touched) assets.still = { ...assets.still, prompt: `editorial detail photograph — ${pos}, ${city}, shallow depth of field, magazine quality` }
    if (!assets.reel.touched) assets.reel = { ...assets.reel, prompt: `cinematic slow camera move, ${pos.toLowerCase()}, ${city}, warm light, premium mood, no text overlays` }
  }
  setState({
    brief: (pick.brief ?? "").trim() || state.brief,
    tplSlug: t.slug,
    genome: { ...NATIVE },
    edition: null,
    name,
    city,
    pitch: (pick.pitch ?? "").trim(),
    copy,
    copyRaw: "",
    personality: pick.motion && pick.motion in PERSONALITIES ? pick.motion : state.personality,
    assets,
  })
  track("builder_agent_staged", t.slug)
  return t
}

/** Ask the unified agent for a full site staging — shared by the Builder
 *  button and (via the chat) any other surface that wants a one-shot site.
 *  STREAMED: every engine loop step fires onStep the moment it happens,
 *  so the caller renders the build live and no gateway can time the
 *  request out mid-loop. */
export async function askAgentForSite(
  brief: string,
  context: { template?: string | null; business?: string; city?: string } = {},
  onStep?: (step: AgentStreamStep) => void,
): Promise<AgentSitePick> {
  const res = await streamAgent<{
    say?: string
    actions?: { type: string }[]
    error?: string
  }>(
    (evt) => {
      if (evt.type === "step" && evt.step) onStep?.(evt.step)
    },
    {
      messages: [{ role: "user", content: brief }],
      context,
      hint: "site",
    },
  )
  if (res.error) throw new Error(res.error)
  const site = (res.actions ?? []).find((a) => a.type === "site") as AgentSitePick | undefined
  if (!site) throw new Error("The agent could not pick a starting point — try describing the business in one sentence.")
  return site
}

/** The reference-analysis entry point (the openmontage pattern): paste
 * any site URL, the Page Reader extracts it, the chat AI distills a
 * one-line brief, and the recommendations re-rank against it. */
async function analyzeReference(url: string) {
  if (!url.trim() || state.refBusy) return
  track("ai_skill_used", "builder/reference")
  setState({ refBusy: true, refError: null, refNote: null })
  try {
    const read = await postJson<{ text?: string; title?: string; error?: string }>("/api/ai/reader", { url })
    const text = (read.text ?? "").slice(0, 5000)
    if (!text) throw new Error(read.error ?? "That page returned no readable content.")
    const res = await postJson<{ reply?: string; error?: string }>("/api/ai/chat", {
      system:
        "You turn a website's readable text into a one-line business brief for a website builder. " +
        "Reply with EXACTLY one line, max 20 words, in the shape: 'a <what they do> in <city if known> that <conversion goal>'. " +
        "No quotes, no preamble, no explanation — just the line.",
      messages: [{ role: "user", content: `Website: ${read.title ?? url}\n\nPAGE TEXT:\n${text}` }],
    })
    const line = (res.reply ?? "").replace(/^["']|["']$/g, "").trim()
    if (!line) throw new Error(res.error ?? "Could not distill that page.")
    setState({ brief: line, refBusy: false, refNote: `From ${read.title ?? url} — edit freely, then pick a starting point.` })
  } catch (e) {
    setState({ refBusy: false, refError: e instanceof Error ? e.message : "Could not read that reference." })
  }
}

async function writeCopy() {
  if (state.copyBusy) return
  const t = state.tplSlug ? findTemplate(state.tplSlug) : null
  if (!t) return
  track("ai_skill_used", "builder/copy")
  setState({ copyBusy: true, copyError: null })
  const business = state.name.trim() || t.name
  const city = state.city.trim() || t.city
  const pitch = state.pitch.trim()
  const persona = PERSONAS.find((p) => p.id === state.persona) ?? PERSONAS[0]
  try {
    const res = await postJson<{ reply?: string; error?: string }>("/api/ai/chat", {
      system:
        `You write launch copy for small-business websites. ${persona.style}\n` +
        `Grounded context about the reference template:\n${templateDigest(t)}\n` +
        `The client's business: name "${business}", city ${city}${pitch ? `, pitch: ${pitch}` : ""}.\n` +
        `Write fresh launch copy for THE CLIENT'S business (not the template's demo brand). Keep it concrete and honest, no hype words like "unlock" or "elevate".\n` +
        `Answer with EXACTLY four lines, each starting with the label, nothing else:\n` +
        `HEADLINE: <max 8 words>\nTAGLINE: <one sentence>\nCTA: <max 4 words, a button label>\nABOUT: <2 sentences>`,
      messages: [{ role: "user", content: `Write the launch copy for ${business} in ${city}.` }],
    })
    const raw = res.reply ?? ""
    if (!raw) throw new Error(res.error ?? "No copy came back.")
    const pick = (label: string) => {
      const m = raw.match(new RegExp(`^\\s*${label}\\s*:\\s*(.+)$`, "im"))
      return m ? m[1].trim() : ""
    }
    const block: CopyBlock = {
      headline: pick("HEADLINE"),
      tagline: pick("TAGLINE"),
      cta: pick("CTA"),
      about: pick("ABOUT"),
    }
    if (!block.headline && !block.tagline && !block.about) {
      /* model ignored the format — keep the raw text visible, still useful */
      setState({ copyRaw: raw, copy: null, copyBusy: false })
      return
    }
    setState({ copy: block, copyRaw: raw, copyBusy: false })
    /* re-seed untouched asset prompts with the client's OWN business —
       the template's demo brand never survives into the art step */
    const pos = state.pitch.trim() || t.positioning.split("—")[0].trim()
    const assets = { ...state.assets }
    if (assets.hero.status === "idle" && !assets.hero.touched)
      assets.hero = { ...assets.hero, prompt: `${pos}, ${city}, hero website background, soft natural light, photographic, no text` }
    if (assets.mark.status === "idle" && !assets.mark.touched)
      assets.mark = { ...assets.mark, prompt: `minimal monogram for a business called "${business}", premium, flat vector, centered on plain background, no text effects` }
    if (assets.still.status === "idle" && !assets.still.touched)
      assets.still = { ...assets.still, prompt: `editorial detail photograph — ${pos}, ${city}, shallow depth of field, magazine quality` }
    if (assets.reel.status === "idle" && !assets.reel.touched)
      assets.reel = { ...assets.reel, prompt: `cinematic slow camera move, ${pos.toLowerCase()}, ${city}, warm light, premium mood, no text overlays` }
    setState({ assets })
  } catch (e) {
    setState({ copyBusy: false, copyError: e instanceof Error ? e.message : "The copy service is briefly unavailable." })
  }
}

/* ══ the step registry ════════════════════════════════════════════════ */

interface StepDef {
  id: BuilderStepId
  n: number
  label: string
  icon: LucideIcon
  note: string
}

const STEPS: StepDef[] = [
  { id: "brief", n: 1, label: "Brief", icon: MessageSquare, note: "Tell us what you're building" },
  { id: "design", n: 2, label: "Design", icon: Palette, note: "Pick the look" },
  { id: "content", n: 3, label: "Content", icon: PenLine, note: "Make it yours" },
  { id: "art", n: 4, label: "Art & media", icon: ImageIcon, note: "Images, film, voice" },
  { id: "motion", n: 5, label: "Motion", icon: Orbit, note: "Choose the movement" },
  { id: "launch", n: 6, label: "Launch", icon: Rocket, note: "Ship it" },
]

const stepIndex = (id: BuilderStepId) => STEPS.findIndex((s) => s.id === id)

/* ── shared atoms ─────────────────────────────────────────────────── */

function CopyBtn({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      className={btnGhostCx}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setDone(true)
          window.setTimeout(() => setDone(false), 1600)
        } catch {
          /* clipboard blocked */
        }
      }}
    >
      {done ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
      {done ? "Copied" : label}
    </button>
  )
}

function StepShell({
  title,
  lead,
  children,
  onBack,
  onNext,
  nextLabel,
  nextDisabled,
  nextHint,
}: {
  title: string
  lead: string
  children: ReactNode
  onBack: (() => void) | null
  onNext: (() => void) | null
  nextLabel?: string
  nextDisabled?: boolean
  nextHint?: string
}) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-20 pt-8 sm:px-6">
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{lead}</p>
      <div className="mt-8">{children}</div>
      {(onBack || onNext) && (
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
          {onBack ? (
            <button type="button" className={btnGhostCx} onClick={onBack}>
              <ArrowLeft className="size-4" aria-hidden /> Back
            </button>
          ) : (
            <span />
          )}
          {onNext && (
            <button type="button" className={btnPrimaryCx} onClick={onNext} disabled={nextDisabled}>
              {nextLabel ?? "Continue"}
              <ArrowRight className="size-4" aria-hidden />
            </button>
          )}
        </div>
      )}
      {nextDisabled && nextHint ? <p className="mt-3 text-right text-xs text-muted-foreground">{nextHint}</p> : null}
    </div>
  )
}

/* ── the step rail ────────────────────────────────────────────────── */

function StepRail({ current }: { current: BuilderStepId }) {
  return (
    <nav aria-label="Builder steps" className="border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-stretch gap-1 overflow-x-auto px-2 py-2 sm:px-4">
        {STEPS.map((s, i) => {
          const active = s.id === current
          const done = stepIndex(current) > i
          const reachable =
            done || active || (s.id !== "brief" && !!state.tplSlug) || s.id === "brief"
          return (
            <button
              key={s.id}
              type="button"
              disabled={!reachable}
              onClick={() => {
                if (reachable) go(`/build/${s.id}`)
              }}
              aria-current={active ? "step" : undefined}
              className={`flex min-h-11 flex-1 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : done
                    ? "text-foreground hover:bg-muted"
                    : "text-muted-foreground hover:bg-muted"
              } disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent`}
            >
              <span
                className={`grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                  active ? "bg-primary-foreground/20" : done ? "bg-primary/15 text-primary" : "bg-muted"
                }`}
                aria-hidden
              >
                {done ? <Check className="size-3.5" /> : s.n}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

/* ── the "next up" recommendation card ────────────────────────────── */

function nextUpOf(s: BuilderState): { step: BuilderStepId; label: string; why: string } {
  if (!s.tplSlug) return { step: "brief", label: "Describe what you're building", why: "One sentence is enough — you'll get honest template picks." }
  if (!s.copy) return { step: "content", label: "Write your launch copy", why: `AI copy for your business, seeded from your starting point.` }
  if (s.assets.hero.status !== "done") return { step: "art", label: "Generate the hero image", why: "The single highest-impact asset — 30–90 seconds." }
  if (s.assets.mark.status !== "done") return { step: "art", label: "Generate your brand mark", why: "A monogram for headers and social." }
  if (s.assets.reel.status !== "done") return { step: "art", label: "Render a cinematic reel", why: "A short film for your hero — takes a few minutes." }
  if (!s.personality) return { step: "motion", label: "Pick a motion personality", why: "How the site should move — felt, not described." }
  return { step: "launch", label: "Everything's ready — launch", why: "Open the finished site or take the whole build to any AI." }
}

function NextUpCard({ current }: { current: BuilderStepId }) {
  const s = useBuilder()
  const rec = nextUpOf(s)
  if (rec.step === current) return null
  return (
    <div className="mx-auto w-full max-w-4xl px-4 pt-4 sm:px-6">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3">
        <Lightbulb className="size-4 shrink-0 text-primary" aria-hidden />
        <p className="min-w-0 flex-1 text-sm">
          <span className="font-semibold">Recommended next — {rec.label}.</span>{" "}
          <span className="text-muted-foreground">{rec.why}</span>
        </p>
        <button
          type="button"
          className={btnGhostCx}
          onClick={() => go(`/build/${rec.step}`)}
        >
          Go <ArrowRight className="size-3.5" aria-hidden />
        </button>
      </div>
    </div>
  )
}

/* ── template card (shared by brief + design) ─────────────────────── */

function TemplateCard({
  tpl,
  why,
  selected,
  onPick,
}: {
  tpl: TemplateDef
  why?: string
  selected?: boolean
  onPick: () => void
}) {
  const p = tpl[tpl.mode]
  return (
    <div
      className={`flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md ${
        selected ? "border-primary ring-2 ring-primary/25" : "border-border"
      }`}
    >
      <div
        aria-hidden
        className="flex h-16 items-end justify-between px-4 pb-3"
        style={{ background: p.bg, borderBottom: "1px solid var(--border)" }}
      >
        <span className="size-6 rounded-md" style={{ background: p.primary }} />
        <span className="h-1.5 w-16 rounded-full" style={{ background: p.line }} />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h4 className="truncate font-semibold">{tpl.name}</h4>
          {selected && <BadgeCheck className="size-4 shrink-0 text-primary" aria-hidden />}
        </div>
        <p className="text-xs text-muted-foreground">
          {industryOf(tpl.industry).label} · {tpl.kind}
        </p>
        {why ? <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{why}</p> : null}
        <button type="button" className={`${btnPrimaryCx} mt-3 w-full`} onClick={onPick}>
          {selected ? "Selected" : "Start with this"}
        </button>
      </div>
    </div>
  )
}

/* ══ step 1 · brief ═══════════════════════════════════════════════════ */

function BriefStep() {
  const s = useBuilder()
  const [refUrl, setRefUrl] = useState("")
  const [genBusy, setGenBusy] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)
  const [genNote, setGenNote] = useState<string | null>(null)
  /** the engine's loop steps, streamed in live while it builds */
  const [genSteps, setGenSteps] = useState<AgentStreamStep[]>([])
  const answer: ConciergeAnswer = useMemo(
    () => (s.brief.trim() ? askConcierge(s.brief, 3) : { query: s.brief, confidence: "low", headline: "", note: "", items: [], chips: CONCIERGE_CHIPS }),
    [s.brief],
  )
  const picks = answer.items.map((i) => findTemplate(i.slug)).filter((t): t is TemplateDef => !!t)

  /** THE generate action — one press, the agent stages the whole build:
   *  template pick, launch copy, motion personality, seeded art prompts.
   *  STREAMED: the engine's loop lands here step by step, live. */
  const generate = async () => {
    const brief = s.brief.trim()
    if (!brief || genBusy) return
    setGenBusy(true)
    setGenError(null)
    setGenNote(null)
    setGenSteps([])
    track("builder_generate_pressed")
    try {
      const pick = await askAgentForSite(
        brief,
        { business: s.name, city: s.city },
        (step) => setGenSteps((prev) => [...prev, step]),
      )
      const t = applyAgentBuild(pick)
      if (!t) throw new Error("The agent picked a template outside the library — try rephrasing.")
      go("/build/design")
    } catch (e) {
      setGenError(e instanceof Error ? e.message : "The agent is briefly unavailable — the picks below still work.")
      setGenNote("The scored picks below are the offline fallback — they always work.")
    } finally {
      setGenBusy(false)
    }
  }

  return (
    <StepShell
      title="What are we building?"
      lead="Describe the business in one sentence — what it does and what the website should get people to do. You'll get honest picks from the real template library, each with the reason it matched."
      onBack={null}
      onNext={
        s.tplSlug
          ? () => go("/build/design")
          : null
      }
      nextDisabled={!s.tplSlug}
      nextHint="Pick a starting point first — or shuffle the look later."
    >
      <Field label="Your brief" hint="plain words, no jargon needed">
        <textarea
          className={`${inputCx} min-h-24 resize-y`}
          placeholder="e.g. a neighbourhood bakery that takes pre-orders"
          value={s.brief}
          onChange={(e) => setState({ brief: e.target.value })}
          aria-label="Describe the business"
        />
      </Field>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className={`${btnPrimaryCx} h-11 px-6 text-base`}
          onClick={() => void generate()}
          disabled={!s.brief.trim() || genBusy}
        >
          {genBusy ? (
            <>
              <Sparkles className="size-4 animate-pulse" aria-hidden /> Generating your website…
            </>
          ) : (
            <>
              <Wand2 className="size-4" aria-hidden /> Generate my website
            </>
          )}
        </button>
        <span className="text-xs text-muted-foreground">
          The AI agent picks the starting point, writes your launch copy and sets the motion — 3–8 seconds.
        </span>
      </div>
      {genBusy && (
        <div className="mt-3 space-y-2">
          {/* the engine's loop, LIVE — every step lands the moment it happens */}
          <BuildProgress
            steps={genSteps}
            siteName={s.name || s.brief.split(" ").slice(0, 2).join(" ") || "your-site"}
            notice={genSteps.length >= 2 ? "the designer and copywriter sub-agents are running in parallel — this is the longest step" : null}
          />
          {genSteps.length === 0 && <EngineThinking />}
          <p className="text-[11.5px] leading-snug text-muted-foreground">
            The Growth OS Engine is running its loop, streamed live: memory → planner → designer &amp; copywriter sub-agents in parallel →
            registry verification. Your build lands on this page the moment it&apos;s verified.
          </p>
        </div>
      )}
      {genError && (
        <div className="mt-3">
          <ErrorRetry busy={genBusy} onRetry={() => void generate()}>
            {genError}
          </ErrorRetry>
        </div>
      )}
      {genNote && !genBusy && <p className="mt-2 text-xs text-muted-foreground">{genNote}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        {CONCIERGE_CHIPS.map((c) => (
          <button
            key={c}
            type="button"
            className="rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={() => setState({ brief: c })}
          >
            {c}
          </button>
        ))}
      </div>

      {/* the reference-analysis entry point — any site in, a brief out */}
      <div className="mt-6 rounded-xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-semibold">Or start from a reference site</p>
        <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
          Paste any website — a competitor, a place you love — and the reader AI turns it into your brief.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            className={`${inputCx} flex-1 min-w-48`}
            placeholder="reference.com"
            value={refUrl}
            onChange={(e) => setRefUrl(e.target.value)}
            aria-label="Reference website URL"
            onKeyDown={(e) => {
              if (e.key === "Enter") void analyzeReference(refUrl)
            }}
          />
          <button type="button" className={btnPrimaryCx} onClick={() => void analyzeReference(refUrl)} disabled={s.refBusy}>
            {s.refBusy ? "Reading…" : "Turn it into a brief"}
          </button>
        </div>
        {s.refBusy && (
          <div className="mt-3">
            <Busy label="Reading the page and distilling your brief — a few seconds…" />
          </div>
        )}
        {s.refError && (
          <div className="mt-3">
            <ErrorNote>{s.refError}</ErrorNote>
          </div>
        )}
        {s.refNote && !s.refBusy && <p className="mt-3 text-xs text-muted-foreground">{s.refNote}</p>}
      </div>

      {picks.length > 0 ? (
        <div className="mt-8">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="size-4 text-primary" aria-hidden />
            {answer.headline}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {picks.map((t) => {
              const item = answer.items.find((i) => i.slug === t.slug)!
              return (
                <TemplateCard
                  key={t.slug}
                  tpl={t}
                  why={item.why}
                  selected={s.tplSlug === t.slug}
                  onPick={() => {
                    setState({
                      tplSlug: t.slug,
                      genome: { ...NATIVE },
                      edition: null,
                      assets: initialAssets(t),
                      name: s.name || "",
                      city: t.city,
                    })
                    track("builder_template_picked", t.slug)
                    go("/build/design")
                  }}
                />
              )
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{answer.note}</p>
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-border bg-muted/20 px-5 py-6 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Not sure yet? Start from the whole library.</p>
          <p className="mt-1">
            Every template is finished and live — pick any industry and make it yours in the next steps.
          </p>
          <button type="button" className={`${btnGhostCx} mt-4`} onClick={() => go("/catalogue")}>
            <LayoutGrid className="size-4" aria-hidden /> Browse all {TEMPLATES.length} templates
          </button>
        </div>
      )}
    </StepShell>
  )
}

/* ══ step 2 · design ══════════════════════════════════════════════════ */

function DesignStep() {
  const s = useBuilder()
  const tpl = s.tplSlug ? findTemplate(s.tplSlug) : null
  const [device, setDevice] = useState<"mobile" | "desktop">("desktop")

  if (!tpl) {
    return (
      <StepShell title="Pick the look" lead="Choose a starting point first." onBack={() => go("/build/brief")} onNext={null}>
        <button type="button" className={btnPrimaryCx} onClick={() => go("/build/brief")}>
          Go to the brief <ArrowRight className="size-4" aria-hidden />
        </button>
      </StepShell>
    )
  }

  const applySkin = (id: EditionId | null) => {
    setState({
      edition: id,
      genome: id ? { ...NATIVE, ...EDITION_SITE[id].genome } : { ...NATIVE },
    })
    track("builder_skin", id ?? "native")
  }

  return (
    <StepShell
      title="Pick the look"
      lead={`${tpl.name} is live below — re-skin it with one click, or shuffle for a fresh take. The preview is the real site, not a mockup.`}
      onBack={() => go("/build/brief")}
      onNext={() => go("/build/content")}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2" role="radiogroup" aria-label="Preview size">
          {([["desktop", Monitor], ["mobile", Smartphone]] as const).map(([id, Icon]) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={device === id}
              onClick={() => setDevice(id)}
              className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition-colors ${
                device === id ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:bg-muted/60"
              }`}
            >
              <Icon className="size-4" aria-hidden />
              <span className="capitalize">{id}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          className={btnGhostCx}
          onClick={() => {
            const { genome } = randomGenome(3, s.genome)
            setState({ genome, edition: null })
            track("builder_shuffle")
          }}
        >
          <Dices className="size-4" aria-hidden /> Shuffle the look
        </button>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-red-400/70" aria-hidden />
          <span className="size-2.5 rounded-full bg-amber-400/70" aria-hidden />
          <span className="size-2.5 rounded-full bg-green-500/70" aria-hidden />
          <span className="ml-2 truncate font-mono text-[11px] text-muted-foreground">
            {tpl.name.toLowerCase().replace(/\s+/g, "")}.com — live preview
          </span>
        </div>
        <div className="max-h-[30rem] overflow-y-auto">
          <SiteFrame
            tpl={tpl}
            genome={s.genome}
            page="home"
            width={device === "mobile" ? 390 : "100%"}
            style={{ margin: "0 auto" }}
            remountKey={`${s.edition ?? "native"}-${device}`}
          />
        </div>
      </div>

      <div className="mt-8">
        <p className="mb-3 text-sm font-semibold">Skin — one click re-forges everything</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <button
            type="button"
            onClick={() => applySkin(null)}
            className={`rounded-xl border p-3 text-left transition-colors ${
              s.edition === null ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border bg-card hover:bg-muted/50"
            }`}
          >
            <span className="block text-[13px] font-semibold">As designed</span>
            <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">The template's own DNA</span>
          </button>
          {EDITION_ORDER.map((eid) => {
            const e = EDITIONS[eid]
            return (
              <button
                key={eid}
                type="button"
                onClick={() => applySkin(eid)}
                className={`rounded-xl border p-3 text-left transition-colors ${
                  s.edition === eid ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border bg-card hover:bg-muted/50"
                }`}
              >
                <span className="block text-[13px] font-semibold">{e.name}</span>
                <span className="mt-0.5 block truncate text-[11px] leading-snug text-muted-foreground">{e.tagline}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
        <span>Want a different starting point?</span>
        <button type="button" className="font-semibold text-primary hover:underline" onClick={() => go("/build/brief")}>
          Back to the picks
        </button>
        <span>·</span>
        <button type="button" className="font-semibold text-primary hover:underline" onClick={() => go("/catalogue")}>
          Browse all {TEMPLATES.length}
        </button>
      </div>
    </StepShell>
  )
}

/* ══ step 3 · content ═════════════════════════════════════════════════ */

function ContentStep() {
  const s = useBuilder()
  const tpl = s.tplSlug ? findTemplate(s.tplSlug) : null
  if (!tpl) {
    return (
      <StepShell title="Make it yours" lead="Pick a starting point first." onBack={() => go("/build/brief")} onNext={null}>
        <button type="button" className={btnPrimaryCx} onClick={() => go("/build/brief")}>
          Go to the brief <ArrowRight className="size-4" aria-hidden />
        </button>
      </StepShell>
    )
  }
  return (
    <StepShell
      title="Make it yours"
      lead="Tell us about the actual business. The copywriter AI turns it into launch copy, seeded from everything the template already knows."
      onBack={() => go("/build/design")}
      onNext={() => go("/build/art")}
      nextLabel="Skip to art"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Business name">
          <input
            className={inputCx}
            placeholder={tpl.name}
            value={s.name}
            onChange={(e) => setState({ name: e.target.value })}
            aria-label="Business name"
          />
        </Field>
        <Field label="City">
          <input
            className={inputCx}
            placeholder={tpl.city}
            value={s.city}
            onChange={(e) => setState({ city: e.target.value })}
            aria-label="City"
          />
        </Field>
      </div>
      <div className="mt-4">
        <Field label="One-line pitch" hint="what makes it different — optional">
          <input
            className={inputCx}
            placeholder={`e.g. ${tpl.signature[0] ?? "sourdough loaves from a wood-fired oven"}`}
            value={s.pitch}
            onChange={(e) => setState({ pitch: e.target.value })}
            aria-label="One-line pitch"
          />
        </Field>
      </div>

      <div className="mt-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Copywriter voice</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {PERSONAS.map((p) => {
            const selected = s.persona === p.id
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setState({ persona: p.id })}
                className={`rounded-xl border p-3 text-left transition-colors ${
                  selected ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border bg-card hover:bg-muted/40"
                }`}
              >
                <span className="block text-[13px] font-semibold">{p.label}</span>
                <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">{p.note}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" className={btnPrimaryCx} onClick={() => void writeCopy()} disabled={s.copyBusy}>
          {s.copyBusy ? (
            <>
              <Sparkles className="size-4 animate-pulse" aria-hidden /> Writing…
            </>
          ) : (
            <>
              <PenLine className="size-4" aria-hidden /> {s.copy ? "Rewrite my copy" : "Write my copy"}
            </>
          )}
        </button>
        <span className="text-xs text-muted-foreground">Uses the chat AI · takes 2–4 seconds</span>
      </div>

      {s.copyBusy && (
        <div className="mt-4">
          <Busy label="Writing your launch copy — headline, tagline, button and about line…" />
        </div>
      )}
      {s.copyError && (
        <div className="mt-4">
          <ErrorNote>{s.copyError}</ErrorNote>
        </div>
      )}

      {s.copy && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {(
            [
              ["Headline", s.copy.headline, "headline"],
              ["Button label", s.copy.cta, "cta"],
            ] as const
          ).map(([label, value, key]) => (
            <div key={key} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
              <p
                className="mt-1.5 text-lg font-bold leading-snug"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => setState({ copy: { ...s.copy!, [key]: e.currentTarget.textContent ?? "" } })}
                title="Click to edit"
              >
                {value}
              </p>
            </div>
          ))}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:col-span-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Tagline</p>
            <p
              className="mt-1.5 text-sm leading-relaxed"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => setState({ copy: { ...s.copy!, tagline: e.currentTarget.textContent ?? "" } })}
              title="Click to edit"
            >
              {s.copy.tagline}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:col-span-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">About</p>
            <p
              className="mt-1.5 text-sm leading-relaxed"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => setState({ copy: { ...s.copy!, about: e.currentTarget.textContent ?? "" } })}
              title="Click to edit"
            >
              {s.copy.about}
            </p>
          </div>
          <p className="text-xs text-muted-foreground sm:col-span-2">Every block is click-to-edit — this copy is yours.</p>
        </div>
      )}

      {!s.copy && s.copyRaw && (
        <div className="mt-6 rounded-xl border border-border bg-card p-4 text-sm leading-relaxed whitespace-pre-wrap shadow-sm">
          {s.copyRaw}
        </div>
      )}
    </StepShell>
  )
}

/* ══ step 4 · art & media — the generation deck ══════════════════════ */

function ImageCard({
  id,
  icon: Icon,
  title,
  how,
}: {
  id: "hero" | "mark" | "still"
  icon: LucideIcon
  title: string
  how: string
}) {
  const s = useBuilder()
  const a = s.assets[id]
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (a.status !== "running" || !a.startedAt) return
    const tick = () => setElapsed(Math.round((Date.now() - a.startedAt!) / 1000))
    const first = window.setTimeout(tick, 0)
    const t = window.setInterval(tick, 1000)
    return () => {
      window.clearTimeout(first)
      window.clearInterval(t)
    }
  }, [a.status, a.startedAt])

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-start gap-3 border-b border-border px-4 py-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4.5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h4 className="text-sm font-semibold">{title}</h4>
          <p className="mt-0.5 text-[11.5px] leading-snug text-muted-foreground">{how}</p>
        </div>
        {a.status === "done" && <Check className="ml-auto size-4 shrink-0 text-primary" aria-hidden />}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <textarea
          className={`${inputCx} min-h-16 resize-y text-[13px]`}
          value={a.prompt}
          onChange={(e) => setAsset(id, { prompt: e.target.value, touched: true })}
          aria-label={`${title} prompt`}
        />
        <select
          className={`${inputCx} text-[13px]`}
          value={a.size}
          onChange={(e) => setAsset(id, { size: e.target.value })}
          aria-label={`${title} format`}
        >
          {IMAGE_SIZES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={btnPrimaryCx}
          onClick={() => void generateImage(id)}
          disabled={a.status === "running"}
        >
          {a.status === "running" ? (
            <>
              <Sparkles className="size-4 animate-pulse" aria-hidden /> Rendering… {elapsed}s
            </>
          ) : (
            <>
              <Wand2 className="size-4" aria-hidden /> {a.status === "done" ? "Generate again" : "Generate"}
            </>
          )}
        </button>
        {a.status === "running" && <Busy label="Runs as a background job — usually 30–90 seconds. Keep browsing, it lands here." />}
        {a.status === "error" && a.error && <ErrorNote>{a.error}</ErrorNote>}
        {a.status === "done" && a.image && (
          <div className="min-h-0">
            <img
              src={a.image}
              alt={`AI-generated ${title.toLowerCase()}`}
              className="max-h-64 w-full rounded-lg object-cover shadow"
            />
            <a href={a.image} download={`builder-${id}.png`} className={`${btnGhostCx} mt-3 w-full`}>
              <Download className="size-3.5" aria-hidden /> Download
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

function ReelCard() {
  const s = useBuilder()
  const a = s.assets.reel
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (a.status !== "running" || !a.startedAt) return
    const tick = () => setElapsed(Math.round((Date.now() - a.startedAt!) / 1000))
    const first = window.setTimeout(tick, 0)
    const t = window.setInterval(tick, 1000)
    return () => {
      window.clearTimeout(first)
      window.clearInterval(t)
    }
  }, [a.status, a.startedAt])

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm sm:col-span-2">
      <div className="flex items-start gap-3 border-b border-border px-4 py-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Film className="size-4.5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h4 className="text-sm font-semibold">Cinematic hero reel</h4>
          <p className="mt-0.5 text-[11.5px] leading-snug text-muted-foreground">
            A short film for your hero section — the highest-impact asset after the still. Renders take a few minutes.
          </p>
        </div>
        {a.status === "done" && <Check className="ml-auto size-4 shrink-0 text-primary" aria-hidden />}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <textarea
          className={`${inputCx} min-h-16 resize-y text-[13px]`}
          value={a.prompt}
          onChange={(e) => setAsset("reel", { prompt: e.target.value, touched: true })}
          aria-label="Reel prompt"
        />
        <button type="button" className={btnPrimaryCx} onClick={() => void generateReel()} disabled={a.status === "running"}>
          {a.status === "running" ? (
            <>
              <Clapperboard className="size-4 animate-pulse" aria-hidden /> Filming… {elapsed}s
            </>
          ) : (
            <>
              <Clapperboard className="size-4" aria-hidden /> {a.status === "done" ? "Film another" : "Start the render"}
            </>
          )}
        </button>
        {a.status === "running" && (
          <Busy label="Video renders run several minutes in the background — leave this page open and it lands here." />
        )}
        {a.status === "error" && a.error && <ErrorNote>{a.error}</ErrorNote>}
        {a.status === "done" && a.video && (
          <video src={a.video} controls playsInline className="w-full rounded-lg shadow" aria-label="Generated hero reel" />
        )}
      </div>
    </div>
  )
}

function VoiceCard() {
  const s = useBuilder()
  const a = s.assets.voice
  const player = useSequentialAudio()
  const suggested = useMemo(() => {
    if (a.prompt.trim()) return a.prompt
    if (s.copy) return `${s.copy.headline}. ${s.copy.tagline}`
    const tpl = s.tplSlug ? findTemplate(s.tplSlug) : null
    return tpl ? `${tpl.positioning.split("—")[0].trim()}, in ${tpl.city}.` : ""
  }, [a.prompt, s.copy, s.tplSlug])

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm sm:col-span-2">
      <div className="flex items-start gap-3 border-b border-border px-4 py-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <AudioLines className="size-4.5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h4 className="text-sm font-semibold">Site voiceover</h4>
          <p className="mt-0.5 text-[11.5px] leading-snug text-muted-foreground">
            Turn your copy into a spoken voiceover — for hero audio, phone greetings or a reel narration.
          </p>
        </div>
        {a.status === "done" && <Check className="ml-auto size-4 shrink-0 text-primary" aria-hidden />}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <textarea
          className={`${inputCx} min-h-16 resize-y text-[13px]`}
          value={a.prompt}
          placeholder={suggested}
          onChange={(e) => setAsset("voice", { prompt: e.target.value })}
          aria-label="Voiceover script"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <select
            className={`${inputCx} text-[13px]`}
            value={a.voice}
            onChange={(e) => setAsset("voice", { voice: e.target.value })}
            aria-label="Voice"
          >
            {VOICES.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
          <select
            className={`${inputCx} text-[13px]`}
            value={String(a.speed ?? 1)}
            onChange={(e) => setAsset("voice", { speed: Number(e.target.value) })}
            aria-label="Speaking rate"
          >
            <option value="0.8">Slow, unhurried</option>
            <option value="1">Natural pace</option>
            <option value="1.2">Brisk</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btnPrimaryCx} onClick={() => void generateVoice()} disabled={a.status === "running"}>
            {a.status === "running" ? (
              <>
                <Music4 className="size-4 animate-pulse" aria-hidden /> Speaking…
              </>
            ) : (
              <>
                <Music4 className="size-4" aria-hidden /> {a.status === "done" ? "Speak again" : "Speak it"}
              </>
            )}
          </button>
          {a.status === "done" && a.audio && (
            <button
              type="button"
              className={btnGhostCx}
              onClick={() => (player.playing ? player.stop() : player.play(a.audio!))}
            >
              {player.playing ? (
                <>
                  <Square className="size-3.5" aria-hidden /> Stop ({player.part}/{player.total})
                </>
              ) : (
                <>
                  <Play className="size-3.5" aria-hidden /> Play voiceover
                </>
              )}
            </button>
          )}
        </div>
        {a.status === "error" && a.error && <ErrorNote>{a.error}</ErrorNote>}
      </div>
    </div>
  )
}

function ArtStep() {
  const s = useBuilder()
  const tpl = s.tplSlug ? findTemplate(s.tplSlug) : null
  if (!tpl) {
    return (
      <StepShell title="Generate the assets" lead="Pick a starting point first." onBack={() => go("/build/brief")} onNext={null}>
        <button type="button" className={btnPrimaryCx} onClick={() => go("/build/brief")}>
          Go to the brief <ArrowRight className="size-4" aria-hidden />
        </button>
      </StepShell>
    )
  }
  const done = (Object.keys(s.assets) as AssetId[]).filter((k) => s.assets[k].status === "done").length
  return (
    <StepShell
      title="Generate the assets"
      lead={`Real generations for ${s.name.trim() || tpl.name} — every card is a live AI skill with its prompt pre-seeded from your build. Fire them in any order; renders continue in the background while you keep working.`}
      onBack={() => go("/build/content")}
      onNext={() => go("/build/motion")}
      nextLabel={done > 0 ? "Continue" : "Skip to motion"}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <ImageCard id="hero" icon={ImageIcon} title="Hero image" how="The first thing people see — photographic, no text baked in." />
        <ImageCard id="mark" icon={Stamp} title="Brand mark" how="A clean monogram for headers, favicons and social." />
        <ImageCard id="still" icon={Camera} title="Editorial still" how="A magazine-quality detail shot for galleries and cards." />
        <ReelCard />
        <VoiceCard />
      </div>
    </StepShell>
  )
}

const Camera = CameraIcon

/* ══ step 5 · motion ══════════════════════════════════════════════════ */

function PersonalityDemo({ id, playing }: { id: string; playing: boolean }) {
  const common = "grid h-24 w-full place-items-center overflow-hidden rounded-lg border border-border bg-muted/30"
  const dot = "size-8 rounded-lg bg-primary"

  if (id === "corporate") {
    return (
      <div className={common}>
        <motion.div
          className={dot}
          animate={playing ? { opacity: [0, 1, 1, 0], scale: [0.95, 1, 1, 0.98] } : { opacity: 1, scale: 1 }}
          transition={playing ? { duration: 2, times: [0, 0.35, 0.85, 1], ease: "easeInOut", repeat: Infinity, repeatDelay: 1.2 } : { duration: 0 }}
        />
      </div>
    )
  }
  if (id === "organic") {
    return (
      <div className={common}>
        <motion.div
          className={dot}
          animate={playing ? { y: [-6, 6, -6], rotate: [-2, 2, -2], borderRadius: ["30%", "45%", "30%"] } : { y: 0, rotate: 0 }}
          transition={playing ? { duration: 3, ease: "easeInOut", repeat: Infinity } : { duration: 0 }}
        />
      </div>
    )
  }
  if (id === "bold") {
    return (
      <div className={common}>
        <motion.div
          className={dot}
          animate={playing ? { scale: [0.6, 1.15, 1], rotate: [0, 6, 0] } : { scale: 1, rotate: 0 }}
          transition={playing ? { type: "spring", stiffness: 320, damping: 12, repeat: Infinity, repeatDelay: 1 } : { duration: 0 }}
        />
      </div>
    )
  }
  /* cinematic */
  return (
    <div className={common}>
      <motion.div
        className={`${dot} w-24`}
        animate={playing ? { opacity: [0, 1, 1, 0], filter: ["blur(6px)", "blur(0px)", "blur(0px)", "blur(3px)"], scaleX: [0.7, 1, 1, 0.96] } : { opacity: 1, filter: "blur(0px)", scaleX: 1 }}
        transition={playing ? { duration: 3.6, times: [0, 0.45, 0.85, 1], ease: "easeOut", repeat: Infinity, repeatDelay: 1 } : { duration: 0 }}
      />
    </div>
  )
}

function MotionStep() {
  const s = useBuilder()
  const tpl = s.tplSlug ? findTemplate(s.tplSlug) : null
  const [playing, setPlaying] = useState(true)

  const applicable = useMemo(
    () => MOTION_SKILLS.filter((k) => ["brand", "feel", "choreography"].includes(k.category)).slice(0, 4),
    [],
  )

  return (
    <StepShell
      title="Choose the movement"
      lead="Motion is a brand decision, not decoration. Feel all four personalities live — the one you pick decides how every entrance, hover and scroll behaves on the site."
      onBack={() => go("/build/art")}
      onNext={() => go("/build/launch")}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">From the Wiggle master skill: brand personality → motion type.</p>
        <button type="button" className={btnGhostCx} onClick={() => setPlaying((p) => !p)}>
          {playing ? (
            <>
              <Square className="size-3.5" aria-hidden /> Pause
            </>
          ) : (
            <>
              <Play className="size-3.5" aria-hidden /> Play
            </>
          )}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {Object.values(PERSONALITIES).map((p) => {
          const selected = s.personality === p.id
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setState({ personality: p.id })
                track("builder_personality", p.id)
              }}
              className={`flex flex-col gap-3 rounded-xl border p-4 text-left transition-colors ${
                selected ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border bg-card hover:bg-muted/40"
              }`}
              aria-pressed={selected}
            >
              <PersonalityDemo id={p.id} playing={playing} />
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold capitalize">{p.id}</span>
                {selected ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                    <Check className="size-3.5" aria-hidden /> Applied
                  </span>
                ) : (
                  <span className="text-[11px] text-muted-foreground">Tap to apply</span>
                )}
              </span>
              <span className="text-[11.5px] leading-snug text-muted-foreground">
                {p.note} <span className="text-foreground/70">Fits: {p.brands}.</span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-semibold">What gets applied — from the motion registry</p>
        <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {applicable.map((k) => (
            <li key={k.id} className="flex items-start gap-2 text-[12.5px] leading-snug">
              <Orbit className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
              <span>
                <b className="font-semibold">{k.name}</b>
                <span className="text-muted-foreground"> — {k.blurb}</span>
              </span>
            </li>
          ))}
        </ul>
        <a href={href("/motion")} className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:underline">
          Feel all 19 skills in the Motion Lab <ExternalLink className="size-3.5" aria-hidden />
        </a>
      </div>
    </StepShell>
  )
}

/* ══ step 6 · launch ══════════════════════════════════════════════════ */

function briefMarkdown(s: BuilderState): string {
  const tpl = s.tplSlug ? findTemplate(s.tplSlug) : null
  const lines = [
    "# Website build brief",
    "",
    tpl ? `**Starting point:** ${tpl.name} (${industryOf(tpl.industry).label} · ${tpl.kind})` : "",
    s.edition ? `**Skin:** ${EDITIONS[s.edition].name}` : "**Skin:** as designed",
    s.name ? `**Business:** ${s.name}${s.city ? `, ${s.city}` : ""}` : "",
    s.pitch ? `**Pitch:** ${s.pitch}` : "",
    "",
  ].filter(Boolean)
  if (s.copy) {
    lines.push("## Copy", `- Headline: ${s.copy.headline}`, `- Tagline: ${s.copy.tagline}`, `- CTA: ${s.copy.cta}`, `- About: ${s.copy.about}`, "")
  }
  if (s.personality) {
    const p = PERSONALITIES[s.personality]
    lines.push(`## Motion personality: ${s.personality}`, `- ${p.note}`, `- Keyframes ${p.keyframes}, ${p.duration}, ${p.fps}fps`, "")
  }
  const made = (Object.keys(s.assets) as AssetId[]).filter((k) => s.assets[k].status === "done")
  if (made.length) {
    lines.push("## Generated assets", ...made.map((k) => `- ${k}: prompt — "${s.assets[k].prompt || s.assets[k].voice || ""}"`), "")
  }
  lines.push(
    "---",
    "Feed this brief to any AI agent together with the skill manifest:",
    "GET /api/skills?format=tools  (OpenAI-style tool manifest)",
    "GET /api/skills?format=md     (agent system-prompt markdown)",
  )
  return lines.join("\n")
}

function LaunchStep() {
  const s = useBuilder()
  const tpl = s.tplSlug ? findTemplate(s.tplSlug) : null

  if (!tpl) {
    return (
      <StepShell title="Ship it" lead="Pick a starting point first." onBack={() => go("/build/brief")} onNext={null}>
        <button type="button" className={btnPrimaryCx} onClick={() => go("/build/brief")}>
          Go to the brief <ArrowRight className="size-4" aria-hidden />
        </button>
      </StepShell>
    )
  }

  const assetsDone = (Object.keys(s.assets) as AssetId[]).filter((k) => s.assets[k].status === "done")
  const md = briefMarkdown(s)

  return (
    <StepShell
      title="Ship it"
      lead="This is your site — live, re-skinned, with generated assets and a motion personality. Open it full-screen, keep refining it, or take the whole build to any AI."
      onBack={() => go("/build/motion")}
      onNext={null}
    >
      {/* the assembled preview */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
          <span className="truncate font-mono text-[11px] text-muted-foreground">
            {(s.name.trim() || tpl.name).toLowerCase().replace(/\s+/g, "")}.com
          </span>
          <button type="button" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline" onClick={() => go(`/site/${tpl.slug}`)}>
            Open full screen <ExternalLink className="size-3.5" aria-hidden />
          </button>
        </div>
        <div className="max-h-[32rem] overflow-y-auto">
          <SiteFrame tpl={tpl} genome={s.genome} page="home" width="100%" remountKey={`launch-${s.edition ?? "n"}`} />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" className={btnPrimaryCx} onClick={() => go(`/site/${tpl.slug}`)}>
          <Rocket className="size-4" aria-hidden /> Open the finished site
        </button>
        <button type="button" className={btnGhostCx} onClick={() => go(`/library/${tpl.slug}`)}>
          <LayoutGrid className="size-4" aria-hidden /> Keep refining in the library
        </button>
        <button type="button" className={btnGhostCx} onClick={() => go("/catalogue")}>
          Browse all templates
        </button>
      </div>

      {/* generated assets recap */}
      {assetsDone.length > 0 && (
        <div className="mt-8">
          <p className="mb-3 text-sm font-semibold">Your generated assets ({assetsDone.length})</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {assetsDone.map((k) => {
              const a = s.assets[k]
              if (a.image) {
                return (
                  <figure key={k} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <img src={a.image} alt={`Generated ${k}`} className="h-28 w-full object-cover" />
                    <figcaption className="flex items-center justify-between gap-2 px-3 py-2 text-[11px] text-muted-foreground">
                      <span className="capitalize">{k}</span>
                      <a href={a.image} download={`builder-${k}.png`} className="font-semibold text-primary hover:underline">
                        Download
                      </a>
                    </figcaption>
                  </figure>
                )
              }
              if (a.video) {
                return (
                  <figure key={k} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <video src={a.video} className="h-28 w-full object-cover" muted playsInline />
                    <figcaption className="flex items-center justify-between gap-2 px-3 py-2 text-[11px] text-muted-foreground">
                      <span className="capitalize">{k}</span>
                      <a href={a.video} target="_blank" rel="noreferrer" className="font-semibold text-primary hover:underline">
                        Open
                      </a>
                    </figcaption>
                  </figure>
                )
              }
              return (
                <figure key={k} className="flex flex-col justify-between rounded-xl border border-border bg-card p-3 shadow-sm">
                  <figcaption className="text-[11px] capitalize text-muted-foreground">{k} — audio</figcaption>
                  <audio controls src={a.audio?.[0]} className="mt-2 w-full" aria-label={`Generated ${k} audio`} />
                </figure>
              )
            })}
          </div>
        </div>
      )}

      {/* the agent-agnostic export */}
      <div className="mt-8 rounded-xl border border-primary/25 bg-primary/5 p-5">
        <p className="text-sm font-bold">Take this build to any AI</p>
        <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
          The whole platform is agent-agnostic: every skill — 8 AI engines and 19 motion masters from five sources — is
          served as a plain manifest any agent or API can consume. No vendor lock-in, no special dialect.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <CopyBtn text={md} label="Copy the build brief" />
          <CopyBtn text="/api/skills?format=tools" label="Copy manifest URL" />
          <a className={btnGhostCx} href="/api/skills?format=md" target="_blank" rel="noreferrer">
            <ExternalLink className="size-3.5" aria-hidden /> Open the raw manifest
          </a>
        </div>
        <pre className="mt-4 overflow-x-auto rounded-lg border border-border bg-background p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
{`curl "/api/skills?format=tools" | jq '.[].function.name'
# → the same skills any agent sees: emil.feel, gsap.timeline, ai.image, …`}
        </pre>
      </div>
    </StepShell>
  )
}

/* ══ the view ═════════════════════════════════════════════════════════ */

export function BuilderView({ step }: { step: string | null }) {
  const current: BuilderStepId = (BUILDER_STEPS as readonly string[]).includes(step ?? "")
    ? (step as BuilderStepId)
    : "brief"

  useEffect(() => {
    track("builder_step", current)
  }, [current])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* the builder's own header — direct, no shell chrome */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-3 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => go("/")}
            className="flex shrink-0 items-center gap-2.5 text-foreground"
            aria-label="Growth OS — home"
          >
            <span aria-hidden className="grid size-7 place-items-center rounded-[7px] bg-primary text-sm font-semibold text-primary-foreground">
              G
            </span>
            <span className="hidden font-semibold sm:inline">Website Builder</span>
          </button>
          <span className="ml-auto hidden items-center gap-1.5 text-[11px] text-muted-foreground md:flex">
            <Sparkles className="size-3.5 text-primary" aria-hidden />
            1 unified agent · 4 skill families · 19 motion masters · {TEMPLATES.length} templates — one system
          </span>
          <button type="button" className={btnGhostCx} onClick={() => go("/ai")}>
            AI Studio
          </button>
        </div>
        <StepRail current={current} />
      </header>

      <NextUpCard current={current} />

      {current === "brief" && <BriefStep />}
      {current === "design" && <DesignStep />}
      {current === "content" && <ContentStep />}
      {current === "art" && <ArtStep />}
      {current === "motion" && <MotionStep />}
      {current === "launch" && <LaunchStep />}

      <footer className="mt-auto border-t border-border bg-muted/30 px-4 py-6 text-center text-xs text-muted-foreground">
        Every generation here is a live AI call · the build survives navigation ·{" "}
        <a className="font-semibold text-primary hover:underline" href={href("/ai")}>
          explore the skills behind it
        </a>
      </footer>
    </div>
  )
}
