import { useMemo, useState } from "react"
import "./rowan-vale.css"
import { dateSeed, dayNum, dayShort, longDate, monthShort, nextDays, ref, rules, seeded, useForm, useSite } from "@/sites/kit/site-kit"

/**
 * ROWAN & VALE — Mid · Growth · Independent Estate Agency
 * Two offices, one ledger of streets. Search our own listings, price your
 * home in ten seconds, book the viewing — no portal required.
 */

const PHONE = "0161 555 0421"
const TEL = PHONE.replace(/\s/g, "")
const OFFICES = ["Chorlton — 517 Barlow Moor Road", "West Didsbury — 21 Lapwing Lane"]

type Kind = "flat" | "terrace" | "semi" | "detached"
const KIND_LABEL: Record<Kind, string> = { flat: "Flat", terrace: "Terrace", semi: "Semi-detached", detached: "Detached" }

const LISTINGS: { id: string; addr: string; area: string; kind: Kind; beds: number; price: number; tenure: string; blurb: string }[] = [
  { id: "rv1", addr: "Flat 2, 14 Beech Road", area: "Beech Road", kind: "flat", beds: 1, price: 172500, tenure: "Leasehold · 118 yrs", blurb: "Over the deli, west-facing balcony, share of freehold in the works." },
  { id: "rv2", addr: "7 Chorlton Green", area: "The Green", kind: "flat", beds: 2, price: 215000, tenure: "Leasehold · 96 yrs", blurb: "Corner of the Green itself; converted warehouse, triple windows." },
  { id: "rv3", addr: "38 Manchester Road", area: "Manchester Road", kind: "terrace", beds: 2, price: 265000, tenure: "Freehold", blurb: "Two reception rooms, yard re-flagged last spring, Hodgson school catchment." },
  { id: "rv4", addr: "12 Sandy Lane", area: "Whalley Range side", kind: "semi", beds: 2, price: 299950, tenure: "Freehold", blurb: "Bay-fronted semi off Sandy Lane; loft already boarded." },
  { id: "rv5", addr: "3 Ilex Gardens", area: "Ilex Gardens", kind: "terrace", beds: 3, price: 345000, tenure: "Freehold", blurb: "The quieter end of the Gardens — south garden, original coving." },
  { id: "rv6", addr: "21 Claude Road", area: "Martledge", kind: "semi", beds: 3, price: 425000, tenure: "Freehold", blurb: "Drive for two, kitchen-diner opened into the rear, sold with plans passed." },
  { id: "rv7", addr: "9 Nicholson Street", area: "Barlow Moor", kind: "terrace", beds: 4, price: 512500, tenure: "Freehold", blurb: "Four over three with a cellar; five minutes' walk to the Met." },
  { id: "rv8", addr: "The Grange, Chorltonville", area: "Chorltonville", kind: "detached", beds: 4, price: 675000, tenure: "Freehold", blurb: "Detached on the village loop, double garage, walled garden with the original well." },
]

const NEGOTIATORS = [
  { name: "Maya Okonkwo", role: "Partner · Chorlton office", patch: "Sells Beech Road to the Green", sold: 41 },
  { name: "Tom Bradshaw", role: "Partner · West Didsbury office", patch: "First-timers and the flat market", sold: 33 },
  { name: "Priya Nandra", role: "Senior negotiator", patch: "Accompanied viewings and chains", sold: 28 },
]

const AREAS = [
  { id: "beech", name: "Beech Road & the centre", base: 240000, per: 55000 },
  { id: "mcr", name: "Manchester Road corridor", base: 230000, per: 45000 },
  { id: "barlow", name: "Barlow Moor & Martledge", base: 270000, per: 60000 },
  { id: "wilbraham", name: "Whalley Range fringe", base: 210000, per: 40000 },
  { id: "ville", name: "Chorltonville", base: 450000, per: 95000 },
]
const CONDITION = [
  { id: "tired", name: "Tired", note: "Needs the works", mult: 0.9 },
  { id: "lived", name: "Lived-in", note: "Sound, slightly dated", mult: 1 },
  { id: "turnkey", name: "Turn-key", note: "Nothing to spend", mult: 1.09 },
] as const

const SLOTS = ["9:00", "11:00", "13:00", "15:00", "17:00"]

const gbp = (n: number) => `£${n.toLocaleString("en-GB")}`

/* deterministic slot availability: same date + slot → same answer, every reload */
const slotFree = (d: Date, slot: string) => {
  const r = seeded(dateSeed(d) * 17 + SLOTS.indexOf(slot) * 977)
  return r() > 0.3
}

/* SVG house glyphs, one drawing per kind */
function Glyph({ kind, size = 54 }: { kind: Kind; size?: number }) {
  return (
    <svg viewBox="0 0 60 46" width={size} height={(size * 46) / 60} aria-hidden className="rv-glyph">
      {kind === "flat" && (
        <>
          <rect x="16" y="6" width="28" height="34" rx="1" fill="none" stroke="currentColor" strokeWidth="2" />
          <line x1="16" y1="23" x2="44" y2="23" stroke="currentColor" strokeWidth="1.4" />
          <rect x="22" y="11" width="6" height="6" fill="currentColor" opacity=".5" />
          <rect x="32" y="11" width="6" height="6" fill="currentColor" opacity=".5" />
          <rect x="22" y="29" width="6" height="6" fill="currentColor" opacity=".5" />
          <rect x="32" y="29" width="6" height="6" fill="currentColor" opacity=".5" />
        </>
      )}
      {kind === "terrace" && (
        <>
          <path d="M8 40 V22 L16 14 L24 22 V40 M24 40 V22 L32 14 L40 22 V40 M40 40 V22 L48 14 L56 22 V40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <rect x="12" y="28" width="5" height="7" fill="currentColor" opacity=".5" />
          <rect x="28" y="28" width="5" height="7" fill="currentColor" opacity=".5" />
          <rect x="44" y="28" width="5" height="7" fill="currentColor" opacity=".5" />
          <path d="M16 14 v-6 M32 14 v-6 M48 14 v-6" stroke="currentColor" strokeWidth="1.6" />
        </>
      )}
      {kind === "semi" && (
        <>
          <path d="M10 40 V20 L22 10 L34 20 V40 M34 20 L46 12 L58 20 V40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <rect x="16" y="26" width="6" height="8" fill="currentColor" opacity=".5" />
          <rect x="44" y="26" width="6" height="8" fill="currentColor" opacity=".5" />
          <path d="M24 40 v-8 h8 v8" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </>
      )}
      {kind === "detached" && (
        <>
          <path d="M17 40 V18 L30 7 L43 18 V40 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M24 40 v-9 h8 v9 M30 7 v-5" stroke="currentColor" strokeWidth="1.6" fill="none" />
          <rect x="26" y="21" width="7" height="5" fill="currentColor" opacity=".5" />
          <path d="M52 40 c0-7 -6-8 -6-13 c0-3 3-5 5-5 c2 0 4 2 4 4 c0 5 -3 6 -3 14" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </>
      )}
    </svg>
  )
}

export default function RowanVale() {
  const { page, go } = useSite()
  const [picked, setPicked] = useState<string | null>(null)
  const book = (id: string) => {
    setPicked(id)
    go("viewing")
  }

  return (
    <div className="rv">
      <a href="#main" className="skip">
        Skip to content
      </a>
      <header className="rv-head">
        <button className="rv-logo" onClick={() => go("home")} aria-label="Rowan & Vale, home">
          <svg viewBox="0 0 40 40" width="34" height="34" aria-hidden>
            <path d="M20 4 L34 16 V34 H24 V24 H16 V34 H6 V16 Z" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinejoin="round" />
            <path d="M20 4 V16 M20 16 L34 16" stroke="var(--accent)" strokeWidth="1.2" />
          </svg>
          <span>
            Rowan <i>&</i> Vale
            <small>Estate agency · Chorlton</small>
          </span>
        </button>
        <nav aria-label="Main">
          {(
            [
              ["home", "Home"],
              ["listings", "Listings"],
              ["sell", "Sell or let"],
            ] as const
          ).map(([id, l]) => (
            <button key={id} className={page === id ? "on" : ""} onClick={() => go(id)} aria-current={page === id ? "page" : undefined}>
              {l}
            </button>
          ))}
        </nav>
        <div className="rv-head-act">
          <a href={`tel:${TEL}`} className="rv-tel">
            {PHONE}
          </a>
          <button className="rv-btn" onClick={() => go("viewing")}>
            Book a viewing
          </button>
        </div>
      </header>

      <main id="main">
        {page === "home" && <Home book={book} />}
        {page === "listings" && <Listings book={book} />}
        {page === "viewing" && <Viewing picked={picked} setPicked={setPicked} />}
        {page === "sell" && <Sell />}
      </main>

      <footer className="rv-foot">
        <div>
          <p className="rv-foot-logo">Rowan &amp; Vale</p>
          <p>Two offices: 517 Barlow Moor Road, Chorlton M21 8BQ · 21 Lapwing Lane, West Didsbury M20 6BP</p>
        </div>
        <div>
          <p>{PHONE} · hello@rowanvale.co.uk</p>
          <p>Sole agency 1.25% + VAT, no sale no fee · Member of Propertymark &amp; The Property Ombudsman</p>
        </div>
        <p className="rv-foot-small">Demo business — Growth OS Growth template.</p>
      </footer>

      {page !== "viewing" && (
        <div className="rv-sticky">
          <span>{page === "sell" ? "Get a valuation band in ten seconds" : `${LISTINGS.length} homes on our books today`}</span>
          <button className="rv-btn" onClick={() => go(page === "sell" ? "sell" : "viewing")}>
            {page === "sell" ? "Value my home →" : "Book a viewing →"}
          </button>
        </div>
      )}
    </div>
  )
}

/* ── home ─────────────────────────────────────────────────────────── */

function Home({ book }: { book: (id: string) => void }) {
  const { go } = useSite()
  const latest = LISTINGS.slice(-3).reverse()
  return (
    <>
      <section className="rv-hero">
        <div className="rv-hero-copy">
          <p className="rv-kicker">Independent · M21 since 2009 · two offices, 600 metres apart</p>
          <h1>
            Two offices that know every <em>street by name.</em>
          </h1>
          <p className="rv-lede">
            Rowan &amp; Vale sells Chorlton from Chorlton — no call centre, no portal queue. Search our own ledger of homes, get a valuation band before you pick up the phone, and book a viewing with the negotiator who'll actually walk you round.
          </p>
          <div className="rv-hero-act">
            <button className="rv-btn big" onClick={() => go("listings")}>
              Search {LISTINGS.length} homes
            </button>
            <button className="rv-ghost" onClick={() => go("sell")}>
              Get an instant valuation →
            </button>
          </div>
        </div>
        <aside className="rv-count" aria-live="polite">
          <p className="rv-count-num">{LISTINGS.length}</p>
          <p className="rv-count-label">homes on our books today — updated as boards go up</p>
          <ul className="rv-latest">
            {latest.map((l) => (
              <li key={l.id}>
                <Glyph kind={l.kind} size={34} />
                <div>
                  <b>{l.addr}</b>
                  <span>
                    {l.beds} bed {KIND_LABEL[l.kind].toLowerCase()} · {gbp(l.price)}
                  </span>
                </div>
                <button onClick={() => book(l.id)} aria-label={`Book a viewing at ${l.addr}`}>
                  View →
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="rv-strip" aria-label="Our results on our patch">
        {[
          ["38", "days, average to an accepted offer"],
          ["98.6%", "of the asking price we quoted"],
          ["71", "homes sold across M21 and the M20 edge"],
          ["2", "offices, both on the high street"],
        ].map(([n, l]) => (
          <div key={l}>
            <b>{n}</b>
            <span>{l}</span>
          </div>
        ))}
      </section>
      <p className="rv-strip-note">
        Honest numbers: last 12 months, our patch only — we don't count sales by other agents, and we won't quote you a figure we haven't hit ourselves.
      </p>

      <section className="rv-agents" aria-labelledby="team-h">
        <div className="rv-sec-head">
          <h2 id="team-h">The three you'll meet</h2>
          <p>Every viewing is accompanied — by one of us, not a key-collection relay.</p>
        </div>
        <div className="rv-agent-row">
          {NEGOTIATORS.map((n) => (
            <article key={n.name} className="rv-agent">
              <svg viewBox="0 0 64 64" width="64" height="64" aria-hidden className="rv-mono-mark">
                <circle cx="32" cy="32" r="30" fill="color-mix(in srgb, var(--primary) 10%, transparent)" stroke="var(--line)" />
                <text x="32" y="41" textAnchor="middle" fontSize="26" fill="var(--primary)" fontFamily="var(--display)">
                  {n.name.split(" ").map((w) => w[0]).join("")}
                </text>
              </svg>
              <h3>{n.name}</h3>
              <p className="rv-agent-role">{n.role}</p>
              <p>{n.patch}</p>
              <p className="rv-agent-sold">
                <b>{n.sold}</b> solds last year
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="rv-process" aria-labelledby="how-h">
        <div className="rv-sec-head">
          <h2 id="how-h">Instruct to keys, in five marks</h2>
          <p>The same five steps on every sale, printed on your agreement on day one.</p>
        </div>
        <ol className="rv-timeline">
          {[
            ["Instruct", "One visit, one fee (1.25% + VAT), no sale no fee. EPC and floorplan ordered the same day."],
            ["Photos", "Wednesday after instruct: our photographer, dusk shots for the front, no fish-eye tricks."],
            ["Live", "On our ledger and the portals within 48 hours, priced against what actually sold on your street."],
            ["Offers", "Every offer in writing, every one put to you same-day — with the buyer's chain and proof of funds."],
            ["Keys", "Progression chased weekly by name, not by ticket number. The average runs nine weeks to move."],
          ].map(([h, p], i) => (
            <li key={h}>
              <span aria-hidden>0{i + 1}</span>
              <h3>{h}</h3>
              <p>{p}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="rv-faq" aria-labelledby="faq-h">
        <div className="rv-sec-head">
          <h2 id="faq-h">Ask us anything</h2>
          <p>The five questions that come up at the counter on Beech Road.</p>
        </div>
        <div className="rv-faq-list">
          {[
            ["Do I need to register to view?", "No. Book on this site or ring the office — we accompany every viewing ourselves, so you'll meet a person, not a lockbox. Bring ID once, then it's on file."],
            ["What exactly do you charge?", "1.25% + VAT sole agency, no sale no fee, no marketing extras. The fee is printed on the front page of the agreement — ask for a copy before you instruct anyone, including us."],
            ["How fast do homes sell?", "Thirty-eight days, average, to an accepted offer over the last twelve months — on the homes we priced correctly from day one. Overpriced ones sit, and we'll tell you when that's happening."],
            ["Do you handle lettings too?", "Sixty managed homes across M21 and the M16 edge — 8% management, rent collection and compliance included, tenants referenced in-house."],
            ["What is an instant valuation?", "A price band from our own sold data for your street and house type. The real one takes twenty minutes at your kitchen table — we measure, we look at light, we check what the surveyor will flag."],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  )
}

/* ── listings ─────────────────────────────────────────────────────── */

function Listings({ book }: { book: (id: string) => void }) {
  const [beds, setBeds] = useState("any")
  const [band, setBand] = useState("any")
  const [type, setType] = useState("any")
  const shown = useMemo(
    () =>
      LISTINGS.filter((l) => {
        if (beds !== "any" && !(beds === "4+" ? l.beds >= 4 : l.beds === +beds)) return false
        if (type !== "any" && (type === "houses" ? l.kind === "flat" : l.kind !== "flat")) return false
        if (band !== "any") {
          const [lo, hi] = band === "a" ? [0, 200000] : band === "b" ? [200000, 350000] : band === "c" ? [350000, 550000] : [550000, Infinity]
          if (l.price < lo || l.price >= hi) return false
        }
        return true
      }),
    [beds, band, type],
  )

  const GROUPS: [string, string, string, (v: string) => void, [string, string][]][] = [
    ["Beds", "beds", beds, setBeds, [["any", "Any"], ["1", "1"], ["2", "2"], ["3", "3"], ["4+", "4+"]]],
    ["Budget", "band", band, setBand, [["any", "Any"], ["a", "Under £200k"], ["b", "£200–350k"], ["c", "£350–550k"], ["d", "£550k+"]]],
    ["Type", "type", type, setType, [["any", "Any"], ["houses", "Houses"], ["flats", "Flats"]]],
  ]

  return (
    <section className="rv-page">
      <h1 className="rv-ph">The ledger</h1>
      <p className="rv-ph-sub">Every home on our books right now — {LISTINGS.length} in all. Filters work on our listings only; when one goes, the board comes down the same day.</p>

      <div className="rv-filters">
        {GROUPS.map(([label, id, value, set, opts]) => (
          <div className="rv-filter" key={id}>
            <p className="rv-filter-label" id={`fl-${id}`}>
              {label}
            </p>
            <div className="rv-chips" role="group" aria-labelledby={`fl-${id}`}>
              {opts.map(([v, l]) => (
                <button key={v} aria-pressed={value === v} className={value === v ? "on" : ""} onClick={() => set(v)}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        ))}
        <p className="rv-count-line" aria-live="polite">
          <b>{shown.length}</b> of {LISTINGS.length} homes
        </p>
      </div>

      <ul className="rv-grid">
        {shown.map((l) => (
          <li key={l.id} className="rv-card">
            <div className="rv-card-art">
              <Glyph kind={l.kind} size={92} />
              <span className="rv-card-kind">{KIND_LABEL[l.kind]}</span>
            </div>
            <div className="rv-card-body">
              <h3>{l.addr}</h3>
              <p className="rv-card-area">{l.area}</p>
              <p className="rv-card-blurb">{l.blurb}</p>
              <p className="rv-card-meta">
                {l.beds} bed · {l.tenure}
              </p>
              <p className="rv-card-price">{gbp(l.price)}</p>
              <div className="rv-card-act">
                <button className="rv-btn" onClick={() => book(l.id)}>
                  Book viewing
                </button>
                <a className="rv-ghost" href={`tel:${TEL}`}>
                  Ask about it
                </a>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {shown.length === 0 && (
        <p className="rv-empty">
          Nothing matches that combination today. Loosen a filter — or ring {PHONE} and tell us what you're after; off-market homes go first.
        </p>
      )}
    </section>
  )
}

/* ── viewing ──────────────────────────────────────────────────────── */

function Viewing({ picked, setPicked }: { picked: string | null; setPicked: (id: string | null) => void }) {
  const days = useMemo(() => nextDays(10), [])
  const home = LISTINGS.find((l) => l.id === picked) ?? LISTINGS[0]
  const [day, setDay] = useState<Date | null>(days[1])
  const [slot, setSlot] = useState<string | null>(null)
  const [code] = useState(() => ref("RV"))
  const f = useForm(
    { name: "", email: "", phone: "", notes: "" },
    { name: [rules.required("Who should the viewing be under?")], email: [rules.email()], phone: [rules.phone()], notes: [] },
  )
  /* deterministic negotiator: same day + slot → same person, every reload */
  const negotiator = useMemo(() => {
    if (!day || !slot) return null
    const r = seeded(dateSeed(day) * 13 + SLOTS.indexOf(slot) * 131)
    return NEGOTIATORS[Math.floor(r() * NEGOTIATORS.length)]
  }, [day, slot])

  if (f.status === "done" && day && slot && negotiator)
    return (
      <section className="rv-page rv-done" role="status">
        <p className="rv-kicker">Viewing booked · reference {code}</p>
        <h1 className="rv-ph">See you {longDate(day)}.</h1>
        <dl className="rv-done-dl">
          <div>
            <dt>Home</dt>
            <dd>{home.addr}</dd>
          </div>
          <div>
            <dt>Time</dt>
            <dd>
              {slot} — about 30 minutes, accompanied
            </dd>
          </div>
          <div>
            <dt>Your negotiator</dt>
            <dd>{negotiator.name} · {negotiator.role}</dd>
          </div>
          <div>
            <dt>Confirmation</dt>
            <dd>Sent to {f.values.email} — with the address, parking and {negotiator.name.split(" ")[0]}'s mobile for the morning of</dd>
          </div>
        </dl>
        <p className="rv-done-note">Bring photo ID once and we'll keep it on file. Running late? Ring the office and we'll hold the keys.</p>
      </section>
    )

  return (
    <section className="rv-page">
      <p className="rv-kicker">Accompanied viewings · every slot, every time</p>
      <h1 className="rv-ph">Book a viewing</h1>

      <fieldset className="rv-fs">
        <legend>Which home?</legend>
        <div className="rv-prop-chips">
          {LISTINGS.map((l) => (
            <button key={l.id} aria-pressed={home.id === l.id} className={home.id === l.id ? "on" : ""} onClick={() => (setPicked(l.id), setSlot(null))}>
              <Glyph kind={l.kind} size={26} />
              <span>{l.addr}</span>
              <b>{gbp(l.price)}</b>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="rv-fs">
        <legend>Which day?</legend>
        <div className="rv-dates">
          {days.map((d) => (
            <button key={d.toISOString()} aria-pressed={day?.toDateString() === d.toDateString()} className={day?.toDateString() === d.toDateString() ? "on" : ""} onClick={() => (setDay(d), setSlot(null))}>
              <small>{dayShort(d)}</small>
              <b>{dayNum(d)}</b>
              <small>{monthShort(d)}</small>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="rv-fs">
        <legend>Which time?</legend>
        <div className="rv-slots">
          {SLOTS.map((s, i) => {
            const free = day ? slotFree(day, s) : true
            return (
              <button key={s} disabled={!free} aria-pressed={slot === s} className={`${slot === s ? "on" : ""} ${!free ? "busy" : ""}`} onClick={() => setSlot(s)} aria-label={`${s}, ${free ? "available" : "already booked"}`}>
                <b>{s}</b>
                <small>{i < 2 ? "morning run" : i === 2 ? "lunchtime" : "afternoon run"}</small>
                <em>{free ? "available" : "booked"}</em>
              </button>
            )
          })}
        </div>
        <p className="rv-hint">Two viewing runs a day from each office. Booked slots clear as viewings move — the board below is live from the diary.</p>
      </fieldset>

      <form className="rv-fs rv-form" onSubmit={f.submit()} noValidate>
        <legend>Your details</legend>
        <div className="rv-fields">
          {(
            [
              ["name", "Name", "text", "name"],
              ["email", "Email", "email", "email"],
              ["phone", "Mobile", "tel", "tel"],
            ] as const
          ).map(([k, l, t, ac]) => (
            <div key={k} className={`rv-field ${f.errors[k] ? "bad" : ""}`}>
              <label htmlFor={`f-${k}`}>{l}</label>
              <input {...f.field(k)} type={t} autoComplete={ac} />
              {f.errors[k] && (
                <p className="rv-err" id={`f-${k}-err`}>
                  {f.errors[k]}
                </p>
              )}
            </div>
          ))}
          <div className={`rv-field ${f.errors.notes ? "bad" : ""}`}>
            <label htmlFor="f-notes">Anything we should know? <span>optional</span></label>
            <textarea {...f.field("notes")} rows={3} placeholder="Schools, parking, a second viewing with the in-laws…" />
            {f.errors.notes && (
              <p className="rv-err" id="f-notes-err">
                {f.errors.notes}
              </p>
            )}
          </div>
        </div>
        <button className="rv-btn big" type="submit">
          {f.status === "sending" ? "Booking…" : `Confirm viewing — ${slot ?? "pick a time"}`}
        </button>
      </form>
    </section>
  )
}

/* ── sell ─────────────────────────────────────────────────────────── */

function Sell() {
  const [area, setArea] = useState(AREAS[0].id)
  const [beds, setBeds] = useState(3)
  const [cond, setCond] = useState<string>("lived")
  const [step, setStep] = useState<"estimate" | "form">("estimate")
  const [code] = useState(() => ref("RV-V"))
  const a = AREAS.find((x) => x.id === area)!
  const c = CONDITION.find((x) => x.id === cond)!
  const mid = Math.round(((a.base + (beds - 2) * a.per) * c.mult) / 2500) * 2500
  const lo = Math.round((mid * 0.96) / 2500) * 2500
  const hi = Math.round((mid * 1.04) / 2500) * 2500
  const f = useForm(
    { name: "", email: "", phone: "", office: OFFICES[0], when: "As soon as" },
    {
      name: [rules.required("Who should the valuation visit be under?")],
      email: [rules.email()],
      phone: [rules.phone()],
      office: [rules.required("Pick the office that suits you.")],
      when: [rules.required("Pick a timeframe.")],
    },
  )

  if (f.status === "done")
    return (
      <section className="rv-page rv-done" role="status">
        <p className="rv-kicker">Valuation booked · reference {code}</p>
        <h1 className="rv-ph">We'll bring the printed comp.</h1>
        <p>
          {f.values.name.split(" ")[0]}, we'll meet you at the {f.values.office.includes("Chorlton") ? "Chorlton" : "West Didsbury"} office within two working days and walk the house with our sold-comparables for {a.name} — the ledger behind the {gbp(lo)}–{gbp(hi)} band, not just the band.
        </p>
        <dl className="rv-done-dl">
          <div>
            <dt>Contact</dt>
            <dd>{f.values.email} · {f.values.phone}</dd>
          </div>
          <div>
            <dt>Timing</dt>
            <dd>{f.values.when}</dd>
          </div>
        </dl>
      </section>
    )

  return (
    <section className="rv-page">
      <p className="rv-kicker">Instant valuation · from our own sold ledger · no email needed</p>
      <h1 className="rv-ph">What's your place worth?</h1>
      <div className="rv-va">
        <div className="rv-va-controls">
          <fieldset className="rv-fs">
            <legend>Where?</legend>
            <label htmlFor="f-area" className="sr-only">
              Area
            </label>
            <select id="f-area" className="rv-select" value={area} onChange={(e) => setArea(e.target.value)}>
              {AREAS.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
          </fieldset>
          <fieldset className="rv-fs">
            <legend>Bedrooms</legend>
            <div className="rv-stepper">
              <button onClick={() => setBeds(Math.max(1, beds - 1))} disabled={beds <= 1} aria-label="Fewer bedrooms">
                −
              </button>
              <output aria-live="polite">
                <b>{beds}</b> bed
              </output>
              <button onClick={() => setBeds(Math.min(6, beds + 1))} disabled={beds >= 6} aria-label="More bedrooms">
                +
              </button>
            </div>
          </fieldset>
          <fieldset className="rv-fs">
            <legend>Condition</legend>
            <div className="rv-conds" role="radiogroup" aria-label="Condition">
              {CONDITION.map((x) => (
                <label key={x.id} className={cond === x.id ? "on" : ""}>
                  <input type="radio" name="cond" value={x.id} checked={cond === x.id} onChange={() => setCond(x.id)} />
                  <b>{x.name}</b>
                  <span>{x.note}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        <aside className="rv-va-out" aria-live="polite">
          <p className="rv-va-label">Instant band</p>
          <p className="rv-va-price">
            {gbp(lo)}
            <i> – </i>
            {gbp(hi)}
          </p>
          <p className="rv-va-note">
            {beds}-bed in {a.name}, {c.name.toLowerCase()}. From our own solds over 24 months — a band, not a promise. Photos, light and what the surveyor will flag move the number, which is what the visit is for.
          </p>
          {step === "estimate" ? (
            <button className="rv-btn big" onClick={() => setStep("form")}>
              Book the 20-minute valuation visit
            </button>
          ) : (
            <p className="rv-va-note">Twenty minutes, printed comparables, no obligation — form's below.</p>
          )}
        </aside>
      </div>

      {step === "form" && (
        <form className="rv-va-form" onSubmit={f.submit()} noValidate>
          <fieldset className="rv-fs">
            <legend>Book the visit</legend>
            <div className="rv-fields">
              {(
                [
                  ["name", "Name", "text", "name"],
                  ["email", "Email", "email", "email"],
                  ["phone", "Mobile", "tel", "tel"],
                ] as const
              ).map(([k, l, t, ac]) => (
                <div key={k} className={`rv-field ${f.errors[k] ? "bad" : ""}`}>
                  <label htmlFor={`f-${k}`}>{l}</label>
                  <input {...f.field(k)} type={t} autoComplete={ac} />
                  {f.errors[k] && (
                    <p className="rv-err" id={`f-${k}-err`}>
                      {f.errors[k]}
                    </p>
                  )}
                </div>
              ))}
              <div className={`rv-field ${f.errors.office ? "bad" : ""}`}>
                <label htmlFor="f-office">Which office?</label>
                <select className="rv-select" {...f.field("office")}>
                  {OFFICES.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                {f.errors.office && (
                  <p className="rv-err" id="f-office-err">
                    {f.errors.office}
                  </p>
                )}
              </div>
              <div className={`rv-field ${f.errors.when ? "bad" : ""}`}>
                <label htmlFor="f-when">When are you thinking of selling?</label>
                <select className="rv-select" {...f.field("when")}>
                  {["As soon as", "Within 3 months", "This year", "Just curious"].map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
                {f.errors.when && (
                  <p className="rv-err" id="f-when-err">
                    {f.errors.when}
                  </p>
                )}
              </div>
            </div>
            <p className="rv-hint">
              Sole agency 1.25% + VAT, no sale no fee. We bring the comparables that made your band — and we'll tell you if the band is wrong while we're standing in the kitchen.
            </p>
            <button className="rv-btn big" type="submit">
              {f.status === "sending" ? "Booking…" : "Book my valuation visit"}
            </button>
          </fieldset>
        </form>
      )}
    </section>
  )
}
