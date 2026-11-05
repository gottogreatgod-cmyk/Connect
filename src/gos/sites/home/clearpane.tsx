import { useMemo, useState } from "react"
import "./clearpane.css"
import { dayNum, dayShort, longDate, monthShort, nextDays, ref, rules, useForm, useSite } from "../../kit/site-kit"

/**
 * CLEARPANE — Mid · Growth · Quote-First Service
 * Window & gutter cleaning priced in ten seconds.
 */

const TYPES = [
  { id: "flat", n: "Flat / maisonette", base: 14 },
  { id: "terrace", n: "Terraced house", base: 18 },
  { id: "semi", n: "Semi-detached", base: 22 },
  { id: "detached", n: "Detached", base: 28 },
]
const EXTRAS = [
  { id: "conservatory", n: "Conservatory roof", p: 35 },
  { id: "gutter", n: "Gutter clear-out", p: 55 },
  { id: "fascia", n: "Fascias & soffits", p: 30 },
  { id: "solar", n: "Solar panels (up to 12)", p: 45 },
]
const FREQ = [
  { id: "4", n: "Every 4 weeks", off: 0.15 },
  { id: "8", n: "Every 8 weeks", off: 0.05 },
  { id: "once", n: "One-off clean", off: -0.2 },
]
const ZONES: Record<string, string> = { BN1: "Tuesdays", BN2: "Wednesdays", BN3: "Thursdays", BN41: "Fridays", BN42: "Fridays" }

interface Q {
  type: string
  beds: number
  extras: string[]
  freq: string
}
const price = (q: Q) => {
  const t = TYPES.find((x) => x.id === q.type)!
  const windows = t.base + (q.beds - 2) * 3
  const f = FREQ.find((x) => x.id === q.freq)!
  return { windows: Math.round(windows * (1 - f.off)), extras: EXTRAS.filter((e) => q.extras.includes(e.id)).reduce((s, e) => s + e.p, 0) }
}

export default function Clearpane() {
  const { page, go } = useSite()
  const [q, setQ] = useState<Q>({ type: "semi", beds: 3, extras: [], freq: "4" })
  return (
    <div className="cp">
      <a href="#main" className="skip">
        Skip to content
      </a>
      <header className="cp-head">
        <button className="cp-logo" onClick={() => go("home")} aria-label="Clearpane, home">
          <span className="cp-pane" aria-hidden>
            <i />
            <i />
            <i />
            <i />
          </span>
          clearpane
        </button>
        <nav aria-label="Main">
          <button className={page === "plans" ? "on" : ""} onClick={() => go("plans")}>
            Plans & prices
          </button>
          <span>Brighton & Hove</span>
        </nav>
        <button className="cp-btn" onClick={() => go("quote")}>
          Instant quote
        </button>
      </header>
      <main id="main">
        {page === "home" && <Home q={q} setQ={setQ} />}
        {page === "quote" && <Quote q={q} setQ={setQ} />}
        {page === "plans" && <Plans />}
      </main>
      <footer className="cp-foot">
        <p className="cp-logo static">clearpane</p>
        <p>Window, gutter & solar cleaning across Brighton, Hove, Portslade and Shoreham.</p>
        <p>hello@clearpane.co.uk · 01273 555 091</p>
        <p className="cp-small">Fully insured to £5m public liability · Pure-water poles, no ladders against your frames · Demo business — Growth OS Growth template.</p>
      </footer>
      {page !== "quote" && (
        <button className="cp-sticky" onClick={() => go("quote")}>
          From £{price(q).windows} — get my exact quote
        </button>
      )}
    </div>
  )
}

function QuoteControls({ q, setQ, compact }: { q: Q; setQ: (q: Q) => void; compact?: boolean }) {
  return (
    <>
      <fieldset className="cp-fs">
        <legend>Your home</legend>
        <div className="cp-types">
          {TYPES.map((t) => (
            <button key={t.id} aria-pressed={q.type === t.id} className={q.type === t.id ? "on" : ""} onClick={() => setQ({ ...q, type: t.id })}>
              <House kind={t.id} />
              <span>{t.n}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="cp-fs">
        <legend>
          Bedrooms <b>{q.beds === 6 ? "6+" : q.beds}</b>
        </legend>
        <input type="range" min={1} max={6} value={q.beds} onChange={(e) => setQ({ ...q, beds: +e.target.value })} aria-label="Bedrooms" className="cp-range" />
      </fieldset>
      {!compact && (
        <>
          <fieldset className="cp-fs">
            <legend>How often?</legend>
            <div className="cp-chips">
              {FREQ.map((f) => (
                <button key={f.id} aria-pressed={q.freq === f.id} className={q.freq === f.id ? "on" : ""} onClick={() => setQ({ ...q, freq: f.id })}>
                  {f.n}
                  {f.off > 0 && <small>save {Math.round(f.off * 100)}%</small>}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="cp-fs">
            <legend>Extras</legend>
            <div className="cp-extras">
              {EXTRAS.map((e) => (
                <label key={e.id} className={q.extras.includes(e.id) ? "on" : ""}>
                  <input type="checkbox" checked={q.extras.includes(e.id)} onChange={(ev) => setQ({ ...q, extras: ev.target.checked ? [...q.extras, e.id] : q.extras.filter((x) => x !== e.id) })} />
                  {e.n}
                  <b>+£{e.p}</b>
                </label>
              ))}
            </div>
          </fieldset>
        </>
      )}
    </>
  )
}

function House({ kind }: { kind: string }) {
  const w = kind === "flat" ? 26 : kind === "terrace" ? 30 : kind === "semi" ? 34 : 40
  return (
    <svg viewBox="0 0 48 40" width="48" height="40" aria-hidden>
      {kind === "flat" ? (
        <rect x="11" y="6" width="26" height="30" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      ) : (
        <path d={`M${24 - w / 2} 18 L24 6 L${24 + w / 2} 18 V36 H${24 - w / 2} Z`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      )}
      <rect x="17" y={kind === "flat" ? 12 : 21} width="5" height="5" fill="currentColor" opacity=".5" />
      <rect x="26" y={kind === "flat" ? 12 : 21} width="5" height="5" fill="currentColor" opacity=".5" />
      {kind === "flat" && (
        <>
          <rect x="17" y="22" width="5" height="5" fill="currentColor" opacity=".5" />
          <rect x="26" y="22" width="5" height="5" fill="currentColor" opacity=".5" />
        </>
      )}
    </svg>
  )
}

function Home({ q, setQ }: { q: Q; setQ: (q: Q) => void }) {
  const { go } = useSite()
  const p = price(q)
  return (
    <>
      <section className="cp-hero">
        <div className="cp-streak" aria-hidden />
        <div className="cp-hero-copy">
          <p className="cp-pill">★ 4.9 from 610 Brighton households · demo rating</p>
          <h1>
            Spotless windows.
            <br />
            Priced in <span>ten seconds.</span>
          </h1>
          <p className="cp-lede">No "we'll pop round and have a look". Tell us your house, see your price, pick a day we're in your street. Pure-water cleaning every four or eight weeks, frames and sills included.</p>
        </div>
        <div className="cp-mini">
          <QuoteControls q={q} setQ={setQ} compact />
          <div className="cp-mini-out">
            <span>Every 4 weeks</span>
            <b>£{p.windows}</b>
            <button className="cp-btn" onClick={() => go("quote")}>
              Book & customise
            </button>
          </div>
        </div>
      </section>

      <section className="cp-how">
        {[
          ["1", "Quote online", "Your price, fixed. Extras added only if you tick them."],
          ["2", "We're in your street", "Same weekday every round, text the evening before."],
          ["3", "You don't need to be in", "Leave the side gate unlocked; we text a photo when we're done."],
          ["4", "Pay after", "Card link by text, or Direct Debit after each clean."],
        ].map(([n, h, t]) => (
          <article key={n}>
            <span>{n}</span>
            <h3>{h}</h3>
            <p>{t}</p>
          </article>
        ))}
      </section>

      <section className="cp-round">
        <div>
          <h2>Which day are we in your street?</h2>
          <p>Our rounds follow the same weekday so your neighbours' cleans pay for the van's journey — that's how we keep prices down.</p>
        </div>
        <div className="cp-zones">
          {Object.entries(ZONES).map(([pc, d]) => (
            <div key={pc}>
              <b>{pc}</b>
              <span>{d}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="cp-faq">
        <h2>Questions</h2>
        {[
          ["What's pure-water cleaning?", "Water filtered to remove every mineral, brushed on with a carbon-fibre pole from the ground. It dries without streaks and leaves no residue to attract dirt."],
          ["What if it rains?", "Rain doesn't affect pure-water cleaning — the glass dries spot-free. We only stop for high winds or lightning, and we'll text you a new day."],
          ["Can I pause or cancel?", "Yes, from the link in any text. No contract, no fee."],
        ].map(([qq, a]) => (
          <details key={qq}>
            <summary>{qq}</summary>
            <p>{a}</p>
          </details>
        ))}
      </section>
    </>
  )
}

function Quote({ q, setQ }: { q: Q; setQ: (q: Q) => void }) {
  const [pc, setPc] = useState("")
  const [day, setDay] = useState<Date | null>(null)
  const [code] = useState(() => ref("CP"))
  const p = price(q)
  const zone = Object.keys(ZONES).find((z) => pc.toUpperCase().replace(/\s/g, "").startsWith(z))
  const wd = zone ? { Tuesdays: 2, Wednesdays: 3, Thursdays: 4, Fridays: 5 }[ZONES[zone] as "Tuesdays"] : null
  const dates = useMemo(() => (wd ? nextDays(28).filter((d) => d.getDay() === wd).slice(0, 4) : []), [wd])
  const f = useForm({ name: "", address: "", email: "", phone: "" }, { name: [rules.required()], address: [rules.required("We need the first line of your address.")], email: [rules.email()], phone: [rules.phone()] })
  const freq = FREQ.find((x) => x.id === q.freq)!

  if (f.status === "done" && day)
    return (
      <section className="cp-page cp-done" role="status">
        <span className="cp-tick" aria-hidden>
          ✓
        </span>
        <h1>See you {longDate(day)}.</h1>
        <p>
          Reference {code}. First clean £{p.windows + p.extras}, then £{p.windows} {freq.id === "once" ? "" : freq.n.toLowerCase()}. We'll text {f.values.phone} the evening before.
        </p>
      </section>
    )

  return (
    <section className="cp-page">
      <h1 className="cp-ph">Your instant quote</h1>
      <div className="cp-quote">
        <div className="cp-quote-main">
          <QuoteControls q={q} setQ={setQ} />
          <fieldset className="cp-fs">
            <legend>Postcode</legend>
            <input className="cp-input" value={pc} onChange={(e) => (setPc(e.target.value), setDay(null))} placeholder="e.g. BN3 1AB" aria-describedby="pc-msg" />
            <p id="pc-msg" className={`cp-pcmsg ${pc.length >= 3 ? (zone ? "ok" : "no") : ""}`} aria-live="polite">
              {pc.length < 3 ? "We'll show the days we're in your street." : zone ? `We're in ${zone} on ${ZONES[zone]}.` : "Sorry — we don't cover that postcode yet. Email us and we'll let you know when we do."}
            </p>
            {dates.length > 0 && (
              <div className="cp-dates">
                {dates.map((d) => (
                  <button key={d.toISOString()} aria-pressed={day?.getTime() === d.getTime()} className={day?.getTime() === d.getTime() ? "on" : ""} onClick={() => setDay(d)}>
                    <small>{dayShort(d)}</small>
                    <b>{dayNum(d)}</b>
                    <small>{monthShort(d)}</small>
                  </button>
                ))}
              </div>
            )}
          </fieldset>
          {day && (
            <form className="cp-fs" onSubmit={f.submit()} noValidate>
              <legend className="cp-legend">Your details</legend>
              <div className="cp-fields">
                {(
                  [
                    ["name", "Name", "text", "name"],
                    ["address", "First line of address", "text", "street-address"],
                    ["email", "Email", "email", "email"],
                    ["phone", "Mobile (for the evening-before text)", "tel", "tel"],
                  ] as const
                ).map(([k, l, t, ac]) => (
                  <div key={k} className={`cp-field ${f.errors[k] ? "bad" : ""}`}>
                    <label htmlFor={`f-${k}`}>{l}</label>
                    <input {...f.field(k)} type={t} autoComplete={ac} />
                    {f.errors[k] && (
                      <p className="cp-err" id={`f-${k}-err`}>
                        {f.errors[k]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <button className="cp-btn big" type="submit">
                {f.status === "sending" ? "Booking…" : `Book first clean — £${p.windows + p.extras}`}
              </button>
            </form>
          )}
        </div>
        <aside className="cp-total" aria-live="polite">
          <p className="cp-small">Your price</p>
          <p className="cp-big">
            £{p.windows}
            <small>{q.freq === "once" ? " one-off" : ` / ${q.freq} weeks`}</small>
          </p>
          <dl>
            <dt>Windows, frames & sills</dt>
            <dd>£{p.windows}</dd>
            {EXTRAS.filter((e) => q.extras.includes(e.id)).map((e) => (
              <div key={e.id} className="cp-dlrow">
                <dt>{e.n} (first clean)</dt>
                <dd>£{e.p}</dd>
              </div>
            ))}
          </dl>
          <p className="cp-small">No contract. Pause or cancel by text.</p>
        </aside>
      </div>
    </section>
  )
}

function Plans() {
  const { go } = useSite()
  return (
    <section className="cp-page">
      <h1 className="cp-ph">Plans & prices</h1>
      <div className="cp-plans">
        {[
          ["Every 8 weeks", "from £13", ["Windows, frames & sills", "Text the evening before", "Pay after each clean"], false],
          ["Every 4 weeks", "from £12", ["Everything in 8-weekly", "15% off every clean", "Free gutter check each spring"], true],
          ["One-off", "from £17", ["Moving in or out", "Before a party or sale", "Book any weekday"], false],
        ].map(([n, p, items, best]) => (
          <article key={n as string} className={best ? "best" : ""}>
            {best && <span className="cp-best">Most chosen</span>}
            <h2>{n as string}</h2>
            <p className="cp-big">{p as string}</p>
            <ul>
              {(items as string[]).map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
            <button className="cp-btn" onClick={() => go("quote")}>
              Get my exact price
            </button>
          </article>
        ))}
      </div>
      <p className="cp-small center">Prices shown for a one-bedroom flat. Your exact price depends on your home — the quote takes ten seconds.</p>
    </section>
  )
}
