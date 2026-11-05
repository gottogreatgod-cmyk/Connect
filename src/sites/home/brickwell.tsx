import { useState, type CSSProperties } from "react"
import "./brickwell.css"
import { Reveal, ref, rules, useForm, useSite } from "@/sites/kit/site-kit"

/**
 * BRICKWELL HOME SERVICES — High · Business · Multi-Service Company
 * Forty engineers, four trades. Proves scale and routes each job.
 */

const TRADES = [
  { id: "heat", n: "Heating & boilers", c: "#A8441F", jobs: ["Boiler repair", "Boiler replacement", "Annual service", "Radiators & controls", "Heat pump survey"], guar: "Up to 10-year manufacturer warranty on new boilers", from: "Repairs from £95" },
  { id: "elec", n: "Electrical", c: "#2F5443", jobs: ["Fault finding", "Consumer unit upgrade", "EICR certificate", "Rewires", "Lighting & sockets"], guar: "NICEIC-registered, Part P certified", from: "Callouts from £85" },
  { id: "plumb", n: "Plumbing", c: "#3B5B7A", jobs: ["Leaks & bursts", "Blocked drains", "Bathroom installs", "Water pressure", "Taps & toilets"], guar: "12-month labour guarantee", from: "Callouts from £79" },
  { id: "roof", n: "Roofing", c: "#6B4E2E", jobs: ["Slipped tiles", "Flat roof repair", "Guttering", "Chimney work", "Roof survey"], guar: "10-year guarantee on new flat roofs", from: "Surveys from £120" },
]
const DEPOTS: Record<string, { depot: string; eta: string; trades: string[] }> = {
  M: { depot: "Trafford Park depot", eta: "tomorrow, 8–10am", trades: ["heat", "elec", "plumb", "roof"] },
  SK: { depot: "Stockport depot", eta: "today, 2–4pm", trades: ["heat", "elec", "plumb", "roof"] },
  BL: { depot: "Bolton depot", eta: "tomorrow, 10–12am", trades: ["heat", "plumb", "roof"] },
  OL: { depot: "Oldham satellite", eta: "Thursday, 8–10am", trades: ["heat", "plumb"] },
  WA: { depot: "Trafford Park depot", eta: "Wednesday, 12–2pm", trades: ["heat", "elec"] },
}
const AREAS = ["Manchester city centre", "Salford", "Trafford", "Stockport", "Bolton", "Bury", "Oldham", "Rochdale", "Tameside", "Warrington (part)"]

function check(pc: string) {
  const m = pc.toUpperCase().replace(/\s/g, "").match(/^([A-Z]{1,2})\d/)
  if (!m) return null
  return { prefix: m[1], hit: DEPOTS[m[1]] ?? null }
}

export default function Brickwell() {
  const { page, go } = useSite()
  const [trade, setTrade] = useState("heat")
  const nav: [string, string][] = [
    ["services", "Services"],
    ["areas", "Areas"],
    ["projects", "Projects"],
  ]
  return (
    <div className="bw">
      <a href="#main" className="skip">
        Skip to content
      </a>
      <div className="bw-top">
        <span>24/7 emergency line 0161 496 0900</span>
        <span>Gas Safe · NICEIC · TrustMark</span>
      </div>
      <header className="bw-head">
        <button className="bw-logo" onClick={() => go("home")} aria-label="Brickwell Home Services, home">
          <span className="bw-bricks" aria-hidden>
            <i />
            <i />
            <i />
          </span>
          Brickwell
        </button>
        <nav aria-label="Main">
          {nav.map(([id, l]) => (
            <button key={id} className={page === id ? "on" : ""} onClick={() => go(id)}>
              {l}
            </button>
          ))}
        </nav>
        <button className="bw-btn" onClick={() => go("book")}>
          Book an engineer
        </button>
      </header>
      <main id="main">
        {page === "home" && <Home setTrade={setTrade} />}
        {page === "services" && <Services trade={trade} setTrade={setTrade} />}
        {page === "areas" && <Areas />}
        {page === "projects" && <Projects />}
        {page === "book" && <Book initial={trade} />}
      </main>
      <footer className="bw-foot">
        <div>
          <p className="bw-logo static">Brickwell</p>
          <p>Home services for Greater Manchester since 2008.</p>
        </div>
        <p>
          Trafford Park depot · Unit 9, Westinghouse Road, M17 1PY
          <br />
          bookings@brickwell.co.uk · 0161 496 0900
        </p>
        <p className="bw-small">Demo business — Growth OS Business template. Projects, ratings and accreditations shown are illustrative.</p>
      </footer>
    </div>
  )
}

function PostcodeChecker({ compact }: { compact?: boolean }) {
  const { go } = useSite()
  const [pc, setPc] = useState("")
  const r = check(pc)
  return (
    <div className={`bw-pc ${compact ? "compact" : ""}`}>
      <label htmlFor="bw-pc">Check your postcode</label>
      <div className="bw-pc-row">
        <input id="bw-pc" value={pc} onChange={(e) => setPc(e.target.value)} placeholder="e.g. SK4 2AB" autoComplete="postal-code" />
      </div>
      <div className="bw-pc-out" aria-live="polite">
        {r?.hit && (
          <>
            <p>
              <b>Covered from our {r.hit.depot}.</b> Next available: <b>{r.hit.eta}</b>.
            </p>
            <div className="bw-pc-trades">
              {TRADES.map((t) => (
                <span key={t.id} className={r.hit!.trades.includes(t.id) ? "yes" : "no"}>
                  {r.hit!.trades.includes(t.id) ? "✓" : "–"} {t.n}
                </span>
              ))}
            </div>
            <button className="bw-link" onClick={() => go("book")}>
              Book this slot →
            </button>
          </>
        )}
        {r && !r.hit && <p>We don't cover {r.prefix} postcodes yet. Our partner network can — call 0161 496 0900 and we'll arrange it.</p>}
      </div>
    </div>
  )
}

function Home({ setTrade }: { setTrade: (t: string) => void }) {
  const { go } = useSite()
  return (
    <>
      <section className="bw-hero">
        <div>
          <p className="bw-kicker">Heating · Electrical · Plumbing · Roofing</p>
          <h1>
            One call.
            <br />
            The right trade.
            <br />
            <span>On the day we say.</span>
          </h1>
          <p className="bw-lede">Forty employed engineers — not subcontractors — across four trades and three depots in Greater Manchester. Fixed prices before work starts, and a named engineer you can track to your door.</p>
        </div>
        <PostcodeChecker />
      </section>

      <section className="bw-stats">
        {[
          ["40", "employed engineers"],
          ["3", "depots across GM"],
          ["94%", "fixed first visit"],
          ["18,400", "jobs since 2008"],
        ].map(([n, l], i) => (
          <Reveal key={l} delay={i * 80}>
            <b>{n}</b>
            <span>{l}</span>
          </Reveal>
        ))}
      </section>

      <section className="bw-hub" aria-labelledby="hub-h">
        <h2 id="hub-h">Four trades, one booking</h2>
        <div className="bw-hub-grid">
          {TRADES.map((t, i) => (
            <Reveal as="article" key={t.id} delay={i * 90} style={{ "--tc": t.c } as CSSProperties}>
              <span className="bw-tnum">0{i + 1}</span>
              <h3>{t.n}</h3>
              <ul>
                {t.jobs.slice(0, 4).map((j) => (
                  <li key={j}>{j}</li>
                ))}
              </ul>
              <p className="bw-from">{t.from}</p>
              <button
                className="bw-link"
                onClick={() => {
                  setTrade(t.id)
                  go("services")
                }}
              >
                See {t.n.toLowerCase()} →
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bw-ba-sec">
        <div>
          <h2>Before & after, Didsbury</h2>
          <p>A 1970s back boiler and hot water cylinder replaced with a wall-hung combi, moved into the kitchen. Two days, one engineer, no floorboards lifted twice.</p>
          <button className="bw-link" onClick={() => go("projects")}>
            More projects →
          </button>
        </div>
        <BeforeAfter />
      </section>

      <section className="bw-guar">
        {["Fixed price agreed before any work", "Engineers you can track to the door", "Clean-up and photos when we finish", "Guarantees in writing, every job"].map((g, i) => (
          <Reveal key={g} delay={i * 70}>
            <span aria-hidden>✓</span>
            {g}
          </Reveal>
        ))}
      </section>
    </>
  )
}

function BeforeAfter() {
  const [x, setX] = useState(50)
  return (
    <figure className="bw-ba" aria-label="Before and after: boiler cupboard">
      <svg viewBox="0 0 400 300" className="bw-ba-after" aria-hidden>
        <rect width="400" height="300" fill="#F3EEE7" />
        <rect x="0" y="230" width="400" height="70" fill="#D8CBBB" />
        <rect x="150" y="50" width="100" height="140" rx="8" fill="#fff" stroke="#BFB3A3" strokeWidth="2" />
        <rect x="170" y="150" width="60" height="18" rx="4" fill="#E9E3DA" />
        <circle cx="185" cy="159" r="4" fill="#2F5443" />
        <rect x="196" y="155" width="26" height="8" rx="2" fill="#2F5443" opacity=".5" />
        {[165, 185, 205, 225].map((px) => (
          <path key={px} d={`M${px} 190 V230`} stroke="#C27A3A" strokeWidth="5" />
        ))}
        <text x="200" y="88" textAnchor="middle" fontSize="12" fill="#8A7E70" fontFamily="system-ui">COMBI</text>
        <text x="16" y="28" fontSize="14" fontWeight="700" fill="#2F5443" fontFamily="system-ui">AFTER</text>
      </svg>
      <svg viewBox="0 0 400 300" className="bw-ba-before" aria-hidden style={{ clipPath: `inset(0 ${100 - x}% 0 0)` }}>
        <rect width="400" height="300" fill="#CFC5B6" />
        <rect x="0" y="230" width="400" height="70" fill="#9C8F7D" />
        <rect x="40" y="70" width="110" height="160" rx="4" fill="#B5793F" stroke="#6E4A27" strokeWidth="3" />
        <ellipse cx="95" cy="70" rx="55" ry="10" fill="#9E6634" />
        <rect x="200" y="110" width="140" height="120" fill="#8D8273" stroke="#5E5547" strokeWidth="3" />
        <rect x="220" y="130" width="40" height="30" fill="#3E372E" />
        {[["M150 120 H200", 6], ["M150 160 H200", 6], ["M95 60 V20 H330 V110", 5], ["M260 230 V250", 5], ["M300 230 V255 H380", 5]].map(([d, w], i) => (
          <path key={i} d={d as string} stroke="#6E6252" strokeWidth={w as number} fill="none" />
        ))}
        <circle cx="300" cy="80" r="4" fill="#6E4A27" />
        <text x="16" y="28" fontSize="14" fontWeight="700" fill="#5E2A12" fontFamily="system-ui">BEFORE</text>
      </svg>
      <div className="bw-ba-handle" style={{ left: `${x}%` }} aria-hidden />
      <label className="sr-only" htmlFor="bw-ba-r">
        Reveal before and after
      </label>
      <input id="bw-ba-r" type="range" min={0} max={100} value={x} onChange={(e) => setX(+e.target.value)} className="bw-ba-range" />
      <figcaption>Drag to compare — back boiler & cylinder → wall-hung combi</figcaption>
    </figure>
  )
}

function Services({ trade, setTrade }: { trade: string; setTrade: (t: string) => void }) {
  const { go } = useSite()
  const t = TRADES.find((x) => x.id === trade)!
  return (
    <section className="bw-page" style={{ "--tc": t.c } as CSSProperties}>
      <h1 className="bw-ph">Services</h1>
      <div className="bw-tabs" role="tablist">
        {TRADES.map((x) => (
          <button key={x.id} role="tab" aria-selected={trade === x.id} className={trade === x.id ? "on" : ""} onClick={() => setTrade(x.id)}>
            {x.n}
          </button>
        ))}
      </div>
      <div className="bw-svc">
        <div>
          <h2>{t.n}</h2>
          <p className="bw-from big">{t.from}</p>
          <ul className="bw-joblist">
            {t.jobs.map((j) => (
              <li key={j}>
                <span>{j}</span>
                <button className="bw-link" onClick={() => go("book")}>
                  Book →
                </button>
              </li>
            ))}
          </ul>
        </div>
        <aside className="bw-guar-card">
          <p className="bw-kicker">Our guarantee</p>
          <p>{t.guar}</p>
          <p className="bw-small">Every engineer is employed by Brickwell, DBS-checked and carries ID with a photo you'll receive by text before they arrive.</p>
        </aside>
      </div>
    </section>
  )
}

function Areas() {
  return (
    <section className="bw-page">
      <h1 className="bw-ph">Areas we cover</h1>
      <div className="bw-areas">
        <PostcodeChecker compact />
        <div>
          <h2>Ten boroughs, three depots</h2>
          <ul className="bw-area-list">
            {AREAS.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
          <dl className="bw-depots">
            {Object.entries(DEPOTS)
              .filter(([k]) => k !== "WA")
              .map(([k, d]) => (
                <div key={k}>
                  <dt>{d.depot}</dt>
                  <dd>
                    {k} postcodes · {d.trades.length} trades
                  </dd>
                </div>
              ))}
          </dl>
        </div>
      </div>
    </section>
  )
}

function Projects() {
  return (
    <section className="bw-page">
      <h1 className="bw-ph">Projects</h1>
      <div className="bw-projects">
        <BeforeAfter />
        {[
          ["Didsbury", "Heating", "Back boiler to combi, moved to kitchen", "2 days · £3,450"],
          ["Sale", "Electrical", "Full rewire of a 1930s semi while the family stayed in", "6 days · £5,900"],
          ["Bolton", "Roofing", "Flat roof over a kitchen extension, re-laid in EPDM", "1 day · £2,200"],
          ["Stockport", "Plumbing", "Accessible wet room for a client after hip surgery", "4 days · £7,800"],
        ].map(([w, t, d, m]) => (
          <article key={w}>
            <p className="bw-kicker">
              {t} · {w}
            </p>
            <h2>{d}</h2>
            <p className="bw-small">{m}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function Book({ initial }: { initial: string }) {
  const [step, setStep] = useState(0)
  const [trade, setTrade] = useState(initial)
  const [job, setJob] = useState("")
  const [urg, setUrg] = useState("This week")
  const [pc, setPc] = useState("")
  const [code] = useState(() => ref("BW"))
  const t = TRADES.find((x) => x.id === trade)!
  const r = check(pc)
  const f = useForm({ name: "", phone: "", email: "", notes: "" }, { name: [rules.required()], phone: [rules.phone()], email: [rules.email()] })
  if (f.status === "done")
    return (
      <section className="bw-page bw-done" role="status">
        <p className="bw-kicker">Booked · {code}</p>
        <h1 className="bw-ph">{r?.hit ? `See you ${r.hit.eta}.` : "We'll call to confirm."}</h1>
        <p>
          {t.n} — {job}. Your engineer's name, photo and live tracking link arrive by text the evening before. The price is fixed when they've seen the job, before any work starts.
        </p>
      </section>
    )
  const steps = ["Trade", "Job", "When & where", "Details"]
  return (
    <section className="bw-page">
      <h1 className="bw-ph">Book an engineer</h1>
      <ol className="bw-steps">
        {steps.map((s, i) => (
          <li key={s} className={i === step ? "on" : i < step ? "done" : ""}>
            <span>{i + 1}</span>
            {s}
          </li>
        ))}
      </ol>
      <div className="bw-book">
        {step === 0 && (
          <div className="bw-opts four">
            {TRADES.map((x) => (
              <button key={x.id} className={trade === x.id ? "on" : ""} onClick={() => (setTrade(x.id), setJob(""), setStep(1))} style={{ "--tc": x.c } as CSSProperties}>
                {x.n}
              </button>
            ))}
          </div>
        )}
        {step === 1 && (
          <>
            <div className="bw-opts">
              {t.jobs.map((j) => (
                <button key={j} className={job === j ? "on" : ""} onClick={() => (setJob(j), setStep(2))}>
                  {j}
                </button>
              ))}
            </div>
            <button className="bw-back" onClick={() => setStep(0)}>
              ← Change trade
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <div className="bw-opts">
              {["Emergency — today", "This week", "Next week or later"].map((u) => (
                <button key={u} className={urg === u ? "on" : ""} onClick={() => setUrg(u)}>
                  {u}
                </button>
              ))}
            </div>
            <label className="bw-label" htmlFor="bw-bpc">
              Postcode
            </label>
            <input id="bw-bpc" className="bw-input" value={pc} onChange={(e) => setPc(e.target.value)} placeholder="e.g. M20 2RN" />
            <p className="bw-small" aria-live="polite">
              {r?.hit ? (r.hit.trades.includes(trade) ? `✓ ${r.hit.depot} · next ${t.n.toLowerCase()} slot ${r.hit.eta}` : `${t.n} isn't offered from ${r.hit.depot} — we'll route from Trafford Park.`) : r ? "Outside our area — we'll call with a partner recommendation." : " "}
            </p>
            <div className="bw-nav">
              <button className="bw-back" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button className="bw-btn" disabled={!r} onClick={() => setStep(3)}>
                Continue
              </button>
            </div>
          </>
        )}
        {step === 3 && (
          <form onSubmit={f.submit()} noValidate>
            <div className="bw-fields">
              {(
                [
                  ["name", "Name", "text"],
                  ["phone", "Mobile", "tel"],
                  ["email", "Email", "email"],
                  ["notes", "Anything the engineer should know?", "text"],
                ] as const
              ).map(([k, l, ty]) => (
                <div key={k} className={`bw-field ${f.errors[k] ? "bad" : ""}`}>
                  <label htmlFor={`f-${k}`}>{l}</label>
                  <input {...f.field(k)} type={ty} />
                  {f.errors[k] && <p className="bw-err">{f.errors[k]}</p>}
                </div>
              ))}
            </div>
            <div className="bw-nav">
              <button type="button" className="bw-back" onClick={() => setStep(2)}>
                ← Back
              </button>
              <button className="bw-btn" type="submit">
                {f.status === "sending" ? "Booking…" : `Book ${job.toLowerCase()}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
