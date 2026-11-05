import { useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent, type ReactNode } from "react"
import "./ember.css"
import room from "@/sites/assets/img/dining-room.jpg"
import scallop from "@/sites/assets/img/plated-dish.jpg"
import nordic from "@/sites/assets/img/nordic.jpg"
import plate from "@/sites/assets/img/plate.jpg"
import steak from "@/sites/assets/img/steak.jpg"
import { Reveal, dateSeed, dayNum, dayShort, longDate, monthShort, nextDays, ref, rules, seeded, TierBelow, TierGate, useForm, usePointerVars, useSite } from "@/sites/kit/site-kit"

/**
 * MAISON EMBER — Premium · Flagship · Dining Destination & Ordering
 * Twelve seats, one fire — plus a weekend box, gift evenings and a
 * members' circle. Every flow is live; every effect has a still fallback.
 */

const kr = (n: number) => `DKK ${n.toLocaleString("en-GB")}`
const MENU_PRICE = 1850
const DEPOSIT = 500

function seatsLeft(d: Date) {
  const wd = d.getDay()
  if (![0, 4, 5, 6].includes(wd)) return null // Thu–Sun
  const r = seeded(dateSeed(d) * 7)
  return Math.floor(r() * 9) // 0–8 of 12
}

const CHAPTERS = [
  { time: "19:00", title: "Arrival at the fire", img: room, alt: "The dining room lit by candles and the open hearth", text: "Twelve guests, one table facing the hearth. Birch has been burning since three; the first bite is cooked in front of you while the wine is poured." },
  { time: "19:40", title: "The raw and the cured", img: nordic, alt: "Cured fish and pickled vegetables on stoneware", text: "Juniper-cured trout, last summer's pickles, oysters from Limfjord. The cold half of the evening, everything touched by smoke but not by flame." },
  { time: "20:45", title: "The hearth", img: steak, alt: "Aged beef resting over glowing embers", text: "Dry-aged Jutland beef laid straight on the coals, scallops in their shells, bread baked in the ash. The room goes quiet here — it always does." },
  { time: "22:00", title: "The embers", img: plate, alt: "A small dessert plated on dark ceramic", text: "Birch syrup, burnt cream, sea buckthorn. Coffee by the fire, and the chef comes out to tell you where everything came from." },
]

const COURSES: { n: string; dish: string; detail: string; wine: string; juice: string; pesc?: string; gf?: boolean }[] = [
  { n: "I", dish: "Ember-roasted oyster", detail: "Limfjord oyster, brown butter, horseradish", wine: "Champagne, Bérêche Brut Réserve", juice: "Fermented gooseberry, elderflower", gf: true },
  { n: "II", dish: "Ash-baked bread", detail: "Øland wheat, cultured butter, smoked salt", wine: "—", juice: "—", gf: false },
  { n: "III", dish: "Juniper trout", detail: "Cured 36 hours, pickled rhubarb, dill oil", wine: "Riesling, Keller 'von der Fels' 2021", juice: "Rhubarb & green juniper", gf: true },
  { n: "IV", dish: "Scallop in the shell", detail: "Seared on coals, celeriac, brown-butter dashi", wine: "Chenin, Huet Le Haut-Lieu Sec 2020", juice: "Celeriac, apple, lovage", gf: true },
  { n: "V", dish: "Leeks & ember", detail: "Charred leek, hazelnut, aged Vesterhavsost", wine: "Jura Savagnin, Tissot 2019", juice: "Smoked pear, thyme", gf: true },
  { n: "VI", dish: "Langoustine", detail: "Kissed over juniper, its own bisque", wine: "Chablis 1er Cru, Raveneau 2019", juice: "Sea buckthorn, carrot", gf: true },
  { n: "VII", dish: "Pigeon", detail: "Hung ten days, beetroot, blackcurrant leaf", wine: "Pinot Noir, Ziereisen 2018", juice: "Blackcurrant leaf, beet", pesc: "Hake, mussel, beurre blanc", gf: true },
  { n: "VIII", dish: "Jutland beef", detail: "Aged 60 days, bone marrow, onion ash", wine: "Barolo, Burlotto 'Monvigliero' 2017", juice: "Cherry, birch, black pepper", pesc: "Turbot on the bone, onion ash", gf: true },
  { n: "IX", dish: "Fire-roasted potato", detail: "Smoked crème fraîche, trout roe", wine: "(continues)", juice: "(continues)", gf: true },
  { n: "X", dish: "Cheese from the fire", detail: "Melted Gamle Ole, malt crisp, pear", wine: "Vin Jaune, Macle 2014", juice: "Malt kvass", gf: false },
  { n: "XI", dish: "Burnt cream", detail: "Birch syrup, sea buckthorn, oat crumble", wine: "Tokaji 5 Puttonyos, Disznókő", juice: "Sea buckthorn, honey", gf: false },
  { n: "XII", dish: "By the fire", detail: "Coffee, ember-roasted chocolate, spruce fudge", wine: "Calvados, Dupont Hors d'Âge", juice: "Spruce tip infusion", gf: true },
]

const SHOP = [
  { id: "box", name: "The Ember box for two", note: "Six courses to finish at home over a grill or oven. Instructions card, playlist QR.", price: 1200 },
  { id: "bread", name: "Ash bread & smoked butter", note: "Loaf baked that morning, 200g butter.", price: 145 },
  { id: "trout", name: "Juniper-cured trout, 300g", note: "Keeps five days chilled.", price: 260 },
  { id: "tart", name: "Birch syrup tart", note: "Serves four. Bake for 8 minutes.", price: 190 },
  { id: "wine", name: "Wine pairing for two", note: "Three bottles chosen for the box.", price: 450 },
]

export default function Ember() {
  const { page, go, motion } = useSite()
  const glowRef = usePointerVars<HTMLDivElement>(motion >= 3)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40)
    on()
    window.addEventListener("scroll", on, { passive: true })
    return () => window.removeEventListener("scroll", on)
  }, [])
  const nav: [string, string][] = [
    ["menu", "The menu"],
    ["order", "Ember at home"],
    ["circle", "The Circle"],
  ]
  return (
    <div className={`ember ${motion >= 3 ? "lit" : ""}`} ref={glowRef}>
      <a href="#main" className="skip">
        Skip to content
      </a>
      {motion >= 3 && <div className="e-glow" aria-hidden />}
      <header className={`e-head ${scrolled || page !== "home" ? "solid" : ""}`}>
        <button className="e-logo" onClick={() => go("home")} aria-label="Maison Ember, home">
          Maison <span>Ember</span>
        </button>
        <nav aria-label="Main">
          {nav.map(([id, l]) => (
            <button key={id} className={page === id ? "on" : ""} onClick={() => go(id)} aria-current={page === id ? "page" : undefined}>
              {l}
            </button>
          ))}
        </nav>
        <button className="e-cta" onClick={() => go("reserve")}>
          Reserve
        </button>
      </header>
      <main id="main">
        {page === "home" && <Home />}
        {page === "menu" && <Menu />}
        {page === "reserve" && <Reserve />}
        {page === "order" && <Order />}
        {page === "circle" && <Circle />}
      </main>
      <footer className="e-foot">
        <p className="e-foot-mark">
          Maison <span>Ember</span>
        </p>
        <div>
          <p>Istedgade 118, 1650 København V</p>
          <p>Thursday – Sunday · one sitting at 19:00</p>
        </div>
        <div>
          <p>table@maisonember.dk</p>
          <p>+45 33 55 01 87</p>
        </div>
        <p className="e-small">Demo business — Growth OS Flagship template. Press and guest quotes are illustrative.</p>
      </footer>
    </div>
  )
}

/* ── home ────────────────────────────────────────────────────────── */

function Home() {
  const { go, motion } = useSite()
  const next = useMemo(() => nextDays(21, true).find((d) => (seatsLeft(d) ?? 0) > 0), [])
  return (
    <>
      <section className="e-hero">
        <img src={room.src} alt="The Maison Ember dining room at night, lit by the hearth" className="e-hero-img" />
        <div className="e-hero-copy">
          <p className="e-eyebrow">Vesterbro · Copenhagen · since 2019</p>
          <h1>
            Twelve seats,
            <br />
            <em>one fire.</em>
          </h1>
          <p>A twelve-course evening cooked entirely over birch and juniper embers. Thursday to Sunday, one sitting, one table.</p>
          <div className="e-hero-act">
            <Magnetic onClick={() => go("reserve")}>Reserve a seat</Magnetic>
            <TierGate need="premium">
              {next && (
                <span className="e-next">
                  <i aria-hidden /> Next available · {dayShort(next)} {dayNum(next)} {monthShort(next)} — {seatsLeft(next)} seats
                </span>
              )}
            </TierGate>
          </div>
        </div>
        <p className="e-scroll" aria-hidden>
          The evening ↓
        </p>
      </section>

      {/* Starter step: the calendar lives by the phone — live flows arrive with Growth */}
      <TierBelow need="mid">
        <section className="e-call" aria-labelledby="ecall-h">
          <div>
            <p className="e-eyebrow">Reservations by phone or email</p>
            <h2 id="ecall-h">Twelve seats, released sixty days ahead.</h2>
            <p>Seats go out on the first of the month, two months back. Call or write between 10:00 and 16:00, Tuesday to Sunday, and we'll tell you what the fire's calendar looks like — or put you on the list for the next release.</p>
          </div>
          <div className="e-call-act">
            <a className="e-btn" href="tel:+4533550187">
              +45 33 55 01 87
            </a>
            <a className="e-line" href="mailto:table@maisonember.dk">
              table@maisonember.dk
            </a>
          </div>
        </section>
      </TierBelow>

      <TierGate need="scale">
        <Narrative animated={motion >= 3} />
      </TierGate>

      <TierGate need="high">
        <section className="e-stats" aria-label="The restaurant in numbers">
        {[
          ["12", "seats"],
          ["12", "courses"],
          ["1", "fire, no gas"],
          ["38", "growers within 200 km"],
        ].map(([n, l], i) => (
          <Reveal key={l} delay={i * 80}>
            <b>{n}</b>
            <span>{l}</span>
          </Reveal>
        ))}
        </section>
      </TierGate>

      <TierGate need="mid">
        <section className="e-doors" aria-label="Three ways in">
        {[
          { img: scallop, alt: "Seared scallops with herb oil on a dark plate", k: "At the table", h: "Reserve the evening", p: `${kr(MENU_PRICE)} per guest. Seats released 60 days ahead at 10:00.`, to: "reserve", cta: "See live availability" },
          { img: nordic, alt: "Cured fish packed for the Ember box", k: "At home", h: "The Ember box", p: "Six courses to finish over your own fire. Friday and Saturday pickup, or delivered within Copenhagen.", to: "order", cta: "Order for the weekend" },
          { img: plate, alt: "A dessert on dark stoneware", k: "Belonging", h: "The Circle", p: "Priority seats, a supper each season, and gift evenings for people you love.", to: "circle", cta: "Join or give" },
        ].map((d, i) => (
          <Reveal as="article" key={d.h} delay={i * 120} className="e-door">
            <div className="e-door-img">
              <img src={d.img.src} alt={d.alt} />
            </div>
            <p className="e-eyebrow">{d.k}</p>
            <h3>{d.h}</h3>
            <p>{d.p}</p>
            <button className="e-line" onClick={() => go(d.to)}>
              {d.cta} →
            </button>
          </Reveal>
        ))}
        </section>
      </TierGate>

      <TierGate need="mid">
        <section className="e-press">
        <Reveal>
          <blockquote>“The rare tasting menu that feels like being cooked for, not performed at.”</blockquote>
          <p>
            Nordic food writer, autumn guide <span className="e-tag">Demo quote</span>
          </p>
        </Reveal>
        </section>
      </TierGate>
    </>
  )
}

function Magnetic({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  const { motion } = useSite()
  const ref = useRef<HTMLButtonElement>(null)
  const move = (e: RPointerEvent) => {
    if (motion < 3 || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const x = (e.clientX - r.left - r.width / 2) * 0.18
    const y = (e.clientY - r.top - r.height / 2) * 0.28
    ref.current.style.transform = `translate(${x}px, ${y}px)`
  }
  const leave = () => ref.current && (ref.current.style.transform = "")
  return (
    <button ref={ref} className="e-btn magnetic" onClick={onClick} onPointerMove={move} onPointerLeave={leave}>
      {children}
    </button>
  )
}

/** Four chapters; the image column pins and crossfades as each chapter enters. */
function Narrative({ animated }: { animated: boolean }) {
  const [active, setActive] = useState(0)
  const refs = useRef<(HTMLElement | null)[]>([])
  useEffect(() => {
    if (!animated) return
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i))
        })
      },
      { rootMargin: "-45% 0px -45% 0px" },
    )
    refs.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [animated])

  if (!animated)
    return (
      <section className="e-chapters still" aria-labelledby="ch-h">
        <h2 id="ch-h" className="e-sec-title">
          An evening in four chapters
        </h2>
        {CHAPTERS.map((c) => (
          <article key={c.time}>
            <img src={c.img.src} alt={c.alt} />
            <div>
              <p className="e-time">{c.time}</p>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </div>
          </article>
        ))}
      </section>
    )

  return (
    <section className="e-chapters" aria-labelledby="ch-h">
      <div className="e-pin">
        {CHAPTERS.map((c, i) => (
          <img key={c.time} src={c.img.src} alt={i === active ? c.alt : ""} className={i === active ? "on" : ""} aria-hidden={i !== active} />
        ))}
        <ol className="e-pips" aria-hidden>
          {CHAPTERS.map((c, i) => (
            <li key={c.time} className={i === active ? "on" : ""} />
          ))}
        </ol>
      </div>
      <div className="e-ch-text">
        <h2 id="ch-h" className="e-sec-title">
          An evening in four chapters
        </h2>
        {CHAPTERS.map((c, i) => (
          <article key={c.time} data-i={i} ref={(el) => void (refs.current[i] = el)} className={i === active ? "on" : ""}>
            <p className="e-time">{c.time}</p>
            <h3>{c.title}</h3>
            <p>{c.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

/* ── menu ────────────────────────────────────────────────────────── */

function Menu() {
  const { go } = useSite()
  const [pair, setPair] = useState<"none" | "wine" | "juice">("wine")
  const [pesc, setPesc] = useState(false)
  const [gf, setGf] = useState(false)
  const total = MENU_PRICE + (pair === "wine" ? 1200 : pair === "juice" ? 650 : 0)
  return (
    <section className="e-page e-menu">
      <p className="e-eyebrow">Autumn · changes with the fire</p>
      <h1>Twelve courses</h1>
      <div className="e-controls">
        <div className="e-seg" role="radiogroup" aria-label="Pairing">
          {(
            [
              ["none", "No pairing"],
              ["wine", "Wine pairing"],
              ["juice", "Juice pairing"],
            ] as const
          ).map(([id, l]) => (
            <button key={id} role="radio" aria-checked={pair === id} className={pair === id ? "on" : ""} onClick={() => setPair(id)}>
              {l}
            </button>
          ))}
        </div>
        <label className="e-toggle">
          <input type="checkbox" checked={pesc} onChange={(e) => setPesc(e.target.checked)} /> Pescatarian
        </label>
        <label className="e-toggle">
          <input type="checkbox" checked={gf} onChange={(e) => setGf(e.target.checked)} /> Gluten-free
        </label>
        <p className="e-menu-total">
          {kr(total)} <small>per guest</small>
        </p>
      </div>
      <ol className="e-courses">
        {COURSES.map((c) => {
          const swapped = pesc && c.pesc
          const gfAlt = gf && c.gf === false
          return (
            <li key={c.n} className={swapped || gfAlt ? "alt" : ""}>
              <span className="e-roman">{c.n}</span>
              <span className="e-dish">
                <b>{swapped ? c.pesc : c.dish}</b>
                <span>{swapped ? "pescatarian alternative" : gfAlt ? `${c.detail} — gluten-free version prepared` : c.detail}</span>
              </span>
              {pair !== "none" && <span className="e-pour">{pair === "wine" ? c.wine : c.juice}</span>}
            </li>
          )
        })}
      </ol>
      <div className="e-menu-foot">
        <p>Allergies are cooked around, not ignored — tell us when you book. The menu runs about three and a half hours.</p>
        <button className="e-btn" onClick={() => go("reserve")}>
          Reserve for {kr(total)} pp
        </button>
      </div>
    </section>
  )
}

/* ── reserve: live 21-day availability ───────────────────────────── */

function Reserve() {
  const days = useMemo(() => nextDays(21, true), [])
  const [day, setDay] = useState<Date | null>(null)
  const [party, setParty] = useState(2)
  const [code] = useState(() => ref("EMB"))
  const [updated, setUpdated] = useState(0)
  useEffect(() => {
    const t = window.setInterval(() => setUpdated((u) => u + 1), 30000)
    return () => window.clearInterval(t)
  }, [])
  const f = useForm({ name: "", email: "", phone: "", notes: "", policy: "" }, { name: [rules.required()], email: [rules.email()], phone: [rules.phone()], policy: [rules.checked("Please accept the deposit terms.")] })
  const left = day ? seatsLeft(day) ?? 0 : 0

  if (f.status === "done")
    return (
      <section className="e-page e-done" role="status">
        <p className="e-eyebrow">Confirmed · {code}</p>
        <h1>The fire will be lit.</h1>
        <p>
          {party} {party === 1 ? "seat" : "seats"} on {day && longDate(day)} at 19:00. {kr(DEPOSIT * party)} deposit taken; the balance is settled on the night. Confirmation sent to {f.values.email}.
        </p>
        <button className="e-line" onClick={f.reset}>
          Book another evening →
        </button>
      </section>
    )

  return (
    <section className="e-page e-reserve">
      <div className="e-res-head">
        <div>
          <p className="e-eyebrow">Reserve · one sitting at 19:00</p>
          <h1>Choose an evening</h1>
        </div>
        <p className="e-live" aria-live="polite">
          <i aria-hidden /> Live seat count · updated {updated === 0 ? "just now" : `${updated * 30}s ago`}
        </p>
      </div>
      <div className="e-cal" role="grid" aria-label="Next 21 days">
        {days.map((d) => {
          const s = seatsLeft(d)
          const on = day?.toDateString() === d.toDateString()
          return (
            <button key={d.toISOString()} role="gridcell" disabled={!s} className={`${on ? "on" : ""} ${s === null ? "closed" : ""}`} onClick={() => setDay(d)} aria-label={`${longDate(d)}: ${s === null ? "closed" : s === 0 ? "full" : `${s} of 12 seats left`}`}>
              <small>{dayShort(d)}</small>
              <b>{dayNum(d)}</b>
              {s === null ? <em>—</em> : s === 0 ? <em>Full</em> : <em>{s} left</em>}
              {s !== null && (
                <span className="e-heat" aria-hidden>
                  <i style={{ width: `${((12 - s) / 12) * 100}%` }} />
                </span>
              )}
            </button>
          )
        })}
      </div>
      <p className="e-legend">Open Thursday to Sunday. The bar under each date shows how full the table is.</p>

      {day && (
        <form className="e-res-form" onSubmit={f.submit()} noValidate>
          <div className="e-res-pick">
            <h2>{longDate(day)}</h2>
            <div className="e-seg" role="radiogroup" aria-label="Guests">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <button type="button" key={n} role="radio" aria-checked={party === n} disabled={n > left} className={party === n ? "on" : ""} onClick={() => setParty(n)}>
                  {n}
                </button>
              ))}
            </div>
            <p className="e-small">{left} of 12 seats left. Parties above six take the whole table — write to us.</p>
          </div>
          <div className="e-res-fields">
            <EField label="Name" id="name" err={f.errors.name}>
              <input {...f.field("name")} autoComplete="name" />
            </EField>
            <EField label="Email" id="email" err={f.errors.email}>
              <input {...f.field("email")} type="email" autoComplete="email" />
            </EField>
            <EField label="Phone" id="phone" err={f.errors.phone}>
              <input {...f.field("phone")} type="tel" autoComplete="tel" />
            </EField>
            <EField label="Allergies, occasion" id="notes">
              <input {...f.field("notes")} />
            </EField>
          </div>
          <label className="e-toggle wide">
            <input type="checkbox" id="f-policy" aria-invalid={f.errors.policy ? "true" : "false"} checked={f.values.policy === "yes"} onChange={(e) => f.set("policy", e.target.checked ? "yes" : "")} /> {kr(DEPOSIT)} per guest deposit now; refundable until 72 hours before.
          </label>
          {f.errors.policy && <p className="e-err">{f.errors.policy}</p>}
          <div className="e-res-total">
            <span>
              {party} × {kr(MENU_PRICE)} · deposit today <b>{kr(DEPOSIT * party)}</b>
            </span>
            <button className="e-btn" type="submit" disabled={party > left}>
              {f.status === "sending" ? "Holding seats…" : "Confirm reservation"}
            </button>
          </div>
        </form>
      )}
    </section>
  )
}

function EField({ label, id, err, children }: { label: string; id: string; err?: string; children: ReactNode }) {
  return (
    <div className={`e-field ${err ? "bad" : ""}`}>
      <label htmlFor={`f-${id}`}>{label}</label>
      {children}
      {err && (
        <p className="e-err" id={`f-${id}-err`}>
          {err}
        </p>
      )}
    </div>
  )
}

/* ── order: cart, slot, pickup/delivery ──────────────────────────── */

function Order() {
  const [cart, setCart] = useState<Record<string, number>>({ box: 1 })
  const [mode, setMode] = useState<"pickup" | "delivery">("pickup")
  const [slot, setSlot] = useState("Sat 14:00 – 15:00")
  const [zip, setZip] = useState("")
  const [code] = useState(() => ref("BOX"))
  const f = useForm({ name: "", email: "", phone: "" }, { name: [rules.required()], email: [rules.email()], phone: [rules.phone()] })
  const add = (id: string, d: number) => setCart((c) => ({ ...c, [id]: Math.max(0, Math.min(9, (c[id] ?? 0) + d)) }))
  const lines = SHOP.filter((p) => cart[p.id])
  const sub = lines.reduce((s, p) => s + p.price * cart[p.id], 0)
  const zipN = parseInt(zip, 10)
  const zipOk = mode === "pickup" || (zip.length === 4 && zipN >= 1000 && zipN <= 2990)
  const fee = mode === "delivery" ? 95 : 0
  const slots = mode === "pickup" ? ["Fri 15:00 – 16:00", "Fri 16:00 – 17:00", "Sat 14:00 – 15:00", "Sat 15:00 – 16:00"] : ["Fri 17:00 – 19:00", "Sat 16:00 – 18:00"]

  if (f.status === "done")
    return (
      <section className="e-page e-done" role="status">
        <p className="e-eyebrow">Order placed · {code}</p>
        <h1>Your fire is packed.</h1>
        <p>
          {mode === "pickup" ? `Collect from Istedgade 118, ${slot}.` : `Delivered to ${zip}, ${slot}.`} Total {kr(sub + fee)}. A receipt and the cooking card are in your inbox.
        </p>
      </section>
    )

  return (
    <section className="e-page e-order">
      <p className="e-eyebrow">Ember at home · Friday & Saturday</p>
      <h1>The weekend box</h1>
      <div className="e-order-grid">
        <ul className="e-shop">
          {SHOP.map((p) => (
            <li key={p.id}>
              <div>
                <b>{p.name}</b>
                <span>{p.note}</span>
              </div>
              <p className="e-price">{kr(p.price)}</p>
              <div className="e-qty" aria-label={`Quantity of ${p.name}`}>
                <button onClick={() => add(p.id, -1)} aria-label={`Remove one ${p.name}`} disabled={!cart[p.id]}>
                  −
                </button>
                <output aria-live="polite">{cart[p.id] ?? 0}</output>
                <button onClick={() => add(p.id, 1)} aria-label={`Add one ${p.name}`}>
                  +
                </button>
              </div>
            </li>
          ))}
        </ul>
        <form className="e-cart" onSubmit={(e) => (lines.length && zipOk ? f.submit()(e) : e.preventDefault())} noValidate>
          <p className="e-eyebrow">Your order</p>
          {lines.length === 0 ? (
            <p className="e-small">Your box is empty — add something on the left.</p>
          ) : (
            <ul className="e-lines">
              {lines.map((p) => (
                <li key={p.id}>
                  <span>
                    {cart[p.id]} × {p.name}
                  </span>
                  <b>{kr(p.price * cart[p.id])}</b>
                </li>
              ))}
            </ul>
          )}
          <div className="e-seg full" role="radiogroup" aria-label="Pickup or delivery">
            {(["pickup", "delivery"] as const).map((m) => (
              <button
                type="button"
                key={m}
                role="radio"
                aria-checked={mode === m}
                className={mode === m ? "on" : ""}
                onClick={() => {
                  setMode(m)
                  setSlot(m === "pickup" ? "Sat 14:00 – 15:00" : "Sat 16:00 – 18:00")
                }}
              >
                {m === "pickup" ? "Pickup" : "Delivery · DKK 95"}
              </button>
            ))}
          </div>
          {mode === "delivery" && (
            <div className="e-field">
              <label htmlFor="e-zip">Postcode (Copenhagen & Frederiksberg)</label>
              <input id="e-zip" inputMode="numeric" maxLength={4} value={zip} onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))} aria-invalid={zip.length === 4 && !zipOk} />
              {zip.length === 4 && !zipOk && <p className="e-err">We deliver to postcodes 1000 – 2990 only. Pickup is always available.</p>}
            </div>
          )}
          <fieldset className="e-slots">
            <legend>Slot</legend>
            {slots.map((s) => (
              <button type="button" key={s} className={slot === s ? "on" : ""} onClick={() => setSlot(s)} aria-pressed={slot === s}>
                {s}
              </button>
            ))}
          </fieldset>
          <EField label="Name" id="name" err={f.errors.name}>
            <input {...f.field("name")} autoComplete="name" />
          </EField>
          <EField label="Email" id="email" err={f.errors.email}>
            <input {...f.field("email")} type="email" autoComplete="email" />
          </EField>
          <EField label="Phone" id="phone" err={f.errors.phone}>
            <input {...f.field("phone")} type="tel" autoComplete="tel" />
          </EField>
          <p className="e-cart-total">
            <span>Total</span>
            <b>{kr(sub + fee)}</b>
          </p>
          <button className="e-btn full" type="submit" disabled={!lines.length || !zipOk}>
            {f.status === "sending" ? "Placing order…" : "Place order"}
          </button>
        </form>
      </div>
    </section>
  )
}

/* ── circle: membership + gift configurator ──────────────────────── */

const PLANS = [
  { id: "ember", name: "Ember", price: "Free", perks: ["Seat releases 48 hours early", "The seasonal letter"] },
  { id: "hearth", name: "Hearth", price: "DKK 1,500 / yr", perks: ["Book 90 days ahead, not 60", "One guest supper a year", "10% off Ember boxes"] },
  { id: "fire", name: "Fire", price: "DKK 4,800 / yr", perks: ["Two evenings at the chef's end of the table", "A box each season, delivered", "First call on whole-table bookings"] },
]

function Circle() {
  const [plan, setPlan] = useState("hearth")
  const [gift, setGift] = useState({ type: "evening2", to: "Astrid", from: "Jonas", msg: "Happy thirtieth — dinner's on me." })
  const giftPrice = { evening2: 3700, evening2wine: 6100, box: 1650 }[gift.type as "evening2" | "evening2wine" | "box"]
  const giftLabel = { evening2: "An evening for two", evening2wine: "An evening for two, with wine", box: "The Ember box, with wine" }[gift.type as "evening2"]
  const f = useForm({ email: "" }, { email: [rules.email()] })
  const [gSent, setGSent] = useState(false)
  return (
    <section className="e-page e-circle">
      <p className="e-eyebrow">The Circle</p>
      <h1>Keep a seat by the fire.</h1>
      <div className="e-plans" role="radiogroup" aria-label="Membership">
        {PLANS.map((p) => (
          <button key={p.id} role="radio" aria-checked={plan === p.id} className={plan === p.id ? "on" : ""} onClick={() => setPlan(p.id)}>
            <b>{p.name}</b>
            <span className="e-plan-price">{p.price}</span>
            <ul>
              {p.perks.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </button>
        ))}
      </div>
      <form className="e-join" onSubmit={f.submit()} noValidate>
        {f.status === "done" ? (
          <p role="status" className="e-ok">
            Welcome to {PLANS.find((p) => p.id === plan)!.name}. Your membership card is on its way to {f.values.email}.
          </p>
        ) : (
          <>
            <label htmlFor="f-email" className="sr-only">
              Email
            </label>
            <input {...f.field("email")} type="email" placeholder="Your email" autoComplete="email" />
            <button className="e-btn" type="submit">
              Join {PLANS.find((p) => p.id === plan)!.name}
            </button>
            {f.errors.email && <p className="e-err">{f.errors.email}</p>}
          </>
        )}
      </form>

      <div className="e-gift">
        <div className="e-gift-form">
          <h2>Give an evening</h2>
          <fieldset className="e-slots">
            <legend>The gift</legend>
            {(
              [
                ["evening2", "Evening for two"],
                ["evening2wine", "…with wine pairing"],
                ["box", "Ember box & wine"],
              ] as const
            ).map(([id, l]) => (
              <button type="button" key={id} className={gift.type === id ? "on" : ""} aria-pressed={gift.type === id} onClick={() => setGift({ ...gift, type: id })}>
                {l}
              </button>
            ))}
          </fieldset>
          <div className="e-res-fields">
            <div className="e-field">
              <label htmlFor="g-to">For</label>
              <input id="g-to" value={gift.to} onChange={(e) => setGift({ ...gift, to: e.target.value })} />
            </div>
            <div className="e-field">
              <label htmlFor="g-from">From</label>
              <input id="g-from" value={gift.from} onChange={(e) => setGift({ ...gift, from: e.target.value })} />
            </div>
          </div>
          <div className="e-field">
            <label htmlFor="g-msg">Message ({60 - gift.msg.length} left)</label>
            <input id="g-msg" maxLength={60} value={gift.msg} onChange={(e) => setGift({ ...gift, msg: e.target.value })} />
          </div>
          {gSent ? (
            <p className="e-ok" role="status">
              Gift card sent — {gift.to || "they"} can book any evening in the next twelve months.
            </p>
          ) : (
            <button className="e-btn" onClick={() => setGSent(true)} disabled={!gift.to.trim()}>
              Buy gift · {kr(giftPrice)}
            </button>
          )}
        </div>
        <figure className="e-card" aria-label="Gift card preview">
          <p className="e-card-mark">
            Maison <span>Ember</span>
          </p>
          <p className="e-card-for">For {gift.to || "…"}</p>
          <p className="e-card-what">{giftLabel}</p>
          <p className="e-card-msg">“{gift.msg || "…"}”</p>
          <p className="e-card-from">— {gift.from || "…"}</p>
          <p className="e-card-code">Valid 12 months · {kr(giftPrice)}</p>
        </figure>
      </div>
    </section>
  )
}
