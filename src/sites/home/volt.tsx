import { useEffect, useMemo, useState, type ReactNode } from "react"
import "./volt.css"
import { dayShort, dayNum, nextDays, ref, rules, useForm, useSite, seeded, dateSeed } from "@/sites/kit/site-kit"

/**
 * VOLT FIELD SERVICES — Premium · Flagship · Field-Service Operations
 * Electrical & EV-charger installs with live engineer tracking.
 * The website is the dispatch desk.
 */

const ENGINEERS = [
  { id: "ak", n: "Amara K.", van: "VX24 KLT", skill: "EV · Boards" },
  { id: "jm", n: "Jordan M.", van: "VX73 PRD", skill: "Faults · EICR" },
  { id: "sp", n: "Sana P.", van: "VX24 HJN", skill: "EV · Solar" },
  { id: "tw", n: "Tom W.", van: "VX73 BZE", skill: "Rewires · Boards" },
]
const SLOTS = ["08–10", "10–12", "12–14", "14–16", "16–18"]
const JOBS = [
  { id: "ev", n: "EV charger install", p: "from £899" },
  { id: "fault", n: "Fault finding", p: "£95 first hour" },
  { id: "board", n: "Consumer unit upgrade", p: "from £549" },
  { id: "eicr", n: "EICR / landlord certificate", p: "£169" },
]

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(t)
  }, [])
  return now
}

export default function Volt() {
  const { page, go } = useSite()
  const nav: [string, string][] = [
    ["book", "Book"],
    ["track", "Track job"],
    ["care", "Volt Care"],
  ]
  const emergency = page === "emergency"
  return (
    <div className={`volt ${emergency ? "sos" : ""}`}>
      <a href="#main" className="skip">
        Skip to content
      </a>
      <header className="vt-head">
        <button className="vt-logo" onClick={() => go("home")} aria-label="Volt Field Services, home">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
            <path d="M13 2L4 14h7l-1 8 9-12h-7z" fill="var(--primary)" />
          </svg>
          VOLT<span>/field</span>
        </button>
        <nav aria-label="Main">
          {nav.map(([id, l]) => (
            <button key={id} className={page === id ? "on" : ""} onClick={() => go(id)}>
              {l}
            </button>
          ))}
        </nav>
        <button className="vt-sos-btn" onClick={() => go(emergency ? "home" : "emergency")} aria-pressed={emergency}>
          <i aria-hidden /> {emergency ? "Exit emergency mode" : "Emergency"}
        </button>
      </header>
      <main id="main">
        {page === "home" && <Home />}
        {page === "book" && <Book />}
        {page === "emergency" && <Emergency />}
        {page === "track" && <Track />}
        {page === "care" && <Care />}
      </main>
      <footer className="vt-foot">
        <span>VOLT FIELD SERVICES LTD · NICEIC APPROVED CONTRACTOR · OZEV-AUTHORISED EV INSTALLER</span>
        <span>dispatch@voltfield.co.uk · 020 7946 0717</span>
        <span>DEMO BUSINESS — GROWTH OS FLAGSHIP TEMPLATE. LIVE DATA IS SIMULATED.</span>
      </footer>
    </div>
  )
}

/* ── home ────────────────────────────────────────────────────────── */

function Home() {
  const { go } = useSite()
  const now = useClock()
  const onShift = 9 + (now.getMinutes() % 3)
  return (
    <>
      <section className="vt-hero">
        <div>
          <p className="vt-mono">ELECTRICAL · EV CHARGING · GREATER LONDON</p>
          <h1>
            Electrical work,
            <br />
            dispatched like <span>it matters.</span>
          </h1>
          <p className="vt-lede">Book a live two-hour slot, watch your engineer's van on the map, and get your certificate before they've packed up. Twelve NICEIC engineers, one dispatch desk.</p>
          <div className="vt-act">
            <button className="vt-btn" onClick={() => go("book")}>
              See live slots
            </button>
            <button className="vt-ghost" onClick={() => go("track")}>
              Track a job →
            </button>
          </div>
        </div>
        <div className="vt-console" aria-label="Live operations">
          <div className="vt-console-head">
            <span>
              <i aria-hidden /> DISPATCH · LIVE
            </span>
            <span>{now.toLocaleTimeString("en-GB")}</span>
          </div>
          <dl className="vt-kpis">
            <div>
              <dt>Engineers on shift</dt>
              <dd>{onShift}</dd>
            </div>
            <div>
              <dt>Avg. emergency ETA</dt>
              <dd>47m</dd>
            </div>
            <div>
              <dt>Jobs today</dt>
              <dd>{31 + (now.getHours() % 7)}</dd>
            </div>
            <div>
              <dt>First-time fix</dt>
              <dd>92%</dd>
            </div>
          </dl>
          <ul className="vt-feed">
            {[
              ["14:02", "VX24 KLT", "EV install complete · SW11 · cert issued"],
              ["13:47", "VX73 PRD", "Fault traced · RCD trip · N16"],
              ["13:31", "VX24 HJN", "En route · ETA 18m · SE22"],
              ["13:05", "VX73 BZE", "Board upgrade · 70% · E8"],
            ].map(([t, v, s]) => (
              <li key={v}>
                <span>{t}</span>
                <b>{v}</b>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="vt-jobs">
        {JOBS.map((j, i) => (
          <button key={j.id} onClick={() => go("book")}>
            <span className="vt-mono">0{i + 1}</span>
            <b>{j.n}</b>
            <span>{j.p}</span>
          </button>
        ))}
      </section>
      <EvConfigurator />
    </>
  )
}

function EvConfigurator() {
  const { go } = useSite()
  const [model, setModel] = useState("ohme")
  const [cable, setCable] = useState(8)
  const [tether, setTether] = useState(true)
  const [earth, setEarth] = useState(false)
  const base = { ohme: 899, zappi: 1049, easee: 979 }[model as "ohme"]
  const extraCable = Math.max(0, cable - 10) * 18
  const total = base + extraCable + (tether ? 0 : -40) + (earth ? 180 : 0)
  return (
    <section className="vt-ev" aria-labelledby="ev-h">
      <div>
        <p className="vt-mono">CONFIGURATOR</p>
        <h2 id="ev-h">Price your EV charger install.</h2>
        <fieldset>
          <legend>Charger</legend>
          <div className="vt-seg">
            {(
              [
                ["ohme", "Ohme Home Pro"],
                ["zappi", "myenergi zappi"],
                ["easee", "Easee One"],
              ] as const
            ).map(([id, l]) => (
              <button key={id} aria-pressed={model === id} className={model === id ? "on" : ""} onClick={() => setModel(id)}>
                {l}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>
            Cable run from fuse board to charger: <b>{cable} m</b>
          </legend>
          <input type="range" min={2} max={30} value={cable} onChange={(e) => setCable(+e.target.value)} aria-label="Cable run in metres" />
          <p className="vt-hint">First 10 m included. Measure the shortest route along walls.</p>
        </fieldset>
        <fieldset className="vt-toggles">
          <legend className="sr-only">Options</legend>
          <label>
            <input type="checkbox" checked={tether} onChange={(e) => setTether(e.target.checked)} /> Tethered cable
          </label>
          <label>
            <input type="checkbox" checked={earth} onChange={(e) => setEarth(e.target.checked)} /> Older property — may need an earth rod (+£180)
          </label>
        </fieldset>
      </div>
      <div className="vt-ev-out" aria-live="polite">
        <p className="vt-mono">FIXED INSTALL PRICE</p>
        <p className="vt-big">£{total.toLocaleString("en-GB")}</p>
        <ul>
          <li>
            <span>Charger & standard install</span>
            <b>£{base}</b>
          </li>
          {extraCable > 0 && (
            <li>
              <span>Extra cable ({cable - 10} m)</span>
              <b>£{extraCable}</b>
            </li>
          )}
          {!tether && (
            <li>
              <span>Untethered</span>
              <b>−£40</b>
            </li>
          )}
          {earth && (
            <li>
              <span>Earth rod</span>
              <b>£180</b>
            </li>
          )}
        </ul>
        <button className="vt-btn" onClick={() => go("book")}>
          Book a survey-free install
        </button>
      </div>
    </section>
  )
}

/* ── book: live slot board ───────────────────────────────────────── */

function Book() {
  const days = useMemo(() => nextDays(3, true), [])
  const [d, setD] = useState(0)
  const [pick, setPick] = useState<{ e: string; s: string } | null>(null)
  const [job, setJob] = useState("ev")
  const [code] = useState(() => ref("VLT"))
  const f = useForm({ name: "", phone: "", postcode: "" }, { name: [rules.required()], phone: [rules.phone()], postcode: [rules.required("We need a postcode to route the van.")] })
  const grid = useMemo(() => {
    const r = seeded(dateSeed(days[d]) * 3)
    return ENGINEERS.map((e) => SLOTS.map((s, i) => (d === 0 && i < 2 ? "past" : r() > 0.55 ? "free" : "busy")))
  }, [d, days])
  const E = ENGINEERS.find((e) => e.id === pick?.e)

  if (f.status === "done" && E && pick)
    return (
      <section className="vt-page vt-done" role="status">
        <p className="vt-mono">BOOKED · {code}</p>
        <h1 className="vt-ph">
          {E.n} · {dayShort(days[d])} {pick.s}
        </h1>
        <p>
          Van {E.van}. You'll get a live tracking link by text when {E.n.split(" ")[0]} sets off. {JOBS.find((j) => j.id === job)!.n}, {JOBS.find((j) => j.id === job)!.p}.
        </p>
      </section>
    )

  return (
    <section className="vt-page">
      <p className="vt-mono">LIVE SLOT BOARD · UPDATED EVERY 30S</p>
      <h1 className="vt-ph">Pick an engineer and a slot.</h1>
      <div className="vt-days" role="tablist">
        {days.map((x, i) => (
          <button key={i} role="tab" aria-selected={d === i} className={d === i ? "on" : ""} onClick={() => (setD(i), setPick(null))}>
            {i === 0 ? "Today" : dayShort(x)} <b>{dayNum(x)}</b>
          </button>
        ))}
      </div>
      <div className="vt-board" role="grid" aria-label="Availability by engineer">
        <div className="vt-row head" role="row">
          <span role="columnheader">Engineer</span>
          {SLOTS.map((s) => (
            <span role="columnheader" key={s}>
              {s}
            </span>
          ))}
        </div>
        {ENGINEERS.map((e, ei) => (
          <div className="vt-row" role="row" key={e.id}>
            <span role="rowheader" className="vt-eng">
              <b>{e.n}</b>
              <small>
                {e.van} · {e.skill}
              </small>
            </span>
            {SLOTS.map((s, si) => {
              const st = grid[ei][si]
              const on = pick?.e === e.id && pick.s === s
              return (
                <button key={s} role="gridcell" disabled={st !== "free"} className={`vt-cell ${st} ${on ? "on" : ""}`} onClick={() => setPick({ e: e.id, s })} aria-label={`${e.n} ${s}: ${st === "free" ? "available" : st === "past" ? "past" : "booked"}`}>
                  {st === "free" ? (on ? "✓ Held" : "Free") : st === "past" ? "—" : "Booked"}
                </button>
              )
            })}
          </div>
        ))}
      </div>
      {pick && E && (
        <form className="vt-form" onSubmit={f.submit()} noValidate>
          <p className="vt-mono">
            HOLDING {E.n.toUpperCase()} · {pick.s} · 10:00 MIN
          </p>
          <div className="vt-seg">
            {JOBS.map((j) => (
              <button type="button" key={j.id} aria-pressed={job === j.id} className={job === j.id ? "on" : ""} onClick={() => setJob(j.id)}>
                {j.n}
              </button>
            ))}
          </div>
          <div className="vt-fields">
            {(
              [
                ["name", "Name", "text"],
                ["phone", "Mobile", "tel"],
                ["postcode", "Postcode", "text"],
              ] as const
            ).map(([k, l, t]) => (
              <VField key={k} label={l} id={k} err={f.errors[k]}>
                <input {...f.field(k)} type={t} />
              </VField>
            ))}
          </div>
          <button className="vt-btn" type="submit">
            {f.status === "sending" ? "Confirming…" : "Confirm booking"}
          </button>
        </form>
      )}
    </section>
  )
}

function VField({ label, id, err, children }: { label: string; id: string; err?: string; children: ReactNode }) {
  return (
    <div className={`vt-field ${err ? "bad" : ""}`}>
      <label htmlFor={`f-${id}`}>{label}</label>
      {children}
      {err && (
        <p className="vt-err" id={`f-${id}-err`}>
          {err}
        </p>
      )}
    </div>
  )
}

/* ── emergency mode ──────────────────────────────────────────────── */

function Emergency() {
  return (
    <section className="vt-page vt-sos">
      <p className="vt-mono">EMERGENCY MODE · NEAREST ENGINEER 4.2 MI · ETA ~47 MIN</p>
      <h1 className="vt-ph">
        Power out, burning smell or sparks?
        <br />
        <span>Make it safe, then call.</span>
      </h1>
      <div className="vt-sos-grid">
        <ol className="vt-safe">
          {["If you smell burning or see sparks: switch off at the main switch on your fuse board — only if it's safe to reach.", "Don't touch anything wet near sockets or cables.", "If there's fire or someone has had a shock, call 999 first.", "Unplug appliances on the affected circuit before resetting any trip switch."].map((s, i) => (
            <li key={i}>
              <span>{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
        <div className="vt-sos-call">
          <a className="vt-callbig" href="tel:02079460999">
            020 7946 0999
          </a>
          <p>24/7 · answered by our dispatcher, not a call centre</p>
          <dl>
            <dt>Emergency call-out</dt>
            <dd>£145 incl. first hour</dd>
            <dt>Each extra 30 min</dt>
            <dd>£45</dd>
          </dl>
        </div>
      </div>
    </section>
  )
}

/* ── tracker ─────────────────────────────────────────────────────── */

function Track() {
  const { motion } = useSite()
  const [p, setP] = useState(0.38)
  useEffect(() => {
    if (motion < 1) return
    const t = window.setInterval(() => setP((x) => (x >= 0.96 ? 0.38 : x + 0.006)), 300)
    return () => window.clearInterval(t)
  }, [motion])
  const eta = Math.max(1, Math.round((1 - p) * 30))
  const path = "M40 260 C 120 250, 140 170, 220 160 S 340 90, 420 110 S 540 60, 600 50"
  const geo = useMemo(() => {
    const el = document.createElementNS("http://www.w3.org/2000/svg", "path")
    el.setAttribute("d", path)
    return el
  }, [])
  const len = useMemo(() => geo.getTotalLength(), [geo])
  const pt = geo.getPointAtLength(len * p)
  const steps = [
    ["Booked", "Mon 09:12", true],
    ["Engineer assigned", "Amara K. · VX24 KLT", true],
    ["On the way", `ETA ${eta} min`, true],
    ["Arrived", "", p > 0.95],
    ["Certificate issued", "", false],
  ] as const
  return (
    <section className="vt-page">
      <p className="vt-mono">JOB VLT-4471 · EV CHARGER INSTALL · SW11 · DEMO TRACKING</p>
      <h1 className="vt-ph">
        Amara is <span>{eta} minutes</span> away.
      </h1>
      <div className="vt-track">
        <svg viewBox="0 0 640 300" className="vt-map" role="img" aria-label={`Map showing the van ${eta} minutes away`}>
          <defs>
            <pattern id="vg" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M32 0H0V32" fill="none" stroke="var(--line)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="640" height="300" fill="url(#vg)" />
          <path d="M0 200 Q 300 230 640 180" stroke="color-mix(in srgb, var(--accent) 25%, transparent)" strokeWidth="18" fill="none" />
          <path d={path} stroke="var(--line)" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d={path} stroke="var(--primary)" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - p)} />
          <circle cx="600" cy="50" r="10" fill="var(--accent)" />
          <text x="584" y="32" fontSize="12" fill="var(--ink)" fontFamily="var(--mono)">
            YOU
          </text>
          <circle cx="40" cy="260" r="6" fill="var(--muted)" />
          <g transform={`translate(${pt.x} ${pt.y})`}>
            <circle r="16" fill="var(--primary)" opacity=".2" />
            <circle r="9" fill="var(--primary)" />
          </g>
        </svg>
        <div className="vt-trk-side">
          <div className="vt-eng-card">
            <span className="vt-av" aria-hidden>
              AK
            </span>
            <div>
              <b>Amara Kowalski</b>
              <small>NICEIC · OZEV certified · 6 yrs with Volt</small>
              <small>Van VX24 KLT · white Vivaro</small>
            </div>
          </div>
          <ol className="vt-steps">
            {steps.map(([t, s, done]) => (
              <li key={t} className={done ? "done" : ""}>
                <b>{t}</b>
                {s && <small>{s}</small>}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

/* ── care plans ──────────────────────────────────────────────────── */

function Care() {
  const [plan, setPlan] = useState("home")
  const f = useForm({ email: "", postcode: "" }, { email: [rules.email()], postcode: [rules.required()] })
  const PLANS = [
    { id: "basic", n: "Basic", p: "£8", items: ["Annual safety check", "10% off any job", "Same-week booking"] },
    { id: "home", n: "Home", p: "£15", items: ["Everything in Basic", "4-hour emergency response", "No call-out fee, ever", "EV charger health check"] },
    { id: "landlord", n: "Landlord", p: "£29", items: ["Per property", "EICR every 5 years included", "Tenant-direct booking link", "Certificate vault"] },
  ]
  return (
    <section className="vt-page">
      <p className="vt-mono">VOLT CARE · MONTHLY · CANCEL ANYTIME</p>
      <h1 className="vt-ph">Priority, without the call-out fee.</h1>
      <div className="vt-plans" role="radiogroup" aria-label="Plans">
        {PLANS.map((x) => (
          <button key={x.id} role="radio" aria-checked={plan === x.id} className={plan === x.id ? "on" : ""} onClick={() => setPlan(x.id)}>
            <span className="vt-mono">{x.n.toUpperCase()}</span>
            <b>
              {x.p}
              <small>/mo</small>
            </b>
            <ul>
              {x.items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </button>
        ))}
      </div>
      <form className="vt-form" onSubmit={f.submit()} noValidate>
        {f.status === "done" ? (
          <p role="status" className="vt-ok">
            Welcome to Volt Care {PLANS.find((x) => x.id === plan)!.n}. Your account link is on its way to {f.values.email}.
          </p>
        ) : (
          <div className="vt-fields">
            <VField label="Email" id="email" err={f.errors.email}>
              <input {...f.field("email")} type="email" />
            </VField>
            <VField label="Postcode" id="postcode" err={f.errors.postcode}>
              <input {...f.field("postcode")} />
            </VField>
            <button className="vt-btn" type="submit">
              Join {PLANS.find((x) => x.id === plan)!.n}
            </button>
          </div>
        )}
      </form>
    </section>
  )
}
