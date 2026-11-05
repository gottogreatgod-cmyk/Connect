import { useEffect, useRef, useState, type DragEvent, type PointerEvent as RPointerEvent, type ReactNode } from "react"
import "./meridian.css"
import { Reveal, rules, useForm, useSite } from "@/sites/kit/site-kit"

/**
 * MERIDIAN LEGAL — Premium · Flagship · Legal Intake & Client Portal
 * Immigration and relocation law for founders and their teams. Intake,
 * secure documents and case status — all online.
 */

type Country = "NL" | "PT"
interface Route {
  id: string
  c: Country
  name: string
  weeks: string
  needs: string[]
  fee: number
}
const ROUTES: Route[] = [
  { id: "hsm", c: "NL", name: "Highly skilled migrant (kennismigrant)", weeks: "4 – 6 weeks", needs: ["Job offer from an IND-recognised sponsor", "Salary above the IND threshold for your age band", "Valid passport"], fee: 1650 },
  { id: "blue", c: "NL", name: "EU Blue Card", weeks: "6 – 8 weeks", needs: ["Higher-education degree or equivalent experience", "Contract of 6+ months above the Blue Card threshold"], fee: 1850 },
  { id: "daft", c: "NL", name: "DAFT — Dutch-American Friendship Treaty", weeks: "8 – 12 weeks", needs: ["US citizenship", "€4,500 invested in a Dutch business", "Sole trader or company registration"], fee: 2400 },
  { id: "startup", c: "NL", name: "Start-up residence permit", weeks: "10 – 14 weeks", needs: ["A recognised facilitator", "Innovative product with a step-by-step business plan"], fee: 2900 },
  { id: "d8", c: "PT", name: "D8 — Digital nomad visa", weeks: "8 – 10 weeks", needs: ["Remote employment or clients outside Portugal", "Income of at least 4× the Portuguese minimum wage", "Portuguese tax number (NIF)"], fee: 1900 },
  { id: "d7", c: "PT", name: "D7 — Passive income visa", weeks: "8 – 12 weeks", needs: ["Regular passive income (pension, rent, dividends)", "12 months' accommodation in Portugal"], fee: 1700 },
  { id: "tech", c: "PT", name: "Tech visa", weeks: "6 – 10 weeks", needs: ["Offer from a Tech-visa certified company", "Highly qualified role"], fee: 2100 },
]

/* module-level so the hooks lint stays calm and identity is stable */
const Q = ({ label, children }: { label: string; children: ReactNode }) => (
  <fieldset className="mer-q">
    <legend>{label}</legend>
    <div className="mer-opts">{children}</div>
  </fieldset>
)
const O = ({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) => (
  <button className={on ? "on" : ""} aria-pressed={on} onClick={onClick}>
    {children}
  </button>
)

export default function Meridian() {
  const { page, go, motion } = useSite()
  const [route, setRoute] = useState<string>("hsm")
  const [prog, setProg] = useState(0)
  useEffect(() => {
    if (motion < 3) return
    const on = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      setProg(h > 0 ? window.scrollY / h : 0)
    }
    on()
    window.addEventListener("scroll", on, { passive: true })
    return () => window.removeEventListener("scroll", on)
  }, [motion, page])
  const nav: [string, string][] = [
    ["assess", "Eligibility"],
    ["fees", "Fees"],
    ["upload", "Secure upload"],
    ["status", "Case status"],
  ]
  return (
    <div className="mer">
      <a href="#main" className="skip">
        Skip to content
      </a>
      {motion >= 3 && (
        <div className="mer-line" aria-hidden>
          <i style={{ height: `${prog * 100}%` }} />
          <b style={{ top: `${prog * 100}%` }} />
        </div>
      )}
      <header className="mer-head">
        <button className="mer-logo" onClick={() => go("home")} aria-label="Meridian Legal, home">
          <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden>
            <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <ellipse cx="16" cy="16" rx="5.5" ry="13" fill="none" stroke="var(--primary)" strokeWidth="1.4" />
            <line x1="3" y1="16" x2="29" y2="16" stroke="currentColor" strokeWidth="1" />
          </svg>
          Meridian
        </button>
        <nav aria-label="Main">
          {nav.map(([id, l]) => (
            <button key={id} className={page === id ? "on" : ""} onClick={() => go(id)} aria-current={page === id ? "page" : undefined}>
              {l}
            </button>
          ))}
        </nav>
        <button className="mer-signin" onClick={() => go("status")}>
          Client sign-in
        </button>
      </header>
      <main id="main">
        {page === "home" && <Home />}
        {page === "assess" && <Assess onPick={(r) => (setRoute(r), go("fees"))} />}
        {page === "fees" && <Fees route={route} setRoute={setRoute} />}
        {page === "upload" && <Upload route={route} />}
        {page === "status" && <Status />}
      </main>
      <footer className="mer-foot">
        <p className="mer-logo static">Meridian Legal</p>
        <p>Keizersgracht 520, Amsterdam · Avenida da Liberdade 110, Lisbon</p>
        <p>hello@meridian.legal · +31 20 555 0166</p>
        <p className="mer-small">Demo business — Growth OS Flagship template. Requirements are simplified for demonstration and change often; always confirm with an adviser.</p>
      </footer>
    </div>
  )
}

function Magnetic({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  const { motion } = useSite()
  const ref = useRef<HTMLButtonElement>(null)
  const move = (e: RPointerEvent) => {
    if (motion < 3 || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    ref.current.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.2}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`
  }
  return (
    <button ref={ref} className="mer-btn magnetic" onClick={onClick} onPointerMove={move} onPointerLeave={() => ref.current && (ref.current.style.transform = "")}>
      {children}
    </button>
  )
}

function Home() {
  const { go } = useSite()
  return (
    <>
      <section className="mer-hero">
        <svg className="mer-globe" viewBox="0 0 600 600" aria-hidden>
          <circle cx="300" cy="300" r="250" />
          {[60, 120, 180, 240].map((rx) => (
            <ellipse key={rx} cx="300" cy="300" rx={rx} ry="250" />
          ))}
          {[-150, -75, 0, 75, 150].map((y) => (
            <line key={y} x1={300 - Math.sqrt(250 * 250 - y * y)} x2={300 + Math.sqrt(250 * 250 - y * y)} y1={300 + y} y2={300 + y} />
          ))}
          <path className="mer-arc" d="M210 190 Q 300 80 345 255" />
          <circle cx="210" cy="190" r="6" className="mer-dot" />
          <circle cx="345" cy="255" r="6" className="mer-dot" />
        </svg>
        <div className="mer-hero-copy">
          <p className="mer-eyebrow">Immigration & relocation law · Netherlands & Portugal</p>
          <h1>
            Move your life <em>and your company</em> with one adviser.
          </h1>
          <p className="mer-lede">For founders, remote teams and the families who move with them. Find your route in three minutes, upload documents securely, and watch your case move — without chasing emails.</p>
          <div className="mer-act">
            <Magnetic onClick={() => go("assess")}>Check your eligibility</Magnetic>
            <button className="mer-ghost" onClick={() => go("fees")}>
              See fixed fees →
            </button>
          </div>
        </div>
      </section>
      <section className="mer-routes" aria-labelledby="r-h">
        <Reveal>
          <h2 id="r-h">Seven routes, two countries, one file.</h2>
        </Reveal>
        <div className="mer-route-grid">
          {ROUTES.map((r, i) => (
            <Reveal as="article" key={r.id} delay={i * 50}>
              <span className="mer-flag">{r.c === "NL" ? "Netherlands" : "Portugal"}</span>
              <h3>{r.name}</h3>
              <p>{r.weeks}</p>
              <b>from €{r.fee.toLocaleString("en-GB")}</b>
            </Reveal>
          ))}
          <article className="mer-route-cta">
            <button onClick={() => go("assess")}>
              <span className="mer-flag">Not sure?</span>
              <b>Take the three-minute eligibility check →</b>
            </button>
          </article>
        </div>
      </section>
      <section className="mer-how">
        {[
          ["01", "Assess", "A branching check tells you which routes fit and what each needs — before you pay anything."],
          ["02", "Prepare", "A checklist per route, encrypted uploads, and a lawyer who reviews every document within two working days."],
          ["03", "Track", "Your case timeline shows what's done, what's waiting on whom, and the next date that matters."],
        ].map(([n, h, p], i) => (
          <Reveal key={n} delay={i * 100}>
            <span>{n}</span>
            <h3>{h}</h3>
            <p>{p}</p>
          </Reveal>
        ))}
      </section>
      <section className="mer-trust">
        <p>Advocaten registered with the Netherlands Bar · Advogados registered with the Ordem dos Advogados · Documents stored in the EU, encrypted end to end · Fixed fees, in writing</p>
      </section>
    </>
  )
}

/* ── eligibility: branching ──────────────────────────────────────── */

function Assess({ onPick }: { onPick: (id: string) => void }) {
  const [c, setC] = useState<Country | null>(null)
  const [nat, setNat] = useState<"eu" | "us" | "other" | null>(null)
  const [sit, setSit] = useState<"employed" | "remote" | "founder" | "passive" | null>(null)
  const [extra, setExtra] = useState<string | null>(null)

  const result = (() => {
    if (!c || !nat) return null
    if (nat === "eu") return { eu: true as const }
    if (!sit) return null
    let ids: string[] = []
    if (c === "NL") {
      if (sit === "employed") {
        if (!extra) return null
        ids = extra === "yes" ? ["hsm", "blue"] : ["blue"]
      }
      if (sit === "founder") ids = nat === "us" ? ["daft", "startup"] : ["startup"]
      if (sit === "remote") ids = nat === "us" ? ["daft"] : []
      if (sit === "passive") ids = []
    } else {
      if (sit === "remote") {
        if (!extra) return null
        ids = extra === "high" ? ["d8"] : []
      }
      if (sit === "passive") ids = ["d7"]
      if (sit === "employed") ids = ["tech"]
      if (sit === "founder") ids = ["tech", "d7"]
    }
    return { eu: false as const, routes: ROUTES.filter((r) => ids.includes(r.id)) }
  })()


  return (
    <section className="mer-page">
      <p className="mer-eyebrow">Eligibility check · 3 minutes · nothing stored</p>
      <h1 className="mer-ph">Which route fits you?</h1>
      <div className="mer-assess">
        <div>
          <Q label="Where are you moving?">
            <O on={c === "NL"} onClick={() => (setC("NL"), setSit(null), setExtra(null))}>
              The Netherlands
            </O>
            <O on={c === "PT"} onClick={() => (setC("PT"), setSit(null), setExtra(null))}>
              Portugal
            </O>
          </Q>
          {c && (
            <Q label="Your citizenship">
              <O on={nat === "eu"} onClick={() => setNat("eu")}>
                EU / EEA / Swiss
              </O>
              <O on={nat === "us"} onClick={() => setNat("us")}>
                United States
              </O>
              <O on={nat === "other"} onClick={() => setNat("other")}>
                Another country
              </O>
            </Q>
          )}
          {c && nat && nat !== "eu" && (
            <Q label="Which describes you best?">
              {(
                [
                  ["employed", `Hired by a company in ${c === "NL" ? "the Netherlands" : "Portugal"}`],
                  ["remote", "Remote employee or freelancer, foreign clients"],
                  ["founder", "Starting or moving a company"],
                  ["passive", "Retired or living on passive income"],
                ] as const
              ).map(([id, l]) => (
                <O key={id} on={sit === id} onClick={() => (setSit(id), setExtra(null))}>
                  {l}
                </O>
              ))}
            </Q>
          )}
          {c === "NL" && sit === "employed" && nat !== "eu" && (
            <Q label="Is your employer an IND-recognised sponsor?">
              <O on={extra === "yes"} onClick={() => setExtra("yes")}>
                Yes
              </O>
              <O on={extra === "no"} onClick={() => setExtra("no")}>
                No / not sure
              </O>
            </Q>
          )}
          {c === "PT" && sit === "remote" && nat !== "eu" && (
            <Q label="Your monthly income, before tax">
              <O on={extra === "high"} onClick={() => setExtra("high")}>
                Above €3,500
              </O>
              <O on={extra === "low"} onClick={() => setExtra("low")}>
                Below €3,500
              </O>
            </Q>
          )}
        </div>
        <aside className="mer-out" aria-live="polite">
          {!result && <p className="mer-muted">Answer the questions and your routes appear here.</p>}
          {result?.eu && (
            <>
              <p className="mer-eyebrow">Good news</p>
              <h2>No visa needed.</h2>
              <p>As an EU/EEA/Swiss citizen you can live and work freely. You'll register with the municipality and get a tax number — we can handle both for a fixed €350.</p>
            </>
          )}
          {result && !result.eu && result.routes.length === 0 && (
            <>
              <p className="mer-eyebrow">No direct route</p>
              <h2>Let's talk it through.</h2>
              <p>Your situation doesn't match a standard route, but there are often alternatives — a different employer structure or the other country. A 30-minute consultation is €150, credited if you instruct us.</p>
            </>
          )}
          {result && !result.eu &&
            result.routes.map((r, i) => (
              <div key={r.id} className="mer-res">
                <p className="mer-eyebrow">{i === 0 ? "Best fit" : "Also possible"}</p>
                <h2>{r.name}</h2>
                <p className="mer-muted">Typical decision: {r.weeks}</p>
                <ul>
                  {r.needs.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
                <button className="mer-btn" onClick={() => onPick(r.id)}>
                  Fees for this route — from €{r.fee.toLocaleString("en-GB")}
                </button>
              </div>
            ))}
        </aside>
      </div>
    </section>
  )
}

/* ── fee configurator ────────────────────────────────────────────── */

function Fees({ route, setRoute }: { route: string; setRoute: (r: string) => void }) {
  const { go } = useSite()
  const r = ROUTES.find((x) => x.id === route) ?? ROUTES[0]
  const [partner, setPartner] = useState(true)
  const [kids, setKids] = useState(1)
  const [addons, setAddons] = useState<string[]>(["reg"])
  const [plan, setPlan] = useState<"full" | "three">("full")
  const ADD = [
    { id: "reg", n: "Municipal registration & tax number", p: 350 },
    { id: "ruling", n: r.c === "NL" ? "30% ruling application" : "IRS Jovem / tax regime review", p: 750 },
    { id: "school", n: "International school placement support", p: 450 },
    { id: "exprs", n: "Express handling (priority review)", p: 600 },
  ]
  const fam = (partner ? 650 : 0) + kids * 350
  const add = ADD.filter((a) => addons.includes(a.id)).reduce((s, a) => s + a.p, 0)
  const total = r.fee + fam + add
  const f = useForm({ email: "" }, { email: [rules.email()] })
  return (
    <section className="mer-page">
      <p className="mer-eyebrow">Fixed fees · VAT included</p>
      <h1 className="mer-ph">Build your quote.</h1>
      <div className="mer-fees">
        <div>
          <label className="mer-label" htmlFor="m-route">
            Route
          </label>
          <select id="m-route" className="mer-select" value={r.id} onChange={(e) => setRoute(e.target.value)}>
            {ROUTES.map((x) => (
              <option key={x.id} value={x.id}>
                {x.c} — {x.name}
              </option>
            ))}
          </select>
          <div className="mer-fam">
            <label className="mer-toggle">
              <input type="checkbox" checked={partner} onChange={(e) => setPartner(e.target.checked)} /> Partner moving with you <span>+€650</span>
            </label>
            <div className="mer-stepper">
              <span>Children</span>
              <button onClick={() => setKids(Math.max(0, kids - 1))} aria-label="One fewer child" disabled={!kids}>
                −
              </button>
              <output aria-live="polite">{kids}</output>
              <button onClick={() => setKids(Math.min(6, kids + 1))} aria-label="One more child">
                +
              </button>
              <span>+€350 each</span>
            </div>
          </div>
          <p className="mer-label">Add-ons</p>
          <div className="mer-addons">
            {ADD.map((a) => (
              <label key={a.id} className={`mer-addon ${addons.includes(a.id) ? "on" : ""}`}>
                <input type="checkbox" checked={addons.includes(a.id)} onChange={(e) => setAddons((x) => (e.target.checked ? [...x, a.id] : x.filter((y) => y !== a.id)))} />
                <span>{a.n}</span>
                <b>€{a.p}</b>
              </label>
            ))}
          </div>
        </div>
        <aside className="mer-quote" aria-live="polite">
          <p className="mer-eyebrow">Your fixed fee</p>
          <p className="mer-total">€{total.toLocaleString("en-GB")}</p>
          <dl>
            <dt>{r.name}</dt>
            <dd>€{r.fee.toLocaleString("en-GB")}</dd>
            {fam > 0 && (
              <>
                <dt>Family members</dt>
                <dd>€{fam.toLocaleString("en-GB")}</dd>
              </>
            )}
            {add > 0 && (
              <>
                <dt>Add-ons</dt>
                <dd>€{add.toLocaleString("en-GB")}</dd>
              </>
            )}
          </dl>
          <div className="mer-plan" role="radiogroup" aria-label="Payment">
            <button role="radio" aria-checked={plan === "full"} className={plan === "full" ? "on" : ""} onClick={() => setPlan("full")}>
              Pay upfront
            </button>
            <button role="radio" aria-checked={plan === "three"} className={plan === "three" ? "on" : ""} onClick={() => setPlan("three")}>
              3 × €{Math.ceil(total / 3).toLocaleString("en-GB")}
            </button>
          </div>
          <p className="mer-small">Government fees (IND / AIMA) are paid separately and passed through at cost.</p>
          {f.status === "done" ? (
            <p className="mer-ok" role="status">
              Quote sent to {f.values.email}. It's valid for 30 days.
            </p>
          ) : (
            <form onSubmit={f.submit()} noValidate className="mer-mail">
              <label htmlFor="f-email" className="sr-only">
                Email
              </label>
              <input {...f.field("email")} type="email" placeholder="Email this quote" />
              <button type="submit">Send</button>
              {f.errors.email && <p className="mer-err">{f.errors.email}</p>}
            </form>
          )}
          <button className="mer-ghost" onClick={() => go("upload")}>
            Start with documents →
          </button>
        </aside>
      </div>
    </section>
  )
}

/* ── secure upload ───────────────────────────────────────────────── */

interface Up {
  id: number
  name: string
  size: number
  pct: number
  doc: string
}

function Upload({ route }: { route: string }) {
  const r = ROUTES.find((x) => x.id === route) ?? ROUTES[0]
  const DOCS = ["Passport (all pages)", r.c === "NL" ? "Employment contract or offer" : "Proof of income (3 months)", "Birth certificate, apostilled", "Health insurance certificate", "Criminal record certificate", "Proof of address abroad"]
  const [files, setFiles] = useState<Up[]>([])
  const [over, setOver] = useState(false)
  const idRef = useRef(1)
  const add = (list: FileList | null) => {
    if (!list) return
    const next = Array.from(list).map((f, i) => ({ id: idRef.current++, name: f.name, size: f.size, pct: 0, doc: DOCS[Math.min(files.length + i, DOCS.length - 1)] }))
    setFiles((x) => [...x, ...next])
  }
  useEffect(() => {
    if (!files.some((f) => f.pct < 100)) return
    const t = window.setInterval(() => setFiles((x) => x.map((f) => (f.pct < 100 ? { ...f, pct: Math.min(100, f.pct + 9 + (f.id % 5) * 3) } : f))), 160)
    return () => window.clearInterval(t)
  }, [files])
  const done = (d: string) => files.some((f) => f.doc === d && f.pct === 100)
  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setOver(false)
    add(e.dataTransfer.files)
  }
  const sample = () => {
    const names = ["passport_scan.pdf", "contract_signed.pdf", "birth_cert_apostille.pdf"]
    setFiles((x) => [...x, ...names.map((n, i) => ({ id: idRef.current++, name: n, size: 480000 + i * 210000, pct: 0, doc: DOCS[Math.min(x.length + i, DOCS.length - 1)] }))])
  }
  return (
    <section className="mer-page">
      <p className="mer-eyebrow">Secure upload · {r.name}</p>
      <h1 className="mer-ph">Your document checklist.</h1>
      <div className="mer-up">
        <div>
          <label className={`mer-drop ${over ? "over" : ""}`} onDragOver={(e) => (e.preventDefault(), setOver(true))} onDragLeave={() => setOver(false)} onDrop={onDrop}>
            <input type="file" multiple onChange={(e) => add(e.target.files)} className="sr-only" />
            <svg viewBox="0 0 24 24" width="34" height="34" aria-hidden>
              <path d="M12 16V4m0 0l-5 5m5-5l5 5M4 20h16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <b>Drop files here, or choose from your device</b>
            <span>PDF, JPG or PNG up to 20 MB. Encrypted before it leaves your browser.</span>
          </label>
          <button className="mer-ghost small" onClick={sample}>
            Try with three sample files
          </button>
          {files.length > 0 && (
            <ul className="mer-files">
              {files.map((f) => (
                <li key={f.id}>
                  <div>
                    <b>{f.name}</b>
                    <span>
                      {(f.size / 1e6).toFixed(1)} MB · {f.pct < 100 ? `encrypting & uploading ${f.pct}%` : "stored · EU"}
                    </span>
                    <span className="mer-bar" aria-hidden>
                      <i style={{ width: `${f.pct}%` }} />
                    </span>
                  </div>
                  <select aria-label={`Which document is ${f.name}?`} value={f.doc} onChange={(e) => setFiles((x) => x.map((y) => (y.id === f.id ? { ...y, doc: e.target.value } : y)))}>
                    {DOCS.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                  <button aria-label={`Remove ${f.name}`} onClick={() => setFiles((x) => x.filter((y) => y.id !== f.id))}>
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="mer-small">Demo: files stay in your browser and are never sent anywhere.</p>
        </div>
        <aside className="mer-check">
          <p className="mer-eyebrow">
            {DOCS.filter(done).length} of {DOCS.length} received
          </p>
          <ol>
            {DOCS.map((d) => (
              <li key={d} className={done(d) ? "ok" : ""}>
                <span aria-hidden>{done(d) ? "✓" : ""}</span>
                {d}
              </li>
            ))}
          </ol>
          <p className="mer-small">Your lawyer reviews each document within two working days and flags anything that needs a translation or apostille.</p>
        </aside>
      </div>
    </section>
  )
}

/* ── case status ─────────────────────────────────────────────────── */

function Status() {
  const STEPS = [
    { d: "2 Sep", t: "Instruction & fixed fee agreed", s: "done" },
    { d: "9 Sep", t: "Documents complete and reviewed", s: "done" },
    { d: "16 Sep", t: "Employer sponsor filing submitted to IND", s: "done" },
    { d: "Now", t: "IND decision pending", s: "now", note: "IND's target for recognised sponsors is two weeks; we chase on day ten. Nothing needed from you." },
    { d: "~14 Nov", t: "MVV entry visa collection — Dutch consulate, Lisbon", s: "next" },
    { d: "Dec", t: "Arrival, municipal registration, BSN & residence card", s: "next" },
  ]
  return (
    <section className="mer-page">
      <p className="mer-demo">Demo client view — sample case</p>
      <div className="mer-case-head">
        <div>
          <p className="mer-eyebrow">Case MRD-2291 · Highly skilled migrant</p>
          <h1 className="mer-ph">Ana & Tomás Reyes</h1>
        </div>
        <div className="mer-pct" aria-label="62 percent complete">
          <svg viewBox="0 0 36 36" width="88" height="88" aria-hidden>
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--line)" strokeWidth="2.5" />
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeDasharray="97.4" strokeDashoffset={97.4 * (1 - 0.62)} transform="rotate(-90 18 18)" strokeLinecap="round" />
          </svg>
          <b>62%</b>
        </div>
      </div>
      <div className="mer-status">
        <ol className="mer-tl">
          {STEPS.map((s) => (
            <li key={s.t} className={s.s}>
              <span className="mer-tl-d">{s.d}</span>
              <div>
                <b>{s.t}</b>
                {s.note && <p>{s.note}</p>}
              </div>
            </li>
          ))}
        </ol>
        <aside>
          <article className="mer-card">
            <p className="mer-eyebrow">Your lawyer</p>
            <h2>Inês Valente</h2>
            <p className="mer-muted">Advocaat · replies within one working day</p>
            <p className="mer-msg">“IND has the file and everything is in order. I'll update you the day the decision lands — enjoy the quiet week.”</p>
            <p className="mer-small">Yesterday, 17:05</p>
          </article>
          <article className="mer-card">
            <p className="mer-eyebrow">Coming up</p>
            <ul className="mer-todo">
              <li>Book MVV appointment once approved — we'll send the link</li>
              <li>Arrange temporary address for registration</li>
            </ul>
          </article>
        </aside>
      </div>
    </section>
  )
}
