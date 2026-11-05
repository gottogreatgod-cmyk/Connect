/**
 * The Genome Randomizer — the system's auto-swapper for the little details.
 *
 * Two systems met here: the Growth OS genome (seven curated switches on
 * every template) and the Template Factory's live showroom habit (press a
 * button, watch the build change). The randomizer is their instrument:
 *
 *   shuffle  a fresh, curated genome — weighted towards the switches a
 *            visitor actually SEES (atmosphere, voice, light), seeded
 *            half the time from a preset so pairs stay harmonious
 *   cruise   one mutation per tick — add a detail, rotate one that is
 *            already set, or occasionally retire one back to "as drawn"
 *
 * Everything stays inside the finish tier's override budget, never picks
 * the value a switch already holds (every tick is a visible change), and
 * never leaves the curated option lists — random, but never ugly.
 */
import { GENOME_PRESETS, NATIVE, SWITCHES, type Genome, type SwitchId } from "./genome"

export interface Swap {
  /** the switch that moved */
  id: SwitchId
  /** its label — "Colour atmosphere" */
  label: string
  /** option label before — "As drawn" */
  from: string
  /** option label after — "Deep Botanical" */
  to: string
}

export interface Randomized {
  genome: Genome
  swaps: Swap[]
}

/* ── lookups ─────────────────────────────────────────────────────── */

const optionLabel = (id: SwitchId, value: string): string =>
  SWITCHES.find((s) => s.id === id)?.options.find((o) => o.id === value)?.label ?? value

const nonNativeOptions = (id: SwitchId): string[] => {
  const sw = SWITCHES.find((s) => s.id === id)
  return sw ? sw.options.filter((o) => o.id !== "native").map((o) => o.id) : []
}

/* visibility weights — how strongly each switch registers on a live site */
const WEIGHTS: Record<SwitchId, number> = {
  atmosphere: 3,
  voice: 2.6,
  light: 2,
  material: 1.2,
  density: 1,
  motion: 0.8,
  contrast: 0.5,
}

/** the trio a visitor notices first — shuffle always leads with one of these */
const VISIBLE_TRIO: SwitchId[] = ["atmosphere", "voice", "light"]

const chance = (p: number) => Math.random() < p
const randomOf = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

function pickWeighted(pool: SwitchId[]): SwitchId {
  const total = pool.reduce((s, id) => s + WEIGHTS[id], 0)
  let roll = Math.random() * total
  for (const id of pool) {
    roll -= WEIGHTS[id]
    if (roll <= 0) return id
  }
  return pool[pool.length - 1]
}

/** A random non-native value for a switch — never the one it already shows. */
function pickValue(id: SwitchId, not?: string): string {
  let opts = nonNativeOptions(id)
  if (not !== undefined) opts = opts.filter((o) => o !== not)
  if (!opts.length) return not ?? "native"
  return randomOf(opts)
}

const overridesOf = (g: Genome): SwitchId[] =>
  (Object.keys(WEIGHTS) as SwitchId[]).filter((id) => g[id] !== "native")

const diff = (prev: Genome, next: Genome): Swap[] =>
  SWITCHES.filter((s) => prev[s.id] !== next[s.id]).map((s) => ({
    id: s.id,
    label: s.label,
    from: optionLabel(s.id, prev[s.id]),
    to: optionLabel(s.id, next[s.id]),
  }))

/* ── shuffle — a fresh curated genome ────────────────────────────── */

/**
 * A brand-new genome within the finish budget. k overrides (2–4, clamped
 * to the budget), half the time seeded from a preset for harmony, always
 * carrying at least one of the visible trio when k ≥ 2.
 */
export function randomGenome(budget: number, prev: Genome): Randomized {
  if (budget <= 0) return { genome: prev, swaps: [] }
  const k = Math.max(1, Math.min(budget, 2 + Math.floor(Math.random() * 3)))

  let picks: Partial<Genome> = {}

  if (chance(0.5) && GENOME_PRESETS.length) {
    /* seed from a preset — a hand-tuned harmonious starting point */
    const seed = randomOf(GENOME_PRESETS)
    const entries = Object.entries(seed.sel) as [SwitchId, string][]
    /* keep the most visible members if the preset overflows the budget */
    const ranked = [...entries].sort((a, b) => WEIGHTS[b[0]] - WEIGHTS[a[0]])
    picks = Object.fromEntries(ranked.slice(0, k))
  }

  /* fill any remaining slots with weighted picks */
  const remaining = (Object.keys(WEIGHTS) as SwitchId[]).filter((id) => !(id in picks))
  while (Object.keys(picks).length < k && remaining.length) {
    const id = pickWeighted(remaining)
    remaining.splice(remaining.indexOf(id), 1)
    picks[id] = undefined as unknown as string
  }

  /* guarantee a visible-trio member when there is room for one */
  const ids = Object.keys(picks) as SwitchId[]
  if (k >= 2 && !ids.some((id) => VISIBLE_TRIO.includes(id))) {
    const drop = [...ids].sort((a, b) => WEIGHTS[a] - WEIGHTS[b])[0]
    const swapIn = randomOf(VISIBLE_TRIO)
    delete picks[drop]
    picks[swapIn] = undefined as unknown as string
  }

  /* every chosen switch takes a NEW value — the shuffle must be visible */
  const next: Genome = { ...NATIVE }
  for (const [id] of Object.entries(picks) as [SwitchId, string | undefined][]) {
    next[id] = pickValue(id, prev[id])
  }

  return { genome: next, swaps: diff(prev, next) }
}

/* ── cruise — one mutation per tick ──────────────────────────────── */

/**
 * A single auto-cruise tick: add a detail, rotate one already set, or
 * (occasionally) retire one back to "as drawn". Always exactly one move,
 * always inside the budget, always a visible change.
 */
export function mutateGenome(current: Genome, budget: number): Randomized {
  if (budget <= 0) return { genome: current, swaps: [] }
  const target = Math.min(budget, 4)
  const set = overridesOf(current)
  const next: Genome = { ...current }

  /* nothing set yet — establish the first visible detail */
  if (set.length === 0) {
    const id = pickWeighted(VISIBLE_TRIO)
    next[id] = pickValue(id, "native")
    return { genome: next, swaps: diff(current, next) }
  }

  /* under target — usually grow, sometimes rotate */
  if (set.length < target && chance(0.65)) {
    const pool = (Object.keys(WEIGHTS) as SwitchId[]).filter((id) => current[id] === "native")
    if (pool.length) {
      const id = pickWeighted(pool)
      next[id] = pickValue(id, "native")
      return { genome: next, swaps: diff(current, next) }
    }
  }

  /* occasionally retire one — the cruise breathes in and out */
  if (set.length > 1 && chance(0.18)) {
    const id = randomOf(set)
    next[id] = "native"
    return { genome: next, swaps: diff(current, next) }
  }

  /* rotate one already-set detail to a different value */
  const rotatable = set.filter((id) => nonNativeOptions(id).length > 1)
  if (rotatable.length) {
    const id = randomOf(rotatable)
    next[id] = pickValue(id, current[id])
    return { genome: next, swaps: diff(current, next) }
  }

  /* every set switch has a single option (contrast-only edge) — add or retire */
  if (set.length < target) {
    const pool = (Object.keys(WEIGHTS) as SwitchId[]).filter((id) => current[id] === "native" && nonNativeOptions(id).length > 0)
    if (pool.length) {
      const id = pickWeighted(pool)
      next[id] = pickValue(id, "native")
      return { genome: next, swaps: diff(current, next) }
    }
  }
  const id = randomOf(set)
  next[id] = "native"
  return { genome: next, swaps: diff(current, next) }
}

/** Human-readable diff between two genomes — used by the swap ticker. */
export function describeSwaps(prev: Genome, next: Genome): Swap[] {
  return diff(prev, next)
}

/** A random template slug (the "surprise me" command) — never the one given. */
export function randomPick<T>(arr: T[], not?: T): T {
  if (arr.length <= 1) return arr[0]
  let pick = randomOf(arr)
  let guard = 0
  while (not !== undefined && pick === not && guard++ < 8) pick = randomOf(arr)
  return pick
}
