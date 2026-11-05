"use client"

/**
 * Sidebar — the industries with their template rows, plain and simple:
 * pick an industry, pick a template, see it on the stage. Swatches come
 * from each template's native palette; module-built templates carry a
 * KIT chip. Everything else about a template lives in the inspector.
 */
import { INDUSTRIES, TEMPLATES } from "@/engine/registry"
import { TIER_ORDER, type TierId } from "@/engine/tiers"
import { useGos } from "./gos-context"

export function TierGlyph({ tier }: { tier: TierId }) {
  const n = TIER_ORDER.indexOf(tier) + 1
  return (
    <span className={`glyph t-${tier}`} aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <i key={i} className={i <= n ? "on" : ""} />
      ))}
    </span>
  )
}

export function Sidebar() {
  const gos = useGos()

  return (
    <aside className="gos-sidebar" aria-label="Template library">
      <section className="gos-side-block grow">
        <h2 className="gos-side-label">Templates</h2>
        {INDUSTRIES.map((ind) => {
          const list = TEMPLATES.filter((t) => t.industry === ind.id)
          if (!list.length) return null
          return (
            <div key={ind.id} className="gos-ind">
              <h3 className="gos-ind-head">
                {ind.label}
                <small title={ind.conversion}>{list.length}</small>
              </h3>
              <ul>
                {list.map((t) => {
                  const p = t[t.mode]
                  return (
                    <li key={t.slug}>
                      <button
                        className={`gos-tpl-row ${t.slug === gos.slug ? "on" : ""}`}
                        aria-current={t.slug === gos.slug ? "page" : undefined}
                        onClick={() => gos.select(t.slug)}
                        data-cursor-label={`OPEN · ${t.name.toUpperCase()}`}
                      >
                        <span className="gos-swatch" style={{ background: p.bg, boxShadow: `inset 0 0 0 1px ${p.line}` }} aria-hidden>
                          <i style={{ background: p.primary }} />
                        </span>
                        <span className="gos-tpl-text">
                          <b>
                            {t.name}
                            {t.kit && (
                              <i className="gos-kit-chip" title="Module-built — composed live from the factory kit" aria-label="Module-built template">
                                KIT
                              </i>
                            )}
                          </b>
                          <small>{t.kind}</small>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </section>

      <footer className="gos-side-foot">
        <span>{TEMPLATES.length} templates</span>
        <span className="kbd-hint">
          <kbd>←</kbd>
          <kbd>→</kbd> browse
        </span>
      </footer>
    </aside>
  )
}
