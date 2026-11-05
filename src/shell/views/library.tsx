"use client"

/**
 * LibraryView — the merged shell: the Growth OS library frame (sidebar ·
 * stage · panel). The Topbar lives at the shell root now (one header for
 * every view), so this view is just the working grid beneath it.
 * Keyboard: ←/→ browse templates, [ ] toggles the inspector.
 */
import { useEffect } from "react"
import { TEMPLATES } from "@/engine/registry"
import { useGos } from "../gos-context"
import { Sidebar } from "../sidebar"
import { Stage } from "../stage"
import { Panel } from "../panel"

export function LibraryView({ finishId: _finishId, navOpen, onNav }: { finishId: string; navOpen: boolean; onNav: (v: boolean) => void }) {
  const gos = useGos()

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
        onNav(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [gos, onNav])

  return (
    <div className="gos-app-wrap">
      <div className={`gos-app ${gos.panelOpen ? "with-panel" : ""}`}>
        <Sidebar />
        {navOpen && <div className="gos-scrim" onClick={() => onNav(false)} />}
        <Stage />
        {gos.panelOpen && <Panel />}
      </div>
    </div>
  )
}
