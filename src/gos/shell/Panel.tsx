import { useState } from "react"
import { Check, ChevronDown, RotateCcw, X } from "lucide-react"
import { ATMOSPHERES, NATIVE, SWITCHES, VOICES, qualityGate, type Genome, type SwitchId } from "../engine/genome"
import { siblingsOf, type TemplateDef } from "../engine/registry"
import type { Resolved } from "../engine/resolve"
import { LADDER, TIERS, tierOf } from "../engine/tiers"
import { TierGlyph } from "./Sidebar"

export type PanelTab = "genome" | "tier" | "build"

interface Props {
  tpl: TemplateDef
  tab: PanelTab
  onTab: (t: PanelTab) => void
  genome: Genome
  onGenome: (g: Genome) => void
  resolved: Resolved
  page: string
  onPage: (p: string) => void
  onSelect: (s: string) => void
  onClose: () => void
}

export function Panel(props: Props) {
  const { tab, onTab, onClose } = props
  const tabs: [PanelTab, string][] = [
    ["genome", "Genome"],
    ["tier", "Tier"],
    ["build", "Build"],
  ]
  return (
    <aside className="panel" aria-label="Template inspector">
      <div className="panel-tabs" role="tablist">
        {tabs.map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? "on" : ""} onClick={() => onTab(id)}>
            {label}
          </button>
        ))}
        <button className="icon-btn sm" onClick={onClose} aria-label="Close panel">
          <X size={15} />
        </button>
      </div>
      <div className="panel-body">
        {tab === "genome" && <GenomeTab {...props} />}
        {tab === "tier" && <TierTab {...props} />}
        {tab === "build" && <BuildTab {...props} />}
      </div>
    </aside>
  )
}

/* ── Genome ──────────────────────────────────────────────────────── */

function GenomeTab({ tpl, genome, onGenome, resolved }: Props) {
  const [open, setOpen] = useState<SwitchId | null>("atmosphere")
  const changed = SWITCHES.filter((s) => genome[s.id] !== "native").length
  const p = resolved.palette

  return (
    <>
      <section className="dna">
        <div className="dna-top">
          <div>
            <p className="eyebrow">Template DNA</p>
            <h3>{tpl.family}</h3>
          </div>
          <span className="specimen" style={{ fontFamily: resolved.display, background: p.bg, color: p.ink, borderColor: p.line }}>
            Aa
          </span>
        </div>
        <div className="palette-strip" aria-label="Current palette">
          {(["bg", "surface", "ink", "muted", "line", "primary", "accent"] as const).map((k) => (
            <span key={k} title={`${k} ${p[k]}`} style={{ background: p[k] }} />
          ))}
        </div>
        <dl className="dna-grid">
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

      <div className="switch-head">
        <p className="eyebrow">Seven switches</p>
        <button className="link-btn" disabled={!changed} onClick={() => onGenome(NATIVE)}>
          <RotateCcw size={12} /> Reset{changed ? ` (${changed})` : ""}
        </button>
      </div>

      <ul className="switches">
        {SWITCHES.map((s) => {
          const cur = s.options.find((o) => o.id === genome[s.id])!
          const isOpen = open === s.id
          return (
            <li key={s.id} className={`switch ${isOpen ? "open" : ""} ${genome[s.id] !== "native" ? "changed" : ""}`}>
              <button className="switch-row" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : s.id)}>
                <span className="sw-no">{s.no}</span>
                <span className="sw-label">{s.label}</span>
                <span className="sw-value">{cur.label}</span>
                <ChevronDown size={14} className="chev" />
              </button>
              {isOpen && (
                <div className="sw-body">
                  <p className="sw-line">{s.line}</p>
                  <div className={`options o-${s.id}`} role="radiogroup" aria-label={s.label}>
                    {s.options.map((o) => {
                      const on = genome[s.id] === o.id
                      const disabled = s.id === "motion" && o.id !== "native" && resolved.motionCap === 0
                      return (
                        <button key={o.id} role="radio" aria-checked={on} disabled={disabled} className={`opt ${on ? "on" : ""}`} onClick={() => onGenome({ ...genome, [s.id]: o.id })}>
                          <OptionArt sw={s.id} id={o.id} tpl={tpl} resolved={resolved} />
                          <span className="opt-text">
                            <b>{o.label}</b>
                            <small>{o.hint}</small>
                          </span>
                          {on && <Check size={14} className="opt-check" />}
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
    </>
  )
}

/** The visual on each selection card — every option previews itself. */
function OptionArt({ sw, id, tpl, resolved }: { sw: SwitchId; id: string; tpl: TemplateDef; resolved: Resolved }) {
  const mode = resolved.mode
  if (sw === "atmosphere") {
    const pal = id === "native" ? tpl[mode] : ATMOSPHERES.find((a) => a.id === id)![mode]
    return (
      <span className="art art-swatch" style={{ background: pal.bg, borderColor: pal.line }}>
        <i style={{ background: pal.primary }} />
        <i style={{ background: pal.accent }} />
        <i style={{ background: pal.ink }} />
      </span>
    )
  }
  if (sw === "voice") {
    const fam = id === "native" ? tpl.voice.display : VOICES.find((v) => v.id === id)!.display
    return (
      <span className="art art-type" style={{ fontFamily: fam }}>
        Ag
      </span>
    )
  }
  if (sw === "light") {
    const pal = id === "dark" ? tpl.dark : id === "light" ? tpl.light : tpl[tpl.mode]
    return (
      <span className="art art-light" style={{ background: pal.bg, color: pal.ink, borderColor: pal.line }}>
        <i style={{ background: pal.ink }} />
        <i style={{ background: pal.muted }} />
      </span>
    )
  }
  if (sw === "material") {
    const r = id === "crisp" ? 0 : id === "soft" ? Math.max(14, tpl.radius * 1.6) : tpl.radius
    return (
      <span className="art art-corner">
        <i style={{ borderTopLeftRadius: Math.min(r, 22) }} />
      </span>
    )
  }
  if (sw === "density") {
    const gap = id === "compact" ? 2 : id === "airy" ? 7 : 4
    return (
      <span className="art art-density" style={{ gap }}>
        <i />
        <i />
        <i />
      </span>
    )
  }
  if (sw === "motion") {
    const lvl = id === "still" ? 0 : id === "subtle" ? 1 : 3
    return (
      <span className="art art-motion" data-l={lvl}>
        <svg viewBox="0 0 40 16" width="40" height="16" aria-hidden>
          <path d={lvl === 0 ? "M2 8 H38" : lvl === 1 ? "M2 8 C10 5, 14 5, 20 8 S30 11, 38 8" : "M2 8 C7 0, 13 0, 17 8 S27 16, 31 8 S37 2, 38 4"} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </span>
    )
  }
  // contrast
  const pal = tpl[mode]
  return (
    <span className="art art-contrast" style={{ background: pal.bg, borderColor: pal.line }}>
      <i style={{ background: id === "high" ? pal.ink : pal.muted }} />
      <i style={{ background: id === "high" ? pal.ink : pal.muted, opacity: 0.8 }} />
    </span>
  )
}

/* ── Tier ────────────────────────────────────────────────────────── */

function TierTab({ tpl, onSelect }: Props) {
  const t = tierOf(tpl.tier)
  const sibs = siblingsOf(tpl)
  return (
    <>
      <section className={`tier-card t-${t.id}`}>
        <div className="tc-top">
          <TierGlyph tier={t.id} />
          <span className="tc-plan">
            {t.plan} <small>{t.short} tier</small>
          </span>
          <span className="tc-price">{t.price}</span>
        </div>
        <p>{t.promise}</p>
      </section>

      <p className="eyebrow mt">The same industry at four scales</p>
      <ol className="sib-list">
        {sibs.map((s) => {
          const st = tierOf(s.tier)
          return (
            <li key={s.slug}>
              <button className={s.slug === tpl.slug ? "on" : ""} onClick={() => onSelect(s.slug)}>
                <TierGlyph tier={s.tier} />
                <span>
                  <b>{s.name}</b>
                  <small>
                    {st.plan} · {s.kind} · {s.pages.length} {s.pages.length === 1 ? "page" : "pages"}
                  </small>
                </span>
              </button>
            </li>
          )
        })}
      </ol>

      <p className="eyebrow mt">What each tier includes</p>
      <div className="ladder-table" role="table" aria-label="Tier comparison">
        <div className="lt-row lt-head" role="row">
          <span role="columnheader" />
          {TIERS.map((x) => (
            <span role="columnheader" key={x.id} className={x.id === tpl.tier ? "cur" : ""}>
              {x.short}
            </span>
          ))}
        </div>
        {LADDER.map((row) => (
          <div className="lt-row" role="row" key={row.label}>
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

/* ── Build ───────────────────────────────────────────────────────── */

function BuildTab({ tpl, resolved, page, onPage }: Props) {
  const gate = qualityGate(resolved.palette)
  return (
    <>
      <p className="eyebrow">Positioning</p>
      <p className="positioning">{tpl.positioning}</p>

      <p className="eyebrow mt">Page map</p>
      <ol className="page-map">
        {tpl.pages.map((p, i) => (
          <li key={p.id}>
            <button className={p.id === page ? "on" : ""} onClick={() => onPage(p.id)}>
              <span>{String(i + 1).padStart(2, "0")}</span> {p.label}
            </button>
          </li>
        ))}
      </ol>

      <p className="eyebrow mt">Why it can't be cloned from a screenshot</p>
      <ul className="sig-list">
        {tpl.signature.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>

      <p className="eyebrow mt">Modules ({tpl.modules.length})</p>
      <ul className="chips">
        {tpl.modules.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>

      <div className="gate">
        <div className="gate-top">
          <p className="eyebrow">Contrast gate · live</p>
          <span className={`gate-score ${gate.passed === gate.checks.length ? "ok" : "warn"}`}>
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
        <p className="gate-note">Recomputed from whatever palette the genome is showing right now.</p>
      </div>
    </>
  )
}
