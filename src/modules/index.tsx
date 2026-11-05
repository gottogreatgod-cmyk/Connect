"use client"

/**
 * The module library — the live rendering layer for the 344-module
 * playbook. Any module, from any section, inferred to an ARCHETYPE and
 * rendered with the token contract ONLY (--bg, --ink, --primary, --r…),
 * never a template's own classes — so a module mounts native on ANY of
 * the 23 templates, in ANY genome or edition skin.
 *
 * Archetype inference is keyword-driven over the module's name,
 * features and section — the same vocabulary the playbook uses.
 * Utility modules with no visual form fall back to the spec card.
 */
import type { PlaybookModule } from "@/engine/playbook"
import type { TemplateDef, IndustryId } from "@/engine/registry"
import { hasKitModule, renderKitModule } from "./registry"

export type SlotId = "hero" | "mid" | "foot"

/* ── archetype ids ────────────────────────────────────────────────── */

export type ArchetypeId =
  | "hero" | "features" | "menu" | "pricing" | "reviews" | "faq"
  | "gallery" | "stats" | "booking" | "logos" | "timeline" | "team"
  | "contact" | "cta" | "portal" | "spec"

export interface ArchetypeMeta {
  id: ArchetypeId
  label: string
  kind: "band" | "grid" | "flow" | "card"
}

export const ARCHETYPES: Record<ArchetypeId, ArchetypeMeta> = {
  hero: { id: "hero", label: "Hero band", kind: "band" },
  features: { id: "features", label: "Feature grid", kind: "grid" },
  menu: { id: "menu", label: "Priced list", kind: "grid" },
  pricing: { id: "pricing", label: "Pricing tiers", kind: "grid" },
  reviews: { id: "reviews", label: "Reviews", kind: "grid" },
  faq: { id: "faq", label: "FAQ", kind: "flow" },
  gallery: { id: "gallery", label: "Gallery", kind: "grid" },
  stats: { id: "stats", label: "Stats band", kind: "band" },
  booking: { id: "booking", label: "Booking flow", kind: "flow" },
  logos: { id: "logos", label: "Trust bar", kind: "band" },
  timeline: { id: "timeline", label: "Process timeline", kind: "flow" },
  team: { id: "team", label: "Team grid", kind: "grid" },
  contact: { id: "contact", label: "Contact card", kind: "card" },
  cta: { id: "cta", label: "Call to action", kind: "band" },
  portal: { id: "portal", label: "Portal entry", kind: "card" },
  spec: { id: "spec", label: "Spec card", kind: "card" },
}

/* ── keyword inference ────────────────────────────────────────────── */

const RULES: [ArchetypeId, RegExp][] = [
  ["booking", /book|reserv|appointment|schedul|calendar|availab|seat|sitting|waitlist/i],
  ["portal", /portal|login|sign.?in|account|member|dashboard|patient area|client area/i],
  ["pricing", /pricing|plan|package|subscription|quote builder/i],
  ["reviews", /review|testimonial|praise|rating|star/i],
  ["faq", /faq|question|answer/i],
  ["gallery", /gallery|photo|image|carousel|slider|lightbox|masonry/i],
  ["stats", /stat|metric|number|counter|score|kpi/i],
  ["logos", /logo|trust|partner|client|press|accredit|badge/i],
  ["timeline", /timeline|process|step|how it works|journey|stage/i],
  ["team", /team|staff|profile|people|bio|about/i],
  ["menu", /menu|dish|course|price list|service list|treatment|offering/i],
  ["contact", /contact|location|map|address|hour|direction|footer/i],
  ["cta", /cta|call.?to.?action|closing|announcement|conversion|sticky/i],
  ["hero", /hero|banner|spotlight|headline|landing|masthead/i],
  ["features", /feature|benefit|value|differentiator|explainer|why|included|capabilit/i],
]

export function inferArchetype(m: Pick<PlaybookModule, "name" | "features" | "section" | "purpose">): ArchetypeId {
  const hay = `${m.name} ${m.section} ${m.features.join(" ")} ${m.purpose}`
  for (const [id, re] of RULES) if (re.test(hay)) return id
  return "spec"
}

/* ── per-industry content packs ───────────────────────────────────── */

interface ContentPack {
  menuTitle: string
  menu: { name: string; note: string; price: string }[]
  featuresTitle: string
  features: { title: string; note: string }[]
  reviews: { quote: string; by: string }[]
  stats: { n: string; label: string }[]
  faq: { q: string; a: string }[]
  team: { name: string; role: string }[]
  timeline: { step: string; note: string }[]
  bookingCta: string
  ctaLine: string
}

const PACKS: Record<IndustryId, ContentPack> = {
  food: {
    menuTitle: "From the counter, this week",
    menu: [
      { name: "Sourdough, 36-hour ferment", note: "Wholegrain, stone-milled flour", price: "7" },
      { name: "Cured trout, ember cream", note: "Pickled rhubarb, dill oil", price: "18" },
      { name: "Ash-baked celeriac", note: "Aged comté, hazelnut", price: "21" },
      { name: "Burnt honey tart", note: "Thyme, raw cream", price: "11" },
    ],
    featuresTitle: "Why the regulars stay",
    features: [
      { title: "Everything baked today", note: "First proof at 4am; the counter tells the truth." },
      { title: "One room, one fire", note: "The kitchen is the dining room — you watch it all happen." },
      { title: "The menu fits the season", note: "Four changes a year, written the day before." },
    ],
    reviews: [
      { quote: "The trout alone is worth crossing the city for.", by: "City Paper" },
      { quote: "We booked the room for twelve and nobody left before midnight.", by: "Marta V., regular since 2021" },
      { quote: "Bread I would queue for — and I hate queues.", by: "Tom H." },
    ],
    stats: [
      { n: "12", label: "seats, one sitting" },
      { n: "4", label: "menu turns a year" },
      { n: "6y", label: "in the neighbourhood" },
    ],
    faq: [
      { q: "Can you hold a loaf for me?", a: "Yes — reserve by 3pm and it is yours until closing." },
      { q: "Do you take walk-ins?", a: "Always, but Friday and Saturday fill by 6pm." },
      { q: "Allergies?", a: "Tell us when you reserve; the kitchen plans around it." },
    ],
    team: [
      { name: "Ida Frost", role: "Head baker" },
      { name: "Emil Voss", role: "Chef de cuisine" },
      { name: "Noor Haddad", role: "Front of house" },
    ],
    timeline: [
      { step: "Reserve", note: "Pick a sitting and hold your seats" },
      { step: "Arrive", note: "Bread and butter while you read the board" },
      { step: "Eat", note: "Courses land as the fire allows" },
    ],
    bookingCta: "Reserve a seat",
    ctaLine: "Twelve seats, one fire. Reserve before the board is wiped.",
  },
  health: {
    menuTitle: "Treatments and consultations",
    menu: [
      { name: "First consultation", note: "40 minutes, full history", price: "€70" },
      { name: "Follow-up session", note: "25 minutes, progress review", price: "€45" },
      { name: "Therapy block, ×6", note: "One session a fortnight", price: "€240" },
      { name: "Urgent same-day", note: "Held twice daily", price: "€90" },
    ],
    featuresTitle: "Care that explains itself",
    features: [
      { title: "Same-week appointments", note: "Urgent slots held open every single day." },
      { title: "One clinician, start to finish", note: "You are never handed off mid-treatment." },
      { title: "Plain-language plans", note: "You leave knowing exactly what happens next." },
    ],
    reviews: [
      { quote: "First clinic that fixed the cause, not the symptom.", by: "Anne R." },
      { quote: "They explained the whole plan before touching anything.", by: "J. Okonkwo" },
      { quote: "Seen the same day I called. Unheard of.", by: "Priya S." },
    ],
    stats: [
      { n: "94%", label: "return for full plan" },
      { n: "2", label: "urgent slots daily" },
      { n: "11y", label: "in practice" },
    ],
    faq: [
      { q: "Do I need a referral?", a: "No — book directly; we liaise with your GP when needed." },
      { q: "Is parking nearby?", a: "Two minutes on foot, and the tram stops at the door." },
      { q: "What should I bring?", a: "Any prior scans or letters, and comfortable clothing." },
    ],
    team: [
      { name: "Dr. Lena Marlowe", role: "Lead clinician" },
      { name: "Sam Whitfield", role: "Physiotherapist" },
      { name: "Ana Duarte", role: "Practice nurse" },
    ],
    timeline: [
      { step: "Book", note: "Online, or call the practice" },
      { step: "Assess", note: "Full history and honest examination" },
      { step: "Plan", note: "Written plan, fixed price, no surprises" },
    ],
    bookingCta: "Book a consultation",
    ctaLine: "Pain has a plan. Book the assessment that finds it.",
  },
  legal: {
    menuTitle: "Services and fixed fees",
    menu: [
      { name: "Consultation, 60 min", note: "Case read, options, fixed quote", price: "£180" },
      { name: "Contract review", note: "Plain-English report in 3 days", price: "£450" },
      { name: "Case representation", note: "From instruction to resolution", price: "from £2,400" },
      { name: "Urgent same-day call", note: "For time-critical matters", price: "£240" },
    ],
    featuresTitle: "Fixed fees, no ambush",
    features: [
      { title: "You talk to a solicitor", note: "Not a call centre, not a chatbot — from minute one." },
      { title: "Fixed quotes before work starts", note: "The number you are given is the number you pay." },
      { title: "Answers in plain English", note: "Every letter we write, you can read out loud." },
    ],
    reviews: [
      { quote: "Quoted, done, invoiced at the quote. Refreshing.", by: "Harrington Ltd" },
      { quote: "They took a nightmarish dispute and made it boring.", by: "Client, employment matter" },
      { quote: "Replied the same afternoon, every time.", by: "R. & M. Phelps" },
    ],
    stats: [
      { n: "24h", label: "reply, guaranteed" },
      { n: "3", label: "fixed-fee tiers" },
      { n: "17y", label: "at the same address" },
    ],
    faq: [
      { q: "What does the consultation cover?", a: "A case read, your options, and a fixed quote for whichever route you pick." },
      { q: "Can you act urgently?", a: "Yes — we hold same-day capacity for time-critical matters." },
      { q: "Are costs capped?", a: "Every stage is quoted before it starts. Nothing runs open-ended." },
    ],
    team: [
      { name: "Iris Calder", role: "Principal solicitor" },
      { name: "Daniel Harrow", role: "Senior associate" },
      { name: "Fen Park", role: "Paralegal" },
    ],
    timeline: [
      { step: "Instruct", note: "One consultation, everything on the table" },
      { step: "Strategy", note: "Written plan with fixed fees per stage" },
      { step: "Resolve", note: "Executed, reported, closed" },
    ],
    bookingCta: "Book a consultation",
    ctaLine: "Legal clarity starts with one fixed-fee hour.",
  },
  home: {
    menuTitle: "Services and call-outs",
    menu: [
      { name: "Call-out diagnosis", note: "At your door within 24h", price: "£89" },
      { name: "Full service", note: "Parts, labour, 12-month guarantee", price: "from £240" },
      { name: "Annual care plan", note: "Two visits, priority line", price: "£19/mo" },
      { name: "Emergency, same-day", note: "7am–10pm, every day", price: "£129" },
    ],
    featuresTitle: "The trade, done properly",
    features: [
      { title: "Fixed price before we start", note: "Diagnosed, quoted, approved — in that order." },
      { title: "Engineers, not salespeople", note: "Nobody earns commission on what they sell you." },
      { title: "Tidy by five", note: "We leave the room cleaner than we found it." },
    ],
    reviews: [
      { quote: "Quoted before a screw was turned. Stuck to it.", by: "Mrs. Ellison" },
      { quote: "Came at 8am, boiler ran by lunch.", by: "K. Osei" },
      { quote: "Third year on the care plan. Zero complaints.", by: "The Brennan household" },
    ],
    stats: [
      { n: "24h", label: "door-to-door" },
      { n: "12mo", label: "guarantee, standard" },
      { n: "4.9", label: "average rating" },
    ],
    faq: [
      { q: "Are you insured?", a: "Fully — £5m public liability, and every visit is documented." },
      { q: "Do you carry parts?", a: "The common ones, yes; anything else arrives next-day." },
      { q: "Can I get a fixed price?", a: "Always, after diagnosis, before any work begins." },
    ],
    team: [
      { name: "Volt Electrical", role: "Founded 2011" },
      { name: "Ravi Chandran", role: "Lead engineer" },
      { name: "Meg Doyle", role: "Service coordinator" },
    ],
    timeline: [
      { step: "Call", note: "Describe the fault, get a slot" },
      { step: "Diagnose", note: "Fixed quote before any work" },
      { step: "Fix & guarantee", note: "12 months, in writing" },
    ],
    bookingCta: "Book a call-out",
    ctaLine: "One call, one visit, one fixed price. Book the engineer.",
  },
  property: {
    menuTitle: "Listings and services",
    menu: [
      { name: "Private viewings", note: "Weekend and evening slots", price: "—" },
      { name: "Valuation, full report", note: "Three comparables, 48h", price: "£390" },
      { name: "Sales progression", note: "Offer to keys, one handler", price: "1.2%" },
      { name: "Lettings management", note: "Vetted tenants, monthly reports", price: "8%/mo" },
    ],
    featuresTitle: "Property, without the theatre",
    features: [
      { title: "Every viewing accompanied", note: "Someone who knows the building walks you through." },
      { title: "Honest valuation ranges", note: "Three comparables, in writing, before you commit." },
      { title: "One handler to keys", note: "The person who sells it manages it to completion." },
    ],
    reviews: [
      { quote: "Sold in eleven days, four percent over asking.", by: "The Marsh family" },
      { quote: "The valuation report was the most honest we saw.", by: "J. Adeyemi" },
      { quote: "Weekly updates without ever chasing once.", by: "Dunmore Lettings" },
    ],
    stats: [
      { n: "11", label: "median days to offer" },
      { n: "98%", label: "of asking achieved" },
      { n: "23y", label: "on the same street" },
    ],
    faq: [
      { q: "How fast can I view?", a: "Accompanied slots run Thu–Sun; evening viewings on request." },
      { q: "What does valuation include?", a: "Three comparables, condition notes, and a written range — within 48 hours." },
      { q: "Do you handle lettings?", a: "Full management, vetted tenants, monthly owner reports." },
    ],
    team: [
      { name: "Northbank Residences", role: "Est. 2002" },
      { name: "Clara Whitmore", role: "Sales director" },
      { name: "Theo Marsh", role: "Head of viewings" },
    ],
    timeline: [
      { step: "Enquire", note: "Book a viewing or a valuation" },
      { step: "View", note: "Accompanied, unhurried, honest" },
      { step: "Offer to keys", note: "One handler, weekly written updates" },
    ],
    bookingCta: "Book a viewing",
    ctaLine: "The residence speaks for itself. Book the viewing.",
  },
}

/* ── shared primitives — token contract only ──────────────────────── */

const eyebrow: React.CSSProperties = {
  fontFamily: "var(--mono, monospace)",
  fontSize: 10,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "var(--muted)",
}
const display: React.CSSProperties = {
  fontFamily: "var(--display)",
  color: "var(--ink)",
  lineHeight: 1.08,
  margin: 0,
  fontWeight: 500,
}
const body: React.CSSProperties = {
  fontFamily: "var(--body)",
  color: "var(--muted)",
  lineHeight: 1.6,
  margin: 0,
}

function Band({ children, pad = "clamp(44px, 7cqi, 84px)" }: { children: React.ReactNode; pad?: string }) {
  return (
    <section
      data-mod-band
      style={{ background: "var(--bg)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", padding: `${pad} clamp(20px, 6cqi, 72px)` }}
    >
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>{children}</div>
    </section>
  )
}

function Cta({ label, kind = "solid" }: { label: string; kind?: "solid" | "ghost" }) {
  return (
    <button
      type="button"
      style={
        kind === "solid"
          ? { background: "var(--primary)", color: "var(--on-primary)", borderRadius: "var(--r)", padding: "12px 22px", fontFamily: "var(--body)", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer" }
          : { background: "transparent", color: "var(--ink)", borderRadius: "var(--r)", padding: "12px 20px", fontFamily: "var(--body)", fontSize: 14, fontWeight: 500, border: "1px solid var(--line)", cursor: "pointer" }
      }
    >
      {label}
    </button>
  )
}

/* ── archetypes ───────────────────────────────────────────────────── */

function Hero({ pack, m }: { pack: ContentPack; m: PlaybookModule }) {
  return (
    <Band>
      <p style={eyebrow}>{m.name}</p>
      <h2 style={{ ...display, fontSize: "clamp(34px, 5cqi, 58px)", margin: "14px 0 18px", maxWidth: 760 }}>{pack.ctaLine}</h2>
      <p style={{ ...body, fontSize: 17, maxWidth: 560 }}>{m.purpose}</p>
      <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
        <Cta label={pack.bookingCta} />
        <Cta label="See how it works" kind="ghost" />
      </div>
    </Band>
  )
}

function Features({ pack, m }: { pack: ContentPack; m: PlaybookModule }) {
  return (
    <Band>
      <p style={eyebrow}>{m.section}</p>
      <h2 style={{ ...display, fontSize: "clamp(26px, 3.4cqi, 38px)", margin: "12px 0 34px" }}>{pack.featuresTitle}</h2>
      <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        {pack.features.map((f) => (
          <article key={f.title} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r)", padding: 24 }}>
            <h3 style={{ ...display, fontSize: 19, marginBottom: 8 }}>{f.title}</h3>
            <p style={{ ...body, fontSize: 13.5 }}>{f.note}</p>
          </article>
        ))}
      </div>
    </Band>
  )
}

function Menu({ pack, m }: { pack: ContentPack; m: PlaybookModule }) {
  return (
    <Band>
      <p style={eyebrow}>{m.section}</p>
      <h2 style={{ ...display, fontSize: "clamp(26px, 3.4cqi, 38px)", margin: "12px 0 28px" }}>{pack.menuTitle}</h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {pack.menu.map((item) => (
          <li
            key={item.name}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: "4px 18px",
              padding: "16px 0",
              borderBottom: "1px solid var(--line)",
              alignItems: "baseline",
            }}
          >
            <b style={{ fontFamily: "var(--body)", color: "var(--ink)", fontWeight: 600, fontSize: 16 }}>{item.name}</b>
            <span style={{ fontFamily: "var(--display)", color: "var(--accent)", fontSize: 18 }}>{item.price}</span>
            <span style={{ ...body, fontSize: 13, gridColumn: "1 / -1" }}>{item.note}</span>
          </li>
        ))}
      </ul>
    </Band>
  )
}

function Pricing({ pack, m }: { pack: ContentPack; m: PlaybookModule }) {
  const tiers = [
    { name: "Essential", price: pack.menu[1]?.price ?? "£190", note: "The honest core — everything a first-time client needs.", hot: false },
    { name: "Complete", price: pack.menu[2]?.price ?? "£450", note: "The full plan, handled end to end with priority timing.", hot: true },
    { name: "Bespoke", price: "On request", note: "Multi-site, multi-party, or ongoing retained work.", hot: false },
  ]
  return (
    <Band>
      <p style={eyebrow}>{m.section}</p>
      <h2 style={{ ...display, fontSize: "clamp(26px, 3.4cqi, 38px)", margin: "12px 0 30px" }}>Three ways to work with us</h2>
      <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
        {tiers.map((t) => (
          <article
            key={t.name}
            style={{
              background: "var(--surface)",
              border: t.hot ? "2px solid var(--primary)" : "1px solid var(--line)",
              borderRadius: "var(--r)",
              padding: 26,
              position: "relative",
            }}
          >
            {t.hot && (
              <span
                style={{
                  position: "absolute",
                  top: -11,
                  left: 24,
                  background: "var(--primary)",
                  color: "var(--on-primary)",
                  fontFamily: "var(--mono, monospace)",
                  fontSize: 9.5,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  padding: "4px 10px",
                  borderRadius: 999,
                }}
              >
                Most chosen
              </span>
            )}
            <p style={eyebrow}>{t.name}</p>
            <p style={{ ...display, fontSize: 34, margin: "10px 0 12px" }}>{t.price}</p>
            <p style={{ ...body, fontSize: 13.5, marginBottom: 20 }}>{t.note}</p>
            <Cta label="Choose this" kind={t.hot ? "solid" : "ghost"} />
          </article>
        ))}
      </div>
    </Band>
  )
}

function Reviews({ pack, m }: { pack: ContentPack; m: PlaybookModule }) {
  return (
    <Band>
      <p style={eyebrow}>{m.section}</p>
      <h2 style={{ ...display, fontSize: "clamp(26px, 3.4cqi, 38px)", margin: "12px 0 30px" }}>Said by the people who paid</h2>
      <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        {pack.reviews.map((r) => (
          <figure key={r.by} style={{ margin: 0, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r)", padding: 26 }}>
            <blockquote style={{ ...display, fontSize: 20, fontStyle: "italic", marginBottom: 14 }}>“{r.quote}”</blockquote>
            <figcaption style={{ ...eyebrow, color: "var(--accent)" }}>{r.by}</figcaption>
          </figure>
        ))}
      </div>
    </Band>
  )
}

function Faq({ pack, m }: { pack: ContentPack; m: PlaybookModule }) {
  return (
    <Band>
      <p style={eyebrow}>{m.section}</p>
      <h2 style={{ ...display, fontSize: "clamp(26px, 3.4cqi, 38px)", margin: "12px 0 26px" }}>Asked before booking</h2>
      <div style={{ display: "grid", gap: 10, maxWidth: 760 }}>
        {pack.faq.map((f) => (
          <details key={f.q} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r)", padding: "16px 20px" }}>
            <summary style={{ fontFamily: "var(--body)", color: "var(--ink)", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>{f.q}</summary>
            <p style={{ ...body, fontSize: 14, marginTop: 10 }}>{f.a}</p>
          </details>
        ))}
      </div>
    </Band>
  )
}

function Gallery({ pack, m }: { pack: ContentPack; m: PlaybookModule }) {
  const cells = [1, 2, 3, 4, 5, 6]
  return (
    <Band>
      <p style={eyebrow}>{m.section}</p>
      <h2 style={{ ...display, fontSize: "clamp(26px, 3.4cqi, 38px)", margin: "12px 0 28px" }}>{pack.featuresTitle}</h2>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}>
        {cells.map((c) => (
          <figure
            key={c}
            style={{
              margin: 0,
              aspectRatio: "4 / 5",
              borderRadius: "var(--r)",
              border: "1px solid var(--line)",
              background: `linear-gradient(135deg, color-mix(in srgb, var(--primary) ${6 + c * 3}%, var(--surface)), color-mix(in srgb, var(--accent) ${4 + c * 2}%, var(--bg)))`,
              display: "grid",
              placeItems: "center",
            }}
            aria-label={`${m.name} plate ${c}`}
          >
            <span style={{ ...eyebrow, color: "var(--muted)" }}>PLATE {String(c).padStart(2, "0")}</span>
          </figure>
        ))}
      </div>
    </Band>
  )
}

function Stats({ pack }: { pack: ContentPack }) {
  return (
    <Band pad="clamp(30px, 4.5cqi, 54px)">
      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", textAlign: "center" }}>
        {pack.stats.map((s) => (
          <div key={s.label}>
            <p style={{ ...display, fontSize: "clamp(38px, 5cqi, 56px)", color: "var(--accent)" }}>{s.n}</p>
            <p style={{ ...eyebrow, marginTop: 6 }}>{s.label}</p>
          </div>
        ))}
      </div>
    </Band>
  )
}

function Booking({ pack, m }: { pack: ContentPack; m: PlaybookModule }) {
  const input: React.CSSProperties = {
    background: "var(--surface)",
    border: "1px solid var(--line)",
    borderRadius: "var(--r)",
    color: "var(--ink)",
    fontFamily: "var(--body)",
    fontSize: 14,
    padding: "12px 14px",
    width: "100%",
  }
  return (
    <Band>
      <div style={{ display: "grid", gap: 34, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", alignItems: "center" }}>
        <div>
          <p style={eyebrow}>{m.section}</p>
          <h2 style={{ ...display, fontSize: "clamp(26px, 3.4cqi, 38px)", margin: "12px 0 14px" }}>{pack.bookingCta}</h2>
          <p style={{ ...body, fontSize: 15, marginBottom: 22 }}>{m.purpose}</p>
          <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
            {pack.timeline.map((t, i) => (
              <li key={t.step} style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                <span style={{ ...eyebrow, color: "var(--accent)" }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ fontFamily: "var(--body)", color: "var(--ink)", fontSize: 14, fontWeight: 600 }}>
                  {t.step} <span style={{ color: "var(--muted)", fontWeight: 400 }}>— {t.note}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <form
          style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r)", padding: 26, display: "grid", gap: 12 }}
          onSubmit={(e) => e.preventDefault()}
        >
          <label style={{ ...eyebrow, display: "grid", gap: 6 }}>
            Name
            <input style={input} placeholder="Your name" />
          </label>
          <label style={{ ...eyebrow, display: "grid", gap: 6 }}>
            Contact
            <input style={input} type="email" placeholder="you@example.com" />
          </label>
          <label style={{ ...eyebrow, display: "grid", gap: 6 }}>
            Preferred date
            <input style={input} type="date" />
          </label>
          <div style={{ marginTop: 8 }}>
            <Cta label={pack.bookingCta} />
          </div>
        </form>
      </div>
    </Band>
  )
}

function Logos({ pack, m }: { pack: ContentPack; m: PlaybookModule }) {
  const names = pack.team.map((t) => t.name)
  return (
    <Band pad="clamp(22px, 3cqi, 36px)">
      <p style={{ ...eyebrow, textAlign: "center", marginBottom: 18 }}>Trusted by the neighbourhood</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "14px 38px", justifyContent: "center", alignItems: "center" }}>
        {names.map((n) => (
          <span key={n} style={{ fontFamily: "var(--display)", fontSize: 20, color: "var(--muted)", letterSpacing: "0.02em" }}>
            {n}
          </span>
        ))}
        <span style={{ fontFamily: "var(--mono, monospace)", fontSize: 11, color: "var(--muted)", letterSpacing: "0.1em" }}>{m.name}</span>
      </div>
    </Band>
  )
}

function Timeline({ pack, m }: { pack: ContentPack; m: PlaybookModule }) {
  return (
    <Band>
      <p style={eyebrow}>{m.section}</p>
      <h2 style={{ ...display, fontSize: "clamp(26px, 3.4cqi, 38px)", margin: "12px 0 34px" }}>How it works</h2>
      <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        {pack.timeline.map((t, i) => (
          <li key={t.step} style={{ borderTop: "2px solid var(--accent)", paddingTop: 16 }}>
            <p style={{ ...display, fontSize: 40, color: "var(--accent)" }}>{String(i + 1).padStart(2, "0")}</p>
            <h3 style={{ ...display, fontSize: 19, margin: "8px 0 6px" }}>{t.step}</h3>
            <p style={{ ...body, fontSize: 13.5 }}>{t.note}</p>
          </li>
        ))}
      </ol>
    </Band>
  )
}

function Team({ pack, m }: { pack: ContentPack; m: PlaybookModule }) {
  return (
    <Band>
      <p style={eyebrow}>{m.section}</p>
      <h2 style={{ ...display, fontSize: "clamp(26px, 3.4cqi, 38px)", margin: "12px 0 30px" }}>The people you actually meet</h2>
      <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        {pack.team.map((t) => (
          <article key={t.name} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r)", padding: 24, textAlign: "center" }}>
            <span
              style={{
                display: "inline-grid",
                placeItems: "center",
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "color-mix(in srgb, var(--primary) 12%, var(--surface))",
                color: "var(--primary)",
                fontFamily: "var(--display)",
                fontSize: 20,
                marginBottom: 12,
              }}
            >
              {t.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
            </span>
            <h3 style={{ ...display, fontSize: 17 }}>{t.name}</h3>
            <p style={{ ...eyebrow, marginTop: 6 }}>{t.role}</p>
          </article>
        ))}
      </div>
    </Band>
  )
}

function Contact({ pack, m }: { pack: ContentPack; m: PlaybookModule }) {
  return (
    <Band>
      <div style={{ display: "grid", gap: 26, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <div>
          <p style={eyebrow}>{m.section}</p>
          <h2 style={{ ...display, fontSize: "clamp(24px, 3cqi, 34px)", margin: "12px 0 16px" }}>Find us, call us, write to us</h2>
          <p style={{ ...body, fontSize: 14.5, marginBottom: 18 }}>{m.purpose}</p>
          <div style={{ display: "grid", gap: 8 }}>
            <span style={{ fontFamily: "var(--body)", color: "var(--ink)", fontSize: 15, fontWeight: 600 }}>{pack.team[0]?.name}</span>
            <span style={{ ...body, fontSize: 14 }}>Mon–Fri 9–18 · Sat 10–16</span>
            <span style={{ ...body, fontSize: 14 }}>hello@{m.id.slice(0, 12) || "growthos"}.site · +44 20 7946 0102</span>
          </div>
        </div>
        <div
          style={{
            background: "linear-gradient(135deg, color-mix(in srgb, var(--accent) 9%, var(--surface)), color-mix(in srgb, var(--primary) 7%, var(--bg)))",
            border: "1px solid var(--line)",
            borderRadius: "var(--r)",
            minHeight: 220,
            display: "grid",
            placeItems: "center",
          }}
          aria-label="Map placeholder"
        >
          <span style={{ ...eyebrow }}>MAP · {m.name.toUpperCase()}</span>
        </div>
      </div>
    </Band>
  )
}

function CtaBand({ pack, m }: { pack: ContentPack; m: PlaybookModule }) {
  return (
    <Band>
      <div style={{ display: "flex", gap: 26, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ maxWidth: 640 }}>
          <p style={eyebrow}>{m.name}</p>
          <h2 style={{ ...display, fontSize: "clamp(24px, 3.4cqi, 40px)", margin: "10px 0 0" }}>{pack.ctaLine}</h2>
        </div>
        <Cta label={pack.bookingCta} />
      </div>
    </Band>
  )
}

function Portal({ pack, m }: { pack: ContentPack; m: PlaybookModule }) {
  const input: React.CSSProperties = {
    background: "var(--bg)",
    border: "1px solid var(--line)",
    borderRadius: "var(--r)",
    color: "var(--ink)",
    fontFamily: "var(--body)",
    fontSize: 14,
    padding: "12px 14px",
    width: "100%",
  }
  return (
    <Band>
      <div style={{ maxWidth: 420, margin: "0 auto", textAlign: "center" }}>
        <p style={eyebrow}>{m.section}</p>
        <h2 style={{ ...display, fontSize: "clamp(24px, 3cqi, 32px)", margin: "12px 0 8px" }}>Your room</h2>
        <p style={{ ...body, fontSize: 14, marginBottom: 20 }}>{m.purpose}</p>
        <form style={{ display: "grid", gap: 10, textAlign: "left" }} onSubmit={(e) => e.preventDefault()}>
          <input style={input} placeholder="Email or reference" aria-label="Login" />
          <input style={input} type="password" placeholder="Passcode" aria-label="Passcode" />
          <Cta label="Open my room" />
        </form>
      </div>
    </Band>
  )
}

function SpecCard({ m, tpl }: { m: PlaybookModule; tpl: TemplateDef }) {
  return (
    <Band pad="clamp(28px, 4cqi, 48px)">
      <p style={eyebrow}>
        {m.sectionNo} · {m.section} · mounted on {tpl.name}
      </p>
      <h2 style={{ ...display, fontSize: "clamp(22px, 2.8cqi, 30px)", margin: "12px 0 10px" }}>{m.name}</h2>
      <p style={{ fontFamily: "var(--mono, monospace)", fontSize: 11.5, color: "var(--muted)", marginBottom: 14 }}>{m.file}</p>
      <p style={{ ...body, fontSize: 14.5, maxWidth: 700, marginBottom: 14 }}>{m.purpose}</p>
      {m.rule && (
        <p style={{ ...body, fontSize: 13, borderTop: "1px solid var(--line)", paddingTop: 12, maxWidth: 700 }}>
          <b style={{ color: "var(--ink)" }}>Rule — </b>
          {m.rule}
        </p>
      )}
      <ul style={{ listStyle: "none", display: "flex", flexWrap: "wrap", gap: 8, padding: 0, margin: "18px 0 0" }}>
        {m.features.map((f) => (
          <li
            key={f}
            style={{ border: "1px solid var(--line)", borderRadius: 999, padding: "5px 12px", fontFamily: "var(--mono, monospace)", fontSize: 10.5, color: "var(--muted)", letterSpacing: "0.06em" }}
          >
            {f}
          </li>
        ))}
      </ul>
    </Band>
  )
}

/* ── the card — archetype inference + industry content + render ───── */

export function ModuleCard({ m, tpl, slot }: { m: PlaybookModule; tpl: TemplateDef; slot: SlotId }) {
  const pack = PACKS[tpl.industry]
  const arch = inferArchetype(m)
  const meta = ARCHETYPES[arch]
  const props = { pack, m }
  /* the factory kit wins: when the playbook id maps to a real, interactive
     kit component (src/modules/kit), mount that with honest demo props
     instead of the generic archetype renderer. */
  const real = hasKitModule(m.id) ? renderKitModule(m, tpl) : null
  return (
    <div data-mod-card data-arch={real ? "kit" : arch} data-slot={slot} style={{ width: "100%", position: "relative", paddingTop: 26 }}>
      <span
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 5,
          background: "var(--primary)",
          color: "var(--on-primary)",
          fontFamily: "var(--mono, monospace)",
          fontSize: 9,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          padding: "5px 10px",
          borderRadius: "var(--r)",
        }}
        aria-hidden
      >
        {real ? `FACTORY KIT · REAL · ${m.name}` : `${meta.label} · ${m.name}`}
      </span>
      {real ? (
        real
      ) : (
        <>
          {arch === "hero" && <Hero {...props} />}
          {arch === "features" && <Features {...props} />}
          {arch === "menu" && <Menu {...props} />}
          {arch === "pricing" && <Pricing {...props} />}
          {arch === "reviews" && <Reviews {...props} />}
          {arch === "faq" && <Faq {...props} />}
          {arch === "gallery" && <Gallery {...props} />}
          {arch === "stats" && <Stats pack={pack} />}
          {arch === "booking" && <Booking {...props} />}
          {arch === "logos" && <Logos {...props} />}
          {arch === "timeline" && <Timeline {...props} />}
          {arch === "team" && <Team {...props} />}
          {arch === "contact" && <Contact {...props} />}
          {arch === "cta" && <CtaBand {...props} />}
          {arch === "portal" && <Portal {...props} />}
          {arch === "spec" && <SpecCard m={m} tpl={tpl} />}
        </>
      )}
    </div>
  )
}

export { PACKS as CONTENT_PACKS }
