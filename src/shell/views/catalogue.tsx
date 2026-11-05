"use client"

/**
 * CatalogueView — all 23 templates as a searchable, sortable grid,
 * ported from OMNIFORGE's packs index and re-pointed at the registry.
 * Cards are finish-differentiated (honest caps): Studio is plain and
 * calm, Signature adds shimmer, Showcase adds proximity spin, Spectacle
 * adds the cursor label and full 3D tilt. Each card carries a palette
 * specimen — the template's own DNA, drawn as a plate.
 */
import { useMemo, useState } from "react"
import { ArrowUpRight, LayoutGrid, Rows3, Search, Sparkles, X } from "lucide-react"
import { INDUSTRIES, TEMPLATES, industryOf, type TemplateDef } from "@/engine/registry"
import { go } from "@/engine/nav"
import { track } from "@/engine/analytics"
import { useFx, SpinBlock, SpinField } from "../fx"
import { useGos } from "../gos-context"

type SortId = "plate" | "az" | "industry"
const SORTS: { id: SortId; label: string }[] = [
  { id: "plate", label: "Registry" },
  { id: "az", label: "A → Z" },
  { id: "industry", label: "Industry" },
]

function sortList(list: TemplateDef[], sort: SortId): TemplateDef[] {
  const copy = [...list]
  switch (sort) {
    case "az":
      return copy.sort((a, b) => a.name.localeCompare(b.name))
    case "industry":
      return copy.sort((a, b) => industryOf(a.industry).label.localeCompare(industryOf(b.industry).label) || a.name.localeCompare(b.name))
    default:
      return copy
  }
}

/* ── the plate: each template's DNA drawn as a specimen ─────────── */

function Plate({ t, large }: { t: TemplateDef; large: boolean }) {
  const p = t[t.mode]
  return (
    <div
      className={`plate ${large ? "plate-lg" : ""}`}
      style={{ background: p.bg, borderColor: p.line }}
      aria-hidden
    >
      <div className="plate-row" style={{ color: p.ink }}>
        <span className="plate-mark" style={{ fontFamily: t.voice.display, color: p.primary }}>
          {t.name.split(" ")[0].slice(0, 2)}
        </span>
        <span className="plate-btn" style={{ background: p.primary, color: p.onPrimary, borderRadius: Math.min(t.radius, 14) }} />
      </div>
      <div className="plate-rule" style={{ background: p.line }} />
      <div className="plate-grid">
        <span style={{ background: p.surface, borderRadius: Math.min(t.radius, 10) }} />
        <span style={{ background: p.surface, borderRadius: Math.min(t.radius, 10) }} />
        <span style={{ background: p.accent, opacity: 0.85, borderRadius: Math.min(t.radius, 10) }} />
        <span style={{ background: p.surface, borderRadius: Math.min(t.radius, 10) }} />
      </div>
      <div className="plate-strip">
        {[p.surface, p.ink, p.muted, p.primary, p.accent].map((c, i) => (
          <i key={i} style={{ background: c }} />
        ))}
      </div>
    </div>
  )
}

function TemplateCard({ t, immersive }: { t: TemplateDef; immersive: boolean }) {
  const { caps } = useFx()
  const gos = useGos()

  const open = (via: string) => {
    track("template_viewed", { slug: t.slug, tier: t.tier, via })
    gos.select(t.slug)
  }

  return (
    <SpinBlock className="h-full">
      <button
        type="button"
        onClick={() => open("catalogue")}
        data-cursor-label={caps.cursorFx ? `OPEN · ${t.name.toUpperCase()}` : undefined}
        className={`ed-card group relative block h-full w-full overflow-hidden text-left ${caps.hoverLift ? "transition-transform hover:-translate-y-0.5" : ""}`}
        aria-label={`Open ${t.name} — ${t.kind}`}
      >
        {caps.shimmer && <span className="of-shimmer" aria-hidden />}
        <Plate t={t} large={immersive} />
        <div className="flex flex-col gap-1 p-4">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {industryOf(t.industry).label}
            </span>
          </div>
          <h3 className="ed-display text-lg leading-snug">
            {t.name}
            {t.kit && (
              <span
                className="ml-2 inline-block rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 align-[2px] font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-primary"
                title="Module-built — composed live from the 60-module factory kit"
              >
                kit
              </span>
            )}
          </h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">{t.positioning}</p>
          <div className="mt-1 flex items-center justify-between gap-2 font-mono text-[10px] text-muted-foreground">
            <span>
              {t.kind} · {t.pages.length} {t.pages.length === 1 ? "page" : "pages"}
            </span>
            <span className="inline-flex items-center gap-1 text-primary">
              open <ArrowUpRight size={11} aria-hidden />
            </span>
          </div>
        </div>
      </button>
    </SpinBlock>
  )
}

export function CatalogueView() {
  const { caps } = useFx()
  const [q, setQ] = useState("")
  const [sort, setSort] = useState<SortId>("plate")
  const [industry, setIndustry] = useState<string>("all")
  const [immersive, setImmersive] = useState(false)

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    let list = TEMPLATES
    if (needle) {
      list = list.filter((t) =>
        `${t.name} ${t.kind} ${t.city} ${t.family} ${t.conversion} ${t.positioning} ${t.modules.join(" ")}`
          .toLowerCase()
          .includes(needle),
      )
    }
    if (industry !== "all") list = list.filter((t) => t.industry === industry)
    return sortList(list, sort)
  }, [q, sort, industry])

  const activeFilters = (q ? 1 : 0) + (industry !== "all" ? 1 : 0)

  return (
    <div className="catalogue min-h-0 flex-1 overflow-y-auto">
      <header className="border-b border-border bg-background px-5 pb-8 pt-10 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="ed-eyebrow">The catalogue · every world, one wall</p>
          <h1 className="ed-display mt-2 text-4xl sm:text-5xl">
            All <span className="ed-emph">{TEMPLATES.length}</span> templates.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Every plate is a finished world — search it, sort it, then open it as the full live site.
          </p>
        </div>
      </header>

      <div className="sticky top-0 z-20 border-b border-border bg-background/90 px-5 py-3 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2">
          <label className="relative min-w-52 flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search the 21…"
              className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-8 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Search templates"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            )}
          </label>

          <div role="radiogroup" aria-label="Sort" className="no-scrollbar flex gap-1 overflow-x-auto rounded-lg border border-border bg-muted/50 p-1">
            {SORTS.map((s) => (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={sort === s.id}
                onClick={() => setSort(s.id)}
                className={`shrink-0 rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                  sort === s.id ? "bg-background font-medium text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div role="radiogroup" aria-label="Industry filter" className="no-scrollbar flex gap-1 overflow-x-auto rounded-lg border border-border bg-muted/50 p-1">
            <button
              type="button"
              role="radio"
              aria-checked={industry === "all"}
              onClick={() => setIndustry("all")}
              className={`shrink-0 rounded-md px-2.5 py-1.5 text-xs transition-colors ${industry === "all" ? "bg-background font-medium text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              All
            </button>
            {INDUSTRIES.map((ind) => (
              <button
                key={ind.id}
                type="button"
                role="radio"
                aria-checked={industry === ind.id}
                onClick={() => {
                  setIndustry(ind.id)
                  track("filter_used", { industry: ind.id, via: "catalogue" })
                }}
                className={`shrink-0 rounded-md px-2.5 py-1.5 text-xs transition-colors ${industry === ind.id ? "bg-background font-medium text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                {ind.label.split(" ")[0]}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setImmersive((v) => !v)}
            aria-pressed={immersive}
            className={`inline-flex h-10 items-center gap-2 rounded-md border px-3 text-xs font-medium transition-colors ${
              immersive ? "border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {immersive ? <LayoutGrid className="size-4" aria-hidden /> : <Rows3 className="size-4" aria-hidden />}
            {immersive ? "Immersive" : "Editorial"}
          </button>

          {activeFilters > 0 && (
            <button
              type="button"
              onClick={() => {
                setQ("")
                setIndustry("all")
              }}
              className="inline-flex h-10 items-center gap-1.5 rounded-md border border-primary px-3 text-xs font-medium text-primary transition-colors hover:bg-muted"
            >
              <X className="size-3.5" aria-hidden />
              Clear filters ({activeFilters})
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          {filtered.length} of {TEMPLATES.length} templates
          {caps.spinProximity ? " · proximity fields live" : ""}
        </p>

        <SpinField radius={200}>
          <div
            className={
              immersive
                ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            }
          >
            {filtered.map((t) => (
              <TemplateCard key={t.slug} t={t} immersive={immersive} />
            ))}
          </div>
        </SpinField>
        {!filtered.length && (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Nothing matches that. The 21 is honest — try “restaurant”, “lettings”, “portal”, “clinic”…
          </p>
        )}

        {/* the playbook shelf */}
        <section className="mt-16 border-t border-border pt-10">
          <header className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <p className="ed-eyebrow">Beyond the catalogue</p>
              <h2 className="ed-display text-2xl">The 344-module playbook.</h2>
            </div>
            <p className="max-w-sm text-right text-sm text-muted-foreground">
              Every module with real content, a conversion purpose, a rule, and reference code — Starter → Flagship.
            </p>
          </header>
          <div className="ed-card flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
            <Sparkles className="size-8 shrink-0 text-primary" aria-hidden />
            <div className="flex-1">
              <p className="text-sm font-medium">Browse the build standard behind every template</p>
              <p className="mt-1 text-sm text-muted-foreground">
                20 sections · 344 modules · 23 tracked events · 6 quality gates — each template&apos;s Build tab links its modules straight in.
              </p>
            </div>
            <button
              type="button"
              onClick={() => go("/playbook")}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Open the playbook <ArrowUpRight size={15} aria-hidden />
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
