import { useMemo, useState } from "react"
import "./crestline.css"
import { Reveal, dayNum, dayShort, longDate, monthShort, nextDays, openState, ref, rules, seeded, useForm, useSite } from "@/sites/kit/site-kit"

/**
 * CRESTLINE ESTATES — High · Business · Multi-Branch Agency
 * Twelve branches, ninety negotiators, one ledger of proof. Each branch
 * runs its own ledger of solds; the site routes every instruction to the
 * right office and puts the proof behind every claim.
 */

type BranchId = "roc" | "bol" | "bur"
const BRANCHES: Record<BranchId, { name: string; short: string; addr: string; phone: string; manager: string; hours: ([number, number] | null)[]; solds: number }> = {
  roc: {
    name: "Rochdale", short: "Rochdale — head office", addr: "1 The Esplanade, Rochdale OL16 1AE", phone: "01706 555 210", manager: "Gerald Whitmore",
    hours: [null, [8.5, 18], [8.5, 18], [8.5, 18], [8.5, 18], [8.5, 18], [9, 16]],
    solds: 152,
  },
  bol: {
    name: "Bolton", short: "Bolton", addr: "44 Deansgate, Bolton BL1 1BB", phone: "01204 555 318", manager: "Aisha Khan",
    hours: [null, [9, 17.5], [9, 17.5], [9, 17.5], [9, 17.5], [9, 17.5], [9, 13]],
    solds: 164,
  },
  bur: {
    name: "Bury", short: "Bury", addr: "12 The Rock, Bury BL9 0AA", phone: "01617 655 427", manager: "Stephen Okoye",
    hours: [null, [9, 17.5], [9, 17.5], [9, 17.5], [9, 17.5], [9, 17.5], [9, 16]],
    solds: 96,
  },
}
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const fmtH = (x: number) => `${Math.floor(x)}:${String(Math.round((x % 1) * 60)).padStart(2, "0")}`

const gbp = (n: number) => `£${n.toLocaleString("en-GB")}`

/* deterministic listing tags — same id, same tag, every reload */
const tagFor = (i: number) => {
  const r = seeded(i * 7919 + 11)
  const a = r()
  const b = r()
  if (a > 0.8) return "Under offer"
  if (b > 0.62) return "New instruction"
  return "For sale"
}

const LISTINGS = [
  { id: "c1", i: 0, b: "roc" as BranchId, addr: "8 Meadow View, Norden", kind: "semi", beds: 3, price: 235000, tenure: "Freehold", blurb: "Cul-de-sac semi with the extended kitchen families ask for by name." },
  { id: "c2", i: 1, b: "roc" as BranchId, addr: "21 Sparrow Hill", kind: "terrace", beds: 2, price: 128500, tenure: "Freehold", blurb: "Period terrace over the town hall; two doubles and a walled yard." },
  { id: "c3", i: 2, b: "roc" as BranchId, addr: "Flat 4, Smithy Bridge Court", kind: "flat", beds: 2, price: 110000, tenure: "Leasehold · 141 yrs", blurb: "Canal-side, five minutes on foot to Smithy Bridge station." },
  { id: "c4", i: 3, b: "roc" as BranchId, addr: "3 Walsden Road, Littleborough", kind: "detached", beds: 4, price: 375000, tenure: "Freehold", blurb: "Stone detached with the Peak at the back gate; garage and drive." },
  { id: "c5", i: 4, b: "bol" as BranchId, addr: "17 Chorley Old Road", kind: "semi", beds: 3, price: 215000, tenure: "Freehold", blurb: "Bay-fronted semi on the Bolton School bus route; south garden." },
  { id: "c6", i: 5, b: "bol" as BranchId, addr: "5 Victorian Terrace, Churchgate", kind: "terrace", beds: 2, price: 145000, tenure: "Freehold", blurb: "Two-over-two by the parish church; cellar already tanked." },
  { id: "c7", i: 6, b: "bol" as BranchId, addr: "62 Egerton Vale, Bromley Cross", kind: "detached", beds: 4, price: 495000, tenure: "Freehold", blurb: "The right side of Egerton; five bedrooms, two en-suite." },
  { id: "c8", i: 7, b: "bol" as BranchId, addr: "Flat 12, Bradshawgate Halls", kind: "flat", beds: 1, price: 89950, tenure: "Leasehold · 112 yrs", blurb: "First-floor flat in the mill conversion; ideal first rung." },
  { id: "c9", i: 8, b: "bur" as BranchId, addr: "9 Holcome Village Row", kind: "cottage", beds: 3, price: 265000, tenure: "Freehold", blurb: "Weaver's cottage with the original loom stair and a slate roof." },
  { id: "c10", i: 9, b: "bur" as BranchId, addr: "14 Whitefield Road, Unsworth", kind: "detached", beds: 4, price: 430000, tenure: "Freehold", blurb: "Detached with the annex potential surveyors love; two driveways." },
]

const AGENTS = [
  { name: "Gerald Whitmore", role: "Branch partner", b: "roc" as BranchId, spec: "Period homes of Sparrow Hill & the Old Town", sold: 34 },
  { name: "Aisha Khan", role: "Branch partner", b: "bol" as BranchId, spec: "First-time buyers and the Churchgate flats", sold: 41 },
  { name: "Stephen Okoye", role: "Branch partner", b: "bur" as BranchId, spec: "Ramsbottom cottages and village stock", sold: 29 },
  { name: "Lena Fairhurst", role: "Senior negotiator", b: "roc" as BranchId, spec: "Norden and the new-build estates", sold: 26 },
  { name: "Daniel Ashworth", role: "Senior negotiator", b: "bol" as BranchId, spec: "Bromley Cross family homes", sold: 31 },
  { name: "Farrah Iqbal", role: "Lettings manager", b: "bur" as BranchId, spec: "Sixty managed homes across BL8 and BL9", sold: 12 },
]

const AREAS = [
  {
    name: "Norden & Bamford", pc: "OL11 · OL12", branch: "roc" as BranchId, avg: 228000, trend: [178, 192, 205, 219, 228],
    schools: "Oakenrod and Norden primaries both rated Good; Cardinal Langley the usual secondary.",
    rail: "Rochdale and Smithy Bridge stations — Manchester Victoria in 22 minutes, two trains an hour.",
    best: "Families who want the Pennines at the weekend and a train seat by 8am.",
  },
  {
    name: "Bromley Cross", pc: "BL7", branch: "bol" as BranchId, avg: 312000, trend: [252, 268, 284, 301, 312],
    schools: "Turton and St Maxentius feed the catchment; waiting lists move most Septembers.",
    rail: "Bromley Cross station — Manchester Victoria in 28 minutes; the last train back is 23:40.",
    best: "Buyers trading up from Bolton town centre who still want a village post office.",
  },
  {
    name: "Ramsbottom", pc: "BL0", branch: "bur" as BranchId, avg: 289000, trend: [229, 244, 262, 275, 289],
    schools: "Ramsbottom St Joseph's and Woodhouse; secondary is Tottington, on the bus.",
    rail: "No station — the M66 and the Bury Metrolink park-and-ride do the work instead.",
    best: "Cottage stock, the brewery festival in September and a genuinely walkable high street.",
  },
]

const FAQ_BUY = [
  ["Can I book a viewing online?", "Yes — every listing has a viewing request that routes to the branch holding the keys. You'll get the negotiator's name and mobile before you set off."],
  ["Do you sell to investors?", "We do, and we say so on the listing. Our lettings teams in Bury and Rochdale manage 140 homes between them if you want the income without the work."],
  ["What's an 'under offer' tag?", "An offer has been accepted and the paperwork has started. Homes do fall through — ask the branch and we'll tell you honestly how solid the chain is."],
]

/* ── small shared pieces ─────────────────────────────────────────── */

function Glyph({ kind, size = 48 }: { kind: string; size?: number }) {
  return (
    <svg viewBox="0 0 60 46" width={size} height={(size * 46) / 60} aria-hidden className="cl-glyph">
      <path d="M4 42 H56" stroke="currentColor" strokeWidth="1.6" opacity=".35" />
      {kind === "flat" && (
        <>
          <rect x="17" y="6" width="26" height="36" fill="none" stroke="currentColor" strokeWidth="2" />
          <line x1="17" y1="24" x2="43" y2="24" stroke="currentColor" strokeWidth="1.3" />
          <rect x="23" y="11" width="6" height="6" fill="currentColor" opacity=".45" />
          <rect x="33" y="11" width="6" height="6" fill="currentColor" opacity=".45" />
          <rect x="23" y="30" width="6" height="6" fill="currentColor" opacity=".45" />
        </>
      )}
      {kind === "terrace" && (
        <path d="M8 42 V22 L16 14 L24 22 V42 M24 42 V22 L32 14 L40 22 V42 M40 42 V22 L48 14 L56 22 V42 M16 14 v-5 M32 14 v-5 M48 14 v-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      )}
      {kind === "semi" && (
        <path d="M8 42 V20 L20 10 L32 20 V42 M32 20 L44 12 L56 20 V42 M20 42 v-8 h8 v8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      )}
      {kind === "detached" && (
        <>
          <path d="M16 42 V18 L29 7 L42 18 V42 Z M29 7 v-5 M36 42 v-8 h-8 v8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M52 42 c0-6 -5-7 -5-12 c0-3 2.5-4 4-4 c1.5 0 3 1.5 3 3 c0 4 -2 5 -2 13" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </>
      )}
      {kind === "cottage" && (
        <>
          <path d="M12 42 V26 L26 14 L40 26 V42 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M14 24 H38 M18 15 L36 15" stroke="currentColor" strokeWidth="1.3" />
          <path d="M21 42 v-10 h8 v10" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 26 v-4 M40 26 v-4" stroke="currentColor" strokeWidth="1.6" />
        </>
      )}
    </svg>
  )
}

function TrendChart({ v }: { v: number[] }) {
  const max = Math.max(...v)
  return (
    <svg viewBox="0 0 300 130" className="cl-chart" role="img" aria-label={`Average sold price by year: ${v.map((x, i) => `${2020 + i} £${x}k`).join(", ")}`}>
      {v.map((x, i) => {
        const h = (x / max) * 92
        return (
          <g key={i}>
            <rect x={14 + i * 58} y={104 - h} width={38} height={h} rx="3" fill={i === v.length - 1 ? "var(--primary)" : "color-mix(in srgb, var(--primary) 34%, transparent)"} />
            <text x={33 + i * 58} y={120} textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--body)">
              {2020 + i}
            </text>
            <text x={33 + i * 58} y={98 - h} textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--ink)" fontFamily="var(--body)">
              {x}k
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function Crestline() {
  const { page, go } = useSite()
  const [branch, setBranch] = useState<BranchId>("roc")
  const B = BRANCHES[branch]
  const st = openState(B.hours)

  return (
    <div className="cl">
      <a href="#main" className="skip">
        Skip to content
      </a>

      {/* branch strip — switched by the header select */}
      <div className="cl-strip" aria-live="polite">
        <span className="cl-strip-branch">
          <b>{B.name}</b> · {B.addr}
        </span>
        <span className={`cl-open ${st.open ? "open" : ""}`}>
          <i aria-hidden /> {st.line}
        </span>
        <a href={`tel:${B.phone.replace(/\s/g, "")}`}>{B.phone}</a>
      </div>

      {/* SiteHeader */}
      <header className="cl-head">
        <button className="cl-logo" onClick={() => go("home")} aria-label="Crestline Estates, home">
          <svg viewBox="0 0 36 36" width="32" height="32" aria-hidden>
            <path d="M18 3 L33 12 V33 H3 V12 Z" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinejoin="round" />
            <path d="M18 3 V12 M3 12 H33" stroke="var(--accent)" strokeWidth="1" />
            <path d="M13 33 V21 H23 V33" fill="none" stroke="var(--ink)" strokeWidth="1.6" />
          </svg>
          <span>
            Crestline
            <small>Estates · est. 1963</small>
          </span>
        </button>
        <nav aria-label="Main">
          {(
            [
              ["home", "Home"],
              ["buy", "Buy"],
              ["sell", "Sell"],
              ["areas", "Area guides"],
              ["agents", "Agents"],
            ] as const
          ).map(([id, l]) => (
            <button key={id} className={page === id ? "on" : ""} onClick={() => go(id)} aria-current={page === id ? "page" : undefined}>
              {l}
            </button>
          ))}
        </nav>
        <label className="cl-branch-pick">
          <span>Branch</span>
          <select value={branch} onChange={(e) => setBranch(e.target.value as BranchId)} aria-label="Choose your branch">
            {(Object.keys(BRANCHES) as BranchId[]).map((k) => (
              <option key={k} value={k}>
                {BRANCHES[k].name}
              </option>
            ))}
          </select>
        </label>
        <button className="cl-btn" onClick={() => go("sell")}>
          Book a valuation
        </button>
      </header>

      <main id="main">
        {page === "home" && <Home branch={branch} />}
        {page === "buy" && <Buy branch={branch} />}
        {page === "sell" && <Sell branch={branch} />}
        {page === "areas" && <Areas />}
        {page === "agents" && <Agents />}
      </main>

      {/* SiteFooter */}
      <footer className="cl-foot">
        <div className="cl-foot-brand">
          <p className="cl-foot-logo">Crestline Estates</p>
          <p>Twelve branches across the north-east belt of Greater Manchester. Each office keeps its own ledger of solds — ask any of them to see it.</p>
          <p className="cl-foot-small">Member of Propertymark, ARLA and The Property Ombudsman · Client money held per PM Scheme rules</p>
        </div>
        <div className="cl-foot-branches">
          {(Object.keys(BRANCHES) as BranchId[]).map((k) => (
            <p key={k} className={k === branch ? "cur" : ""}>
              <b>
                {BRANCHES[k].name}
                {k === branch && <i> · your branch</i>}
              </b>
              {BRANCHES[k].addr}
              <br />
              <a href={`tel:${BRANCHES[k].phone.replace(/\s/g, "")}`}>{BRANCHES[k].phone}</a> · {BRANCHES[k].solds} solds last year
            </p>
          ))}
        </div>
        <p className="cl-foot-demo">Demo business — Growth OS Business template.</p>
      </footer>
    </div>
  )
}

/* ── home ─────────────────────────────────────────────────────────── */

function Home({ branch }: { branch: BranchId }) {
  const { go } = useSite()
  const recent = useMemo(
    () =>
      [0, 1, 2, 3, 4, 5].map((i) => {
        const r = seeded(i * 6151 + 97)
        const l = LISTINGS[Math.floor(r() * LISTINGS.length)]
        return { l, pct: 96 + Math.floor(r() * 7) }
      }),
    [],
  )
  return (
    <>
      {/* HeroEditorial */}
      <section className="cl-hero">
        <div className="cl-hero-copy">
          <p className="cl-kicker">Twelve branches · ninety negotiators · since 1963</p>
          <h1>
            Every claim we make is <em>already in a ledger.</em>
          </h1>
          <p className="cl-lede">
            Crestline runs Rochdale, Bolton and Bury from three high-street counters and nine satellite offices. Ask for the proof behind any number on this site and the branch manager will print it: what sold, for what, in how many days — on our patch, not a portal's.
          </p>
          <div className="cl-hero-act">
            <button className="cl-btn big" onClick={() => go("sell")}>
              Book a valuation
            </button>
            <button className="cl-ghost" onClick={() => go("buy")}>
              Browse by branch →
            </button>
          </div>
        </div>
        <div className="cl-hero-stats" aria-label="Our numbers, last twelve months">
          {[
            ["412", "homes sold across the twelve branches"],
            ["98.1%", "of asking price achieved, averaged"],
            ["31", "days, median instruction to accepted offer"],
            ["£142m", "of property moved on our own patch"],
          ].map(([n, l]) => (
            <div key={l}>
              <b>{n}</b>
              <span>{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ResultsStatStrip — the sold ledger */}
      <section className="cl-ledger" aria-labelledby="ledger-h">
        <Reveal>
          <div className="cl-sec-head">
            <h2 id="ledger-h">The sold ledger, updated Fridays</h2>
            <p>Six from the last quarter, exactly as recorded. Every buyer consented to the entry — that's why some streets aren't shown.</p>
          </div>
        </Reveal>
        <ul>
          {recent.map(({ l, pct }, i) => (
            <Reveal as="li" key={i} delay={i * 40}>
              <span className="cl-led-branch">{BRANCHES[l.b].name}</span>
              <span className="cl-led-addr">{l.addr}</span>
              <span className="cl-led-kind">
                {l.beds} bed · {l.kind}
              </span>
              <b className="cl-led-price">{gbp(l.price)}</b>
              <span className={`cl-led-pct ${pct >= 100 ? "over" : ""}`}>{pct}% of asking</span>
            </Reveal>
          ))}
        </ul>
        <p className="cl-led-note">
          Figures for the 12 months to date, our instructions only. Three of the six sold through the {BRANCHES[branch].name} office — the ledger link on the left is that branch's own. <span className="cl-demo-tag">Demo data</span>
        </p>
      </section>

      {/* MultiLocationCard */}
      <section className="cl-branches" aria-labelledby="br-h">
        <div className="cl-sec-head">
          <h2 id="br-h">Three counters, three ledgers</h2>
          <p>Each branch keeps its own book. Pick the one on your doorstep.</p>
        </div>
        <div className="cl-branch-cards">
          {(Object.keys(BRANCHES) as BranchId[]).map((k) => {
            const b = BRANCHES[k]
            const s = openState(b.hours)
            return (
              <article key={k} className="cl-branch-card">
                <h3>{b.name}</h3>
                <p className="cl-branch-addr">{b.addr}</p>
                <p className={`cl-open ${s.open ? "open" : ""}`}>
                  <i aria-hidden /> {s.line}
                </p>
                <table className="cl-hours">
                  <caption className="sr-only">{b.name} opening hours</caption>
                  <tbody>
                    {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                      <tr key={d}>
                        <th scope="row">{DAYS[d].slice(0, 3)}</th>
                        <td>{b.hours[d] ? `${fmtH(b.hours[d]![0])} – ${fmtH(b.hours[d]![1])}` : "Closed"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="cl-branch-sold">
                  <b>{b.solds}</b> solds last year · manager {b.manager}
                </p>
                <a className="cl-ghost" href={`tel:${b.phone.replace(/\s/g, "")}`}>
                  {b.phone}
                </a>
              </article>
            )
          })}
        </div>
      </section>

      {/* CredentialWall */}
      <section className="cl-creds" aria-label="Memberships and credentials">
        {["Propertymark", "ARLA Propertymark (lettings)", "The Property Ombudsman", "Client Money Protection", "RICS-regulated valuers on call", "Moneyshield conveyancing panel"].map((m) => (
          <span key={m}>{m}</span>
        ))}
      </section>
    </>
  )
}

/* ── buy ──────────────────────────────────────────────────────────── */

function Buy({ branch }: { branch: BranchId }) {
  /* the search filter starts at your branch, then lives its own life */
  const [br, setBr] = useState<BranchId | "any">(branch)
  const [beds, setBeds] = useState("any")
  const [band, setBand] = useState("any")
  const shown = useMemo(
    () =>
      LISTINGS.filter((l) => {
        if (br !== "any" && l.b !== br) return false
        if (beds !== "any" && !(beds === "4+" ? l.beds >= 4 : l.beds === +beds)) return false
        if (band !== "any") {
          const [lo, hi] = band === "a" ? [0, 150000] : band === "b" ? [150000, 250000] : band === "c" ? [250000, 400000] : [400000, Infinity]
          if (l.price < lo || l.price >= hi) return false
        }
        return true
      }),
    [br, beds, band],
  )

  return (
    <section className="cl-page">
      <h1 className="cl-ph">Buy with the ledger behind you</h1>
      <p className="cl-ph-sub">Ten on the books today across three branches. Filter, then click the map pin — every listing routes to the counter holding the keys.</p>

      <div className="cl-filters">
        <div className="cl-filter">
          <p className="cl-filter-label" id="fl-b">Branch</p>
          <div className="cl-chips" role="group" aria-labelledby="fl-b">
            {([["any", "All"], ["roc", "Rochdale"], ["bol", "Bolton"], ["bur", "Bury"]] as [BranchId | "any", string][]).map(([v, l]) => (
              <button key={v} aria-pressed={br === v} className={br === v ? "on" : ""} onClick={() => setBr(v)}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <div className="cl-filter">
          <p className="cl-filter-label" id="fl-bd">Beds</p>
          <div className="cl-chips" role="group" aria-labelledby="fl-bd">
            {[["any", "Any"], ["1", "1"], ["2", "2"], ["3", "3"], ["4+", "4+"]].map(([v, l]) => (
              <button key={v} aria-pressed={beds === v} className={beds === v ? "on" : ""} onClick={() => setBeds(v)}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <div className="cl-filter">
          <p className="cl-filter-label" id="fl-p">Price</p>
          <div className="cl-chips" role="group" aria-labelledby="fl-p">
            {[["any", "Any"], ["a", "Under £150k"], ["b", "£150–250k"], ["c", "£250–400k"], ["d", "£400k+"]].map(([v, l]) => (
              <button key={v} aria-pressed={band === v} className={band === v ? "on" : ""} onClick={() => setBand(v)}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <p className="cl-count-line" aria-live="polite">
          <b>{shown.length}</b> of {LISTINGS.length} homes
        </p>
      </div>

      {/* MapSearch */}
      <div className="cl-mapwrap">
        <figure className="cl-map" aria-label="Map of the three branches">
          <svg viewBox="0 0 480 260" role="img" aria-hidden>
            <rect width="480" height="260" fill="var(--surface)" />
            <path d="M-10 74 C120 60, 300 92, 490 66" stroke="var(--line)" strokeWidth="16" fill="none" />
            <path d="M350 -10 C330 90, 344 180, 322 270" stroke="var(--line)" strokeWidth="12" fill="none" />
            <path d="M40 -10 C60 100, 44 190, 66 270" stroke="var(--line)" strokeWidth="8" fill="none" />
            <text x="16" y="56" fontSize="10" letterSpacing="2" fill="var(--muted)" fontFamily="var(--mono)">M62</text>
            <text x="368" y="20" fontSize="10" letterSpacing="2" fill="var(--muted)" fontFamily="var(--mono)">M66</text>
            <text x="84" y="252" fontSize="10" letterSpacing="2" fill="var(--muted)" fontFamily="var(--mono)">A56</text>
            <text x="368" y="248" fontSize="12" fontStyle="italic" fill="var(--muted)" fontFamily="var(--display)">the Pennines →</text>
          </svg>
          {(
            [
              ["roc", "26%", "24%", "Rochdale"],
              ["bol", "52%", "72%", "Bolton"],
              ["bur", "12%", "62%", "Bury"],
            ] as [BranchId, string, string, string][]
          ).map(([id, x, y, label]) => (
            <button key={id} className={`cl-pin ${br === id ? "on" : ""}`} style={{ left: x, top: y }} aria-pressed={br === id} onClick={() => setBr(id)} aria-label={`${label} branch — ${BRANCHES[id].solds} sold last year. Filter listings to ${label}.`}>
              <b>{BRANCHES[id].solds}</b>
              <span>{label}</span>
            </button>
          ))}
        </figure>
        <div className="cl-mapnote">
          <h2>Browse by branch</h2>
          <p>Tap a pin to filter the ledger to that office. Solds are the branch's own count for the last year — Rochdale and Bolton swap first place most quarters; Bury makes it up on cottages.</p>
          <p className="cl-demo-tag">Map is illustrative — ask any branch for the printed version with school catchments.</p>
        </div>
      </div>

      <ul className="cl-grid">
        {shown.map((l) => (
          <li key={l.id} className="cl-card">
            <div className="cl-card-art">
              <Glyph kind={l.kind} size={84} />
              <span className={`cl-tag ${tagFor(l.i) === "Under offer" ? "uo" : tagFor(l.i) === "New instruction" ? "new" : ""}`}>{tagFor(l.i)}</span>
            </div>
            <div className="cl-card-body">
              <p className="cl-card-branch">{BRANCHES[l.b].name} office</p>
              <h3>{l.addr}</h3>
              <p className="cl-card-blurb">{l.blurb}</p>
              <p className="cl-card-meta">
                {l.beds} bed · {l.tenure}
              </p>
              <p className="cl-card-price">{gbp(l.price)}</p>
              <div className="cl-card-act">
                <a className="cl-btn" href={`tel:${BRANCHES[l.b].phone.replace(/\s/g, "")}`}>
                  Request viewing
                </a>
                <a className="cl-ghost" href={`mailto:${l.b}@crestline-estates.co.uk`}>
                  Ask a question
                </a>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {shown.length === 0 && <p className="cl-empty">Nothing in that combination today — loosen a filter or ring the branch; off-market stock rarely reaches the page.</p>}

      {/* MortgageCalculator */}
      <MortgageCalc />

      <div className="cl-faq">
        <h2>Before you offer</h2>
        {FAQ_BUY.map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

function MortgageCalc() {
  const [price, setPrice] = useState(235000)
  const [dep, setDep] = useState(10)
  const [term, setTerm] = useState(25)
  const [rate, setRate] = useState(4.5)
  const loan = price * (1 - dep / 100)
  const n = term * 12
  const m = (loan * (rate / 100 / 12)) / (1 - Math.pow(1 + rate / 100 / 12, -n))
  const stampFTB = price <= 625000 ? Math.max(0, price - 425000) * 0.05 : Math.max(0, price - 250000) * 0.05 + Math.max(0, price - 925000) * 0.05 + Math.max(0, price - 1500000) * 0.07
  const stampStd = Math.max(0, price - 250000) * 0.05 + Math.max(0, price - 925000) * 0.05 + Math.max(0, price - 1500000) * 0.07
  return (
    <section className="cl-calc" aria-labelledby="calc-h">
      <div className="cl-calc-controls">
        <h2 id="calc-h">The mortgage maths, before you fall in love</h2>
        <p className="cl-ph-sub">Live figures as you move the sliders — honest arithmetic, no "from" prices.</p>
        <label htmlFor="calc-price" className="cl-calc-label">
          Property price
        </label>
        <input id="calc-price" className="cl-calc-price" type="number" min={50000} max={2000000} step={500} value={price} onChange={(e) => setPrice(Math.max(10000, +e.target.value || 0))} />
        <label htmlFor="calc-dep" className="cl-calc-label">
          Deposit — <b>{dep}%</b> ({gbp(Math.round(price * (dep / 100)))})
        </label>
        <input id="calc-dep" type="range" min={5} max={50} step={1} value={dep} onChange={(e) => setDep(+e.target.value)} aria-label="Deposit percentage" />
        <label htmlFor="calc-term" className="cl-calc-label">
          Term
        </label>
        <select id="calc-term" value={term} onChange={(e) => setTerm(+e.target.value)}>
          {[20, 25, 30, 35].map((t) => (
            <option key={t} value={t}>
              {t} years
            </option>
          ))}
        </select>
        <label htmlFor="calc-rate" className="cl-calc-label">
          Interest rate — <b>{rate.toFixed(1)}%</b>
        </label>
        <input id="calc-rate" type="range" min={2} max={7} step={0.1} value={rate} onChange={(e) => setRate(+e.target.value)} aria-label="Interest rate" />
      </div>
      <div className="cl-calc-out" aria-live="polite">
        <p className="cl-calc-big">
          {gbp(Math.round(m))}
          <small> / month</small>
        </p>
        <dl>
          <div>
            <dt>Loan</dt>
            <dd>{gbp(Math.round(loan))}</dd>
          </div>
          <div>
            <dt>Total over {term} years</dt>
            <dd>{gbp(Math.round(m * n))}</dd>
          </div>
          <div>
            <dt>Stamp duty, first-time buyer</dt>
            <dd>{stampFTB === 0 ? "£0 — nothing owed below £425k" : gbp(Math.round(stampFTB))}</dd>
          </div>
          <div>
            <dt>If you've owned before</dt>
            <dd>{stampStd === 0 ? "£0" : gbp(Math.round(stampStd))}</dd>
          </div>
        </dl>
        <p className="cl-calc-note">
          Capital &amp; interest, our worked example only — your broker's number is the one that counts. <span className="cl-demo-tag">Demo rates</span>
        </p>
      </div>
    </section>
  )
}

/* ── sell: MultiStepIntake ────────────────────────────────────────── */

function Sell({ branch }: { branch: BranchId }) {
  const [step, setStep] = useState(0)
  const [type, setType] = useState<string | null>(null)
  const [beds, setBeds] = useState(3)
  const [office, setOffice] = useState<BranchId>(branch)
  const [day, setDay] = useState<Date | null>(null)
  const [slot, setSlot] = useState<string | null>(null)
  const days = useMemo(() => nextDays(6), [])
  const [code] = useState(() => ref("CL"))
  const f = useForm(
    { name: "", email: "", phone: "" },
    { name: [rules.required("Who should the visit be under?")], email: [rules.email()], phone: [rules.phone()] },
  )
  const next = () => {
    if (step === 1) {
      if (!f.validate(["name", "email", "phone"])) return
    }
    setStep((s) => Math.min(2, s + 1))
  }

  if (f.status === "done" && day && slot)
    return (
      <section className="cl-page cl-done" role="status">
        <p className="cl-kicker">Valuation booked · reference {code}</p>
        <h1 className="cl-ph">{BRANCHES[office].manager} will call you today.</h1>
        <dl className="cl-done-dl">
          <div>
            <dt>Property</dt>
            <dd>
              {beds} bed {type ?? "home"} · {BRANCHES[office].name} patch
            </dd>
          </div>
          <div>
            <dt>Visit</dt>
            <dd>
              {longDate(day)}, {slot}
            </dd>
          </div>
          <div>
            <dt>Bringing</dt>
            <dd>The branch's sold ledger for your street type, printed — plus the fee card: 1.4% + VAT sole agency, no sale no fee.</dd>
          </div>
          <div>
            <dt>Contact</dt>
            <dd>
              {f.values.name} · {f.values.email} · {f.values.phone}
            </dd>
          </div>
        </dl>
        <p className="cl-done-note">
          Anything to look up before the visit? Ring {BRANCHES[office].phone} and ask for the {BRANCHES[office].name} team by name.
        </p>
      </section>
    )

  return (
    <section className="cl-page">
      <p className="cl-kicker">Three steps · about a minute · the branch manager does the visit</p>
      <h1 className="cl-ph">Book your valuation</h1>

      <ol className="cl-steps" aria-label="Steps">
        {["The property", "Your contact", "Preferred visit"].map((s, i) => (
          <li key={s} className={i === step ? "on" : i < step ? "done" : ""} aria-current={i === step ? "step" : undefined}>
            <span>{i < step ? "✓" : i + 1}</span>
            {s}
          </li>
        ))}
      </ol>

      <div className="cl-intake">
        {step === 0 && (
          <fieldset className="cl-fs">
            <legend>The property</legend>
            <p className="cl-filter-label">Home type</p>
            <div className="cl-chips big" role="radiogroup" aria-label="Home type">
              {["Terrace", "Semi-detached", "Detached", "Bungalow", "Flat"].map((t) => (
                <button key={t} role="radio" aria-checked={type === t} className={type === t ? "on" : ""} onClick={() => setType(t)}>
                  {t}
                </button>
              ))}
            </div>
            <p className="cl-filter-label">Bedrooms</p>
            <div className="cl-stepper">
              <button onClick={() => setBeds(Math.max(1, beds - 1))} disabled={beds <= 1} aria-label="Fewer bedrooms">
                −
              </button>
              <output aria-live="polite">
                <b>{beds}</b>
              </output>
              <button onClick={() => setBeds(Math.min(7, beds + 1))} disabled={beds >= 7} aria-label="More bedrooms">
                +
              </button>
            </div>
            <p className="cl-filter-label">Which branch should value it?</p>
            <div className="cl-chips big" role="radiogroup" aria-label="Branch">
              {(Object.keys(BRANCHES) as BranchId[]).map((k) => (
                <button key={k} role="radio" aria-checked={office === k} className={office === k ? "on" : ""} onClick={() => setOffice(k)}>
                  {BRANCHES[k].name}
                </button>
              ))}
            </div>
            <button className="cl-btn big" onClick={next} disabled={!type}>
              {type ? "Continue →" : "Pick a home type to continue"}
            </button>
          </fieldset>
        )}

        {step === 1 && (
          <fieldset className="cl-fs">
            <legend>Your contact</legend>
            <div className="cl-fields">
              {(
                [
                  ["name", "Name", "text", "name"],
                  ["email", "Email", "email", "email"],
                  ["phone", "Mobile", "tel", "tel"],
                ] as const
              ).map(([k, l, t, ac]) => (
                <div key={k} className={`cl-field ${f.errors[k] ? "bad" : ""}`}>
                  <label htmlFor={`f-${k}`}>{l}</label>
                  <input {...f.field(k)} type={t} autoComplete={ac} />
                  {f.errors[k] && (
                    <p className="cl-err" id={`f-${k}-err`}>
                      {f.errors[k]}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="cl-stepnav">
              <button className="cl-back" onClick={() => setStep(0)}>
                ← The property
              </button>
              <button className="cl-btn big" onClick={next}>
                Continue →
              </button>
            </div>
          </fieldset>
        )}

        {step === 2 && (
          <form
            className="cl-fs"
            onSubmit={(e) => {
              e.preventDefault()
              if (!day || !slot) return
              f.submit()(undefined)
            }}
            noValidate
          >
            <legend>Preferred visit</legend>
            <p className="cl-filter-label">Pick a day</p>
            <div className="cl-dates">
              {days.map((d) => (
                <button type="button" key={d.toISOString()} aria-pressed={day?.toDateString() === d.toDateString()} className={day?.toDateString() === d.toDateString() ? "on" : ""} onClick={() => (setDay(d), setSlot(null))}>
                  <small>{dayShort(d)}</small>
                  <b>{dayNum(d)}</b>
                  <small>{monthShort(d)}</small>
                </button>
              ))}
            </div>
            <p className="cl-filter-label">Pick a time</p>
            <div className="cl-slots" role="radiogroup" aria-label="Time of day">
              {[
                ["Morning", "9:00 – 12:00"],
                ["Afternoon", "12:00 – 16:00"],
                ["Evening", "16:00 – 19:00"],
              ].map(([s, t]) => (
                <button type="button" key={s} role="radio" aria-checked={slot === s} className={slot === s ? "on" : ""} onClick={() => setSlot(s)} disabled={(day?.getDay() ?? 1) === 0 && s === "Evening"}>
                  <b>{s}</b>
                  <span>{t}</span>
                </button>
              ))}
            </div>
            <p className="cl-hint">Valuation visits run about 45 minutes. {BRANCHES[office].manager} brings the sold comparables for your street — the same ledger the website quotes from.</p>
            <div className="cl-stepnav">
              <button type="button" className="cl-back" onClick={() => setStep(1)}>
                ← Your contact
              </button>
              <button className="cl-btn big" type="submit" disabled={!day || !slot}>
                {f.status === "sending" ? "Booking…" : day && slot ? "Confirm valuation visit" : "Pick a day and time"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}

/* ── areas ────────────────────────────────────────────────────────── */

function Areas() {
  const { go } = useSite()
  return (
    <section className="cl-page">
      <h1 className="cl-ph">Area guides, with the numbers attached</h1>
      <p className="cl-ph-sub">
        Three of the twelve patches we know street by street. School ratings from Ofsted, rail times from the timetable, sold prices from the ledger every branch keeps. <span className="cl-demo-tag">Demo figures, refreshed quarterly</span>
      </p>
      <div className="cl-areas">
        {AREAS.map((a, i) => (
          <Reveal as="article" key={a.name} className="cl-area" delay={i * 60}>
            <header>
              <h2>{a.name}</h2>
              <p className="cl-area-pc">{a.pc} · {BRANCHES[a.branch].name} office</p>
            </header>
            <TrendChart v={a.trend} />
            <p className="cl-area-avg">
              Average sold price, this year: <b>{gbp(a.avg)}</b> <span className="cl-area-up">+{Math.round(((a.trend[4] - a.trend[0]) / a.trend[0]) * 100)}% over five years</span>
            </p>
            <dl className="cl-area-facts">
              <div>
                <dt>Schools</dt>
                <dd>{a.schools}</dd>
              </div>
              <div>
                <dt>Rail &amp; roads</dt>
                <dd>{a.rail}</dd>
              </div>
              <div>
                <dt>Best for</dt>
                <dd>{a.best}</dd>
              </div>
            </dl>
            <button className="cl-ghost" onClick={() => go("buy")}>
              See {BRANCHES[a.branch].name} listings →
            </button>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ── agents ───────────────────────────────────────────────────────── */

function Agents() {
  return (
    <section className="cl-page">
      <h1 className="cl-ph">Ninety negotiators; here are six</h1>
      <p className="cl-ph-sub">Each branch answers its own phone — no switchboard, no ticket numbers. Solds are the branch ledger's own count for this year.</p>
      <ul className="cl-agents">
        {AGENTS.map((a, i) => (
          <Reveal as="li" key={a.name} delay={i * 40} className="cl-agent">
            <svg viewBox="0 0 72 72" width="72" height="72" aria-hidden className="cl-monogram">
              <rect x="2" y="2" width="68" height="68" rx="6" fill="color-mix(in srgb, var(--primary) 9%, transparent)" stroke="var(--line)" />
              <text x="36" y="47" textAnchor="middle" fontSize="28" fill="var(--primary)" fontFamily="var(--display)">
                {a.name.split(" ").map((w) => w[0]).join("")}
              </text>
            </svg>
            <h3>{a.name}</h3>
            <p className="cl-agent-role">
              {a.role} · {BRANCHES[a.b].name}
            </p>
            <p className="cl-agent-spec">{a.spec}</p>
            <p className="cl-agent-sold">
              <b>{a.sold}</b> solds this year
            </p>
            <a className="cl-ghost" href={`tel:${BRANCHES[a.b].phone.replace(/\s/g, "")}`}>
              Contact via {BRANCHES[a.b].name} · {BRANCHES[a.b].phone}
            </a>
          </Reveal>
        ))}
      </ul>
      <p className="cl-hint">
        The other eighty-four are on the counters. Ring your branch and ask for whoever holds the ledger on your street — they'll know it without looking up.
      </p>
    </section>
  )
}
