"use client"

/**
 * LibraryView — the merged shell: the Growth OS library frame (sidebar ·
 * stage · panel) with the OMNIFORGE instruments bolted into the topbar.
 * Keyboard: ←/→ browse templates, [ ] toggles the inspector.
 */
import { useEffect, useState } from "react"
import { TEMPLATES } from "@/engine/registry"
import { useGos } from "../gos-context"
import { Topbar } from "../topbar"
import { Sidebar } from "../sidebar"
import { Stage } from "../stage"
import { Panel } from "../panel"

export function LibraryView({ finishId }: { finishId: string }) {
  const gos = useGos()
  const [navOpen, setNavOpen] = useState(false)

  /* keyboard: ←/→ move through templates */
  useEffect(() => {
    const visible = TEMPLATES
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || e.metaKey || e.ctrlKey || e.altKey) return
      if (!visible.length) return
      const i = visible.findIndex((t) => t.slug === gos.slug)
      if (e.key === "ArrowRight") {
        e.preventDefault()
        gos.select(visible[(i + 1 + visible.length) % visible.length].slug)
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        gos.select(visible[(i - 1 + visible.length) % visible.length].slug)
      } else if (e.key === "]") {
        gos.setPanelOpen(!gos.panelOpen)
      } else if (e.key === "Escape") {
        setNavOpen(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [gos])

  return (
    <div className={`gos-app-wrap ${navOpen ? "nav-open" : ""}`}>
      <Topbar navOpen={navOpen} onNav={setNavOpen} />
      <div className={`gos-app ${gos.panelOpen ? "with-panel" : ""}`}>
        <Sidebar />
        {navOpen && <div className="gos-scrim" onClick={() => setNavOpen(false)} />}
        <Stage />
        {gos.panelOpen && <Panel />}
      </div>
    </div>
  )
}
