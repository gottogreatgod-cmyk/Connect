import { useState, type ReactNode } from "react"
import "./ember-oak.css"
import tavern from "@/sites/assets/img/tavern.jpg"
import diningroom from "@/sites/assets/img/dining-room.jpg"
import steak from "@/sites/assets/img/steak.jpg"
import plated from "@/sites/assets/img/plated-dish.jpg"
import plate from "@/sites/assets/img/plate.jpg"
import counter from "@/sites/assets/img/cafe-counter.jpg"
import still from "@/sites/assets/img/studio-still.jpg"
import nordic from "@/sites/assets/img/nordic.jpg"
import { type Rule, Reveal, longDate, openState, ref, rules, TierBelow, TierGate, useForm, useSite } from "@/sites/kit/site-kit"

/**
 * EMBER & OAK — Mid · Growth · Wood-Fire Grill & Reservations
 * Warm Hearth: charcoal surfaces, ember-orange primary, big serif headlines,
 * hairline rules and small-caps mono prices. One job: fill the room.
 */

const PHONE = "(212) 555-0184"
const PHONE_HREF = "tel:+12125550184"
const EMAIL = "hello@emberandoak.com"
const RESERVE_EMAIL = "reserve@emberandoak.com"
const ADDRESS_LINE_1 = "287 Bruckner Boulevard"
const ADDRESS_LINE_2 = "Bronx, NY 10454"
const MAP_URL = "https://www.google.com/maps/search/?api=1&query=287+Bruckner+Blvd+Bronx+NY+10454"
const INSTAGRAM = "https://instagram.com/emberandoak"
const FACEBOOK = "https://facebook.com/emberandoak"

/** openState input, hours[day 0=Sun..6=Sat] in decimal hours */
const HOURS: ([number, number] | null)[] = [
  [16, 21], null, [17, 22], [17, 22], [17, 22], [17, 23], [16, 23],
]
const DISPLAY_HOURS: { d: number; day: string; open: string; close: string }[] = [
  { d: 2, day: "Tuesday", open: "5:00 PM", close: "10:00 PM" },
  { d: 3, day: "Wednesday", open: "5:00 PM", close: "10:00 PM" },
  { d: 4, day: "Thursday", open: "5:00 PM", close: "10:00 PM" },
  { d: 5, day: "Friday", open: "5:00 PM", close: "11:00 PM" },
  { d: 6, day: "Saturday", open: "4:00 PM", close: "11:00 PM" },
  { d: 0, day: "Sunday", open: "4:00 PM", close: "9:00 PM" },
  { d: 1, day: "Monday", open: "Closed", close: "" },
]

const PAGES: [string, string][] = [
  ["home", "Home"],
  ["menu", "Menu"],
  ["reservations", "Reservations"],
  ["private-dining", "Private Dining"],
  ["contact", "Contact"],
]

/* ── Ember & Oak menu content ─────── */

type MenuItem = { name: string; description: string; price: string; tags?: string[] }
type MenuCategory = { name: string; subtitle: string; items: MenuItem[] }

const MENU: MenuCategory[] = [
  {
    name: "Small Plates",
    subtitle: "To share or keep to yourself",
    items: [
      { name: "Wood-Roasted Oysters", description: "Half-dozen Long Island oysters roasted over oak with garlic butter and chili.", price: "$18", tags: ["raw bar"] },
      { name: "Ember Beets", description: "Roasted golden and red beets, whipped goat cheese, honey, toasted hazelnuts.", price: "$14", tags: ["vegetarian"] },
      { name: "Smoked Trout Dip", description: "House-smoked trout, crème fraîche, chive, grilled sourdough.", price: "$16" },
      { name: "Grilled Calamari", description: "Charred calamari, Fresno chili, lemon confit, parsley, olive oil.", price: "$17" },
      { name: "Bone Marrow & Sourdough", description: "Roasted beef marrow bones, shallot-herb butter, sea salt, grilled bread.", price: "$19", tags: ["house favorite"] },
    ],
  },
  {
    name: "From the Fire",
    subtitle: "Cooked over live oak and hickory flame",
    items: [
      { name: "Dry-Aged Ribeye", description: "14 oz dry-aged ribeye, bone marrow butter, charred spring onion, sea salt.", price: "$48", tags: ["house favorite"] },
      { name: "Smoked Pork Chop", description: "Heritage pork chop, smoked 4 hours, apple-mustard glaze, braised greens.", price: "$32" },
      { name: "Whole Branzino", description: "Mediterranean sea bass, charred lemon, salsa verde, fennel salad.", price: "$36" },
      { name: "Half Chicken", description: "Brick-pressed half chicken, smoked paprika, charred lemon, jus.", price: "$26" },
      { name: "Grilled Portobello", description: "Large portobello, balsamic glaze, grilled halloumi, arugula, pine nuts.", price: "$24", tags: ["vegetarian"] },
    ],
  },
  {
    name: "Sides",
    subtitle: "For the table",
    items: [
      { name: "Charred Broccolini", description: "Blistered broccolini, chili flakes, lemon, parmesan.", price: "$10" },
      { name: "Smoked Potatoes", description: "Fingerling potatoes smoked over hickory, rosemary, sea salt.", price: "$9" },
      { name: "Grilled Corn", description: "Street-style grilled corn, cotija, lime, smoked paprika.", price: "$8" },
      { name: "Sourdough & Butter", description: "House-baked sourdough, cultured butter, flaky sea salt.", price: "$7" },
    ],
  },
  {
    name: "Desserts",
    subtitle: "Made in-house, daily",
    items: [
      { name: "Smoked Chocolate Tart", description: "Dark chocolate ganache smoked over applewood, sea salt, espresso cream.", price: "$12", tags: ["house favorite"] },
      { name: "Grilled Peach", description: "Charred peach, vanilla mascarpone, honey, candied pecans.", price: "$11", tags: ["seasonal"] },
      { name: "Bourbon Pecan Pie", description: "Bourbon-soaked pecans, flaky crust, salted caramel, crème fraîche.", price: "$11" },
      { name: "Olive Oil Cake", description: "Citrus olive oil cake, roasted strawberries, whipped cream.", price: "$10" },
    ],
  },
  {
    name: "Drinks",
    subtitle: "Curated wine list and craft cocktails",
    items: [
      { name: "Old Fashioned, Smoked", description: "Bourbon, demerara, bitters, smoked over applewood at the table.", price: "$16", tags: ["house favorite"] },
      { name: "Ember Spritz", description: "Aperol, prosecco, blood orange, rosemary, soda.", price: "$14" },
      { name: "House Red", description: "Nero d'Avola, Sicily. Bright, medium-bodied, ripe cherry.", price: "$12 / glass" },
      { name: "House White", description: "Albariño, Rías Baixas. Crisp, citrus, saline minerality.", price: "$12 / glass" },
      { name: "Local Beer", description: "Bronx Pale Ale, brewed 12 blocks away. Citrusy and balanced.", price: "$8" },
    ],
  },
]

const TAG_LEGEND: [string, string][] = [
  ["vegetarian", "No meat or fish"],
  ["house favorite", "What regulars order most"],
  ["raw bar", "Served cool, untouched by flame"],
  ["seasonal", "Here while it lasts"],
]

const SIGNATURES = MENU.flatMap((c) => c.items).filter((i) => i.tags?.includes("house favorite")).slice(0, 4)

const REVIEWS = [
  { name: "Maria Gonzalez", location: "Mott Haven, Bronx", rating: 5, date: "October 2025", text: "We celebrated our anniversary here and it was perfect. The dry-aged ribeye over open flame was the best steak I've had in New York. The smoked old fashioned is worth the trip alone." },
  { name: "James O'Sullivan", location: "Manhattan", rating: 5, date: "September 2025", text: "Came with a group of six for a birthday. The staff handled everything with care — the bone marrow starter and whole branzino were standouts. Warm, lively atmosphere without being loud." },
  { name: "Priya Sharma", location: "Brooklyn", rating: 5, date: "August 2025", text: "The smoked chocolate tart is genuinely unlike anything I've had. The whole menu changes with the seasons so there's always a reason to come back. Chef Daniela came out to check on us." },
  { name: "Robert Chen", location: "Queens", rating: 4, date: "July 2025", text: "Great food and a beautiful room. The grilled calamari was perfectly charred. We'll definitely be back for the tasting menu. Reservations fill up fast on weekends." },
  { name: "Sofia Romano", location: "Mott Haven, Bronx", rating: 5, date: "June 2025", text: "Finally a restaurant in the neighborhood that feels special without being stuffy. The smoked potatoes and charred broccolini sound simple but they're incredible. Bring friends and share everything." },
]

const TEAM = [
  { initials: "DR", name: "Daniela Reyes", role: "Chef & Owner", bio: "Daniela opened Ember & Oak in 2022 after a decade cooking in Michelin-starred kitchens in Manhattan and Copenhagen. She built her first wood-fire hearth in her backyard before bringing it to Mott Haven." },
  { initials: "MT", name: "Marcus Thompson", role: "Chef de Cuisine", bio: "Marcus manages the fire pit and daily menu development. A Bronx native, he trained at the Culinary Institute of America and worked at Blue Hill at Stone Barns before returning home." },
  { initials: "AF", name: "Ana Ferreira", role: "General Manager", bio: "Ana runs the dining room and wine program. She holds a WSET Level 3 certification and curates a list focused on small-producer, low-intervention wines from New York and the Mediterranean." },
]

const FAQS: [string, string][] = [
  ["Do you take walk-ins?", "Yes. We hold six seats at the bar and counter for walk-ins every night. Arrive early — the counter overlooks the open hearth and fills up fast. You can also join our waitlist by calling after 4 PM on the day you'd like to dine."],
  ["Can you accommodate dietary restrictions?", "Absolutely. Every menu marks vegetarian dishes, and our kitchen can adapt most items for vegan, gluten-free, or dairy-free diets. Tell us when you reserve and we'll prepare accordingly. We take allergies seriously — please let our staff know."],
  ["Is there a tasting menu?", "We offer a five-course chef's tasting menu for $75 per person, available Tuesday through Thursday. It changes weekly based on what our farmers and fishers bring in. Reserve at least 48 hours in advance and mention the tasting menu in your booking notes."],
  ["What is your cancellation policy?", "We hold tables with a credit card at booking. Cancellations within 24 hours of your reservation or no-shows incur a $25 per person fee. You can cancel or modify your reservation any time before that window at no charge."],
  ["Do you have parking?", "Street parking is available on Bruckner Boulevard and nearby side streets. The closest garage is three blocks east on 138th Street. We're a 5-minute walk from the 138th Street–Grand Concourse subway station (4, 5, 6 lines)."],
  ["Can I bring a large group?", "For parties of nine or more, please call us or use our private dining enquiry. The Hearth Room seats up to 16, and full buyouts of the restaurant — up to 65 guests — are easiest to arrange on Sundays and Mondays."],
]

const PACKAGES = [
  {
    name: "The Hearth Room",
    capacity: "Up to 16 guests",
    price: "From $85 per person",
    description: "Our private dining room overlooks the open kitchen with a view of the live-fire hearth. Includes a dedicated server and customizable set menu.",
    features: [
      "Three or four-course set menu",
      "Dedicated server and sommelier",
      "Customizable wine pairings",
      "Audio system for speeches or music",
      "Optional chef's demonstration at the hearth",
    ],
  },
  {
    name: "Full Restaurant Buyout",
    capacity: "Up to 65 guests",
    price: "From $9,500",
    description: "The entire restaurant — main dining room, bar, and Hearth Room — is yours for the evening. Ideal for corporate dinners, milestone celebrations, and weddings.",
    features: [
      "Exclusive use of the full venue",
      "Custom menu design with Chef Daniela",
      "Open bar or hosted wine program",
      "Full front-of-house and kitchen team",
      "Flexible timing and event coordination",
    ],
  },
]

const EVENT_TYPES = ["Birthday", "Anniversary", "Corporate dinner", "Wedding rehearsal", "Holiday party", "Other celebration"]
const BUDGETS = ["Not sure yet", "Under $100 per person", "$100–$150 per person", "$150–$200 per person", "$200+ per person"]
const OCCASIONS = ["Birthday", "Anniversary", "Date night", "Business dinner", "Graduation", "Other celebration"]

const TRUST = [
  "Featured in Eater NY — Best New Bronx Restaurants",
  "Time Out New York — 10 Coolest Dining Rooms",
  "The Infatuation — Rating 8.7 / 10",
  "OpenTable Diners' Choice 2025",
]

const FIRE_STEPS: [string, string][] = [
  ["Stacked at noon", "Oak and hickory from regional woodlots go in five hours before service. The fire is ready when the coals glow white under the grate — everything tonight cooks over that day's burn."],
  ["Season meets flame", "Long Island oysters, Hudson Valley greens, dry-aged beef — the menu turns with the seasons, and every plate passes over live fire or out of the brick hearth."],
  ["The table fills", "Small plates first, mains from the grill, sides for the table. Wine gets poured as you go, dessert comes slowly, and nobody rushes you out the door."],
]

const GALLERY = [
  { src: steak, w: 1600, h: 1008, alt: "Dry-aged ribeye rested after the grill, ready to slice", cap: "From the fire" },
  { src: plated, w: 1408, h: 768, alt: "Wood-roasted oysters with garlic butter arriving from the hearth", cap: "Small plates" },
  { src: counter, w: 1264, h: 848, alt: "Counter seats looking into the open kitchen and the grill", cap: "The counter" },
  { src: plate, w: 1024, h: 1024, alt: "A finished plate at the pass, charred lemon alongside", cap: "From the pass" },
  { src: still, w: 1408, h: 768, alt: "House sourdough with cultured butter and flaky salt", cap: "Baked daily" },
  { src: nordic, w: 1408, h: 1008, alt: "Cured and pickled plates from the cold side of the kitchen", cap: "The cold side" },
]

/* ── time helpers ─────────────────────────────────────────────────── */

const todayISO = () => {
  const t = new Date()
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`
}

const fmtTime = (x: number) => {
  const h24 = Math.floor(x)
  const m = Math.round((x - h24) * 60)
  const ampm = h24 >= 12 ? "PM" : "AM"
  return `${((h24 + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${ampm}`
}

/** Sitting slots for an ISO date — null on Mondays (closed); today's
 *  already-passed slots are dropped so the list is honest. */
function sittingsFor(iso: string): { label: string; slots: string[] } | null {
  if (!iso) return null
  const d = new Date(`${iso}T12:00:00`)
  const wd = d.getDay()
  if (Number.isNaN(d.getTime()) || wd === 1) return null
  const [a, b] = wd === 0 ? [16, 20.5] : wd === 5 || wd === 6 ? [16.5, 22.5] : [17, 21.5]
  const now = new Date()
  const cutoff = now.getHours() + now.getMinutes() / 60 + 0.5 // half-hour lead
  const slots: string[] = []
  for (let t = a; t <= b + 0.001; t += 0.5) {
    if (iso === todayISO() && t < cutoff) continue
    slots.push(fmtTime(t))
  }
  const label = wd === 0 ? "Sunday sittings · 4:00–8:30 PM" : wd === 5 || wd === 6 ? "Weekend sittings · 4:30–10:30 PM" : "Weeknight sittings · 5:00–9:30 PM"
  return { label, slots }
}

const dateFromISO = (iso: string) => new Date(`${iso}T12:00:00`)

/* ── tiny presentational pieces ───────────────────────────────────── */

function Flame({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden className="eo-flame">
      <path
        fill="currentColor"
        d="M12 2c.5 3.2 3.1 4.9 4.4 6.8.9 1.4 1.6 2.9 1.6 4.5a6 6 0 0 1-12 0c0-1.7.8-3.3 2-4.6.4 1.1 1 1.9 1.9 2.4C9.6 8 10.8 4.9 12 2z"
      />
    </svg>
  )
}

function Stars({ n }: { n: number }) {
  return (
    <p className="eo-stars" aria-label={`Rated ${n} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" width="15" height="15" aria-hidden className={i <= n ? "on" : ""}>
          <path d="M12 2.6l2.9 6 6.5.8-4.8 4.5 1.2 6.4L12 17.1 6.2 20.3l1.2-6.4L2.6 9.4l6.5-.8z" fill="currentColor" />
        </svg>
      ))}
    </p>
  )
}

function Chev({ dir }: { dir: "l" | "r" }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <path d={dir === "l" ? "M15 4l-8 8 8 8" : "M9 4l8 8-8 8"} fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function Field({ label, k, err, hint, full, children }: { label: string; k: string; err?: string; hint?: string; full?: boolean; children: ReactNode }) {
  return (
    <div className={`eo-field${err ? " bad" : ""}${full ? " full" : ""}`}>
      <label htmlFor={`f-${k}`}>{label}</label>
      {children}
      {err ? (
        <p className="eo-err" id={`f-${k}-err`}>
          {err}
        </p>
      ) : hint ? (
        <p className="eo-hint">{hint}</p>
      ) : null}
    </div>
  )
}

function SectionHead({ id, eyebrow, title, note }: { id: string; eyebrow: string; title: string; note?: ReactNode }) {
  return (
    <div className="eo-sec-head">
      <div>
        <p className="eo-eyebrow">{eyebrow}</p>
        <h2 id={id} className="eo-h2">
          {title}
        </h2>
      </div>
      {note ? <div className="eo-sec-note">{note}</div> : null}
    </div>
  )
}

/* ── chrome: announcement, header, footer, sticky CTA ────────────── */

function Header({ page, go }: { page: string; go: (p: string) => void }) {
  return (
    <header className="eo-head">
      <button className="eo-logo" onClick={() => go("home")} aria-label="Ember & Oak — home">
        <Flame />
        <span>
          Ember <em>&</em> Oak
        </span>
      </button>
      <nav className="eo-nav" aria-label="Main">
        {PAGES.map(([id, label]) => (
          <button key={id} className={page === id ? "on" : ""} aria-current={page === id ? "page" : undefined} onClick={() => go(id)}>
            {label}
          </button>
        ))}
      </nav>
      <a className="eo-tel" href={PHONE_HREF}>
        {PHONE}
      </a>
      <button className="eo-btn" onClick={() => go("reservations")}>
        Reserve a table
      </button>
    </header>
  )
}

function Footer({ go }: { go: (p: string) => void }) {
  const year = new Date().getFullYear()
  return (
    <footer className="eo-foot">
      <div className="eo-foot-in">
        <div>
          <p className="eo-foot-logo">
            <Flame /> Ember <em>&</em> Oak
          </p>
          <p className="eo-foot-tag">Wood-Fire Grill & Seasonal Kitchen — Mott Haven, Bronx.</p>
          <p className="eo-foot-social">
            <a href={INSTAGRAM} target="_blank" rel="noreferrer" aria-label="Ember & Oak on Instagram">
              Instagram
            </a>
            <a href={FACEBOOK} target="_blank" rel="noreferrer" aria-label="Ember & Oak on Facebook">
              Facebook
            </a>
          </p>
        </div>
        <nav aria-label="Footer">
          <h3>Explore</h3>
          <ul>
            {PAGES.map(([id, label]) => (
              <li key={id}>
                <button onClick={() => go(id)}>{label}</button>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h3>Contact</h3>
          <address>
            {ADDRESS_LINE_1}
            <br />
            {ADDRESS_LINE_2}
          </address>
          <ul className="eo-foot-list">
            <li>
              <a href={PHONE_HREF}>{PHONE}</a>
            </li>
            <li>
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </li>
            <li>
              <a href={MAP_URL} target="_blank" rel="noreferrer">
                Directions
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3>Hours</h3>
          <ul className="eo-foot-hours">
            {DISPLAY_HOURS.map((h) => (
              <li key={h.day}>
                <span>{h.day}</span>
                <span>{h.open === "Closed" ? "Closed" : `${h.open} – ${h.close}`}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="eo-foot-demo">© {year} Ember & Oak. Demo business — Growth OS Growth-tier template. Reviews and content are illustrative.</p>
    </footer>
  )
}

function StickyCta({ go }: { go: (p: string) => void }) {
  return (
    <div className="eo-cta">
      <p className="eo-cta-copy">
        The fire is lit tonight.
        <span>Walk-ins at the bar · tables from 4:30</span>
      </p>
      <TierGate need="mid">
        <button className="eo-btn" onClick={() => go("reservations")}>
          Reserve a table
        </button>
      </TierGate>
      <TierBelow need="mid">
        <a className="eo-btn" href={PHONE_HREF}>
          Call {PHONE}
        </a>
      </TierBelow>
    </div>
  )
}

/* ── location card + sketch map (shared) ──────────────────────────── */

function MapSketch() {
  return (
    <svg viewBox="0 0 420 300" role="img" aria-label="Sketch map: Ember & Oak sits on Bruckner Boulevard, a five-minute walk east from the 138th Street–Grand Concourse station">
      <rect width="420" height="300" fill="var(--surface)" />
      <path d="M0 36 C90 22 190 46 270 30 S380 12 420 26 L420 0 L0 0 Z" fill="color-mix(in srgb, var(--accent) 30%, transparent)" />
      <text x="14" y="16" fontSize="10" letterSpacing="1.6" fill="var(--muted)" fontFamily="var(--mono)">
        HARLEM RIVER
      </text>
      <path d="M-10 238 L430 96" stroke="var(--line)" strokeWidth="24" />
      <path d="M-10 238 L430 96" stroke="color-mix(in srgb, var(--accent) 45%, transparent)" strokeWidth="1.5" strokeDasharray="7 9" />
      <text x="236" y="146" fontSize="10" letterSpacing="1.6" fill="var(--muted)" fontFamily="var(--mono)" transform="rotate(-19 236 146)">
        BRUCKNER BLVD
      </text>
      <path d="M96 300 L216 0" stroke="var(--line)" strokeWidth="12" />
      <text x="196" y="288" fontSize="10" letterSpacing="1.4" fill="var(--muted)" fontFamily="var(--mono)" transform="rotate(-72 196 288)">
        E 138TH ST
      </text>
      <path d="M172 122 L268 142" stroke="color-mix(in srgb, var(--primary) 60%, transparent)" strokeWidth="2" strokeDasharray="2 6" />
      <circle cx="164" cy="120" r="13" fill="var(--bg)" stroke="var(--line)" strokeWidth="1.5" />
      <text x="164" y="124" textAnchor="middle" fontSize="9.5" fill="var(--ink)" fontFamily="var(--mono)">
        4·5·6
      </text>
      <circle cx="284" cy="146" r="15" fill="var(--primary)" />
      <text x="284" y="151" textAnchor="middle" fontSize="12" fill="var(--on-primary)" fontFamily="var(--display)">
        E
      </text>
      <text x="284" y="180" textAnchor="middle" fontSize="10" letterSpacing="1.2" fill="var(--ink)" fontFamily="var(--mono)">
        EMBER &amp; OAK
      </text>
    </svg>
  )
}

function Location() {
  const st = openState(HOURS)
  const today = new Date().getDay()
  return (
    <div className="eo-visit">
      <div className="eo-visit-copy">
        <p className={`eo-open${st.open ? " is-open" : ""}`}>
          <i aria-hidden /> {st.line}
        </p>
        <address className="eo-addr">
          {ADDRESS_LINE_1}
          <br />
          {ADDRESS_LINE_2}
        </address>
        <table className="eo-hours">
          <caption className="sr-only">Opening hours</caption>
          <tbody>
            {DISPLAY_HOURS.map((h) => (
              <tr key={h.day} className={h.d === today ? "today" : ""}>
                <th scope="row">
                  {h.day}
                  {h.d === today && <span> · today</span>}
                </th>
                <td>{h.open === "Closed" ? "Closed" : `${h.open} – ${h.close}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="eo-fine">Last seating half an hour before close. Closed Mondays.</p>
        <ul className="eo-contact-links">
          <li>
            <a href={PHONE_HREF}>{PHONE}</a>
          </li>
          <li>
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </li>
          <li>
            <a href={MAP_URL} target="_blank" rel="noreferrer">
              Get directions
            </a>
          </li>
        </ul>
      </div>
      <figure className="eo-map">
        <MapSketch />
        <figcaption>Five minutes on foot from the 138th Street–Grand Concourse station (4 · 5 · 6).</figcaption>
      </figure>
    </div>
  )
}

/* ── home ─────────────────────────────────────────────────────────── */

function Home({ go }: { go: (p: string) => void }) {
  return (
    <>
      <section className="eo-hero" aria-labelledby="hero-h">
        <div className="eo-hero-copy">
          <p className="eo-eyebrow">Mott Haven · The Bronx · Wood-Fire Grill</p>
          <h1 id="hero-h">
            Cooked over <em>live fire</em>.
            <br />
            Rooted in the neighborhood.
          </h1>
          <p className="eo-lede">A neighborhood wood-fire grill in the heart of Mott Haven. We cook with live flame, source from regional farms and fisheries, and change the menu as the seasons turn. Approachable fine dining — no dress code, no pretense, just good fire and good food.</p>
          <div className="eo-hero-act">
            <button className="eo-btn" onClick={() => go("reservations")}>
              Reserve a table
            </button>
            <button className="eo-btn ghost" onClick={() => go("menu")}>
              See the menu
            </button>
            <p className="eo-hero-note">Open Tue–Sun · walk-ins at the bar · closed Mondays</p>
          </div>
        </div>
        <figure className="eo-hero-img">
          <span className="eo-hero-frame">
            <img src={tavern.src} alt="The candlelit dining room at Ember & Oak, wooden tables set for evening service" width={1408} height={1008} />
          </span>
          <figcaption className="eo-hero-cap">
            <Flame size={13} /> The hearth room · Est. 2022
          </figcaption>
        </figure>
      </section>

      {/* Starter step: bar walk-ins + the phone — the fuller flows arrive with Growth */}
      <TierBelow need="mid">
        <section className="eo-sec eo-walkin" aria-labelledby="walkin-h">
          <div>
            <p className="eo-eyebrow">No reservation needed</p>
            <h2 className="eo-h2" id="walkin-h">
              Walk in, or call ahead.
            </h2>
            <p>We hold six seats at the bar and counter for walk-ins every night, first come first served — the counter looks straight into the hearth. For a table, call after 2 PM and we'll tell you what the book looks like.</p>
          </div>
          <div className="eo-walkin-act">
            <a className="eo-btn" href={PHONE_HREF}>
              Call {PHONE}
            </a>
            <p className="eo-fine">Tue–Sun from 4:30 PM · closed Mondays</p>
          </div>
        </section>
      </TierBelow>

      <TierGate need="mid">
        <section className="eo-trust" aria-label="Press mentions">
        {TRUST.map((t) => (
          <span key={t}>
            <Flame size={11} /> {t}
          </span>
        ))}
        </section>
      </TierGate>

      <TierGate need="mid">
        <section className="eo-sec" aria-label="Our story">
        <Reveal as="div" className="eo-story" delay={0}>
          <figure className="eo-story-img">
            <img src={diningroom.src} alt="The main dining room under warm light, the reclaimed-brick hearth at one end" width={1408} height={768} loading="lazy" />
          </figure>
          <div>
            <p className="eo-eyebrow">Our story</p>
            <h2 className="eo-h2">A fire, a room, and a neighborhood table.</h2>
            <p>Chef Daniela Reyes opened Ember &amp; Oak in 2022 with one idea: cook everything over live fire and serve it in a room that feels like home. No white tablecloths, no stuffy service — just honest food, good wine, and a warm welcome.</p>
            <p>We built our hearth from reclaimed brick, bake our own sourdough daily, and work with farms across the Hudson Valley. The menu shifts with what's growing, caught, and ripe.</p>
            <p className="eo-more-row">
              <button className="eo-more" onClick={() => go("menu")}>
                See what's on the menu →
              </button>
            </p>
          </div>
        </Reveal>
        </section>
      </TierGate>

      <TierGate need="mid">
        <section className="eo-sec" aria-labelledby="sig-h">
        <SectionHead id="sig-h" eyebrow="House favorites" title="What people come back for" note={<button className="eo-more" onClick={() => go("menu")}>Full menu →</button>} />
        <div className="eo-dishes">
          {SIGNATURES.map((d, i) => (
            <Reveal as="article" key={d.name} delay={i * 90} className="eo-dish">
              <p className="eo-dish-top">
                <b>{d.name}</b>
                <span className="eo-dots" aria-hidden />
                <span className="eo-price">{d.price}</span>
              </p>
              <p className="eo-dish-desc">{d.description}</p>
              {d.tags?.map((t) => (
                <span key={t} className={`eo-chip${t === "vegetarian" ? " v" : ""}`}>
                  {t}
                </span>
              ))}
            </Reveal>
          ))}
        </div>
        </section>
      </TierGate>

      <TierGate need="mid">
        <section className="eo-sec" aria-labelledby="fire-h">
        <SectionHead id="fire-h" eyebrow="The kitchen" title="How the fire works" note={<p>One hearth, lit at noon, done its work by eleven.</p>} />
        <ol className="eo-fire">
          {FIRE_STEPS.map(([h, p], i) => (
            <Reveal as="li" key={h} delay={i * 110}>
              <span className="eo-fire-num" aria-hidden>
                0{i + 1}
              </span>
              <h3>{h}</h3>
              <p>{p}</p>
            </Reveal>
          ))}
        </ol>
        </section>
      </TierGate>

      {/* Business add-on: the sourcing ledger — where the fire's fuel and food come from */}
      <TierGate need="scale">
        <section className="eo-sec" aria-labelledby="src2-h">
          <SectionHead id="src2-h" eyebrow="The sourcing ledger" title="Every week, by the cord and the crate" note={<p className="eo-sec-note">What comes through the back door, and from how far.</p>} />
          <ol className="eo-ledger">
            <li>
              <b>5⅕</b>
              <span>cords of oak &amp; hickory a season, from woodlots in Putnam County</span>
            </li>
            <li>
              <b>68 mi</b>
              <span>average distance from farm or dock to the hearth — most of it inside New York State</span>
            </li>
            <li>
              <b>0</b>
              <span>freezers. Fish comes in on the day boat, greens on the morning truck, nothing waits</span>
            </li>
          </ol>
          <ul className="eo-suppliers">
            <li>
              <p className="eo-eyebrow">Fish</p>
              <h3>Seatuck Fish Company</h3>
              <p>Day-boat catch out of Montauk — fluke, blackfish, and whatever else the drag brings up, called in at 5 AM.</p>
            </li>
            <li>
              <p className="eo-eyebrow">Meat</p>
              <h3>Grove &amp; Field Farms</h3>
              <p>Pastured beef and heritage pork from Dutchess County, dry-aged in our own cold room for 21 to 42 days.</p>
            </li>
            <li>
              <p className="eo-eyebrow">Greens</p>
              <h3>Bruckner Community Farm</h3>
              <p>Two acres eleven blocks away — the truly hyperlocal rows, plus eggs and the peppers we char for salsa.</p>
            </li>
            <li>
              <p className="eo-eyebrow">Wood</p>
              <h3>Haldemar Woodlots</h3>
              <p>Seasoned oak and hickory, split to hearth length. The fire is only as good as what it burns.</p>
            </li>
          </ul>
        </section>
      </TierGate>

      <TierGate need="mid">
        <Reviews />
      </TierGate>

      <TierGate need="mid">
        <section className="eo-sec" aria-labelledby="gal-h">
        <SectionHead id="gal-h" eyebrow="The room" title="A look around" note={<p className="eo-sec-note">The counter looks straight into the hearth.</p>} />
        <div className="eo-gallery">
          {GALLERY.map((g, i) => (
            <Reveal as="figure" key={g.cap} delay={i * 70} className="eo-shot">
              <img src={g.src.src} alt={g.alt} width={g.w} height={g.h} loading="lazy" />
              <figcaption>{g.cap}</figcaption>
            </Reveal>
          ))}
        </div>
        </section>
      </TierGate>

      <TierGate need="mid">
        <section className="eo-sec" aria-labelledby="team-h">
        <SectionHead id="team-h" eyebrow="The team" title="People behind the fire" />
        <div className="eo-team">
          {TEAM.map((t, i) => (
            <Reveal as="article" key={t.name} delay={i * 100} className="eo-chef">
              <p className="eo-mono-mark" aria-hidden>
                {t.initials}
              </p>
              <h3>{t.name}</h3>
              <p className="eo-chef-role">{t.role}</p>
              <p className="eo-chef-bio">{t.bio}</p>
            </Reveal>
          ))}
        </div>
        </section>
      </TierGate>

      {/* Flagship add-on: the Ember Circle — priority tables and hearth suppers */}
      <TierGate need="premium">
        <section className="eo-sec eo-circle" aria-labelledby="circle-h">
          <div>
            <p className="eo-eyebrow">The Ember Circle</p>
            <h2 className="eo-h2" id="circle-h">
              The regulars eat first.
            </h2>
            <p className="eo-circle-lede">Circle members book the hearth counter before the book opens to everyone else, get first refusal on the monthly off-menu hearth suppers, and keep a bottle behind the bar. $120 a year, sixty members, and the wait is short.</p>
            <ul className="eo-circle-list">
              <li>
                <b>24h</b> priority window on every Friday and Saturday seating
              </li>
              <li>
                <b>12×</b> a year — hearth suppers that never reach the public menu
              </li>
              <li>
                <b>1</b> bottle of anything on the list kept with your name on it
              </li>
            </ul>
          </div>
          <CircleForm />
        </section>
      </TierGate>

      <section className="eo-sec" aria-labelledby="visit-h">
        <SectionHead id="visit-h" eyebrow="Visit" title="Find us on Bruckner" note={<a className="eo-more" href={MAP_URL} target="_blank" rel="noreferrer">Directions ↗</a>} />
        <Reveal as="div" delay={0}>
          <Location />
        </Reveal>
        </section>
    </>
  )
}

function CircleForm() {
  const f = useForm({ circle: "" }, { circle: [rules.email()] })
  if (f.status === "done")
    return (
      <div className="eo-circle-card" role="status">
        <p className="eo-eyebrow">Welcome to the Circle</p>
        <p>Your membership link — and the next hearth supper's date — is on its way to {f.values.circle}.</p>
      </div>
    )
  return (
    <form className="eo-circle-card" onSubmit={f.submit()} noValidate>
      <p className="eo-eyebrow">Join the Circle</p>
      <p>$120 a year. The next members' supper is the last Tuesday of the month — seats are still open.</p>
      <label htmlFor="f-circle" className="sr-only">
        Email address
      </label>
      <div className="eo-circle-row">
        <input {...f.field("circle")} type="email" placeholder="you@example.com" autoComplete="email" />
        <button className="eo-btn" type="submit">
          {f.status === "sending" ? "…" : "Join"}
        </button>
      </div>
      {f.errors.circle && (
        <p className="eo-err" id="f-circle-err">
          {f.errors.circle}
        </p>
      )}
    </form>
  )
}

/** Review carousel — buttons + arrow keys, still at motion 0–2. */
function Reviews() {
  const [i, setI] = useState(0)
  const n = REVIEWS.length
  const prev = () => setI((v) => (v - 1 + n) % n)
  const next = () => setI((v) => (v + 1) % n)
  const r = REVIEWS[i]
  return (
    <section className="eo-sec" aria-labelledby="rev-h">
      <SectionHead id="rev-h" eyebrow="Guest reviews" title="What the neighborhood says" note={<p>4.9 average · demo reviews, illustrative</p>} />
      <Reveal as="div" className="eo-rev-wrap" delay={0}>
        <figure
          key={i}
          className="eo-rev-card"
          tabIndex={0}
          aria-label={`Review ${i + 1} of ${n}, by ${r.name}`}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") prev()
            if (e.key === "ArrowRight") next()
          }}
        >
          <div className="eo-rev-side">
            <Stars n={r.rating} />
            <figcaption>
              {r.name} · {r.location}
              <span>{r.date}</span>
            </figcaption>
          </div>
          <blockquote>“{r.text}”</blockquote>
        </figure>
        <div className="eo-rev-nav">
          <button className="eo-ico" onClick={prev} aria-label="Previous review">
            <Chev dir="l" />
          </button>
          <p className="eo-rev-count" aria-live="polite">
            {i + 1} / {n}
          </p>
          <button className="eo-ico" onClick={next} aria-label="Next review">
            <Chev dir="r" />
          </button>
        </div>
        <div className="eo-rev-dots">
          {REVIEWS.map((_, k) => (
            <button key={k} className={k === i ? "on" : ""} onClick={() => setI(k)} aria-label={`Show review ${k + 1}`} />
          ))}
        </div>
      </Reveal>
    </section>
  )
}

/* ── menu page ────────────────────────────────────────────────────── */

function MenuPage({ go }: { go: (p: string) => void }) {
  return (
    <div className="eo-page">
      <header className="eo-page-head">
        <p className="eo-eyebrow">Seasonal menu · changes with what's growing</p>
        <h1>What's on the fire</h1>
        <p className="eo-lede">Everything is cooked over live oak and hickory flame, and most of it is made in-house. Ask your server about tonight's specials and the chef's tasting menu — five courses, $75, Tuesday to Thursday.</p>
        <div className="eo-legend" aria-label="Menu tag legend">
          {TAG_LEGEND.map(([tag, note]) => (
            <p key={tag}>
              <span className={`eo-chip${tag === "vegetarian" ? " v" : ""}`}>{tag}</span> {note}
            </p>
          ))}
        </div>
      </header>

      {MENU.map((cat, ci) => (
        <section key={cat.name} className="eo-cat" aria-labelledby={`cat-${ci}`}>
          <h2 id={`cat-${ci}`}>
            {cat.name} <small>{cat.subtitle}</small>
          </h2>
          <ul className="eo-items">
            {cat.items.map((it) => (
              <li key={it.name} className="eo-item">
                <p className="eo-item-top">
                  <b>{it.name}</b>
                  {it.tags?.map((t) => (
                    <span key={t} className={`eo-chip${t === "vegetarian" ? " v" : ""}`}>
                      {t}
                    </span>
                  ))}
                  <span className="eo-dots" aria-hidden />
                  <span className="eo-price">{it.price}</span>
                </p>
                <p className="eo-item-desc">{it.description}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="eo-source" aria-labelledby="src-h">
        <h2 id="src-h">Where it comes from</h2>
        <Reveal as="div" className="eo-source-grid" delay={0}>
          <div>
            <h3>Oysters & fish</h3>
            <p>Long Island waters; day-boat landings up the coast. Raw bar shucked to order, the rest over oak.</p>
          </div>
          <div>
            <h3>Produce & meat</h3>
            <p>Hudson Valley farms we know by name — heritage pork, dry-aged beef, whatever's ripe this week.</p>
          </div>
          <div>
            <h3>Bread & butter</h3>
            <p>Sourdough baked in-house daily, cultured butter, flaky sea salt. The hearth is built from reclaimed brick.</p>
          </div>
          <div>
            <h3>Beer & wine</h3>
            <p>Bronx Pale Ale, brewed 12 blocks away. Small-producer, low-intervention wines from New York and the Mediterranean.</p>
          </div>
        </Reveal>
        <p className="eo-fine">A 20% service charge is added to parties of six or more. Prices are subject to change with the market. Our kitchen handles nuts, dairy, gluten and shellfish — tell us about allergies when you reserve.</p>
      </section>

      <div className="eo-page-cta">
        <p>Fire Side Saturdays fill fast — reserve early for the hearth counter.</p>
        <button className="eo-btn" onClick={() => go("reservations")}>
          Reserve a table
        </button>
      </div>
    </div>
  )
}

/* ── reservations ─────────────────────────────────────────────────── */

const dateOk: Rule = (v) => {
  if (!v.trim()) return "Pick a date for your table."
  const d = dateFromISO(v)
  if (Number.isNaN(d.getTime())) return "Pick a date for your table."
  if (d.getDay() === 1) return "We're closed Mondays — choose another day."
  const t = new Date()
  t.setHours(0, 0, 0, 0)
  if (d < t) return "That day's been and gone — today or later, please."
  return null
}

const timeOk: Rule = (v, all) => {
  if (!all.date) return "Choose a date first — sittings change through the week."
  const s = sittingsFor(all.date)
  if (!s) return "We're closed Mondays — choose another day."
  if (s.slots.length === 0) return "Tonight's sittings are gone — choose another day."
  if (!v.trim()) return "Pick a sitting time."
  return null
}

const partyOk: Rule = (v) => (v === "9+" ? "For nine or more guests, please call us or use the private dining enquiry." : null)

function Reservations({ go }: { go: (p: string) => void }) {
  const min = todayISO()
  const form = useForm(
    { date: "", time: "", party: "2", name: "", email: "", phone: "", occasion: "", notes: "", consent: "" },
    {
      date: [dateOk],
      time: [timeOk],
      party: [partyOk],
      name: [rules.required("Whose name should the table be under?")],
      email: [rules.email()],
      phone: [rules.phone()],
      consent: [rules.checked("Please accept the hold policy so we can take the booking.")],
    },
  )
  const [code] = useState(() => ref("EO"))
  const sittings = sittingsFor(form.values.date)
  const party = form.values.party
  const partyHint =
    party === "9+"
      ? `For nine or more, call ${PHONE} — or tell us about the evening via private dining and we'll set the room properly.`
      : Number(party) >= 6
        ? "A 20% service charge is added for parties of six or more."
        : undefined

  if (form.status === "done") {
    const d = dateFromISO(form.values.date)
    return (
      <div className="eo-page">
        <section className="eo-done" role="status">
          <Flame size={40} />
          <p className="eo-eyebrow">Reservation requested</p>
          <h1>Good fire, good company — see you soon.</h1>
          <p className="eo-ref">
            Reference <b>{code}</b>
          </p>
          <dl className="eo-echo">
            <dt>Who</dt>
            <dd>{form.values.name}</dd>
            <dt>When</dt>
            <dd>
              {Number.isNaN(d.getTime()) ? form.values.date : longDate(d)} · {form.values.time}
            </dd>
            <dt>Party</dt>
            <dd>{party === "1" ? "1 guest" : `${party} guests`}</dd>
            {form.values.occasion && (
              <>
                <dt>Occasion</dt>
                <dd>{form.values.occasion}</dd>
              </>
            )}
            {form.values.notes && (
              <>
                <dt>Notes</dt>
                <dd>{form.values.notes}</dd>
              </>
            )}
          </dl>
          <div className="eo-next-steps">
            <h2>What happens next</h2>
            <ol>
              <li>
                A confirmation is on its way to <b>{form.values.email}</b>. If it doesn't land within a few minutes, check spam or call {PHONE}.
              </li>
              <li>
                We hold your table for <b>15 minutes</b> past your sitting time. Running late? Call us and we'll do what we can.
              </li>
              <li>
                Cancel or change free up to <b>24 hours</b> before; inside that window it's $25 per guest.
              </li>
            </ol>
          </div>
          <button className="eo-btn ghost" onClick={form.reset}>
            Make another reservation
          </button>
        </section>
      </div>
    )
  }

  return (
    <div className="eo-page">
      <header className="eo-page-head">
        <p className="eo-eyebrow">Reservations</p>
        <h1>Reserve a table</h1>
        <p className="eo-lede">Pick a date, a sitting and your party — you'll get an instant confirmation by email, and we'll have the fire going.</p>
      </header>

      <div className="eo-two-col">
        <form className="eo-form-wrap" onSubmit={form.submit()} noValidate>
          <div className="eo-form">
            <Field label="Date" k="date" err={form.errors.date} hint="Tuesday to Sunday — we're closed Mondays.">
              <input
                {...form.field("date")}
                type="date"
                min={min}
                onChange={(e) => {
                  const v = e.target.value
                  form.set("date", v)
                  const s = sittingsFor(v)
                  if (!s || !s.slots.includes(form.values.time)) form.set("time", "")
                }}
              />
            </Field>
            <Field label="Sitting time" k="time" err={form.errors.time} hint={sittings?.label}>
              <div className="eo-select">
                <select {...form.field("time")} disabled={!sittings}>
                  {sittings ? (
                    sittings.slots.length ? (
                      <>
                        <option value="">Choose a time</option>
                        {sittings.slots.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </>
                    ) : (
                      <option value="">Tonight's sittings are gone — pick another day</option>
                    )
                  ) : (
                    <option value="">{form.values.date ? "Closed Mondays — pick another day" : "Choose a date first"}</option>
                  )}
                </select>
              </div>
            </Field>
            <Field label="Party size" k="party" err={form.errors.party} hint={partyHint}>
              <div className="eo-select">
                <select {...form.field("party")}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={String(n)}>
                      {n} {n === 1 ? "guest" : "guests"}
                    </option>
                  ))}
                  <option value="9+">Nine or more — call us</option>
                </select>
              </div>
            </Field>
            <Field label="Occasion" k="occasion" hint="Optional — helps us set the table right.">
              <div className="eo-select">
                <select {...form.field("occasion")}>
                  <option value="">No special occasion</option>
                  {OCCASIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
            </Field>
            <Field label="Name" k="name" err={form.errors.name}>
              <input {...form.field("name")} autoComplete="name" />
            </Field>
            <Field label="Email" k="email" err={form.errors.email}>
              <input {...form.field("email")} type="email" autoComplete="email" />
            </Field>
            <Field label="Phone" k="phone" err={form.errors.phone} hint="Only used if we need to reach you on the day.">
              <input {...form.field("phone")} type="tel" autoComplete="tel" />
            </Field>
            <Field label="Notes" k="notes" hint="Dietary needs, seating preference, a quiet corner…" full>
              <textarea {...form.field("notes")} rows={3} />
            </Field>
            <div className={`eo-check${form.errors.consent ? " bad" : ""}`}>
              <input
                id="f-consent"
                type="checkbox"
                checked={form.values.consent === "yes"}
                onChange={(e) => form.set("consent", e.target.checked ? "yes" : "")}
                aria-invalid={form.errors.consent ? "true" : "false"}
                aria-describedby={form.errors.consent ? "f-consent-err" : undefined}
              />
              <label htmlFor="f-consent">
                I understand tables are held with a card, we hold yours for 15 minutes past the sitting time, and cancellations inside 24 hours carry a $25 per-guest fee.
              </label>
              {form.errors.consent && (
                <p className="eo-err" id="f-consent-err">
                  {form.errors.consent}
                </p>
              )}
            </div>
          </div>
          <div className="eo-submit">
            <p className="eo-fine">Instant email confirmation · no card charged unless you no-show.</p>
            <button className="eo-btn" type="submit" disabled={form.status === "sending"}>
              {form.status === "sending" ? "Sending…" : "Request reservation"}
            </button>
          </div>
        </form>

        <aside className="eo-aside" aria-label="Before you book">
          <div className="eo-aside-card">
            <h2>Before you book</h2>
            <dl>
              <dt>Date</dt>
              <dd>Tuesday to Sunday. Closed Mondays.</dd>
              <dt>Sittings</dt>
              <dd>5:00–9:30 PM Tue–Thu · 4:30–10:30 PM Fri–Sat · 4:00–8:30 PM Sun.</dd>
              <dt>Party size</dt>
              <dd>Up to 8 guests online. Nine or more: call us or use private dining.</dd>
              <dt>Same day?</dt>
              <dd>
                Call <a href={PHONE_HREF}>{PHONE}</a> after 4 PM for the waitlist.
              </dd>
            </dl>
          </div>
          <div className="eo-aside-card">
            <h2>Walk-ins welcome</h2>
            <p>We hold six seats at the bar and counter every night — no reservation needed. The counter overlooks the hearth; arrive early, it fills fast.</p>
          </div>
        </aside>
      </div>

      <Faq />
      <p className="eo-after-faq">
        Planning something bigger?{" "}
        <button className="eo-more" onClick={() => go("private-dining")}>
          Private dining &amp; events →
        </button>
      </p>
    </div>
  )
}

/* ── FAQ accordion (native details) ──────────────────────────────── */

function Faq() {
  return (
    <section className="eo-faq" aria-labelledby="faq-h">
      <div>
        <p className="eo-eyebrow">Good to know</p>
        <h2 id="faq-h">Before you come</h2>
        <p className="eo-faq-note">Everything regulars ask on the phone — walk-ins, dietary needs, the tasting menu, parking.</p>
      </div>
      <Reveal as="div" delay={0}>
        {FAQS.map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </Reveal>
    </section>
  )
}

/* ── private dining ───────────────────────────────────────────────── */

const eventDateOk: Rule = (v) => {
  if (!v.trim()) return "A rough date helps us pencil the room."
  const d = dateFromISO(v)
  if (Number.isNaN(d.getTime())) return "A rough date helps us pencil the room."
  const t = new Date()
  t.setHours(0, 0, 0, 0)
  if (d < t) return "That's in the past — pick a date ahead."
  return null
}

const guestsOk: Rule = (v) => {
  const n = Number(v)
  if (!v.trim()) return "Roughly how many guests?"
  if (!Number.isFinite(n) || n < 7) return "Private dining starts at seven guests."
  if (n > 65) return "The whole room caps at 65 — for anything bigger, call us."
  return null
}

function PrivateDining() {
  const min = todayISO()
  const form = useForm(
    { type: "", date: "", guests: "", budget: "", name: "", email: "", phone: "", details: "" },
    {
      type: [rules.required("What are we celebrating?")],
      date: [eventDateOk],
      guests: [guestsOk],
      name: [rules.required("Who should our coordinator ask for?")],
      email: [rules.email()],
      phone: [rules.phone()],
      details: [rules.min(20, "A line or two about the evening helps — at least 20 characters.")],
    },
  )
  const [code] = useState(() => ref("PD"))

  if (form.status === "done") {
    const d = dateFromISO(form.values.date)
    return (
      <div className="eo-page">
        <section className="eo-done" role="status">
          <Flame size={40} />
          <p className="eo-eyebrow">Enquiry received</p>
          <h1>Leave the room to us.</h1>
          <p className="eo-ref">
            Reference <b>{code}</b>
          </p>
          <dl className="eo-echo">
            <dt>Event</dt>
            <dd>{form.values.type}</dd>
            <dt>Preferred date</dt>
            <dd>{Number.isNaN(d.getTime()) ? form.values.date : longDate(d)}</dd>
            <dt>Guests</dt>
            <dd>{form.values.guests}</dd>
            {form.values.budget && form.values.budget !== "Not sure yet" && (
              <>
                <dt>Budget</dt>
                <dd>{form.values.budget}</dd>
              </>
            )}
            <dt>Coordinator</dt>
            <dd>Ana Ferreira, General Manager</dd>
          </dl>
          <div className="eo-next-steps">
            <h2>What happens next</h2>
            <ol>
              <li>
                Ana personally reviews every enquiry and replies within <b>one working day</b> with menus, availability and a quote.
              </li>
              <li>We'll pencil your date for five days while you decide — no deposit, no pressure.</li>
              <li>
                Questions in the meantime? <a href={PHONE_HREF}>{PHONE}</a> or <a href={`mailto:${RESERVE_EMAIL}`}>{RESERVE_EMAIL}</a>.
              </li>
            </ol>
          </div>
          <button className="eo-btn ghost" onClick={form.reset}>
            Send another enquiry
          </button>
        </section>
      </div>
    )
  }

  return (
    <div className="eo-page">
      <header className="eo-page-head">
        <p className="eo-eyebrow">Private dining &amp; events</p>
        <h1>Two ways to celebrate</h1>
        <p className="eo-lede">Birthdays, anniversaries, corporate dinners and everything worth celebrating over fire. We handle the food, the wine and the room — you bring the reason.</p>
      </header>

      <div className="eo-packages">
        {PACKAGES.map((p, i) => (
          <Reveal as="article" key={p.name} delay={i * 90} className="eo-pkg">
            <h2>{p.name}</h2>
            <p className="eo-pkg-meta">
              <span>{p.capacity}</span>
              <span className="eo-pkg-price">{p.price}</span>
            </p>
            <p className="eo-pkg-desc">{p.description}</p>
            <ul>
              {p.features.map((f) => (
                <li key={f}>
                  <Flame size={13} /> {f}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>

      <div className="eo-two-col">
        <form className="eo-form-wrap" onSubmit={form.submit()} noValidate>
          <div className="eo-form">
            <Field label="Event type" k="type" err={form.errors.type}>
              <div className="eo-select">
                <select {...form.field("type")}>
                  <option value="">What are we celebrating?</option>
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </Field>
            <Field label="Preferred date" k="date" err={form.errors.date} hint="A rough date is fine — we'll confirm options.">
              <input {...form.field("date")} type="date" min={min} />
            </Field>
            <Field label="Guests" k="guests" err={form.errors.guests} hint="The Hearth Room seats 16; buyouts take up to 65.">
              <input {...form.field("guests")} type="number" min={7} max={65} inputMode="numeric" />
            </Field>
            <Field label="Budget range" k="budget" hint="Optional — helps us shape the menu.">
              <div className="eo-select">
                <select {...form.field("budget")}>
                  {BUDGETS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </Field>
            <Field label="Name" k="name" err={form.errors.name}>
              <input {...form.field("name")} autoComplete="name" />
            </Field>
            <Field label="Email" k="email" err={form.errors.email}>
              <input {...form.field("email")} type="email" autoComplete="email" />
            </Field>
            <Field label="Phone" k="phone" err={form.errors.phone}>
              <input {...form.field("phone")} type="tel" autoComplete="tel" />
            </Field>
            <Field label="Tell us about the event" k="details" err={form.errors.details} hint="The occasion, timings, dietary needs, anything you're dreaming up." full>
              <textarea {...form.field("details")} rows={4} />
            </Field>
          </div>
          <div className="eo-submit">
            <p className="eo-fine">
              Ana replies within one working day · or call <a href={PHONE_HREF}>{PHONE}</a>
            </p>
            <button className="eo-btn" type="submit" disabled={form.status === "sending"}>
              {form.status === "sending" ? "Sending…" : "Send enquiry"}
            </button>
          </div>
        </form>

        <aside className="eo-aside" aria-label="Private dining notes">
          <div className="eo-aside-card">
            <h2>How it works</h2>
            <dl>
              <dt>Menus</dt>
              <dd>Three or four-course sets built around the season, designed with Chef Daniela.</dd>
              <dt>Wine</dt>
              <dd>Pairings curated by Ana from small producers — or a hosted bar for buyouts.</dd>
              <dt>Timing</dt>
              <dd>Sundays and Mondays are easiest to take whole; evenings any night for the Hearth Room.</dd>
              <dt>Talk it through</dt>
              <dd>
                <a href={PHONE_HREF}>{PHONE}</a> · <a href={`mailto:${RESERVE_EMAIL}`}>{RESERVE_EMAIL}</a>
              </dd>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  )
}

/* ── contact ──────────────────────────────────────────────────────── */

function Contact() {
  const form = useForm(
    { name: "", email: "", subject: "", message: "" },
    {
      name: [rules.required("Who's writing?")],
      email: [rules.email()],
      subject: [rules.required("Pick a subject so it lands with the right person.")],
      message: [rules.min(10)],
    },
  )

  if (form.status === "done") {
    return (
      <div className="eo-page">
        <section className="eo-done" role="status">
          <Flame size={40} />
          <p className="eo-eyebrow">Message sent</p>
          <h1>Thanks — we read everything.</h1>
          <dl className="eo-echo">
            <dt>From</dt>
            <dd>
              {form.values.name} · {form.values.email}
            </dd>
            <dt>Subject</dt>
            <dd>{form.values.subject}</dd>
          </dl>
          <div className="eo-next-steps">
            <h2>What happens next</h2>
            <ol>
              <li>
                We reply within <b>one business day</b> — faster for reservations questions.
              </li>
              <li>
                Need us tonight? Call <a href={PHONE_HREF}>{PHONE}</a> after 4 PM for the waitlist.
              </li>
            </ol>
          </div>
          <button className="eo-btn ghost" onClick={form.reset}>
            Send another message
          </button>
        </section>
      </div>
    )
  }

  return (
    <div className="eo-page">
      <header className="eo-page-head">
        <p className="eo-eyebrow">Contact</p>
        <h1>Get in touch</h1>
        <p className="eo-lede">Questions, feedback, press — we read every message. For tables, the reservation page is faster; for same-day, call after 4 PM.</p>
      </header>

      <div className="eo-two-col">
        <form className="eo-form-wrap" onSubmit={form.submit()} noValidate>
          <div className="eo-form">
            <Field label="Name" k="name" err={form.errors.name}>
              <input {...form.field("name")} autoComplete="name" />
            </Field>
            <Field label="Email" k="email" err={form.errors.email}>
              <input {...form.field("email")} type="email" autoComplete="email" />
            </Field>
            <Field label="Subject" k="subject" err={form.errors.subject}>
              <div className="eo-select">
                <select {...form.field("subject")}>
                  <option value="">Choose a subject</option>
                  {["General question", "Reservations", "Private dining", "Feedback", "Press & partnerships", "Careers"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </Field>
            <Field label="Message" k="message" err={form.errors.message} full>
              <textarea {...form.field("message")} rows={5} />
            </Field>
          </div>
          <div className="eo-submit">
            <p className="eo-fine">We reply within one business day.</p>
            <button className="eo-btn" type="submit" disabled={form.status === "sending"}>
              {form.status === "sending" ? "Sending…" : "Send message"}
            </button>
          </div>
        </form>

        <aside className="eo-aside" aria-label="Visit and directions">
          <div className="eo-aside-card">
            <h2>Visit us</h2>
            <Location />
          </div>
          <div className="eo-aside-card">
            <h2>Getting here</h2>
            <dl>
              <dt>Subway</dt>
              <dd>4 · 5 · 6 to 138th Street–Grand Concourse — five minutes on foot down Bruckner.</dd>
              <dt>Parking</dt>
              <dd>Street parking along Bruckner Boulevard and nearby side streets; the closest garage is three blocks east on 138th Street.</dd>
              <dt>Press & partnerships</dt>
              <dd>
                Media, collaborations and job applications: <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
              </dd>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  )
}

/* ── root ─────────────────────────────────────────────────────────── */

export default function EmberOak() {
  const { page, go } = useSite()
  return (
    <div className="eo">
      <a href="#main" className="skip">
        Skip to content
      </a>
      <p className="eo-announce">
        Now taking reservations for <b>Fire Side Saturdays</b> — first hearth-side seating at 4:30 PM.{" "}
        <button onClick={() => go("reservations")}>Book a table</button> or call <a href={PHONE_HREF}>{PHONE}</a>.
      </p>
      <Header page={page} go={go} />
      <main id="main">
        {page === "home" && <Home go={go} />}
        {page === "menu" && <MenuPage go={go} />}
        {page === "reservations" && <Reservations go={go} />}
        {page === "private-dining" && <PrivateDining />}
        {page === "contact" && <Contact />}
      </main>
      <Footer go={go} />
      {page !== "reservations" && <StickyCta go={go} />}
    </div>
  )
}
