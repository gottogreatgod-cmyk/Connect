import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react"
import { Lock } from "lucide-react"
import type { Genome } from "../engine/genome"
import { siblingsOf, type TemplateDef } from "../engine/registry"
import { tierOf } from "../engine/tiers"
import { TierGlyph } from "./Sidebar"

export type Device = "desktop" | "tablet" | "mobile"
const VIRTUAL: Record<Device, number> = { desktop: 1280, tablet: 820, mobile: 390 }

export function Stage({
  tpl,
  device,
  page,
  onPage,
  onSelect,
  frameRef,
}: {
  tpl: TemplateDef
  device: Device
  genome: Genome
  page: string
  onPage: (p: string) => void
  onSelect: (s: string) => void
  frameRef: RefObject<HTMLIFrameElement | null>
}) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ w: 900, h: 700 })
  const [loading, setLoading] = useState(true)

  useLayoutEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => setLoading(true), [tpl.slug])

  // desktop renders at ≥1280 virtual px and scales to fit; tablet/mobile render true size when they fit
  const pad = 0
  const avail = Math.max(320, box.w - pad)
  const virtualW = device === "desktop" ? Math.max(VIRTUAL.desktop, avail) : VIRTUAL[device]
  const scale = Math.min(1, avail / virtualW)
  const chromeH = 36
  const frameH = Math.max(400, (box.h - chromeH) / scale)
  const shownW = virtualW * scale
  const siblings = siblingsOf(tpl)
  const host = `${tpl.slug}.growthos.site`
  const pageLabel = tpl.pages.find((p) => p.id === page)

  return (
    <main className="stage" aria-label={`${tpl.name} preview`}>
      <div className="stage-head">
        <div className="sh-title">
          <h1>{tpl.name}</h1>
          <p>
            {tpl.kind} <i>·</i> {tpl.city}
          </p>
        </div>
        <ol className="ladder" aria-label="Same industry, four tiers">
          {siblings.map((s) => {
            const t = tierOf(s.tier)
            const on = s.slug === tpl.slug
            return (
              <li key={s.slug}>
                <button className={`rung t-${s.tier} ${on ? "on" : ""}`} aria-current={on ? "true" : undefined} onClick={() => onSelect(s.slug)} title={`${t.plan} — ${s.name}`}>
                  <TierGlyph tier={s.tier} />
                  <span>
                    <b>{t.plan}</b>
                    <small>{s.name}</small>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>

      <div className="stage-sub">
        <div className="pages" role="tablist" aria-label="Pages in this template">
          {tpl.pages.map((p) => (
            <button key={p.id} role="tab" aria-selected={p.id === page} className={p.id === page ? "on" : ""} onClick={() => onPage(p.id)}>
              {p.label}
            </button>
          ))}
          <span className="pages-count">
            {tpl.pages.length} {tpl.pages.length === 1 ? "page" : "pages"}
          </span>
        </div>
        <p className="conv">
          <span>Primary action</span> {tpl.conversion}
        </p>
      </div>

      <div className="canvas" ref={canvasRef}>
        <div className={`device d-${device}`} style={{ width: shownW }}>
          <div className="chrome">
            <span className="dots" aria-hidden>
              <i />
              <i />
              <i />
            </span>
            <span className="url">
              <Lock size={11} aria-hidden /> {host}
              {pageLabel && page !== "home" ? `/${page}` : ""}
            </span>
            <span className="scale">{Math.round(scale * 100)}%</span>
          </div>
          <div className="viewport" style={{ height: frameH * scale }}>
            {loading && <div className="frame-loading">Loading {tpl.name}…</div>}
            <iframe
              key={tpl.slug}
              ref={frameRef}
              title={`${tpl.name} — live website preview`}
              src={`/?t=${tpl.slug}`}
              onLoad={() => setLoading(false)}
              style={{ width: virtualW, height: frameH, transform: `scale(${scale})` }}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
