import { useMemo, useState, type ReactNode } from "react"
import "./kalm.css"
import { dateSeed, dayNum, dayShort, longDate, monthShort, nextDays, ref, rules, seeded, useForm, useSite } from "../../kit/site-kit"

/**
 * KALM PHYSIOTHERAPY — Mid · Growth · Clinic Booking
 * A three-physio practice that books itself: problem → person → time.
 */

type Area = "neck" | "shoulder" | "back" | "hip" | "knee" | "ankle"
const AREAS: Record<Area, { label: string; common: string; tx: string; who: string }> = {
  neck: { label: "Neck", common: "Desk posture, whiplash, headaches that start at the base of the skull", tx: "initial", who: "niamh" },
  shoulder: { label: "Shoulder", common: "Frozen shoulder, rotator cuff, pain reaching overhead", tx: "initial", who: "tomas" },
  back: { label: "Lower back", common: "Disc pain, sciatica, stiffness after sitting", tx: "initial", who: "niamh" },
  hip: { label: "Hip & pelvis", common: "Running hip pain, pregnancy & postnatal pelvic pain", tx: "pelvic", who: "aoife" },
  knee: { label: "Knee", common: "Runner's knee, ACL rehab, pain on stairs", tx: "sports", who: "tomas" },
  ankle: { label: "Ankle & foot", common: "Sprains, Achilles, plantar fasciitis", tx: "sports", who: "tomas" },
}

const TREATMENTS = [
  { id: "initial", name: "Initial assessment", mins: 60, price: 85, note: "Full history, movement assessment, first treatment and a written plan. Start here if you're new." },
  { id: "follow", name: "Follow-up treatment", mins: 40, price: 65, note: "Hands-on treatment and progressing your exercises. For returning patients." },
  { id: "sports", name: "Sports injury assessment", mins: 60, price: 90, note: "Load testing and a return-to-sport plan with timelines you can train against." },
  { id: "pelvic", name: "Pelvic health assessment", mins: 60, price: 95, note: "Pregnancy, postnatal and pelvic floor care in a private room with Aoife." },
  { id: "massage", name: "Sports massage", mins: 45, price: 60, note: "Deep tissue work for training load or desk tension. No assessment needed." },
]

const TEAM = [
  { id: "niamh", name: "Niamh Kavanagh", role: "Clinical lead", focus: "Spines, persistent pain, desk workers", initials: "NK", days: [1, 2, 4] },
  { id: "tomas", name: "Tomás Ruiz", role: "Sports physiotherapist", focus: "Running, ACL rehab, shoulders", initials: "TR", days: [1, 3, 4, 5] },
  { id: "aoife", name: "Aoife Brennan", role: "Pelvic health physio", focus: "Pregnancy, postnatal, pelvic floor", initials: "AB", days: [2, 3, 5] },
]

const TIMES = ["08:00", "09:00", "10:00", "11:00", "12:30", "14:00", "15:00", "16:00", "17:30", "18:30"]

function slotsFor(d: Date, who: string) {
  const p = TEAM.find((t) => t.id === who)!
  if (!p.days.includes(d.getDay())) return []
  const r = seeded(dateSeed(d) + who.length * 131)
  return TIMES.filter(() => r() > 0.55)
}

export default function Kalm() {
  const { page, go } = useSite()
  const [pre, setPre] = useState<{ tx?: string; who?: string }>({})
  const book = (p: { tx?: string; who?: string } = {}) => {
    setPre(p)
    go("book")
  }
  return (
    <div className="kalm">
      <a href="#main" className="skip">
        Skip to content
      </a>
      <header className="kl-head">
        <button className="kl-logo" onClick={() => go("home")} aria-label="Kalm Physiotherapy, home">
          <span className="kl-mark" aria-hidden />
          kalm<span>physio</span>
        </button>
        <nav aria-label="Main">
          {[
            ["home", "Overview"],
            ["treatments", "Treatments & prices"],
          ].map(([id, l]) => (
            <button key={id} className={page === id ? "on" : ""} onClick={() => go(id)}>
              {l}
            </button>
          ))}
        </nav>
        <p className="kl-meta">Portobello, Dublin 8 · 01 555 0193</p>
        <button className="kl-btn" onClick={() => book()}>
          Book online
        </button>
      </header>
      <main id="main">
        {page === "home" && <Home book={book} />}
        {page === "treatments" && <Treatments book={book} />}
        {page === "book" && <Book pre={pre} />}
      </main>
      <footer className="kl-foot">
        <div>
          <p className="kl-logo static">
            <span className="kl-mark" aria-hidden />
            kalm<span>physio</span>
          </p>
          <p>21 Lennox Street, Portobello, Dublin 8, D08 X2F4</p>
        </div>
        <p>
          Mon – Fri 08:00 – 20:00
          <br />
          hello@kalmphysio.ie · 01 555 0193
        </p>
        <p className="kl-small">Health-insurance receipts provided for VHI, Laya and Irish Life. Demo business — Growth OS template.</p>
      </footer>
      {page !== "book" && (
        <button className="kl-sticky" onClick={() => book()}>
          Book an assessment · from €85
        </button>
      )}
    </div>
  )
}

/* ── body map ────────────────────────────────────────────────────── */

const ZONES: { id: Area; cx: number; cy: number; r: number }[] = [
  { id: "neck", cx: 100, cy: 58, r: 13 },
  { id: "shoulder", cx: 70, cy: 76, r: 13 },
  { id: "back", cx: 100, cy: 128, r: 18 },
  { id: "hip", cx: 86, cy: 176, r: 14 },
  { id: "knee", cx: 82, cy: 244, r: 12 },
  { id: "ankle", cx: 80, cy: 318, r: 11 },
]

function BodyMap({ area, onPick }: { area: Area | null; onPick: (a: Area) => void }) {
  return (
    <svg viewBox="0 0 200 350" className="kl-body" role="group" aria-label="Choose where it hurts">
      <g fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round">
        <circle cx="100" cy="30" r="20" />
        <path d="M88 48h24l2 14c14 2 30 6 38 16 6 8 8 40 12 70l-14 4-12-58-2 52c2 14 4 26 2 38l-6 74 4 52h-18l-6-56-8-70-8 70-6 56H72l4-52-6-74c-2-12 0-24 2-38l-2-52-12 58-14-4c4-30 6-62 12-70 8-10 24-14 38-16z" />
      </g>
      {ZONES.map((z) => (
        <g key={z.id}>
          <circle
            cx={z.cx}
            cy={z.cy}
            r={z.r}
            className={`kl-zone ${area === z.id ? "on" : ""}`}
            tabIndex={0}
            role="button"
            aria-pressed={area === z.id}
            aria-label={AREAS[z.id].label}
            onClick={() => onPick(z.id)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onPick(z.id))}
          />
        </g>
      ))}
    </svg>
  )
}

function Home({ book }: { book: (p?: { tx?: string; who?: string }) => void }) {
  const [area, setArea] = useState<Area | null>("back")
  const a = area ? AREAS[area] : null
  const tx = a ? TREATMENTS.find((t) => t.id === a.tx)! : null
  const who = a ? TEAM.find((t) => t.id === a.who)! : null
  return (
    <>
      <section className="kl-hero">
        <div>
          <p className="kl-eyebrow">Physiotherapy · Dublin 8</p>
          <h1>
            Sore today.
            <br />
            <span>A plan by tonight.</span>
          </h1>
          <p className="kl-lede">Three chartered physiotherapists, one quiet clinic on Lennox Street. Pick where it hurts, see who's best for it, and book a real slot — the earliest is usually within two working days.</p>
          <div className="kl-hero-facts">
            <div>
              <b>2 days</b>
              <span>typical wait</span>
            </div>
            <div>
              <b>60 min</b>
              <span>first visit, not 30</span>
            </div>
            <div>
              <b>€85</b>
              <span>assessment, receipted</span>
            </div>
          </div>
        </div>
        <div className="kl-finder" aria-labelledby="finder-h">
          <h2 id="finder-h">Where does it hurt?</h2>
          <div className="kl-finder-grid">
            <BodyMap area={area} onPick={setArea} />
            <div className="kl-finder-out" aria-live="polite">
              <div className="kl-chips" role="radiogroup" aria-label="Body area">
                {(Object.keys(AREAS) as Area[]).map((k) => (
                  <button key={k} role="radio" aria-checked={area === k} className={area === k ? "on" : ""} onClick={() => setArea(k)}>
                    {AREAS[k].label}
                  </button>
                ))}
              </div>
              {a && tx && who && (
                <div className="kl-match">
                  <p className="kl-small">Often: {a.common}</p>
                  <p className="kl-rec">
                    We'd suggest <b>{tx.name}</b> with <b>{who.name}</b>
                  </p>
                  <p className="kl-small">
                    {tx.mins} min · €{tx.price}
                  </p>
                  <button className="kl-btn" onClick={() => book({ tx: tx.id, who: who.id })}>
                    Book this with {who.name.split(" ")[0]}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="kl-how">
        <h2>What happens at Kalm</h2>
        <ol>
          {[
            ["Assess", "We look at how you move, not just where it hurts. Most pain has a reason two joints away."],
            ["Treat", "Hands-on work in the first session, so you leave feeling different — not just informed."],
            ["Plan", "A written plan by email that evening: exercises with videos, expected timeline, when to come back."],
            ["Discharge", "Most people need three to five sessions. We'll tell you when you don't need us."],
          ].map(([h, p], i) => (
            <li key={h}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <h3>{h}</h3>
              <p>{p}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="kl-team" aria-labelledby="team-h">
        <h2 id="team-h">Your physiotherapists</h2>
        <div className="kl-team-grid">
          {TEAM.map((t) => (
            <article key={t.id}>
              <span className="kl-avatar" aria-hidden>
                {t.initials}
              </span>
              <h3>{t.name}</h3>
              <p className="kl-role">{t.role}</p>
              <p>{t.focus}</p>
              <p className="kl-small">In clinic {t.days.map((d) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]).join(", ")}</p>
              <button className="kl-link" onClick={() => book({ who: t.id })}>
                See {t.name.split(" ")[0]}'s availability →
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="kl-reviews">
        {[
          ["Booked at 11pm, seen at 9am. Tomás had me running again in five weeks with a plan I could actually follow.", "Ciara, marathon training"],
          ["The first physio who looked at my hips for my back pain. Three sessions and done.", "Declan, desk worker"],
        ].map(([q, a]) => (
          <figure key={a}>
            <blockquote>{q}</blockquote>
            <figcaption>
              {a} · <span className="kl-tag">Demo review</span>
            </figcaption>
          </figure>
        ))}
      </section>

      <section className="kl-faq">
        <h2>Good to know</h2>
        <div>
          {[
            ["Do I need a GP referral?", "No. You can book directly. If we think you need imaging or a GP, we'll write the referral letter for you."],
            ["Will my insurance cover it?", "Most Irish health insurers reimburse part of each session. We give a receipt with our CORU registration on it for your claim."],
            ["What should I wear?", "Something you can move in — shorts for knees and hips, a vest top for shoulders and necks."],
            ["What if I need to cancel?", "Free cancellation up to 24 hours before. Inside 24 hours we charge 50%, unless you're unwell."],
          ].map(([q, a]) => (
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

function Treatments({ book }: { book: (p?: { tx?: string }) => void }) {
  return (
    <section className="kl-page">
      <p className="kl-eyebrow">Treatments & prices</p>
      <h1 className="kl-ph">Clear prices. No packages to sign.</h1>
      <div className="kl-tx-list">
        {TREATMENTS.map((t) => (
          <article key={t.id}>
            <div>
              <h2>{t.name}</h2>
              <p>{t.note}</p>
            </div>
            <p className="kl-tx-meta">
              <b>€{t.price}</b>
              <span>{t.mins} minutes</span>
            </p>
            <button className="kl-btn" onClick={() => book({ tx: t.id })}>
              Book
            </button>
          </article>
        ))}
      </div>
      <p className="kl-small">Student and over-65 rate: €10 off any session. Payment by card on the day.</p>
    </section>
  )
}

/* ── booking: treatment → physio → slot → details ────────────────── */

function Book({ pre }: { pre: { tx?: string; who?: string } }) {
  const [tx, setTx] = useState(pre.tx ?? "")
  const [who, setWho] = useState(pre.who ?? "")
  const [slot, setSlot] = useState<{ d: Date; t: string } | null>(null)
  const [code] = useState(() => ref("KLM"))
  const days = useMemo(() => nextDays(10), [])
  const f = useForm({ name: "", email: "", phone: "", note: "", consent: "" }, { name: [rules.required()], email: [rules.email()], phone: [rules.phone()], consent: [rules.checked("Please confirm so we can store your notes.")] })
  const T = TREATMENTS.find((x) => x.id === tx)
  const W = TEAM.find((x) => x.id === who)
  const step = !tx ? 0 : !who ? 1 : !slot ? 2 : 3

  if (f.status === "done" && T && W && slot)
    return (
      <section className="kl-page kl-done" role="status">
        <span className="kl-check" aria-hidden>
          ✓
        </span>
        <h1 className="kl-ph">You're booked in.</h1>
        <dl>
          <dt>What</dt>
          <dd>
            {T.name} · {T.mins} min · €{T.price}
          </dd>
          <dt>With</dt>
          <dd>{W.name}</dd>
          <dt>When</dt>
          <dd>
            {longDate(slot.d)} at {slot.t}
          </dd>
          <dt>Reference</dt>
          <dd>{code}</dd>
        </dl>
        <p>We've emailed {f.values.email} a calendar invite and a short form to fill in before you arrive. Wear something you can move in.</p>
      </section>
    )

  return (
    <section className="kl-page kl-book">
      <p className="kl-eyebrow">Book online</p>
      <h1 className="kl-ph">Book an appointment</h1>
      <ol className="kl-progress" aria-label="Progress">
        {["Treatment", "Physio", "Time", "Details"].map((s, i) => (
          <li key={s} className={i === step ? "on" : i < step ? "done" : ""} aria-current={i === step ? "step" : undefined}>
            {s}
          </li>
        ))}
      </ol>
      <div className="kl-book-grid">
        <div>
          <Panel n="1" title="Treatment" done={!!T} summary={T && `${T.name} · ${T.mins} min · €${T.price}`} onEdit={() => (setTx(""), setSlot(null))}>
            <div className="kl-options">
              {TREATMENTS.map((t) => (
                <button key={t.id} onClick={() => setTx(t.id)}>
                  <b>{t.name}</b>
                  <span>
                    {t.mins} min · €{t.price}
                  </span>
                  <small>{t.note}</small>
                </button>
              ))}
            </div>
          </Panel>
          {T && (
            <Panel n="2" title="Physiotherapist" done={!!W} summary={W && `${W.name} — ${W.role}`} onEdit={() => (setWho(""), setSlot(null))}>
              <div className="kl-options three">
                {TEAM.filter((p) => tx !== "pelvic" || p.id === "aoife").map((p) => (
                  <button key={p.id} onClick={() => setWho(p.id)}>
                    <span className="kl-avatar sm" aria-hidden>
                      {p.initials}
                    </span>
                    <b>{p.name}</b>
                    <small>{p.focus}</small>
                  </button>
                ))}
              </div>
              {tx === "pelvic" && <p className="kl-small">Pelvic health appointments are with Aoife only.</p>}
            </Panel>
          )}
          {T && W && (
            <Panel n="3" title="Time" done={!!slot} summary={slot && `${longDate(slot.d)} · ${slot.t}`} onEdit={() => setSlot(null)}>
              <div className="kl-cal">
                {days.map((d) => {
                  const s = slotsFor(d, W.id)
                  return (
                    <div key={d.toISOString()} className="kl-cal-day">
                      <p>
                        <span>{dayShort(d)}</span>
                        <b>{dayNum(d)}</b>
                        <span>{monthShort(d)}</span>
                      </p>
                      {s.length === 0 ? (
                        <em>{d.getDay() === 0 || d.getDay() === 6 ? "Closed" : "Not in"}</em>
                      ) : (
                        s.map((t) => (
                          <button key={t} onClick={() => setSlot({ d, t })}>
                            {t}
                          </button>
                        ))
                      )}
                    </div>
                  )
                })}
              </div>
            </Panel>
          )}
          {slot && (
            <form className="kl-panel open" onSubmit={f.submit()} noValidate>
              <h2>
                <span>4</span> Your details
              </h2>
              <div className="kl-fields">
                <KField label="Full name" id="name" err={f.errors.name}>
                  <input {...f.field("name")} autoComplete="name" />
                </KField>
                <KField label="Email" id="email" err={f.errors.email}>
                  <input {...f.field("email")} type="email" autoComplete="email" />
                </KField>
                <KField label="Mobile" id="phone" err={f.errors.phone}>
                  <input {...f.field("phone")} type="tel" autoComplete="tel" />
                </KField>
                <KField label="What's bothering you? (optional)" id="note">
                  <input {...f.field("note")} />
                </KField>
              </div>
              <label className="kl-consent">
                <input type="checkbox" id="f-consent" aria-invalid={f.errors.consent ? "true" : "false"} checked={f.values.consent === "yes"} onChange={(e) => f.set("consent", e.target.checked ? "yes" : "")} />I agree Kalm can keep clinical notes about my care, as described in the privacy notice.
              </label>
              {f.errors.consent && <p className="kl-err">{f.errors.consent}</p>}
              <button className="kl-btn big" type="submit">
                {f.status === "sending" ? "Booking…" : "Confirm booking"}
              </button>
            </form>
          )}
        </div>
        <aside className="kl-summary" aria-label="Summary">
          <p className="kl-eyebrow">Summary</p>
          <dl>
            <dt>Treatment</dt>
            <dd>{T?.name ?? "—"}</dd>
            <dt>Physio</dt>
            <dd>{W?.name ?? "—"}</dd>
            <dt>Time</dt>
            <dd>{slot ? `${dayShort(slot.d)} ${dayNum(slot.d)} ${monthShort(slot.d)} · ${slot.t}` : "—"}</dd>
          </dl>
          <p className="kl-sum-price">
            <span>Pay on the day</span>
            <b>{T ? `€${T.price}` : "—"}</b>
          </p>
          <p className="kl-small">Free cancellation up to 24 hours before.</p>
        </aside>
      </div>
    </section>
  )
}

function Panel({ n, title, done, summary, onEdit, children }: { n: string; title: string; done: boolean; summary?: string | false | null; onEdit: () => void; children: ReactNode }) {
  return (
    <div className={`kl-panel ${done ? "done" : "open"}`}>
      <h2>
        <span>{done ? "✓" : n}</span> {title}
        {done && (
          <button className="kl-link" onClick={onEdit}>
            Change
          </button>
        )}
      </h2>
      {done ? <p className="kl-panel-sum">{summary}</p> : children}
    </div>
  )
}

function KField({ label, id, err, children }: { label: string; id: string; err?: string; children: ReactNode }) {
  return (
    <div className={`kl-field ${err ? "bad" : ""}`}>
      <label htmlFor={`f-${id}`}>{label}</label>
      {children}
      {err && (
        <p className="kl-err" id={`f-${id}-err`}>
          {err}
        </p>
      )}
    </div>
  )
}
