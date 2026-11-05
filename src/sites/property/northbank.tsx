import { useMemo, useState } from "react"
import "./northbank.css"
import { Reveal, ref, rules, seeded, useScrollProgress, useForm, useSite } from "@/sites/kit/site-kit"

/**
 * NORTHBANK RESIDENCES — Premium · Flagship · Development Sales & Portal
 * One development, 118 residences, a sales suite that never sleeps.
 * Plot availability, floorplans, mortgage maths, brochures and an
 * applicant portal — all live, all deterministic.
 */

const PHONE = "0113 555 0218"
const TEL = PHONE.replace(/\s/g, "")
const gbp = (n: number) => `£${n.toLocaleString("en-GB")}`

/* ── the building: 118 residences ──────────────────────────────────
   Floors 2–15 hold eight residences each; floor 16 holds six
   duplexes. Plot ids are stable (floor × 100 + plot) so every
   status below is identical on every reload. */

const plotsOnFloor = (floor: number) => (floor === 16 ? 6 : 8)
const FLOOR_MIN = 2
const FLOOR_MAX = 16
const TOTAL = (() => {
  let n = 0
  for (let f = FLOOR_MIN; f <= FLOOR_MAX; f++) n += plotsOnFloor(f)
  return n
})()
const RELEASE_FLOORS = [5, 6, 7] as const

type Status = "available" | "reserved" | "sold"
type PlanId = "anchor" | "waterline" | "beacon"
const PLANS: Record<PlanId, { name: string; beds: number; base: number; sqftLo: number; sqftHi: number; label: string }> = {
  anchor: { name: "The Anchor", beds: 1, base: 214000, sqftLo: 528, sqftHi: 562, label: "One bed · 528–562 sq ft" },
  waterline: { name: "The Waterline", beds: 2, base: 292000, sqftLo: 803, sqftHi: 887, label: "Two bed · 803–887 sq ft" },
  beacon: { name: "The Beacon", beds: 3, base: 415000, sqftLo: 1120, sqftHi: 1240, label: "Three bed · 1,120–1,240 sq ft" },
}
const ASPECTS = ["water", "west", "city"] as const
const ASPECT_LABEL: Record<(typeof ASPECTS)[number], string> = {
  water: "South — over the river, floor-to-ceiling glass",
  west: "West — sunset over the station steps",
  city: "North — the Leeds skyline, morning light",
}

/* deterministic per-plot facts — seeded(id), never Math.random.
   Same plot id → same status, plan, aspect and price on every visit. */
function statusOf(id: number): Status {
  const x = seeded(id)()
  if (x > 0.45) return "sold"
  if (x > 0.19) return "reserved"
  return "available"
}
const planOf = (id: number): PlanId => {
  const x = seeded(id * 7 + 3)()
  return x > 0.66 ? "anchor" : x > 0.25 ? "waterline" : "beacon"
}
const aspectOf = (id: number) => {
  const x = seeded(id * 13 + 5)()
  return x > 0.55 ? ASPECTS[0] : x > 0.3 ? ASPECTS[1] : ASPECTS[2]
}
const sqftOf = (id: number, plan: PlanId) => {
  const p = PLANS[plan]
  return Math.round(p.sqftLo + seeded(id * 17 + 9)() * (p.sqftHi - p.sqftLo))
}
const priceOf = (id: number, plan: PlanId) => {
  const floor = Math.floor(id / 100)
  return PLANS[plan].base + floor * 1200 + (aspectOf(id) === "water" ? 8000 : 0)
}

interface Plot {
  id: number
  floor: number
  plot: number
  ref: string
  plan: PlanId
  status: Status
  aspect: (typeof ASPECTS)[number]
  sqft: number
  price: number
}
const makePlot = (floor: number, plot: number): Plot => {
  const id = floor * 100 + plot
  const plan = planOf(id)
  return { id, floor, plot, ref: `${String(floor).padStart(2, "0")}·${String(plot).padStart(2, "0")}`, plan, status: statusOf(id), aspect: aspectOf(id), sqft: sqftOf(id, plan), price: priceOf(id, plan) }
}

/* totals across all 118 — computed once, stable */
function buildingTotals() {
  let available = 0, reserved = 0, sold = 0
  for (let f = FLOOR_MIN; f <= FLOOR_MAX; f++)
    for (let p = 1; p <= plotsOnFloor(f); p++) {
      const s = statusOf(f * 100 + p)
      if (s === "available") available++
      else if (s === "reserved") reserved++
      else sold++
    }
  return { available, reserved, sold }
}

/* ── floorplans ─────────────────────────────────────────────────── */

function Floorplan({ plan, small }: { plan: PlanId; small?: boolean }) {
  const room = "var(--surface)"
  const line = "var(--line)"
  const txt = "var(--muted)"
  const fill = "color-mix(in srgb, var(--primary) 7%, transparent)"
  return (
    <svg viewBox="0 0 340 240" className={`nb-fp ${small ? "small" : ""}`} role="img" aria-label={`${PLANS[plan].name} floorplan — ${PLANS[plan].label}`}>
      <rect x="0" y="0" width="340" height="240" fill="none" stroke={line} strokeWidth="1.5" />
      {plan === "anchor" && (
        <>
          <rect x="0" y="0" width="150" height="240" fill={fill} stroke={line} />
          <rect x="150" y="0" width="190" height="150" stroke={line} fill={room} />
          <rect x="150" y="150" width="100" height="90" stroke={line} fill={room} />
          <rect x="250" y="150" width="90" height="90" stroke={line} fill={room} />
          <text x="75" y="124" fontSize="12" textAnchor="middle" fill={txt} fontFamily="var(--body)">LIVING + KITCHEN</text>
          <text x="75" y="140" fontSize="10" textAnchor="middle" fill={txt} fontFamily="var(--body)" opacity=".7">winter garden</text>
          <text x="245" y="78" fontSize="12" textAnchor="middle" fill={txt} fontFamily="var(--body)">BED</text>
          <text x="200" y="200" fontSize="11" textAnchor="middle" fill={txt} fontFamily="var(--body)">BATH</text>
          <text x="295" y="200" fontSize="10" textAnchor="middle" fill={txt} fontFamily="var(--body)">WC</text>
        </>
      )}
      {plan === "waterline" && (
        <>
          <rect x="0" y="0" width="180" height="170" fill={fill} stroke={line} />
          <rect x="180" y="0" width="160" height="170" stroke={line} fill={room} />
          <rect x="0" y="170" width="120" height="70" stroke={line} fill={room} />
          <rect x="120" y="170" width="110" height="70" stroke={line} fill={room} />
          <rect x="230" y="170" width="110" height="70" stroke={line} fill={room} />
          <text x="90" y="82" fontSize="12" textAnchor="middle" fill={txt} fontFamily="var(--body)">LIVING + DINING</text>
          <text x="90" y="98" fontSize="10" textAnchor="middle" fill={txt} fontFamily="var(--body)" opacity=".7">terrace to the water</text>
          <text x="260" y="70" fontSize="12" textAnchor="middle" fill={txt} fontFamily="var(--body)">KITCHEN</text>
          <text x="260" y="92" fontSize="11" textAnchor="middle" fill={txt} fontFamily="var(--body)">BATH</text>
          <text x="60" y="208" fontSize="12" textAnchor="middle" fill={txt} fontFamily="var(--body)">BED 1</text>
          <text x="175" y="208" fontSize="12" textAnchor="middle" fill={txt} fontFamily="var(--body)">BED 2</text>
          <text x="285" y="208" fontSize="10" textAnchor="middle" fill={txt} fontFamily="var(--body)">UTIL</text>
        </>
      )}
      {plan === "beacon" && (
        <>
          <rect x="0" y="0" width="200" height="150" fill={fill} stroke={line} />
          <rect x="200" y="0" width="140" height="150" stroke={line} fill={room} />
          <rect x="0" y="150" width="110" height="90" stroke={line} fill={room} />
          <rect x="110" y="150" width="90" height="90" stroke={line} fill={room} />
          <rect x="200" y="150" width="70" height="90" stroke={line} fill={room} />
          <rect x="270" y="150" width="70" height="90" stroke={line} fill={room} />
          <text x="100" y="72" fontSize="12" textAnchor="middle" fill={txt} fontFamily="var(--body)">LIVING + DINING</text>
          <text x="100" y="88" fontSize="10" textAnchor="middle" fill={txt} fontFamily="var(--body)" opacity=".7">corner terrace, both aspects</text>
          <text x="270" y="60" fontSize="12" textAnchor="middle" fill={txt} fontFamily="var(--body)">KITCHEN</text>
          <text x="270" y="90" fontSize="11" textAnchor="middle" fill={txt} fontFamily="var(--body)">STUDY</text>
          <text x="55" y="188" fontSize="12" textAnchor="middle" fill={txt} fontFamily="var(--body)">BED 1</text>
          <text x="55" y="204" fontSize="9" textAnchor="middle" fill={txt} fontFamily="var(--body)">EN-SUITE</text>
          <text x="155" y="192" fontSize="12" textAnchor="middle" fill={txt} fontFamily="var(--body)">BED 2</text>
          <text x="235" y="192" fontSize="10" textAnchor="middle" fill={txt} fontFamily="var(--body)">BATH</text>
          <text x="305" y="192" fontSize="10" textAnchor="middle" fill={txt} fontFamily="var(--body)">BED 3</text>
        </>
      )}
      {/* terrace hatch + north arrow on every plan */}
      <g transform="translate(318 18)">
        <path d="M0 -10 L5 8 L0 4 L-5 8 Z" fill={txt} />
        <text y="22" fontSize="9" textAnchor="middle" fill={txt} fontFamily="var(--body)">N</text>
      </g>
      <text x="10" y="232" fontSize="9" fill={txt} fontFamily="var(--mono)">INDICATIVE · DEMO PLAN</text>
    </svg>
  )
}

/* ── skyline ────────────────────────────────────────────────────── */

function Skyline() {
  const towers = [
    "M40 120 V70 h14 v50", // left block
    "M60 120 V54 h10 v18 h10 v48", // crane-adjacent
    "M92 120 V82 h18 v38", // mid
    "M120 120 V40 h6 v18 h6 v62", // the crane mast
    "M150 120 V64 h22 v56", // northbank itself (tall)
    "M186 120 V86 h16 v34", // right
    "M214 120 V58 h8 v62", // slim
    "M236 120 V92 h20 v28", // low
  ]
  return (
    <svg viewBox="0 0 320 190" className="nb-skyline" aria-hidden>
      <g className="nb-towers" fill="none" stroke="var(--ink)" strokeWidth="1.6" strokeLinejoin="round">
        {towers.map((d, i) => (
          <path key={i} d={d} opacity={0.85 - i * 0.05} />
        ))}
      </g>
      {/* crane */}
      <g className="nb-crane" stroke="var(--accent)" strokeWidth="1.4" fill="none">
        <path d="M126 40 V16 H166" />
        <path d="M132 22 L126 16 M160 16 v6" />
      </g>
      {/* windows */}
      <g fill="var(--primary)" opacity=".5">
        {[[66, 62], [76, 62], [154, 70], [164, 70], [174, 70], [154, 80], [164, 80], [174, 80], [154, 90], [164, 90], [174, 90], [44, 76], [44, 84], [96, 88], [104, 88], [218, 64], [218, 72]].map(([x, y], i) => (
          <rect key={i} x={x} y={y} width="3" height="4" opacity={i % 3 === 0 ? 0.9 : 0.35} />
        ))}
      </g>
      {/* waterline */}
      <path d="M0 128 H320" stroke="var(--line)" strokeWidth="1" />
      <path className="nb-shimmer" d="M0 128 H320" stroke="var(--primary)" strokeWidth="1.6" opacity=".55" />
      <path d="M0 136 H320 M0 144 H320 M0 152 H320 M0 160 H320 M0 168 H320 M0 176 H320" stroke="var(--line)" strokeWidth="1" opacity=".6" />
    </svg>
  )
}

/* ── root ───────────────────────────────────────────────────────── */

export default function Northbank() {
  const { page, go, motion } = useSite()
  const [picked, setPicked] = useState<Plot | null>(null)
  const totals = buildingTotals()
  const [scrollRef, prog] = useScrollProgress<HTMLDivElement>(motion >= 1)

  return (
    <div className="nb">
      <a href="#main" className="skip">
        Skip to content
      </a>
      {motion >= 1 && (
        <div className="nb-progress" aria-hidden>
          <i style={{ width: `${prog * 100}%` }} />
        </div>
      )}

      <header className="nb-head">
        <button className="nb-logo" onClick={() => go("home")} aria-label="Northbank Residences, home">
          <svg viewBox="0 0 34 34" width="30" height="30" aria-hidden>
            <rect x="3" y="6" width="28" height="18" fill="none" stroke="var(--primary)" strokeWidth="1.6" />
            <path d="M3 24 C10 20, 16 28, 23 24 S28 22, 31 24" stroke="var(--accent)" strokeWidth="1.4" fill="none" />
            <path d="M3 28 C10 24, 16 32, 23 28 S28 26, 31 28" stroke="var(--accent)" strokeWidth="1" fill="none" opacity=".6" />
            <path d="M10 24 V14 h5 v10 M19 24 V18 h5 v6" stroke="var(--ink)" strokeWidth="1.2" fill="none" />
          </svg>
          <span>
            Northbank
            <small>Residences · South Bank, Leeds</small>
          </span>
        </button>
        <nav aria-label="Main">
          {(
            [
              ["residences", "Residences"],
              ["purchase", "Purchase"],
              ["portal", "Portal"],
              ["progress", "Progress"],
            ] as const
          ).map(([id, l]) => (
            <button key={id} className={page === id ? "on" : ""} onClick={() => go(id)} aria-current={page === id ? "page" : undefined}>
              {l}
            </button>
          ))}
        </nav>
        <div className="nb-head-act">
          <a className="nb-tel" href={`tel:${TEL}`}>
            Sales suite · {PHONE}
          </a>
          <button className="nb-btn" onClick={() => go("purchase")}>
            Register interest
          </button>
        </div>
      </header>

      <div ref={scrollRef}>
        <main id="main">
          {page === "home" && <Home totals={totals} />}
          {page === "residences" && <Residences totals={totals} onPick={(p) => (setPicked(p), go("purchase"))} picked={picked} />}
          {page === "purchase" && <Purchase picked={picked} setPicked={setPicked} totals={totals} />}
          {page === "portal" && <Portal />}
          {page === "progress" && <Progress />}
        </main>

        <footer className="nb-foot">
          <div>
            <p className="nb-foot-logo">Northbank Residences</p>
            <p>Sales suite: Unit 2, Whitehall Waterfront, South Bank, Leeds LS1 4EH · open daily 10 – 6, late Thursdays to 8</p>
          </div>
          <div>
            <p>{PHONE} · reservations@northbank-leeds.co.uk</p>
            <p>Prices from {gbp(PLANS.anchor.base)} · service charge £2.10/sq ft · 999-year lease · NHBC Buildmark warranty</p>
            <p className="nb-foot-demo">Demo business — Growth OS Flagship template. Plot board, availability and portal are deterministic demo data, not a live register.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}

/* ── home ───────────────────────────────────────────────────────── */

function Home({ totals }: { totals: { available: number; reserved: number; sold: number } }) {
  const { go } = useSite()
  const [code] = useState(() => ref("NB-R"))
  const f = useForm(
    { name: "", email: "", phone: "" },
    { name: [rules.required("Who should we register?")], email: [rules.email()], phone: [rules.phone()] },
  )

  return (
    <>
      {/* HeroCinematic */}
      <section className="nb-hero">
        <figure className="nb-hero-art" aria-hidden>
          <Skyline />
        </figure>
        <div className="nb-hero-copy">
          <p className="nb-eyebrow">One development · 118 residences · completions Q3 2026</p>
          <h1>
            The water's edge, <em>wired for living.</em>
          </h1>
          <p className="nb-lede">
            Northbank is a single building on the Leeds &amp; Liverpool canal basin — one, two and three bedrooms over sixteen floors, a winter garden on every floor, and a sales suite that answers at any hour. Pick a residence from the live board, run the mortgage maths, and watch your purchase move in the portal.
          </p>
          <div className="nb-hero-act">
            <button className="nb-btn big" onClick={() => go("residences")}>
              View the release board
            </button>
            <button className="nb-ghost" onClick={() => go("purchase")}>
              Register interest →
            </button>
          </div>
          <p className="nb-hero-live" aria-live="polite">
            <i aria-hidden /> <b>{totals.available} residences available</b> of {TOTAL} · {totals.reserved} reserved · {totals.sold} sold
          </p>
        </div>
      </section>

      {/* the collection */}
      <section className="nb-plans" aria-labelledby="plans-h">
        <Reveal>
          <div className="nb-sec-head">
            <h2 id="plans-h">Three plans, one address</h2>
            <p>Every plan has a winter garden; every terrace floor has glass to the ceiling.</p>
          </div>
        </Reveal>
        <div className="nb-plan-grid">
          {(Object.keys(PLANS) as PlanId[]).map((k, i) => (
            <Reveal as="article" key={k} className="nb-plan-card" delay={i * 60}>
              <div className="nb-plan-art">
                <Floorplan plan={k} small />
              </div>
              <h3>{PLANS[k].name}</h3>
              <p className="nb-plan-spec">{PLANS[k].label}</p>
              <p className="nb-plan-price">
                from <b>{gbp(PLANS[k].base)}</b>
              </p>
              <button className="nb-ghost" onClick={() => go("residences")}>
                See the board →
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* MembershipSignup / register interest */}
      <section className="nb-register" aria-labelledby="reg-h">
        <div className="nb-register-copy">
          <h2 id="reg-h">Register interest</h2>
          <p>Release three opens in spring. Registered applicants see the board forty-eight hours before it goes public — every released residence so far has gone to a registered name.</p>
          <p className="nb-small">Sales suite: {PHONE}, daily 10–6. This form reaches a person the same working day.</p>
        </div>
        {f.status === "done" ? (
          <div className="nb-register-done" role="status">
            <p className="nb-eyebrow">Registered · {code}</p>
            <p>
              Welcome to the list, {f.values.name.split(" ")[0]}. The sales suite will call {f.values.phone} before release three goes live — and the board is already open to you in the meantime.
            </p>
            <button className="nb-ghost" onClick={() => go("residences")}>
              Browse the board meanwhile →
            </button>
          </div>
        ) : (
          <form className="nb-register-form" onSubmit={f.submit()} noValidate>
            {(
              [
                ["name", "Name", "text", "name"],
                ["email", "Email", "email", "email"],
                ["phone", "Mobile", "tel", "tel"],
              ] as const
            ).map(([k, l, t, ac]) => (
              <div key={k} className={`nb-field ${f.errors[k] ? "bad" : ""}`}>
                <label htmlFor={`f-${k}`}>{l}</label>
                <input {...f.field(k)} type={t} autoComplete={ac} />
                {f.errors[k] && (
                  <p className="nb-err" id={`f-${k}-err`}>
                    {f.errors[k]}
                  </p>
                )}
              </div>
            ))}
            <button className="nb-btn big" type="submit">
              {f.status === "sending" ? "Registering…" : "Join the release list"}
            </button>
          </form>
        )}
      </section>

      {/* why one building */}
      <section className="nb-strip" aria-label="What comes with the address">
        {[
          ["Winter gardens", "Every floor: a glazed, planted buffer that stays 18° in January."],
          ["Fibre to the door", "2 Gbit/s leased line per floor; no satellite dishes on this skyline."],
          ["Cycle store + cage", "One cage per residence, in the basement, card-locked."],
          ["Concierge 16 hours", "7am to 11pm; parcel fridges for the other eight."],
        ].map(([h, p], i) => (
          <Reveal key={h} delay={i * 50}>
            <h3>{h}</h3>
            <p>{p}</p>
          </Reveal>
        ))}
      </section>
    </>
  )
}

/* ── residences: the live board ─────────────────────────────────── */

function Residences({ totals, onPick, picked }: { totals: { available: number; reserved: number; sold: number }; onPick: (p: Plot) => void; picked: Plot | null }) {
  const [sel, setSel] = useState<Plot | null>(picked)
  const floors = useMemo(
    () => RELEASE_FLOORS.map((f) => ({ f: f as number, plots: Array.from({ length: plotsOnFloor(f) }, (_, i) => makePlot(f, i + 1)) })),
    [],
  )
  const detail = sel
  const demo = floors.flatMap((x) => x.plots).find((p) => p.status === "available")
  return (
    <section className="nb-page">
      <p className="nb-eyebrow">Live availability · release two · floors 05 – 07</p>
      <h1 className="nb-ph">The plot board</h1>
      <p className="nb-ph-sub" aria-live="polite">
        <b>{totals.available} available of {TOTAL}</b> across the building — this board shows release two. Statuses update from the reservations diary; nothing here is a tease.
      </p>

      <div className="nb-board-wrap">
        <div className="nb-board">
          {floors.map(({ f, plots }) => (
            <div key={f} className="nb-floor">
              <p className="nb-floor-name">
                Floor <b>{String(f).padStart(2, "0")}</b>
                <span>{plots.filter((p) => p.status === "available").length} free</span>
              </p>
              <div className="nb-plot-row" aria-label={`Floor ${f} plots`}>
                {plots.map((p) => (
                  <button key={p.id} aria-pressed={sel?.id === p.id} className={`nb-plot ${p.status} ${sel?.id === p.id ? "sel" : ""}`} onClick={() => setSel(p)} aria-label={`Plot ${p.ref}, ${PLANS[p.plan].name}, ${p.status}`}>
                    <b>{p.ref}</b>
                    <span>{PLANS[p.plan].beds}b</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="nb-board-key">
            <span className="nb-key available">available</span>
            <span className="nb-key reserved">reserved</span>
            <span className="nb-key sold">sold</span>
          </div>
        </div>

        {/* detail panel */}
        {detail && (
          <aside className="nb-detail" aria-live="polite">
            <header>
              <p className="nb-eyebrow">Plot {detail.ref}</p>
              <h2>{PLANS[detail.plan].name}</h2>
              <p className={`nb-status ${detail.status}`}>{detail.status === "available" ? "Available — reserving now" : detail.status === "reserved" ? "Reserved — waiting list open" : "Sold"}</p>
            </header>
            <Floorplan plan={detail.plan} small />
            <dl className="nb-detail-dl">
              <div>
                <dt>Internal area</dt>
                <dd>{detail.sqft} sq ft</dd>
              </div>
              <div>
                <dt>Aspect</dt>
                <dd>{ASPECT_LABEL[detail.aspect]}</dd>
              </div>
              <div>
                <dt>Storage</dt>
                <dd>Cage C-{detail.ref.replace("·", "")} · 3.2 m²</dd>
              </div>
              <div>
                <dt>Price</dt>
                <dd>{gbp(detail.price)}</dd>
              </div>
            </dl>
            {detail.status === "available" ? (
              <button className="nb-btn big" onClick={() => onPick(detail)}>
                Reserve this residence — £1,000
              </button>
            ) : (
              <p className="nb-detail-note">
                {detail.status === "reserved" ? "This residence is held under reservation. The wait list gets first call if it slips — register interest and you'll be told the hour it happens." : "Sold and off the board. Register interest for release three, or ask the suite about resales."}
              </p>
            )}
            <p className="nb-small">Reservation holds the plot 28 days while your solicitor takes instruction. £1,000, fully refundable if you withdraw within 14 days.</p>
          </aside>
        )}
        {!detail && (
          <aside className="nb-detail empty">
            <p>Select a plot from the board — floorplans, aspect, square footage and the cage number appear here.</p>
            <p className="nb-small">Every status on this board is deterministic demo data: the same plot is available on every visit, until the suite changes it.</p>
          </aside>
        )}
      </div>

      <p className="nb-board-foot">
        Floors 08 – 16 (including the six floor-16 duplexes) release in spring; registered applicants pick first. {demo && <button className="nb-ghost" onClick={() => setSel(demo)}>Start with an available plot →</button>}
      </p>
    </section>
  )
}

/* ── purchase ───────────────────────────────────────────────────── */

function Purchase({ picked, setPicked, totals }: { picked: Plot | null; setPicked: (p: Plot | null) => void; totals: { available: number; reserved: number; sold: number } }) {
  const { go } = useSite()
  /* price follows the picked plot until the buyer edits it manually */
  const [manualPrice, setManualPrice] = useState<number | null>(null)
  const price = manualPrice ?? picked?.price ?? 292000
  const [dep, setDep] = useState(10)
  const [term, setTerm] = useState(25)
  const [rate, setRate] = useState(4.25)
  const [code] = useState(() => ref("NB-D"))
  const monthly = (loan: number) => (loan * (rate / 100 / 12)) / (1 - Math.pow(1 + rate / 100 / 12, -(term * 12)))
  const loan = price * (1 - dep / 100)
  const m = monthly(loan)
  const equityLoan = price * 0.2
  const mEquity = monthly(price * 0.75)
  const stamp = price <= 625000 ? Math.max(0, price - 425000) * 0.05 : Math.max(0, price - 250000) * 0.05 + Math.max(0, price - 925000) * 0.05
  const [docs, setDocs] = useState<string[]>(["brochure"])
  const f = useForm({ name: "", email: "" }, { name: [rules.required("Who should we send these to?")], email: [rules.email()] })
  const DOC_LIST = [
    ["brochure", "The brochure — 48 pages, photography throughout"],
    ["floorplans", "Full floorplan pack, all three plans"],
    ["pricelist", "Release two price list (current, not April's)"],
    ["payment", "Payment plan & exchange timeline guide"],
  ]

  return (
    <section className="nb-page">
      {picked ? (
        <div className="nb-picked" role="status">
          <p className="nb-eyebrow">Reserving</p>
          <h1 className="nb-ph">
            Plot {picked.ref} — {PLANS[picked.plan].name}
          </h1>
          <p>
            {gbp(picked.price)} · {picked.sqft} sq ft · {ASPECT_LABEL[picked.aspect]} · Cage C-{picked.ref.replace("·", "")}
          </p>
          <button className="nb-ghost" onClick={() => (setPicked(null), setManualPrice(null))}>
            Clear selection ×
          </button>
        </div>
      ) : (
        <>
          <p className="nb-eyebrow">Purchase</p>
          <h1 className="nb-ph">The maths, done honestly</h1>
          <p className="nb-ph-sub">
            Bring your own numbers. {totals.available} residences are available today — <button className="nb-ghost" onClick={() => go("residences")}>pick one from the board →</button> and its price lands here automatically.
          </p>
        </>
      )}

      {/* MortgageCalculator */}
      <section className="nb-calc" aria-labelledby="calc-h">
        <div className="nb-calc-controls">
          <h2 id="calc-h">Monthly repayment</h2>
          <label htmlFor="nb-price" className="nb-label">
            Residence price
          </label>
          <input id="nb-price" type="number" min={150000} max={900000} step={500} value={price} onChange={(e) => setManualPrice(Math.max(50000, +e.target.value || 0))} className="nb-price" />
          <label htmlFor="nb-dep" className="nb-label">
            Deposit <b>{dep}%</b> — {gbp(Math.round(price * (dep / 100)))}
          </label>
          <input id="nb-dep" type="range" min={5} max={50} step={1} value={dep} onChange={(e) => setDep(+e.target.value)} aria-label="Deposit percentage" />
          <label htmlFor="nb-term" className="nb-label">
            Term
          </label>
          <select id="nb-term" value={term} onChange={(e) => setTerm(+e.target.value)}>
            {[20, 25, 30, 35].map((t) => (
              <option key={t} value={t}>
                {t} years
              </option>
            ))}
          </select>
          <label htmlFor="nb-rate" className="nb-label">
            Rate <b>{rate.toFixed(2)}%</b>
          </label>
          <input id="nb-rate" type="range" min={2} max={7} step={0.05} value={rate} onChange={(e) => setRate(+e.target.value)} aria-label="Interest rate" />
        </div>
        <div className="nb-calc-out" aria-live="polite">
          <p className="nb-calc-big">
            {gbp(Math.round(m))}
            <small> / month</small>
          </p>
          <p className="nb-calc-sub">
            capital &amp; interest, {dep}% deposit ({gbp(Math.round(loan))} borrowed)
          </p>
          <div className="nb-calc-eq">
            <p className="nb-eyebrow">Equity-loan model — worked example</p>
            <p>
              5% deposit ({gbp(Math.round(price * 0.05))}) + 20% equity loan ({gbp(Math.round(equityLoan))}) + 75% mortgage → <b>{gbp(Math.round(mEquity))}/month</b> at the same rate. Nothing is charged on the loan for the first five years.
            </p>
          </div>
          <dl className="nb-calc-dl">
            <div>
              <dt>Stamp duty, first-time buyer</dt>
              <dd>{stamp === 0 ? "£0 below £425k" : gbp(Math.round(stamp))}</dd>
            </div>
            <div>
              <dt>Service charge (est. {picked ? Math.round(picked.sqft * 2.1) : 602}/yr)</dt>
              <dd>£2.10 per sq ft</dd>
            </div>
            <div>
              <dt>Total over {term} years</dt>
              <dd>{gbp(Math.round(m * term * 12))}</dd>
            </div>
          </dl>
          <p className="nb-small">Demo arithmetic — your broker's illustration is the one that binds. <span className="nb-demo">Demo rates</span></p>
        </div>
      </section>

      {/* DocumentRequest */}
      <section className="nb-docs" aria-labelledby="docs-h">
        <div>
          <h2 id="docs-h">Request the paperwork</h2>
          <p>Tick what you want; it lands in your inbox within minutes — the price list is generated when you press send, so it's always current.</p>
          <ul className="nb-doc-list">
            {DOC_LIST.map(([id, l]) => (
              <li key={id}>
                <label className={docs.includes(id) ? "on" : ""}>
                  <input type="checkbox" checked={docs.includes(id)} onChange={(e) => setDocs(e.target.checked ? [...docs, id] : docs.filter((x) => x !== id))} />
                  <span>{l}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
        {f.status === "done" ? (
          <div className="nb-docs-done" role="status">
            <p className="nb-eyebrow">Sent · {code}</p>
            <p>
              {docs.length === 0 ? "The full pack" : docs.length + (docs.length === 1 ? " document" : " documents")} on their way to <b>{f.values.email}</b> — check spam for the floorplans, they're a big file.
            </p>
          </div>
        ) : (
          <form className="nb-docs-form" onSubmit={f.submit()} noValidate>
            {(
              [
                ["name", "Name", "text", "name"],
                ["email", "Email", "email", "email"],
              ] as const
            ).map(([k, l, t, ac]) => (
              <div key={k} className={`nb-field ${f.errors[k] ? "bad" : ""}`}>
                <label htmlFor={`f-${k}`}>{l}</label>
                <input {...f.field(k)} type={t} autoComplete={ac} />
                {f.errors[k] && (
                  <p className="nb-err" id={`f-${k}-err`}>
                    {f.errors[k]}
                  </p>
                )}
              </div>
            ))}
            <button className="nb-btn big" type="submit">
              {f.status === "sending" ? "Sending…" : "Send to my inbox"}
            </button>
          </form>
        )}
      </section>
    </section>
  )
}

/* ── portal ─────────────────────────────────────────────────────── */

function Portal() {
  const [signed, setSigned] = useState(false)
  const f = useForm({ email: "", pass: "" }, { email: [rules.email()], pass: [rules.min(6, "Six characters or more, please.")] })
  const stages = [
    { s: "done", d: "14 Dec", h: "Reservation", p: "£1,000 received; plot 06·12 held for 28 days while your solicitor took instruction." },
    { s: "done", d: "18 Dec", h: "Memorandum of sale", p: "Issued to both solicitors with the lease plan, specification and management pack." },
    { s: "done", d: "06 Jan", h: "Contract pack", p: "Your solicitor confirmed the pack is complete and the management information is acceptable." },
    { s: "now", d: "target 28 Feb", h: "Exchange", p: "What happens next: your mortgage valuation is booked for 3 Feb. Once the offer lands, contracts exchange and the reservation extends automatically if the lender is late — the suite already knows." },
    { s: "next", d: "est. June", h: "Completion", p: "Keys day, by appointment. Snagging walk with the site manager within seven days; everything logged in this portal until the warranty takes over." },
  ]

  if (signed)
    return (
      <section className="nb-page">
        <div className="nb-portal-head">
          <div>
            <p className="nb-eyebrow">Applicant portal · signed in as {f.values.email}</p>
            <h1 className="nb-ph">Plot 06·12 — The Waterline</h1>
            <p>Reservation NB-2140 · exchange target 28 Feb · completion est. June. This preview shows a real reservation's shape; the dates are demo data.</p>
          </div>
          <button className="nb-ghost" onClick={() => setSigned(false)}>
            Sign out ×
          </button>
        </div>
        <div className="nb-portal">
          {/* CaseStatusTimeline */}
          <ol className="nb-timeline" aria-label="Case status">
            {stages.map((st) => (
              <li key={st.h} className={st.s}>
                <span className="nb-tl-date">{st.d}</span>
                <b>{st.h}</b>
                <p>{st.p}</p>
              </li>
            ))}
          </ol>
          <aside className="nb-portal-side">
            <h2>What this portal replaces</h2>
            <p>Chasing phone calls. Your case moves and this page moves with it; anything that needs you is flagged with a date, and the sales suite sees the same screen.</p>
            <ul className="nb-doc-list mini">
              <li>Lease plan &amp; floorplan — PDF</li>
              <li>Specification — second fix, floors 05–07</li>
              <li>Management company account — set up at completion</li>
              <li>Snagging guide — what to book and when</li>
            </ul>
            <p className="nb-small">Ring the suite on {PHONE} and quote NB-2140 — the person who answers can see exactly this.</p>
          </aside>
        </div>

        {/* ResourceLibrary */}
        <section className="nb-resources" aria-labelledby="res-h">
          <h2 id="res-h">Library</h2>
          <div className="nb-res-grid">
            <div className="nb-res-faq">
              {[
                ["Can I change the kitchen finish?", "Yes, until second-fix on your floor — usually four months before completion. The portal flags the deadline as a dated step."],
                ["What if my mortgage offer is late?", "Reservations extend automatically, once, by 14 days. It's in the reservation agreement — clause 6."],
                ["Can I let the residence out?", "Yes, after completion, with the management company informed. There's no consent fee; there is a right-to-rent check the suite helps run."],
                ["What's a winter garden?", "A glazed, planted balcony that stays usable in January — mechanically ventilated, heated from the corridor loop, counted inside your square footage."],
              ].map(([q, a]) => (
                <details key={q}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
            <ul className="nb-res-list">
              {[
                ["Reserving a residence", "the £1,000, the 28 days, the 14-day refund window"],
                ["The equity loan, modelled", "the five-year clock, the 75% mortgage line"],
                ["Leasehold, explained plainly", "999 years, £2.10/sq ft, what the sinking fund holds"],
                ["Snagging in seven days", "what counts, what doesn't, how it's logged"],
                ["Service charge, line by line", "concierge, lift, water, insurance — per square foot"],
              ].map(([h, p]) => (
                <li key={h}>
                  <b>{h}</b>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </section>
    )

  return (
    <section className="nb-page nb-signin">
      <p className="nb-eyebrow">Applicant portal</p>
      <h1 className="nb-ph">Your case, live</h1>
      <p className="nb-ph-sub">
        Reserved applicants sign in to watch reservation → exchange → completion, with a date on every step. <b className="nb-demo">Portal preview — demo.</b> Any email and a six-plus-character password opens the preview case below.
      </p>
      <form className="nb-signin-form" onSubmit={f.submit(() => setSigned(true))} noValidate>
        {(
          [
            ["email", "Email", "email", "email"],
            ["pass", "Password", "password", "current-password"],
          ] as const
        ).map(([k, l, t, ac]) => (
          <div key={k} className={`nb-field ${f.errors[k] ? "bad" : ""}`}>
            <label htmlFor={`f-${k}`}>{l}</label>
            <input {...f.field(k)} type={t} autoComplete={ac} />
            {f.errors[k] && (
              <p className="nb-err" id={`f-${k}-err`}>
                {f.errors[k]}
              </p>
            )}
          </div>
        ))}
        <button className="nb-btn big" type="submit">
          {f.status === "sending" ? "Opening…" : "Open the preview case"}
        </button>
        <p className="nb-small">This demo never checks credentials — nothing is stored, nothing is sent.</p>
      </form>
    </section>
  )
}

/* ── progress ───────────────────────────────────────────────────── */

function Progress() {
  const { go } = useSite()
  const phases = [
    { h: "Groundworks & piling", pct: 100, when: "Complete — autumn 2022", p: "Twenty-two metres into the clay, deepest piles on the south bank. The crane base doubled as the sales suite foundation." },
    { h: "Structure", pct: 100, when: "Topped out — March 2024", p: "Floors two to sixteen, post-tensioned slabs on a fortnightly cycle. The concrete cores carry the winter-garden loops." },
    { h: "Fit-out, floors 02 – 09", pct: 62, when: "In progress — now", p: "Kitchens went in on floor seven last week; second fix starts on five on Monday. Snagging walks follow each floor at close-out." },
    { h: "Landscaping & water gardens", pct: 0, when: "Starts — spring 2026", p: "The basin steps, the towpath lights and the rain garden that the whole roof drains into. Last on site, by design." },
  ]
  return (
    <section className="nb-page">
      <p className="nb-eyebrow">Build progress · updated by the site manager, Fridays</p>
      <h1 className="nb-ph">The build, in four phases</h1>
      <p className="nb-ph-sub">Completions Q3 2026. Residents of floors two to nine complete first; the tower follows at half-floor intervals.</p>

      <ol className="nb-build">
        {phases.map((ph, i) => (
          <Reveal as="li" key={ph.h} delay={i * 60}>
            <header>
              <h2>{ph.h}</h2>
              <p className="nb-build-when">{ph.when}</p>
            </header>
            <p className="nb-build-pct" aria-label={`${ph.pct} percent complete`}>
              <b>{ph.pct === 100 ? "100%" : ph.pct === 0 ? "Not started" : `${ph.pct}%`}</b>
            </p>
            <div className="nb-bar" role="img" aria-hidden>
              <i style={{ width: `${ph.pct}%` }} />
            </div>
            <p className="nb-build-p">{ph.p}</p>
          </Reveal>
        ))}
      </ol>

      <div className="nb-diary">
        <div>
          <h2>Site diary</h2>
          <p>Three lines the site manager actually wrote. The full diary sits in the applicant portal from reservation day.</p>
        </div>
        <ul>
          {[
            ["Week 06", "Curtain walling finished on floor nine — the south corner glass is the one from the brochure, not a stand-in."],
            ["Week 05", "Show apartment fit-out began; winter-garden planting arrives from the Lincolnshire nursery on 3rd."],
            ["Week 04", "Lifts handed to the service contractor; two cars running floor two to sixteen for the fit-out."],
          ].map(([w, t]) => (
            <li key={w}>
              <b>{w}</b>
              <span>{t}</span>
            </li>
          ))}
        </ul>
        <div className="nb-diary-cta">
          <p className="nb-eyebrow">Next milestone</p>
          <p>Show apartment opens Saturday 15 March — registered applicants book the first slots.</p>
          <button className="nb-btn" onClick={() => go("purchase")}>
            Register interest
          </button>
        </div>
      </div>
    </section>
  )
}
