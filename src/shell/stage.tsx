"use client"

/**
 * Stage — the live preview, pixel-honest. The site renders at REAL width
 * in natural flow — exactly what the full page shows: no fake browser
 * chrome, no scale transform, no fixed-height viewport. What you see in
 * the library is the same rendering you get on #/site/<slug>.
 *
 * The device toggle only constrains the width — desktop fills the canvas
 * edge-to-edge, tablet 820px, mobile 390px — and every template answers
 * with container queries, so a 390px preview IS the real phone layout.
 */
import { useEffect, useMemo, useRef } from "react"
import { ExternalLink } from "lucide-react"
import { pagesAt } from "@/engine/registry"
import { go } from "@/engine/nav"
import { useGos } from "./gos-context"
import { SiteFrame } from "./site-frame"
import { ModuleCard } from "@/modules"

export function Stage() {
  const gos = useGos()
  const scrollerRef = useRef<HTMLDivElement>(null)
  const tpl = gos.tpl
  const visiblePages = useMemo(() => pagesAt(tpl, gos.tierStep), [tpl, gos.tierStep])

  /* if the morph step filtered out the current page, fall back to home */
  useEffect(() => {
    if (!visiblePages.some((p) => p.id === gos.page)) gos.setPage("home")
  }, [gos.tierStep, tpl.slug])

  /* jump to page top when the template or page changes */
  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: 0 })
  }, [gos.slug, gos.page])

  return (
    <main className="gos-stage" aria-label={`${tpl.name} preview`}>
      {/* one bar — the template, its pages, and the full-page link */}
      <header className="gos-stage-head">
        <div className="gos-sh-title">
          <h1>{tpl.name}</h1>
          <p>
            {tpl.kind} <i>·</i> {tpl.city}
          </p>
        </div>
        <div className="gos-pages" role="tablist" aria-label="Pages in this template">
          {visiblePages.map((p) => (
            <button key={p.id} role="tab" aria-selected={p.id === gos.page} className={p.id === gos.page ? "on" : ""} onClick={() => gos.setPage(p.id)}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="gos-stage-actions">
          <button
            type="button"
            className="gos-btn-ghost"
            onClick={() => go(`/site/${tpl.slug}`)}
            title="Open the full page — the same rendering, whole width"
          >
            <ExternalLink size={13} aria-hidden /> Full page
          </button>
        </div>
      </header>

      {/* the live site — real width, natural height, identical to the full page */}
      <div className={`gos-canvas d-${gos.device}`} ref={scrollerRef}>
        <SiteFrame
          key={gos.slug}
          tpl={tpl}
          genome={gos.siteGenome}
          page={gos.page}
          onPage={gos.setPage}
          tier={gos.tierStep}
          fontScale={gos.fontScale}
          editMode={gos.editMode}
          remountKey={gos.editResetKey}
          width="100%"
          height="auto"
          insertTop={gos.dockedModule && gos.dockSlot === "hero" ? <ModuleCard m={gos.dockedModule} tpl={tpl} slot="hero" /> : undefined}
          insertBottom={
            gos.dockedModule && gos.dockSlot !== "hero" ? (
              <ModuleCard m={gos.dockedModule} tpl={tpl} slot={gos.dockSlot} />
            ) : undefined
          }
        />
      </div>
    </main>
  )
}
