import { INDUSTRIES, TEMPLATES } from "../engine/registry"
import { TIERS, TIER_ORDER, type TierId } from "../engine/tiers"

export function TierGlyph({ tier }: { tier: TierId }) {
  const n = TIER_ORDER.indexOf(tier) + 1
  return (
    <span className={`glyph t-${tier}`} aria-hidden>
      {[1, 2, 3, 4].map((i) => (
        <i key={i} className={i <= n ? "on" : ""} />
      ))}
    </span>
  )
}

export function Sidebar({
  slug,
  onSelect,
  tierFilter,
  onTier,
}: {
  slug: string
  onSelect: (s: string) => void
  tierFilter: TierId | "all"
  onTier: (t: TierId | "all") => void
}) {
  return (
    <aside className="sidebar" aria-label="Template library">
      <section className="side-block">
        <h2 className="side-label">Tier</h2>
        <ul className="tier-list" role="radiogroup" aria-label="Filter by tier">
          <li>
            <button role="radio" aria-checked={tierFilter === "all"} className={tierFilter === "all" ? "on" : ""} onClick={() => onTier("all")}>
              <span className="glyph all" aria-hidden>
                <i className="on" />
                <i className="on" />
                <i className="on" />
                <i className="on" />
              </span>
              <span className="tl-name">All tiers</span>
              <span className="tl-count">{TEMPLATES.length}</span>
            </button>
          </li>
          {TIERS.map((t) => (
            <li key={t.id}>
              <button role="radio" aria-checked={tierFilter === t.id} className={tierFilter === t.id ? "on" : ""} onClick={() => onTier(t.id)}>
                <TierGlyph tier={t.id} />
                <span className="tl-name">
                  {t.plan}
                  <small>{t.short}</small>
                </span>
                <span className="tl-count">{t.price}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="side-block grow">
        <h2 className="side-label">Industries</h2>
        {INDUSTRIES.map((ind) => {
          const list = TEMPLATES.filter((t) => t.industry === ind.id && (tierFilter === "all" || t.tier === tierFilter))
          if (!list.length) return null
          return (
            <div key={ind.id} className="ind">
              <h3 className="ind-head">{ind.label}</h3>
              <ul>
                {list.map((t) => {
                  const p = t[t.mode]
                  return (
                    <li key={t.slug}>
                      <button className={`tpl-row ${t.slug === slug ? "on" : ""}`} aria-current={t.slug === slug ? "page" : undefined} onClick={() => onSelect(t.slug)}>
                        <span className="swatch" style={{ background: p.bg, boxShadow: `inset 0 0 0 1px ${p.line}` }} aria-hidden>
                          <i style={{ background: p.primary }} />
                        </span>
                        <span className="tpl-text">
                          <b>{t.name}</b>
                          <small>{t.kind}</small>
                        </span>
                        <TierGlyph tier={t.tier} />
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </section>

      <footer className="side-foot">
        <span>16 templates</span>
        <span className="kbd-hint">
          <kbd>←</kbd>
          <kbd>→</kbd> browse
        </span>
      </footer>
    </aside>
  )
}
