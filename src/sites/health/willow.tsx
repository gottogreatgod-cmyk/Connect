import { useState } from "react"
import "./willow.css"
import { TierBelow, TierGate, openState, rules, useForm } from "@/sites/kit/site-kit"

/**
 * WILLOW PEDIATRIC DENTISTRY — Low · Starter · Clinic Essentials
 * One dentist, one calm room. Reassure a nervous parent, then get the
 * first visit on the phone.
 */

const PHONE = "0117 496 0321"
const TEL = "tel:01174960321"
const HOURS: ([number, number] | null)[] = [null, [8.5, 17], [8.5, 17], [8.5, 19], [8.5, 17], [8.5, 15], [9, 12.5]]

const SERVICES = [
  { name: "Check-up & gentle clean", who: "Every child, every six months", nhs: "Free on the NHS", priv: "£45 private", icon: "smile" },
  { name: "Fluoride varnish", who: "From age 3, twice a year", nhs: "Free on the NHS", priv: "£20", icon: "shield" },
  { name: "Fissure sealants", who: "Back teeth, around age 6 and 12", nhs: "Free on the NHS", priv: "£35 per tooth", icon: "seal" },
  { name: "Fillings — white only", who: "We never use amalgam for children", nhs: "Free on the NHS", priv: "from £90", icon: "star" },
  { name: "First-tooth visit", who: "Babies from the first tooth to age 2", nhs: "Free on the NHS", priv: "£30", icon: "baby" },
  { name: "Orthodontic check", who: "From age 9 — we refer if needed", nhs: "Free on the NHS", priv: "£60", icon: "ruler" },
]

const FAQ = [
  ["My child is terrified. Will you rush them?", "No. First visits are booked for 40 minutes, not 15. If all we manage is a ride in the chair and counting teeth with a mirror, that's a good first visit. We'd rather come back next week than force it."],
  ["Can I stay in the room?", "Always. Most children sit on a parent's lap for their first check-up. You can hold their hand the whole time."],
  ["Are you taking new NHS patients?", "Yes, for children aged 0 – 17 living in Bristol. NHS dental care is free for under-18s. Parents can register privately with us, or we can recommend a local NHS practice for you."],
  ["What if it's an emergency?", "Call us — we keep two emergency slots open every weekday morning for registered children. Out of hours, call NHS 111."],
  ["Is the practice accessible?", "Ground floor, step-free, with a buggy park inside the door and a quiet room if the waiting area is too much."],
]

function Icon({ k }: { k: string }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }
  return (
    <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden>
      {k === "smile" && (
        <>
          <circle cx="16" cy="16" r="12" {...p} />
          <path d="M10.5 18.5c1.6 2.4 3.4 3.4 5.5 3.4s3.9-1 5.5-3.4" {...p} />
          <circle cx="12" cy="13" r="1.4" fill="currentColor" />
          <circle cx="20" cy="13" r="1.4" fill="currentColor" />
        </>
      )}
      {k === "shield" && <path d="M16 4l10 4v7c0 7-4.6 11-10 13C10.6 26 6 22 6 15V8z M11.5 16l3 3 6-6" {...p} />}
      {k === "seal" && <path d="M7 12c0-4 4-6 9-6s9 2 9 6-2 5-2 9-2 5-3 5-2-4-4-4-3 4-4 4-3-1-3-5-2-5-2-9z M11 13h10" {...p} />}
      {k === "star" && <path d="M16 5l3.3 6.8 7.4 1-5.4 5.2 1.3 7.3L16 21.8l-6.6 3.5 1.3-7.3L5.3 12.8l7.4-1z" {...p} />}
      {k === "baby" && (
        <>
          <circle cx="16" cy="17" r="10" {...p} />
          <path d="M16 7c-2 0-3 1.4-3 2.6M12.5 19c1 1.4 2.2 2 3.5 2s2.5-.6 3.5-2" {...p} />
        </>
      )}
      {k === "ruler" && <path d="M6 22L22 6l4 4-16 16z M11 17l2 2 M14 14l2 2 M17 11l2 2" {...p} />}
    </svg>
  )
}

/** Original tooth character — drawn for Willow, not a stock asset. */
function Tooth() {
  return (
    <svg viewBox="0 0 300 300" className="w-tooth" role="img" aria-label="Illustration of a smiling tooth holding a toothbrush">
      <ellipse cx="150" cy="268" rx="88" ry="12" fill="var(--ink)" opacity=".08" />
      <path
        d="M78 70c22-26 52-22 72-10 20-12 50-16 72 10 22 26 12 66 4 92-8 26-6 58-16 84-7 18-26 18-32 0-7-22-10-48-28-48s-21 26-28 48c-6 18-25 18-32 0-10-26-8-58-16-84-8-26-18-66 4-92z"
        fill="var(--surface)"
        stroke="var(--ink)"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <path d="M104 92c6-10 18-14 28-10" stroke="var(--ink)" strokeWidth="5" strokeLinecap="round" fill="none" opacity=".25" />
      <circle cx="122" cy="136" r="8" fill="var(--ink)" />
      <circle cx="178" cy="136" r="8" fill="var(--ink)" />
      <circle cx="108" cy="160" r="9" fill="var(--accent)" opacity=".45" />
      <circle cx="192" cy="160" r="9" fill="var(--accent)" opacity=".45" />
      <path d="M128 160c7 10 15 14 22 14s15-4 22-14" stroke="var(--ink)" strokeWidth="6" strokeLinecap="round" fill="none" />
      <g transform="rotate(-28 238 96)">
        <rect x="226" y="40" width="16" height="96" rx="8" fill="var(--primary)" stroke="var(--ink)" strokeWidth="5" />
        <rect x="222" y="26" width="24" height="22" rx="5" fill="var(--surface)" stroke="var(--ink)" strokeWidth="5" />
        <path d="M226 26v-10M234 26v-12M242 26v-10" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" />
      </g>
      <path d="M218 158c10 2 18-4 22-12" stroke="var(--ink)" strokeWidth="6" strokeLinecap="round" fill="none" />
      <g fill="var(--accent)">
        <path d="M46 70l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" />
        <path d="M262 196l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" />
      </g>
    </svg>
  )
}

export default function Willow() {
  const st = openState(HOURS)
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const fmt = (x: number) => `${Math.floor(x)}:${String(Math.round((x % 1) * 60)).padStart(2, "0")}`
  return (
    <div className="willow">
      <a href="#main" className="skip">
        Skip to content
      </a>
      <header className="w-head">
        <a href="#top" className="w-logo">
          <svg viewBox="0 0 32 32" width="34" height="34" aria-hidden>
            <path d="M8 7c4-4 8-3 8-1 0-2 4-3 8 1 3 4 1 10 0 13s-1 7-3 9c-1 1-3 1-3-1 0-3-1-6-2-6s-2 3-2 6c0 2-2 2-3 1-2-2-2-6-3-9s-3-9 0-13z" fill="var(--accent)" stroke="var(--ink)" strokeWidth="2" />
          </svg>
          <span>
            Willow <small>Pediatric Dentistry</small>
          </span>
        </a>
        <nav aria-label="Main">
          <a href="#visit">How a visit works</a>
          <a href="#care">Our care</a>
          <a href="#dentist">Meet Dr Osei</a>
          <a href="#faq">Parent questions</a>
        </nav>
        <a className="w-btn" href={TEL}>
          Call {PHONE}
        </a>
      </header>

      <main id="main">
        <section className="w-hero" id="top">
          <div>
            <p className="w-badge">Welcoming new patients · ages 0 to 17</p>
            <h1>A dentist visit your child won't dread.</h1>
            <p className="w-lede">Gentle, unhurried check-ups in one calm room in Clifton. First visits are 40 minutes, you stay by their side, and nothing happens without being shown first.</p>
            <div className="w-act">
              <a className="w-btn big" href={TEL}>
                Book a first visit
              </a>
              <a className="w-btn ghost" href="#visit">
                See how it works
              </a>
            </div>
            <ul className="w-ticks">
              <li>Free for children on the NHS</li>
              <li>Parents stay in the room</li>
              <li>Step-free, buggy-friendly</li>
            </ul>
          </div>
          <div className="w-hero-art">
            <Tooth />
            <p className={`w-open ${st.open ? "on" : ""}`}>
              <b>{st.open ? "We're open" : "Phones open soon"}</b>
              {st.line}
            </p>
          </div>
        </section>

        <section className="w-steps" id="visit" aria-labelledby="steps-h">
          <h2 id="steps-h">How a first visit works</h2>
          <ol>
            <li>
              <span className="w-n">1</span>
              <h3>Meet the room</h3>
              <p>Ride the chair up and down, wear the sunglasses, press the button that makes water. Dr Osei names every tool before it goes near a mouth.</p>
            </li>
            <li>
              <span className="w-n">2</span>
              <h3>Count the teeth</h3>
              <p>A look with a small mirror and a gentle polish if they're happy. No x-rays at a first visit unless something needs one.</p>
            </li>
            <li>
              <span className="w-n">3</span>
              <h3>Go home with a plan</h3>
              <p>A sticker, a new brush and a printed note for you: what we saw, what to do at home, and when to come back.</p>
            </li>
          </ol>
        </section>

        <section className="w-care" id="care" aria-labelledby="care-h">
          <div className="w-care-head">
            <h2 id="care-h">What we do, and what it costs</h2>
            <p>NHS dental care is free for everyone under 18. If you'd rather register privately, the private price is shown alongside.</p>
          </div>
          <ul>
            {SERVICES.map((s) => (
              <li key={s.name}>
                <span className="w-icon">
                  <Icon k={s.icon} />
                </span>
                <h3>{s.name}</h3>
                <p>{s.who}</p>
                <div className="w-price">
                  <span className="nhs">{s.nhs}</span>
                  <span>{s.priv}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="w-dentist" id="dentist" aria-labelledby="dr-h">
          <div className="w-portrait" aria-hidden>
            <span>AO</span>
          </div>
          <div>
            <p className="w-badge alt">Your dentist</p>
            <h2 id="dr-h">Dr Amara Osei</h2>
            <p className="w-quote">“Most adults who are scared of the dentist can tell you exactly which visit did it. My job is to make sure your child never has that visit.”</p>
            <p>Amara trained in paediatric dentistry in Bristol and spent eight years at a children's hospital dental unit before opening Willow in 2022. She works with Jess, our dental nurse, and Priya on reception — the same three faces every visit.</p>
          </div>
        </section>

        {/* Business add-on: the two faces beside the dentist, and the room itself */}
        <TierGate need="scale">
          <section className="w-team" aria-labelledby="team-h">
            <div className="w-care-head">
              <h2 id="team-h">The same three faces, every visit.</h2>
              <p>Children do better when the room doesn't change. Beside Dr Osei there are exactly two others — and the same chair, by the window, every time.</p>
            </div>
            <ul>
              <li>
                <span className="w-portrait small" aria-hidden>
                  <span>JT</span>
                </span>
                <h3>Jess Tran — dental nurse</h3>
                <p>Jess counts teeth in twos with the child, keeps the sunglasses box stocked and runs the sticker drawer like a bank. Eight years in children's theatres before Willow.</p>
              </li>
              <li>
                <span className="w-portrait small" aria-hidden>
                  <span>PR</span>
                </span>
                <h3>Priya Raman — reception</h3>
                <p>The voice on the phone. Priya knows every school's finishing times, holds emergency slots for toothaches, and never puts a nervous parent on hold.</p>
              </li>
              <li>
                <span className="w-portrait small room" aria-hidden>
                  <span aria-hidden>☆</span>
                </span>
                <h3>One calm room</h3>
                <p>One chair by the window, no waiting queue, a quiet corner for children who need the noise turned down, and a buggy park right inside the door.</p>
              </li>
            </ul>
          </section>
        </TierGate>

        <section className="w-faq" id="faq" aria-labelledby="faq-h">
          <h2 id="faq-h">Parent questions</h2>
          <div>
            {FAQ.map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Flagship add-on: My Willow — the parents' portal */}
        <TierGate need="premium">
          <section className="w-portal" aria-labelledby="portal-h">
            <div>
              <p className="w-badge">My Willow · for parents</p>
              <h2 id="portal-h">The six-month check-up, booked before the reminder is lost.</h2>
              <p className="w-portal-lede">When your child's recall lands, My Willow shows every after-school slot for the next six weeks — book it in the school run line. Visit notes from Dr Osei, the recall history and a direct line to Priya live in the same place.</p>
              <ul>
                <li>Book, move or cancel a check-up without calling — school-hours slots only</li>
                <li>Read the printed note from every visit again, with what to watch for next</li>
                <li>Emergency advice out of hours, and NHS 111 routing for the nights we're closed</li>
              </ul>
            </div>
            <PortalForm />
          </section>
        </TierGate>

        <section className="w-visit" aria-labelledby="visit-h">
          <TierBelow need="mid">
            <div className="w-call">
              <h2 id="visit-h">Ready when they are</h2>
              <p>Call and Priya will find a time that suits nap schedules and school runs. Evening appointments on Wednesdays, mornings on Saturdays.</p>
              <a className="w-phone" href={TEL}>
                {PHONE}
              </a>
              <p className="w-small">or email hello@willowdental.co.uk — we reply the same day.</p>
            </div>
          </TierBelow>
          <TierGate need="mid">
            <BookRequest />
          </TierGate>
          <div className="w-where">
            <h3>Find us</h3>
            <address>
              12 Princess Victoria Street
              <br />
              Clifton Village, Bristol BS8 4BX
            </address>
            <p className="w-small">Two-hour parking on the street. Bus 8 stops outside.</p>
            <table>
              <caption className="sr-only">Opening hours</caption>
              <tbody>
                {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                  <tr key={d} className={d === new Date().getDay() ? "today" : ""}>
                    <th scope="row">{days[d]}</th>
                    <td>{HOURS[d] ? `${fmt(HOURS[d]![0])} – ${fmt(HOURS[d]![1])}` : "Closed"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer className="w-foot">
        <span className="w-logo small">Willow Pediatric Dentistry</span>
        <span>12 Princess Victoria Street, Bristol BS8 4BX · {PHONE}</span>
        <span>Demo business — Growth OS Starter template.</span>
      </footer>
    </div>
  )
}

/* ── growth add-on: request an appointment online ───────────────── */

const SLOTS = ["After school", "Wednesday evening", "Saturday morning"]

function BookRequest() {
  const [slot, setSlot] = useState(SLOTS[0])
  const f = useForm(
    { child: "", age: "", parent: "", phone: "" },
    { child: [rules.required("A first name for the appointment card, please.")], age: [rules.required("Roughly how old? It changes how we book it.")], parent: [rules.required("And your name, please.")], phone: [rules.phone()] },
  )

  if (f.status === "done")
    return (
      <div className="w-call" role="status">
        <h2 id="visit-h">Request in — Priya will confirm.</h2>
        <p>
          An appointment for <b>{f.values.child}</b> ({f.values.age}), {slot.toLowerCase()}, under {f.values.parent}. Priya will text {f.values.phone} with a time within one working day — if nothing fits, she'll call and work it out with you.
        </p>
        <button className="w-btn ghost" onClick={f.reset}>
          Request another time
        </button>
      </div>
    )

  return (
    <form className="w-call w-book" onSubmit={f.submit()} noValidate>
      <h2 id="visit-h">Request an appointment</h2>
      <p>Two minutes, no phone queue. Priya confirms every request by text within one working day — and calls if anything needs talking through.</p>
      <div className="w-book-grid">
        <label>
          Child's first name
          <input {...f.field("child")} autoComplete="off" />
        </label>
        <label>
          Their age
          <input {...f.field("age")} inputMode="numeric" placeholder="e.g. 6" />
        </label>
        <label>
          Your name
          <input {...f.field("parent")} autoComplete="name" />
        </label>
        <label>
          Mobile
          <input {...f.field("phone")} type="tel" autoComplete="tel" />
        </label>
      </div>
      <fieldset className="w-book-slots">
        <legend>Best time for them</legend>
        {SLOTS.map((s) => (
          <button type="button" key={s} className={slot === s ? "on" : ""} aria-pressed={slot === s} onClick={() => setSlot(s)}>
            {s}
          </button>
        ))}
      </fieldset>
      <button className="w-btn" type="submit">
        {f.status === "sending" ? "Sending to Priya…" : "Request a time"}
      </button>
    </form>
  )
}

/* ── flagship add-on: My Willow portal signup ───────────────────── */

function PortalForm() {
  const f = useForm({ portal: "" }, { portal: [rules.email()] })
  if (f.status === "done")
    return (
      <div className="w-portal-card" role="status">
        <p className="w-badge">Portal invite sent</p>
        <p>Your My Willow invite is on its way to {f.values.portal}. Your child's recall dates were already matched — next check-up slots are waiting inside.</p>
      </div>
    )
  return (
    <form className="w-portal-card" onSubmit={f.submit()} noValidate>
      <p className="w-badge">Get your invite</p>
      <p>Registered families get the invite link by email — existing recall dates carry over, nothing to re-enter.</p>
      <label htmlFor="f-portal" className="sr-only">
        Email address
      </label>
      <div className="w-portal-row">
        <input {...f.field("portal")} type="email" placeholder="you@example.com" autoComplete="email" />
        <button className="w-btn" type="submit">
          {f.status === "sending" ? "…" : "Send"}
        </button>
      </div>
      {f.errors.portal && (
        <p className="w-err" id="f-portal-err">
          {f.errors.portal}
        </p>
      )}
    </form>
  )
}
