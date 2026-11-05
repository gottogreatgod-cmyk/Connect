"use client"

/**
 * Panel — the template inspector. Ported from the Growth OS library and
 * merged with OMNIFORGE's honest gating:
 *
 *   Genome — DNA readout + the seven switches, with the finish tier's
 *            override cap enforced honestly (presets too)
 *   Tier    — the tier card, siblings, and the ladder comparison table
 *   Build   — positioning, page map, the "why it can't be cloned" list,
 *            module chips LINKED to the 344-module playbook, and the
 *            live contrast quality gate
 */
import { useEffect, useMemo, useState } from "react"
import { Check, ChevronDown, ExternalLink, Lock, RotateCcw, X } from "lucide-react"
import {
  ATMOSPHERES,
  GENOME_PRESETS,
  NATIVE,
  SWITCHES,
  VOICES,
  qualityGate,
  type Genome,
  type SwitchId,
} from "@/engine/genome"
import { resolve } from "@/engine/resolve"
import type { TemplateDef } from "@/engine/registry"
import { LADDER, TIERS, TIER_ORDER, tierOf } from "@/engine/tiers"
import { countOverrides } from "@/engine/finish"
import { go } from "@/engine/nav"
import { useFx } from "./fx"
import { useGos } from "./gos-context"
import { RandomizerSection } from "./randomizer"
import { TierGlyph } from "./sidebar"
import type { Resolved } from "@/engine/resolve"

export type PanelTab = "genome" | "tier" | "build"

export function Panel() {
  const gos = useGos()

  return (
    <aside className="gos-panel" aria-label="Template inspector">
      <div className="gos-panel-tabs" role="tablist">
        {(["genome", "tier", "build"] as PanelTab[]).map((id) => (
          <button key={id} role="tab" aria-selected={gos.panelTab === id} className={gos.panelTab === id ? "on" : ""} onClick={() => gos.setPanelTab(id)}>
            {id === "genome" ? "Genome" : id === "tier" ? "Tier" : "Build"}
          </button>
        ))}
        <button className="gos-icon-btn sm" onClick={() => gos.setPanelOpen(false)} aria-label="Close panel">
          <X size={15} />
        </button>
      </div>
      <div className="gos-panel-body">
        {gos.panelTab === "genome" && <GenomeTab />}
        {gos.panelTab === "tier" && <TierTab />}
        {gos.panelTab === "build" && <BuildTab />}
      </div>
    </aside>
  )
}

/* ── Genome ──────────────────────────────────────────────────────── */

function GenomeTab() {
  const gos = useGos()
  const { caps } = useFx()
  const [open, setOpen] = useState<SwitchId | null>("atmosphere")
  const [notice, setNotice] = useState<string | null>(null)
  const tpl = gos.tpl
  const genome = gos.genome
  const changed = SWITCHES.filter((s) => genome[s.id] !== "native").length
  const resolved = useMemo(() => resolve(tpl, genome), [tpl, genome])
  const p = resolved.palette
  const allowed = caps.genomeOverrides

  const pick = (id: SwitchId, value: string) => {
    const next = { ...genome, [id]: value }
    const overrides = countOverrides(next)
    if (overrides > allowed) {
      setNotice(`This finish allows ${allowed} override${allowed === 1 ? "" : "s"} — you are at ${overrides}. Move up a finish, or reset one.`)
      return
    }
    setNotice(null)
    gos.setGenome(next)
  }

  return (
    <>
      <section className="gos-dna">
        <div className="gos-dna-top">
          <div>
            <p className="eyebrow">Template DNA</p>
            <h3>{tpl.family}</h3>
          </div>
          <span className="gos-specimen" style={{ fontFamily: resolved.display, background: p.bg, color: p.ink, borderColor: p.line }}>
            Aa
          </span>
        </div>
        <div className="gos-palette-strip" aria-label="Current palette">
          {(["bg", "surface", "ink", "muted", "line", "primary", "accent"] as const).map((k) => (
            <span key={k} title={`${k} ${p[k]}`} style={{ background: p[k] }} />
          ))}
        </div>
        <dl className="gos-dna-grid">
          <div>
            <dt>Type</dt>
            <dd>{genome.voice === "native" ? tpl.voice.label : VOICES.find((v) => v.id === genome.voice)?.note}</dd>
          </div>
          <div>
            <dt>Light</dt>
            <dd>{resolved.mode === "dark" ? "Evening" : "Daylight"}</dd>
          </div>
          <div>
            <dt>Corners</dt>
            <dd>{resolved.radius}px</dd>
          </div>
          <div>
            <dt>Motion</dt>
            <dd>
              {["Still", "Subtle", "Signature", "Art-directed"][resolved.motion]}
              {resolved.motion < resolved.motionCap && <em> / cap {["Still", "Subtle", "Signature", "Art-directed"][resolved.motionCap]}</em>}
            </dd>
          </div>
        </dl>
      </section>

      <div className="gos-switch-head">
        <p className="eyebrow">Seven switches</p>
        <span className="sw-budget">
          {changed}/{allowed} used
        </span>
        <button className="gos-link-btn" disabled={!changed} onClick={() => { gos.setGenome(NATIVE); setNotice(null) }}>
          <RotateCcw size={12} /> Reset{changed ? ` (${changed})` : ""}
        </button>
      </div>

      {notice && (
        <p className="gos-cap-notice">
          <Lock size={12} aria-hidden /> {notice}
        </p>
      )}

      <ul className="gos-switches">
        {SWITCHES.map((s) => {
          const cur = s.options.find((o) => o.id === genome[s.id])!
          const isOpen = open === s.id
          return (
            <li key={s.id} className={`gos-switch ${isOpen ? "open" : ""} ${genome[s.id] !== "native" ? "changed" : ""}`}>
              <button className="gos-switch-row" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : s.id)}>
                <span className="gos-sw-no">{s.no}</span>
                <span className="gos-sw-label">{s.label}</span>
                <span className="gos-sw-value">{cur.label}</span>
                <ChevronDown size={14} className="gos-chev" />
              </button>
              {isOpen && (
                <div className="gos-sw-body">
                  <p className="gos-sw-line">{s.line}</p>
                  <div className="gos-options" role="radiogroup" aria-label={s.label}>
                    {s.options.map((o) => {
                      const on = genome[s.id] === o.id
                      const isNative = o.id === "native"
                      const locked = !isNative && countOverrides({ ...genome, [s.id]: o.id }) > allowed
                      return (
                        <button
                          key={o.id}
                          role="radio"
                          aria-checked={on}
                          disabled={locked}
                          className={`gos-opt ${on ? "on" : ""} ${locked ? "locked" : ""}`}
                          onClick={() => pick(s.id, o.id)}
                          title={locked ? `Move up a finish to unlock more overrides` : o.hint}
                        >
                          <OptionArt sw={s.id} id={o.id} tpl={tpl} resolved={resolved} />
                          <span className="gos-opt-text">
                            <b>{o.label}</b>
                            <small>{o.hint}</small>
                          </span>
                          {on && <Check size={14} className="gos-opt-check" />}
                          {locked && <Lock size={12} className="gos-opt-check" aria-label="locked" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      <div className="gos-switch-head">
        <p className="eyebrow">Presets</p>
      </div>
      <ul className="gos-presets">
        {GENOME_PRESETS.map((preset) => {
          const sel = { ...NATIVE, ...preset.sel } as Genome
          const locked = countOverrides(sel) > allowed
          return (
            <li key={preset.id}>
              <button
                type="button"
                disabled={locked}
                className={`gos-preset ${locked ? "locked" : ""}`}
                onClick={() => {
                  setNotice(null)
                  gos.setGenome(sel)
                }}
              >
                <b>{preset.name}</b>
                <small>{preset.note}</small>
                {locked ? (
                  <span className="ps-lock">
                    <Lock size={11} aria-hidden /> needs {preset.overrides}
                  </span>
                ) : (
                  <span className="ps-lock">apply →</span>
                )}
              </button>
            </li>
          )
        })}
      </ul>

      {/* the randomizer — deal a genome · auto-cruise · the swap feed */}
      <RandomizerSection />
    </>
  )
}

/** The visual on each selection card — every option previews itself. */
function OptionArt({ sw, id, tpl, resolved }: { sw: SwitchId; id: string; tpl: TemplateDef; resolved: Resolved }) {
  const mode = resolved.mode
  if (sw === "atmosphere") {
    const pal = id === "native" ? tpl[mode] : ATMOSPHERES.find((a) => a.id === id)![mode]
    return (
      <span className="gos-art gos-art-swatch" style={{ background: pal.bg, borderColor: pal.line }}>
        <i style={{ background: pal.primary }} />
        <i style={{ background: pal.accent }} />
        <i style={{ background: pal.ink }} />
      </span>
    )
  }
  if (sw === "voice") {
    const fam = id === "native" ? tpl.voice.display : VOICES.find((v) => v.id === id)!.display
    return (
      <span className="gos-art gos-art-type" style={{ fontFamily: fam }}>
        Ag
      </span>
    )
  }
  if (sw === "light") {
    const pal = id === "dark" ? tpl.dark : id === "light" ? tpl.light : tpl[tpl.mode]
    return (
      <span className="gos-art gos-art-light" style={{ background: pal.bg, color: pal.ink, borderColor: pal.line }}>
        <i style={{ background: pal.ink }} />
        <i style={{ background: pal.muted }} />
      </span>
    )
  }
  if (sw === "material") {
    const r = id === "crisp" ? 0 : id === "soft" ? Math.max(14, tpl.radius * 1.6) : tpl.radius
    return (
      <span className="gos-art gos-art-corner">
        <i style={{ borderTopLeftRadius: Math.min(r, 22) }} />
      </span>
    )
  }
  if (sw === "density") {
    const gap = id === "compact" ? 2 : id === "airy" ? 7 : 4
    return (
      <span className="gos-art gos-art-density" style={{ gap }}>
        <i />
        <i />
        <i />
      </span>
    )
  }
  if (sw === "motion") {
    const lvl = id === "still" ? 0 : id === "subtle" ? 1 : 3
    return (
      <span className="gos-art gos-art-motion" data-l={lvl}>
        <svg viewBox="0 0 40 16" width={40} height={16} aria-hidden>
          <path
            d={lvl === 0 ? "M2 8 H38" : lvl === 1 ? "M2 8 C10 5, 14 5, 20 8 S30 11, 38 8" : "M2 8 C7 0, 13 0, 17 8 S27 16, 31 8 S37 2, 38 4"}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
          />
        </svg>
      </span>
    )
  }
  const pal = tpl[mode]
  return (
    <span className="gos-art gos-art-contrast" style={{ background: pal.bg, borderColor: pal.line }}>
      <i style={{ background: id === "high" ? pal.ink : pal.muted }} />
      <i style={{ background: id === "high" ? pal.ink : pal.muted, opacity: 0.8 }} />
    </span>
  )
}

/* ── Tier ────────────────────────────────────────────────────────── */

function TierTab() {
  const gos = useGos()
  const tpl = gos.tpl
  const t = tierOf(tpl.tier)

  return (
    <>
      {/* the one home of the tier morph — one design, five depths */}
      <p className="eyebrow">Render depth</p>
      <div className="gos-depth" role="radiogroup" aria-label="Render depth — one design, five depths">
        {TIER_ORDER.map((id) => {
          const on = id === gos.tierStep
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={on}
              className={`gos-depth-rung ${on ? "on" : ""}`}
              onClick={() => gos.setTierStep(id)}
              title={tierOf(id).promise}
            >
              {tierOf(id).plan}
            </button>
          )
        })}
      </div>
      <p className="gos-gate-note">
        One design, five depths — pages, sections and motion follow the step. As drawn: <b>{t.plan}</b>
        {gos.tierStepped ? <> · rendering <b>{tierOf(gos.tierStep).plan}</b></> : ""}.
      </p>

      <section className={`gos-tier-card t-${t.id}`}>
        <div className="tc-top">
          <TierGlyph tier={t.id} />
          <span className="tc-plan">
            {t.plan} <small>{t.short} tier</small>
          </span>
          <span className="tc-price">{t.price}</span>
        </div>
        <p>{t.promise}</p>
      </section>

      <p className="eyebrow mt">What each depth includes</p>
      <div className="gos-ladder-table" role="table" aria-label="Tier comparison">
        <div className="gos-lt-row gos-lt-head" role="row">
          <span role="columnheader" />
          {TIERS.map((x) => (
            <span role="columnheader" key={x.id} className={x.id === tpl.tier ? "cur" : ""}>
              {x.short}
            </span>
          ))}
        </div>
        {LADDER.map((row) => (
          <div className="gos-lt-row" role="row" key={row.label}>
            <span role="rowheader">{row.label}</span>
            {TIERS.map((x) => (
              <span role="cell" key={x.id} className={x.id === tpl.tier ? "cur" : ""}>
                {row.values[x.id]}
              </span>
            ))}
          </div>
        ))}
      </div>
    </>
  )
}

/* ── Build ──────────────────────────────────────────────────────── */

interface PbNameMap {
  [name: string]: { id: string; section: string; tier: string }
}
let pbNameCache: PbNameMap | null = null

function BuildTab() {
  const gos = useGos()
  const tpl = gos.tpl
  const { caps } = useFx()
  const resolved = useMemo(() => resolve(tpl, gos.genome), [tpl, gos.genome])
  const gate = qualityGate(resolved.palette)
  const [pbMap, setPbMap] = useState<PbNameMap | null>(pbNameCache)

  /* fetch the module index once for chip → playbook links */
  useEffect(() => {
    if (pbNameCache) return
    let alive = true
    void fetch("/api/playbook")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!alive || !data?.modules) return
        const map: PbNameMap = {}
        for (const m of data.modules) map[m.name] = { id: m.id, section: m.section, tier: m.tier }
        pbNameCache = map
        setPbMap(map)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  const openModule = (id: string) => {
    go(`/playbook/${id}`)
  }

  return (
    <>
      <p className="eyebrow">Positioning</p>
      <p className="gos-positioning">{tpl.positioning}</p>

      <p className="eyebrow mt">Page map</p>
      <ol className="gos-page-map">
        {tpl.pages.map((p, i) => (
          <li key={p.id}>
            <button className={p.id === gos.page ? "on" : ""} onClick={() => gos.setPage(p.id)}>
              <span>{String(i + 1).padStart(2, "0")}</span> {p.label}
            </button>
          </li>
        ))}
      </ol>

      <p className="eyebrow mt">Why it can't be cloned from a screenshot</p>
      <ul className="gos-sig-list">
        {tpl.signature.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>

      <div className="gos-switch-head">
        <p className="eyebrow">Modules ({tpl.modules.length})</p>
        {pbMap && (
          <button className="gos-link-btn" onClick={() => go("/playbook")}>
            playbook <ExternalLink size={11} aria-hidden />
          </button>
        )}
      </div>
      <ul className="gos-chips">
        {tpl.modules.map((m) => {
          const entry = pbMap?.[m]
          return entry ? (
            <li key={m}>
              <button type="button" className="linked" onClick={() => openModule(entry.id)} title={`${entry.section} · ${entry.tier} tier`}>
                {m} ↗
              </button>
            </li>
          ) : (
            <li key={m}>{m}</li>
          )
        })}
      </ul>
      {pbMap && (
        <p className="gos-gate-note">
          {tpl.modules.filter((m) => pbMap[m]).length} of {tpl.modules.length} map to the 344-module playbook
          {caps.manifestDepth < 5 ? ` · full entries at higher finishes` : ""}.
        </p>
      )}

      <div className="gos-gate">
        <div className="gos-gate-top">
          <p className="eyebrow">Contrast gate · live</p>
          <span className={`gos-gate-score ${gate.passed === gate.checks.length ? "ok" : "warn"}`}>
            {gate.passed}/{gate.checks.length}
          </span>
        </div>
        <ul>
          {gate.checks.map((c) => (
            <li key={c.label} className={c.pass ? "ok" : "warn"}>
              <span>{c.label}</span>
              <b>
                {c.ratio.toFixed(2)}
                <small> / {c.target}</small>
              </b>
            </li>
          ))}
        </ul>
        <p className="gos-gate-note">Recomputed from whatever palette the genome is showing right now.</p>
      </div>
    </>
  )
}
