/**
 * Growth OS · Finish tiers — the gating layer, ported from OMNIFORGE.
 *
 * Five finish tiers ride ON TOP of the product tiers (Starter → Flagship)
 * and the genome:
 *   Studio → Signature → Showcase → Spectacle → Private
 *
 * A finish tier is a set of CAPS (capability flags). Everything
 * interactive in the library shell — spin blocks, cursor FX, shimmer,
 * 3D tilt, marquee, genome switch overrides, floating consoles, the
 * concierge — checks these caps before it renders. Nothing is "hidden
 * CSS": if a cap is off, the effect does not exist at runtime. This keeps
 * the honest promise: Studio buyers see exactly what Studio buys.
 */

export type FinishId = "studio" | "signature" | "showcase" | "spectacle" | "private"

export interface FinishCaps {
  /** hover lift + focus states on cards */
  hoverLift: boolean
  /** shimmer sweep on catalogue cards */
  shimmer: boolean
  /** slow continuous spin on hover (SpinBlock level 1) */
  spin: boolean
  /** elements react to mouse proximity before hover (SpinBlock level 2) */
  spinProximity: boolean
  /** full 3D tilt toward the cursor (SpinBlock level 3) */
  tilt3d: boolean
  /** the cursor label FX layer */
  cursorFx: boolean
  /** marquee / ticker bands */
  marquee: boolean
  /** how many genome switches may be overridden per session */
  genomeOverrides: number
  /** floating side consoles on the site view */
  consoles: number
  /** the concierge panel */
  concierge: boolean
  /** "what's included" explorer depth (playbook detail shown per module) */
  manifestDepth: number
}

export interface Finish {
  id: FinishId
  no: string
  name: string
  short: string
  price: string
  blurb: string
  caps: FinishCaps
}

const OFF: FinishCaps = {
  hoverLift: false, shimmer: false, spin: false, spinProximity: false, tilt3d: false,
  cursorFx: false, marquee: false, genomeOverrides: 0, consoles: 0, concierge: false,
  manifestDepth: 0,
}

export const FINISHES: Finish[] = [
  {
    id: "studio",
    no: "01",
    name: "Studio",
    short: "ST",
    price: "$49",
    blurb: "The plain, honest build — the shell, the library, the search. No theatre.",
    caps: { ...OFF, hoverLift: true, marquee: true, manifestDepth: 1 },
  },
  {
    id: "signature",
    no: "02",
    name: "Signature",
    short: "SG",
    price: "$149",
    blurb: "Finish work: shimmer surfaces, hover spin, one genome override.",
    caps: { ...OFF, hoverLift: true, shimmer: true, spin: true, marquee: true, genomeOverrides: 1, manifestDepth: 2 },
  },
  {
    id: "showcase",
    no: "03",
    name: "Showcase",
    short: "SC",
    price: "$299",
    blurb: "Reactive work: proximity spin blocks, live console, 3 overrides.",
    caps: { ...OFF, hoverLift: true, shimmer: true, spin: true, spinProximity: true, marquee: true, genomeOverrides: 3, consoles: 1, manifestDepth: 3 },
  },
  {
    id: "spectacle",
    no: "04",
    name: "Spectacle",
    short: "SP",
    price: "$599",
    blurb: "The full instrument: 3D tilt, cursor FX, both consoles, concierge.",
    caps: { ...OFF, hoverLift: true, shimmer: true, spin: true, spinProximity: true, tilt3d: true, cursorFx: true, marquee: true, genomeOverrides: 5, consoles: 2, concierge: true, manifestDepth: 4 },
  },
  {
    id: "private",
    no: "05",
    name: "Private",
    short: "PV",
    price: "By invitation",
    blurb: "Everything unlocked — the atelier tier. Both consoles, full genome, all seven switches.",
    caps: { ...OFF, hoverLift: true, shimmer: true, spin: true, spinProximity: true, tilt3d: true, cursorFx: true, marquee: true, genomeOverrides: 7, consoles: 2, concierge: true, manifestDepth: 5 },
  },
]

export const FINISH_IDS: FinishId[] = FINISHES.map((t) => t.id)
export const DEFAULT_FINISH: FinishId = "showcase"

export function finishOf(id: string): Finish {
  return FINISHES.find((t) => t.id === id) ?? FINISHES[0]
}

export function isFinishId(v: unknown): v is FinishId {
  return typeof v === "string" && FINISH_IDS.includes(v as FinishId)
}

/** How many genome switches the user has actually overridden. */
export function countOverrides(sel: Record<string, string>): number {
  return Object.values(sel).filter((v) => v && v !== "native").length
}

/** Per-tier label for UI readouts ("Spin on hover · since Signature"). */
export function capIntroducedBy(cap: keyof FinishCaps): Finish | null {
  return FINISHES.find((t) => t.caps[cap]) ?? null
}

export const CAP_LABELS: Partial<Record<keyof FinishCaps, string>> = {
  spin: "Spin on hover",
  spinProximity: "Proximity spin",
  tilt3d: "3D tilt",
  cursorFx: "Cursor label FX",
  shimmer: "Shimmer surfaces",
  hoverLift: "Hover lift",
  marquee: "Marquee bands",
  genomeOverrides: "Genome switches",
  consoles: "Floating consoles",
  concierge: "Concierge",
}
