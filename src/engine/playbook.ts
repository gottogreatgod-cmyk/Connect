/**
 * Playbook client — the 344-module build standard served by /api/playbook.
 * The raw text file is parsed server-side once and cached in memory; the
 * client fetches typed slices (sections index, module detail, search).
 */

export type ModuleTier = "starter" | "growth" | "business" | "flagship"

export interface PlaybookModule {
  id: string
  name: string
  section: string
  sectionNo: string
  tier: ModuleTier
  file: string
  features: string[]
  purpose: string
  rule: string
  accessibility: string | null
  note: string | null
  codeKind: string | null
  hasCode: boolean
}

export interface PlaybookSection {
  no: string
  title: string
  count: number
  starter: number
  growth: number
  business: number
  flagship: number
  blurb: string
  architecture?: string[]
  accessibility?: string[]
  performance?: string[]
  gate?: string[]
}

export interface PlaybookIndex {
  sections: PlaybookSection[]
  total: number
  byTier: Record<ModuleTier, number>
}

export interface PlaybookResponse extends PlaybookIndex {
  modules: PlaybookModule[]
  query?: string
}

const TIER_MAP: Record<string, ModuleTier> = {
  starter: "starter",
  growth: "growth",
  business: "business",
  flagship: "flagship",
}

export const TIER_LABELS: Record<ModuleTier, string> = {
  starter: "Starter",
  growth: "Growth",
  business: "Business",
  flagship: "Flagship",
}

export const MODULE_TIER_IDS = ["starter", "growth", "business", "flagship"] as const

export function moduleTier(label: string): ModuleTier {
  return TIER_MAP[label.toLowerCase()] ?? "growth"
}

/* ── fetchers ─────────────────────────────────────────────────────── */

export async function fetchPlaybookIndex(): Promise<PlaybookIndex> {
  const res = await fetch("/api/playbook")
  if (!res.ok) throw new Error("playbook unavailable")
  return res.json()
}

export async function searchPlaybook(params: {
  q?: string
  section?: string
  tier?: ModuleTier | "all"
}): Promise<PlaybookResponse> {
  const p = new URLSearchParams()
  if (params.q) p.set("q", params.q)
  if (params.section && params.section !== "all") p.set("section", params.section)
  if (params.tier && params.tier !== "all") p.set("tier", params.tier)
  const res = await fetch(`/api/playbook?${p.toString()}`)
  if (!res.ok) throw new Error("playbook unavailable")
  return res.json()
}
