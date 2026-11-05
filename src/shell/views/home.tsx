"use client"

/**
 * HomeView — the forge: the Growth OS's own landing page.
 *
 * Ports the OMNIFORGE hero / layer-proof / editions-gallery / offer
 * sections onto the merged system: six edition-driven hero layouts, the
 * method (token contract → genome → tiers × finishes), the editions
 * gallery that re-forges this very page live, a showcase of real rendered
 * templates, the playbook teaser, both price ladders and the closing
 * lead form.
 *
 * Everything paints through the edition CSS variables applied to <html>
 * by the EditionProvider — no hardcoded colours in this file (plain
 * black/white scrims aside, which are allowed theatre).
 */
import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from "react"
import { ArrowRight, ArrowUpRight, BookOpen, Dices, Dna, ExternalLink, Layers, Orbit, Search, SlidersHorizontal, Wand2 } from "lucide-react"
import { EDITION_ORDER, EDITIONS, LAYER_ORDER, type Edition, type EditionId } from "@/engine/editions"
import { CAP_LABELS, FINISHES, type FinishCaps } from "@/engine/finish"
import { SWITCHES } from "@/engine/genome"
import { INDUSTRIES, TEMPLATES, findTemplate, industryOf, type TemplateDef } from "@/engine/registry"
import { PLAYBOOK_BY_TIER, TIERS, tierOf } from "@/engine/tiers"
import { SYSTEM_MAP, go, href } from "@/engine/nav"
import { track } from "@/engine/analytics"
import { useEdition } from "../edition-provider"
import { SpinBlock, SpinField, useCursorLabel, useFx } from "../fx"
import { useGos } from "../gos-context"
import { SiteFrame } from "../site-frame"
import { OPEN_PALETTE_EVENT } from "../command-palette"

/* ── constants ─────────────────────────────────────────────────────── */

const MODULE_TOTAL = Object.values(PLAYBOOK_BY_TIER).reduce((a, b) => a + b, 0)
const pad = (n: number) => String(n).padStart(2, "0")

/** The blueprint hero's mono stats rail. */
const STATS = [
  { value: String(TEMPLATES.length), label: "finished templates" },
  { value: String(MODULE_TOTAL), label: "playbook modules" },
  { value: String(SWITCHES.length), label: "genome switches" },
  { value: String(EDITION_ORDER.length), label: "editions" },
  { value: String(FINISHES.length), label: "finish tiers" },
]

/** The 12-variable token contract every template draws through. */
const TOKENS = [
  "--bg", "--surface", "--ink", "--muted", "--line", "--primary",
  "--on-primary", "--accent", "--on-accent", "--radius", "--font-display", "--font-body",
]

const MARQUEE_TEXT =
  `${TEMPLATES.length} finished templates · ${MODULE_TOTAL} playbook modules · ` +
  `${SWITCHES.length} genome switches · ${EDITION_ORDER.length} editions · ` +
  `${FINISHES.length} finish tiers · ${TIERS.length} tiers per industry — `

const SHOWCASE = [
  "molo-bakehouse", "ember-oak", "kalm-physio",
  "nightflow", "rowan-vale", "northbank-residences",
]
  .map((s) => findTemplate(s))
  .filter((t): t is TemplateDef => !!t)

const EXAMPLE_MODULES = ["Navigation & headers", "Booking flows", "Listings & search", "Quote calculators", "Client portals", "Galleries"]
const BUDGETS = ["Under £500", "£500 – 2k", "£2k – 10k", "£10k +"]
const NAV_LINKS: { label: string; path: string }[] = [
  { label: "Builder", path: "/build" },
  { label: "AI Studio", path: "/ai" },
  { label: "Motion", path: "/motion" },
  { label: "Sources", path: "/sources" },
  { label: "Library", path: "/library" },
  { label: "Catalogue", path: "/catalogue" },
  { label: "Forge", path: "/forge" },
  { label: "Playbook", path: "/playbook" },
]

const capLine = (caps: FinishCaps) =>
  (Object.keys(CAP_LABELS) as (keyof typeof CAP_LABELS)[])
    .filter((k) => caps[k] === true)
    .map((k) => CAP_LABELS[k])
    .join(" · ")

/*
 * The shell resets element styles inside `.gos` with unlayered CSS
 * (buttons, headings, lists). The forge opts back out so plain Tailwind
 * utilities apply unchanged: each declaration rolls the property back to
 * the layered value (Tailwind's utilities/base layers) that the shell's
 * reset would otherwise have overridden.
 */
const OPT_OUT = `.gos .forge :is(h1,h2,h3,h4,p,ul,ol,dl,dd){margin:revert-layer;padding:revert-layer}
.gos .forge button{font:revert-layer;color:revert-layer;background:revert-layer;border:revert-layer;padding:revert-layer}
.gos .forge a{color:revert-layer}`

/* ── shared bits ──────────────────────────────────────────────────── */

function HeroHeadline({ e, motion, className = "" }: { e: Edition; motion: boolean; className?: string }) {
  const [pre, emph, post] = e.copy.headline
  return (
    <h1 className={`ed-display text-balance ${className}`}>
      {pre}{" "}
      <span className={`ed-emph${motion ? " ed-foil-move" : ""}`}>{emph}</span>{" "}
      {post}
    </h1>
  )
}

function HeroCtas({
  e, invert = false, className = "", onSecondary,
}: { e: Edition; invert?: boolean; className?: string; onSecondary: () => void }) {
  /* the AI-first merge: the primary CTA opens the AI Intelligence
     layer (#/ai) when the edition names it; otherwise the catalogue */
  const primaryIsAi = /ai studio/i.test(e.copy.cta)
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={() => {
          track("cta_clicked", { source: "forge", target: "builder" })
          go("/build")
        }}
        className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        <Wand2 className="size-4" aria-hidden /> Build a website
      </button>
      <button
        type="button"
        onClick={() => {
          track("cta_clicked", { source: "forge", target: primaryIsAi ? "ai-studio" : "catalogue" })
          go(primaryIsAi ? "/ai" : "/catalogue")
        }}
        className="inline-flex h-11 items-center gap-2 rounded-md border border-border bg-card px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        {e.copy.cta} <ArrowRight className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => {
          track("cta_clicked", { source: "forge", target: "catalogue" })
          go("/catalogue")
        }}
        className={
          invert
            ? "inline-flex h-11 items-center rounded-md border border-white/30 bg-transparent px-5 text-sm font-medium text-white transition-colors hover:bg-white/10"
            : "inline-flex h-11 items-center rounded-md border border-border bg-transparent px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        }
      >
        Browse the library
      </button>
    </div>
  )
}

function Marquee() {
  const { caps } = useFx()
  if (!caps.marquee) return null
  return (
    <div className="overflow-hidden border-y border-border bg-muted/30">
      <p className="sr-only">
        {TEMPLATES.length} finished templates, {MODULE_TOTAL} playbook modules, {SWITCHES.length} genome
        switches, {EDITION_ORDER.length} editions, {FINISHES.length} finish tiers, {TIERS.length} tiers per industry.
      </p>
      <div className="ed-marquee flex w-max" aria-hidden="true">
        {[0, 1].map((k) => (
          <span
            key={k}
            className="whitespace-nowrap py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
          >
            {MARQUEE_TEXT.repeat(3)}
          </span>
        ))}
      </div>
    </div>
  )
}

function Section({
  id, n, eyebrow, title, desc, children,
}: {
  id: string
  n: string
  eyebrow: string
  title: ReactNode
  desc?: ReactNode
  children: ReactNode
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <header className="mb-10 max-w-3xl">
        <p className="ed-eyebrow">
          <span className="text-primary">{n}</span> — {eyebrow}
        </p>
        <h2 id={`${id}-heading`} className="ed-display mt-3 text-3xl leading-tight sm:text-4xl">
          {title}
        </h2>
        {desc ? <p className="mt-4 text-base leading-relaxed text-muted-foreground">{desc}</p> : null}
      </header>
      {children}
    </section>
  )
}

/* ── the header ───────────────────────────────────────────────────── */

function PageHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => go("/library")}
          className="flex shrink-0 items-center gap-2.5 text-foreground"
          aria-label="Growth OS — open the template library"
        >
          <span aria-hidden className="grid size-7 place-items-center rounded-[7px] bg-primary text-sm font-semibold text-primary-foreground">
            G
          </span>
          <span className="ed-display whitespace-nowrap text-base sm:text-lg">Growth OS</span>
        </button>
        <nav aria-label="Views" className="mx-auto hidden items-center gap-1 sm:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.path}
              href={href(l.path)}
              className="rounded-md px-3 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent(OPEN_PALETTE_EVENT))}
          title="Command palette (⌘K)"
          className="ml-auto inline-flex items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground sm:ml-0"
        >
          <Search className="size-3" aria-hidden />
          <span className="hidden sm:inline">Search</span>
          <span aria-hidden className="rounded border border-border bg-muted/60 px-1 py-px text-[10px]">⌘K</span>
        </button>
      </div>
    </header>
  )
}

/* ── the hero — one of six layouts per edition ────────────────────── */

function Hero() {
  const { id, edition, layers } = useEdition()
  const { motion } = useFx()
  const copy = edition.copy
  const no = pad(EDITION_ORDER.indexOf(id) + 1)
  const rise = motion ? "ed-rise" : ""
  const toId = useCallback(
    (target: string) => {
      document.getElementById(target)?.scrollIntoView({ behavior: motion ? "smooth" : "auto", block: "start" })
    },
    [motion],
  )

  let hero: ReactNode = null

  if (edition.hero === "monument") {
    /* obsidian — a centered ceremonial column with archival numbering */
    hero = (
      <section className="relative isolate overflow-hidden">
        <div key={id} className={`mx-auto max-w-4xl px-4 pb-16 pt-16 text-center sm:pt-24 lg:px-8 ${rise}`}>
          <p className="ed-eyebrow flex items-center justify-center gap-4">
            <span aria-hidden className="h-px w-10 bg-border" />
            {copy.eyebrow}
            <span aria-hidden className="h-px w-10 bg-border" />
          </p>
          <HeroHeadline e={edition} motion={motion} className="mt-6 text-5xl leading-[1.05] sm:text-6xl lg:text-7xl" />
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">{copy.sub}</p>
          <HeroCtas e={edition} className="mt-10 justify-center" onSecondary={() => toId("method")} />
          <p className="mt-12 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            № {no} / {pad(EDITION_ORDER.length)} · {edition.name}
          </p>
        </div>
      </section>
    )
  } else if (edition.hero === "editorial") {
    /* nocturne — huge italic display, generous margins, hairline rules */
    hero = (
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pt-24">
        <div key={id} className={rise}>
          <p className="ed-eyebrow">{copy.eyebrow}</p>
          <HeroHeadline e={edition} motion={motion} className="mt-6 max-w-5xl text-6xl leading-[0.95] sm:text-7xl lg:text-8xl" />
        </div>
        <div className="mt-10 grid gap-10 border-t border-border pt-8 lg:grid-cols-[1fr_1.3fr] lg:items-end">
          <div>
            <p className="text-pretty text-lg leading-relaxed text-muted-foreground">{copy.sub}</p>
            <HeroCtas e={edition} className="mt-8" onSecondary={() => toId("method")} />
          </div>
          <ul className="font-mono text-xs text-muted-foreground">
            {layers.slice(0, 3).map((l, i) => (
              <li key={l.id} className="flex items-baseline gap-3 border-b border-border/60 py-2.5 last:border-0">
                <span className="text-primary">{pad(i + 1)}</span>
                <span className="uppercase tracking-[0.1em]">{l.label}</span>
                <span className="ml-auto text-foreground">{l.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    )
  } else if (edition.hero === "cinema") {
    /* midhigh — a full-bleed dark plate with a colour-mix scrim, no image */
    hero = (
      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(130% 100% at 50% 0%, color-mix(in srgb, var(--primary) 30%, #000) 0%, #000 52%, color-mix(in srgb, var(--accent) 16%, #000) 100%)",
          }}
        />
        <div key={id} className={`relative mx-auto max-w-4xl px-4 py-28 text-center sm:py-36 lg:px-8 ${rise}`}>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">{copy.eyebrow}</p>
          <HeroHeadline e={edition} motion={motion} className="mt-6 text-5xl leading-[1.05] text-white sm:text-6xl lg:text-7xl" />
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-white/75">{copy.sub}</p>
          <HeroCtas e={edition} invert className="mt-10 justify-center" onSecondary={() => toId("method")} />
        </div>
      </section>
    )
  } else if (edition.hero === "blueprint") {
    /* agencyos — split hero with a mono stats rail and the grid underfoot */
    hero = (
      <section className="relative isolate overflow-hidden">
        <div aria-hidden className="ed-blueprint absolute inset-0 -z-10" />
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 pb-14 pt-16 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:pt-24 lg:px-8">
          <div key={id} className={rise}>
            <p className="ed-eyebrow">{copy.eyebrow}</p>
            <HeroHeadline e={edition} motion={motion} className="mt-5 text-4xl leading-[1.05] sm:text-5xl lg:text-6xl" />
            <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">{copy.sub}</p>
            <HeroCtas e={edition} className="mt-8" onSecondary={() => toId("method")} />
          </div>
          <div className="lg:border-l lg:border-border lg:pl-8">
            {STATS.map((s) => (
              <div key={s.label} className="flex items-baseline justify-between gap-6 border-b border-border py-3.5 last:border-0">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{s.label}</span>
                <span className="ed-display text-3xl text-primary">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  } else if (edition.hero === "catalog") {
    /* templateos — headline left, a mosaic of four mini cards right */
    const minis: { value: string; label: string; go: () => void }[] = [
      { value: String(TEMPLATES.length), label: "finished templates", go: () => go("/catalogue") },
      { value: String(MODULE_TOTAL), label: "playbook modules", go: () => go("/playbook") },
      { value: String(EDITION_ORDER.length), label: "editions — switch live", go: () => toId("editions") },
      { value: String(FINISHES.length), label: "finish tiers", go: () => toId("pricing") },
    ]
    hero = (
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pt-24">
        <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr] lg:items-stretch">
          <div key={id} className={`ed-card flex flex-col gap-8 p-8 sm:p-12 ${rise}`}>
            <p className="ed-eyebrow">{copy.eyebrow}</p>
            <div>
              <HeroHeadline e={edition} motion={motion} className="text-4xl leading-[1.05] sm:text-5xl lg:text-6xl" />
              <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">{copy.sub}</p>
            </div>
            <HeroCtas e={edition} onSecondary={() => toId("method")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {minis.map((m) => (
              <button
                key={m.label}
                type="button"
                onClick={m.go}
                className="ed-card flex flex-col items-start justify-between gap-6 p-5 text-left text-foreground transition-transform hover:-translate-y-0.5"
              >
                <span className="ed-display text-4xl text-primary">{m.value}</span>
                <span className="text-sm leading-snug">{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  } else if (edition.hero === "ledger") {
    /* studioos — console style: headline left, live 7-layer readout right */
    hero = (
      <section className="mx-auto w-full max-w-6xl px-4 pb-14 pt-16 sm:px-6 lg:px-8 lg:pt-24">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-center">
          <div key={id} className={rise}>
            <p className="ed-eyebrow flex items-center gap-2">
              {motion && (
                <span aria-hidden className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary" />
                </span>
              )}
              {copy.eyebrow}
            </p>
            <HeroHeadline e={edition} motion={motion} className="mt-5 text-4xl leading-[1.05] sm:text-5xl lg:text-6xl" />
            <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">{copy.sub}</p>
            <HeroCtas e={edition} className="mt-8" onSecondary={() => toId("method")} />
          </div>
          <div className="ed-card relative overflow-hidden">
            {motion && <div aria-hidden className="ed-scanline pointer-events-none absolute inset-x-0 top-0" />}
            <p className="border-b border-border px-5 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Live readout — {LAYER_ORDER.length} layers
            </p>
            <dl className="px-5 py-1">
              {layers.map((l, i) => (
                <div key={l.id} className="grid grid-cols-[4.5rem_1fr] items-baseline gap-3 border-b border-border/60 py-2.5 last:border-0">
                  <dt className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                    {pad(i + 1)} · {l.label}
                  </dt>
                  <dd>
                    <span className="block text-sm leading-tight">{l.value}</span>
                    <span className="block text-[11px] leading-tight text-muted-foreground">{l.note}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      {hero}
      <Marquee />
    </>
  )
}

/* ── the AI band — the intelligence layer, front of house ─────── */

const AI_BAND_SKILLS = [
  { slug: "agent", name: "Agent Chat", note: "one chat · every skill" },
  { slug: "chat", name: "Chat & Content", note: "librarian · copy forge" },
  { slug: "art", name: "Art & Motion", note: "images · reels · motion lab" },
  { slug: "voice", name: "Voice Studio", note: "speech out · speech in" },
  { slug: "research", name: "Vision & Research", note: "see · search · read" },
]

function AiBand() {
  const { caps } = useFx()
  return (
    <section id="ai-band" className="border-b border-border bg-muted/25">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-2xl">
            <p className="ed-eyebrow">Layer one · the AI intelligence</p>
            <h2 className="ed-display mt-3 text-3xl leading-tight sm:text-4xl">
              One agent. <span className="ed-emph">Every skill.</span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              The AI Studio is the first layer of the merged system — one unified agent that can build a website, generate
              its art, render a reel, speak the copy and research the market, all from a single chat. For people who
              prefer buttons to conversation, four guided families — chat, art &amp; motion, voice, research — walk you
              through every skill step by step.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              track("cta_clicked", { source: "forge", target: "ai-studio" })
              go("/ai")
            }}
            className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Open AI Studio <ArrowRight className="size-4" aria-hidden />
          </button>
        </div>
        <ul className={`mt-8 grid grid-cols-2 gap-2 sm:grid-cols-5 ${caps.rise ? "ed-rise" : ""}`}>
          {AI_BAND_SKILLS.map((s) => (
            <li key={s.slug}>
              <button
                type="button"
                onClick={() => go(`/ai/${s.slug}`)}
                className="group flex w-full flex-col gap-1 rounded-lg border border-border bg-card p-3.5 text-left transition hover:border-primary/50 hover:bg-primary/5"
              >
                <span className="text-[13px] font-semibold text-foreground group-hover:text-primary">{s.name}</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{s.note}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ── the method — how the system works ───────────────────────── */

function MethodCard({ n, icon: Icon, title, children }: { n: string; icon: typeof Layers; title: string; children: ReactNode }) {
  return (
    <article className="ed-card flex h-full flex-col gap-4 p-6">
      <div className="flex items-center gap-3">
        <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-md border border-border bg-muted/40">
          <Icon className="size-4 text-primary" />
        </span>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Step {n}</p>
          <h3 className="mt-0.5 font-medium leading-tight">{title}</h3>
        </div>
      </div>
      {children}
    </article>
  )
}

/* ── the genome card's live randomizer — works right on the front door ── */

function GenomeRandomizerRow() {
  const gos = useGos()
  const locked = gos.genomeBudget <= 0
  const changed = SWITCHES.filter((s) => gos.genome[s.id] !== "native").length
  return (
    <div className="mt-auto pt-2">
      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <button
          type="button"
          onClick={() => gos.shuffleGenome()}
          disabled={locked}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium transition-colors hover:border-foreground/30 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Dices className="size-3.5" aria-hidden /> Deal a genome
        </button>
        <button
          type="button"
          onClick={() => gos.setAutoSwap(!gos.autoSwap)}
          aria-pressed={gos.autoSwap}
          disabled={locked}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
            gos.autoSwap
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-muted/40 hover:border-foreground/30"
          }`}
        >
          <Orbit className={`size-3.5 motion-safe:animate-spin motion-safe:[animation-duration:3.4s]`} aria-hidden />
          {gos.autoSwap ? "Cruising" : "Auto-cruise"}
        </button>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
          {locked ? "studio finish — locked" : `${changed}/${gos.genomeBudget} swapped`}
        </span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        {locked
          ? "The Studio finish keeps every template as drawn — move up a finish to unlock the randomizer."
          : "Try it here — the showcase below re-forges through the same switches, live."}
      </p>
    </div>
  )
}

function Method() {
  return (
    <Section
      id="method"
      n="01"
      eyebrow="The method"
      title={<>How the system <span className="ed-emph">works</span>.</>}
      desc="Three contracts hold the whole thing together. Swap any of them and the work keeps its shape — that is what makes an edition click instant and a genome switch safe."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <MethodCard n="01" icon={Layers} title="The token contract">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Every template draws through the same CSS variables. Re-skin one and you re-skin all 23 — nothing
            is hand-painted. The factory kit renders through the same contract via the token bridge.
          </p>
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {TOKENS.map((t) => (
              <li key={t} className="rounded-full border border-border bg-muted/40 px-2.5 py-1 font-mono text-[10px] text-muted-foreground">
                {t}
              </li>
            ))}
          </ul>
        </MethodCard>
        <MethodCard n="02" icon={Dna} title="The genome">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Seven named switches re-token any template without breaking it — curated choices, never raw controls.
          </p>
          <ol className="mt-4 grid gap-1.5 text-sm">
            {SWITCHES.map((s) => (
              <li key={s.id} className="flex items-baseline gap-2.5">
                <span className="font-mono text-[10px] text-primary">{s.no}</span>
                <span>{s.label}</span>
                <span className="ml-auto hidden font-mono text-[10px] text-muted-foreground md:inline">{s.options.length} options</span>
              </li>
            ))}
          </ol>
          <GenomeRandomizerRow />
        </MethodCard>
        <MethodCard n="03" icon={SlidersHorizontal} title="Tiers × finishes">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Product tiers set depth — Starter → Flagship. Finish tiers set theatre — Studio → Private. Two
            independent ladders, both shown before you buy.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="ed-eyebrow mb-2">Depth</p>
              <dl className="border-t border-border text-xs">
                {TIERS.map((t) => (
                  <div key={t.id} className="flex items-baseline justify-between gap-2 border-b border-border py-1.5">
                    <dt>{t.plan}</dt>
                    <dd className="font-mono text-[10px] text-primary">{t.price}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <p className="ed-eyebrow mb-2">Theatre</p>
              <dl className="border-t border-border text-xs">
                {FINISHES.map((f) => (
                  <div key={f.id} className="flex items-baseline justify-between gap-2 border-b border-border py-1.5">
                    <dt>{f.name}</dt>
                    <dd className="font-mono text-[10px] text-primary">{f.price}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </MethodCard>
        <MethodCard n="04" icon={BookOpen} title="The playbook">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {MODULE_TOTAL} modules with rules, a11y and code, tiered Starter → Flagship — the build standard
            every template is audited against.
          </p>
          <div className="mt-auto pt-2">
            <button
              type="button"
              onClick={() => go("/playbook")}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              Open the playbook <ArrowRight className="size-3.5" aria-hidden />
            </button>
          </div>
        </MethodCard>
      </div>
    </Section>
  )
}

/* ── the editions gallery — one click re-forges the page ───────────── */

function EditionCard({ eid, active, onPick }: { eid: EditionId; active: boolean; onPick: () => void }) {
  const e = EDITIONS[eid]
  const p = e.palette[e.nativeMode]
  return (
    <SpinBlock className="h-full">
      <button
        type="button"
        onClick={onPick}
        aria-pressed={active}
        aria-label={`Apply the ${e.name} edition`}
        className={`ed-card flex h-full w-full flex-col gap-4 p-5 text-left text-foreground transition-all ${
          active ? "ring-2 ring-primary" : "hover:-translate-y-0.5 hover:border-foreground/30"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <span className="ed-display text-3xl leading-none text-primary">{e.short}</span>
          <span className="ed-eyebrow">{active ? "Active — live above" : `Layout · ${e.hero}`}</span>
        </div>
        <div>
          <h3 className="ed-display text-xl leading-snug">{e.name}</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{e.tagline}</p>
        </div>
        <dl className="mt-auto grid content-start gap-1 border-t border-border pt-3">
          {LAYER_ORDER.map((l) => (
            <div key={l.id} className="grid grid-cols-[4.6rem_1fr] items-baseline gap-2">
              <dt className="truncate font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">{l.label}</dt>
              <dd className="truncate text-[11px]">{e.layers[l.id].value}</dd>
            </div>
          ))}
        </dl>
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {(["bg", "surface", "ink", "primary", "accent"] as const).map((k) => (
            <span key={k} title={`${k} · ${p[k]}`} className="size-4 rounded-[4px] border border-black/10" style={{ backgroundColor: p[k] }} />
          ))}
        </div>
      </button>
    </SpinBlock>
  )
}

function EditionsGallery() {
  const { id, setEdition } = useEdition()
  return (
    <Section
      id="editions"
      n="02"
      eyebrow="The editions"
      title={<>One click <span className="ed-emph">re-forges</span> the shell.</>}
      desc="Six complete identities for one system — press a card and this page, the hero layout, the type, the material and the copy all move together. The template previews keep their own DNA; that is the genome's job."
    >
      <SpinField className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EDITION_ORDER.map((eid) => (
          <EditionCard key={eid} eid={eid} active={eid === id} onPick={() => setEdition(eid)} />
        ))}
      </SpinField>
    </Section>
  )
}

/* ── the showcase — real sites, rendered live ─────────────────────── */

function ShowcaseCard({ t }: { t: TemplateDef }) {
  const gos = useGos()
  const cursor = useCursorLabel(`OPEN · ${t.name.toUpperCase()}`)
  const tier = tierOf(t.tier)
  const openLibrary = () => {
    gos.select(t.slug)
    go("/library")
  }
  return (
    <SpinBlock className="h-full">
      <article className="ed-card relative flex h-full flex-col overflow-hidden">
        {/* the preview is decorative theatre — inert so tab order and screen readers stay on the overlay button.
            The overlay is a sibling (never a wrapper) so no interactive element ever nests inside another —
            nested buttons break hydration and scramble the SSR DOM. */}
        <div aria-hidden="true" inert className="gos-mini pointer-events-none flex h-[320px] justify-center overflow-hidden border-b border-border">
          {/* genome={gos.siteGenome} — the showcase re-forges live as the
              genome (or the randomizer) moves; the front door is proof too */}
          <SiteFrame tpl={t} genome={gos.siteGenome} page="home" width={360} height={320} style={{ pointerEvents: "none" }} />
        </div>
        <button
          type="button"
          onClick={openLibrary}
          {...cursor}
          className="absolute inset-x-0 top-0 h-[320px] w-full bg-transparent text-left"
          aria-label={`Open ${t.name} in the library`}
        />
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-medium leading-tight">{t.name}</h3>
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">{tier.plan}</span>
          </div>
          <p className="font-mono text-[11px] text-muted-foreground">
            {industryOf(t.industry).label} · {tier.plan} tier
          </p>
          <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-2">
            <button
              type="button"
              onClick={openLibrary}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primary hover:underline"
            >
              Open in the library <ArrowRight className="size-3.5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(`/site/${t.slug}`)}
              className="inline-flex items-center gap-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              Full page <ExternalLink className="size-3" aria-hidden />
            </button>
          </div>
        </div>
      </article>
    </SpinBlock>
  )
}

function Showcase() {
  return (
    <Section
      id="showcase"
      n="03"
      eyebrow="The proof"
      title={<>Open a <span className="ed-emph">finished</span> site.</>}
      desc="Six of the twenty-three, rendering live below — the real sites, not screenshots (Nightflow is module-built from the factory kit). Press one to open it in the library, or take the full page with the consoles."
    >
      <SpinField className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SHOWCASE.map((t) => (
          <ShowcaseCard key={t.slug} t={t} />
        ))}
      </SpinField>
    </Section>
  )
}

/* ── the playbook teaser ───────────────────────────────────────────── */

const SEGMENT_INKS = ["bg-primary/40", "bg-primary/70", "bg-primary", "bg-accent/70", "bg-accent"]

function PlaybookTeaser() {
  return (
    <section id="modules" aria-labelledby="modules-heading" className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <div className="ed-card grid gap-10 p-6 sm:p-10 lg:grid-cols-[1.15fr_1fr] lg:items-center">
        <div>
          <p className="ed-eyebrow">
            <span className="text-primary">04</span> — The build standard
          </p>
          <h2 id="modules-heading" className="ed-display mt-3 text-3xl leading-tight sm:text-4xl">
            The Module Playbook
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {MODULE_TOTAL} modules · 20 sections · every module with real content rules, a11y notes and reference
            code — tiered Starter → Flagship.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {EXAMPLE_MODULES.map((m) => (
              <span key={m} className="rounded-full border border-border bg-muted/40 px-3 py-1 text-[11.5px] text-muted-foreground">
                {m}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={() => go("/playbook")}
            className="mt-8 inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Open the playbook <ArrowRight className="size-4" aria-hidden />
          </button>
        </div>
        <div>
          <p className="ed-eyebrow mb-3">Modules per tier</p>
          <div
            role="img"
            aria-label={`Module split — Starter ${PLAYBOOK_BY_TIER.low}, Growth ${PLAYBOOK_BY_TIER.mid}, Scale ${PLAYBOOK_BY_TIER.scale}, Business ${PLAYBOOK_BY_TIER.high}, Flagship ${PLAYBOOK_BY_TIER.premium}`}
            className="flex h-3 overflow-hidden rounded-full"
          >
            {TIERS.map((t, i) => (
              <span
                key={t.id}
                className={SEGMENT_INKS[i]}
                style={{ width: `${(PLAYBOOK_BY_TIER[t.id] / MODULE_TOTAL) * 100}%` }}
              />
            ))}
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {TIERS.map((t, i) => (
              <div key={t.id}>
                <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span aria-hidden className={`inline-block size-2 rounded-full ${SEGMENT_INKS[i]}`} />
                  {t.plan}
                </dt>
                <dd className="ed-display mt-0.5 text-2xl">{PLAYBOOK_BY_TIER[t.id]}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}

/* ── pricing — the two ladders ────────────────────────────────────── */

/* ── the system map — the merged system's clean paths ──────────────── */

function SystemMapSection() {
  return (
    <section id="paths" aria-labelledby="paths-heading" className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <header className="mb-8 max-w-3xl">
        <p className="ed-eyebrow">The system path — one grammar, every view addressed</p>
        <h2 id="paths-heading" className="ed-display mt-3 text-3xl leading-tight sm:text-4xl">
          Every view has an address.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Both intelligence layers, the library, the catalogue, the playbook, the forge and every finished site live
          under one clean path system — shareable, bookmarkable, back-button honest. Identity is the path; state
          rides in the query — and the genome randomizer (the dice in the topbar) follows you into every view.
        </p>
      </header>
      <div className="ed-card overflow-hidden p-0">
        <ul className="divide-y divide-border">
          {SYSTEM_MAP.map((row) => {
            const live = !row.path.includes("<")
            const inner = (
              <>
                <code className="min-w-[12rem] shrink-0 font-mono text-[12.5px] text-primary">#{row.path}</code>
                <span className="text-sm font-medium">{row.label}</span>
                <span className="ml-auto hidden min-w-0 truncate pl-4 text-xs text-muted-foreground md:block">{row.note}</span>
                {live ? (
                  <ArrowUpRight className="ml-1 size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                ) : (
                  <span className="ml-1 shrink-0 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground/60">deep link</span>
                )}
              </>
            )
            return (
              <li key={row.path}>
                {live ? (
                  <a href={href(row.path)} className="group flex flex-wrap items-baseline gap-x-4 gap-y-1 px-4 py-3 transition-colors hover:bg-muted/60 sm:px-5">
                    {inner}
                  </a>
                ) : (
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-4 py-3 sm:px-5">{inner}</div>
                )}
              </li>
            )
          })}
        </ul>
        <p className="border-t border-border bg-muted/40 px-4 py-2.5 font-mono text-[11px] leading-relaxed text-muted-foreground sm:px-5">
          state → ?finish=spectacle · ?edition=obsidian · ?published=1 · ?on=&lt;slug&gt; — old ?view= links keep resolving
        </p>
      </div>
    </section>
  )
}

function Pricing() {
  const toId = useCallback((target: string) => {
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])
  return (
    <Section
      id="pricing"
      n="05"
      eyebrow="Pricing"
      title={<>Two ladders. One <span className="ed-emph">honest</span> promise.</>}
      desc="Product tiers set how deep the build goes. Finish tiers set how much theatre the shell itself gets. Both are shown working before you buy either."
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <p className="ed-eyebrow mb-3">Depth — product tiers</p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {TIERS.map((t) => (
              <li key={t.id} className="ed-card flex h-full flex-col gap-2 p-5">
                <h3 className="font-medium">{t.plan}</h3>
                <p className="ed-display text-2xl text-primary">{t.price}</p>
                <p className="mt-auto pt-2 text-xs leading-relaxed text-muted-foreground">{t.promise}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="ed-eyebrow mb-3">Theatre — finish tiers</p>
          <ol className="flex flex-col gap-2">
            {FINISHES.map((f) => (
              <li key={f.id} className="ed-card p-4">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[10px] text-primary">{f.no}</span>
                  <h3 className="font-medium">{f.name}</h3>
                  <span className="ml-auto font-mono text-xs text-primary">{f.price}</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{f.blurb}</p>
                <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">{capLine(f.caps)}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="mt-8 flex flex-col items-start gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl font-mono text-[11px] leading-relaxed text-muted-foreground">
          Prices and businesses are demo data. The sites, the flows and the manifests are real.
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => {
              track("cta_clicked", { source: "forge", target: "catalogue" })
              go("/catalogue")
            }}
            className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Browse the catalogue <ArrowRight className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => toId("closing")}
            className="inline-flex h-11 items-center rounded-md border border-border bg-transparent px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Book a walkthrough
          </button>
        </div>
      </div>
    </Section>
  )
}

/* ── closing + the lead form ──────────────────────────────────────── */

const inputCls =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground transition-colors focus-visible:border-primary aria-[invalid]:border-destructive"

type LeadState = { name: string; email: string; business: string; industry: string; budget: string; brief: string }

function Field({
  id, label, required = false, error, children,
}: {
  id: string
  label: string
  required?: boolean
  error?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && (
          <span aria-hidden className="text-primary"> *</span>
        )}
      </label>
      {children}
      {error ? (
        <p id={`${id}-err`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function LeadForm() {
  const [form, setForm] = useState<LeadState>({ name: "", email: "", business: "", industry: "", budget: "", brief: "" })
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({})
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle")
  const [refCode, setRefCode] = useState("")
  const started = useRef(false)

  const bind = (key: keyof LeadState) => ({
    value: form[key],
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  })

  const onFirstFocus = () => {
    if (!started.current) {
      started.current = true
      track("form_started", { source: "forge" })
    }
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const errs: typeof errors = {}
    if (!form.name.trim()) errs.name = "Your name is required."
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) errs.email = "A complete email, so we can reply."
    setErrors(errs)
    if (errs.name || errs.email) {
      document.getElementById(errs.name ? "forge-name" : "forge-email")?.focus()
      return
    }
    setStatus("sending")
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, name: form.name.trim(), email: form.email.trim(), source: "forge" }),
      })
      if (!res.ok) throw new Error(`leads api ${res.status}`)
      setRefCode(`GOS-${Date.now().toString(36).slice(-5).toUpperCase()}`)
      setStatus("done")
      track("form_submitted", { source: "forge" })
    } catch {
      setStatus("error")
    }
  }

  if (status === "done") {
    return (
      <div className="ed-card p-8" role="status">
        <p className="ed-eyebrow">Brief filed</p>
        <p className="ed-display mt-3 text-2xl leading-snug">We reply within one working day.</p>
        <p className="mt-4 text-sm text-muted-foreground">
          Reference <code className="ed-display mx-1 text-lg text-primary">{refCode}</code> — quote it in any
          reply.
        </p>
        <button
          type="button"
          onClick={() => go("/catalogue")}
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          Browse while you wait <ArrowRight className="size-4" aria-hidden />
        </button>
      </div>
    )
  }

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      onFocus={onFirstFocus}
      aria-label="Send a brief"
      className="ed-card grid gap-4 p-6 sm:grid-cols-2 sm:p-8"
    >
      <Field id="forge-name" label="Name" required error={errors.name}>
        <input
          id="forge-name"
          type="text"
          autoComplete="name"
          placeholder="Ada Marsh"
          required
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "forge-name-err" : undefined}
          className={inputCls}
          {...bind("name")}
        />
      </Field>
      <Field id="forge-email" label="Email" required error={errors.email}>
        <input
          id="forge-email"
          type="email"
          autoComplete="email"
          placeholder="ada@business.co.uk"
          required
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "forge-email-err" : undefined}
          className={inputCls}
          {...bind("email")}
        />
      </Field>
      <Field id="forge-business" label="Business" >
        <input id="forge-business" type="text" autoComplete="organization" placeholder="The Marsh Rooms" className={inputCls} {...bind("business")} />
      </Field>
      <Field id="forge-industry" label="Industry">
        <select id="forge-industry" className={inputCls} {...bind("industry")}>
          <option value="">Choose…</option>
          {INDUSTRIES.map((i) => (
            <option key={i.id} value={i.label}>
              {i.label}
            </option>
          ))}
          <option value="Something else">Something else</option>
        </select>
      </Field>
      <Field id="forge-budget" label="Budget">
        <select id="forge-budget" className={inputCls} {...bind("budget")}>
          <option value="">Choose…</option>
          {BUDGETS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </Field>
      <div className="col-span-full flex items-center justify-end sm:col-span-1">
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "sending" ? "Filing your brief…" : "File the brief"}
          {status !== "sending" && <ArrowRight className="size-4" aria-hidden />}
        </button>
      </div>
      <div className="col-span-full">
        <Field id="forge-brief" label="The brief">
          <textarea
            id="forge-brief"
            rows={4}
            placeholder="What are you building, and what must the site actually do?"
            className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors focus-visible:border-primary"
            {...bind("brief")}
          />
        </Field>
      </div>
      {status === "error" && (
        <div role="alert" className="col-span-full flex flex-wrap items-center justify-between gap-3 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <p>The brief did not file — the wire or the server. Nothing was lost.</p>
          <button type="button" onClick={() => setStatus("idle")} className="font-medium underline">
            Try again
          </button>
        </div>
      )}
    </form>
  )
}

function Closing() {
  const { id, edition } = useEdition()
  const { motion } = useFx()
  return (
    <section id="closing" aria-labelledby="closing-heading" className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 pb-20 pt-14 sm:px-6 sm:pt-20 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-start">
        <div>
          <p className="ed-eyebrow">
            <span className="text-primary">06</span> — {edition.copy.signature}
          </p>
          <h2
            key={id}
            className={`ed-display mt-4 text-4xl leading-tight sm:text-5xl ${motion ? "ed-rise" : ""}`}
            id="closing-heading"
          >
            {edition.copy.closing}
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
            Tell us what you are building. A working brief gets a working reply — one working day, no sequences,
            no drip.
          </p>
        </div>
        <LeadForm />
      </div>
    </section>
  )
}

/* ── the footer ────────────────────────────────────────────────────── */

function PageFooter() {
  const { edition } = useEdition()
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
        <div className="max-w-sm">
          <div className="flex items-center gap-2.5">
            <span aria-hidden className="grid size-7 place-items-center rounded-[7px] bg-primary text-sm font-semibold text-primary-foreground">
              G
            </span>
            <span className="ed-display text-lg">Growth OS</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {TEMPLATES.length} finished business templates. Every one honest, every one live.
          </p>
          <p className="mt-2 font-mono text-[11px] leading-relaxed text-muted-foreground/80">
            Prices and businesses are demo data. The sites, the flows and the manifests are real.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {NAV_LINKS.map((l) => (
            <a key={l.path} href={href(l.path)} className="text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="lg:text-right">
          <p className="ed-eyebrow">Forged as</p>
          <p className="ed-display mt-1 text-3xl text-primary">{edition.copy.signature}</p>
        </div>
      </div>
    </footer>
  )
}

/* ── the view ──────────────────────────────────────────────────────── */

export function HomeView() {
  const { edition } = useEdition()
  /*
   * The provider applies the edition vars on <html>, but the --gf-* font
   * faces are declared on <body> (next/font) — so `var(--gf-*)` inside
   * --ed-font-display cannot resolve up there and every ed-display would
   * silently fall back to the body font. Re-declaring the two font vars
   * on this view's root brings them back into scope and restores each
   * edition's true display voice, and it re-applies live on every switch.
   */
  const fontVars = {
    "--ed-font-display": edition.fonts.display,
    "--ed-font-body": edition.fonts.body,
  } as CSSProperties
  return (
    <div className="forge h-full min-h-0 overflow-y-auto overscroll-contain" style={fontVars}>
      <style>{OPT_OUT}</style>
      <div className="flex min-h-full flex-col">
        <PageHeader />
        <main className="flex-1">
          <Hero />
          <AiBand />
          <Method />
          <EditionsGallery />
          <Showcase />
          <PlaybookTeaser />
          <SystemMapSection />
          <Pricing />
          <Closing />
        </main>
        <PageFooter />
      </div>
    </div>
  )
}
