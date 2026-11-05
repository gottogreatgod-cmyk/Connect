/**
 * The tier ladder. A tier is not a colour change — it changes depth,
 * proof, automation and operational capability. ONE design walks the
 * whole ladder: every template can be morphed Starter → Growth → Scale
 * → Business → Flagship as the SAME site, gaining pages, sections and
 * motion at each step — instead of swapping between separate sites.
 *
 * Prices and motion caps are the product-tier system from the Growth OS
 * library. The five FINISH tiers (Studio → Private) are a separate,
 * orthogonal system — see lib/finish.ts — gating the interactive effects
 * layer of the library shell itself.
 */

export type TierId = "low" | "mid" | "scale" | "high" | "premium"

export interface Tier {
  id: TierId
  short: string
  plan: string
  price: string
  motionCap: 0 | 1 | 2 | 3
  promise: string
}

export const TIERS: Tier[] = [
  { id: "low", short: "Starter", plan: "Starter", price: "$3 – $79", motionCap: 0, promise: "A finished, honest site. Fast, findable, one clear action." },
  { id: "mid", short: "Growth", plan: "Growth", price: "$80 – $299", motionCap: 1, promise: "A built-in booking, quote or reservation flow — the site starts working." },
  { id: "scale", short: "Scale", plan: "Scale", price: "$300 – $999", motionCap: 1, promise: "Growth with room to prove it: more pages, light finders, richer proof — without losing focus." },
  { id: "high", short: "Business", plan: "Business", price: "$1,000 – $4,999", motionCap: 2, promise: "Depth for a larger operator: finders, filters, multiple locations, signature motion." },
  { id: "premium", short: "Flagship", plan: "Flagship", price: "Custom", motionCap: 3, promise: "Digital operations: portals, live availability, commerce and art-directed motion." },
]

export const TIER_ORDER: TierId[] = ["low", "mid", "scale", "high", "premium"]
export const tierOf = (id: TierId) => TIERS.find((t) => t.id === id)!

/** What each tier includes — the comparison table in the Tier panel. */
export const LADDER: { label: string; values: Record<TierId, string> }[] = [
  { label: "Pages", values: { low: "1 – 3", mid: "3 – 5", scale: "4 – 6", high: "5 – 7", premium: "6 +" } },
  { label: "Primary action", values: { low: "Call / visit", mid: "Book · quote · reserve", scale: "Guided enquiry", high: "Qualified lead flow", premium: "Full digital operations" } },
  { label: "Forms", values: { low: "Contact", mid: "Smart, validated", scale: "Multi-step", high: "Multi-step intake", premium: "Conditional workflows" } },
  { label: "Booking", values: { low: "Link or call", mid: "Built-in flow", scale: "Capacity-aware", high: "Staff / resource aware", premium: "Live availability" } },
  { label: "Finders & filters", values: { low: "—", mid: "Light", scale: "Search + filters", high: "Search + filters", premium: "Personalised" } },
  { label: "Accounts", values: { low: "—", mid: "—", scale: "—", high: "—", premium: "Portal / membership" } },
  { label: "Languages", values: { low: "One", mid: "One", scale: "Ready", high: "Ready", premium: "Switchable" } },
  { label: "Motion", values: { low: "None", mid: "Refined hover", scale: "Refined + reveals", high: "Signature reveals", premium: "Art-directed" } },
]

/** Playbook module counts per tier — the 344-module backbone. */
export const PLAYBOOK_BY_TIER: Record<TierId, number> = { low: 50, mid: 88, scale: 39, high: 136, premium: 31 }
