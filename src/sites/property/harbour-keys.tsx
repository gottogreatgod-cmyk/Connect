import { useState } from "react"
import "./harbour-keys.css"
import { openState } from "@/sites/kit/site-kit"

/**
 * HARBOUR KEYS LETTINGS — Low · Starter · Letting Agent One-Page
 * One agent, one patch. The page answers what's available, what it costs
 * and when you can view — then it hands you the phone.
 */

// Office hours: Mon–Fri 9–5.30, Sat 10–2, Sun closed (decimal hours)
const HOURS: ([number, number] | null)[] = [null, [9, 17.5], [9, 17.5], [9, 17.5], [9, 17.5], [9, 17.5], [10, 14]]
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const fmt = (x: number) => `${Math.floor(x)}:${String(Math.round((x % 1) * 60)).padStart(2, "0")}`
const PHONE = "01202 555 118"
const TEL = PHONE.replace(/\s/g, "")

const HOMES = [
  { id: 1, kind: "flat", name: "Harbour Reach, flat 2", street: "Salterns Way", beds: 2, rent: 1150, when: "Available now", note: "Second floor, balcony over the marina" },
  { id: 2, kind: "flat", name: "Quay House, flat 6", street: "The Quay", beds: 1, rent: 895, when: "From 1 March", note: "Harbour-facing, window seat in the studio" },
  { id: 3, kind: "terrace", name: "14 High Street", street: "Poole Old Town", beds: 2, rent: 1250, when: "Available now", note: "Georgian terrace over the bakery, parking permit" },
  { id: 4, kind: "semi", name: "3 Baiter Copse", street: "Baiter Road", beds: 3, rent: 1595, when: "From 18 March", note: "Five minutes' walk to the quay path, garden" },
  { id: 5, kind: "boat", name: "The Old Boathouse", street: "Salterns Marina", beds: 2, rent: 1320, when: "Let agreed", note: "Conversion with mezzanine — gone in nine days" },
  { id: 6, kind: "house", name: "22 Lilliput Lane", street: "Lilliput", beds: 3, rent: 1850, when: "Available now", note: "Detached, garage, five minutes to the shore road" },
] as const

const FEES: [string, string, string][] = [
  ["Tenancy administration", "£95", "One-off per tenancy — agreement, inventory schedule and right-to-rent checks"],
  ["Referencing", "£60 / adult", "Credit, employer and previous-landlord checks. One fee, no add-ons"],
  ["Renewal after twelve months", "£45", "Same paperwork, same price — and the rent never moves because of it"],
  ["Holding deposit", "1 week's rent", "Capped by law, comes off your first month. Never an extra"],
  ["Check-out visit", "£0", "We walk the inventory with you. That's the job"],
]

const PATCH = [
  ["BH1 – BH3", "Poole town centre, Old Town & the Quay"],
  ["BH4 – BH5", "Hamworthy & Poole harbour north shore"],
  ["BH12 – BH14", "Parkstone, Ashley Cross & Penn Hill"],
  ["BH15", "Lilliput, Sandbanks fringe & Salterns"],
]

const REVIEWS = [
  { q: "Fees printed before we'd even viewed the flat. The £60 referencing was the only surprise — because there wasn't one.", who: "Tom H. — tenant, Salterns Way", tag: "Demo review" },
  { q: "Nine days from photos to keys on our Baiter Road let, and every viewing confirmed by text the night before.", who: "Priya S. — landlord since 2021", tag: "Demo review" },
  { q: "They answer the phone. One number, one office, and they knew every street we asked about by name.", who: "The Dunns — moved from Bournemouth", tag: "Demo review" },
]

function Art({ kind }: { kind: string }) {
  const ink = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinejoin: "round" as const }
  const wash = "color-mix(in srgb, var(--primary) 10%, transparent)"
  return (
    <svg viewBox="0 0 240 130" role="img" aria-hidden focusable="false">
      {/* ground line for every drawing */}
      <path d="M10 118 H230" stroke="var(--line)" strokeWidth="2" />
      {kind === "flat" && (
        <>
          <rect x="70" y="26" width="100" height="92" rx="2" {...ink} />
          <rect x="70" y="26" width="100" height="92" fill={wash} />
          <path d="M70 74 H170 M120 26 V118" {...ink} />
          <rect x="82" y="40" width="16" height="20" fill="currentColor" opacity=".45" />
          <rect x="142" y="40" width="16" height="20" fill="currentColor" opacity=".45" />
          <rect x="82" y="88" width="16" height="20" fill="currentColor" opacity=".45" />
          <rect x="142" y="88" width="16" height="20" fill="currentColor" opacity=".45" />
          <path d="M108 118 v-14 a12 12 0 0 1 24 0 v14" {...ink} />
        </>
      )}
      {kind === "terrace" && (
        <>
          <path d="M40 118 V56 L60 40 L80 56 V118 M80 118 V56 L100 40 L120 56 V118 M120 118 V56 L140 40 L160 56 V118" {...ink} />
          <path d="M40 118 V56 L60 40 L80 56 V118 M80 118 V56 L100 40 L120 56 V118 M120 118 V56 L140 40 L160 56 V118" fill={wash} />
          <rect x="50" y="84" width="12" height="14" fill="currentColor" opacity=".45" />
          <rect x="90" y="84" width="12" height="14" fill="currentColor" opacity=".45" />
          <rect x="130" y="84" width="12" height="14" fill="currentColor" opacity=".45" />
          <path d="M60 40 v-10 M100 40 v-10 M140 40 v-10" stroke="currentColor" strokeWidth="2" />
        </>
      )}
      {kind === "semi" && (
        <>
          <path d="M50 118 V52 L80 30 L110 52 V118 M110 52 V118 H180 V52 L150 30 L120 48" {...ink} />
          <path d="M50 118 V52 L80 30 L110 52 V118 M110 52 V118 H180 V52 L150 30 L120 48" fill={wash} />
          <rect x="62" y="72" width="14" height="14" fill="currentColor" opacity=".45" />
          <rect x="130" y="72" width="14" height="14" fill="currentColor" opacity=".45" />
          <path d="M84 118 v-16 h16 v16 M150 118 v-16 h16 v16" {...ink} />
        </>
      )}
      {kind === "house" && (
        <>
          <path d="M85 118 V48 L120 24 L155 48 V118 Z" {...ink} />
          <path d="M85 118 V48 L120 24 L155 48 V118 Z" fill={wash} />
          <path d="M100 118 v-20 h16 v20 M126 118 v-20 h16 v20" {...ink} />
          <rect x="106" y="56" width="14" height="12" fill="currentColor" opacity=".45" />
          <path d="M120 24 v-8 M186 118 c0-16 -14-18 -14-30 c0-8 6-12 12-12 c6 0 10 4 10 11 c0 12 -8 14 -8 31" {...ink} />
        </>
      )}
      {kind === "boat" && (
        <>
          <path d="M60 118 V64 H170 L182 84 V118" {...ink} />
          <path d="M60 118 V64 H170 L182 84 V118" fill={wash} />
          <path d="M52 64 H186" {...ink} />
          <path d="M60 64 V54 H96 V64 M170 64 V54 H140 V64" {...ink} />
          <rect x="96" y="86" width="0" height="0" />
          <path d="M92 118 v-18 a14 14 0 0 1 28 0 v18" {...ink} />
          <circle cx="150" cy="98" r="9" fill="currentColor" opacity=".45" />
        </>
      )}
    </svg>
  )
}

export default function HarbourKeys() {
  const st = openState(HOURS)
  const today = new Date().getDay()
  const [rev, setRev] = useState(0)
  const available = HOMES.filter((h) => h.when === "Available now").length

  return (
    <div className="hk">
      <a href="#main" className="skip">
        Skip to content
      </a>

      {/* AnnouncementBar */}
      <p className="hk-announce">
        {available} homes ready to move into this month — <a href={`tel:${TEL}`}>call {PHONE}</a> and we'll book you into this week's viewing run.
      </p>

      <header className="hk-head">
        <a href="#top" className="hk-logo" aria-label="Harbour Keys Lettings, home">
          <svg viewBox="0 0 34 34" width="30" height="30" aria-hidden>
            <circle cx="17" cy="17" r="15.5" fill="none" stroke="var(--primary)" strokeWidth="1.5" />
            <circle cx="17" cy="11.5" r="4" fill="none" stroke="var(--ink)" strokeWidth="1.6" />
            <path d="M13 13.5 V21 a4 4 0 0 0 8 0 V13.5 M17 21 v5" stroke="var(--ink)" strokeWidth="1.6" fill="none" />
          </svg>
          <span>
            Harbour Keys
            <small>Lettings · Poole</small>
          </span>
        </a>
        <nav aria-label="Main">
          <a href="#homes">What's available</a>
          <a href="#fees">What it costs</a>
          <a href="#visit">Where we are</a>
        </nav>
        <a className="hk-call-small" href={`tel:${TEL}`}>
          <span>Call to book a viewing</span>
          {PHONE}
        </a>
      </header>

      <main id="main">
        {/* HeroLocal */}
        <section className="hk-hero" id="top">
          <div className="hk-hero-copy">
            <p className={`hk-status ${st.open ? "open" : ""}`}>
              <i aria-hidden /> {st.line} · viewings today {st.open ? "as normal" : "by arrangement"}
            </p>
            <h1>
              One letting agent. One patch. A page that <em>tells you everything first.</em>
            </h1>
            <p className="hk-lede">
              Harbour Keys is one office above the chandlery on Poole Quay. We let homes from the Old Town to the Sandbanks fringe — and this page answers the three questions that matter: what's available, what it costs, and when you can view. Then you ring one number and a person answers.
            </p>
            <div className="hk-actions">
              <a className="hk-btn big" href={`tel:${TEL}`}>
                Call {PHONE} to book a viewing
              </a>
              <a className="hk-link" href="#homes">
                See the six homes →
              </a>
            </div>
          </div>
          <figure className="hk-tide">
            <svg viewBox="0 0 420 300" role="img" aria-label="The office tide board: Poole Harbour low water 12:42, high 17:08, viewing runs at 10:00 and 14:00">
              <path d="M-10 240 C70 214, 140 258, 220 226 S350 186, 430 206" stroke="color-mix(in srgb, var(--accent) 45%, transparent)" strokeWidth="18" fill="none" />
              <path d="M-10 258 C80 236, 160 272, 250 246 S370 210, 430 226" stroke="color-mix(in srgb, var(--accent) 22%, transparent)" strokeWidth="12" fill="none" />
              <path d="M60 200 L120 96 L172 140 L212 52 L268 148 L322 88 L372 200" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round" />
              <path d="M120 96 L104 200 M172 140 L166 200 M212 52 L210 200 M268 148 L274 200 M322 88 L330 200" stroke="var(--ink)" strokeWidth="1.2" opacity=".5" />
              <text x="16" y="34" fontSize="12" letterSpacing="3" fill="var(--muted)" fontFamily="var(--mono)">POOLE HARBOUR — LOW WATER 12:42</text>
              <text x="16" y="286" fontSize="12" letterSpacing="2" fill="var(--muted)" fontFamily="var(--mono)">HIGH 17:08 · VIEWING RUNS 10:00 &amp; 14:00</text>
            </svg>
            <figcaption>Office tide board — the day's two viewing runs, at low tide and high.</figcaption>
          </figure>
        </section>

        {/* ListingGrid */}
        <section className="hk-homes" id="homes" aria-labelledby="homes-h">
          <div className="hk-sec-head">
            <h2 id="homes-h">What's available</h2>
            <p>Six homes on our books today. Rent is per calendar month, bills unless marked. If the tag says available, you can view this week.</p>
          </div>
          <ul className="hk-grid">
            {HOMES.map((h) => (
              <li key={h.id} className={`hk-card ${h.when === "Let agreed" ? "gone" : ""}`}>
                <figure className="hk-art">
                  <Art kind={h.kind} />
                </figure>
                <div className="hk-card-body">
                  <p className="hk-tag">{h.when}</p>
                  <h3>{h.name}</h3>
                  <p className="hk-loc">{h.street}</p>
                  <p className="hk-note">{h.note}</p>
                  <p className="hk-meta">
                    <span>{h.beds} {h.beds === 1 ? "bed" : "beds"}</span>
                    <span aria-hidden>·</span>
                    <b>£{h.rent.toLocaleString("en-GB")} pcm</b>
                  </p>
                  {h.when === "Let agreed" ? (
                    <p className="hk-view gone-note">Let agreed — ask about similar homes</p>
                  ) : (
                    <a className="hk-view" href={`tel:${TEL}`}>
                      Call to view {h.name.split(",")[0]}
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <p className="hk-sec-foot">
            Every home is let by us, managed by us and viewed with us — no portal relay races. Rents are fixed by the landlord, printed here, and never marked up.
          </p>
        </section>

        {/* FeeTransparencyPanel */}
        <section className="hk-fees" id="fees" aria-labelledby="fees-h">
          <div className="hk-fees-inner">
            <div className="hk-fees-head">
              <h2 id="fees-h">
                Fees, printed like a <em>tide ledger.</em>
              </h2>
              <p>Every fee we can ever charge a tenant, on one ruled card. No percentage games — we take nothing from your rent and nothing on top of it. If a fee isn't on this ledger, it doesn't exist.</p>
            </div>
            <ul className="hk-ledger">
              {FEES.map(([n, p, note]) => (
                <li key={n}>
                  <span className="hk-item">
                    <b>{n}</b>
                    <em>{note}</em>
                  </span>
                  <span className="hk-dots" aria-hidden />
                  <span className="hk-price">{p}</span>
                </li>
              ))}
            </ul>
            <p className="hk-fees-foot">
              Landlords: our management fee is a flat 8% of rent collected, printed on your sole-agency agreement before you sign. Deposit capped at five weeks' rent by law — we hold it with a government-approved scheme.
            </p>
          </div>
        </section>

        {/* ServiceAreaList */}
        <section className="hk-patch" aria-labelledby="patch-h">
          <div className="hk-sec-head">
            <h2 id="patch-h">The patch</h2>
            <p>Thirteen postcode districts, one office, and a landlord list built door by door since 2014.</p>
          </div>
          <ul className="hk-postcodes">
            {PATCH.map(([pc, where]) => (
              <li key={pc}>
                <b>{pc}</b>
                <span>{where}</span>
              </li>
            ))}
          </ul>
          <p className="hk-sec-foot">
            Outside BH1–BH5 and BH12–BH15? Ring anyway — if it's within cycling distance of the Quay, we probably know the street.
          </p>
        </section>

        {/* ReviewCarousel */}
        <section className="hk-reviews" aria-labelledby="rev-h">
          <h2 id="rev-h">What tenants and landlords say</h2>
          <div className="hk-carousel">
            <button className="hk-prev" onClick={() => setRev((rev + REVIEWS.length - 1) % REVIEWS.length)} aria-label="Previous review">
              ←
            </button>
            <figure className="hk-quote" aria-live="polite" aria-atomic="true">
              <blockquote>“{REVIEWS[rev].q}”</blockquote>
              <figcaption>
                {REVIEWS[rev].who} <span className="hk-rev-tag">{REVIEWS[rev].tag}</span>
              </figcaption>
            </figure>
            <button className="hk-next" onClick={() => setRev((rev + 1) % REVIEWS.length)} aria-label="Next review">
              →
            </button>
          </div>
          <div className="hk-dots" aria-label="Choose a review">
            {REVIEWS.map((r, i) => (
              <button key={r.who} aria-pressed={i === rev} aria-label={`Show review ${i + 1} of 3: ${r.who}`} className={i === rev ? "on" : ""} onClick={() => setRev(i)} />
            ))}
          </div>
        </section>

        {/* CallNowPanel */}
        <section className="hk-callnow" aria-labelledby="call-h">
          <p className="hk-call-kicker">One patch. One number. A person answers.</p>
          <a className="hk-phone" href={`tel:${TEL}`} id="call-h">
            {PHONE}
          </a>
          <p className="hk-call-note">
            {st.open ? `We're open — ${st.line.toLowerCase()}.` : `${st.line}.`} Viewings run twice a day, ten and two; Saturday mornings for working tenants. No call centre, no queue-jumping fee, no "someone will get back to you".
          </p>
        </section>

        {/* LocationCard */}
        <section className="hk-visit" id="visit" aria-labelledby="visit-h">
          <div className="hk-visit-copy">
            <h2 id="visit-h">Where we are</h2>
            <address>
              1st floor, The Chandlery
              <br />
              26 The Quay, Poole BH15 1HJ
            </address>
            <p className="hk-small">Up the stairs next to the chandlery — step-free access via the Salterns Way entrance, ring ahead and we'll meet you at the door.</p>
            <table className="hk-hours">
              <caption className="sr-only">Office hours</caption>
              <tbody>
                {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                  <tr key={d} className={d === today ? "today" : ""}>
                    <th scope="row">
                      {DAYS[d]}
                      {d === today && <span> · today</span>}
                    </th>
                    <td>{HOURS[d] ? `${fmt(HOURS[d]![0])} – ${fmt(HOURS[d]![1])}` : "Closed — viewings by arrangement"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <figure className="hk-map">
            <svg viewBox="0 0 400 300" role="img" aria-label="Harbour chart of Poole: the office sits on The Quay, between High Street and Salterns Way">
              <rect width="400" height="300" fill="var(--surface)" />
              <path d="M-10 252 C60 224, 130 268, 210 236 S340 196, 420 214" stroke="color-mix(in srgb, var(--accent) 40%, transparent)" strokeWidth="26" fill="none" strokeLinecap="round" />
              <path d="M-10 268 C70 244, 150 280, 230 252 S350 216, 420 232" stroke="color-mix(in srgb, var(--accent) 18%, transparent)" strokeWidth="10" fill="none" />
              <path d="M0 92 L400 76" stroke="var(--line)" strokeWidth="16" />
              <path d="M150 44 L138 300" stroke="var(--line)" strokeWidth="11" />
              <path d="M290 0 L306 300" stroke="var(--line)" strokeWidth="9" />
              <path d="M0 190 L400 196" stroke="var(--line)" strokeWidth="7" />
              <text x="18" y="66" fontSize="11" fill="var(--muted)" fontFamily="var(--body)" letterSpacing="1.6">HIGH STREET</text>
              <text x="24" y="176" fontSize="11" fill="var(--muted)" fontFamily="var(--body)" letterSpacing="1.6">THE QUAY</text>
              <text x="322" y="120" fontSize="11" fill="var(--muted)" fontFamily="var(--body)" letterSpacing="1.4" transform="rotate(77 322 120)">SALTERNS WAY</text>
              <text x="176" y="150" fontSize="10" fontStyle="italic" fill="var(--muted)" fontFamily="var(--display)">Poole Harbour</text>
              <circle cx="182" cy="192" r="15" fill="var(--primary)" />
              <text x="182" y="197" fontSize="12" textAnchor="middle" fill="var(--on-primary)" fontFamily="var(--display)" fontWeight="600">HK</text>
            </svg>
            <figcaption>Office on the Quay, two minutes from Poole bus station and the Old Town.</figcaption>
          </figure>
        </section>
      </main>

      {/* SiteFooter */}
      <footer className="hk-foot">
        <span className="hk-foot-logo">Harbour Keys</span>
        <span>1st floor, The Chandlery, 26 The Quay, Poole BH15 1HJ</span>
        <a href={`tel:${TEL}`}>{PHONE}</a>
        <span>hello@harbourkeys.poole</span>
        <span>Member of Propertymark &amp; The Property Ombudsman · Deposits held with mydeposits</span>
        <span className="hk-foot-small">Demo business — Growth OS Starter template.</span>
      </footer>
    </div>
  )
}
