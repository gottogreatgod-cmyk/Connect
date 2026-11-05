import { useMemo, useState, type ReactNode } from "react"
import "./northfield.css"
import { Reveal, ref, rules, useForm, useSite } from "../../kit/site-kit"

/**
 * NORTHFIELD SPECIALIST CLINIC — High · Business · Multi-Specialist Clinic
 * Fourteen specialties, forty consultants, three sites. Turns a symptom
 * into the right specialist in under a minute.
 */

type Site = "MAN" | "LDS" | "SHF"
const SITES: Record<Site, { name: string; addr: string; hours: string; note: string; imaging: string }> = {
  MAN: { name: "Manchester", addr: "41 Deansgate, Manchester M3 2AY", hours: "Mon – Fri 07:30 – 20:00 · Sat 08:00 – 14:00", note: "Five minutes from Deansgate station. NCP parking on Great Northern.", imaging: "MRI, CT, ultrasound, X-ray" },
  LDS: { name: "Leeds", addr: "8 Park Square East, Leeds LS1 2NE", hours: "Mon – Fri 08:00 – 19:00", note: "Ten minutes from Leeds station. Patient parking — 6 bays, book ahead.", imaging: "MRI, ultrasound, X-ray" },
  SHF: { name: "Sheffield", addr: "Kelham Works, 3 Russell Street, Sheffield S3 8RW", hours: "Mon – Fri 08:00 – 18:00", note: "Tram stop Shalesmoor, 3 minutes. Free parking on site.", imaging: "Ultrasound, X-ray" },
}

const SPECS = [
  { id: "cardio", name: "Cardiology", words: "chest pain palpitations heart racing breathless blood pressure fainting", wait: 5 },
  { id: "derm", name: "Dermatology", words: "skin rash mole eczema psoriasis acne itching spot", wait: 8 },
  { id: "ent", name: "Ear, nose & throat", words: "ear hearing tinnitus sinus nose throat voice snoring dizzy vertigo", wait: 6 },
  { id: "gastro", name: "Gastroenterology", words: "stomach bloating reflux heartburn bowel ibs diarrhoea constipation", wait: 7 },
  { id: "gyn", name: "Gynaecology", words: "period menopause pelvic pain fertility endometriosis smear", wait: 6 },
  { id: "neuro", name: "Neurology", words: "headache migraine numbness tingling seizure memory tremor", wait: 12 },
  { id: "eye", name: "Ophthalmology", words: "eye vision cataract blurry floaters glaucoma", wait: 4 },
  { id: "ortho", name: "Orthopaedics", words: "knee hip shoulder back joint pain sports injury fracture", wait: 5 },
  { id: "rheum", name: "Rheumatology", words: "joint swelling stiffness arthritis lupus gout", wait: 10 },
  { id: "uro", name: "Urology", words: "bladder prostate kidney stone urine", wait: 6 },
  { id: "endo", name: "Endocrinology", words: "thyroid diabetes hormones weight tired fatigue", wait: 9 },
  { id: "resp", name: "Respiratory", words: "cough asthma breathless wheeze lung", wait: 7 },
  { id: "allergy", name: "Allergy & immunology", words: "allergy hay fever food reaction hives", wait: 11 },
  { id: "sleep", name: "Sleep medicine", words: "sleep insomnia snoring apnoea tired", wait: 14 },
]

const DOCS = [
  { name: "Dr Hannah Reeve", spec: "cardio", sites: ["MAN", "LDS"] as Site[], langs: ["English"], next: 3, note: "Arrhythmia and sports cardiology" },
  { name: "Mr Kwame Asante", spec: "ortho", sites: ["MAN"] as Site[], langs: ["English", "Twi"], next: 2, note: "Knee and sports injury surgery" },
  { name: "Dr Sofia Marchetti", spec: "derm", sites: ["LDS", "SHF"] as Site[], langs: ["English", "Italian"], next: 6, note: "Skin cancer screening, mole mapping" },
  { name: "Dr Imran Siddiqui", spec: "gastro", sites: ["MAN", "SHF"] as Site[], langs: ["English", "Urdu", "Punjabi"], next: 4, note: "IBS, reflux, endoscopy" },
  { name: "Miss Eleanor Pryce", spec: "gyn", sites: ["LDS"] as Site[], langs: ["English", "Welsh"], next: 5, note: "Menopause and endometriosis" },
  { name: "Dr Tomasz Nowak", spec: "neuro", sites: ["MAN"] as Site[], langs: ["English", "Polish"], next: 9, note: "Headache and migraine clinic" },
  { name: "Mr Ravi Menon", spec: "eye", sites: ["MAN", "LDS", "SHF"] as Site[], langs: ["English", "Malayalam"], next: 2, note: "Cataract and laser surgery" },
  { name: "Ms Grace Okafor", spec: "ent", sites: ["SHF"] as Site[], langs: ["English", "Yoruba"], next: 4, note: "Voice, sinus and hearing" },
  { name: "Dr Lena Fischer", spec: "endo", sites: ["LDS"] as Site[], langs: ["English", "German"], next: 7, note: "Thyroid and type 2 diabetes" },
  { name: "Mr Daniel Hart", spec: "ortho", sites: ["LDS", "SHF"] as Site[], langs: ["English"], next: 3, note: "Hip and spinal surgery" },
  { name: "Dr Aisha Rahman", spec: "resp", sites: ["MAN"] as Site[], langs: ["English", "Bengali"], next: 5, note: "Asthma and chronic cough" },
  { name: "Dr Owen Clarke", spec: "sleep", sites: ["SHF"] as Site[], langs: ["English"], next: 11, note: "Sleep apnoea and insomnia" },
]

const GUIDES = [
  { cat: "Before your visit", title: "What to bring to a first consultation", mins: 3, body: "Your referral letter if you have one, a list of current medicines (photos of the boxes are fine), your insurer's authorisation code, and any scans or results from the last two years. Arrive ten minutes early to complete a short health questionnaire." },
  { cat: "Tests & scans", title: "What to expect at an MRI scan", mins: 4, body: "A scan takes 20 – 45 minutes and is painless but noisy — we give you headphones. Remove all metal; tell us beforehand about pacemakers, implants or pregnancy. You can drive home straight afterwards." },
  { cat: "Tests & scans", title: "Preparing for a colonoscopy", mins: 6, body: "You'll follow a low-fibre diet for two days and take bowel preparation the evening before. We'll post the exact timings with your preparation kit. Plan for someone to collect you if you choose sedation." },
  { cat: "Paying for care", title: "Self-pay or insured: how it works", mins: 5, body: "Insured patients need an authorisation code from their insurer before booking. Self-pay patients get a fixed-price quote before any test or procedure, and nothing is charged until you agree it." },
  { cat: "After your visit", title: "Getting your results", mins: 2, body: "Most results are ready within five working days. Your consultant writes to you and your GP; results also appear in your patient account so you can read them in your own time." },
]

const fuzzy = (q: string) => {
  const words = q.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 2)
  if (!words.length) return []
  return SPECS.map((s) => ({ s, score: words.reduce((n, w) => n + (s.words.includes(w) || s.name.toLowerCase().includes(w) ? 1 : 0), 0) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.s)
}

export default function Northfield() {
  const { page, go } = useSite()
  const [spec, setSpec] = useState<string | null>(null)
  const pick = (id: string) => {
    setSpec(id)
    go("find")
  }
  const nav: [string, string][] = [
    ["find", "Find a specialist"],
    ["consultants", "Consultants"],
    ["locations", "Locations"],
    ["resources", "Patient guides"],
  ]
  const crumb = nav.find(([id]) => id === page)?.[1]
  return (
    <div className="nf">
      <a href="#main" className="skip">
        Skip to content
      </a>
      <div className="nf-util">
        <span>Self-pay and all major insurers · no GP referral needed for most specialties</span>
        <a href="tel:03332022014">0333 202 2014</a>
      </div>
      <header className="nf-head">
        <button className="nf-logo" onClick={() => go("home")} aria-label="Northfield Specialist Clinic, home">
          <span className="nf-mark" aria-hidden>
            <i />
            <i />
            <i />
          </span>
          <span>
            Northfield
            <small>Specialist Clinic</small>
          </span>
        </button>
        <nav aria-label="Main">
          {nav.map(([id, l]) => (
            <button key={id} className={page === id ? "on" : ""} onClick={() => go(id)} aria-current={page === id ? "page" : undefined}>
              {l}
            </button>
          ))}
        </nav>
        <button className="nf-btn" onClick={() => go("find")}>
          Request a consultation
        </button>
      </header>
      {crumb && (
        <nav className="nf-crumb" aria-label="Breadcrumb">
          <button onClick={() => go("home")}>Home</button> <span>/</span> {crumb}
        </nav>
      )}
      <main id="main">
        {page === "home" && <Home pick={pick} />}
        {page === "find" && <Find spec={spec} setSpec={setSpec} />}
        {page === "consultants" && <Consultants pick={pick} />}
        {page === "locations" && <Locations />}
        {page === "resources" && <Resources />}
      </main>
      <footer className="nf-foot">
        <div className="nf-foot-grid">
          <div>
            <p className="nf-logo static">Northfield Specialist Clinic</p>
            <p>Outpatient specialist care across the North of England.</p>
          </div>
          {(Object.keys(SITES) as Site[]).map((k) => (
            <div key={k}>
              <h3>{SITES[k].name}</h3>
              <p>{SITES[k].addr}</p>
            </div>
          ))}
        </div>
        <p className="nf-legal">Demo business — Growth OS Business template. Consultants, ratings and figures are illustrative. In an emergency call 999.</p>
      </footer>
    </div>
  )
}

function Home({ pick }: { pick: (id: string) => void }) {
  const [q, setQ] = useState("")
  const matches = useMemo(() => fuzzy(q), [q])
  return (
    <>
      <section className="nf-hero">
        <div className="nf-hero-copy">
          <p className="nf-label">01 — Specialist outpatient care</p>
          <h1>The right specialist, usually within a week.</h1>
          <p className="nf-lede">Forty consultants across fourteen specialties in Manchester, Leeds and Sheffield. Tell us what's wrong in your own words and we'll show you who to see.</p>
        </div>
        <div className="nf-search" role="search">
          <label htmlFor="nf-q">Describe what's wrong</label>
          <input id="nf-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. knee pain when running, heart racing at night" autoComplete="off" />
          <div className="nf-results" aria-live="polite">
            {q && matches.length === 0 && <p className="nf-muted">No direct match — our triage nurses can help on 0333 202 2014.</p>}
            {matches.slice(0, 3).map((s) => (
              <button key={s.id} onClick={() => pick(s.id)}>
                <b>{s.name}</b>
                <span>
                  {DOCS.filter((d) => d.spec === s.id).length || 2} consultants · typical wait {s.wait} days
                </span>
                <i aria-hidden>→</i>
              </button>
            ))}
            {!q && (
              <p className="nf-try">
                Try:{" "}
                {["migraine", "mole", "reflux", "knee"].map((w) => (
                  <button key={w} onClick={() => setQ(w)}>
                    {w}
                  </button>
                ))}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="nf-stats" aria-label="Clinic at a glance">
        {[
          ["14", "specialties"],
          ["40", "consultants"],
          ["3", "sites"],
          ["6 days", "median wait to first appointment"],
        ].map(([n, l], i) => (
          <Reveal key={l} delay={i * 70}>
            <b>{n}</b>
            <span>{l}</span>
          </Reveal>
        ))}
      </section>

      <section className="nf-index" aria-labelledby="idx-h">
        <div className="nf-sec-head">
          <p className="nf-label">02 — Specialties</p>
          <h2 id="idx-h">Fourteen specialties, one front door.</h2>
        </div>
        <ol>
          {SPECS.map((s, i) => (
            <Reveal as="li" key={s.id} delay={(i % 4) * 50}>
              <button onClick={() => pick(s.id)}>
                <span className="nf-no">{String(i + 1).padStart(2, "0")}</span>
                <b>{s.name}</b>
                <span className="nf-wait">{s.wait} days</span>
              </button>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="nf-paths" aria-labelledby="paths-h">
        <div className="nf-sec-head">
          <p className="nf-label">03 — Getting seen</p>
          <h2 id="paths-h">Three ways in. Prices before you commit.</h2>
        </div>
        <div className="nf-path-grid">
          {[
            ["Self-pay", "From £220", "Initial consultation, fixed price. Tests quoted before they happen — no surprise invoices."],
            ["Insured", "Direct billing", "Bupa, AXA Health, Aviva, Vitality and WPA. Bring your authorisation code and we bill them directly."],
            ["GP referral", "Optional", "Most specialties don't need one. Where they do (neurology, sleep), we can arrange it for you."],
          ].map(([h, k, p], i) => (
            <Reveal as="article" key={h} delay={i * 90}>
              <h3>{h}</h3>
              <p className="nf-key">{k}</p>
              <p>{p}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="nf-cred" aria-label="Credentials">
        {["Care Quality Commission registered", "ISO 9001 imaging service", "Member, Independent Healthcare Providers Network", "Recognised by all major UK insurers"].map((c) => (
          <span key={c}>{c}</span>
        ))}
      </section>
    </>
  )
}

/* ── find: finder + intake ───────────────────────────────────────── */

function Find({ spec, setSpec }: { spec: string | null; setSpec: (s: string | null) => void }) {
  const S = SPECS.find((s) => s.id === spec)
  const [doc, setDoc] = useState("any")
  const [site, setSite] = useState<Site | "any">("any")
  const [pay, setPay] = useState("Self-pay")
  const [code] = useState(() => ref("NF"))
  const f = useForm({ name: "", dob: "", email: "", phone: "", reason: "", auth: "" }, { name: [rules.required()], dob: [rules.required("We need a date of birth to find your records.")], email: [rules.email()], phone: [rules.phone()], reason: [rules.min(10, "A sentence about what's wrong helps us book the right length of appointment.")], auth: [(v, all) => (pay !== "Self-pay" && !v.trim() && all ? "Add your insurer's authorisation code — call them first if you don't have one." : null)] })
  const docs = DOCS.filter((d) => d.spec === spec)

  if (f.status === "done" && S)
    return (
      <section className="nf-page nf-done" role="status">
        <p className="nf-label">Request received · {code}</p>
        <h1>We'll call you within two working hours.</h1>
        <p>
          A patient coordinator will offer you {S.name.toLowerCase()} appointments {site === "any" ? "at any of our sites" : `in ${SITES[site].name}`}
          {doc !== "any" ? ` with ${doc}` : ""}. Payment: {pay}. We've emailed a copy to {f.values.email}.
        </p>
      </section>
    )

  return (
    <section className="nf-page">
      <h1 className="nf-ph">Request a consultation</h1>
      <div className="nf-find">
        <div>
          <fieldset className="nf-fs">
            <legend>
              <span>A</span> Specialty
            </legend>
            <div className="nf-spec-grid">
              {SPECS.map((s) => (
                <button key={s.id} className={spec === s.id ? "on" : ""} aria-pressed={spec === s.id} onClick={() => (setSpec(s.id), setDoc("any"))}>
                  {s.name}
                </button>
              ))}
            </div>
          </fieldset>
          {S && (
            <>
              <fieldset className="nf-fs">
                <legend>
                  <span>B</span> Consultant & site
                </legend>
                <div className="nf-docs">
                  <button className={doc === "any" ? "on" : ""} onClick={() => setDoc("any")} aria-pressed={doc === "any"}>
                    <b>First available</b>
                    <span>Typical wait {S.wait} days</span>
                  </button>
                  {docs.map((d) => (
                    <button key={d.name} className={doc === d.name ? "on" : ""} onClick={() => setDoc(d.name)} aria-pressed={doc === d.name}>
                      <b>{d.name}</b>
                      <span>
                        {d.note} · next in {d.next} days
                      </span>
                    </button>
                  ))}
                </div>
                <div className="nf-seg" role="radiogroup" aria-label="Site">
                  {(["any", "MAN", "LDS", "SHF"] as const).map((k) => (
                    <button key={k} role="radio" aria-checked={site === k} className={site === k ? "on" : ""} onClick={() => setSite(k)}>
                      {k === "any" ? "Any site" : SITES[k].name}
                    </button>
                  ))}
                </div>
              </fieldset>
              <form className="nf-fs" onSubmit={f.submit()} noValidate>
                <legend className="nf-legend">
                  <span>C</span> About you
                </legend>
                <div className="nf-fields">
                  <NField label="Full name" id="name" err={f.errors.name}>
                    <input {...f.field("name")} autoComplete="name" />
                  </NField>
                  <NField label="Date of birth" id="dob" err={f.errors.dob}>
                    <input {...f.field("dob")} type="date" />
                  </NField>
                  <NField label="Email" id="email" err={f.errors.email}>
                    <input {...f.field("email")} type="email" autoComplete="email" />
                  </NField>
                  <NField label="Phone" id="phone" err={f.errors.phone}>
                    <input {...f.field("phone")} type="tel" autoComplete="tel" />
                  </NField>
                  <NField label="How will you pay?" id="pay">
                    <select id="f-pay" value={pay} onChange={(e) => setPay(e.target.value)}>
                      {["Self-pay", "Bupa", "AXA Health", "Aviva", "Vitality", "WPA"].map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </NField>
                  {pay !== "Self-pay" && (
                    <NField label="Authorisation code" id="auth" err={f.errors.auth}>
                      <input {...f.field("auth")} />
                    </NField>
                  )}
                  <NField label="What's wrong, briefly" id="reason" err={f.errors.reason} wide>
                    <textarea {...f.field("reason")} rows={3} />
                  </NField>
                </div>
                <button className="nf-btn big" type="submit">
                  {f.status === "sending" ? "Sending…" : "Send request"}
                </button>
              </form>
            </>
          )}
        </div>
        <aside className="nf-aside">
          <p className="nf-label">Your request</p>
          <dl>
            <dt>Specialty</dt>
            <dd>{S?.name ?? "Choose one"}</dd>
            <dt>Consultant</dt>
            <dd>{doc === "any" ? "First available" : doc}</dd>
            <dt>Site</dt>
            <dd>{site === "any" ? "Any" : SITES[site].name}</dd>
            <dt>Payment</dt>
            <dd>{pay}</dd>
          </dl>
          {S && <p className="nf-key">Self-pay initial consultation £220 – £260</p>}
          <p className="nf-muted small">Urgent symptoms like chest pain at rest, sudden weakness or difficulty breathing: call 999.</p>
        </aside>
      </div>
    </section>
  )
}

function NField({ label, id, err, wide, children }: { label: string; id: string; err?: string; wide?: boolean; children: ReactNode }) {
  return (
    <div className={`nf-field ${wide ? "wide" : ""} ${err ? "bad" : ""}`}>
      <label htmlFor={`f-${id}`}>{label}</label>
      {children}
      {err && (
        <p className="nf-err" id={`f-${id}-err`}>
          {err}
        </p>
      )}
    </div>
  )
}

/* ── consultants directory ───────────────────────────────────────── */

function Consultants({ pick }: { pick: (id: string) => void }) {
  const [spec, setSpec] = useState("all")
  const [site, setSite] = useState<Site | "all">("all")
  const [lang, setLang] = useState("all")
  const [q, setQ] = useState("")
  const langs = Array.from(new Set(DOCS.flatMap((d) => d.langs))).sort()
  const list = DOCS.filter((d) => (spec === "all" || d.spec === spec) && (site === "all" || d.sites.includes(site)) && (lang === "all" || d.langs.includes(lang)) && (!q || d.name.toLowerCase().includes(q.toLowerCase()))).sort((a, b) => a.next - b.next)
  return (
    <section className="nf-page">
      <h1 className="nf-ph">Consultants</h1>
      <div className="nf-filters">
        <label>
          Name
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" />
        </label>
        <label>
          Specialty
          <select value={spec} onChange={(e) => setSpec(e.target.value)}>
            <option value="all">All specialties</option>
            {SPECS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Site
          <select value={site} onChange={(e) => setSite(e.target.value as Site | "all")}>
            <option value="all">All sites</option>
            {(Object.keys(SITES) as Site[]).map((k) => (
              <option key={k} value={k}>
                {SITES[k].name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Language
          <select value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value="all">Any language</option>
            {langs.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </label>
        <p className="nf-count" aria-live="polite">
          {list.length} of {DOCS.length} shown · sorted by soonest
        </p>
      </div>
      <ul className="nf-doc-list">
        {list.map((d) => {
          const s = SPECS.find((x) => x.id === d.spec)!
          return (
            <li key={d.name}>
              <span className="nf-avatar" aria-hidden>
                {d.name.split(" ").slice(-2).map((p) => p[0]).join("")}
              </span>
              <div>
                <b>{d.name}</b>
                <span>
                  {s.name} — {d.note}
                </span>
                <small>
                  {d.sites.map((x) => SITES[x].name).join(" · ")} · Speaks {d.langs.join(", ")}
                </small>
              </div>
              <p className="nf-next">
                <b>{d.next}</b> days
                <small>next appointment</small>
              </p>
              <button className="nf-btn ghost" onClick={() => pick(d.spec)}>
                Request
              </button>
            </li>
          )
        })}
        {list.length === 0 && <li className="nf-empty">No consultants match those filters — try "Any language" or "All sites".</li>}
      </ul>
    </section>
  )
}

function Locations() {
  return (
    <section className="nf-page">
      <h1 className="nf-ph">Three sites</h1>
      <div className="nf-sites">
        {(Object.keys(SITES) as Site[]).map((k, i) => (
          <Reveal as="article" key={k} delay={i * 90}>
            <svg viewBox="0 0 300 150" aria-hidden className="nf-map">
              <rect width="300" height="150" fill="var(--surface)" />
              {[30, 75, 120].map((y) => (
                <line key={y} x1="0" x2="300" y1={y + i * 4} y2={y - i * 3} stroke="var(--line)" strokeWidth="6" />
              ))}
              {[60, 150, 240].map((x) => (
                <line key={x} y1="0" y2="150" x1={x + i * 6} x2={x - i * 5} stroke="var(--line)" strokeWidth="5" />
              ))}
              <rect x="135" y="60" width="30" height="30" fill="var(--primary)" />
              <text x="150" y="80" textAnchor="middle" fill="var(--on-primary)" fontSize="12" fontWeight="700" fontFamily="var(--display)">
                {k}
              </text>
            </svg>
            <p className="nf-label">0{i + 1}</p>
            <h2>{SITES[k].name}</h2>
            <p>{SITES[k].addr}</p>
            <dl>
              <dt>Open</dt>
              <dd>{SITES[k].hours}</dd>
              <dt>Imaging</dt>
              <dd>{SITES[k].imaging}</dd>
              <dt>Getting here</dt>
              <dd>{SITES[k].note}</dd>
            </dl>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function Resources() {
  const cats = ["All", ...Array.from(new Set(GUIDES.map((g) => g.cat)))]
  const [cat, setCat] = useState("All")
  const [open, setOpen] = useState<string | null>(null)
  const list = GUIDES.filter((g) => cat === "All" || g.cat === cat)
  return (
    <section className="nf-page">
      <h1 className="nf-ph">Patient guides</h1>
      <div className="nf-seg" role="tablist" aria-label="Category">
        {cats.map((c) => (
          <button key={c} role="tab" aria-selected={cat === c} className={cat === c ? "on" : ""} onClick={() => setCat(c)}>
            {c}
          </button>
        ))}
      </div>
      <ul className="nf-guides">
        {list.map((g) => (
          <li key={g.title}>
            <button aria-expanded={open === g.title} onClick={() => setOpen(open === g.title ? null : g.title)}>
              <span className="nf-label">{g.cat}</span>
              <b>{g.title}</b>
              <span className="nf-muted">{g.mins} min read</span>
            </button>
            {open === g.title && <p>{g.body}</p>}
          </li>
        ))}
      </ul>
    </section>
  )
}
