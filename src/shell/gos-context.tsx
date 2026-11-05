"use client"

/**
 * GosProvider — the shared library state: which template is loaded, the
 * genome selection (persists across templates, like the Growth OS
 * original), the active device frame, tier filter and inspector panel.
 * The palette, the concierge and every view act through this context.
 *
 * Tier morphing — tierStep holds the EFFECTIVE tier of the loaded
 * design. Every template can be walked Starter → Flagship as ONE
 * design: pages filter, TierGate sections come and go, motion and
 * density follow the step. It defaults to the template's native tier
 * and follows template switches until the visitor steps it themselves.
 *
 * Type tools — fontScale (A− / A+ on every site preview) and editMode
 * (click-to-edit text). resetEdits() re-mounts the live sites, wiping
 * in-place text edits.
 *
 * Edition bridge — with editionForgesSites on (default), the active
 * edition's site preset is merged UNDER the user's genome switches, so
 * one click in the topbar re-forges the template previews too — not
 * just the shell. siteGenome is what every preview renders through.
 *
 * Randomizer — the auto-swapper for the little details. shuffleGenome()
 * deals a fresh curated genome within the finish budget; autoSwap runs
 * the cruise: one mutation per tick (add a detail, rotate one already
 * set, occasionally retire one). Every move lands in the swapFeed for
 * the ticker; any manual genome pick hands the wheel back to the user.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { NATIVE, decodeGenome, encodeGenome, isGenome, SWITCHES, type Genome } from "@/engine/genome"
import { mutateGenome, randomGenome, type Swap } from "@/engine/randomizer"
import { findTemplate, TEMPLATES, type TemplateDef } from "@/engine/registry"
import type { TierId } from "@/engine/tiers"
import { go, NAV_EVENT, readLocation } from "@/engine/nav"
import { track } from "@/engine/analytics"
import { DEFAULT_EDITION, EDITION_SITE, EDITION_SITE_STORAGE_KEY, type EditionId } from "@/engine/editions"
import { useEdition } from "./edition-provider"
import { useFx } from "./fx"
import type { PlaybookModule } from "@/engine/playbook"

export type Device = "desktop" | "tablet" | "mobile"

/** One randomizer move — what moved, from what, to what. */
export interface SwapEntry {
  id: number
  at: number
  kind: "shuffle" | "auto"
  swaps: Swap[]
}

let swapSeq = 0

const GENOME_KEY = "gos:genome"
const DEVICE_KEY = "gos:device"
const FONT_SCALE_KEY = "gos:font-scale"

export const FONT_SCALE_MIN = 0.8
export const FONT_SCALE_MAX = 1.3
export const FONT_SCALE_STEP = 0.05

interface GosContextValue {
  slug: string
  tpl: TemplateDef
  select: (slug: string, opts?: { view?: "library" | "site" }) => void
  genome: Genome
  setGenome: (g: Genome) => void
  /** what previews actually render with — edition preset merged under user switches */
  siteGenome: Genome
  page: string
  setPage: (p: string) => void
  device: Device
  setDevice: (d: Device) => void
  panelOpen: boolean
  setPanelOpen: (v: boolean) => void
  panelTab: "genome" | "tier" | "build"
  setPanelTab: (t: "genome" | "tier" | "build") => void
  /** the effective tier the loaded design renders at (tier morphing) */
  tierStep: TierId
  setTierStep: (t: TierId) => void
  /** user has stepped away from the template's native tier */
  tierStepped: boolean
  /** site-wide typography scale — A− / A+ on every live preview */
  fontScale: number
  setFontScale: (n: number) => void
  /** click-to-edit text on live previews */
  editMode: boolean
  setEditMode: (v: boolean) => void
  /** re-mounts live sites, wiping in-place text edits */
  resetEdits: () => void
  /** bumped by resetEdits — consumed as a React key by the frames */
  editResetKey: number
  /** the active edition also re-forges template previews */
  editionForgesSites: boolean
  setEditionForgesSites: (v: boolean) => void
  /** a playbook module docked onto the current template in the library stage */
  dockedModule: PlaybookModule | null
  setDockedModule: (m: PlaybookModule | null) => void
  dockSlot: "hero" | "mid" | "foot"
  setDockSlot: (s: "hero" | "mid" | "foot") => void
  /** the genome randomizer — deal a fresh curated genome (false = locked by finish) */
  shuffleGenome: () => boolean
  /** auto-cruise — the system swaps details on its own until turned off */
  autoSwap: boolean
  setAutoSwap: (v: boolean) => void
  /** the finish tier's override budget (0 = randomizer locked) */
  genomeBudget: number
  /** the last randomizer moves, newest first — the ticker's feed */
  swapFeed: SwapEntry[]
}

const GosContext = createContext<GosContextValue | null>(null)

function readStoredGenome(): Genome {
  try {
    const raw = localStorage.getItem(GENOME_KEY)
    if (!raw) return NATIVE
    const parsed: unknown = JSON.parse(raw)
    if (isGenome(parsed)) return parsed
  } catch {
    /* ignore */
  }
  return NATIVE
}

function readStoredBool(key: string, fallback: boolean): boolean {
  try {
    const raw = localStorage.getItem(key)
    if (raw === "1") return true
    if (raw === "0") return false
  } catch {
    /* ignore */
  }
  return fallback
}

export function GosProvider({
  initialSlug,
  initialView,
  children,
}: {
  initialSlug: string
  initialView: string
  children: ReactNode
}) {
  const { id: editionId } = useEdition()
  const [slug, setSlug] = useState(initialSlug)
  const [genome, setGenomeState] = useState<Genome>(NATIVE)
  const [page, setPage] = useState("home")
  const [device, setDeviceState] = useState<Device>("desktop")
  const [panelOpen, setPanelOpen] = useState(false)
  const [panelTab, setPanelTab] = useState<"genome" | "tier" | "build">("genome")
  const [tierStep, setTierStepState] = useState<TierId>(findTemplate(initialSlug)?.tier ?? "low")
  const [tierTouched, setTierTouched] = useState(false)
  const [fontScale, setFontScaleState] = useState(1)
  const [editMode, setEditModeState] = useState(false)
  const [editResetKey, setEditResetKey] = useState(0)
  const [editionForgesSites, setEditionForgesSitesState] = useState(true)
  const [dockedModule, setDockedModuleState] = useState<PlaybookModule | null>(null)
  const [dockSlot, setDockSlotState] = useState<"hero" | "mid" | "foot">("mid")

  /* the randomizer — budget from the finish tier, latest genome by ref */
  const { caps } = useFx()
  const genomeBudget = caps.genomeOverrides
  const [autoSwap, setAutoSwapState] = useState(false)
  const [swapFeed, setSwapFeed] = useState<SwapEntry[]>([])
  const genomeRef = useRef<Genome>(NATIVE)

  /* hydrate persisted prefs after mount (SSR renders NATIVE defaults) —
     the deliberate sync-storage-read pattern; setState here is the point. */
  useEffect(() => {
    const g = readStoredGenome()
    if (g !== NATIVE) setGenomeState(g)
    try {
      const d = localStorage.getItem(DEVICE_KEY)
      if (d === "desktop" || d === "tablet" || d === "mobile") setDeviceState(d)
      else if (window.innerWidth < 860) setDeviceState("mobile")
      const fs = Number(localStorage.getItem(FONT_SCALE_KEY))
      if (Number.isFinite(fs) && fs >= FONT_SCALE_MIN && fs <= FONT_SCALE_MAX) setFontScaleState(fs)
    } catch {
      /* ignore */
    }
    setPanelOpen(window.innerWidth >= 1180)
    setEditionForgesSitesState(readStoredBool(EDITION_SITE_STORAGE_KEY, true))
  }, [])

  /* a deep link (#/library/<slug> or #/site/<slug>) that differs from
     state selects it — synced on every navigation so the back button
     walks the shared selection too */
  useEffect(() => {
    const sync = () => {
      const target = findTemplate(readLocation().slug)
      if (target && target.slug !== slug) setSlug(target.slug)
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
  }, [slug])

  const tpl = useMemo(() => findTemplate(slug) ?? TEMPLATES[0], [slug])

  /* when the template switches and the visitor hasn't stepped the
     ladder themselves, follow the new design's native tier */
  useEffect(() => {
    if (!tierTouched) setTierStepState(tpl.tier)
  }, [tpl.tier, tierTouched])

  const select = useCallback(
    (next: string, opts?: { view?: "library" | "site" }) => {
      const t = findTemplate(next)
      if (!t) return
      setSlug(t.slug)
      setPage("home")
      track("template_viewed", { slug: t.slug, tier: t.tier, view: opts?.view ?? "library" })
      if (opts?.view === "site") {
        go(`/site/${t.slug}`)
      } else {
        /* staying in the library — stage it, replacing history (browsing
           the sidebar shouldn't spam the back stack) */
        go(`/library/${t.slug}`, { replace: true })
      }
    },
    [],
  )

  /* keep the ref current no matter how the genome moves (storage hydrate,
     panel picks, presets, the randomizer itself) */
  useEffect(() => {
    genomeRef.current = genome
  }, [genome])

  /* the one writer — persist + report, shared by every path below */
  const applyGenome = useCallback((g: Genome) => {
    setGenomeState(g)
    try {
      localStorage.setItem(GENOME_KEY, JSON.stringify(g))
    } catch {
      /* ignore */
    }
    track("genome_changed", { genome: encodeGenome(g) || "native" })
  }, [])

  /* manual pick — the visitor takes the wheel, cruise stands down */
  const setGenome = useCallback(
    (g: Genome) => {
      setAutoSwapState(false)
      applyGenome(g)
    },
    [applyGenome],
  )

  const pushFeed = useCallback((kind: "shuffle" | "auto", swaps: Swap[]) => {
    setSwapFeed((feed) => [{ id: ++swapSeq, at: Date.now(), kind, swaps }, ...feed].slice(0, 6))
  }, [])

  /* deal a fresh curated genome — works WITH the cruise running */
  const shuffleGenome = useCallback((): boolean => {
    const { genome, swaps } = randomGenome(genomeBudget, genomeRef.current)
    if (!swaps.length) return false
    applyGenome(genome)
    pushFeed("shuffle", swaps)
    track("genome_shuffled", { mode: "shuffle", details: swaps.map((s) => `${s.id}→${s.to}`).join(", ") })
    return true
  }, [genomeBudget, applyGenome, pushFeed])

  const setAutoSwap = useCallback(
    (v: boolean) => {
      /* the finish tier gates the whole instrument — Studio has no overrides */
      if (v && genomeBudget <= 0) {
        track("randomizer_locked", { finish: "studio" })
        return
      }
      setAutoSwapState(v)
      track("auto_swap_toggled", { on: v })
    },
    [genomeBudget],
  )

  /* the cruise — one curated mutation every few seconds, visible only,
     never past the budget, silent while the tab is hidden */
  useEffect(() => {
    if (!autoSwap || genomeBudget <= 0) return
    const id = window.setInterval(() => {
      if (document.hidden) return
      const { genome, swaps } = mutateGenome(genomeRef.current, genomeBudget)
      if (!swaps.length) return
      applyGenome(genome)
      pushFeed("auto", swaps)
      track("genome_shuffled", { mode: "auto", details: swaps.map((s) => `${s.id}→${s.to}`).join(", ") })
    }, 4600)
    return () => window.clearInterval(id)
  }, [autoSwap, genomeBudget, applyGenome, pushFeed])

  const setTierStep = useCallback((t: TierId) => {
    setTierStepState(t)
    setTierTouched(true)
    track("tier_stepped", { tier: t })
  }, [])

  const setDevice = useCallback((d: Device) => {
    setDeviceState(d)
    try {
      localStorage.setItem(DEVICE_KEY, d)
    } catch {
      /* ignore */
    }
  }, [])

  const setFontScale = useCallback((n: number) => {
    const clamped = Math.round(Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, n)) * 100) / 100
    setFontScaleState(clamped)
    try {
      localStorage.setItem(FONT_SCALE_KEY, String(clamped))
    } catch {
      /* ignore */
    }
  }, [])

  const setEditMode = useCallback((v: boolean) => {
    setEditModeState(v)
    if (v) track("edit_mode_on")
  }, [])

  const resetEdits = useCallback(() => {
    setEditResetKey((k) => k + 1)
    setEditModeState(false)
  }, [])

  const setEditionForgesSites = useCallback((v: boolean) => {
    setEditionForgesSitesState(v)
    try {
      localStorage.setItem(EDITION_SITE_STORAGE_KEY, v ? "1" : "0")
    } catch {
      /* ignore */
    }
    track("edition_sites_toggled", { on: v })
  }, [])

  const setDockedModule = useCallback((m: PlaybookModule | null) => {
    setDockedModuleState(m)
    if (m) track("module_docked", { module: m.id, slot: dockSlot })
  }, [dockSlot])

  const setDockSlot = useCallback((s: "hero" | "mid" | "foot") => {
    setDockSlotState(s)
  }, [])

  /* the edition preset sits UNDER the user's switches: an explicit
     genome choice always wins, "as drawn" falls through to the edition */
  const siteGenome = useMemo<Genome>(() => {
    if (!editionForgesSites || editionId === DEFAULT_EDITION) return genome
    const preset = EDITION_SITE[editionId]
    const merged = { ...NATIVE }
    for (const sw of SWITCHES) {
      merged[sw.id] = genome[sw.id] !== "native" ? genome[sw.id] : (preset.genome[sw.id] ?? "native")
    }
    return merged
  }, [genome, editionId, editionForgesSites])

  const value: GosContextValue = {
    slug: tpl.slug,
    tpl,
    select,
    genome,
    setGenome,
    siteGenome,
    page,
    setPage,
    device,
    setDevice,
    panelOpen,
    setPanelOpen,
    panelTab,
    setPanelTab,
    tierStep,
    setTierStep,
    tierStepped: tierTouched && tierStep !== tpl.tier,
    fontScale,
    setFontScale,
    editMode,
    setEditMode,
    resetEdits,
    editResetKey,
    editionForgesSites,
    setEditionForgesSites,
    dockedModule,
    setDockedModule,
    dockSlot,
    setDockSlot,
    shuffleGenome,
    autoSwap,
    setAutoSwap,
    genomeBudget,
    swapFeed,
  }

  return <GosContext.Provider value={value}>{children}</GosContext.Provider>
}

/* re-exported so the shell can read the active edition's site note */
export function editionSiteNote(id: EditionId) {
  return EDITION_SITE[id].note
}

export function useGos() {
  const ctx = useContext(GosContext)
  if (!ctx) throw new Error("useGos must be used inside <GosProvider>")
  return ctx
}

/** decode a genome string once — used by the site view deep links */
export { decodeGenome }
