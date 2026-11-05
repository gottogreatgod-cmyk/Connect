import { useMemo, useState } from "react"
import "./albright.css"
import stillImg from "../../assets/img/studio-still.jpg"
import { Reveal, asset, rules, useForm, useSite } from "../../kit/site-kit"

const still = asset(stillImg)

/**
 * ALBRIGHT KERR — High · Business · Full-Service Firm
 * A 120-lawyer commercial firm. The site is an index: practices, people,
 * insight and offices — all findable in two moves.
 */

type Office = "London" | "Edinburgh" | "Dublin"
const SECTORS = ["Energy & infrastructure", "Financial services", "Technology", "Real estate", "Life sciences", "Public sector"]
const PRACTICES = [
  { n: "Banking & finance", s: ["Financial services", "Energy & infrastructure", "Real estate"], lawyers: 14 },
  { n: "Commercial contracts", s: ["Technology", "Life sciences", "Public sector"], lawyers: 9 },
  { n: "Competition", s: ["Technology", "Financial services"], lawyers: 5 },
  { n: "Construction", s: ["Energy & infrastructure", "Real estate", "Public sector"], lawyers: 11 },
  { n: "Corporate M&A", s: ["Technology", "Financial services", "Life sciences", "Energy & infrastructure"], lawyers: 18 },
  { n: "Data protection", s: ["Technology", "Life sciences", "Public sector"], lawyers: 6 },
  { n: "Disputes & arbitration", s: ["Energy & infrastructure", "Financial services", "Real estate"], lawyers: 16 },
  { n: "Employment", s: ["Technology", "Financial services", "Public sector"], lawyers: 10 },
  { n: "Intellectual property", s: ["Technology", "Life sciences"], lawyers: 7 },
  { n: "Planning", s: ["Real estate", "Energy & infrastructure", "Public sector"], lawyers: 6 },
  { n: "Projects & PPP", s: ["Energy & infrastructure", "Public sector"], lawyers: 8 },
  { n: "Regulatory", s: ["Financial services", "Life sciences", "Energy & infrastructure"], lawyers: 9 },
]
const PEOPLE: { n: string; r: string; p: string; o: Office }[] = [
  { n: "Margaret Albright", r: "Senior partner", p: "Corporate M&A", o: "London" },
  { n: "Callum Kerr", r: "Managing partner", p: "Disputes & arbitration", o: "Edinburgh" },
  { n: "Aoife Gallagher", r: "Partner", p: "Banking & finance", o: "Dublin" },
  { n: "Rahul Desai", r: "Partner", p: "Technology & data protection", o: "London" },
  { n: "Fiona MacLeod", r: "Partner", p: "Energy & infrastructure", o: "Edinburgh" },
  { n: "Jonas Lindqvist", r: "Partner", p: "Competition", o: "London" },
  { n: "Sinéad Byrne", r: "Partner", p: "Employment", o: "Dublin" },
  { n: "Olumide Bakare", r: "Legal director", p: "Construction", o: "London" },
  { n: "Hannah Stewart", r: "Partner", p: "Planning", o: "Edinburgh" },
  { n: "Eoin Walsh", r: "Senior associate", p: "Intellectual property", o: "Dublin" },
]
const INSIGHTS = [
  { t: "Offshore wind CfD Allocation Round 7: what changed for developers", s: "Energy & infrastructure", d: "21 Oct", k: "Briefing", m: 6 },
  { t: "The EU AI Act's first obligations are live. A checklist for UK suppliers", s: "Technology", d: "14 Oct", k: "Guide", m: 9 },
  { t: "Consumer Duty, two years in: the FCA's enforcement pattern", s: "Financial services", d: "7 Oct", k: "Analysis", m: 7 },
  { t: "Building Safety Act gateways — delays and how to plan around them", s: "Real estate", d: "30 Sep", k: "Briefing", m: 5 },
  { t: "Clinical trial contracts after the UK–EU research association", s: "Life sciences", d: "22 Sep", k: "Analysis", m: 8 },
  { t: "Procurement Act 2023 in practice: early lessons for contracting authorities", s: "Public sector", d: "15 Sep", k: "Guide", m: 10 },
]
const OFFICES: Record<Office, { addr: string; lawyers: number; t: string }> = {
  London: { addr: "1 Finsbury Avenue, London EC2M 2PF", lawyers: 64, t: "+44 20 7946 0310" },
  Edinburgh: { addr: "20 Castle Terrace, Edinburgh EH1 2EN", lawyers: 34, t: "+44 131 496 0420" },
  Dublin: { addr: "Two Grand Canal Square, Dublin D02 A342", lawyers: 22, t: "+353 1 555 0180" },
}

export default function Albright() {
  const { page, go } = useSite()
  const nav: [string, string][] = [
    ["expertise", "Expertise"],
    ["people", "People"],
    ["insights", "Insights"],
    ["offices", "Offices"],
  ]
  return (
    <div className="ak">
      <a href="#main" className="skip">
        Skip to content
      </a>
      <header className="ak-head">
        <button className="ak-logo" onClick={() => go("home")} aria-label="Albright Kerr, home">
          ALBRIGHT
          <br />
          KERR
        </button>
        <nav aria-label="Main">
          {nav.map(([id, l], i) => (
            <button key={id} className={page === id ? "on" : ""} onClick={() => go(id)} aria-current={page === id ? "page" : undefined}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              {l}
            </button>
          ))}
        </nav>
        <button className="ak-contact" onClick={() => go("offices")}>
          Contact a partner ↗
        </button>
      </header>
      <main id="main">
        {page === "home" && <Home />}
        {page === "expertise" && <Expertise />}
        {page === "people" && <People />}
        {page === "insights" && <Insights />}
        {page === "offices" && <Offices />}
      </main>
      <footer className="ak-foot">
        <p className="ak-foot-logo">ALBRIGHT KERR LLP</p>
        <div>
          {(Object.keys(OFFICES) as Office[]).map((o) => (
            <p key={o}>
              <b>{o}</b> {OFFICES[o].addr}
            </p>
          ))}
        </div>
        <p className="ak-legal">Demo business — Growth OS Business template. People, matters and insights are illustrative.</p>
      </footer>
    </div>
  )
}

function Home() {
  const { go } = useSite()
  return (
    <>
      <section className="ak-hero">
        <h1>
          Commercial law,
          <br />
          <span>indexed.</span>
        </h1>
        <div className="ak-hero-meta">
          <p>120 lawyers in London, Edinburgh and Dublin advising on the deals, disputes and regulation behind infrastructure, finance and technology.</p>
          <dl>
            <div>
              <dt>Lawyers</dt>
              <dd>120</dd>
            </div>
            <div>
              <dt>Practices</dt>
              <dd>12</dd>
            </div>
            <div>
              <dt>Offices</dt>
              <dd>3</dd>
            </div>
            <div>
              <dt>Founded</dt>
              <dd>1998</dd>
            </div>
          </dl>
        </div>
      </section>
      <figure className="ak-plate">
        <img src={still} alt="Concrete and brass forms on a plinth in raking afternoon light" />
        <figcaption>Plate 01 — Lobby, 1 Finsbury Avenue</figcaption>
      </figure>
      <section className="ak-cols">
        <Reveal className="ak-col">
          <h2>
            <span>A</span> Expertise
          </h2>
          <ul>
            {PRACTICES.slice(0, 6).map((p) => (
              <li key={p.n}>
                <button onClick={() => go("expertise")}>{p.n}</button>
              </li>
            ))}
          </ul>
          <button className="ak-more" onClick={() => go("expertise")}>
            All 12 practices →
          </button>
        </Reveal>
        <Reveal className="ak-col" delay={100}>
          <h2>
            <span>B</span> Latest insight
          </h2>
          <ul className="ak-ins-mini">
            {INSIGHTS.slice(0, 3).map((i) => (
              <li key={i.t}>
                <small>
                  {i.d} · {i.k}
                </small>
                <button onClick={() => go("insights")}>{i.t}</button>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal className="ak-col" delay={200}>
          <h2>
            <span>C</span> Recognition
          </h2>
          <ul className="ak-press">
            {["Band 1 — Energy & infrastructure, Scotland", "Tier 1 — Projects, Ireland", "Shortlisted — Technology team of the year", "Top-quartile for associate retention"].map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <p className="ak-note">Directory rankings shown are demo content.</p>
        </Reveal>
      </section>
      <section className="ak-careers">
        <h2>Join the firm</h2>
        <p>Training contracts open 1 November. Vacation schemes in London and Edinburgh, summer 2027.</p>
        <button className="ak-btn">Graduate programme →</button>
      </section>
    </>
  )
}

function Expertise() {
  const [sector, setSector] = useState<string>("All")
  const list = PRACTICES.filter((p) => sector === "All" || p.s.includes(sector))
  const count = (s: string) => PRACTICES.filter((p) => p.s.includes(s)).length
  return (
    <section className="ak-page">
      <h1 className="ak-ph">Expertise</h1>
      <div className="ak-filter" role="radiogroup" aria-label="Filter by sector">
        <button role="radio" aria-checked={sector === "All"} className={sector === "All" ? "on" : ""} onClick={() => setSector("All")}>
          All sectors <sup>{PRACTICES.length}</sup>
        </button>
        {SECTORS.map((s) => (
          <button key={s} role="radio" aria-checked={sector === s} className={sector === s ? "on" : ""} onClick={() => setSector(s)}>
            {s} <sup>{count(s)}</sup>
          </button>
        ))}
      </div>
      <ol className="ak-index">
        {list.map((p, i) => (
          <li key={p.n}>
            <span className="ak-i">{String(i + 1).padStart(2, "0")}</span>
            <b>{p.n}</b>
            <span className="ak-sect">{p.s.join(" / ")}</span>
            <span className="ak-n">{p.lawyers} lawyers</span>
          </li>
        ))}
      </ol>
    </section>
  )
}

function People() {
  const [q, setQ] = useState("")
  const [office, setOffice] = useState<Office | "All">("All")
  const list = useMemo(() => PEOPLE.filter((p) => (office === "All" || p.o === office) && (!q || `${p.n} ${p.p} ${p.r}`.toLowerCase().includes(q.toLowerCase()))), [q, office])
  return (
    <section className="ak-page">
      <h1 className="ak-ph">People</h1>
      <div className="ak-search">
        <label htmlFor="ak-q" className="sr-only">
          Search people by name or practice
        </label>
        <input id="ak-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, practice or role" />
        <div className="ak-filter" role="radiogroup" aria-label="Office">
          {(["All", "London", "Edinburgh", "Dublin"] as const).map((o) => (
            <button key={o} role="radio" aria-checked={office === o} className={office === o ? "on" : ""} onClick={() => setOffice(o)}>
              {o}
            </button>
          ))}
        </div>
      </div>
      <p className="ak-count" aria-live="polite">
        {list.length} {list.length === 1 ? "person" : "people"}
      </p>
      <ul className="ak-people">
        {list.map((p) => (
          <li key={p.n}>
            <span className="ak-pmono" aria-hidden>
              {p.n
                .split(" ")
                .map((x) => x[0])
                .join("")}
            </span>
            <b>{p.n}</b>
            <span>{p.r}</span>
            <span>{p.p}</span>
            <span className="ak-n">{p.o}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Insights() {
  const [s, setS] = useState("All")
  const list = INSIGHTS.filter((i) => s === "All" || i.s === s)
  return (
    <section className="ak-page">
      <h1 className="ak-ph">Insights</h1>
      <div className="ak-filter" role="radiogroup" aria-label="Sector">
        {["All", ...SECTORS].map((x) => (
          <button key={x} role="radio" aria-checked={s === x} className={s === x ? "on" : ""} onClick={() => setS(x)}>
            {x}
          </button>
        ))}
      </div>
      <ul className="ak-insights">
        {list.map((i, n) => (
          <Reveal as="li" key={i.t} delay={n * 60}>
            <small>
              {i.d} · {i.k} · {i.m} min
            </small>
            <h2>{i.t}</h2>
            <span>{i.s}</span>
          </Reveal>
        ))}
      </ul>
    </section>
  )
}

function Offices() {
  const [o, setO] = useState<Office>("London")
  const f = useForm({ name: "", email: "", co: "", msg: "" }, { name: [rules.required()], email: [rules.email()], msg: [rules.min(15)] })
  return (
    <section className="ak-page">
      <h1 className="ak-ph">Offices</h1>
      <div className="ak-offices">
        <div>
          {(Object.keys(OFFICES) as Office[]).map((k) => (
            <button key={k} className={`ak-office ${o === k ? "on" : ""}`} onClick={() => setO(k)} aria-pressed={o === k}>
              <b>{k}</b>
              <span>{OFFICES[k].addr}</span>
              <span>
                {OFFICES[k].lawyers} lawyers · {OFFICES[k].t}
              </span>
            </button>
          ))}
        </div>
        <form className="ak-form" onSubmit={f.submit()} noValidate>
          {f.status === "done" ? (
            <p role="status" className="ak-sent">
              Sent to the {o} office. A partner will reply to {f.values.email} within one business day.
            </p>
          ) : (
            <>
              <h2>Contact a partner in {o}</h2>
              {(
                [
                  ["name", "Name", "text"],
                  ["email", "Work email", "email"],
                  ["co", "Organisation", "text"],
                ] as const
              ).map(([k, l, t]) => (
                <div key={k} className={`ak-field ${f.errors[k] ? "bad" : ""}`}>
                  <label htmlFor={`f-${k}`}>{l}</label>
                  <input {...f.field(k)} type={t} />
                  {f.errors[k] && <p className="ak-err">{f.errors[k]}</p>}
                </div>
              ))}
              <div className={`ak-field ${f.errors.msg ? "bad" : ""}`}>
                <label htmlFor="f-msg">How can we help?</label>
                <textarea {...f.field("msg")} rows={4} />
                {f.errors.msg && <p className="ak-err">{f.errors.msg}</p>}
              </div>
              <button className="ak-btn" type="submit">
                {f.status === "sending" ? "Sending…" : "Send"}
              </button>
              <p className="ak-note">Please don't send confidential information until we've confirmed there's no conflict.</p>
            </>
          )}
        </form>
      </div>
    </section>
  )
}
