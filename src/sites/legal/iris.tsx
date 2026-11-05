import { useMemo, useState, type ReactNode } from "react"
import "./iris.css"
import { rules, TierBelow, TierGate, useForm } from "@/sites/kit/site-kit"

/**
 * IRIS CALDER EMPLOYMENT LAW — Low · Starter · Solo Lawyer Site
 * Set like a letter, not an advert. Plain answers, fixed first fee.
 */

const AREAS = [
  ["I", "Unfair & constructive dismissal", "You were dismissed without a fair reason or process — or made to feel you had no choice but to resign."],
  ["II", "Settlement agreements", "Your employer has offered money in exchange for you leaving. You must take independent legal advice before signing; your employer usually pays for it."],
  ["III", "Discrimination & harassment", "Treated worse because of pregnancy, disability, race, sex, age, religion or another protected characteristic."],
  ["IV", "Redundancy", "Whether the selection was fair, whether the consultation was real, and whether the payment is right."],
]

const FEES = [
  ["First call — 30 minutes", "Free", "Is there a case, how strong, and what it would cost. No obligation."],
  ["Settlement agreement review", "£450 + VAT", "Usually paid in full by your employer. Includes one round of negotiation."],
  ["Grievance or appeal letter", "£350 + VAT", "Drafted with you, ready to send within three working days."],
  ["Tribunal claim (ET1) preparation", "from £1,200 + VAT", "Fixed quote after the first call. Representation at hearing quoted separately."],
]

export default function Iris() {
  const f = useForm(
    { name: "", email: "", phone: "", date: "", what: "" },
    { name: [rules.required("Your name, please.")], email: [rules.email()], what: [rules.min(20, "A few sentences on what happened, so I can prepare.")] },
  )
  const deadline = useMemo(() => {
    if (!f.values.date) return null
    const d = new Date(f.values.date)
    if (isNaN(d.getTime())) return null
    const dl = new Date(d)
    dl.setMonth(dl.getMonth() + 3)
    dl.setDate(dl.getDate() - 1)
    const days = Math.ceil((dl.getTime() - Date.now()) / 86400000)
    return { date: dl.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }), days }
  }, [f.values.date])

  return (
    <div className="iris">
      <a href="#main" className="skip">
        Skip to content
      </a>
      <header className="ir-head">
        <a href="#top" className="ir-name">
          Iris Calder
        </a>
        <p className="ir-role">Solicitor · Employment law for employees · Leeds</p>
        <nav aria-label="Main">
          <a href="#areas">What I help with</a>
          <a href="#fees">Fees</a>
          <a href="#questions">Questions</a>
          <a href="#contact" className="ir-cta">
            Book a free first call
          </a>
        </nav>
      </header>

      <main id="main">
        <section className="ir-letter" id="top">
          <div className="ir-letter-body">
            <p className="ir-date">{new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
            <h1>
              If you've been dismissed or pushed out, you have about <em>three months</em> to act.<sup>1</sup>
            </h1>
            <p>
              I'm an employment solicitor who only acts for employees — never for employers. In a free thirty-minute call I'll tell you plainly whether you have a case, how strong it is, and what it would cost to pursue. If the answer is "not worth it", I'll say so.
            </p>
            <p>Most of my clients are in Leeds and West Yorkshire, but everything can be done by phone and email.</p>
            <p className="ir-sign">
              Iris Calder
              <span>Solicitor, admitted 2011</span>
            </p>
            <a href="#contact" className="ir-btn">
              Book a free first call
            </a>
          </div>
          <aside className="ir-notes" aria-label="Margin notes">
            <p>
              <sup>1</sup> Most claims to an employment tribunal must begin with ACAS early conciliation within three months less one day of the dismissal or last act complained of.
            </p>
            <p>
              <sup>2</sup> I reply to every enquiry within one working day — usually the same afternoon.
            </p>
            <p>
              <sup>3</sup> I won't take your case unless I think it's worth your money.
            </p>
          </aside>
        </section>

        <section className="ir-areas" id="areas" aria-labelledby="areas-h">
          <h2 id="areas-h">What I help with</h2>
          <ol>
            {AREAS.map(([n, h, p]) => (
              <li key={h}>
                <span>{n}</span>
                <h3>{h}</h3>
                <p>{p}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="ir-fees" id="fees" aria-labelledby="fees-h">
          <div>
            <h2 id="fees-h">Fees, in writing</h2>
            <p>Fixed fees for the things most people need. If your matter needs hourly work, you'll get a written estimate first and a monthly update against it.</p>
          </div>
          <table>
            <caption className="sr-only">Fixed fees</caption>
            <tbody>
              {FEES.map(([what, price, note]) => (
                <tr key={what}>
                  <th scope="row">
                    {what}
                    <small>{note}</small>
                  </th>
                  <td>{price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="ir-cred" aria-label="Background">
          <p>
            <b>Solicitor since 2011.</b> Six years at a national employee-side firm, then three as in-house counsel at an NHS trust — so I know how HR departments read a grievance. Member of the Employment Lawyers Association.
          </p>
        </section>

        {/* Scale add-on: three matters, anonymised — the proof a busier practice builds */}
        <TierGate need="scale">
          <section className="ir-cases" aria-labelledby="cases-h">
            <h2 id="cases-h">Three matters, anonymised</h2>
            <ol>
              <li>
                <span className="ir-case-out">Settled</span>
                <h3>Constructive dismissal, care home manager</h3>
                <p>Forced out after raising safeguarding concerns. Settled six weeks before hearing for <b>£34,000</b> — with an agreed reference, which mattered more than the money.</p>
                <small>7 months from first call to settlement · no tribunal fees paid</small>
              </li>
              <li>
                <span className="ir-case-out">Settled</span>
                <h3>Pregnancy discrimination, logistics planner</h3>
                <p>Demoted on return from maternity leave. The grievance letter did the work: employer settled at <b>£19,500</b> before ACAS concluded.</p>
                <small>11 weeks · one round of negotiation</small>
              </li>
              <li>
                <span className="ir-case-out">Advised only</span>
                <h3>Redundancy, regional sales lead</h3>
                <p>Selection looked fair, consultation was real, payment was right. I said so in the first call and charged nothing — the £350 letter he expected wasn't needed.</p>
                <small>One 30-minute call · £0</small>
              </li>
            </ol>
          </section>
        </TierGate>

        <section className="ir-faq" id="questions" aria-labelledby="q-h">
          <h2 id="q-h">Questions people ask first</h2>
          {[
            ["Should I resign?", "Not before speaking to someone. Resigning can turn a strong claim into a difficult one. Call first; it's free."],
            ["My employer says I must sign today.", "You can't be forced to sign a settlement agreement on the spot, and it isn't valid without independent legal advice. Ask for time and send it to me."],
            ["Do I have to pay to bring a tribunal claim?", "There are no tribunal fees for claimants at present. Your costs are legal advice and representation, if you want them."],
            ["Will my employer find out I've contacted you?", "No. Everything you tell me is confidential and privileged."],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </section>

        {/* Flagship add-on: the client area — documents, letters and case status online */}
        <TierGate need="premium">
          <section className="ir-portal" aria-labelledby="iport-h">
            <div>
              <h2 id="iport-h">Your matter, online.</h2>
              <p>Clients get a private page: every letter as it's sent, the ACAS and tribunal deadlines on a calendar, and what happens next — so you stop checking your email at midnight. You'll still get me on the phone whenever you want it.</p>
              <ul>
                <li>Letters and your bundle, filed and searchable, the moment they're issued</li>
                <li>Deadline calendar with reminders — nothing expires quietly</li>
                <li>Secure messages answered by Iris, not a trainee inbox</li>
              </ul>
            </div>
            <IrisPortalForm />
          </section>
        </TierGate>

        <section className="ir-contact" id="contact" aria-labelledby="c-h">
          <div className="ir-contact-copy">
            <h2 id="c-h">Book a free first call</h2>
            <p>Tell me briefly what happened. I'll reply within one working day with two or three times for a call.</p>
            <p className="ir-direct">
              Or call <a href="tel:01134960755">0113 496 0755</a>
              <br />
              iris@calderemployment.co.uk
            </p>
          </div>
          <TierBelow need="mid">
          {f.status === "done" ? (
            <div className="ir-sent" role="status">
              <h3>Thank you, {f.values.name.split(" ")[0]}.</h3>
              <p>Your note is with me. I'll reply to {f.values.email} by the end of the next working day. If your deadline is within a week, please also call.</p>
            </div>
          ) : (
            <form onSubmit={f.submit()} noValidate className="ir-form">
              <div className="ir-row">
                <Field label="Your name" id="name" err={f.errors.name}>
                  <input {...f.field("name")} autoComplete="name" />
                </Field>
                <Field label="Email" id="email" err={f.errors.email}>
                  <input {...f.field("email")} type="email" autoComplete="email" />
                </Field>
              </div>
              <div className="ir-row">
                <Field label="Phone (optional)" id="phone">
                  <input {...f.field("phone")} type="tel" autoComplete="tel" />
                </Field>
                <Field label="Date dismissed or last incident (optional)" id="date">
                  <input {...f.field("date")} type="date" />
                </Field>
              </div>
              {deadline && (
                <p className={`ir-deadline ${deadline.days < 21 ? "urgent" : ""}`} role="status">
                  Your ACAS early-conciliation deadline is likely around <b>{deadline.date}</b>
                  {deadline.days >= 0 ? ` — ${deadline.days} days from today.` : " — this may already have passed; call me today."} This is a guide, not advice.
                </p>
              )}
              <Field label="What happened?" id="what" err={f.errors.what}>
                <textarea {...f.field("what")} rows={5} />
              </Field>
              <button className="ir-btn" type="submit">
                {f.status === "sending" ? "Sending…" : "Send to Iris"}
              </button>
              <p className="ir-small">Confidential. Used only to reply to you.</p>
            </form>
          )}
          </TierBelow>
          <TierGate need="mid">
            <Assessment />
          </TierGate>
        </section>
      </main>

      <footer className="ir-foot">
        <span>Iris Calder Employment Law · 3 Park Row, Leeds LS1 5HN</span>
        <span>Demo business — Growth OS Starter template. Not legal advice.</span>
      </footer>
    </div>
  )
}

function Field({ label, id, err, children }: { label: string; id: string; err?: string; children: ReactNode }) {
  return (
    <div className={`ir-field ${err ? "bad" : ""}`}>
      <label htmlFor={`f-${id}`}>{label}</label>
      {children}
      {err && (
        <p className="ir-err" id={`f-${id}-err`}>
          {err}
        </p>
      )}
    </div>
  )
}

/* ── growth add-on: structured case assessment ──────────────────── */

const MATTERS = ["Dismissed or pushed out", "Settlement agreement", "Discrimination", "Redundancy", "Something else"]

function Assessment() {
  const [matter, setMatter] = useState(MATTERS[0])
  const [date, setDate] = useState("")
  const f = useForm({ aname: "", aemail: "", awhat: "" }, { aname: [rules.required("Your name, please.")], aemail: [rules.email()], awhat: [rules.min(20, "A few sentences on what happened, so I can prepare.")] })
  const deadline = useMemo(() => {
    if (!date) return null
    const d = new Date(date)
    if (isNaN(d.getTime())) return null
    const dl = new Date(d)
    dl.setMonth(dl.getMonth() + 3)
    dl.setDate(dl.getDate() - 1)
    const days = Math.ceil((dl.getTime() - Date.now()) / 86400000)
    return { date: dl.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }), days }
  }, [date])

  if (f.status === "done")
    return (
      <div className="ir-sent" role="status">
        <h3>Assessment request in.</h3>
        <p>
          {matter} — I'll read it today and reply to {f.values.aemail} with an honest read on strength, the likely cost, and two times for a call.
          {deadline && deadline.days >= 0 ? ` Your deadline is around ${deadline.date} — ${deadline.days} days.` : ""}
        </p>
      </div>
    )

  return (
    <form className="ir-form ir-assess" onSubmit={f.submit()} noValidate>
      <fieldset className="ir-chips">
        <legend>What's it about?</legend>
        {MATTERS.map((m) => (
          <button type="button" key={m} className={matter === m ? "on" : ""} aria-pressed={matter === m} onClick={() => setMatter(m)}>
            {m}
          </button>
        ))}
      </fieldset>
      <div className="ir-row">
        <Field label="Your name" id="aname" err={f.errors.aname}>
          <input {...f.field("aname")} autoComplete="name" />
        </Field>
        <Field label="Email" id="aemail" err={f.errors.aemail}>
          <input {...f.field("aemail")} type="email" autoComplete="email" />
        </Field>
      </div>
      <Field label="Date dismissed or last incident" id="adate">
        <input id="f-adate" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>
      {deadline && (
        <p className={`ir-deadline ${deadline.days < 21 ? "urgent" : ""}`} role="status">
          Your ACAS early-conciliation deadline is likely around <b>{deadline.date}</b>
          {deadline.days >= 0 ? ` — ${deadline.days} days from today.` : " — this may already have passed; call me today."} This is a guide, not advice.
        </p>
      )}
      <Field label="What happened?" id="awhat" err={f.errors.awhat}>
        <textarea {...f.field("awhat")} rows={4} />
      </Field>
      <button className="ir-btn" type="submit">
        {f.status === "sending" ? "Sending…" : "Get a case assessment"}
      </button>
      <p className="ir-small">Confidential and privileged from the moment you press send.</p>
    </form>
  )
}

/* ── flagship add-on: client-area invite ────────────────────────── */

function IrisPortalForm() {
  const f = useForm({ iport: "" }, { iport: [rules.email()] })
  if (f.status === "done")
    return (
      <div className="ir-portal-card" role="status">
        <p className="ir-small">Invite on its way</p>
        <p>Your client-area link is going to {f.values.iport}. Current clients: your matter's letters and deadlines are already filed inside.</p>
      </div>
    )
  return (
    <form className="ir-portal-card" onSubmit={f.submit()} noValidate>
      <p className="ir-small">Client access</p>
      <p>Current and new clients — the invite link arrives the same working day.</p>
      <label htmlFor="f-iport" className="sr-only">
        Email address
      </label>
      <div className="ir-portal-row">
        <input {...f.field("iport")} type="email" placeholder="you@example.com" autoComplete="email" />
        <button className="ir-btn" type="submit">
          {f.status === "sending" ? "…" : "Send"}
        </button>
      </div>
      {f.errors.iport && (
        <p className="ir-err" id="f-iport-err">
          {f.errors.iport}
        </p>
      )}
    </form>
  )
}
