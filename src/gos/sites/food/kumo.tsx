import { useMemo, useState, type ReactNode } from "react"
import "./kumo.css"
import sushiImg from "../../assets/img/sushi.jpg"
import { asset, dateSeed, dayNum, dayShort, longDate, monthShort, nextDays, ref, rules, seeded, useForm, useSite } from "../../kit/site-kit"

const sushi = asset(sushiImg)

/**
 * KUMO OMAKASE — Mid · Growth · Restaurant Reservations
 * The site's one job: fill both sittings without a phone call.
 */

const SITTINGS = ["17:30", "20:30"] as const
const PRICE = 145
const PAIRING = 75

function seatsFor(d: Date) {
  if (d.getDay() === 0 || d.getDay() === 1) return null // closed Sun & Mon
  const r = seeded(dateSeed(d))
  return SITTINGS.map(() => Math.floor(r() * 7)) // 0–6 of 10 seats left
}

const COURSES: { group: string; items: [string, string, string?][] }[] = [
  {
    group: "Zensai",
    items: [
      ["Chawanmushi", "dashi custard, Zeeland mussel, yuzu", "Junmai — Dewazakura Dewasansan"],
      ["Sunomono", "cucumber, wakame, North Sea crab", ""],
      ["Ankimo", "monkfish liver, ponzu, momiji oroshi", "Kijoshu — sweet, aged"],
    ],
  },
  {
    group: "Nigiri",
    items: [
      ["Madai", "sea bream, kombu-cured 24h", "Junmai Ginjo — Hakkaisan"],
      ["Hirame", "flounder, engawa, sudachi", ""],
      ["Kinmedai", "golden-eye snapper, seared skin", ""],
      ["Akami", "lean bluefin, soy-marinated", "Tokubetsu Junmai — Kubota"],
      ["Chutoro", "medium-fat bluefin", ""],
      ["Otoro", "belly, lightly torched", ""],
      ["Kohada", "gizzard shad, vinegar-cured — the chef's test", "Yamahai — Tengumai"],
      ["Hotate", "Hokkaido scallop, sea salt", ""],
      ["Amaebi", "sweet shrimp, its own roe", ""],
      ["Uni", "Hokkaido sea urchin, nori", "Daiginjo — Dassai 23"],
      ["Ikura", "salmon roe, sake-marinated", ""],
      ["Anago", "sea eel, simmered, sweet tare", ""],
    ],
  },
  {
    group: "To close",
    items: [
      ["Tamagoyaki", "castella-style, baked for an hour", ""],
      ["Akadashi", "red miso, nameko mushroom", ""],
      ["Hojicha", "roasted tea ice, kinako, kuromitsu", "Umeshu — house-steeped plum"],
    ],
  },
]

const FAQ = [
  ["Can you cater for dietary requirements?", "Pescatarian only — the menu is built around fish. We can work around shellfish, gluten (tamari instead of soy) and pregnancy (no raw fish, cooked alternatives) with 48 hours' notice in your booking."],
  ["What's the deposit and cancellation policy?", "A €40 per guest deposit holds your seats and comes off the bill. Cancel or move up to 48 hours before and it's refunded in full; inside 48 hours we keep it, because ten seats is all we have."],
  ["We're running late — what happens?", "Omakase is served to the whole counter together. We can hold your seats for 15 minutes; after that we start, and you join from the course we're on."],
  ["Is there a dress code? Children?", "No dress code. Guests aged 12 and up, please — it's a two-hour, quiet counter."],
]

type Pre = { date?: number; sitting?: string }

export default function Kumo() {
  const { page, go } = useSite()
  const [pre, setPre] = useState<Pre>({})
  const book = (p: Pre) => {
    setPre(p)
    go("reserve")
  }
  return (
    <div className="kumo">
      <a href="#main" className="skip">
        Skip to content
      </a>
      <header className="k-head">
        <button className="k-logo" onClick={() => go("home")} aria-label="Kumo Omakase, home">
          <Cloud />
          <span>Kumo</span>
        </button>
        <nav aria-label="Main">
          <button className={page === "home" ? "on" : ""} onClick={() => go("home")}>
            The counter
          </button>
          <button className={page === "menu" ? "on" : ""} onClick={() => go("menu")}>
            Omakase
          </button>
          <span className="k-meta">Ferdinand Bolstraat 92 · De Pijp</span>
        </nav>
        <button className="k-cta" onClick={() => book({})}>
          Reserve a seat
        </button>
      </header>
      <main id="main">
        {page === "home" && <Home book={book} />}
        {page === "menu" && <Menu book={book} />}
        {page === "reserve" && <Reserve pre={pre} />}
      </main>
      <footer className="k-foot">
        <div>
          <Cloud />
          <p>
            Kumo Omakase
            <br />
            Ferdinand Bolstraat 92, 1072 LM Amsterdam
          </p>
        </div>
        <dl>
          <dt>Sittings</dt>
          <dd>Tue – Sat · 17:30 and 20:30</dd>
          <dt>Contact</dt>
          <dd>reserve@kumo-omakase.nl · +31 20 555 0187</dd>
        </dl>
        <p className="k-demo">Demo business — Growth OS template. Reviews are illustrative.</p>
      </footer>
      {page !== "reserve" && (
        <div className="k-sticky">
          <span>€{PRICE} · 18 courses</span>
          <button onClick={() => book({})}>Reserve</button>
        </div>
      )}
    </div>
  )
}

function Cloud() {
  return (
    <svg className="k-cloud" viewBox="0 0 40 24" aria-hidden width="40" height="24">
      <path d="M8 20 H31 a6 6 0 0 0 0-12 a8 8 0 0 0-15-2 a6 6 0 0 0-8 6 a4 4 0 0 0 0 8z" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

/* ── home ────────────────────────────────────────────────────────── */

function Home({ book }: { book: (p: Pre) => void }) {
  const days = useMemo(() => nextDays(8, true), [])
  return (
    <>
      <section className="k-hero">
        <p className="k-rail" aria-hidden>
          Ten seats · two sittings · Tuesday to Saturday
        </p>
        <div className="k-hero-copy">
          <p className="k-eyebrow">Edomae omakase · Amsterdam</p>
          <h1>
            Ten seats.
            <br />
            Eighteen pieces.
            <br />
            <em>One pair of hands.</em>
          </h1>
          <p className="k-lede">Chef Ren Takeda serves each piece of nigiri directly to your hand across a hinoki counter — fish from the Dutch coast and Toyosu, rice seasoned with red vinegar, two hours from first bite to tea.</p>
          <div className="k-hero-act">
            <button className="k-btn" onClick={() => book({})}>
              Reserve a counter seat
            </button>
            <span>€{PRICE} per guest · sake pairing €{PAIRING}</span>
          </div>
        </div>
        <figure className="k-hero-img">
          <img src={sushi} alt="Nigiri laid on a dark ceramic plate at the counter" width={1200} height={1200} />
          <figcaption>Hinoki counter · 10 seats</figcaption>
        </figure>
      </section>

      <section className="k-avail" aria-labelledby="avail-h">
        <div className="k-sec-head">
          <h2 id="avail-h">Seats this week</h2>
          <p>Live from the book. Tap a sitting to reserve it.</p>
        </div>
        <div className="k-week">
          {days.map((d) => {
            const s = seatsFor(d)
            return (
              <div key={d.toISOString()} className={`k-day ${s ? "" : "closed"}`}>
                <p className="k-day-name">
                  {dayShort(d)} <b>{dayNum(d)}</b>
                </p>
                {s ? (
                  SITTINGS.map((t, i) => (
                    <button key={t} disabled={s[i] === 0} onClick={() => book({ date: d.getTime(), sitting: t })} aria-label={`${longDate(d)} ${t}, ${s[i] === 0 ? "full" : `${s[i]} seats left`}`}>
                      <span>{t}</span>
                      <small>{s[i] === 0 ? "Full" : `${s[i]} left`}</small>
                    </button>
                  ))
                ) : (
                  <p className="k-closed">Closed</p>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section className="k-evening" aria-labelledby="ev-h">
        <h2 id="ev-h" className="sr-only">
          The evening
        </h2>
        {[
          ["一", "The counter", "One length of Japanese cypress, ten stools, no tables. You watch every piece being made; nothing is plated in a back room."],
          ["二", "The omakase", "Three small dishes, twelve nigiri, then tamago, miso and something cold. The order follows the fish, lightest to richest."],
          ["三", "The sake", "An optional pairing of six pours chosen against specific pieces — or order by the glass from forty bottles."],
        ].map(([n, h, p], i) => (
          <article key={h}>
            <span className="k-num" aria-hidden>
              0{i + 1}
            </span>
            <h3>{h}</h3>
            <p>{p}</p>
            <span className="sr-only">{n}</span>
          </article>
        ))}
      </section>

      <section className="k-chef">
        <div className="k-chef-mark" aria-hidden>
          <Cloud />
        </div>
        <blockquote>
          <p>“The rice is the dish. The fish is what changes.”</p>
          <footer>
            Ren Takeda — eleven years at a counter in Fukuoka before opening Kumo in 2021.
          </footer>
        </blockquote>
      </section>

      <section className="k-reviews" aria-labelledby="rev-h">
        <h2 id="rev-h">What guests say</h2>
        <div className="k-rev-row">
          {[
            ["The kohada alone was worth the trip. Quiet, precise, and the chef explained every piece without a hint of ceremony.", "Mirjam, booked a birthday"],
            ["We took the sake pairing — six pours, each one actually changed the fish. Booking took about a minute.", "Tom & Aiko, second visit"],
            ["Ten people, one counter, nobody on their phone. A genuinely calm two hours.", "Sander, solo diner"],
          ].map(([q, a]) => (
            <figure key={a}>
              <blockquote>{q}</blockquote>
              <figcaption>
                {a} <span className="k-tag">Demo review</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="k-faq" aria-labelledby="faq-h">
        <h2 id="faq-h">Before you book</h2>
        <div>
          {FAQ.map(([q, a]) => (
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

/* ── menu ────────────────────────────────────────────────────────── */

function Menu({ book }: { book: (p: Pre) => void }) {
  const [pairing, setPairing] = useState(false)
  let n = 0
  return (
    <section className="k-menu">
      <div className="k-menu-head">
        <p className="k-eyebrow">Autumn omakase · changes with the fish</p>
        <h1>Eighteen courses</h1>
        <div className="k-toggle" role="radiogroup" aria-label="Menu view">
          <button role="radio" aria-checked={!pairing} className={!pairing ? "on" : ""} onClick={() => setPairing(false)}>
            Omakase · €{PRICE}
          </button>
          <button role="radio" aria-checked={pairing} className={pairing ? "on" : ""} onClick={() => setPairing(true)}>
            With sake pairing · €{PRICE + PAIRING}
          </button>
        </div>
      </div>
      {COURSES.map((g) => (
        <div key={g.group} className="k-group">
          <h2>{g.group}</h2>
          <ol>
            {g.items.map(([name, desc, sake]) => {
              n++
              return (
                <li key={name}>
                  <span className="k-n">{String(n).padStart(2, "0")}</span>
                  <span className="k-dish">
                    <b>{name}</b>
                    <span>{desc}</span>
                  </span>
                  {pairing && sake && <span className="k-sake">{sake}</span>}
                </li>
              )
            })}
          </ol>
        </div>
      ))}
      <div className="k-menu-foot">
        <p>Pescatarian. Allergies and pregnancy menus with 48 hours' notice. Service included.</p>
        <button className="k-btn" onClick={() => book({})}>
          Reserve a seat
        </button>
      </div>
    </section>
  )
}

/* ── reserve ─────────────────────────────────────────────────────── */

function Reserve({ pre }: { pre: Pre }) {
  const days = useMemo(() => nextDays(14, true).filter((d) => seatsFor(d)), [])
  const initialDay = days.find((d) => pre.date && d.toDateString() === new Date(pre.date).toDateString()) ?? null
  const [day, setDay] = useState<Date | null>(initialDay)
  const [sitting, setSitting] = useState<string | null>(pre.sitting ?? null)
  const [party, setParty] = useState(2)
  const [step, setStep] = useState(initialDay && pre.sitting ? 2 : initialDay ? 1 : 0)
  const [code] = useState(() => ref("KUMO"))
  const form = useForm(
    { name: "", email: "", phone: "", diet: "", pairing: "no", policy: "" },
    { name: [rules.required("Who should we put the booking under?")], email: [rules.email()], phone: [rules.phone()], policy: [rules.checked("Please accept the deposit policy.")] },
  )

  const seats = day ? seatsFor(day)! : null
  const left = sitting && seats ? seats[SITTINGS.indexOf(sitting as (typeof SITTINGS)[number])] : 0
  const steps = ["Date", "Sitting", "Details", "Confirmed"]

  if (form.status === "done") {
    return (
      <section className="k-reserve">
        <div className="k-done" role="status">
          <Cloud />
          <p className="k-eyebrow">Reservation confirmed</p>
          <h1>See you at the counter.</h1>
          <dl>
            <dt>Reference</dt>
            <dd>{code}</dd>
            <dt>When</dt>
            <dd>
              {day && longDate(day)} · {sitting}
            </dd>
            <dt>Guests</dt>
            <dd>
              {party} · {form.values.pairing === "yes" ? "with sake pairing" : "omakase only"}
            </dd>
            <dt>Deposit</dt>
            <dd>€{party * 40} — taken now, deducted from your bill</dd>
          </dl>
          <p className="k-done-note">
            A confirmation is on its way to <b>{form.values.email}</b>. Please arrive ten minutes early; we begin together.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="k-reserve">
      <div className="k-res-head">
        <p className="k-eyebrow">Reserve · €{PRICE} per guest</p>
        <h1>Choose your evening</h1>
        <ol className="k-steps" aria-label="Booking steps">
          {steps.map((s, i) => (
            <li key={s} className={i === step ? "on" : i < step ? "done" : ""} aria-current={i === step ? "step" : undefined}>
              <span>{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
      </div>

      <div className="k-res-body">
        <div className="k-res-main">
          {step === 0 && (
            <fieldset>
              <legend>Which evening?</legend>
              <div className="k-dates">
                {days.map((d) => {
                  const s = seatsFor(d)!
                  const total = s[0] + s[1]
                  return (
                    <button
                      key={d.toISOString()}
                      className={day?.toDateString() === d.toDateString() ? "on" : ""}
                      disabled={total === 0}
                      onClick={() => {
                        setDay(d)
                        setSitting(null)
                        setStep(1)
                      }}
                    >
                      <small>{dayShort(d)}</small>
                      <b>{dayNum(d)}</b>
                      <small>{monthShort(d)}</small>
                      <em>{total === 0 ? "Full" : `${total} seats`}</em>
                    </button>
                  )
                })}
              </div>
            </fieldset>
          )}

          {step === 1 && seats && (
            <fieldset>
              <legend>How many, and which sitting?</legend>
              <div className="k-party" role="radiogroup" aria-label="Guests">
                {[1, 2, 3, 4].map((n) => (
                  <button key={n} role="radio" aria-checked={party === n} className={party === n ? "on" : ""} onClick={() => setParty(n)}>
                    {n} {n === 1 ? "guest" : "guests"}
                  </button>
                ))}
              </div>
              <div className="k-sittings">
                {SITTINGS.map((t, i) => {
                  const ok = seats[i] >= party
                  return (
                    <button key={t} disabled={!ok} className={sitting === t ? "on" : ""} onClick={() => setSitting(t)}>
                      <b>{t}</b>
                      <span>{i === 0 ? "First sitting · ends 19:45" : "Second sitting · ends 22:45"}</span>
                      <em>{ok ? `${seats[i]} of 10 seats left` : seats[i] === 0 ? "Full" : `Only ${seats[i]} left`}</em>
                    </button>
                  )
                })}
              </div>
              <p className="k-hint">Larger party? The whole counter can be booked privately — reserve@kumo-omakase.nl.</p>
              <div className="k-nav">
                <button className="k-back" onClick={() => setStep(0)}>
                  ← Change date
                </button>
                <button className="k-btn" disabled={!sitting} onClick={() => setStep(2)}>
                  Continue
                </button>
              </div>
            </fieldset>
          )}

          {step === 2 && (
            <form onSubmit={form.submit()} noValidate>
              <fieldset>
                <legend>Your details</legend>
                <div className="k-fields">
                  <Field label="Name for the booking" err={form.errors.name} id="name">
                    <input {...form.field("name")} autoComplete="name" />
                  </Field>
                  <Field label="Email" err={form.errors.email} id="email">
                    <input {...form.field("email")} type="email" autoComplete="email" />
                  </Field>
                  <Field label="Mobile" err={form.errors.phone} id="phone" hint="Only used if we need to reach you on the day.">
                    <input {...form.field("phone")} type="tel" autoComplete="tel" />
                  </Field>
                  <Field label="Allergies or requests" id="diet" hint="Optional — 48 hours' notice for dietary changes.">
                    <textarea {...form.field("diet")} rows={3} />
                  </Field>
                </div>
                <label className="k-check">
                  <input type="checkbox" checked={form.values.pairing === "yes"} onChange={(e) => form.set("pairing", e.target.checked ? "yes" : "no")} />
                  Add the sake pairing (€{PAIRING} per guest) — you can still change your mind at the counter.
                </label>
                <label className="k-check">
                  <input type="checkbox" id="f-policy" aria-invalid={form.errors.policy ? "true" : "false"} aria-describedby={form.errors.policy ? "f-policy-err" : undefined} checked={form.values.policy === "yes"} onChange={(e) => form.set("policy", e.target.checked ? "yes" : "")} />
                  I understand a €40 per guest deposit is taken now, refundable up to 48 hours before.
                </label>
                {form.errors.policy && (
                  <p className="k-err" id="f-policy-err">
                    {form.errors.policy}
                  </p>
                )}
                <div className="k-nav">
                  <button type="button" className="k-back" onClick={() => setStep(1)}>
                    ← Back
                  </button>
                  <button className="k-btn" type="submit" disabled={form.status === "sending"}>
                    {form.status === "sending" ? "Holding your seats…" : `Confirm & pay €${party * 40} deposit`}
                  </button>
                </div>
              </fieldset>
            </form>
          )}
        </div>

        <aside className="k-summary" aria-label="Booking summary">
          <p className="k-eyebrow">Your evening</p>
          <dl>
            <dt>Date</dt>
            <dd>{day ? longDate(day) : "—"}</dd>
            <dt>Sitting</dt>
            <dd>{sitting ?? "—"}</dd>
            <dt>Guests</dt>
            <dd>{party}</dd>
            <dt>Omakase</dt>
            <dd>€{PRICE * party}</dd>
            {form.values.pairing === "yes" && (
              <>
                <dt>Sake pairing</dt>
                <dd>€{PAIRING * party}</dd>
              </>
            )}
          </dl>
          <p className="k-total">
            <span>Deposit today</span>
            <b>€{party * 40}</b>
          </p>
          {sitting && left <= 3 && <p className="k-scarce">Only {left} seats left at this sitting.</p>}
        </aside>
      </div>
    </section>
  )
}

function Field({ label, id, err, hint, children }: { label: string; id: string; err?: string; hint?: string; children: ReactNode }) {
  return (
    <div className={`k-field ${err ? "bad" : ""}`}>
      <label htmlFor={`f-${id}`}>{label}</label>
      {children}
      {err ? (
        <p className="k-err" id={`f-${id}-err`}>
          {err}
        </p>
      ) : hint ? (
        <p className="k-fhint">{hint}</p>
      ) : null}
    </div>
  )
}
