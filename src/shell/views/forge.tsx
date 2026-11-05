"use client"

/**
 * ModuleForge — where the 344-module playbook becomes visible and real.
 *
 *   left   the module browser — every module, searchable, filterable by
 *          section and tier (straight from /api/playbook)
 *   right  the live stage — ANY template with ANY module mounted on it,
 *          rendered in that template's own skin (the token contract),
 *          positioned by slot (hero band / mid / foot band)
 *
 * "Implement any module to any template immediately": pick a module,
 * pick a template, watch it render native. Deep link:
 * #/forge/<moduleId>?on=<slug>.
 */
import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, Blocks, Layers, Loader2, Search, X } from "lucide-react"
import { TEMPLATES, findTemplate, industryOf, type TemplateDef } from "@/engine/registry"
import { tierOf } from "@/engine/tiers"
import { go, readLocation } from "@/engine/nav"
import { track } from "@/engine/analytics"
import { MODULE_TIER_IDS, TIER_LABELS, fetchPlaybookIndex, searchPlaybook, type ModuleTier, type PlaybookModule, type PlaybookSection } from "@/engine/playbook"
import { useGos } from "../gos-context"
import { SiteFrame } from "../site-frame"
import { TypeTools } from "../type-tools"
import { RandomizerTools } from "../randomizer"
import { ModuleCard, type SlotId } from "@/modules"

const SLOTS: { id: SlotId; label: string; hint: string }[] = [
  { id: "hero", label: "Hero band", hint: "Mounted above the fold, first thing seen" },
  { id: "mid", label: "Mid page", hint: "Mounted in the body rhythm, after the primary action" },
  { id: "foot", label: "Foot band", hint: "Mounted with the closing content, last persuasion" },
]

export function ForgeView() {
  const gos = useGos()
  const [sections, setSections] = useState<PlaybookSection[] | null>(null)
  const [total, setTotal] = useState(0)
  const [modules, setModules] = useState<PlaybookModule[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState("")
  const [section, setSection] = useState<string>("all")
  const [tier, setTier] = useState<ModuleTier | "all">("all")
  const [picked, setPicked] = useState<PlaybookModule | null>(null)
  const [tplSlug, setTplSlug] = useState<string>(gos.tpl.slug)
  const [slot, setSlot] = useState<SlotId>("mid")
  const [page, setPage] = useState("home")

  /* deep link #/forge/<moduleId> (+ ?on=<slug> for the mounted template) —
     also adopt the shared selection. One deliberate sync read of the
     location at mount (the same pattern the rest of the shell uses for
     storage/location adoption). */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const loc = readLocation()
    if (loc.on && findTemplate(loc.on)) setTplSlug(loc.on)
    else if (loc.slug && findTemplate(loc.slug)) setTplSlug(loc.slug)
    if (!sections && loc.mod) {
      void searchPlaybook({ q: "" }).then((res) => {
        const m = res.modules.find((x) => x.id === loc.mod)
        if (m) setPicked(m)
      })
    }
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  /* the index (sections + counts) once */
  useEffect(() => {
    let alive = true
    void fetchPlaybookIndex()
      .then((idx) => {
        if (!alive) return
        setSections(idx.sections)
        setTotal(idx.total)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  /* module search — debounced */
  useEffect(() => {
    const id = window.setTimeout(() => {
      setLoading(true)
      void searchPlaybook({ q, section, tier })
        .then((res) => {
          setModules(res.modules)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }, 180)
    return () => window.clearTimeout(id)
  }, [q, section, tier])

  const tpl = useMemo(() => findTemplate(tplSlug) ?? TEMPLATES[0], [tplSlug])

  const chooseModule = (m: PlaybookModule) => {
    setPicked(m)
    track("module_picked", { module: m.id, template: tpl.slug, slot })
  }

  return (
    <div className="forge-view">
      <header className="fv-head">
        <button type="button" className="gos-btn-ghost" onClick={() => go("/library")}>
          <ArrowLeft size={14} aria-hidden /> Library
        </button>
        <div className="fv-head-title">
          <Blocks size={16} aria-hidden />
          <b>Module Forge</b>
          <span className="mono">
            {total ? `${total} modules` : "…"} · any module · any template · rendered live
          </span>
        </div>
        <nav className="fv-head-nav" aria-label="Views">
          <button type="button" onClick={() => go("/library")}>Library</button>
          <button type="button" onClick={() => go("/catalogue")}>Catalogue</button>
          <button type="button" onClick={() => go("/playbook")}>Playbook</button>
        </nav>
      </header>

      <div className="fv-grid">
        {/* ── module browser ─────────────────────────────────────── */}
        <aside className="fv-browser" aria-label="Module browser">
          <div className="fv-search">
            <Search size={14} aria-hidden />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search the 344 modules…"
              aria-label="Search modules"
            />
            {q && (
              <button type="button" onClick={() => setQ("")} aria-label="Clear search">
                <X size={12} />
              </button>
            )}
          </div>
          <div className="fv-filters">
            <select value={section} onChange={(e) => setSection(e.target.value)} aria-label="Filter by section" className="fv-select">
              <option value="all">All {sections?.length ?? 20} sections</option>
              {sections?.map((s) => (
                <option key={s.no} value={s.no}>
                  {s.no} · {s.title} ({s.count})
                </option>
              ))}
            </select>
            <div className="fv-tier-pills" role="group" aria-label="Filter by tier">
              <button type="button" className={tier === "all" ? "on" : ""} onClick={() => setTier("all")}>All</button>
              {MODULE_TIER_IDS.map((t) => (
                <button key={t} type="button" className={tier === t ? "on" : ""} onClick={() => setTier(t)}>
                  {TIER_LABELS[t]}
                </button>
              ))}
            </div>
          </div>
          <p className="fv-count mono" aria-live="polite">
            {loading ? "searching…" : `${modules.length} of ${total} shown`}
          </p>
          <div className="fv-list">
            {loading && !modules.length ? (
              <div className="fv-loading">
                <Loader2 size={16} className="animate-spin" aria-hidden /> Loading the playbook…
              </div>
            ) : (
              modules.map((m) => (
                <ModuleRow key={m.id} m={m} on={picked?.id === m.id} onPick={() => chooseModule(m)} />
              ))
            )}
            {!loading && !modules.length && <p className="fv-empty">No module matches — try another word.</p>}
          </div>
        </aside>

        {/* ── the live stage ─────────────────────────────────────── */}
        <section className="fv-stage" aria-label="Live module stage">
          <div className="fv-controls">
            <label className="fv-ctl">
              <span className="mono">TEMPLATE</span>
              <select
                value={tpl.slug}
                onChange={(e) => {
                  setTplSlug(e.target.value)
                  setPage("home")
                }}
                className="fv-select"
                aria-label="Mount on template"
              >
                {TEMPLATES.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {industryOf(t.industry).label} — {t.name} ({tierOf(t.tier).plan})
                  </option>
                ))}
              </select>
            </label>
            <label className="fv-ctl">
              <span className="mono">SLOT</span>
              <select
                value={slot}
                onChange={(e) => setSlot(e.target.value as SlotId)}
                className="fv-select"
                aria-label="Mount at slot"
              >
                {SLOTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label} — {s.hint}
                  </option>
                ))}
              </select>
            </label>
            {picked && (
              <p className="fv-mounted mono">
                <Layers size={12} aria-hidden />
                {picked.name} · {TIER_LABELS[picked.tier]} · mounted on {tpl.name}
              </p>
            )}
            <div className="fv-ctl fv-ctl-tools">
              <TypeTools />
              <RandomizerTools />
            </div>
          </div>

          <div className="fv-canvas">
            <SiteFrame
              key={`${tpl.slug}-${slot}`}
              tpl={tpl}
              genome={gos.siteGenome}
              page={page}
              onPage={setPage}
              tier={gos.tierStep}
              fontScale={gos.fontScale}
              editMode={gos.editMode}
              remountKey={gos.editResetKey}
              width="100%"
              height="auto"
              className="fv-site"
              insertTop={slot === "hero" && picked ? <ModuleCard m={picked} tpl={tpl} slot={slot} /> : undefined}
              insertBottom={(slot === "mid" || slot === "foot") && picked ? <ModuleCard m={picked} tpl={tpl} slot={slot} /> : undefined}
            />
            {!picked && (
              <div className="fv-hint" role="status">
                <p className="ed-display text-lg">Pick a module — any of the {total || 344}.</p>
                <p>It mounts on {tpl.name} in that template&apos;s own skin: palette, type, corners, motion. Choose a slot, switch templates, watch it re-forge.</p>
              </div>
            )}
          </div>

          {picked && (
            <div className="fv-detail ed-card">
              <header>
                <p className="ed-eyebrow">
                  {picked.sectionNo} · {picked.section} · {TIER_LABELS[picked.tier]} tier
                </p>
                <h2 className="ed-display text-lg">
                  {picked.name} <span className="mono text-xs text-muted-foreground">{picked.file}</span>
                </h2>
              </header>
              <p className="text-sm leading-relaxed">{picked.purpose}</p>
              {picked.rule && (
                <p className="text-[12.5px] leading-relaxed text-muted-foreground">
                  <b className="text-foreground">Rule — </b>
                  {picked.rule}
                </p>
              )}
              <ul className="fv-features" aria-label="Features">
                {picked.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function ModuleRow({ m, on, onPick }: { m: PlaybookModule; on: boolean; onPick: () => void }) {
  return (
    <button type="button" className={`fv-module ${on ? "on" : ""}`} onClick={onPick} aria-pressed={on}>
      <span className={`fv-module-tier mono t-${m.tier}`}>{TIER_LABELS[m.tier]}</span>
      <span className="fv-module-name">{m.name}</span>
      <span className="fv-module-sec mono">
        {m.sectionNo} · {m.section}
      </span>
    </button>
  )
}
