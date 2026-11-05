import { useMemo, useState, type CSSProperties, type ReactNode } from "react"
import "./fuoco.css"
import pastaImg from "../../assets/img/pasta.jpg"
import steakImg from "../../assets/img/steak.jpg"
import tavernImg from "../../assets/img/tavern.jpg"
import { Reveal, asset, longDate, nextDays, ref, rules, useForm, useSite } from "../../kit/site-kit"

const pasta = asset(pastaImg)
const steak = asset(steakImg)
const tavern = asset(tavernImg)

/**
 * FUOCO & FIGLI — High · Business · Restaurant Group
 * Three venues, one family. Routes each guest to the right room and sells
 * the private dining that pays the rent.
 */

type VenueId = "trattoria" | "brace" | "notte"
interface Venue {
  id: VenueId
  name: string
  kicker: string
  img: string
  alt: string
  tint: string
  blurb: string
  address: string
  hours: string
  seats: number
  rooms: { name: string; seated: number; standing: number }[]
  menu: { course: string; dishes: [string, string, number][] }[]
}

const VENUES: Venue[] = [
  {
    id: "trattoria",
    name: "Trattoria Fuoco",
    kicker: "The original · since 2009",
    img: pasta,
    alt: "Hand-rolled pasta with tomato and basil on a ceramic plate",
    tint: "#7A1E1E",
    blurb: "Nonna Lucia's room. Pasta rolled each morning at the front window, a wood oven, long tables and the noise that comes with them.",
    address: "214 Gertrude Street, Fitzroy",
    hours: "Lunch Fri – Sun · Dinner nightly from 5.30",
    seats: 86,
    rooms: [
      { name: "The long table", seated: 22, standing: 30 },
      { name: "Whole trattoria", seated: 86, standing: 120 },
    ],
    menu: [
      { course: "Antipasti", dishes: [["Burrata, blood orange, fennel pollen", "Shared", 24], ["Fritto misto of calamari and zucchini flowers", "", 26], ["Vitello tonnato, capers, celery leaf", "", 22]] },
      { course: "Primi", dishes: [["Tagliatelle al ragù — eight-hour, veal & pork", "Nonna's", 34], ["Cacio e pepe, tonnarelli, Pecorino Romano", "", 29], ["Pumpkin tortelli, burnt butter, amaretti", "V", 32]] },
      { course: "Secondi", dishes: [["Pollo al mattone, salsa verde", "", 39], ["Whole flounder, capers, brown butter", "", 46]] },
    ],
  },
  {
    id: "brace",
    name: "Brace",
    kicker: "Steak & fire · since 2016",
    img: steak,
    alt: "Sliced dry-aged steak over embers on a board",
    tint: "#4A2C1A",
    blurb: "Dry-aged Gippsland beef cooked over red gum embers. Smaller, darker, louder music — and the wine list Marco is proudest of.",
    address: "9 Kerr Street, Fitzroy",
    hours: "Dinner Tue – Sat from 5.30",
    seats: 54,
    rooms: [
      { name: "The cellar", seated: 14, standing: 20 },
      { name: "Whole restaurant", seated: 54, standing: 80 },
    ],
    menu: [
      { course: "To start", dishes: [["Beef-fat bread, smoked butter", "", 12], ["Steak tartare, egg yolk, crisp potato", "", 28]] },
      { course: "From the fire", dishes: [["Bistecca alla Fiorentina, 1kg, 40-day aged", "for two", 165], ["Scotch fillet, 350g, 28-day aged", "", 68], ["Lamb shoulder, anchovy, rosemary", "for two", 92]] },
      { course: "Sides", dishes: [["Potatoes in beef fat", "", 14], ["Charred radicchio, saba", "V", 14]] },
    ],
  },
  {
    id: "notte",
    name: "Osteria Notte",
    kicker: "Wine bar · since 2021",
    img: tavern,
    alt: "Candlelit wine bar with a timber bar and bottles on shelves",
    tint: "#2F3A2A",
    blurb: "Two hundred Italian bottles, forty by the glass, and small plates until midnight. Walk-ins only at the bar; tables can be booked.",
    address: "216 Gertrude Street, Fitzroy (next door)",
    hours: "Wed – Sun · 4pm until late",
    seats: 40,
    rooms: [
      { name: "The back room", seated: 18, standing: 30 },
      { name: "Whole bar", seated: 40, standing: 70 },
    ],
    menu: [
      { course: "Small plates", dishes: [["Olive all'ascolana", "", 14], ["Prosciutto di Parma, 24 months", "", 19], ["Anchovy toast, cultured butter", "", 12]] },
      { course: "By the glass", dishes: [["Etna Rosso, Benanti 2021", "150ml", 18], ["Lambrusco di Sorbara, Paltrinieri", "150ml", 15], ["Barolo, G.D. Vajra 2019", "150ml", 32]] },
    ],
  },
]

const EVENTS = [
  { d: 6, m: "Nov", title: "White truffle dinner", where: "Trattoria Fuoco", price: "$240 pp", note: "Five courses, Alba truffle shaved at the table." },
  { d: 13, m: "Nov", title: "Barolo vertical — 2013 to 2019", where: "Osteria Notte", price: "$180 pp", note: "Seven vintages, one producer, small plates." },
  { d: 22, m: "Nov", title: "Kids' pasta school", where: "Trattoria Fuoco", price: "$45 per child", note: "Saturday 10am. Aprons provided, lunch included." },
  { d: 4, m: "Dec", title: "Whole-beast dinner", where: "Brace", price: "$160 pp", note: "One Wagyu-cross steer, nose to tail, six courses." },
]

const ROLES = [
  { title: "Sous chef", venue: "brace" as VenueId, type: "Full time", pay: "$78k + super", note: "Run the fire section, cover the head chef two nights a week. Five years in a busy kitchen." },
  { title: "Pasta cook", venue: "trattoria" as VenueId, type: "Full time", pay: "$32/hr", note: "Mornings at the front window. We'll teach you Nonna's tortelli fold." },
  { title: "Sommelier", venue: "notte" as VenueId, type: "Full time", pay: "$72k + super", note: "Own the by-the-glass list. Certified Sommelier or equivalent experience." },
  { title: "Floor staff", venue: "trattoria" as VenueId, type: "Casual", pay: "$30 – $36/hr", note: "Weekends essential. RSA required." },
  { title: "Events coordinator", venue: "trattoria" as VenueId, type: "Part time", pay: "$70k pro rata", note: "Three days a week across all three venues. Private dining sales and on-the-night hosting." },
]

export default function Fuoco() {
  const { page, go } = useSite()
  const [venue, setVenue] = useState<VenueId>("trattoria")
  const open = (v: VenueId) => {
    setVenue(v)
    go("venues")
  }
  const today = useMemo(() => new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" }), [])
  const nav: [string, string][] = [
    ["venues", "Venues & menus"],
    ["events", "Private events"],
    ["careers", "Careers"],
  ]
  return (
    <div className="fuoco">
      <a href="#main" className="skip">
        Skip to content
      </a>
      <header className="f-mast">
        <div className="f-folio">
          <span>Vol. XVII · Fitzroy, Melbourne</span>
          <span>{today}</span>
          <span>Three rooms on Gertrude & Kerr</span>
        </div>
        <button className="f-title" onClick={() => go("home")} aria-label="Fuoco & Figli, home">
          Fuoco <i>&</i> Figli
        </button>
        <nav className="f-nav" aria-label="Main">
          {nav.map(([id, label]) => (
            <button key={id} className={page === id ? "on" : ""} onClick={() => go(id)} aria-current={page === id ? "page" : undefined}>
              {label}
            </button>
          ))}
          <button className="f-book" onClick={() => go("venues")}>
            Book a table
          </button>
        </nav>
      </header>

      <main id="main">
        {page === "home" && <Home onVenue={open} />}
        {page === "venues" && <Venues venue={venue} setVenue={setVenue} />}
        {page === "events" && <Events />}
        {page === "careers" && <Careers />}
      </main>

      <footer className="f-foot">
        <div className="f-foot-cols">
          {VENUES.map((v) => (
            <div key={v.id}>
              <h3>{v.name}</h3>
              <p>{v.address}</p>
              <p>{v.hours}</p>
            </div>
          ))}
          <div>
            <h3>The office</h3>
            <p>events@fuocoefigli.com.au</p>
            <p>(03) 9555 0142</p>
          </div>
        </div>
        <p className="f-colophon">Fuoco & Figli Hospitality Group · Demo business — Growth OS Business template · Testimonials and events are illustrative.</p>
      </footer>
    </div>
  )
}

/* ── home ────────────────────────────────────────────────────────── */

function Home({ onVenue }: { onVenue: (v: VenueId) => void }) {
  const { go } = useSite()
  const [tab, setTab] = useState<VenueId>("trattoria")
  const v = VENUES.find((x) => x.id === tab)!
  return (
    <>
      <section className="f-lead">
        <Reveal className="f-lead-copy">
          <p className="f-kicker">The family · since 2009</p>
          <h1>Three rooms, one family at the stove.</h1>
          <p className="f-drop">
            Lucia Fuoco opened a twelve-table trattoria on Gertrude Street with her sons Marco and Paolo. Fifteen years later there are three rooms within two hundred metres of each other — the trattoria for Sunday lunch, Brace for the fire, and Notte for the bottle after. Same family, same produce suppliers, one booking system.
          </p>
          <div className="f-lead-act">
            <button className="f-btn" onClick={() => go("venues")}>
              Choose a venue
            </button>
            <button className="f-link" onClick={() => go("events")}>
              Plan a private event →
            </button>
          </div>
        </Reveal>
        <Reveal className="f-lead-img" delay={120}>
          <img src={tavern} alt="Candlelit bar at Osteria Notte, two doors from the trattoria" width={1408} height={1008} />
          <p className="f-caption">Fig. 1 — Osteria Notte, two doors down from where it started.</p>
        </Reveal>
      </section>

      <section className="f-venues" aria-labelledby="ven-h" style={{ "--tint": v.tint } as CSSProperties}>
        <div className="f-sec-head">
          <h2 id="ven-h">The three rooms</h2>
          <div className="f-tabs" role="tablist" aria-label="Venues">
            {VENUES.map((x) => (
              <button key={x.id} role="tab" aria-selected={tab === x.id} className={tab === x.id ? "on" : ""} onClick={() => setTab(x.id)}>
                {x.name}
              </button>
            ))}
          </div>
        </div>
        <div className="f-venue" role="tabpanel" key={v.id}>
          <img src={v.img} alt={v.alt} />
          <div className="f-venue-copy">
            <p className="f-kicker">{v.kicker}</p>
            <h3>{v.name}</h3>
            <p>{v.blurb}</p>
            <dl>
              <dt>Where</dt>
              <dd>{v.address}</dd>
              <dt>When</dt>
              <dd>{v.hours}</dd>
              <dt>Seats</dt>
              <dd>{v.seats}</dd>
            </dl>
            <ul className="f-sig">
              {v.menu[0].dishes.concat(v.menu[1].dishes).slice(0, 3).map(([n, , p]) => (
                <li key={n}>
                  <span>{n}</span>
                  <b>${p}</b>
                </li>
              ))}
            </ul>
            <button className="f-btn" onClick={() => onVenue(v.id)}>
              Menu & booking — {v.name}
            </button>
          </div>
        </div>
      </section>

      <section className="f-cols">
        <Reveal as="article" className="f-col-events">
          <h2>This month at the table</h2>
          <ul>
            {EVENTS.map((e) => (
              <li key={e.title}>
                <span className="f-date">
                  <b>{e.d}</b>
                  {e.m}
                </span>
                <span>
                  <strong>{e.title}</strong>
                  <em>
                    {e.where} · {e.price}
                  </em>
                  <small>{e.note}</small>
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal as="article" className="f-col-private" delay={100}>
          <h2>Private dining</h2>
          <p>From fourteen in Brace's cellar to a hundred and twenty across the whole trattoria. Set menus from $85 a head, one coordinator from first email to last toast.</p>
          <table>
            <caption className="sr-only">Private rooms and capacity</caption>
            <thead>
              <tr>
                <th scope="col">Room</th>
                <th scope="col">Seated</th>
                <th scope="col">Standing</th>
              </tr>
            </thead>
            <tbody>
              {VENUES.flatMap((x) =>
                x.rooms.map((r) => (
                  <tr key={x.id + r.name}>
                    <th scope="row">
                      {r.name}
                      <small>{x.name}</small>
                    </th>
                    <td>{r.seated}</td>
                    <td>{r.standing}</td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
          <button className="f-btn" onClick={() => go("events")}>
            Start an event enquiry
          </button>
        </Reveal>
        <Reveal as="aside" className="f-col-quote" delay={200}>
          <blockquote>“We booked the long table for my father's eightieth. They remembered he can't have garlic — from a note in the enquiry six weeks earlier.”</blockquote>
          <p>
            Giulia R., private dining · <span className="f-demo">Demo testimonial</span>
          </p>
          <Gazzetta />
        </Reveal>
      </section>
    </>
  )
}

function Gazzetta() {
  const f = useForm({ email: "" }, { email: [rules.email()] })
  return (
    <form className="f-gazz" onSubmit={f.submit()} noValidate>
      <h3>La Gazzetta</h3>
      <p>One email a month: new menus, event releases before they sell out.</p>
      {f.status === "done" ? (
        <p className="f-ok" role="status">
          You're on the list — the next Gazzetta goes out on the first Monday.
        </p>
      ) : (
        <>
          <label htmlFor="f-email" className="sr-only">
            Email address
          </label>
          <div className="f-gazz-row">
            <input {...f.field("email")} type="email" placeholder="you@example.com" autoComplete="email" />
            <button type="submit">{f.status === "sending" ? "…" : "Subscribe"}</button>
          </div>
          {f.errors.email && (
            <p className="f-err" id="f-email-err">
              {f.errors.email}
            </p>
          )}
        </>
      )}
    </form>
  )
}

/* ── venues ──────────────────────────────────────────────────────── */

function Venues({ venue, setVenue }: { venue: VenueId; setVenue: (v: VenueId) => void }) {
  const v = VENUES.find((x) => x.id === venue)!
  return (
    <div className="f-page" style={{ "--tint": v.tint } as CSSProperties}>
      <div className="f-page-head">
        <p className="f-kicker">Venues & menus</p>
        <div className="f-tabs big" role="tablist" aria-label="Venues">
          {VENUES.map((x) => (
            <button key={x.id} role="tab" aria-selected={venue === x.id} className={venue === x.id ? "on" : ""} onClick={() => setVenue(x.id)}>
              {x.name}
            </button>
          ))}
        </div>
      </div>
      <section className="f-vhero">
        <img src={v.img} alt={v.alt} />
        <div>
          <p className="f-kicker">{v.kicker}</p>
          <h1>{v.name}</h1>
          <p>{v.blurb}</p>
          <p className="f-meta">
            {v.address}
            <br />
            {v.hours}
          </p>
        </div>
      </section>
      <section className="f-vbody">
        <div className="f-menu">
          <h2>Tonight's menu</h2>
          {v.menu.map((c) => (
            <div key={c.course} className="f-course">
              <h3>{c.course}</h3>
              <ul>
                {c.dishes.map(([n, note, p]) => (
                  <li key={n}>
                    <span>
                      {n}
                      {note && <em> · {note}</em>}
                    </span>
                    <b>{p}</b>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="f-small">Prices in AUD. 10% surcharge on public holidays. Tell us about allergies when you book.</p>
        </div>
        <BookingCard v={v} />
      </section>
    </div>
  )
}

function BookingCard({ v }: { v: Venue }) {
  const days = useMemo(() => nextDays(10, true), [])
  const [day, setDay] = useState(0)
  const [time, setTime] = useState("19:00")
  const [party, setParty] = useState("2")
  const f = useForm({ name: "", email: "" }, { name: [rules.required("A name for the booking, please.")], email: [rules.email()] })
  const [code] = useState(() => ref("FF"))
  if (f.status === "done")
    return (
      <aside className="f-bookcard" role="status">
        <p className="f-kicker">Booked · {code}</p>
        <h3>Table for {party} at {v.name}</h3>
        <p>
          {longDate(days[day])} at {time}. A confirmation is on its way to {f.values.email}. We hold tables for fifteen minutes.
        </p>
        <button className="f-link" onClick={f.reset}>
          Make another booking
        </button>
      </aside>
    )
  return (
    <form className="f-bookcard" onSubmit={f.submit()} noValidate key={v.id}>
      <p className="f-kicker">Book {v.name}</p>
      <div className="f-bk-row">
        <label>
          Date
          <select value={day} onChange={(e) => setDay(+e.target.value)}>
            {days.map((d, i) => (
              <option key={i} value={i}>
                {i === 0 ? "Today" : longDate(d)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Guests
          <select value={party} onChange={(e) => setParty(e.target.value)}>
            {["1", "2", "3", "4", "5", "6"].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
      </div>
      <fieldset className="f-times">
        <legend>Time</legend>
        {["17:30", "18:00", "18:45", "19:00", "19:30", "20:15", "20:45", "21:15"].map((t, i) => (
          <button type="button" key={t} disabled={(i + day + v.seats) % 5 === 0} className={time === t ? "on" : ""} onClick={() => setTime(t)}>
            {t}
          </button>
        ))}
      </fieldset>
      <label htmlFor="f-name">Name</label>
      <input {...f.field("name")} autoComplete="name" />
      {f.errors.name && (
        <p className="f-err" id="f-name-err">
          {f.errors.name}
        </p>
      )}
      <label htmlFor="f-email">Email</label>
      <input {...f.field("email")} type="email" autoComplete="email" />
      {f.errors.email && (
        <p className="f-err" id="f-email-err">
          {f.errors.email}
        </p>
      )}
      <button className="f-btn full" type="submit">
        {f.status === "sending" ? "Checking the book…" : `Book for ${party} at ${time}`}
      </button>
      <p className="f-small">Groups of 7+ — use the private events enquiry.</p>
    </form>
  )
}

/* ── events: 3-step intake with live capacity matching ───────────── */

const OCCASIONS = ["Birthday", "Wedding or engagement", "Corporate dinner", "Wake or memorial", "Something else"]
const MENUS = [
  { id: "famiglia", name: "Famiglia", pp: 85, note: "Shared antipasti, two pastas, one secondo, dessert." },
  { id: "festa", name: "Festa", pp: 120, note: "Adds a second secondo, cheese, and canapés on arrival." },
  { id: "fuoco", name: "Tutto Fuoco", pp: 165, note: "Chef's tasting across all three kitchens, with matched wines on request." },
]

function Events() {
  const [step, setStep] = useState(0)
  const [occasion, setOccasion] = useState(OCCASIONS[0])
  const [guests, setGuests] = useState(24)
  const [style, setStyle] = useState<"seated" | "standing">("seated")
  const [room, setRoom] = useState<string | null>(null)
  const [menu, setMenu] = useState("festa")
  const [wine, setWine] = useState(true)
  const [code] = useState(() => ref("EVT"))
  const f = useForm(
    { name: "", email: "", phone: "", date: "", notes: "" },
    { name: [rules.required()], email: [rules.email()], phone: [rules.phone()], date: [rules.required("Roughly when? A month is fine.")] },
  )
  const rooms = VENUES.flatMap((v) => v.rooms.map((r) => ({ key: `${v.id}:${r.name}`, venue: v.name, ...r, cap: style === "seated" ? r.seated : r.standing })))
  const fits = rooms.filter((r) => r.cap >= guests).sort((a, b) => a.cap - b.cap)
  const m = MENUS.find((x) => x.id === menu)!
  const estimate = guests * (m.pp + (wine ? 55 : 0))
  const steps = ["Occasion & size", "Room & menu", "Your details"]

  if (f.status === "done")
    return (
      <div className="f-page">
        <section className="f-done" role="status">
          <p className="f-kicker">Enquiry received · {code}</p>
          <h1>Grazie — Sofia will be in touch.</h1>
          <p>
            Our events coordinator replies within one working day with a written proposal for your {occasion.toLowerCase()} for {guests} at <b>{rooms.find((r) => r.key === room)?.name ?? "the best-fitting room"}</b>. Nothing is held or charged until you confirm.
          </p>
          <p className="f-meta">
            Estimated: ${estimate.toLocaleString()} ({m.name} menu{wine ? " with wine" : ""}, before service)
          </p>
        </section>
      </div>
    )

  return (
    <div className="f-page">
      <div className="f-page-head">
        <p className="f-kicker">Private events</p>
        <h1 className="f-ph">Tell us about the occasion.</h1>
        <ol className="f-steps">
          {steps.map((s, i) => (
            <li key={s} className={i === step ? "on" : i < step ? "done" : ""} aria-current={i === step ? "step" : undefined}>
              <span>{["I", "II", "III"][i]}</span> {s}
            </li>
          ))}
        </ol>
      </div>
      <section className="f-intake">
        <div className="f-intake-main">
          {step === 0 && (
            <>
              <fieldset className="f-chips">
                <legend>What's the occasion?</legend>
                {OCCASIONS.map((o) => (
                  <button type="button" key={o} className={occasion === o ? "on" : ""} onClick={() => setOccasion(o)} aria-pressed={occasion === o}>
                    {o}
                  </button>
                ))}
              </fieldset>
              <fieldset className="f-range">
                <legend>
                  How many guests? <b>{guests}</b>
                </legend>
                <input type="range" min={8} max={120} value={guests} onChange={(e) => setGuests(+e.target.value)} aria-label="Number of guests" />
                <div className="f-chips small">
                  {(["seated", "standing"] as const).map((s) => (
                    <button type="button" key={s} className={style === s ? "on" : ""} onClick={() => setStyle(s)} aria-pressed={style === s}>
                      {s === "seated" ? "Seated dinner" : "Standing / canapés"}
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className="f-stepnav">
                <span />
                <button
                  className="f-btn"
                  onClick={() => {
                    setRoom(fits[0]?.key ?? null)
                    setStep(1)
                  }}
                >
                  See rooms that fit {guests}
                </button>
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <fieldset className="f-rooms">
                <legend>
                  {fits.length} {fits.length === 1 ? "room fits" : "rooms fit"} {guests} {style}
                </legend>
                {fits.length === 0 && <p className="f-small">Over 120 standing, we take over two venues — choose any room and we'll design it with you.</p>}
                {(fits.length ? fits : rooms).map((r) => (
                  <button type="button" key={r.key} className={room === r.key ? "on" : ""} onClick={() => setRoom(r.key)} aria-pressed={room === r.key}>
                    <b>{r.name}</b>
                    <span>{r.venue}</span>
                    <em>
                      up to {r.cap} {style}
                    </em>
                  </button>
                ))}
              </fieldset>
              <fieldset className="f-menus">
                <legend>Menu</legend>
                {MENUS.map((x) => (
                  <button type="button" key={x.id} className={menu === x.id ? "on" : ""} onClick={() => setMenu(x.id)} aria-pressed={menu === x.id}>
                    <b>
                      {x.name} <span>${x.pp} pp</span>
                    </b>
                    <small>{x.note}</small>
                  </button>
                ))}
                <label className="f-check">
                  <input type="checkbox" checked={wine} onChange={(e) => setWine(e.target.checked)} /> Add matched wines and soft drinks (+$55 pp)
                </label>
              </fieldset>
              <div className="f-stepnav">
                <button className="f-link" onClick={() => setStep(0)}>
                  ← Back
                </button>
                <button className="f-btn" disabled={!room} onClick={() => setStep(2)}>
                  Continue
                </button>
              </div>
            </>
          )}
          {step === 2 && (
            <form onSubmit={f.submit()} noValidate>
              <div className="f-fields">
                <Fld label="Your name" id="name" err={f.errors.name}>
                  <input {...f.field("name")} autoComplete="name" />
                </Fld>
                <Fld label="Email" id="email" err={f.errors.email}>
                  <input {...f.field("email")} type="email" autoComplete="email" />
                </Fld>
                <Fld label="Phone" id="phone" err={f.errors.phone}>
                  <input {...f.field("phone")} type="tel" autoComplete="tel" />
                </Fld>
                <Fld label="Preferred date" id="date" err={f.errors.date}>
                  <input {...f.field("date")} placeholder="e.g. a Saturday in March" />
                </Fld>
                <Fld label="Anything we should know?" id="notes" wide>
                  <textarea {...f.field("notes")} rows={4} placeholder="Dietary needs, speeches, a surprise, accessibility…" />
                </Fld>
              </div>
              <div className="f-stepnav">
                <button type="button" className="f-link" onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button className="f-btn" type="submit">
                  {f.status === "sending" ? "Sending…" : "Send enquiry"}
                </button>
              </div>
            </form>
          )}
        </div>
        <aside className="f-estimate" aria-live="polite">
          <p className="f-kicker">Your estimate</p>
          <p className="f-big">${estimate.toLocaleString()}</p>
          <dl>
            <dt>Occasion</dt>
            <dd>{occasion}</dd>
            <dt>Guests</dt>
            <dd>
              {guests} {style}
            </dd>
            <dt>Room</dt>
            <dd>{rooms.find((r) => r.key === room)?.name ?? "—"}</dd>
            <dt>Menu</dt>
            <dd>
              {m.name} · ${m.pp} pp
            </dd>
            <dt>Wine</dt>
            <dd>{wine ? "+$55 pp" : "Not included"}</dd>
          </dl>
          <p className="f-small">Before 10% service. Room hire is waived above the minimum spend.</p>
        </aside>
      </section>
    </div>
  )
}

function Fld({ label, id, err, wide, children }: { label: string; id: string; err?: string; wide?: boolean; children: ReactNode }) {
  return (
    <div className={`f-fld ${wide ? "wide" : ""} ${err ? "bad" : ""}`}>
      <label htmlFor={`f-${id}`}>{label}</label>
      {children}
      {err && (
        <p className="f-err" id={`f-${id}-err`}>
          {err}
        </p>
      )}
    </div>
  )
}

/* ── careers ─────────────────────────────────────────────────────── */

function Careers() {
  const [venue, setVenue] = useState<VenueId | "all">("all")
  const [openRole, setOpenRole] = useState<string | null>(null)
  const list = ROLES.filter((r) => venue === "all" || r.venue === venue)
  return (
    <div className="f-page">
      <div className="f-page-head">
        <p className="f-kicker">Careers · {ROLES.length} open roles</p>
        <h1 className="f-ph">Come and cook with the family.</h1>
        <p className="f-sub">Four-day weeks for full-time kitchen staff, family meal every shift, and paid training at our suppliers' farms each autumn.</p>
        <div className="f-tabs" role="tablist" aria-label="Filter by venue">
          {[["all", "All venues"] as const, ...VENUES.map((v) => [v.id, v.name] as const)].map(([id, label]) => (
            <button key={id} role="tab" aria-selected={venue === id} className={venue === id ? "on" : ""} onClick={() => setVenue(id)}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <ul className="f-roles">
        {list.map((r) => (
          <li key={r.title}>
            <button className="f-role-row" aria-expanded={openRole === r.title} onClick={() => setOpenRole(openRole === r.title ? null : r.title)}>
              <b>{r.title}</b>
              <span>{VENUES.find((v) => v.id === r.venue)!.name}</span>
              <span>{r.type}</span>
              <span>{r.pay}</span>
              <i aria-hidden>{openRole === r.title ? "–" : "+"}</i>
            </button>
            {openRole === r.title && <Apply role={r.title} note={r.note} />}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Apply({ role, note }: { role: string; note: string }) {
  const f = useForm({ name: "", email: "", exp: "" }, { name: [rules.required()], email: [rules.email()], exp: [rules.min(20, "Two or three lines about where you've worked, please.")] })
  if (f.status === "done")
    return (
      <p className="f-ok f-apply" role="status">
        Thanks, {f.values.name.split(" ")[0]} — your application for {role} is with the head of that venue. We reply to everyone within a week.
      </p>
    )
  return (
    <form className="f-apply" onSubmit={f.submit()} noValidate>
      <p>{note}</p>
      <div className="f-fields">
        <Fld label="Name" id="name" err={f.errors.name}>
          <input {...f.field("name")} />
        </Fld>
        <Fld label="Email" id="email" err={f.errors.email}>
          <input {...f.field("email")} type="email" />
        </Fld>
        <Fld label="Your experience" id="exp" err={f.errors.exp} wide>
          <textarea {...f.field("exp")} rows={3} />
        </Fld>
      </div>
      <button className="f-btn" type="submit">
        {f.status === "sending" ? "Sending…" : `Apply for ${role}`}
      </button>
    </form>
  )
}
