"use client"

/**
 * Command palette (⌘K / Ctrl-K) — ported from OMNIFORGE and re-pointed
 * at the merged system. One keyboard-first surface: navigate views,
 * jump to any of the 23 templates, switch edition, switch finish tier,
 * apply a genome preset, open any of the 344 playbook modules, and ask
 * the concierge with a typed brief. Arrow keys + Enter move; Esc closes;
 * results are grouped and live-filtered.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ArrowRight, Command as CommandIcon, CornerDownLeft, Search } from "lucide-react"
import { TEMPLATES, industryOf } from "@/engine/registry"
import { tierOf } from "@/engine/tiers"
import { GENOME_PRESETS, NATIVE, type Genome } from "@/engine/genome"
import { randomPick } from "@/engine/randomizer"
import { EDITIONS, EDITION_ORDER } from "@/engine/editions"
import { FINISHES, countOverrides } from "@/engine/finish"
import { askConcierge } from "@/engine/concierge"
import { go, setParam } from "@/engine/nav"
import { track } from "@/engine/analytics"
import { useEdition } from "./edition-provider"
import { useFx } from "./fx"
import { useGos } from "./gos-context"

interface Row {
  id: string
  group: string
  label: string
  hint?: string
  disabled?: boolean
  run: () => void
}

export const OPEN_PALETTE_EVENT = "gos:open-palette"

/* playbook modules are fetched once per process, lazily */
type PbModule = { id: string; name: string; section: string; tier: string; purpose: string }
let pbCache: PbModule[] | null = null
async function fetchPlaybookModules(): Promise<PbModule[]> {
  if (pbCache) return pbCache
  try {
    const res = await fetch("/api/playbook")
    if (!res.ok) return []
    const data = (await res.json()) as { modules?: PbModule[] }
    pbCache = data.modules ?? []
  } catch {
    pbCache = []
  }
  return pbCache
}

const CONCIERGE_CHIPS = [
  "a restaurant that takes bookings",
  "a lettings agent with listings",
  "a clinic that books itself",
  "a property developer with a portal",
]

export function CommandPalette({ finishId }: { finishId: string }) {
  const { setEdition } = useEdition()
  const { caps } = useFx()
  const gos = useGos()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState("")
  const [active, setActive] = useState(0)
  const [modules, setModules] = useState<PbModule[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  /* ⌘K toggles + open requests from the topbar */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((o) => !o)
      } else if (e.key === "Escape") {
        setOpen(false)
      }
    }
    const openPalette = () => {
      setOpen(true)
      track("palette_opened", { view: "palette" })
    }
    window.addEventListener("keydown", onKey)
    window.addEventListener(OPEN_PALETTE_EVENT, openPalette)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener(OPEN_PALETTE_EVENT, openPalette)
    }
  }, [])

  /* focus + lazy-load the playbook index on first open */
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus())
      if (!pbCache) void fetchPlaybookModules().then(setModules)
    }
  }, [open])

  /* reset-on-close — the deliberate UI-sync pattern */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!open) {
      setQ("")
      setActive(0)
    }
  }, [open])
  /* eslint-enable react-hooks/set-state-in-effect */

  const close = useCallback(() => setOpen(false), [])

  const rows: Row[] = (() => {
    const out: Row[] = []
    const needle = q.trim().toLowerCase()

    out.push(
      { id: "nav-home", group: "Navigate", label: "Home", hint: "#/ — the OS's own landing", run: () => go("/") },
      { id: "nav-build", group: "Navigate", label: "Website Builder", hint: "#/build — one direct flow: brief, design, copy, art, motion, launch", run: () => go("/build") },
      { id: "nav-build-art", group: "Navigate", label: "Builder · Art & media", hint: "#/build/art — generate hero image, mark, reel, voiceover", run: () => go("/build/art") },
      { id: "nav-ai", group: "Navigate", label: "AI Studio · the agent + 4 families", hint: "#/ai — one unified agent, chat · art · voice · research", run: () => go("/ai") },
      { id: "nav-ai-agent", group: "Navigate", label: "AI Studio · Agent Chat", hint: "#/ai/agent — build sites, art, video, speech from one chat", run: () => go("/ai/agent") },
      { id: "nav-ai-chat", group: "Navigate", label: "AI Studio · Chat & Content", hint: "#/ai/chat — the librarian + the copy forge", run: () => go("/ai/chat") },
      { id: "nav-ai-art", group: "Navigate", label: "AI Studio · Art & Motion", hint: "#/ai/art — images, reels, teasers + the Motion Lab", run: () => go("/ai/art") },
      { id: "nav-ai-voice", group: "Navigate", label: "AI Studio · Voice Studio", hint: "#/ai/voice — speech out and in, every voice function", run: () => go("/ai/voice") },
      { id: "nav-ai-research", group: "Navigate", label: "AI Studio · Vision & Research", hint: "#/ai/research — screenshots, live web, page reading", run: () => go("/ai/research") },
      { id: "nav-motion", group: "Navigate", label: "Motion Lab · 19 skills", hint: "#/motion — layer two, five master sources, 11 live stages", run: () => go("/motion") },
      { id: "nav-motion-timeline", group: "Navigate", label: "Motion Lab · Timeline", hint: "#/motion/timeline — scrub a GSAP choreography by hand", run: () => go("/motion/timeline") },
      { id: "nav-motion-wiggle", group: "Navigate", label: "Motion Lab · The Wiggle", hint: "#/motion/wiggle-text — per-letter springs, live controls", run: () => go("/motion/wiggle-text") },
      { id: "nav-sources", group: "Navigate", label: "Sources · the ledger + census", hint: "#/sources — 9 cloned repos explained, live skill counts, the 700+ claim verified", run: () => go("/sources") },
      { id: "nav-sources-mcp", group: "Navigate", label: "Sources · MCP connect", hint: "#/sources — one server, every skill: the JSON config for any agent", run: () => go("/sources") },
      { id: "nav-library", group: "Navigate", label: "Template library", hint: "#/library — stage + genome inspector", run: () => go("/library") },
      { id: "nav-catalogue", group: "Navigate", label: `Catalogue · all ${TEMPLATES.length}`, hint: "#/catalogue — searchable grid", run: () => go("/catalogue") },
      { id: "nav-forge", group: "Navigate", label: "Module Forge · 344 live", hint: "#/forge — any module, mounted on any template", run: () => go("/forge") },
      { id: "nav-playbook", group: "Navigate", label: "Module playbook · 344", hint: "#/playbook — the build standard", run: () => go("/playbook") },
    )

    /* the randomizer — deal a genome, cruise, or full surprise */
    out.push(
      {
        id: "rand-shuffle",
        group: "Randomizer",
        label: "Shuffle the genome",
        hint: `Deal a fresh curated genome — ${caps.genomeOverrides} ${caps.genomeOverrides === 1 ? "switch" : "switches"} within this finish`,
        disabled: caps.genomeOverrides <= 0,
        run: () => gos.shuffleGenome(),
      },
      {
        id: "rand-auto",
        group: "Randomizer",
        label: gos.autoSwap ? "Stop auto-cruise" : "Start auto-cruise",
        hint: gos.autoSwap ? "The system stops swapping the little details" : "Let the system swap one detail every few seconds — any manual pick stops it",
        disabled: caps.genomeOverrides <= 0,
        run: () => gos.setAutoSwap(!gos.autoSwap),
      },
      {
        id: "rand-surprise",
        group: "Randomizer",
        label: `Surprise me — a random template of ${TEMPLATES.length}, fresh genome`,
        hint: "One command: a random template, dealt a new set of details",
        run: () => {
          const t = randomPick(TEMPLATES, TEMPLATES.find((x) => x.slug === gos.slug))
          gos.select(t.slug)
          gos.shuffleGenome()
        },
      },
    )

    /* finish tiers steer the effects layer */
    for (const f of FINISHES) {
      out.push({
        id: `finish-${f.id}`,
        group: "Finish tiers",
        label: `Finish · ${f.name}`,
        hint: f.blurb,
        run: () => {
          track("finish_selected", { finish: f.id, via: "palette" })
          setParam("finish", f.id)
        },
      })
    }

    /* editions re-skin the shell */
    for (const eid of EDITION_ORDER) {
      out.push({
        id: `edition-${eid}`,
        group: "Editions",
        label: `Edition · ${EDITIONS[eid].name}`,
        hint: EDITIONS[eid].tagline,
        run: () => setEdition(eid),
      })
    }

    /* templates */
    const tpls = needle
      ? TEMPLATES.filter((t) => `${t.name} ${t.kind} ${t.city} ${t.family} ${t.conversion}`.toLowerCase().includes(needle))
      : TEMPLATES
    for (const t of tpls.slice(0, needle ? 9 : 12)) {
      out.push({
        id: `tpl-${t.slug}`,
        group: `Templates · ${TEMPLATES.length}`,
        label: t.name,
        hint: `${industryOf(t.industry).label} · ${tierOf(t.tier).plan} · ${t.kind}`,
        run: () => {
          track("template_viewed", { slug: t.slug, via: "palette" })
          gos.select(t.slug)
        },
      })
    }

    /* genome presets — honest cap enforcement */
    for (const p of GENOME_PRESETS) {
      const sel = { ...NATIVE, ...p.sel } as Genome
      const over = countOverrides(sel)
      out.push({
        id: `preset-${p.id}`,
        group: "Genome presets",
        label: p.name,
        hint: p.note,
        disabled: over > caps.genomeOverrides,
        run: () => gos.setGenome(sel),
      })
    }

    /* playbook modules (lazy) */
    if (needle && modules.length) {
      const mods = modules
        .filter((m) => `${m.name} ${m.section} ${m.purpose}`.toLowerCase().includes(needle))
        .slice(0, 7)
      for (const m of mods) {
        out.push({
          id: `mod-${m.id}`,
          group: "Playbook · 344 modules",
          label: m.name,
          hint: `${m.section} · ${m.tier} — ${m.purpose.slice(0, 76)}…`,
          run: () => {
            go(`/playbook/${m.id}`)
          },
        })
      }
    }

    /* concierge: treat the query as a brief */
    if (needle.length > 3) {
      const answer = askConcierge(q)
      for (const item of answer.items.slice(0, 3)) {
        out.push({
          id: `ask-${item.slug}`,
          group: "Ask the concierge",
          label: `${item.name} — ${item.score} pts`,
          hint: item.why,
          run: () => {
            track("concierge_used", { query: q, opened: item.slug })
            gos.select(item.slug)
          },
        })
      }
    } else {
      for (const chip of CONCIERGE_CHIPS) {
        out.push({
          id: `chip-${chip}`,
          group: "Ask the concierge",
          label: chip,
          hint: "prompt chip — press Enter to pick",
          run: () => {
            track("concierge_used", { query: chip, via: "chip" })
            const answer = askConcierge(chip)
            if (answer.items[0]) gos.select(answer.items[0].slug)
          },
        })
      }
    }

    return out
  })()

  /* group ordering when a query is live: concierge + templates first */
  const filtered = useMemo(() => {
    if (!q.trim()) return rows
    const order = ["Ask the concierge", `Templates · ${TEMPLATES.length}`, "Playbook · 344 modules", "Randomizer", "Genome presets", "Finish tiers", "Editions", "Navigate"]
    return [...rows].sort((a, b) => order.indexOf(a.group) - order.indexOf(b.group))
  }, [rows, q])

  const commit = useCallback(
    (row: Row | undefined) => {
      if (!row || row.disabled) return
      row.run()
      close()
    },
    [close],
  )

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => window.dispatchEvent(new CustomEvent(OPEN_PALETTE_EVENT))}
        aria-label="Open the command palette (⌘K)"
        className="gos-btn-ghost gos-kbd-btn"
        style={{ gap: 7 }}
      >
        <CommandIcon size={14} aria-hidden />
        <span className="gos-kbd">⌘K</span>
      </button>
    )
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center bg-black/40 p-4 pt-[12vh] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onClick={(e) => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <div
        className="of-palette ed-card flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-xl shadow-2xl"
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault()
            setActive((a) => Math.min(filtered.length - 1, a + 1))
          } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setActive((a) => Math.max(0, a - 1))
          } else if (e.key === "Enter") {
            e.preventDefault()
            commit(filtered[active])
          }
        }}
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setActive(0)
            }}
            placeholder="Search 23 templates · 344 modules — or ask the concierge…"
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            aria-label="Search or ask"
          />
          <kbd className="gos-kbd hidden sm:block">ESC</kbd>
        </div>

        <div className="of-list-scroll flex-1 overflow-y-auto p-2">
          {filtered.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Nothing matches that. Try “restaurant”, “lettings”, “portal”, “calculator”…
            </p>
          )}
          {filtered.map((row, i) => {
            const showGroup = i === 0 || filtered[i - 1].group !== row.group
            return (
              <div key={row.id}>
                {showGroup && (
                  <p className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {row.group}
                  </p>
                )}
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => commit(row)}
                  disabled={row.disabled}
                  className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
                    i === active && !row.disabled ? "bg-primary text-primary-foreground" : row.disabled ? "opacity-45" : "hover:bg-muted"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{row.label}</span>
                    {row.hint && (
                      <span className={`block truncate text-xs ${i === active && !row.disabled ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {row.hint}
                      </span>
                    )}
                  </span>
                  {i === active && !row.disabled && <CornerDownLeft className="size-3.5 shrink-0 opacity-70" aria-hidden />}
                </button>
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          <span className="flex items-center gap-1">
            <ArrowRight className="size-3" aria-hidden /> type a brief = ask the concierge
          </span>
          <span>finish: {finishId}</span>
        </div>
      </div>
    </div>
  )
}
