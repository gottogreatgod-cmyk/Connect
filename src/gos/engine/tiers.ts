/**
 * The tier ladder. A tier is not a colour change — it changes depth,
 * proof, automation and operational capability. Each industry ships one
 * template per tier, and each is a different business at a different
 * scale, so the jump between tiers is visible in the work itself.
 */

export type TierId = "low" | "mid" | "high" | "premium"

export interface Tier {
  id: TierId
  short: string
  plan: string
  price: string
  motionCap: 0 | 1 | 2 | 3
  promise: string
}

export const TIERS: Tier[] = [
  { id: "low", short: "Low", plan: "Starter", price: "$3 – $79", motionCap: 0, promise: "A finished, honest site. Fast, findable, one clear action." },
  { id: "mid", short: "Mid", plan: "Growth", price: "$80 – $499", motionCap: 1, promise: "A built-in booking, quote or reservation flow — the site starts working." },
  { id: "high", short: "High", plan: "Business", price: "$500 – $4,999", motionCap: 2, promise: "Depth for a larger operator: finders, filters, multiple locations, signature motion." },
  { id: "premium", short: "Premium", plan: "Flagship", price: "Custom", motionCap: 3, promise: "Digital operations: portals, live availability, commerce and art-directed motion." },
]

export const TIER_ORDER: TierId[] = ["low", "mid", "high", "premium"]
export const tierOf = (id: TierId) => TIERS.find((t) => t.id === id)!

/** What each tier includes — the comparison table in the Tier panel. */
export const LADDER: { label: string; values: Record<TierId, string> }[] = [
  { label: "Pages", values: { low: "1 – 3", mid: "3 – 4", high: "4 – 5", premium: "5 +" } },
  { label: "Primary action", values: { low: "Call / visit", mid: "Book · quote · reserve", high: "Qualified lead flow", premium: "Full digital operations" } },
  { label: "Forms", values: { low: "Contact", mid: "Smart, validated", high: "Multi-step intake", premium: "Conditional workflows" } },
  { label: "Booking", values: { low: "Link or call", mid: "Built-in flow", high: "Staff / resource aware", premium: "Live availability" } },
  { label: "Finders & filters", values: { low: "—", mid: "Light", high: "Search + filters", premium: "Personalised" } },
  { label: "Accounts", values: { low: "—", mid: "—", high: "—", premium: "Portal / membership" } },
  { label: "Languages", values: { low: "One", mid: "One", high: "Ready", premium: "Switchable" } },
  { label: "Motion", values: { low: "None", mid: "Refined hover", high: "Signature reveals", premium: "Art-directed" } },
]
