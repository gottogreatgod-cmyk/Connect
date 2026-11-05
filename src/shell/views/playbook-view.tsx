"use client"

/**
 * PlaybookView — the browsable interface for the 344-module build standard.
 *
 * A scrollable document inside the .gos shell (a clipped 100dvh column, so
 * the view scrolls itself): sticky header + controls, a masthead with the
 * tier distribution, a 20-section card grid that gives way to a grouped
 * module list whenever search / section / tier filters are active, and the
 * standards tail — build order, tier matrix, tracked events, quality gates,
 * flagship index, closing note.
 *
 * Data: GET /api/playbook?index (sections + meta) once and GET /api/playbook
 * (all 344 modules, metadata only) once — filtering then happens client-side.
 * Module code is fetched lazily per module and cached, so reopening a panel
 * is instant. Deep links: #m-<module-id> opens that exact module, expanded
 * and scrolled into view.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import {
  ArrowRight, Blocks, BookOpen, CheckCircle2, ChevronDown, FileCode2, Filter, Layers, Search, X, type LucideIcon,
} from "lucide-react"
import { NAV_EVENT, go, readLocation } from "@/engine/nav"
import { track } from "@/engine/analytics"
import { SpinBlock, SpinField, useFx } from "../fx"

/* ── API shapes (mirror /api/playbook) ──────────────────────────────── */

type Tier = "starter" | "growth" | "business" | "flagship"
type TierFilter = Tier | "all"

interface ApiModule {
  id: string; name: string; section: string; sectionNo: string; tier: Tier; tierRaw: string
  file: string; features: string[]; purpose: string; rule: string
  accessibility: string | null; note: string | null; codeKind: string | null; codeNote: string | null
  hasCode: boolean
}
interface ApiSection {
  no: string; title: string; blurb: string; count: number
  starter: number; growth: number; business: number; flagship: number
}
interface ApiMeta {
  flagshipIndex: { module: string; section: string; file: string; purpose: string }[]
  trackedEvents: { event: string; tells: string }[]
  tierMatrix: { area: string; starter: string; growth: string; business: string; flagship: string }[]
  buildOrder: { stage: string; includes: string; why: string }[]
  qualityGates: { gate: string; detail: string }[]
  closingNote: string
}
interface IndexPayload { ok: boolean; total: number; byTier: Record<Tier, number>; sections: ApiSection[]; meta: ApiMeta }
interface ListPayload extends IndexPayload { modules: ApiModule[] }
type CodeEntry = { status: "loading" } | { status: "ok"; code: string } | { status: "error" }

/* ── constants ───────────────────────────────────────────────────────── */

const TIERS: Tier[] = ["starter", "growth", "business", "flagship"]
const TIER_OPTS: TierFilter[] = ["all", "starter", "growth", "business", "flagship"]
const TIER_LABEL: Record<Tier, string> = { starter: "Starter", growth: "Growth", business: "Business", flagship: "Flagship" }

/** segment colours for the proportional tier bars (spec: /75 · /55 · /35 · accent) */
const SEG: { bar: string; ink: string }[] = [
  { bar: "bg-primary/75", ink: "text-primary-foreground" },
  { bar: "bg-primary/55", ink: "text-primary-foreground" },
  { bar: "bg-primary/35", ink: "text-primary-foreground" },
  { bar: "bg-accent", ink: "text-accent-foreground" },
]
/** tier badge inks for module rows (flagship is filled) */
const TIER_CHIP: Record<Tier, string> = {
  starter: "text-muted-foreground",
  growth: "text-primary",
  business: "text-primary/80 underline decoration-primary/40 underline-offset-4",
  flagship: "rounded-md bg-primary px-1.5 py-px text-primary-foreground",
}
const KIND_LABEL: Record<string, string> = {
  reference: "reference implementation", live: "live in this app", scaffold: "generated scaffold",
}
const LINKS: { path: string; label: string }[] = [
  { path: "/library", label: "Library" }, { path: "/", label: "Home" }, { path: "/catalogue", label: "Catalogue" }, { path: "/forge", label: "Forge" },
]
const TH = "px-3 py-2.5 text-left font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"

/* ── atoms ───────────────────────────────────────────────────────────── */

function Skel({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-lg bg-muted ${className}`} />
}

function StatChip({ n, label }: { n: ReactNode; label: string }) {
  return (
    <span className="inline-flex items-baseline gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
      <b className="font-mono text-sm font-semibold text-primary">{n}</b>
      <span>{label}</span>
    </span>
  )
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 8 }, (_, i) => <Skel key={i} className="h-60" />)}
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 6 }, (_, i) => <Skel key={i} className="h-20" />)}
    </div>
  )
}

function ErrorCard({ onRetry, text, note }: { onRetry: () => void; text: string; note?: string }) {
  return (
    <div className="ed-card flex flex-col items-start gap-3 p-6 sm:p-10">
      <p className="ed-display text-lg text-destructive">{text}</p>
      {note && <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">{note}</p>}
      <button type="button" onClick={onRetry}>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
          Retry
        </span>
      </button>
    </div>
  )
}

function EmptyState({ total, onClear }: { total: number; onClear: () => void }) {
  return (
    <div className="ed-card flex flex-col items-center gap-3 p-10 text-center">
      <p className="ed-display text-lg">No modules match.</p>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        Nothing in the {total}-module standard matches the current search and filters.
      </p>
      <button type="button" onClick={onClear}>
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted">
          <X size={13} aria-hidden /> Clear filters
        </span>
      </button>
    </div>
  )
}

/* ── chrome: header + footer ─────────────────────────────────────────── */

function ViewLinks({ className }: { className?: string }) {
  return (
    <nav aria-label="Growth OS views" className={`flex flex-wrap items-center ${className ?? ""}`}>
      {LINKS.map((l, i) => (
        <span key={l.path} className="flex items-center">
          {i > 0 && <span aria-hidden className="px-1 text-muted-foreground/40">·</span>}
          <button type="button" onClick={() => go(l.path)}>
            <span className="rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              {l.label}
            </span>
          </button>
        </span>
      ))}
    </nav>
  )
}

function PbHeader({ total, loading }: { total: number; loading: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button type="button" onClick={() => go("/library")} aria-label="Growth OS — back to the template library">
          <span className="flex items-center gap-2.5 rounded-lg py-0.5 pl-0.5 pr-2">
            <span aria-hidden className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="ed-display text-sm leading-none">G</span>
            </span>
            <span className="flex min-w-0 flex-col leading-none">
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Growth OS</span>
              <span className="ed-display mt-0.5 truncate text-base sm:text-lg">Module Playbook</span>
            </span>
          </span>
        </button>
        <ViewLinks className="ml-auto hidden md:flex" />
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 font-mono text-[10px] text-muted-foreground md:ml-3">
          <BookOpen size={11} aria-hidden className="text-primary" />
          <b className="font-semibold text-primary">{loading ? "··" : total}</b>
          <span>modules</span>
        </span>
      </div>
    </header>
  )
}

function PbFooter({ total }: { total: number }) {
  return (
    <footer className="mt-auto border-t border-border bg-card/40">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between lg:px-8">
        <div className="max-w-2xl">
          <p className="ed-display text-base">The Module Playbook · Growth OS</p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {total} entries parsed from the playbook source — every module carries its tier, file, purpose, rule and
            reference code.
          </p>
        </div>
        <ViewLinks />
      </div>
    </footer>
  )
}

/* ── masthead ────────────────────────────────────────────────────────── */

function TierBar({ index }: { index: IndexPayload }) {
  const { byTier, total } = index
  /* widths in %, two decimals; the last segment balances the sum to exactly 100 */
  const p = TIERS.map((k) => Math.round(((byTier[k] ?? 0) / total) * 10000) / 100)
  p[3] = Math.round((100 - p[0] - p[1] - p[2]) * 100) / 100
  const label = TIERS.map((k, i) => `${TIER_LABEL[k]} ${byTier[k] ?? 0} (${p[i]}%)`).join(", ")
  return (
    <div className="max-w-3xl">
      <div role="img" aria-label={`Tier distribution: ${label}`} className="flex h-9 w-full overflow-hidden rounded-full border border-border/70 bg-muted/40">
        {TIERS.map((k, i) => (
          <div key={k} title={`${TIER_LABEL[k]} — ${byTier[k] ?? 0} modules (${p[i]}%)`} style={{ width: `${p[i]}%` }}
            className={`flex items-center justify-center ${SEG[i].bar}`}>
            <span className={`font-mono text-[10px] font-semibold ${SEG[i].ink}`}>{byTier[k] ?? 0}</span>
          </div>
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {TIERS.map((k, i) => (
          <li key={k} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span aria-hidden className={`h-2 w-2 rounded-full ${SEG[i].bar}`} />
            <span className="font-medium text-foreground">{TIER_LABEL[k]}</span>
            <span className="font-mono">{byTier[k] ?? 0}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Masthead({ index }: { index: IndexPayload | null }) {
  const meta = index?.meta ?? null
  return (
    <section className="pt-10 md:pt-14">
      <p className="ed-eyebrow">The build standard</p>
      <div className="mt-3 max-w-4xl">
        <h1 className="ed-display text-3xl leading-[1.12] sm:text-4xl lg:text-5xl">
          Every module gets real content, a conversion purpose, a mobile layout, keyboard support, reduced-motion
          behaviour, and an empty/error state — <span className="ed-emph">before any visual layer.</span>
        </h1>
      </div>
      <div className="mt-10">{index ? <TierBar index={index} /> : <Skel className="h-9 w-full max-w-3xl" />}</div>
      <div className="mt-6 flex flex-wrap gap-2">
        {index && meta ? (
          <>
            <StatChip n={index.sections.length} label="sections" />
            <StatChip n={meta.trackedEvents.length} label="tracked events" />
            <StatChip n={meta.qualityGates.length} label="quality gates" />
            <StatChip n={index.total} label="modules with code" />
          </>
        ) : (
          Array.from({ length: 4 }, (_, i) => <Skel key={i} className="h-7 w-28 rounded-full" />)
        )}
      </div>
    </section>
  )
}

/* ── section cards ───────────────────────────────────────────────────── */

function SectionGrid({ sections, onPick, cursorFx }: { sections: ApiSection[]; onPick: (no: string) => void; cursorFx: boolean }) {
  return (
    <SpinField>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {sections.map((s) => (
          <SpinBlock key={s.no} rotor={false} className="h-full">
            <button
              type="button"
              onClick={() => onPick(s.no)}
              aria-label={`Open section ${s.no} — ${s.title} (${s.count} modules)`}
              {...(cursorFx ? { "data-cursor-label": `OPEN · SECTION ${s.no}` } : {})}
            >
              <span className="ed-card group flex h-full w-full flex-col p-5 text-left transition-transform duration-200 hover:-translate-y-1">
                <span className="flex items-start justify-between gap-3">
                  <span aria-hidden className="ed-display text-3xl leading-none text-primary/80">{s.no}</span>
                  <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                    {s.count} modules
                  </span>
                </span>
                <span className="ed-display mt-2.5 text-lg leading-snug">{s.title}</span>
                <span className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{s.blurb}</span>
                <span aria-hidden className="mt-4 flex flex-col gap-1">
                  {TIERS.map((t, i) => {
                    const n = s[t]
                    const w = s.count > 0 ? Math.round((n / s.count) * 100) : 0
                    return (
                      <span key={t} className="flex items-center gap-2">
                        <span className="w-3 font-mono text-[9px] uppercase text-muted-foreground">{t.slice(0, 1)}</span>
                        <span className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                          <span className={`block h-full rounded-full ${SEG[i].bar}`} style={{ width: `${w}%` }} />
                        </span>
                        <span className="w-5 text-right font-mono text-[10px] text-muted-foreground">{n}</span>
                      </span>
                    )
                  })}
                </span>
                <span className="sr-only">Starter {s.starter}, Growth {s.growth}, Business {s.business}, Flagship {s.flagship}.</span>
                <span className="mt-auto flex items-center justify-between pt-5">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors group-hover:text-primary">
                    Open section
                  </span>
                  <ArrowRight size={14} aria-hidden className="text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </span>
              </span>
            </button>
          </SpinBlock>
        ))}
      </div>
    </SpinField>
  )
}

/* ── module row ───────────────────────────────────────────────────────── */

function Detail({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="ed-eyebrow">{label}</span>
      <p className="text-sm leading-relaxed">{text}</p>
    </div>
  )
}

function ModuleRow({
  m, open, entry, codeOpen, onToggle, onLoadCode, onCollapse,
}: {
  m: ApiModule
  open: boolean
  entry: CodeEntry | undefined
  codeOpen: boolean
  onToggle: (id: string) => void
  onLoadCode: (id: string) => void
  onCollapse: (id: string) => void
}) {
  return (
    <div id={`m-${m.id}`} className="ed-card overflow-hidden">
      <button type="button" aria-expanded={open} aria-controls={`m-${m.id}-detail`} onClick={() => onToggle(m.id)}>
        <span className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/40 sm:px-5 sm:py-4 ${open ? "bg-muted/30" : ""}`}>
          <span className="flex w-14 shrink-0 flex-col gap-1.5 pt-0.5">
            <span className={`font-mono text-[9px] uppercase leading-relaxed tracking-[0.12em] ${TIER_CHIP[m.tier]}`}>{m.tierRaw}</span>
            <span className="font-mono text-[10px] text-muted-foreground/80">{m.sectionNo}</span>
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="ed-display truncate text-base leading-snug sm:text-lg">{m.name}</span>
            <span className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">{m.file}</span>
            {m.features.length > 0 && (
              <span className="mt-2 flex flex-wrap gap-1.5">
                {m.features.slice(0, 4).map((f) => (
                  <span key={f} className="rounded-full border border-border bg-muted/40 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">{f}</span>
                ))}
                {m.features.length > 4 && (
                  <span className="rounded-full border border-dashed border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground/80">
                    +{m.features.length - 4}
                  </span>
                )}
              </span>
            )}
          </span>
          <ChevronDown size={16} aria-hidden className={`mt-1 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </span>
      </button>

      {open && (
        <div id={`m-${m.id}-detail`} className="border-t border-border/70 px-4 pb-5 pt-4 sm:px-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Detail label="Purpose" text={m.purpose} />
            <Detail label="Rule — the pitfall that bites" text={m.rule} />
          </div>
          {([["Accessibility", m.accessibility], ["Note", m.note]] as [string, string | null][])
            .filter((p): p is [string, string] => !!p[1])
            .map(([label, v]) => (
              <div key={label} className="mt-4 max-w-3xl">
                <Detail label={label} text={v} />
              </div>
            ))}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {m.codeKind && (
              <span className="rounded-full bg-primary/10 px-2.5 py-1 font-mono text-[10px] text-primary">
                {KIND_LABEL[m.codeKind] ?? m.codeKind}
              </span>
            )}
            {m.codeNote && (
              <span className="min-w-0 flex-1 basis-52 truncate font-mono text-[10px] text-muted-foreground" title={m.codeNote}>{m.codeNote}</span>
            )}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                go(`/forge/${m.id}`)
                onCollapse(m.id)
              }}
              title="Render this module live, mounted on any template, in the Module Forge"
            >
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary/50 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10">
                <Blocks size={13} aria-hidden /> Try it live · any template
              </span>
            </button>
            {!m.hasCode ? (
              <p className="text-xs text-muted-foreground">No reference code recorded for this module.</p>
            ) : !codeOpen ? (
              <button type="button" onClick={() => onLoadCode(m.id)}>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90">
                  <FileCode2 size={13} aria-hidden /> Load reference code
                </span>
              </button>
            ) : entry?.status === "ok" ? (
              <div>
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate font-mono text-[10px] text-muted-foreground">{m.file}</span>
                  <button type="button" onClick={() => onCollapse(m.id)}>
                    <span className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                      <ChevronDown size={12} aria-hidden className="rotate-180" /> Collapse
                    </span>
                  </button>
                </div>
                <pre className="mt-2 max-h-80 overflow-auto whitespace-pre rounded-lg bg-muted p-4 font-mono text-xs leading-relaxed">
                  {entry.code}
                </pre>
              </div>
            ) : entry?.status === "loading" ? (
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[10px] text-muted-foreground">Loading reference code…</span>
                <Skel className="h-64 w-full" />
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs text-destructive">Could not load the code.</span>
                <button type="button" onClick={() => onLoadCode(m.id)}>
                  <span className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    Retry
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── standards tail ───────────────────────────────────────────────────── */

function StandardCard({ n, title, icon: Icon, children }: { n: string; title: string; icon?: LucideIcon; children: ReactNode }) {
  return (
    <section className="ed-card p-5 sm:p-8">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="ed-eyebrow">Standards · {n}</p>
          <h2 className="ed-display text-xl sm:text-2xl">{title}</h2>
        </div>
        {Icon && <Icon size={18} aria-hidden className="mt-1 shrink-0 text-muted-foreground" />}
      </header>
      {children}
    </section>
  )
}

function StandardsTail({ meta }: { meta: ApiMeta | null }) {
  return (
    <section aria-label="The standards" className="mt-16 md:mt-24">
      <div className="flex flex-col gap-6">
        {!meta ? (
          <Skel className="h-72" />
        ) : (
          <>
            {/* 1 · build order — numbered vertical timeline */}
            <StandardCard n="01" title="Build order" icon={Layers}>
              <div className="relative">
                <span aria-hidden className="absolute bottom-4 left-4 top-4 w-px bg-border" />
                <ol className="flex flex-col gap-7">
                  {meta.buildOrder.map((b, i) => {
                    const match = /^(\d+)\s*[·-]\s*(.+)$/.exec(b.stage)
                    const num = match ? match[1] : String(i + 1).padStart(2, "0")
                    const name = match ? match[2] : b.stage
                    return (
                      <li key={b.stage} className="relative flex gap-4">
                        <span aria-hidden className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-[11px] font-semibold text-primary-foreground">
                          {num}
                        </span>
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                          <h3 className="ed-display text-base sm:text-lg">{name}</h3>
                          <div className="flex flex-wrap gap-1.5">
                            {b.includes.split(",").map((c) => c.trim()).filter(Boolean).map((c) => (
                              <span key={c} className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">{c}</span>
                            ))}
                          </div>
                          <p className="text-sm leading-relaxed text-muted-foreground">{b.why}</p>
                        </div>
                      </li>
                    )
                  })}
                </ol>
              </div>
            </StandardCard>

            {/* 2 · tier matrix — flagship column subtly highlighted */}
            <StandardCard n="02" title="Tier matrix" icon={Filter}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b-2 border-border">
                      {["Area", "Starter", "Growth", "Business"].map((h) => (
                        <th key={h} scope="col" className={TH}>{h}</th>
                      ))}
                      <th scope="col" className={`${TH} bg-muted/50 text-foreground`}>Flagship</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meta.tierMatrix.map((r) => (
                      <tr key={r.area} className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/30">
                        <th scope="row" className="px-3 py-2.5 text-left font-medium">{r.area}</th>
                        {(["starter", "growth", "business"] as const).map((k) => (
                          <td key={k} className="px-3 py-2.5 text-muted-foreground">{r[k]}</td>
                        ))}
                        <td className="bg-muted/50 px-3 py-2.5 font-medium">{r.flagship}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </StandardCard>

            {/* 3 · tracked events */}
            <StandardCard n="03" title="Tracked events" icon={BookOpen}>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {meta.trackedEvents.map((e) => (
                  <li key={e.event} className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2.5">
                    <span className="font-mono text-[11px] font-semibold text-primary">{e.event}</span>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{e.tells}</p>
                  </li>
                ))}
              </ul>
            </StandardCard>

            {/* 4 · quality gates */}
            <StandardCard n="04" title="Quality gates" icon={CheckCircle2}>
              <ol className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {meta.qualityGates.map((g, i) => (
                  <li key={g.gate} className="rounded-xl border border-border/70 bg-muted/25 p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={15} aria-hidden className="shrink-0 text-primary" />
                      <h3 className="ed-display text-sm sm:text-base">{g.gate}</h3>
                      <span aria-hidden className="ml-auto font-mono text-[10px] text-muted-foreground/70">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{g.detail}</p>
                  </li>
                ))}
              </ol>
            </StandardCard>

            {/* 5 · flagship index — file column hidden on mobile */}
            <StandardCard n="05" title="Flagship index" icon={ArrowRight}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {["Module", "Section", "Purpose", "File"].map((h, i) => (
                        <th key={h} scope="col" className={`${TH} ${i === 3 ? "hidden md:table-cell" : ""}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {meta.flagshipIndex.map((r) => (
                      <tr key={r.module} className="border-b border-border/50 transition-colors last:border-0 hover:bg-muted/30">
                        <td className="px-3 py-2 font-medium">{r.module}</td>
                        <td className="max-w-[200px] truncate px-3 py-2 text-xs text-muted-foreground" title={r.section}>{r.section}</td>
                        <td className="px-3 py-2 text-xs leading-relaxed text-muted-foreground">{r.purpose}</td>
                        <td className="hidden px-3 py-2 font-mono text-[10px] text-muted-foreground md:table-cell">{r.file}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </StandardCard>

            {/* 6 · closing note — pull-quote */}
            <section className="ed-card p-6 sm:p-10">
              <header className="mb-6 flex flex-col gap-1">
                <p className="ed-eyebrow">Standards · 06</p>
                <h2 className="ed-display text-xl sm:text-2xl">Closing note</h2>
              </header>
              <blockquote style={{ fontStyle: "italic" }} className="ed-display max-w-3xl border-l-2 border-primary pl-6 text-xl leading-relaxed sm:text-2xl">
                {meta.closingNote}
              </blockquote>
            </section>
          </>
        )}
      </div>
    </section>
  )
}

/* ── the view ────────────────────────────────────────────────────────── */

export function PlaybookView() {
  const { caps } = useFx()

  /* data */
  const [index, setIndex] = useState<IndexPayload | null>(null)
  const [modules, setModules] = useState<ApiModule[] | null>(null)
  const [idxErr, setIdxErr] = useState(false)
  const [modErr, setModErr] = useState(false)

  /* controls */
  const [query, setQuery] = useState("")
  const [dq, setDq] = useState("") /* debounced query */
  const [section, setSection] = useState("all")
  const [tier, setTier] = useState<TierFilter>("all")

  /* open rows + lazily loaded, cached code */
  const [expanded, setExpanded] = useState<string | null>(null)
  const [deep, setDeep] = useState<string | null>(null)
  const [codeCache, setCodeCache] = useState<Record<string, CodeEntry>>({})
  const [codeShown, setCodeShown] = useState<string | null>(null)

  const scrollReq = useRef<"top" | "list" | null>(null)
  const scroller = useRef<HTMLDivElement | null>(null)
  const controlsBar = useRef<HTMLDivElement | null>(null)
  const listAnchor = useRef<HTMLDivElement | null>(null)
  const radioRefs = useRef<(HTMLButtonElement | null)[]>([])

  const total = index?.total ?? 344 /* placeholder until the index loads */
  const sections = index?.sections ?? null
  const meta = index?.meta ?? null
  const byTier = index?.byTier

  /* fetch the index (sections + meta) and the full module list, once each */
  const load = useCallback(async () => {
    setIdxErr(false)
    setModErr(false)
    const idx: Promise<IndexPayload> = fetch("/api/playbook?index").then(async (r) => {
      if (!r.ok) throw new Error("index failed")
      const j = (await r.json()) as IndexPayload
      if (!j.ok) throw new Error("index failed")
      return j
    })
    void idx.then((j) => setIndex(j)).catch(() => setIdxErr(true))
    try {
      const r = await fetch("/api/playbook")
      if (!r.ok) throw new Error("modules failed")
      const j = (await r.json()) as ListPayload
      if (!j.ok || !Array.isArray(j.modules)) throw new Error("modules failed")
      setModules(j.modules)
      setIndex((prev) => prev ?? { ok: true, total: j.total, byTier: j.byTier, sections: j.sections, meta: j.meta })
    } catch {
      setModErr(true)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  /* debounced search (400ms) + search_used */
  useEffect(() => {
    const t = window.setTimeout(() => {
      const v = query.trim().toLowerCase()
      if (v === dq) return
      setDq(v)
      if (v) track("search_used", { view: "playbook", q: v.slice(0, 80) })
    }, 400)
    return () => window.clearTimeout(t)
  }, [query, dq])

  /* deep links: #/playbook/<moduleId> → open that module's section, expanded.
     Listens to every navigation event so palette links and the back
     button land here too (idempotent — the expanded id is the guard). */
  const applyHash = useCallback(async () => {
    const id = readLocation().mod
    if (!id) return
    try {
      const r = await fetch(`/api/playbook?module=${encodeURIComponent(id)}`)
      if (!r.ok) return
      const j = (await r.json()) as { ok: boolean; module?: ApiModule & { code: string | null } }
      if (!j.ok || !j.module) return
      const m = j.module
      setCodeCache((p) => (p[id]?.status === "ok" ? p : { ...p, [id]: { status: "ok", code: m.code ?? "" } }))
      scrollReq.current = null
      setSection(m.sectionNo)
      setTier("all")
      setQuery("")
      setDq("")
      setExpanded(id)
      setCodeShown(id)
      setDeep(id)
      if (m.code) track("media_opened", { view: "playbook", module: id })
    } catch {
      /* a deep link must never break the page */
    }
  }, [])

  useEffect(() => {
    void applyHash()
    const onNav = () => void applyHash()
    window.addEventListener(NAV_EVENT, onNav)
    window.addEventListener("hashchange", onNav)
    window.addEventListener("popstate", onNav)
    return () => {
      window.removeEventListener(NAV_EVENT, onNav)
      window.removeEventListener("hashchange", onNav)
      window.removeEventListener("popstate", onNav)
    }
  }, [applyHash])

  /* client-side filtering over the full list (mirrors the server's match) */
  const filtered = useMemo(() => {
    if (!modules) return [] as ApiModule[]
    return modules.filter((m) => {
      if (tier !== "all" && m.tier !== tier) return false
      if (section !== "all" && m.sectionNo !== section) return false
      if (dq) {
        const hay = `${m.name} ${m.section} ${m.tierRaw} ${m.file} ${m.purpose} ${m.rule} ${m.features.join(" ")} ${m.note ?? ""}`.toLowerCase()
        if (!hay.includes(dq)) return false
      }
      return true
    })
  }, [modules, dq, section, tier])

  /* group by section, ordered by section number */
  const groups = useMemo(() => {
    const map = new Map<string, { no: string; title: string; items: ApiModule[] }>()
    for (const m of filtered) {
      const g = map.get(m.sectionNo)
      if (g) g.items.push(m)
      else map.set(m.sectionNo, { no: m.sectionNo, title: m.section, items: [m] })
    }
    const out = [...map.values()]
    out.sort((a, b) => a.no.localeCompare(b.no, "en", { numeric: true }))
    return out
  }, [filtered])

  const active = dq !== "" || section !== "all" || tier !== "all"

  /* scroll reset whenever filters change */
  useEffect(() => {
    if (!modules) return
    const req = scrollReq.current
    scrollReq.current = null
    const root = scroller.current
    if (!req || !root) return
    if (req === "top") {
      root.scrollTo({ top: 0 })
      return
    }
    const el = listAnchor.current
    if (!el) return
    const off = 56 + (controlsBar.current?.offsetHeight ?? 0) + 8
    root.scrollTo({ top: el.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop - off })
  }, [dq, section, tier, modules])

  /* deep link: scroll the module row into view once it has rendered */
  useEffect(() => {
    if (!deep || !modules || expanded !== deep) return
    const el = document.getElementById(`m-${deep}`)
    if (!el) return
    el.scrollIntoView({ block: "center" })
    el.querySelector<HTMLElement>("button[aria-expanded]")?.focus({ preventScroll: true })
    setDeep(null)
  }, [deep, modules, expanded])

  /* ── handlers ── */
  const changeTier = (next: TierFilter) => {
    if (next === tier) return
    setTier(next)
    setExpanded(null)
    setCodeShown(null)
    scrollReq.current = "top"
    track("filter_used", { view: "playbook", filter: "tier", value: next })
  }

  const onTierKey = (e: { key: string; preventDefault: () => void }) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight" && e.key !== "ArrowUp" && e.key !== "ArrowDown") return
    e.preventDefault()
    const dir = e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 1
    const i = TIER_OPTS.indexOf(tier)
    const next = TIER_OPTS[(i + dir + TIER_OPTS.length) % TIER_OPTS.length]
    changeTier(next)
    radioRefs.current[TIER_OPTS.indexOf(next)]?.focus()
  }

  const applySection = (no: string) => {
    if (no === section) return
    setSection(no)
    setExpanded(null)
    setCodeShown(null)
    scrollReq.current = "list"
    track("filter_used", { view: "playbook", filter: "section", value: no })
  }

  const clearAll = () => {
    setQuery("")
    setDq("")
    setSection("all")
    setTier("all")
    setExpanded(null)
    setCodeShown(null)
    scrollReq.current = "top"
    track("filter_used", { view: "playbook", filter: "clear" })
  }

  const toggleRow = (id: string) => {
    const closing = expanded === id
    setExpanded(closing ? null : id)
    if (closing) setCodeShown((c) => (c === id ? null : c))
  }

  const loadCode = useCallback(
    async (id: string) => {
      const cur = codeCache[id]
      setCodeShown(id)
      if (cur && cur.status !== "error") return /* cached — instant */
      setCodeCache((p) => ({ ...p, [id]: { status: "loading" } }))
      try {
        const r = await fetch(`/api/playbook?module=${encodeURIComponent(id)}`)
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const j = (await r.json()) as { ok: boolean; module?: ApiModule & { code: string | null } }
        if (!j.ok || !j.module) throw new Error("bad payload")
        setCodeCache((p) => ({ ...p, [id]: { status: "ok", code: j.module?.code ?? "" } }))
        track("media_opened", { view: "playbook", module: id })
      } catch {
        setCodeCache((p) => ({ ...p, [id]: { status: "error" } }))
      }
    },
    [codeCache],
  )

  const collapseCode = useCallback((id: string) => {
    setCodeShown((c) => (c === id ? null : c))
  }, [])

  /* both fetches failed → an honest, retryable error page */
  if (!index && idxErr && modErr) {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto bg-background text-foreground">
        <div className="flex min-h-full flex-col">
          <PbHeader total={total} loading />
          <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
            <ErrorCard
              onRetry={() => void load()}
              text="Could not load the playbook."
              note="The build-standard data is served by /api/playbook and did not respond. Check the server, then retry."
            />
          </main>
          <PbFooter total={total} />
        </div>
      </div>
    )
  }

  return (
    <div
      ref={scroller}
      data-view="playbook"
      className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto bg-background text-foreground"
    >
      <div className="flex min-h-full flex-col">
        <PbHeader total={total} loading={!index} />

        {/* controls bar — sticky under the header */}
        <div ref={controlsBar} className="sticky top-14 z-30 border-b border-border bg-background/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:px-6 lg:px-8">
            <label className="relative min-w-0 flex-1 sm:max-w-xs md:max-w-sm">
              <span className="sr-only">Search modules</span>
              <Search size={14} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  scrollReq.current = "top"
                }}
                placeholder={`Search ${total} modules — try 'booking', 'menu', 'portal'…`}
                className="h-9 w-full rounded-lg border border-input bg-card pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground/70"
              />
            </label>

            <label className="relative inline-flex items-center">
              <span className="sr-only">Filter by section</span>
              <select
                value={section}
                onChange={(e) => applySection(e.target.value)}
                disabled={!sections}
                className="h-9 appearance-none rounded-lg border border-input bg-card pl-3 pr-8 text-sm text-foreground disabled:opacity-60"
              >
                <option value="all">All {sections?.length ?? 20} sections</option>
                {sections?.map((s) => (
                  <option key={s.no} value={s.no}>
                    {s.no} · {s.title} ({s.count})
                  </option>
                ))}
              </select>
              <ChevronDown size={14} aria-hidden className="pointer-events-none absolute right-2.5 text-muted-foreground" />
            </label>

            <div role="radiogroup" aria-label="Tier filter" onKeyDown={onTierKey} className="flex flex-wrap items-center gap-1.5">
              {TIER_OPTS.map((t, i) => (
                <button
                  key={t}
                  ref={(el) => {
                    radioRefs.current[i] = el
                  }}
                  type="button"
                  role="radio"
                  aria-checked={tier === t}
                  tabIndex={tier === t ? 0 : -1}
                  onClick={() => changeTier(t)}
                >
                  <span
                    className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-xs transition-colors ${
                      tier === t
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {t === "all" ? "All" : TIER_LABEL[t]}
                    {t !== "all" && <span className="font-mono text-[10px] opacity-70">{byTier?.[t] ?? "·"}</span>}
                  </span>
                </button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2.5">
              <span aria-live="polite" className="whitespace-nowrap font-mono text-[11px] text-muted-foreground">
                {modules ? `${filtered.length} of ${total}` : "··"} modules
              </span>
              {active && (
                <button type="button" onClick={clearAll}>
                  <span className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-card px-2.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    <X size={12} aria-hidden /> Clear
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 sm:px-6 lg:px-8">
          <Masthead index={index} />

          <section aria-label="Browse the modules" className="mt-12 md:mt-16">
            {!active ? (
              <>
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <p className="ed-eyebrow">Browse</p>
                    <h2 className="ed-display text-2xl sm:text-3xl">The {sections?.length ?? 20} sections</h2>
                  </div>
                  <p className="text-xs text-muted-foreground">Click a section to open its modules.</p>
                </div>
                {sections ? (
                  <SectionGrid sections={sections} onPick={applySection} cursorFx={caps.cursorFx} />
                ) : (
                  <GridSkeleton />
                )}
              </>
            ) : (
              <div ref={listAnchor}>
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <p className="ed-eyebrow">Browse</p>
                    <h2 className="ed-display text-2xl sm:text-3xl">Modules</h2>
                  </div>
                  <p className="whitespace-nowrap font-mono text-[11px] text-muted-foreground">
                    {filtered.length} of {total} shown
                  </p>
                </div>
                {modErr ? (
                  <ErrorCard
                    onRetry={() => void load()}
                    text="Could not load the modules."
                    note="The module list is served by /api/playbook and did not respond."
                  />
                ) : !modules ? (
                  <ListSkeleton />
                ) : filtered.length === 0 ? (
                  <EmptyState total={total} onClear={clearAll} />
                ) : (
                  groups.map((g) => (
                    <section key={g.no} aria-label={`Section ${g.no} — ${g.title}`} className="mt-9 first:mt-0">
                      <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span aria-hidden className="font-mono text-xs font-semibold text-primary">{g.no}</span>
                        <h3 className="ed-display text-lg leading-snug">{g.title}</h3>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {g.items.length} {g.items.length === 1 ? "module" : "modules"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-3">
                        {g.items.map((m) => (
                          <ModuleRow
                            key={m.id}
                            m={m}
                            open={expanded === m.id}
                            entry={codeCache[m.id]}
                            codeOpen={codeShown === m.id}
                            onToggle={toggleRow}
                            onLoadCode={(id) => void loadCode(id)}
                            onCollapse={collapseCode}
                          />
                        ))}
                      </div>
                    </section>
                  ))
                )}
              </div>
            )}
          </section>

          <StandardsTail meta={meta} />
        </main>

        <PbFooter total={total} />
      </div>
    </div>
  )
}
