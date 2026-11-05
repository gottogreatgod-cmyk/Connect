"use client"

/**
 * EditionProvider — the shell's skin, ported from OMNIFORGE.
 *
 * One click re-forges the whole chrome: type, colour, layout, material,
 * detail and copy resolve through the edition's CSS variables, applied
 * inline on <html> so nothing re-mounts. Persisted to localStorage; the
 * mode (daylight / evening) is a separate choice that defaults to the
 * edition's native light.
 */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import {
  DEFAULT_EDITION,
  EDITIONS,
  EDITION_STORAGE_KEY,
  MODE_STORAGE_KEY,
  editionVars,
  isEditionId,
  isMode,
  layerReadout,
  resolveMode,
  type EditionId,
  type Mode,
} from "@/engine/editions"
import { track } from "@/engine/analytics"
import { NAV_EVENT, readLocation, setParam } from "@/engine/nav"

interface EditionContextValue {
  id: EditionId
  edition: (typeof EDITIONS)[EditionId]
  mode: Mode
  modeChoice: Mode | null
  setEdition: (id: EditionId) => void
  setModeChoice: (m: Mode | null) => void
  toggleMode: () => void
  layers: ReturnType<typeof layerReadout>
}

const EditionContext = createContext<EditionContextValue | null>(null)

function readStored<T extends string>(key: string, guard: (v: unknown) => v is T): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw !== null && guard(raw) ? raw : null
  } catch {
    return null
  }
}

export function EditionProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState<EditionId>(DEFAULT_EDITION)
  const [modeChoice, setModeChoice] = useState<Mode | null>(null)

  /* hydrate from storage — one deliberate sync read at mount (the
     storage-sync pattern: SSR renders defaults, the effect adopts the
     stored choice right after). A shared link's ?edition= wins over the
     stored choice — a link carries intent. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const fromPath = readLocation().edition
    if (fromPath && isEditionId(fromPath)) {
      setId(fromPath)
      try {
        localStorage.setItem(EDITION_STORAGE_KEY, fromPath)
      } catch {
        /* ignore */
      }
      return
    }
    const storedEdition = readStored<EditionId>(EDITION_STORAGE_KEY, isEditionId)
    if (storedEdition && storedEdition !== DEFAULT_EDITION) setId(storedEdition)
    const storedMode = readStored<Mode>(MODE_STORAGE_KEY, isMode)
    if (storedMode) setModeChoice(storedMode)
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  /* a ?edition= that arrives later (back button, palette) is adopted too */
  useEffect(() => {
    const sync = () => {
      const fromPath = readLocation().edition
      if (fromPath && isEditionId(fromPath) && fromPath !== id) {
        setId(fromPath)
        setModeChoice(null)
      }
    }
    sync()
    window.addEventListener(NAV_EVENT, sync)
    window.addEventListener("popstate", sync)
    window.addEventListener("hashchange", sync)
    return () => {
      window.removeEventListener(NAV_EVENT, sync)
      window.removeEventListener("popstate", sync)
      window.removeEventListener("hashchange", sync)
    }
  }, [id])

  const mode = resolveMode(id, modeChoice)

  /* apply the vars whenever edition or mode changes */
  useEffect(() => {
    const root = document.documentElement
    const vars = editionVars(id, mode)
    for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v)
    root.dataset.edition = id
    root.dataset.mode = mode
    root.style.colorScheme = mode
    root.classList.toggle("dark", mode === "dark")
  }, [id, mode])

  /* the cross-fade class — removed after the transition settles */
  useEffect(() => {
    const root = document.documentElement
    root.classList.add("ed-switching")
    const t = window.setTimeout(() => root.classList.remove("ed-switching"), 560)
    return () => window.clearTimeout(t)
  }, [id, mode])

  const setEdition = useCallback((next: EditionId) => {
    setId((cur) => {
      if (cur === next) return cur
      track("edition_switched", { from: cur, to: next })
      try {
        localStorage.setItem(EDITION_STORAGE_KEY, next)
      } catch {
        /* ignore */
      }
      return next
    })
    setModeChoice(null)
    /* the path param follows — shareable links like #/library?edition=obsidian */
    setParam("edition", next)
  }, [])

  const changeModeChoice = useCallback((m: Mode | null) => {
    setModeChoice(m)
    try {
      if (m) localStorage.setItem(MODE_STORAGE_KEY, m)
      else localStorage.removeItem(MODE_STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  const toggleMode = useCallback(() => {
    changeModeChoice(mode === "dark" ? "light" : "dark")
  }, [mode, changeModeChoice])

  return (
    <EditionContext.Provider
      value={{ id, edition: EDITIONS[id], mode, modeChoice, setEdition, setModeChoice: changeModeChoice, toggleMode, layers: layerReadout(id) }}
    >
      {children}
    </EditionContext.Provider>
  )
}

export function useEdition() {
  const ctx = useContext(EditionContext)
  if (!ctx) throw new Error("useEdition must be used inside <EditionProvider>")
  return ctx
}
