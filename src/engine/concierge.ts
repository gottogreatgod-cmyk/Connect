/**
 * Concierge — the grounded recommender, ported from OMNIFORGE and
 * re-pointed at the Growth OS registry.
 *
 * Typed, deterministic scoring over the template registry's own metadata
 * (names, industries, kinds, conversion verbs, module lists, signatures).
 * No LLM, no hallucination: an answer is a scored, cited list of real
 * template slugs. When confidence is low, the panel says so honestly
 * ("no strong match — here is the closest template and why") instead of
 * inventing enthusiasm.
 */
import { TEMPLATES, industryOf, type TemplateDef } from "./registry"
import { tierOf } from "./tiers"

export interface ConciergeResultItem {
  slug: string
  name: string
  industry: string
  tierPlan: string
  kind: string
  score: number
  why: string
}

export interface ConciergeAnswer {
  query: string
  confidence: "high" | "medium" | "low"
  headline: string
  note: string
  items: ConciergeResultItem[]
  chips: string[]
}

const STOP = new Set([
  "a", "an", "the", "for", "with", "and", "or", "to", "of", "in", "on", "my", "me", "i",
  "need", "want", "looking", "build", "make", "site", "website", "page", "pages", "template",
  "templates", "kit", "kits", "something", "best", "please", "can", "you", "recommend", "show",
  "business", "small", "new",
])

const INDUSTRY_HINTS: Record<string, string[]> = {
  food: ["restaurant", "cafe", "café", "coffee", "bakery", "bar", "grill", "kitchen", "menu", "dining", "dinner", "table", "chef", "food", "drink", "sushi", "omakase", "pizza", "bistro", "takeaway", "catering", "steak", "wine", "brewery"],
  health: ["clinic", "doctor", "dentist", "dental", "physio", "therapy", "health", "medical", "patient", "appointment", "wellness", "care", "nurse", "surgery", "hospital", "telehealth", "specialist", "consultant"],
  legal: ["law", "lawyer", "solicitor", "attorney", "legal", "firm", "case", "court", "immigration", "employment", "family", "contract", "compliance", "advice", "barrister"],
  home: ["plumber", "plumbing", "electrician", "boiler", "cleaning", "cleaner", "window", "gutter", "roof", "heating", "repair", "trades", "engineer", "builder", "locksmith", "gardener", "service", "home", "ev", "charger"],
  property: ["property", "real", "estate", "house", "houses", "flat", "apartment", "letting", "lettings", "rent", "rental", "buy", "sell", "listing", "listings", "agent", "agency", "mortgage", "valuation", "viewing", "development", "residence", "landlord", "tenant", "buyer"],
}

const TIER_HINTS: Record<string, string[]> = {
  low: ["cheap", "simple", "starter", "basic", "one", "single", "quick", "small", "budget", "honest"],
  mid: ["booking", "book", "reserve", "reservation", "quote", "calendar", "growth", "form"],
  scale: ["private dining", "events", "event", "sourcing", "scale", "bigger", "growing", "expand", "richer", "proof"],
  high: ["multi", "several", "branches", "offices", "locations", "team", "directory", "search", "filters", "larger", "company", "group"],
  premium: ["portal", "membership", "members", "live", "tracking", "commerce", "shop", "order", "flagship", "premium", "luxury", "destination", "operations"],
}

const KIND_HINTS: Record<string, string[]> = {
  reservations: ["reserve", "reservation", "table", "book", "booking"],
  ordering: ["order", "buy", "cart", "shop", "box"],
  quote: ["quote", "estimate", "price", "pricing"],
  portal: ["portal", "account", "sign in", "dashboard", "track"],
}

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/[\s-]+/)
    .filter((t) => t.length > 1 && !STOP.has(t))
}

function scoreEntry(t: TemplateDef, tokens: string[]): { score: number; hits: string[] } {
  const hay = [
    t.name.toLowerCase(),
    t.kind.toLowerCase(),
    t.family.toLowerCase(),
    t.city.toLowerCase(),
    t.positioning.toLowerCase(),
    t.conversion.toLowerCase(),
    t.modules.join(" ").toLowerCase(),
    t.signature.join(" ").toLowerCase(),
    industryOf(t.industry).label.toLowerCase(),
  ]
  const hits: string[] = []
  let score = 0

  for (const t2 of tokens) {
    if (hay.some((h) => h.includes(t2))) {
      score += 2
      hits.push(t2)
    }
  }
  for (const tok of tokens) {
    if ((INDUSTRY_HINTS[t.industry] ?? []).some((h) => h === tok || h.includes(tok) || tok.includes(h))) score += 1.5
  }
  for (const [tier, hints] of Object.entries(TIER_HINTS)) {
    if (t.tier === tier && tokens.some((tok) => hints.includes(tok))) score += 1
  }
  for (const [kind, hints] of Object.entries(KIND_HINTS)) {
    const has = hints.some((h) => hay.join(" ").includes(h))
    if (has && tokens.some((tok) => hints.includes(tok))) score += 1
  }
  /* light deterministic tie-breaker so results are stable across asks */
  let h = 0
  for (let i = 0; i < t.slug.length; i++) h = (h * 31 + t.slug.charCodeAt(i)) >>> 0
  score += (h % 7) / 100
  return { score, hits }
}

export const CONCIERGE_CHIPS = [
  "a restaurant that takes bookings",
  "a lettings agent with listings",
  "a clinic that books itself",
  "a plumber who needs the phone to ring",
  "a property developer with a portal",
]

export function askConcierge(query: string, max = 4): ConciergeAnswer {
  const tokens = tokenize(query)
  if (!tokens.length) {
    return {
      query,
      confidence: "low",
      headline: "Ask me about the work, not about me.",
      note: "Tell me the brief — “a restaurant that takes bookings”, “a lettings agent with listings” — and I will pick from the 23 finished templates.",
      items: [],
      chips: CONCIERGE_CHIPS,
    }
  }

  const scored = TEMPLATES.map((t) => ({ t, ...scoreEntry(t, tokens) }))
    .filter((s) => s.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)

  const confidence: ConciergeAnswer["confidence"] =
    scored.length >= 3 && scored[0].score >= 6 ? "high" : scored.length >= 2 ? "medium" : "low"

  if (!scored.length) {
    const closest = TEMPLATES.map((t) => ({ t, ...scoreEntry(t, tokens) })).sort((a, b) => b.score - a.score)[0]
    return {
      query,
      confidence: "low",
      headline: "No strong match in the library.",
      note: "The library is honest — nothing scored for that brief. Here is the nearest template and why it is only adjacent.",
      items:
        closest && closest.score > 0
          ? [{
              slug: closest.t.slug,
              name: closest.t.name,
              industry: industryOf(closest.t.industry).label,
              tierPlan: tierOf(closest.t.tier).plan,
              kind: closest.t.kind,
              score: Math.round(closest.score * 10) / 10,
              why: `Adjacent because it mentions: ${closest.hits.slice(0, 3).join(", ") || "the same industry"}.`,
            }]
          : [],
      chips: CONCIERGE_CHIPS,
    }
  }

  return {
    query,
    confidence,
    headline:
      confidence === "high"
        ? "Strong matches in the library."
        : confidence === "medium"
          ? "Two templates worth a look."
          : "One honest candidate.",
    note: `Scored all ${TEMPLATES.length} templates against your brief — every match cites the words that pulled it forward. Nothing here is invented.`,
    items: scored.map((s) => ({
      slug: s.t.slug,
      name: s.t.name,
      industry: industryOf(s.t.industry).label,
      tierPlan: tierOf(s.t.tier).plan,
      kind: s.t.kind,
      score: Math.round(s.score * 10) / 10,
      why: `Matched on: ${s.hits.slice(0, 4).join(", ") || "the brief's industry"}.`,
    })),
    chips: [],
  }
}
