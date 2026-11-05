import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ArrowUpRight, Monitor, PanelRight, Smartphone, Tablet, Menu, X } from "lucide-react"
import "./shell.css"
import { NATIVE, encodeGenome, type Genome } from "../engine/genome"
import { findTemplate, industryOf, TEMPLATES, type TemplateDef } from "../engine/registry"
import { resolve } from "../engine/resolve"
import { tierOf, type TierId } from "../engine/tiers"
import { Sidebar } from "./Sidebar"
import { Panel, type PanelTab } from "./Panel"
import { Stage, type Device } from "./Stage"

const initialSlug = () => {
  const h = location.hash.slice(1)
  return findTemplate(h)?.slug ?? "maison-ember"
}

export function App() {
  const [slug, setSlug] = useState(initialSlug)
  const [tierFilter, setTierFilter] = useState<TierId | "all">("all")
  const [device, setDevice] = useState<Device>(() => (window.innerWidth < 860 ? "mobile" : "desktop"))
  const [genome, setGenome] = useState<Genome>(NATIVE)
  const [panelOpen, setPanelOpen] = useState(() => window.innerWidth >= 1180)
  const [navOpen, setNavOpen] = useState(false)
  const [tab, setTab] = useState<PanelTab>("genome")
  const [page, setPage] = useState("home")
  const frameRef = useRef<HTMLIFrameElement>(null)

  const tpl = findTemplate(slug) as TemplateDef
  const resolved = useMemo(() => resolve(tpl, genome), [tpl, genome])

  const send = useCallback((msg: Record<string, unknown>) => {
    frameRef.current?.contentWindow?.postMessage({ source: "gos-shell", ...msg }, "*")
  }, [])

  // choosing a template resets page; the genome deliberately persists across templates
  const select = useCallback((s: string) => {
    setSlug(s)
    setPage("home")
    setNavOpen(false)
    history.replaceState(null, "", `#${s}`)
  }, [])

  useEffect(() => {
    const onHash = () => {
      const t = findTemplate(location.hash.slice(1))
      if (t && t.slug !== slug) {
        setSlug(t.slug)
        setPage("home")
      }
    }
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [slug])

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data as { source?: string; type?: string; page?: string; slug?: string }
      if (!d || d.source !== "gos-site" || d.slug !== slug) return
      if (d.type === "ready") send({ type: "genome", genome })
      if (d.type === "page" && d.page) setPage(d.page)
    }
    window.addEventListener("message", onMsg)
    return () => window.removeEventListener("message", onMsg)
  }, [slug, genome, send])

  useEffect(() => {
    send({ type: "genome", genome })
  }, [genome, send])

  const goPage = (p: string) => {
    setPage(p)
    send({ type: "go", page: p })
  }

  // keyboard: ←/→ move through templates in the current filter, [ ] toggles panel
  const visible = useMemo(() => TEMPLATES.filter((t) => tierFilter === "all" || t.tier === tierFilter), [tierFilter])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || e.metaKey || e.ctrlKey || e.altKey) return
      const i = visible.findIndex((t) => t.slug === slug)
      if (e.key === "ArrowRight" && visible.length) select(visible[(i + 1 + visible.length) % visible.length].slug)
      if (e.key === "ArrowLeft" && visible.length) select(visible[(i - 1 + visible.length) % visible.length].slug)
      if (e.key === "]") setPanelOpen((o) => !o)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [visible, slug, select])

  const g = encodeGenome(genome)
  const siteHref = `/?t=${tpl.slug}${g ? `&g=${encodeURIComponent(g)}` : ""}${page !== "home" ? `#${page}` : ""}`
  const tier = tierOf(tpl.tier)

  return (
    <div className={`app ${panelOpen ? "with-panel" : ""} ${navOpen ? "nav-open" : ""}`}>
      <header className="topbar">
        <button className="icon-btn only-narrow" onClick={() => setNavOpen((o) => !o)} aria-label={navOpen ? "Close template list" : "Open template list"}>
          {navOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        <a className="brand" href="#" onClick={(e) => e.preventDefault()}>
          <span className="brand-mark" aria-hidden>
            G
          </span>
          <span className="brand-text">
            <b>Growth OS</b>
            <span>Template Library</span>
          </span>
        </a>
        <nav className="crumbs" aria-label="Current template">
          <span>{industryOf(tpl.industry).label}</span>
          <i>/</i>
          <span className={`tier-ink t-${tpl.tier}`}>{tier.plan}</span>
          <i>/</i>
          <b>{tpl.name}</b>
        </nav>
        <div className="topbar-actions">
          <div className="seg" role="radiogroup" aria-label="Preview device">
            {(
              [
                ["desktop", Monitor, "Desktop"],
                ["tablet", Tablet, "Tablet"],
                ["mobile", Smartphone, "Mobile"],
              ] as const
            ).map(([id, Icon, label]) => (
              <button key={id} role="radio" aria-checked={device === id} className={device === id ? "on" : ""} onClick={() => setDevice(id)} title={label}>
                <Icon size={15} />
                <span className="sr-only">{label}</span>
              </button>
            ))}
          </div>
          <a className="btn-ghost" href={siteHref} target="_blank" rel="noreferrer">
            Open site <ArrowUpRight size={14} />
          </a>
          <button className={`icon-btn ${panelOpen ? "on" : ""}`} onClick={() => setPanelOpen((o) => !o)} aria-pressed={panelOpen} aria-label="Toggle Genome panel" title="Toggle panel ( ] )">
            <PanelRight size={17} />
          </button>
        </div>
      </header>

      <Sidebar slug={slug} onSelect={select} tierFilter={tierFilter} onTier={setTierFilter} />
      {navOpen && <div className="scrim" onClick={() => setNavOpen(false)} />}

      <Stage tpl={tpl} device={device} genome={genome} page={page} onPage={goPage} onSelect={select} frameRef={frameRef} />

      {panelOpen && (
        <Panel tpl={tpl} tab={tab} onTab={setTab} genome={genome} onGenome={setGenome} resolved={resolved} page={page} onPage={goPage} onSelect={select} onClose={() => setPanelOpen(false)} />
      )}
    </div>
  )
}
