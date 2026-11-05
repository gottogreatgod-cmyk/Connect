import { font, type Mode, type Palette } from "./genome"
import { TIER_ORDER, type TierId } from "./tiers"

/**
 * The template registry — one definition file per template, as the
 * Template OS spec requires. The shell reads ONLY this file; the site
 * components live in src/sites and are loaded on demand.
 *
 * 23 finished templates · 5 industries — 21 token-built from the
 * genome engine, plus 2 module-built from the Template Factory kit
 * (src/factory + src/modules/kit): the same registry, the same tier
 * morph ladder, the same genome contract. Every template walks the
 * FIVE rung ladder (Starter → Growth → Scale → Business → Flagship)
 * as one design: page `tier` gates mark which rung a page appears at,
 * and the sites' <TierGate> sections follow the same contract.
 */

export type IndustryId = "food" | "health" | "legal" | "home" | "property"

export interface Industry {
  id: IndustryId
  label: string
  conversion: string
}

export const INDUSTRIES: Industry[] = [
  { id: "food", label: "Food & Beverage", conversion: "Reservation, order, private enquiry" },
  { id: "health", label: "Healthcare & Wellness", conversion: "Appointment, referral, urgent contact" },
  { id: "legal", label: "Legal", conversion: "Consultation, case evaluation, urgent call" },
  { id: "home", label: "Home Services", conversion: "Quote, call, booking" },
  { id: "property", label: "Property & Real Estate", conversion: "Viewing, valuation, purchase enquiry" },
]

export interface PageDef {
  id: string
  label: string
  /** minimum tier-morph step this page exists at — undefined = always visible */
  tier?: TierId
}

export interface TemplateDef {
  slug: string
  name: string
  industry: IndustryId
  tier: TierId
  kind: string
  city: string
  family: string
  positioning: string
  conversion: string
  pages: PageDef[]
  modules: string[]
  signature: string[]
  voice: { display: string; body: string; label: string }
  mode: Mode
  light: Palette
  dark: Palette
  radius: number
  /** module-built from the Template Factory kit (src/modules/kit) —
   composed of real interactive modules instead of token-drawn CSS */
  kit?: boolean
}

export const TEMPLATES: TemplateDef[] = [
  /* ── FOOD & BEVERAGE ─────────────────────────────────────────── */
  {
    slug: "molo-bakehouse",
    name: "Molo Bakehouse",
    industry: "food",
    tier: "low",
    kind: "Café Essentials",
    city: "Stockbridge, Edinburgh",
    family: "Chalk & Crumb",
    positioning: "A neighbourhood bakery that sells out by noon — the site answers: what's in the oven, when are you open, where are you.",
    conversion: "Visit today · call to reserve a loaf",
    pages: [{ id: "home", label: "Home" }],
    modules: ["AnnouncementBar", "HeroEditorial", "MenuBoard", "OpenNowBadge", "LocationCard", "CallNowPanel", "SiteFooter"],
    signature: ["Bake board with sell-out times, written like the shop chalkboard", "Live 'open now' status computed from real opening hours", "Arched photo frame and hand-set price leaders"],
    voice: { display: font.fraunces, body: font.dmSans, label: "Fraunces · DM Sans" },
    mode: "light",
    light: { bg: "#F4EBDD", surface: "#FBF5EA", ink: "#2B1D14", muted: "#6A5544", line: "#DCCBB2", primary: "#B23A24", onPrimary: "#FFF8F0", accent: "#9A6A12" },
    dark: { bg: "#1E1611", surface: "#291F18", ink: "#F4EBDD", muted: "#BFAE98", line: "#45362A", primary: "#E0644A", onPrimary: "#1E1611", accent: "#E2A63B" },
    radius: 6,
  },
  {
    slug: "kumo-omakase",
    name: "Kumo Omakase",
    industry: "food",
    tier: "mid",
    kind: "Restaurant Reservations",
    city: "De Pijp, Amsterdam",
    family: "Washi",
    positioning: "Ten counter seats, two sittings a night. The site's one job is to fill both sittings without a phone call.",
    conversion: "Reserve a counter seat",
    pages: [
      { id: "home", label: "Home" },
      { id: "menu", label: "Omakase", tier: "mid" },
      { id: "reserve", label: "Reserve", tier: "mid" },
    ],
    modules: ["SiteHeader", "HeroEditorial", "MenuBoard", "ReservationFlow", "SeatMap", "ReviewCarousel", "FAQAccordion", "StickyCtaBar"],
    signature: ["Four-step reservation with sitting-aware seat counts", "Vertical kanji rail and paper-grain sections", "Course-by-course omakase with sake pairing toggle"],
    voice: { display: font.instrument, body: font.inter, label: "Instrument Serif · Inter" },
    mode: "light",
    light: { bg: "#F5F2EC", surface: "#FFFFFF", ink: "#191919", muted: "#5E5A53", line: "#DDD7CC", primary: "#B7371A", onPrimary: "#FFFFFF", accent: "#3E5641" },
    dark: { bg: "#121212", surface: "#1B1A19", ink: "#EFEBE3", muted: "#A39E95", line: "#2F2D2A", primary: "#E0603F", onPrimary: "#121212", accent: "#8DAA8F" },
    radius: 2,
  },
  {
    slug: "ember-oak",
    name: "Ember & Oak",
    industry: "food",
    tier: "scale",
    kind: "Wood-Fire Grill & Reservations",
    city: "Mott Haven, Bronx",
    family: "Warm Hearth",
    positioning: "A neighbourhood wood-fire grill where seasonal ingredients meet open-flame cooking. Approachable fine dining without the formality — and a reservation flow that fills the room.",
    conversion: "Reserve a table · enquire about private dining",
    pages: [
      { id: "home", label: "Home" },
      { id: "menu", label: "Menu", tier: "mid" },
      { id: "reservations", label: "Reservations", tier: "mid" },
      { id: "private-dining", label: "Private Dining", tier: "mid" },
      { id: "contact", label: "Contact" },
    ],
    modules: ["SiteHeader", "AnnouncementBar", "HeroEditorial", "MenuBoard", "TrustBar", "ReviewCarousel", "GalleryMasonry", "ProcessTimeline", "FAQAccordion", "ReservationFlow", "PrivateDiningEnquiry", "ContactForm", "LocationCard", "TeamProfiles", "StickyCtaBar"],
    signature: ["Reservation flow that validates date, time, party and contact — built in, not linked out", "Private-dining enquiry with event details, budget and coordinator follow-up", "Menu with categories, prices, dietary tags and honest sourcing notes", "Warm editorial system: fire-kissed neutrals, charcoal, ember tones"],
    voice: { display: font.playfair, body: font.inter, label: "Playfair Display · Inter" },
    mode: "dark",
    light: { bg: "#FAF6F2", surface: "#FFFFFF", ink: "#1F1915", muted: "#6B5D50", line: "#E2D8CC", primary: "#B85C2E", onPrimary: "#FFFBF7", accent: "#7A5C1E" },
    dark: { bg: "#12100D", surface: "#1B1713", ink: "#F3E9DC", muted: "#B3A390", line: "#322A20", primary: "#D9703C", onPrimary: "#160F09", accent: "#C9A45C" },
    radius: 4,
  },
  {
    slug: "fuoco-figli",
    name: "Fuoco & Figli",
    industry: "food",
    tier: "high",
    kind: "Restaurant Group",
    city: "Fitzroy, Melbourne",
    family: "Giornale",
    positioning: "Three venues, one family. The site routes each guest to the right room — and sells the private dining that pays the rent.",
    conversion: "Book a venue · enquire about an event",
    pages: [
      { id: "home", label: "Home" },
      { id: "venues", label: "Venues", tier: "scale" },
      { id: "events", label: "Private events", tier: "mid" },
      { id: "careers", label: "Careers", tier: "high" },
    ],
    modules: ["SiteHeader", "HeroEditorial", "VenueSwitcher", "MenuBoard", "MultiStepIntake", "EventCalendar", "CareersBoard", "NewsletterSignup", "SiteFooter"],
    signature: ["Venue switcher that re-themes menu, hours and photography", "Three-step private-event intake with live capacity matching", "Broadsheet layout — masthead, columns, folio numbers"],
    voice: { display: font.playfair, body: font.manrope, label: "Playfair Display · Manrope" },
    mode: "light",
    light: { bg: "#F3EEE4", surface: "#FBF8F2", ink: "#1C1A17", muted: "#5F584D", line: "#D5CCBB", primary: "#7A1E1E", onPrimary: "#FFF7F2", accent: "#5D5D1F" },
    dark: { bg: "#161412", surface: "#201D19", ink: "#F0EADF", muted: "#B0A796", line: "#3A352D", primary: "#D2574E", onPrimary: "#161412", accent: "#B7B76A" },
    radius: 0,
  },
  {
    slug: "maison-ember",
    name: "Maison Ember",
    industry: "food",
    tier: "premium",
    kind: "Dining Destination & Ordering",
    city: "Vesterbro, Copenhagen",
    family: "Nocturne",
    positioning: "Twelve seats, one fire. A destination restaurant that also sells a weekend box, gift evenings and a members' circle.",
    conversion: "Reserve · order the Ember box · join the Circle",
    pages: [
      { id: "home", label: "Home" },
      { id: "menu", label: "The menu", tier: "mid" },
      { id: "reserve", label: "Reserve", tier: "mid" },
      { id: "order", label: "Ember at home", tier: "scale" },
      { id: "circle", label: "The Circle", tier: "premium" },
    ],
    modules: ["ScrollNarrative", "CursorContextLayer", "MenuBoard", "LiveAvailability", "ReservationFlow", "OrderFlow", "GiftConfigurator", "MembershipSignup", "StickyCtaBar"],
    signature: ["Scroll-told evening: four chapters with pinned imagery", "Live seat availability across a 21-day calendar", "Weekend box ordering with cart, slots and pickup", "Ember cursor light that follows the guest (motion-safe)"],
    voice: { display: font.cormorant, body: font.inter, label: "Cormorant Garamond · Inter" },
    mode: "dark",
    light: { bg: "#F5EFE6", surface: "#FFFFFF", ink: "#1A1410", muted: "#6B5D50", line: "#DED2C2", primary: "#9A4A12", onPrimary: "#FFF8F0", accent: "#80601C" },
    dark: { bg: "#0F0D0B", surface: "#191512", ink: "#F2EAD9", muted: "#AFA390", line: "#2E2620", primary: "#E08A3A", onPrimary: "#140D07", accent: "#C9A45C" },
    radius: 2,
  },

  /* ── HEALTHCARE & WELLNESS ───────────────────────────────────── */
  {
    slug: "willow-pediatric",
    name: "Willow Pediatric Dentistry",
    industry: "health",
    tier: "low",
    kind: "Clinic Essentials",
    city: "Clifton, Bristol",
    family: "Playroom",
    positioning: "One dentist, one calm room. The site reassures a nervous parent and gets the first visit on the phone.",
    conversion: "Call to book a first visit",
    pages: [{ id: "home", label: "Home" }],
    modules: ["SiteHeader", "HeroEditorial", "ProcessTimeline", "ServiceCardGrid", "TeamProfiles", "LocationCard", "CallNowPanel", "SiteFooter"],
    signature: ["Illustrated first-visit story in three steps", "Plain-price service list with NHS / private split", "Chunky, touch-first controls sized for one-handed parents"],
    voice: { display: font.bricolage, body: font.dmSans, label: "Bricolage Grotesque · DM Sans" },
    mode: "light",
    light: { bg: "#FBF6EE", surface: "#FFFFFF", ink: "#1F3A34", muted: "#4E655F", line: "#E3D9C8", primary: "#1C6B5F", onPrimary: "#FFFFFF", accent: "#B7791F" },
    dark: { bg: "#10201C", surface: "#172B26", ink: "#F3EEE4", muted: "#A8BDB6", line: "#2A413B", primary: "#5FC1AE", onPrimary: "#0C1A17", accent: "#F2C14E" },
    radius: 18,
  },
  {
    slug: "kalm-physio",
    name: "Kalm Physiotherapy",
    industry: "health",
    tier: "mid",
    kind: "Clinic Booking",
    city: "Portobello, Dublin",
    family: "Swiss Calm",
    positioning: "A three-physio practice that books itself. Pick the problem, the person and the time — no phone tag.",
    conversion: "Book an assessment online",
    pages: [
      { id: "home", label: "Home" },
      { id: "treatments", label: "Treatments", tier: "mid" },
      { id: "book", label: "Book", tier: "mid" },
    ],
    modules: ["SiteHeader", "HeroEditorial", "InteractiveServiceFinder", "ServiceDetail", "PricingTable", "BookingCalendar", "TeamProfiles", "FAQAccordion", "StickyCtaBar"],
    signature: ["'Where does it hurt?' body map that suggests the right appointment", "Practitioner-aware booking with real slot gaps", "Price and duration on every treatment, no surprises"],
    voice: { display: font.outfit, body: font.inter, label: "Outfit · Inter" },
    mode: "light",
    light: { bg: "#F1F4F1", surface: "#FFFFFF", ink: "#15201B", muted: "#4F5F57", line: "#D5DED8", primary: "#2F5D50", onPrimary: "#FFFFFF", accent: "#C2563A" },
    dark: { bg: "#0E1613", surface: "#15201C", ink: "#E9F0EC", muted: "#9DB0A7", line: "#26342E", primary: "#7BC2A8", onPrimary: "#0B1411", accent: "#F0937A" },
    radius: 12,
  },
  {
    slug: "northfield-clinic",
    name: "Northfield Specialist Clinic",
    industry: "health",
    tier: "high",
    kind: "Multi-Specialist Clinic",
    city: "Manchester · Leeds · Sheffield",
    family: "Institutional Grid",
    positioning: "Fourteen specialties, forty consultants, three sites. The site turns a symptom into the right specialist in under a minute.",
    conversion: "Request a consultation",
    pages: [
      { id: "home", label: "Home" },
      { id: "find", label: "Find a specialist", tier: "mid" },
      { id: "consultants", label: "Consultants", tier: "scale" },
      { id: "locations", label: "Locations", tier: "high" },
      { id: "resources", label: "Patient guides", tier: "high" },
    ],
    modules: ["SiteHeader", "Breadcrumb", "InteractiveServiceFinder", "ConsultantDirectory", "MultiLocationMap", "ResourceLibrary", "MultiStepIntake", "CredentialWall", "SiteFooter"],
    signature: ["Symptom-to-specialty finder with plain-English matches", "Consultant directory filtered by specialty, site, language and wait", "Numbered institutional grid with visible structure"],
    voice: { display: font.archivo, body: font.inter, label: "Archivo · Inter" },
    mode: "light",
    light: { bg: "#FFFFFF", surface: "#F2F5F9", ink: "#0D1B2A", muted: "#4A5A6C", line: "#D9E0E8", primary: "#12355B", onPrimary: "#FFFFFF", accent: "#1E7F74" },
    dark: { bg: "#0A121C", surface: "#111C29", ink: "#E6EDF5", muted: "#98A8BA", line: "#22324A", primary: "#7FB2EE", onPrimary: "#08111C", accent: "#4CC3B4" },
    radius: 4,
  },
  {
    slug: "halden-health",
    name: "Halden Health",
    industry: "health",
    tier: "premium",
    kind: "Patient Portal & Care Network",
    city: "Rotterdam · Utrecht · The Hague",
    family: "Aurora Care",
    positioning: "A care network where the website is the front door: triage, telehealth, coverage and the patient's own record in one place.",
    conversion: "Start a care request · sign in",
    pages: [
      { id: "home", label: "Home" },
      { id: "care", label: "Get care now", tier: "mid" },
      { id: "telehealth", label: "Video visit", tier: "mid" },
      { id: "coverage", label: "Coverage", tier: "scale" },
      { id: "portal", label: "My Halden", tier: "premium" },
    ],
    modules: ["HeroCinematic", "ConditionalTriage", "TelehealthBooking", "CoverageChecker", "PatientPortal", "MultilingualContentLayer", "SafetyCompliancePanel", "AppointmentReminderSetup"],
    signature: ["Conditional triage that routes to video, clinic or emergency guidance", "Patient portal preview: results, messages, refills", "Full English ⇄ Español switch across every string", "Slow aurora field that stills for reduced motion"],
    voice: { display: font.newsreader, body: font.manrope, label: "Newsreader · Manrope" },
    mode: "light",
    light: { bg: "#F6F5F2", surface: "#FFFFFF", ink: "#18212B", muted: "#525C68", line: "#E0DDD6", primary: "#3B3F8F", onPrimary: "#FFFFFF", accent: "#B4582C" },
    dark: { bg: "#0D1018", surface: "#151A26", ink: "#ECEEF4", muted: "#A0A7B8", line: "#262C3C", primary: "#9EA4FF", onPrimary: "#0D1018", accent: "#F0A57C" },
    radius: 16,
  },

  /* ── LEGAL ───────────────────────────────────────────────────── */
  {
    slug: "iris-calder",
    name: "Iris Calder Employment Law",
    industry: "legal",
    tier: "low",
    kind: "Solo Lawyer Site",
    city: "Leeds",
    family: "Letterhead",
    positioning: "One employment lawyer for employees. Calm, plain answers and a fixed first fee — set like a letter, not an advert.",
    conversion: "Book a 30-minute first call",
    pages: [{ id: "home", label: "Home" }],
    modules: ["SiteHeader", "HeroEditorial", "PracticeCards", "FeeTransparencyPanel", "CredentialStrip", "FAQAccordion", "ContactForm", "SiteFooter"],
    signature: ["Letter-format hero with margin notes", "Fixed-fee table that says who usually pays", "Contact form with honest response-time promise"],
    voice: { display: font.instrument, body: font.dmSans, label: "Instrument Serif · DM Sans" },
    mode: "light",
    light: { bg: "#FAF8F3", surface: "#FFFFFF", ink: "#1B1B1B", muted: "#55524C", line: "#E2DDD2", primary: "#1E3A5F", onPrimary: "#FFFFFF", accent: "#A63D24" },
    dark: { bg: "#121416", surface: "#1A1D20", ink: "#EEEBE4", muted: "#A9A59D", line: "#2E3236", primary: "#8DB1DD", onPrimary: "#0E1215", accent: "#E57C5E" },
    radius: 0,
  },
  {
    slug: "harrow-finch",
    name: "Harrow & Finch",
    industry: "legal",
    tier: "mid",
    kind: "Law Firm Growth",
    city: "Bath & Bristol",
    family: "Chambers",
    positioning: "A six-solicitor family law practice. The site lowers the temperature and turns a hard week into a booked consultation.",
    conversion: "Request a free 20-minute case review",
    pages: [
      { id: "home", label: "Home" },
      { id: "services", label: "How we help", tier: "mid" },
      { id: "team", label: "Solicitors", tier: "mid" },
      { id: "review", label: "Case review", tier: "mid" },
    ],
    modules: ["SiteHeader", "HeroEditorial", "ServiceCardGrid", "ProcessTimeline", "ResultsList", "TeamProfiles", "MultiStepIntake", "ReviewCarousel", "SiteFooter"],
    signature: ["Case-review intake with conflict-check and safety exit", "Engraved section rules and oxblood ledger", "Fee guide per matter, written in plain English"],
    voice: { display: font.dmSerif, body: font.inter, label: "DM Serif Display · Inter" },
    mode: "light",
    light: { bg: "#F5EFE6", surface: "#FFFDF9", ink: "#2A1A1A", muted: "#634F4C", line: "#E0D3C3", primary: "#6E1423", onPrimary: "#FFF5F2", accent: "#8A6627" },
    dark: { bg: "#160F0F", surface: "#201717", ink: "#F3E8DE", muted: "#B49E98", line: "#3A2A2A", primary: "#D06A79", onPrimary: "#160F0F", accent: "#D1AE6A" },
    radius: 4,
  },
  {
    slug: "albright-kerr",
    name: "Albright Kerr",
    industry: "legal",
    tier: "high",
    kind: "Full-Service Firm",
    city: "London · Edinburgh · Dublin",
    family: "Architectural",
    positioning: "A 120-lawyer commercial firm. The site is an index — practices, people, insight and offices, all findable in two moves.",
    conversion: "Contact a partner",
    pages: [
      { id: "home", label: "Home" },
      { id: "expertise", label: "Expertise", tier: "mid" },
      { id: "people", label: "People", tier: "scale" },
      { id: "insights", label: "Insights", tier: "high" },
      { id: "offices", label: "Offices", tier: "high" },
    ],
    modules: ["SiteHeader", "HeroEditorial", "SolutionTabs", "PeopleSearch", "InsightsIndex", "MultiLocationCard", "PressLogoStrip", "CareersBoard", "SiteFooter"],
    signature: ["Practice index filterable by sector, with live counts", "People search across name, practice and office", "Swiss index typography — numbers, rules, no decoration"],
    voice: { display: font.syne, body: font.inter, label: "Syne · Inter" },
    mode: "light",
    light: { bg: "#F4F4F2", surface: "#FFFFFF", ink: "#111111", muted: "#555553", line: "#D4D4D0", primary: "#111111", onPrimary: "#FFFFFF", accent: "#B93A0A" },
    dark: { bg: "#0E0E0E", surface: "#171717", ink: "#F2F2EF", muted: "#A3A3A0", line: "#2B2B2B", primary: "#F2F2EF", onPrimary: "#0E0E0E", accent: "#FF7A45" },
    radius: 0,
  },
  {
    slug: "meridian-legal",
    name: "Meridian Legal",
    industry: "legal",
    tier: "premium",
    kind: "Legal Intake & Client Portal",
    city: "Amsterdam · Lisbon",
    family: "Midnight Brass",
    positioning: "Immigration and relocation law for founders and their teams. Intake, secure documents and case status — all online.",
    conversion: "Start an assessment · client sign-in",
    pages: [
      { id: "home", label: "Home" },
      { id: "assess", label: "Eligibility check", tier: "mid" },
      { id: "upload", label: "Secure upload", tier: "premium" },
      { id: "status", label: "Case status", tier: "premium" },
      { id: "fees", label: "Fees", tier: "scale" },
    ],
    modules: ["HeroCinematic", "ConditionalIntake", "SecureDocumentUpload", "CaseStatusTimeline", "FeeConfigurator", "ScrollProgressBar", "MagneticCta", "SafetyCompliancePanel"],
    signature: ["Branching eligibility check with route-specific next steps", "Drag-and-drop secure upload with per-document checklist", "Live case timeline with what happens next", "Brass meridian line that tracks scroll"],
    voice: { display: font.fraunces, body: font.manrope, label: "Fraunces · Manrope" },
    mode: "dark",
    light: { bg: "#F4F2EC", surface: "#FFFFFF", ink: "#121626", muted: "#565B6B", line: "#DDD9CE", primary: "#1B2550", onPrimary: "#FFFFFF", accent: "#8A6A22" },
    dark: { bg: "#0A0E1C", surface: "#11172A", ink: "#E9ECF5", muted: "#9AA2BA", line: "#232B45", primary: "#D2B272", onPrimary: "#0A0E1C", accent: "#8EA6FF" },
    radius: 10,
  },

  /* ── HOME SERVICES ──────────────────────────────────────────── */
  {
    slug: "kettle-plumbing",
    name: "Kettle & Co Plumbing",
    industry: "home",
    tier: "low",
    kind: "Local Service One-Page",
    city: "Headingley, Leeds",
    family: "Workwear",
    positioning: "Two vans, one phone number. Leaks, boilers and bathrooms in north Leeds — the phone number is the website.",
    conversion: "Call now",
    pages: [{ id: "home", label: "Home" }],
    modules: ["AnnouncementBar", "CallNowPanel", "ServiceCardGrid", "ServiceAreaMap", "PricingTable", "ReviewCarousel", "SiteFooter"],
    signature: ["Phone number as the hero — huge, tappable, always visible", "Postcode coverage list for LS1 – LS17", "Call-out price guide printed like a job sheet"],
    voice: { display: font.archivoBlack, body: font.archivo, label: "Archivo Black · Archivo" },
    mode: "light",
    light: { bg: "#FFFCF2", surface: "#FFFFFF", ink: "#111111", muted: "#4A4A45", line: "#1A1A1A", primary: "#111111", onPrimary: "#FFD23F", accent: "#E8B400" },
    dark: { bg: "#111111", surface: "#1B1B1B", ink: "#FFFCF2", muted: "#B5B2A8", line: "#3A3A3A", primary: "#FFD23F", onPrimary: "#111111", accent: "#FFD23F" },
    radius: 0,
  },
  {
    slug: "clearpane",
    name: "Clearpane",
    industry: "home",
    tier: "mid",
    kind: "Quote-First Service",
    city: "Brighton & Hove",
    family: "Fresh Glass",
    positioning: "Window and gutter cleaning, priced in ten seconds. An instant quote replaces the 'we'll pop round and have a look'.",
    conversion: "Get an instant quote",
    pages: [
      { id: "home", label: "Home" },
      { id: "quote", label: "Instant quote", tier: "mid" },
      { id: "plans", label: "Plans", tier: "mid" },
    ],
    modules: ["SiteHeader", "HeroEditorial", "QuoteCalculator", "PricingTable", "ServiceAreaCheck", "ProcessTimeline", "ReviewCarousel", "FAQAccordion", "StickyCtaBar"],
    signature: ["Instant quote from house type, storeys and extras", "Round schedule shown as a real calendar", "Glass-streak motif and sky gradients"],
    voice: { display: font.bricolage, body: font.dmSans, label: "Bricolage Grotesque · DM Sans" },
    mode: "light",
    light: { bg: "#F2F7FB", surface: "#FFFFFF", ink: "#0E2233", muted: "#475D70", line: "#D6E3EE", primary: "#1757C2", onPrimary: "#FFFFFF", accent: "#0E7C66" },
    dark: { bg: "#0A1622", surface: "#10202F", ink: "#E7F1FA", muted: "#9BB2C6", line: "#1F3447", primary: "#6FA8FF", onPrimary: "#071321", accent: "#4FD1B0" },
    radius: 14,
  },
  {
    slug: "brickwell",
    name: "Brickwell Home Services",
    industry: "home",
    tier: "high",
    kind: "Multi-Service Company",
    city: "Greater Manchester",
    family: "Terracotta Works",
    positioning: "Forty engineers across heating, electrics, plumbing and roofing. The site proves scale and routes each job to the right trade.",
    conversion: "Book an engineer · request a survey",
    pages: [
      { id: "home", label: "Home" },
      { id: "services", label: "Services", tier: "mid" },
      { id: "areas", label: "Areas we cover", tier: "scale" },
      { id: "projects", label: "Projects", tier: "high" },
      { id: "book", label: "Book", tier: "mid" },
    ],
    modules: ["SiteHeader", "HeroEditorial", "ServiceCardGrid", "PostcodeChecker", "BeforeAfterSlider", "CaseStudyGrid", "MultiStepIntake", "CredentialWall", "GuaranteePanel", "SiteFooter"],
    signature: ["Postcode checker that returns depot, trades and next slot", "Before / after slider on real project stories", "Four-trade hub with guarantees per trade"],
    voice: { display: font.outfit, body: font.manrope, label: "Outfit · Manrope" },
    mode: "light",
    light: { bg: "#F7F1EA", surface: "#FFFFFF", ink: "#231A15", muted: "#5D4E44", line: "#E3D6C7", primary: "#A8441F", onPrimary: "#FFFFFF", accent: "#2F5443" },
    dark: { bg: "#18120E", surface: "#221A15", ink: "#F5EBE1", muted: "#B9A595", line: "#3A2D24", primary: "#E8784C", onPrimary: "#18120E", accent: "#7FB59A" },
    radius: 10,
  },
  {
    slug: "volt-field",
    name: "Volt Field Services",
    industry: "home",
    tier: "premium",
    kind: "Field-Service Operations Site",
    city: "Greater London",
    family: "Ops Console",
    positioning: "Electrical and EV-charger installs with live engineer tracking. The website is the dispatch desk — book, track, manage.",
    conversion: "Book a slot · track an engineer",
    pages: [
      { id: "home", label: "Home" },
      { id: "book", label: "Live booking", tier: "scale" },
      { id: "emergency", label: "Emergency" },
      { id: "track", label: "Track job", tier: "premium" },
      { id: "care", label: "Volt Care", tier: "premium" },
    ],
    modules: ["HeroCinematic", "LiveAvailability", "EmergencyFlow", "JobTracker", "EVChargerConfigurator", "MembershipSignup", "AccountTeaser", "CareersBoard"],
    signature: ["Live slot board with engineer, van and ETA", "Emergency mode that re-prioritises the whole page", "EV charger configurator with install estimate", "Job tracker with real-time route progress"],
    voice: { display: font.space, body: font.inter, label: "Space Grotesk · Inter" },
    mode: "dark",
    light: { bg: "#F3F4F2", surface: "#FFFFFF", ink: "#0C0F12", muted: "#4E555C", line: "#D8DBD8", primary: "#C2410C", onPrimary: "#FFFFFF", accent: "#047857" },
    dark: { bg: "#0B0E11", surface: "#12171C", ink: "#E8EDF1", muted: "#9AA5AF", line: "#222A31", primary: "#FF7A2E", onPrimary: "#0B0E11", accent: "#5EEAB8" },
    radius: 6,
  },

  /* ── PROPERTY & REAL ESTATE ─────────────────────────────────── */
  {
    slug: "harbour-keys",
    name: "Harbour Keys Lettings",
    industry: "property",
    tier: "low",
    kind: "Letting Agent One-Page",
    city: "Poole, Dorset",
    family: "Ledger & Key",
    positioning: "One letting agent, one patch. The site answers three questions fast: what's available, what it costs, when can I view — then it hands over the phone.",
    conversion: "Call to book a viewing",
    pages: [{ id: "home", label: "Home" }],
    modules: ["AnnouncementBar", "HeroLocal", "ListingGrid", "FeeTransparencyPanel", "ServiceAreaList", "ReviewCarousel", "OpenNowBadge", "CallNowPanel", "LocationCard", "SiteFooter"],
    signature: ["Letting fee table printed like a tide ledger — no percentage games", "Live 'viewings today' status from real office hours", "Harbour-chart map with the three streets that matter"],
    voice: { display: font.instrument, body: font.dmSans, label: "Instrument Serif · DM Sans" },
    mode: "light",
    light: { bg: "#F5F2EA", surface: "#FDFBF5", ink: "#17242A", muted: "#5C6E74", line: "#D9E0DA", primary: "#0F4C46", onPrimary: "#F2FBF8", accent: "#B4761B" },
    dark: { bg: "#0D1618", surface: "#142125", ink: "#EAF2EE", muted: "#9FB2B0", line: "#24343A", primary: "#63C1A8", onPrimary: "#081210", accent: "#E2B25C" },
    radius: 4,
  },
  {
    slug: "rowan-vale",
    name: "Rowan & Vale",
    industry: "property",
    tier: "mid",
    kind: "Independent Estate Agency",
    city: "Chorlton, Manchester",
    family: "Street Ledger",
    positioning: "A two-office independent agency. The site searches its own listings, prices a valuation instantly and books the viewing — no portal required.",
    conversion: "Book a viewing · get an instant valuation",
    pages: [
      { id: "home", label: "Home" },
      { id: "listings", label: "Listings", tier: "mid" },
      { id: "viewing", label: "Book a viewing", tier: "mid" },
      { id: "sell", label: "Sell or let", tier: "mid" },
    ],
    modules: ["SiteHeader", "HeroSplit", "ListingGrid", "ListingCard", "ViewingBooking", "ValuationRequest", "AgentProfile", "ProcessTimeline", "ResultsStatStrip", "FAQAccordion", "StickyCtaBar"],
    signature: ["Listing search by beds, budget and type with live counts", "Viewing booking tied to a real property, slot and negotiator", "Instant valuation from postcode, beds and condition"],
    voice: { display: font.dmSerif, body: font.inter, label: "DM Serif Display · Inter" },
    mode: "light",
    light: { bg: "#F4F1EA", surface: "#FFFFFF", ink: "#201B14", muted: "#5D564A", line: "#DFD8C8", primary: "#5C4A1E", onPrimary: "#FFFDF4", accent: "#8A3A24" },
    dark: { bg: "#131109", surface: "#1C1812", ink: "#F2ECDD", muted: "#ADA288", line: "#332D20", primary: "#D9B95C", onPrimary: "#141006", accent: "#E08A5E" },
    radius: 2,
  },
  {
    slug: "crestline-estates",
    name: "Crestline Estates",
    industry: "property",
    tier: "high",
    kind: "Multi-Branch Agency",
    city: "Rochdale · Bolton · Bury",
    family: "Civic Bronze",
    positioning: "Twelve branches, ninety negotiators, one ledger of proof. The site routes each instruction to the right branch and puts sold-proof behind every claim.",
    conversion: "Book a valuation · browse by branch",
    pages: [
      { id: "home", label: "Home" },
      { id: "buy", label: "Buy", tier: "mid" },
      { id: "sell", label: "Sell", tier: "mid" },
      { id: "areas", label: "Area guides", tier: "scale" },
      { id: "agents", label: "Agents", tier: "high" },
    ],
    modules: ["SiteHeader", "HeroEditorial", "ListingGrid", "MapSearch", "NeighborhoodGuide", "AgentProfile", "MortgageCalculator", "MultiStepIntake", "CredentialWall", "MultiLocationCard", "ResultsStatStrip", "SiteFooter"],
    signature: ["Branch-aware listing index with sold-price proof", "Area guides with school, rail and sold-price data per postcode", "Mortgage calculator with deposit, term and rate sliders"],
    voice: { display: font.outfit, body: font.manrope, label: "Outfit · Manrope" },
    mode: "light",
    light: { bg: "#F4F0E6", surface: "#FFFFFF", ink: "#1E1B15", muted: "#595244", line: "#DCD3C0", primary: "#7A5A22", onPrimary: "#FFFDF6", accent: "#3E5C50" },
    dark: { bg: "#12100A", surface: "#1A1710", ink: "#F0E9D8", muted: "#A99F87", line: "#312B1E", primary: "#D9B36A", onPrimary: "#131006", accent: "#8FBFA8" },
    radius: 6,
  },
  {
    slug: "northbank-residences",
    name: "Northbank Residences",
    industry: "property",
    tier: "premium",
    kind: "Development Sales & Portal",
    city: "South Bank, Leeds",
    family: "Waterline",
    positioning: "One development, 118 residences, a sales suite that never sleeps. Plot availability, mortgage maths, brochures and an applicant portal — all live.",
    conversion: "Register interest · reserve a residence",
    pages: [
      { id: "home", label: "Home" },
      { id: "residences", label: "The collection", tier: "scale" },
      { id: "purchase", label: "Purchase", tier: "mid" },
      { id: "portal", label: "Applicant portal", tier: "premium" },
      { id: "progress", label: "Build progress", tier: "high" },
    ],
    modules: ["HeroCinematic", "LiveAvailability", "FloorplanViewer", "MortgageCalculator", "DocumentRequest", "CaseStatusTimeline", "ResourceLibrary", "ScrollProgressBar", "MembershipSignup"],
    signature: ["Live plot board — 118 residences, availability per floor", "Floorplan viewer with aspect, aspect ratio and storage overlays", "Mortgage calculator with Help-to-Buy equity modelling", "Applicant portal: reservation, exchange and completion states"],
    voice: { display: font.fraunces, body: font.manrope, label: "Fraunces · Manrope" },
    mode: "dark",
    light: { bg: "#F1F0EC", surface: "#FFFFFF", ink: "#10171C", muted: "#4E5D66", line: "#D7DCDF", primary: "#153D42", onPrimary: "#EFFCF8", accent: "#9C6B18" },
    dark: { bg: "#0A1014", surface: "#101820", ink: "#E8EFF1", muted: "#93A6AF", line: "#1E2E38", primary: "#6FD0C0", onPrimary: "#06100D", accent: "#D9AE5E" },
    radius: 8,
  },
  /* ── FACTORY — module-built (Template Factory merge) ─────────── */
  {
    slug: "nightflow",
    name: "Nightflow 24/7 Plumbing",
    industry: "home",
    tier: "premium",
    kind: "24/7 Emergency Plumbing",
    city: "Düsseldorf",
    family: "Night Desk · Factory Kit",
    positioning: "A 24/7 emergency plumbing dispatch in Düsseldorf, composed live from the factory module kit: urgent hero, 60-second triage, postcode coverage, booking, financing, job portal — and analytics that stay consent-gated.",
    conversion: "Emergency call now · 41 min arrival",
    pages: [
      { id: "home", label: "Home" },
      { id: "services", label: "Services" },
      { id: "coverage", label: "Coverage" },
      { id: "reviews", label: "Reviews" },
      { id: "call", label: "Contact" },
      { id: "faq", label: "FAQ" },
      { id: "blog", label: "Knowledge base", tier: "mid" },
      { id: "booking", label: "Booking", tier: "high" },
    ],
    modules: [
      "SiteHeader", "MobileNav", "SiteFooter", "StickyActionBar", "AnnouncementBar", "Breadcrumb", "SkipToContent", "CookieConsent", "ErrorBoundary", "FormField", "InlineValidation", "SuccessState",
      "HeroUrgent", "OpenNowBadge", "CallNowPanel", "ServiceCardGrid", "GoogleMapEmbed", "ReviewCarousel", "FAQAccordion", "ContactForm",
      "ThemeToggle", "BackToTop", "EmergencyTriage", "PostcodeChecker", "ServiceAreaMap", "QuoteRequestForm", "BeforeAfterSlider", "TrustBar", "WhatsAppButton", "BlogIndex", "NewsletterSignup",
      "LanguageSwitcher", "MegaMenu", "BookingCalendar", "JobDispatchTeaser", "FinancingCalculator", "CredentialWall", "GuaranteePanel", "TeamGrid", "NeighborhoodPages", "CaseStudyCard", "CallbackRequest", "StructuredDataBlock",
      "ProjectStatusPortal", "AiConcierge", "3DHeroObject", "AnimatedCounter", "HeroCinematic", "LiveChatLauncher", "ResultsStatStrip",
    ],
    signature: [
      "60-second emergency triage that routes call-now vs. cheaper daytime slot honestly",
      "Consent-gated analytics — the event stream stays blocked until the visitor opts in",
      "AI concierge grounded on the real price list via the OS concierge API",
      "Four-rung module ladder: base site → portal, cinematic hero and 3D pipe cutaway",
    ],
    voice: { display: font.space, body: font.inter, label: "Space Grotesk · Inter" },
    mode: "light",
    light: { bg: "#FAFAF9", surface: "#FFFFFF", ink: "#1C1917", muted: "#57534E", line: "#E7E5E4", primary: "#D97706", onPrimary: "#FFFBEB", accent: "#B45309" },
    dark: { bg: "#0C0A09", surface: "#1C1917", ink: "#FAFAF9", muted: "#A8A29E", line: "#292524", primary: "#FBBF24", onPrimary: "#1C1917", accent: "#F59E0B" },
    radius: 12,
    kit: true,
  },
  {
    slug: "thermonorth",
    name: "ThermoNorth Heating & Cooling",
    industry: "home",
    tier: "premium",
    kind: "HVAC & Heat Pumps",
    city: "Hamburg",
    family: "Warm Rooms · Factory Kit",
    positioning: "A Meisterbetrieb HVAC company in Hamburg, composed from the same factory kit. Comfort engineering with honest numbers: sizing calculators, comparison tables, a live configurator and an AI comfort advisor.",
    conversion: "Book the free 90-minute survey",
    pages: [
      { id: "home", label: "Home" },
      { id: "services", label: "Systems" },
      { id: "calculator", label: "Calculator", tier: "mid" },
      { id: "coverage", label: "Coverage" },
      { id: "reviews", label: "Reviews" },
      { id: "membership", label: "Care plans", tier: "high" },
      { id: "booking", label: "Booking", tier: "high" },
      { id: "contact", label: "Contact" },
      { id: "faq", label: "FAQ" },
    ],
    modules: [
      "SiteHeader", "MobileNav", "SiteFooter", "StickyActionBar", "AnnouncementBar", "Breadcrumb", "SkipToContent", "CookieConsent", "ErrorBoundary", "FormField", "InlineValidation", "SuccessState",
      "HeroLocal", "OpenNowBadge", "ServiceCardGrid", "CallNowPanel", "HoursTable", "GoogleReviewsEmbed", "FAQAccordion", "ContactForm",
      "ThemeToggle", "BackToTop", "HeroCampaign", "CostCalculator", "ProcessTimeline", "ReviewWall", "ServiceAreaMap", "NewsletterSignup", "PostcodeChecker",
      "LanguageSwitcher", "MegaMenu", "MembershipSignup", "BookingCalendar", "FinancingCalculator", "ComparisonTable", "TeamCredentials", "CaseStudyIndex", "QuoteCalculator", "StructuredDataBlock", "GuaranteePanel",
      "Configurator", "HeroVideo", "AiConcierge", "PersonalizedRecommendations", "ClientDashboard", "BeforeAfterTransition", "ResultsStatStrip",
    ],
    signature: [
      "Sizing calculator with a real calculation basis — surveys confirm it within ±5%",
      "Heat pump vs. gas vs. hybrid comparison with no technology religion",
      "Three-step configurator: fuel, capacity, add-ons — the estimate updates live",
      "AI comfort advisor grounded on services and the up-to-45% subsidy rules",
    ],
    voice: { display: font.fraunces, body: font.manrope, label: "Fraunces · Manrope" },
    mode: "light",
    light: { bg: "#FAF9F7", surface: "#FFFFFF", ink: "#1C1917", muted: "#57534E", line: "#E7E5E4", primary: "#EA580C", onPrimary: "#FFF7ED", accent: "#C2410C" },
    dark: { bg: "#0E0C0A", surface: "#1D1917", ink: "#FAF9F7", muted: "#A8A29E", line: "#2B2724", primary: "#F97316", onPrimary: "#1C1410", accent: "#FB923C" },
    radius: 12,
    kit: true,
  },
]

export const findTemplate = (slug: string | null | undefined) => TEMPLATES.find((t) => t.slug === slug)
export const industryOf = (id: IndustryId) => INDUSTRIES.find((i) => i.id === id)!
/** All templates in the same industry, ordered by tier. */
export const siblingsOf = (t: TemplateDef) => {
  const order = ["low", "mid", "scale", "high", "premium"] as const
  return TEMPLATES.filter((x) => x.industry === t.industry).sort((a, b) => order.indexOf(a.tier as "low") - order.indexOf(b.tier as "low"))
}
/** Same tier across every industry — the "ladder rail" used by the site view. */
export const tierPeers = (tier: TierId) => TEMPLATES.filter((x) => x.tier === tier)

/* ── tier morphing helpers ────────────────────────────────────────── */

/** pages visible at a tier-morph step — pages without an explicit tier are always visible */
export function pagesAt(t: TemplateDef, step: TierId): PageDef[] {
  const rank = TIER_ORDER.indexOf(step)
  return t.pages.filter((p) => !p.tier || TIER_ORDER.indexOf(p.tier) <= rank)
}

/** what a step adds over the previous one — readout for the morph ladder */
export function stepAdds(t: TemplateDef, step: TierId): string[] {
  return t.pages.filter((p) => p.tier === step).map((p) => p.label)
}
