import { font, type Mode, type Palette } from "./genome"
import type { TierId } from "./tiers"

/**
 * The template registry — one definition file per template, as the
 * Template OS spec requires. The shell reads ONLY this file; the site
 * components live in the renderer bundle and are loaded on demand.
 */

export type IndustryId = "food" | "health" | "legal" | "home"

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
]

export interface PageDef {
  id: string
  label: string
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
    modules: ["AnnouncementBar", "HeroEditorial", "MenuBoard", "OpenNowHours", "LocationCard", "CallNowPanel", "SiteFooter"],
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
      { id: "menu", label: "Omakase" },
      { id: "reserve", label: "Reserve" },
    ],
    modules: ["SiteHeader", "HeroEditorial", "MenuBoard (toggle)", "ReservationFlow", "SeatMap", "ReviewCarousel", "FAQAccordion", "StickyCtaBar"],
    signature: ["Four-step reservation with sitting-aware seat counts", "Vertical kanji rail and paper-grain sections", "Course-by-course omakase with sake pairing toggle"],
    voice: { display: font.instrument, body: font.inter, label: "Instrument Serif · Inter" },
    mode: "light",
    light: { bg: "#F5F2EC", surface: "#FFFFFF", ink: "#191919", muted: "#5E5A53", line: "#DDD7CC", primary: "#B7371A", onPrimary: "#FFFFFF", accent: "#3E5641" },
    dark: { bg: "#121212", surface: "#1B1A19", ink: "#EFEBE3", muted: "#A39E95", line: "#2F2D2A", primary: "#E0603F", onPrimary: "#121212", accent: "#8DAA8F" },
    radius: 2,
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
      { id: "venues", label: "Venues" },
      { id: "events", label: "Private events" },
      { id: "careers", label: "Careers" },
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
      { id: "menu", label: "The menu" },
      { id: "reserve", label: "Reserve" },
      { id: "order", label: "Ember at home" },
      { id: "circle", label: "The Circle" },
    ],
    modules: ["ScrollNarrative", "CursorContextLayer", "MenuBoard (pairing + dietary)", "LiveAvailability", "ReservationFlow (deposit)", "OrderFlow (cart)", "GiftConfigurator", "MembershipSignup", "StickyCtaBar"],
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
      { id: "treatments", label: "Treatments" },
      { id: "book", label: "Book" },
    ],
    modules: ["SiteHeader", "HeroEditorial", "BodyAreaFinder", "ServiceDetail", "PricingTable", "BookingCalendar", "TeamProfiles", "FAQAccordion", "StickyCtaBar"],
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
      { id: "find", label: "Find a specialist" },
      { id: "consultants", label: "Consultants" },
      { id: "locations", label: "Locations" },
      { id: "resources", label: "Patient guides" },
    ],
    modules: ["SiteHeader", "Breadcrumb", "InteractiveServiceFinder", "ConsultantDirectory (filters)", "MultiLocationMap", "ResourceLibrary", "MultiStepIntake", "CredentialWall", "SiteFooter"],
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
      { id: "care", label: "Get care now" },
      { id: "telehealth", label: "Video visit" },
      { id: "coverage", label: "Coverage" },
      { id: "portal", label: "My Halden" },
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
    modules: ["SiteHeader", "HeroEditorial", "PracticeCards", "FixedFeeTable", "CredentialStrip", "FAQAccordion", "ContactForm", "SiteFooter"],
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
      { id: "services", label: "How we help" },
      { id: "team", label: "Solicitors" },
      { id: "review", label: "Case review" },
    ],
    modules: ["SiteHeader", "HeroEditorial", "ServiceCardGrid", "ProcessTimeline", "ResultsList", "TeamProfiles", "IntakeForm (conflict notice)", "ReviewCarousel", "SiteFooter"],
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
      { id: "expertise", label: "Expertise" },
      { id: "people", label: "People" },
      { id: "insights", label: "Insights" },
      { id: "offices", label: "Offices" },
    ],
    modules: ["SiteHeader", "HeroEditorial", "PracticeIndex (filter)", "PeopleSearch", "InsightsIndex", "MultiLocationCard", "PressLogoStrip", "CareersBoard", "SiteFooter"],
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
      { id: "assess", label: "Eligibility check" },
      { id: "upload", label: "Secure upload" },
      { id: "status", label: "Case status" },
      { id: "fees", label: "Fees" },
    ],
    modules: ["HeroCinematic", "ConditionalIntake", "SecureDocumentExchange", "CaseStatusTimeline", "FeeConfigurator", "ScrollProgressMeridian", "MagneticCta", "SafetyCompliancePanel"],
    signature: ["Branching eligibility check with route-specific next steps", "Drag-and-drop secure upload with per-document checklist", "Live case timeline with what happens next", "Brass meridian line that tracks scroll"],
    voice: { display: font.fraunces, body: font.manrope, label: "Fraunces · Manrope" },
    mode: "dark",
    light: { bg: "#F4F2EC", surface: "#FFFFFF", ink: "#121626", muted: "#565B6B", line: "#DDD9CE", primary: "#1B2550", onPrimary: "#FFFFFF", accent: "#8A6A22" },
    dark: { bg: "#0A0E1C", surface: "#11172A", ink: "#E9ECF5", muted: "#9AA2BA", line: "#232B45", primary: "#D2B272", onPrimary: "#0A0E1C", accent: "#8EA6FF" },
    radius: 10,
  },

  /* ── HOME SERVICES ───────────────────────────────────────────── */
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
    modules: ["AnnouncementBar", "CallNowPanel", "ServiceList", "ServiceAreaList", "PriceGuide", "ReviewList", "SiteFooter"],
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
      { id: "quote", label: "Instant quote" },
      { id: "plans", label: "Plans" },
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
      { id: "services", label: "Services" },
      { id: "areas", label: "Areas we cover" },
      { id: "projects", label: "Projects" },
      { id: "book", label: "Book" },
    ],
    modules: ["SiteHeader", "HeroEditorial", "ServiceHub", "PostcodeChecker", "BeforeAfterSlider", "CaseStudyGrid", "MultiStepIntake", "CredentialWall", "GuaranteePanel", "SiteFooter"],
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
      { id: "book", label: "Live booking" },
      { id: "emergency", label: "Emergency" },
      { id: "track", label: "Track job" },
      { id: "care", label: "Volt Care" },
    ],
    modules: ["HeroCinematic", "LiveAvailability", "EmergencyFlow", "JobTracker", "EVChargerConfigurator", "MembershipSignup", "AccountTeaser", "CareersBoard"],
    signature: ["Live slot board with engineer, van and ETA", "Emergency mode that re-prioritises the whole page", "EV charger configurator with install estimate", "Job tracker with real-time route progress"],
    voice: { display: font.space, body: font.inter, label: "Space Grotesk · Inter" },
    mode: "dark",
    light: { bg: "#F3F4F2", surface: "#FFFFFF", ink: "#0C0F12", muted: "#4E555C", line: "#D8DBD8", primary: "#C2410C", onPrimary: "#FFFFFF", accent: "#047857" },
    dark: { bg: "#0B0E11", surface: "#12171C", ink: "#E8EDF1", muted: "#9AA5AF", line: "#222A31", primary: "#FF7A2E", onPrimary: "#0B0E11", accent: "#5EEAB8" },
    radius: 6,
  },
]

export const findTemplate = (slug: string | null | undefined) => TEMPLATES.find((t) => t.slug === slug)
export const industryOf = (id: IndustryId) => INDUSTRIES.find((i) => i.id === id)!
export const siblingsOf = (t: TemplateDef) => TEMPLATES.filter((x) => x.industry === t.industry)
