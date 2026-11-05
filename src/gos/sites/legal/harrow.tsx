import { useState, type ReactNode } from "react"
import "./harrow.css"
import { ref, rules, useForm, useSite } from "../../kit/site-kit"

/**
 * HARROW & FINCH — Mid · Growth · Law Firm Growth
 * A six-solicitor family law practice. Lowers the temperature and turns
 * a hard week into a booked consultation.
 */

const SERVICES = [
  { id: "divorce", name: "Divorce & separation", lead: "No-fault divorce, start to final order, usually in seven to nine months.", fee: "Fixed £950 + VAT for an uncontested divorce", items: ["Applying jointly or alone", "Dividing the house, pensions and savings", "Consent orders so the deal is final"] },
  { id: "children", name: "Arrangements for children", lead: "Where the children live and how they spend time with each parent — agreed, if at all possible.", fee: "From £1,800 + VAT for a negotiated arrangement", items: ["Parenting plans", "Mediation referrals (MIAMs)", "Child arrangements orders if court is needed"] },
  { id: "finance", name: "Finances on separation", lead: "A fair split you both understand, written so it can't be reopened later.", fee: "Hourly £240 – £320 + VAT, with a written estimate first", items: ["Financial disclosure", "Pension sharing", "Spousal and child maintenance"] },
  { id: "protect", name: "Protection from abuse", lead: "Non-molestation and occupation orders, applied for urgently — sometimes the same day.", fee: "Legal aid may be available — we'll check in the first call", items: ["Same-day emergency applications", "Safe communication plans", "Referral to specialist support"] },
  { id: "cohab", name: "Living together & prenups", lead: "Cohabitation and prenuptial agreements, so the hard conversation happens while it's easy.", fee: "Fixed £1,200 + VAT", items: ["Cohabitation agreements", "Prenuptial & postnuptial agreements", "Declarations of trust"] },
]

const TEAM = [
  ["Catherine Harrow", "Founding partner", "Complex finances, farms and family businesses", "Resolution accredited specialist"],
  ["Daniel Finch", "Partner", "Children, relocation and international cases", "Collaborative lawyer"],
  ["Priya Natarajan", "Senior associate", "Divorce and pensions on separation", "Qualified 2014"],
  ["Hollie Brennan", "Associate", "Protection from abuse, urgent applications", "Legal aid supervisor"],
  ["Tom Adeyemi", "Associate", "Cohabitation and prenuptial agreements", "Qualified 2019"],
  ["Ruth Calloway", "Family mediator", "Mediation and MIAMs", "FMC accredited mediator"],
]

export default function Harrow() {
  const { page, go } = useSite()
  const exit = () => window.location.replace("https://www.bbc.co.uk/weather")
  return (
    <div className="hf">
      <a href="#main" className="skip">
        Skip to content
      </a>
      <button className="hf-exit" onClick={exit} title="Leaves this site immediately">
        Quick exit ✕
      </button>
      <header className="hf-head">
        <button className="hf-logo" onClick={() => go("home")} aria-label="Harrow & Finch, home">
          <span className="hf-crest" aria-hidden>
            H<i>&</i>F
          </span>
          <span>
            Harrow & Finch
            <small>Family Solicitors · Bath & Bristol</small>
          </span>
        </button>
        <nav aria-label="Main">
          {[
            ["services", "How we help"],
            ["team", "Our solicitors"],
          ].map(([id, l]) => (
            <button key={id} className={page === id ? "on" : ""} onClick={() => go(id)}>
              {l}
            </button>
          ))}
          <a href="tel:01225496040">01225 496 040</a>
        </nav>
        <button className="hf-btn" onClick={() => go("review")}>
          Free case review
        </button>
      </header>
      <main id="main">
        {page === "home" && <Home />}
        {page === "services" && <Services />}
        {page === "team" && <Team />}
        {page === "review" && <Review />}
      </main>
      <footer className="hf-foot">
        <div className="hf-rule" aria-hidden>
          <span>❦</span>
        </div>
        <div className="hf-foot-grid">
          <p>
            <b>Bath</b>
            <br />
            14 Queen Square, Bath BA1 2HN
          </p>
          <p>
            <b>Bristol</b>
            <br />
            31 Corn Street, Bristol BS1 1HT
          </p>
          <p>
            <b>Contact</b>
            <br />
            01225 496 040 · hello@harrowfinch.co.uk
          </p>
        </div>
        <p className="hf-legal">Demo business — Growth OS Growth template. Reviews and outcomes are illustrative and anonymised. Not legal advice.</p>
      </footer>
    </div>
  )
}

function Home() {
  const { go } = useSite()
  return (
    <>
      <section className="hf-hero">
        <p className="hf-kicker">Family law, without the fight where it isn't needed</p>
        <h1>
          A hard week deserves <em>a calm first conversation.</em>
        </h1>
        <p className="hf-lede">Six family solicitors and a mediator in Bath and Bristol. A free twenty-minute review tells you where you stand, what it might cost, and whether you need us at all.</p>
        <div className="hf-act">
          <button className="hf-btn big" onClick={() => go("review")}>
            Request a free case review
          </button>
          <span>We reply within one working day.</span>
        </div>
      </section>

      <section className="hf-ledger" aria-label="Areas of practice">
        {SERVICES.slice(0, 4).map((s, i) => (
          <button key={s.id} onClick={() => go("services")}>
            <span className="hf-num">{["i", "ii", "iii", "iv"][i]}.</span>
            <b>{s.name}</b>
            <span>{s.lead}</span>
          </button>
        ))}
      </section>

      <section className="hf-process" aria-labelledby="pr-h">
        <h2 id="pr-h">What happens after you get in touch</h2>
        <ol>
          {[
            ["Within a day", "A solicitor — not a call centre — rings you at a time you choose, from a withheld number if you prefer."],
            ["Twenty minutes", "Your free review: where you stand legally, the options, and an honest view on cost."],
            ["In writing", "A short letter confirming what we discussed and, if you instruct us, a fixed fee or estimate."],
            ["Out of court, mostly", "Four in five of our cases settle by agreement. We prepare for court so we rarely need it."],
          ].map(([h, p], i) => (
            <li key={h}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <h3>{h}</h3>
              <p>{p}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="hf-results" aria-labelledby="res-h">
        <h2 id="res-h">Recent outcomes</h2>
        <p className="hf-sub">Anonymised, with clients' permission. Every family is different.</p>
        <ul>
          {[
            ["Farm & family business", "Agreed a pension offset that kept a third-generation farm intact, without a final hearing."],
            ["Relocation", "Consent order allowing a move to Dublin, with a holiday schedule both parents signed."],
            ["Urgent protection", "Non-molestation order granted the same afternoon the client first called."],
          ].map(([k, p]) => (
            <li key={k}>
              <span className="hf-kicker">{k}</span>
              <p>{p}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="hf-voices">
        {[
          ["Catherine explained everything twice without ever making me feel slow. We settled in mediation and the children never saw the inside of a court.", "Divorce client, Bath"],
          ["I called on a Tuesday afternoon frightened. By Wednesday morning I had an order and a plan.", "Protection client, Bristol"],
        ].map(([q, a]) => (
          <figure key={a}>
            <blockquote>“{q}”</blockquote>
            <figcaption>
              — {a} <span className="hf-tag">Demo review</span>
            </figcaption>
          </figure>
        ))}
      </section>
    </>
  )
}

function Services() {
  const { go } = useSite()
  const [open, setOpen] = useState("divorce")
  return (
    <section className="hf-page">
      <p className="hf-kicker">How we help</p>
      <h1 className="hf-ph">Fees you can see before you call.</h1>
      <div className="hf-svc">
        <ul className="hf-svc-list" role="tablist" aria-orientation="vertical">
          {SERVICES.map((s) => (
            <li key={s.id}>
              <button role="tab" aria-selected={open === s.id} className={open === s.id ? "on" : ""} onClick={() => setOpen(s.id)}>
                {s.name}
              </button>
            </li>
          ))}
        </ul>
        {SERVICES.filter((s) => s.id === open).map((s) => (
          <article key={s.id} className="hf-svc-body" role="tabpanel">
            <h2>{s.name}</h2>
            <p className="hf-lede">{s.lead}</p>
            <ul>
              {s.items.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            <p className="hf-fee">{s.fee}</p>
            <button className="hf-btn" onClick={() => go("review")}>
              Free review about {s.name.toLowerCase()}
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}

function Team() {
  return (
    <section className="hf-page">
      <p className="hf-kicker">Our solicitors</p>
      <h1 className="hf-ph">Six solicitors. One mediator. Two offices.</h1>
      <div className="hf-team">
        {TEAM.map(([n, r, f, c]) => (
          <article key={n}>
            <span className="hf-mono" aria-hidden>
              {n
                .split(" ")
                .map((p) => p[0])
                .join("")}
            </span>
            <h2>{n}</h2>
            <p className="hf-kicker">{r}</p>
            <p>{f}</p>
            <p className="hf-cred">{c}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function Review() {
  const [code] = useState(() => ref("HF"))
  const [contact, setContact] = useState("phone")
  const f = useForm(
    { matter: "", other: "", name: "", email: "", phone: "", safe: "", when: "Any time", detail: "" },
    {
      matter: [rules.required("Choose the closest match — it helps us route you.")],
      name: [rules.required()],
      email: [(v) => (contact === "email" ? rules.email()(v, {}) : null)],
      phone: [(v) => (contact !== "email" ? rules.phone()(v, {}) : null)],
      safe: [rules.checked("Please confirm it's safe for us to contact you this way.")],
    },
  )
  if (f.status === "done")
    return (
      <section className="hf-page hf-done" role="status">
        <p className="hf-kicker">Received · {code}</p>
        <h1 className="hf-ph">Thank you. You've done the hardest part.</h1>
        <p>A solicitor will contact you by {contact === "email" ? `email at ${f.values.email}` : `phone (${f.values.when.toLowerCase()})`} within one working day. If you're in danger, call 999.</p>
      </section>
    )
  return (
    <section className="hf-page">
      <p className="hf-kicker">Free twenty-minute case review</p>
      <h1 className="hf-ph">Tell us a little. We'll take it from there.</h1>
      <div className="hf-review">
        <form onSubmit={f.submit()} noValidate>
          <fieldset>
            <legend>What is it about?</legend>
            <div className="hf-chips">
              {SERVICES.map((s) => (
                <button type="button" key={s.id} aria-pressed={f.values.matter === s.name} className={f.values.matter === s.name ? "on" : ""} onClick={() => f.set("matter", s.name)}>
                  {s.name}
                </button>
              ))}
            </div>
            {f.errors.matter && <p className="hf-err">{f.errors.matter}</p>}
          </fieldset>
          <HField label="The other person's name (for our conflict check)" id="other" hint="We check we've never acted for them. It's never shared.">
            <input {...f.field("other")} />
          </HField>
          <HField label="Your name" id="name" err={f.errors.name}>
            <input {...f.field("name")} autoComplete="name" />
          </HField>
          <fieldset>
            <legend>How should we contact you?</legend>
            <div className="hf-chips">
              {[
                ["phone", "Phone call"],
                ["withheld", "Phone, withheld number"],
                ["email", "Email only"],
              ].map(([id, l]) => (
                <button type="button" key={id} aria-pressed={contact === id} className={contact === id ? "on" : ""} onClick={() => setContact(id)}>
                  {l}
                </button>
              ))}
            </div>
          </fieldset>
          {contact === "email" ? (
            <HField label="Email" id="email" err={f.errors.email}>
              <input {...f.field("email")} type="email" autoComplete="email" />
            </HField>
          ) : (
            <div className="hf-two">
              <HField label="Phone" id="phone" err={f.errors.phone}>
                <input {...f.field("phone")} type="tel" autoComplete="tel" />
              </HField>
              <HField label="Best time" id="when">
                <select {...f.field("when")}>
                  {["Any time", "Mornings", "Lunchtime", "After 5pm"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </HField>
            </div>
          )}
          <HField label="Anything you'd like us to know first (optional)" id="detail">
            <textarea {...f.field("detail")} rows={4} />
          </HField>
          <label className="hf-check">
            <input type="checkbox" id="f-safe" aria-invalid={f.errors.safe ? "true" : "false"} checked={f.values.safe === "yes"} onChange={(e) => f.set("safe", e.target.checked ? "yes" : "")} />
            It's safe for Harrow & Finch to contact me this way.
          </label>
          {f.errors.safe && <p className="hf-err">{f.errors.safe}</p>}
          <button className="hf-btn big" type="submit">
            {f.status === "sending" ? "Sending securely…" : "Send my request"}
          </button>
        </form>
        <aside className="hf-aside">
          <h2>Your safety comes first</h2>
          <p>The <b>Quick exit</b> button at the top right leaves this site instantly. We'll never leave a voicemail that mentions family law unless you tell us it's safe.</p>
          <p>If you are in immediate danger, call 999. The National Domestic Abuse Helpline is free, 24 hours: 0808 2000 247.</p>
        </aside>
      </div>
    </section>
  )
}

function HField({ label, id, err, hint, children }: { label: string; id: string; err?: string; hint?: string; children: ReactNode }) {
  return (
    <div className={`hf-field ${err ? "bad" : ""}`}>
      <label htmlFor={`f-${id}`}>{label}</label>
      {children}
      {err ? (
        <p className="hf-err" id={`f-${id}-err`}>
          {err}
        </p>
      ) : (
        hint && <p className="hf-hint">{hint}</p>
      )}
    </div>
  )
}
