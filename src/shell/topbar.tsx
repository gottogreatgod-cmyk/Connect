"use client"

/**
 * The topbar — brand, crumbs, and the system's global instruments, all
 * ported and merged: the edition switcher (one click re-forges the
 * chrome), the daylight/evening mode, the motion nuke, the concierge,
 * the ⌘K palette, device frames and the inspector toggle.
 */
import { useEffect, useRef, useState } from "react"
import { Blocks, BookOpen, Check, ChevronDown, FolderGit2, LayoutGrid, Library, Menu, Monitor, Moon, Orbit, PanelRight, Smartphone, Sparkles, Sun, SunMoon, Tablet, Type, Wand2, X, Zap, ZapOff } from "lucide-react"
import { EDITIONS, EDITION_ORDER, EDITION_SITE } from "@/engine/editions"
import { useMotionPref } from "@/shell/motion"
import { industryOf, TEMPLATES } from "@/engine/registry"
import { go, readLocation } from "@/engine/nav"
import { useEdition } from "./edition-provider"
import { useGos, type Device } from "./gos-context"
import { ConciergePanel } from "./concierge-panel"
import { TypeTools } from "./type-tools"
import { RandomizerTools } from "./randomizer"
import { OPEN_PALETTE_EVENT } from "./command-palette"

export function Topbar({ navOpen, onNav }: { navOpen: boolean; onNav: (v: boolean) => void }) {
  const { id: editionId, edition, mode, setEdition, toggleMode } = useEdition()
  const { motion, setMotion } = useMotionPref()
  const gos = useGos()
  const [edOpen, setEdOpen] = useState(false)
  const [view, setView] = useState("library")
  const edRef = useRef<HTMLDivElement>(null)
  /* the active view — read at mount (SSR-safe) and on every navigation */
  useEffect(() => {
    const sync = () => setView(readLocation().view)
    sync()
    const onNavEvt = () => sync()
    window.addEventListener("gos:navigate", onNavEvt)
    window.addEventListener("popstate", onNavEvt)
    window.addEventListener("hashchange", onNavEvt)
    return () => {
      window.removeEventListener("gos:navigate", onNavEvt)
      window.removeEventListener("popstate", onNavEvt)
      window.removeEventListener("hashchange", onNavEvt)
    }
  }, [])
  /* close the edition dropdown on outside click / Escape */
  useEffect(() => {
    if (!edOpen) return
    const onDoc = (e: MouseEvent) => {
      if (edRef.current && !edRef.current.contains(e.target as Node)) setEdOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setEdOpen(false)
    document.addEventListener("mousedown", onDoc)
    window.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDoc)
      window.removeEventListener("keydown", onKey)
    }
  }, [edOpen])

  const t = gos.tpl

  const devices: [Device, typeof Monitor, string][] = [
    ["desktop", Monitor, "Desktop"],
    ["tablet", Tablet, "Tablet"],
    ["mobile", Smartphone, "Mobile"],
  ]

  return (
    <header className="gos-topbar">
      <button
        className="gos-icon-btn gos-only-narrow"
        onClick={() => {
          /* in the library the hamburger opens the template drawer;
             anywhere else it takes you there first */
          if (view === "library") onNav(!navOpen)
          else go("/library")
        }}
        aria-label={view === "library" ? (navOpen ? "Close template list" : "Open template list") : "Open the template library"}
        aria-expanded={view === "library" ? navOpen : undefined}
      >
        {view === "library" && navOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      <a
        className="gos-brand"
        href="#"
        onClick={(e) => {
          e.preventDefault()
          go("/")
        }}
        aria-label="Growth OS — home"
      >
        <span className="gos-brand-mark" aria-hidden>
          G
        </span>
        <span className="gos-brand-text">
          <b>Growth OS</b>
          <span>One system · every layer</span>
        </span>
      </a>

      <nav className="gos-crumbs" aria-label="Current template">
        <span>{industryOf(t.industry).label}</span>
        <i>/</i>
        <b>{t.name}</b>
      </nav>

      {/* views — the whole system, always one click away */}
      <nav className="gos-views" aria-label="Views">
        <button
          type="button"
          className={view === "build" ? "on" : ""}
          onClick={() => go("/build")}
          title="The Website Builder — one direct flow: brief, design, copy, art, motion, launch"
        >
          <Wand2 size={13} aria-hidden />
          <span>Builder</span>
        </button>
        <button
          type="button"
          className={view === "ai" ? "on" : ""}
          onClick={() => go("/ai")}
          title="The AI Intelligence layer — one unified agent + four skill families"
        >
          <Sparkles size={13} aria-hidden />
          <span>AI Studio</span>
          <span className="v-count">8×2</span>
        </button>
        <button
          type="button"
          className={view === "motion" ? "on" : ""}
          onClick={() => go("/motion")}
          title="The Motion Lab — 19 master skills from five sources, 11 live stages, one grammar"
        >
          <Orbit size={13} aria-hidden />
          <span>Motion</span>
          <span className="v-count">19</span>
        </button>
        <button
          type="button"
          className={view === "sources" ? "on" : ""}
          onClick={() => go("/sources")}
          title="The Source Ledger — every cloned repo explained, the live skill census, the MCP server"
        >
          <FolderGit2 size={13} aria-hidden />
          <span>Sources</span>
          <span className="v-count">9</span>
        </button>
        <button
          type="button"
          className={view === "library" ? "on" : ""}
          onClick={() => go("/library")}
          title="The template library — sidebar, stage, genome panel"
        >
          <Library size={13} aria-hidden />
          <span>Library</span>
          <span className="v-count">{TEMPLATES.length}</span>
        </button>
        <button
          type="button"
          className={view === "catalogue" ? "on" : ""}
          onClick={() => go("/catalogue")}
          title="Every template as a searchable catalogue"
        >
          <LayoutGrid size={13} aria-hidden />
          <span>Catalogue</span>
        </button>
        <button
          type="button"
          className={view === "playbook" ? "on" : ""}
          onClick={() => go("/playbook")}
          title="The 344-module build standard — every module with rules and reference code"
        >
          <BookOpen size={13} aria-hidden />
          <span>Playbook</span>
          <span className="v-count">344</span>
        </button>
        <button
          type="button"
          className={view === "forge" ? "on" : ""}
          onClick={() => go("/forge")}
          title="The Module Forge — any of the 344 modules, mounted live on any template"
        >
          <Blocks size={13} aria-hidden />
          <span>Forge</span>
        </button>
      </nav>

      <div className="gos-topbar-actions">
        <ConciergePanel />

        {/* type tools — the site-wide typography scale + click-to-edit */}
        <TypeTools />

        {/* the genome randomizer — deal a genome · auto-cruise */}
        <RandomizerTools />

        <button type="button" className="gos-btn-ghost" onClick={toggleMode} aria-label={`Switch to ${mode === "dark" ? "daylight" : "evening"}`} title="Daylight / evening">
          {mode === "dark" ? <Sun size={14} aria-hidden /> : <Moon size={14} aria-hidden />}
          <span className="hidden 2xl:inline">{mode === "dark" ? "Daylight" : "Evening"}</span>
        </button>

        <button
          type="button"
          className="gos-icon-btn"
          onClick={() => setMotion(!motion)}
          aria-pressed={motion}
          aria-label={motion ? "Reduce motion" : "Enable motion"}
          title={motion ? "Motion on — click for reduced motion" : "Motion off — click to enable"}
        >
          {motion ? <Zap size={16} aria-hidden /> : <ZapOff size={16} aria-hidden />}
        </button>

        <div className="gos-chip-row" ref={edRef} style={{ position: "relative" }}>
          <button
            type="button"
            className={`chip ${edOpen ? "" : ""}`}
            onClick={() => setEdOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={edOpen}
            title={`Edition · ${edition.name} — ${edition.tagline}`}
          >
            <b style={{ fontFamily: "var(--ed-font-display)" }}>{edition.short}</b>
            <span className="hidden lg:inline" style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
              {edition.name}
            </span>
            <ChevronDown size={12} aria-hidden />
          </button>
          {edOpen && (
            <div className="ed-card absolute right-0 top-[calc(100%+6px)] z-50 w-72 p-1.5 shadow-2xl" role="listbox" aria-label="Editions">
              <p className="px-2 pb-1 pt-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                Six editions — one click re-forges the shell
              </p>
              {EDITION_ORDER.map((eid) => {
                const e = EDITIONS[eid]
                return (
                  <button
                    key={eid}
                    type="button"
                    role="option"
                    aria-selected={eid === editionId}
                    onClick={() => {
                      setEdition(eid)
                      setEdOpen(false)
                    }}
                    className="flex w-full items-start gap-2.5 rounded-lg px-2 py-2 text-left hover:bg-muted"
                  >
                    <b className="mt-0.5 w-6 shrink-0 text-center font-mono text-[11px] text-primary">{e.short}</b>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-medium">{e.name}</span>
                      <span className="block truncate text-[11px] text-muted-foreground">{e.tagline}</span>
                    </span>
                    {eid === editionId && <Check size={14} className="mt-1 shrink-0 text-primary" aria-hidden />}
                  </button>
                )
              })}
              <div className="mt-1 border-t border-border pt-1.5">
                <button
                  type="button"
                  role="switch"
                  aria-checked={gos.editionForgesSites}
                  onClick={() => gos.setEditionForgesSites(!gos.editionForgesSites)}
                  className="flex w-full items-start gap-2.5 rounded-lg px-2 py-2 text-left hover:bg-muted"
                  title={EDITION_SITE[editionId].note}
                >
                  <Type size={13} className="mt-1 shrink-0 text-primary" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12.5px] font-medium">Also re-forge the templates</span>
                    <span className="block text-[11px] leading-snug text-muted-foreground">
                      {gos.editionForgesSites ? `On — previews render in ${edition.name} DNA · ${EDITION_SITE[editionId].note}` : "Off — previews keep each template's native DNA"}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className={`mt-0.5 inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors ${
                      gos.editionForgesSites ? "bg-primary" : "bg-border"
                    }`}
                  >
                    <span className={`inline-block size-3 rounded-full bg-white transition-transform ${gos.editionForgesSites ? "translate-x-3.5" : "translate-x-0.5"}`} />
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="gos-seg" role="radiogroup" aria-label="Preview device">
          {devices.map(([id, Icon, label]) => (
            <button
              key={id}
              role="radio"
              aria-checked={gos.device === id}
              className={gos.device === id ? "on" : ""}
              onClick={() => gos.setDevice(id)}
              title={label}
            >
              <Icon size={15} />
              <span className="sr-only">{label}</span>
            </button>
          ))}
        </div>

        <button type="button" className="gos-btn-ghost" onClick={() => window.dispatchEvent(new CustomEvent(OPEN_PALETTE_EVENT))} title="Command palette (⌘K)">
          <span className="gos-kbd">⌘K</span>
        </button>

        <button
          type="button"
          className={`gos-icon-btn ${gos.panelOpen ? "on" : ""}`}
          onClick={() => gos.setPanelOpen(!gos.panelOpen)}
          aria-pressed={gos.panelOpen}
          aria-label="Toggle Genome panel"
          title="Toggle inspector ( ] )"
        >
          <PanelRight size={17} />
        </button>
      </div>
    </header>
  )
}
