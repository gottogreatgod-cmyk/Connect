import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import "./halden.css"
import { Reveal, ref, rules, useForm, useSite } from "../../kit/site-kit"

/**
 * HALDEN HEALTH — Premium · Flagship · Patient Portal & Care Network
 * The website is the front door: triage, video visits, coverage and the
 * patient's own record — in English or Spanish, every string.
 */

type Lang = "en" | "es"
const LangCtx = createContext<Lang>("en")
const useT = () => {
  const l = useContext(LangCtx)
  return (en: string, es: string) => (l === "en" ? en : es)
}

export default function Halden() {
  const { page, go, motion } = useSite()
  const [lang, setLang] = useState<Lang>("en")
  const t = (en: string, es: string) => (lang === "en" ? en : es)
  const nav: [string, string, string][] = [
    ["care", "Get care now", "Atención ahora"],
    ["telehealth", "Video visit", "Videoconsulta"],
    ["coverage", "Coverage", "Cobertura"],
  ]
  return (
    <LangCtx.Provider value={lang}>
      <div className={`halden ${motion >= 3 ? "alive" : ""}`} lang={lang}>
        <a href="#main" className="skip">
          {t("Skip to content", "Ir al contenido")}
        </a>
        <p className="hd-emergency" role="note">
          {t("Life-threatening emergency? Call 112 now.", "¿Emergencia con riesgo vital? Llame al 112 ahora.")}
        </p>
        <header className="hd-head">
          <button className="hd-logo" onClick={() => go("home")} aria-label="Halden Health">
            <span className="hd-orb" aria-hidden />
            Halden
          </button>
          <nav aria-label={t("Main", "Principal")}>
            {nav.map(([id, en, es]) => (
              <button key={id} className={page === id ? "on" : ""} onClick={() => go(id)} aria-current={page === id ? "page" : undefined}>
                {t(en, es)}
              </button>
            ))}
          </nav>
          <div className="hd-lang" role="radiogroup" aria-label="Language / Idioma">
            {(["en", "es"] as const).map((l) => (
              <button key={l} role="radio" aria-checked={lang === l} className={lang === l ? "on" : ""} onClick={() => setLang(l)}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button className="hd-signin" onClick={() => go("portal")}>
            {t("My Halden", "Mi Halden")}
          </button>
        </header>
        <main id="main">
          {page === "home" && <Home />}
          {page === "care" && <Triage />}
          {page === "telehealth" && <Tele />}
          {page === "coverage" && <Coverage />}
          {page === "portal" && <Portal />}
        </main>
        <footer className="hd-foot">
          <div>
            <p className="hd-logo static">
              <span className="hd-orb" aria-hidden />
              Halden
            </p>
            <p>{t("Primary and urgent care across Rotterdam, Utrecht and The Hague.", "Atención primaria y urgente en Róterdam, Utrecht y La Haya.")}</p>
          </div>
          <ul>
            <li>{t("Video visits 07:00 – 23:00, every day", "Videoconsultas 07:00 – 23:00, todos los días")}</li>
            <li>{t("Clinics Mon – Sat 08:00 – 20:00", "Clínicas lun – sáb 08:00 – 20:00")}</li>
            <li>care@haldenhealth.nl · 010 555 0144</li>
          </ul>
          <p className="hd-legal">{t("Demo business — Growth OS Flagship template. Patient data shown is sample data. Not medical advice.", "Empresa de demostración — plantilla Flagship de Growth OS. Los datos de pacientes son de ejemplo. No es consejo médico.")}</p>
        </footer>
      </div>
    </LangCtx.Provider>
  )
}

/* ── home ────────────────────────────────────────────────────────── */

function Home() {
  const t = useT()
  const { go } = useSite()
  return (
    <>
      <section className="hd-hero">
        <div className="hd-aurora" aria-hidden>
          <i />
          <i />
          <i />
        </div>
        <div className="hd-hero-inner">
          <p className="hd-eyebrow">{t("Halden Health · Netherlands", "Halden Health · Países Bajos")}</p>
          <h1>{t("Care that starts where you are.", "Atención que empieza donde estás.")}</h1>
          <p className="hd-lede">{t("Tell us what's wrong and we'll route you in two minutes — to a doctor on video, a clinic today, or the right advice to stay home.", "Cuéntanos qué te pasa y en dos minutos te indicamos el camino: un médico por vídeo, una clínica hoy o el consejo adecuado para quedarte en casa.")}</p>
          <div className="hd-doors">
            <button className="hd-door primary" onClick={() => go("care")}>
              <span>{t("I need care now", "Necesito atención ahora")}</span>
              <small>{t("2-minute check · no account needed", "Revisión de 2 minutos · sin cuenta")}</small>
              <i aria-hidden>→</i>
            </button>
            <button className="hd-door" onClick={() => go("portal")}>
              <span>{t("Sign in to My Halden", "Entrar en Mi Halden")}</span>
              <small>{t("Results, messages, prescriptions", "Resultados, mensajes, recetas")}</small>
              <i aria-hidden>→</i>
            </button>
          </div>
          <ul className="hd-proof">
            <li>
              <b>14 min</b> {t("average wait for a video doctor", "espera media para un médico por vídeo")}
            </li>
            <li>
              <b>3</b> {t("walk-in clinics", "clínicas sin cita")}
            </li>
            <li>
              <b>€0</b> {t("deductible on GP care", "franquicia en atención general")}
            </li>
          </ul>
        </div>
      </section>

      <section className="hd-how">
        <Reveal className="hd-sec-head">
          <p className="hd-eyebrow">{t("How Halden works", "Cómo funciona Halden")}</p>
          <h2>{t("One record. Every route.", "Un historial. Todos los caminos.")}</h2>
        </Reveal>
        <div className="hd-how-grid">
          {[
            [t("Tell us", "Cuéntanos"), t("A short, branching check written by our GPs. It asks about danger signs first — always.", "Una revisión breve escrita por nuestros médicos. Primero pregunta por señales de alarma — siempre.")],
            [t("Get routed", "Te orientamos"), t("Video in minutes, a same-day clinic slot, or clear self-care advice with a follow-up message tomorrow.", "Vídeo en minutos, cita en clínica el mismo día, o consejos claros con un mensaje de seguimiento mañana.")],
            [t("Stay connected", "Sigue conectado"), t("Notes, results and prescriptions land in My Halden — and with your consent, with your own GP.", "Notas, resultados y recetas llegan a Mi Halden — y con tu permiso, a tu médico de cabecera.")],
          ].map(([h, p], i) => (
            <Reveal as="article" key={h} delay={i * 110}>
              <span className="hd-step">{String(i + 1).padStart(2, "0")}</span>
              <h3>{h}</h3>
              <p>{p}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="hd-clinics">
        <Reveal className="hd-sec-head">
          <p className="hd-eyebrow">{t("Clinics", "Clínicas")}</p>
          <h2>{t("Walk in, or book a time.", "Entra sin cita o reserva una hora.")}</h2>
        </Reveal>
        <div className="hd-clinic-grid">
          {[
            ["Rotterdam Centrum", "Coolsingel 74", t("Wait now ~25 min", "Espera ahora ~25 min")],
            ["Utrecht Oost", "Biltstraat 112", t("Wait now ~10 min", "Espera ahora ~10 min")],
            ["Den Haag Zeeheldenkwartier", "Piet Heinstraat 39", t("Wait now ~40 min", "Espera ahora ~40 min")],
          ].map(([n, a, w], i) => (
            <Reveal as="article" key={n} delay={i * 100}>
              <h3>{n}</h3>
              <p>{a}</p>
              <p className="hd-wait">
                <i aria-hidden /> {w}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="hd-safety">
        <h2>{t("Safe by design", "Seguro por diseño")}</h2>
        <ul>
          <li>{t("Every triage path checks for emergency signs before anything else.", "Cada camino de triaje busca señales de emergencia antes que nada.")}</li>
          <li>{t("Data stored in the EU, encrypted at rest and in transit.", "Datos almacenados en la UE, cifrados en reposo y en tránsito.")}</li>
          <li>{t("You choose who sees your record — and you can see who did.", "Tú eliges quién ve tu historial — y puedes ver quién lo hizo.")}</li>
          <li>{t("Doctors registered in the Dutch BIG register.", "Médicos inscritos en el registro BIG neerlandés.")}</li>
        </ul>
      </section>
    </>
  )
}

/* ── triage: conditional routing ─────────────────────────────────── */

type Cat = "fever" | "injury" | "breathing" | "chest" | "mind" | "skin"

function Triage() {
  const t = useT()
  const { go } = useSite()
  const [who, setWho] = useState<"me" | "child" | "other" | null>(null)
  const [age, setAge] = useState<"u1" | "1to12" | "13plus">("1to12")
  const [cat, setCat] = useState<Cat | null>(null)
  const [flags, setFlags] = useState<string[]>([])
  const [checked, setChecked] = useState(false)
  const [days, setDays] = useState<"today" | "few" | "week" | null>(null)

  const CATS: [Cat, string, string][] = [
    ["fever", "Fever or infection", "Fiebre o infección"],
    ["injury", "Injury, sprain or cut", "Lesión, esguince o corte"],
    ["breathing", "Cough or breathing", "Tos o respiración"],
    ["chest", "Chest pain", "Dolor en el pecho"],
    ["mind", "Mental health", "Salud mental"],
    ["skin", "Skin or rash", "Piel o sarpullido"],
  ]
  const FLAGS: Record<Cat, [string, string][]> = {
    fever: [["Stiff neck or a rash that doesn't fade when pressed", "Rigidez de cuello o manchas que no desaparecen al presionar"], ["Very drowsy or hard to wake", "Muy somnoliento o difícil de despertar"], ["Fever above 40 °C", "Fiebre por encima de 40 °C"]],
    injury: [["Bone visible or limb at a strange angle", "Hueso visible o extremidad en un ángulo extraño"], ["Bleeding that won't stop after 10 minutes of pressure", "Sangrado que no para tras 10 minutos de presión"], ["Head injury with vomiting or confusion", "Golpe en la cabeza con vómitos o confusión"]],
    breathing: [["Can't finish a sentence", "No puede terminar una frase"], ["Lips or face turning blue or grey", "Labios o cara azulados o grises"], ["Breathing much faster than normal at rest", "Respira mucho más rápido de lo normal en reposo"]],
    chest: [["Pain spreading to arm, jaw or back", "Dolor que se extiende al brazo, mandíbula o espalda"], ["Sweating, nausea or feeling faint with the pain", "Sudor, náuseas o mareo con el dolor"], ["Pain that started at rest and lasts over 15 minutes", "Dolor que empezó en reposo y dura más de 15 minutos"]],
    mind: [["Thoughts of ending your life, or a plan to", "Pensamientos o planes de quitarse la vida"], ["Feeling unsafe right now", "Sentirse en peligro ahora mismo"]],
    skin: [["Swelling of lips, tongue or throat", "Hinchazón de labios, lengua o garganta"], ["Rash spreading fast with fever", "Sarpullido que se extiende rápido con fiebre"]],
  }
  const emergency = checked && flags.length > 0
  const route = useMemo(() => {
    if (!cat || !days || emergency) return null
    if (cat === "chest") return "clinic"
    if (who === "child" && age === "u1" && cat === "fever") return "clinic"
    if (cat === "injury") return "clinic"
    if (cat === "skin" || cat === "mind") return "video"
    if (days === "today" && cat === "fever") return "self"
    return "video"
  }, [cat, days, emergency, who, age])

  const reset = () => {
    setWho(null)
    setCat(null)
    setFlags([])
    setChecked(false)
    setDays(null)
  }
  const stepN = !who ? 1 : !cat ? 2 : !checked ? 3 : !days && !emergency ? 4 : 5

  return (
    <section className="hd-page">
      <p className="hd-eyebrow">{t("Get care now", "Atención ahora")}</p>
      <h1 className="hd-ph">{t("Let's find the right care.", "Busquemos la atención adecuada.")}</h1>
      <div className="hd-tri">
        <div className="hd-tri-main">
          <div className="hd-meter" aria-hidden>
            <i style={{ width: `${(stepN / 5) * 100}%` }} />
          </div>

          <fieldset className="hd-q">
            <legend>{t("Who is this for?", "¿Para quién es?")}</legend>
            <div className="hd-opts">
              {(
                [
                  ["me", "Me", "Para mí"],
                  ["child", "My child", "Mi hijo/a"],
                  ["other", "Someone else", "Otra persona"],
                ] as const
              ).map(([id, en, es]) => (
                <button key={id} className={who === id ? "on" : ""} aria-pressed={who === id} onClick={() => setWho(id)}>
                  {t(en, es)}
                </button>
              ))}
            </div>
            {who === "child" && (
              <div className="hd-opts small">
                {(
                  [
                    ["u1", "Under 1 year", "Menor de 1 año"],
                    ["1to12", "1 – 12 years", "1 – 12 años"],
                    ["13plus", "13 – 17 years", "13 – 17 años"],
                  ] as const
                ).map(([id, en, es]) => (
                  <button key={id} className={age === id ? "on" : ""} aria-pressed={age === id} onClick={() => setAge(id)}>
                    {t(en, es)}
                  </button>
                ))}
              </div>
            )}
          </fieldset>

          {who && (
            <fieldset className="hd-q">
              <legend>{t("What's the main problem?", "¿Cuál es el problema principal?")}</legend>
              <div className="hd-opts grid">
                {CATS.map(([id, en, es]) => (
                  <button
                    key={id}
                    className={cat === id ? "on" : ""}
                    aria-pressed={cat === id}
                    onClick={() => {
                      setCat(id)
                      setFlags([])
                      setChecked(false)
                      setDays(null)
                    }}
                  >
                    {t(en, es)}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {cat && (
            <fieldset className="hd-q">
              <legend>{t("Is any of this happening right now?", "¿Está pasando algo de esto ahora mismo?")}</legend>
              <div className="hd-flags">
                {FLAGS[cat].map(([en, es]) => (
                  <label key={en}>
                    <input
                      type="checkbox"
                      checked={flags.includes(en)}
                      onChange={(e) => {
                        setFlags((f) => (e.target.checked ? [...f, en] : f.filter((x) => x !== en)))
                        setChecked(false)
                      }}
                    />
                    {t(en, es)}
                  </label>
                ))}
              </div>
              {!checked && (
                <button className="hd-btn" onClick={() => setChecked(true)}>
                  {flags.length ? t("Continue", "Continuar") : t("None of these", "Nada de esto")}
                </button>
              )}
            </fieldset>
          )}

          {emergency && (
            <div className="hd-alert" role="alert">
              <h2>{t("Call 112 now.", "Llame al 112 ahora.")}</h2>
              <p>{cat === "mind" ? t("You can also call 113 Suicide Prevention any time, free: 0800 0113. You are not alone, and you don't have to explain everything.", "También puedes llamar a 113 Prevención del Suicidio en cualquier momento, gratis: 0800 0113. No estás solo/a.") : t("What you've described needs emergency help, not a video visit. Stay with the person; if they're unconscious and not breathing, start CPR.", "Lo que describes necesita ayuda de emergencia, no una videoconsulta. Quédate con la persona; si está inconsciente y no respira, inicia la RCP.")}</p>
              <a className="hd-btn danger" href="tel:112">
                {t("Call 112", "Llamar al 112")}
              </a>
            </div>
          )}

          {checked && !emergency && (
            <fieldset className="hd-q">
              <legend>{t("How long has it been going on?", "¿Desde cuándo?")}</legend>
              <div className="hd-opts">
                {(
                  [
                    ["today", "Started today", "Empezó hoy"],
                    ["few", "2 – 6 days", "2 – 6 días"],
                    ["week", "A week or more", "Una semana o más"],
                  ] as const
                ).map(([id, en, es]) => (
                  <button key={id} className={days === id ? "on" : ""} aria-pressed={days === id} onClick={() => setDays(id)}>
                    {t(en, es)}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {route && (
            <div className={`hd-result r-${route}`} role="status">
              <p className="hd-eyebrow">{t("Our recommendation", "Nuestra recomendación")}</p>
              {route === "video" && (
                <>
                  <h2>{t("A video visit, today.", "Una videoconsulta, hoy.")}</h2>
                  <p>{t("A GP can assess this on video and prescribe if needed. Next doctor available in about 14 minutes.", "Un médico puede valorarlo por vídeo y recetar si hace falta. Próximo médico en unos 14 minutos.")}</p>
                  <button className="hd-btn" onClick={() => go("telehealth")}>
                    {t("Choose a video time", "Elegir hora de vídeo")}
                  </button>
                </>
              )}
              {route === "clinic" && (
                <>
                  <h2>{t("Be seen in person, today.", "Que te vean en persona, hoy.")}</h2>
                  <p>{t("This needs a hands-on examination. Utrecht Oost has the shortest wait right now (~10 min); all clinics keep same-day slots.", "Necesita una exploración en persona. Utrecht Oost tiene la espera más corta ahora (~10 min); todas las clínicas tienen citas para hoy.")}</p>
                  <button className="hd-btn" onClick={() => go("home")}>
                    {t("See clinic wait times", "Ver tiempos de espera")}
                  </button>
                </>
              )}
              {route === "self" && (
                <>
                  <h2>{t("Rest, fluids, and we'll check in.", "Reposo, líquidos y te escribimos.")}</h2>
                  <p>{t("Most fevers on day one settle with paracetamol and rest. We'll message you tomorrow morning — or start a video visit any time if it gets worse.", "La mayoría de fiebres del primer día mejoran con paracetamol y reposo. Te escribiremos mañana — o inicia una videoconsulta si empeora.")}</p>
                  <button className="hd-btn ghost" onClick={() => go("telehealth")}>
                    {t("Talk to a doctor anyway", "Hablar con un médico igualmente")}
                  </button>
                </>
              )}
            </div>
          )}
          {who && (
            <button className="hd-reset" onClick={reset}>
              {t("Start again", "Empezar de nuevo")}
            </button>
          )}
        </div>
        <aside className="hd-tri-aside">
          <h2>{t("Written by our GPs", "Escrito por nuestros médicos")}</h2>
          <p>{t("This check follows Dutch GP triage guidance and is reviewed every quarter. It doesn't diagnose — it gets you to the right place, fast.", "Esta revisión sigue las guías de triaje de medicina general neerlandesas y se revisa cada trimestre. No diagnostica — te lleva rápido al lugar adecuado.")}</p>
          <p className="hd-small">{t("Nothing you enter is stored unless you book.", "No guardamos nada salvo que reserves.")}</p>
        </aside>
      </div>
    </section>
  )
}

/* ── telehealth ──────────────────────────────────────────────────── */

function Tele() {
  const t = useT()
  const slots = useMemo(() => {
    const now = new Date()
    const out: Date[] = []
    const d = new Date(now)
    d.setMinutes(Math.ceil((d.getMinutes() + 10) / 15) * 15, 0, 0)
    while (out.length < 12) {
      const h = d.getHours()
      if (h >= 7 && h < 23) out.push(new Date(d))
      d.setMinutes(d.getMinutes() + 15)
    }
    return out
  }, [])
  const [slot, setSlot] = useState<Date | null>(null)
  const [lng, setLng] = useState("English")
  const [code] = useState(() => ref("VID"))
  const f = useForm({ name: "", email: "", what: "" }, { name: [rules.required()], email: [rules.email()], what: [rules.min(8)] })
  const fmt = (d: Date) => d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  const dayLabel = (d: Date) => (d.toDateString() === new Date().toDateString() ? t("Today", "Hoy") : t("Tomorrow", "Mañana"))

  if (f.status === "done" && slot)
    return (
      <section className="hd-page hd-done" role="status">
        <p className="hd-eyebrow">{t("Video visit booked", "Videoconsulta reservada")} · {code}</p>
        <h1 className="hd-ph">
          {dayLabel(slot)} {fmt(slot)}
        </h1>
        <p>{t(`We'll send the link to ${f.values.email} ten minutes before. Doctor will speak ${lng}.`, `Enviaremos el enlace a ${f.values.email} diez minutos antes. El médico hablará ${lng === "English" ? "inglés" : lng === "Español" ? "español" : "neerlandés"}.`)}</p>
        <div className="hd-devcheck">
          <span>✓ {t("Browser supported", "Navegador compatible")}</span>
          <span>✓ {t("Connection good", "Conexión buena")}</span>
          <span>○ {t("Camera — tested when you join", "Cámara — se prueba al entrar")}</span>
        </div>
      </section>
    )

  return (
    <section className="hd-page">
      <p className="hd-eyebrow">{t("Video visit · €0 with basic insurance", "Videoconsulta · €0 con seguro básico")}</p>
      <h1 className="hd-ph">{t("See a doctor from your sofa.", "Ve a un médico desde el sofá.")}</h1>
      <div className="hd-tele">
        <div>
          <h2 className="hd-h3">{t("Next available", "Próximas horas")}</h2>
          <div className="hd-slots">
            {slots.map((s, i) => (
              <button key={s.toISOString()} className={slot?.getTime() === s.getTime() ? "on" : ""} aria-pressed={slot?.getTime() === s.getTime()} onClick={() => setSlot(s)}>
                <b>{fmt(s)}</b>
                <small>
                  {dayLabel(s)} · {["Dr. de Vries", "Dr. Ortega", "Dr. Bakker"][i % 3]}
                </small>
              </button>
            ))}
          </div>
          <h2 className="hd-h3">{t("Consultation language", "Idioma de la consulta")}</h2>
          <div className="hd-opts small">
            {["English", "Español", "Nederlands"].map((l) => (
              <button key={l} className={lng === l ? "on" : ""} aria-pressed={lng === l} onClick={() => setLng(l)}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <form className="hd-card" onSubmit={slot ? f.submit() : (e) => e.preventDefault()} noValidate>
          <HField label={t("Full name", "Nombre completo")} id="name" err={f.errors.name}>
            <input {...f.field("name")} autoComplete="name" />
          </HField>
          <HField label="Email" id="email" err={f.errors.email}>
            <input {...f.field("email")} type="email" autoComplete="email" />
          </HField>
          <HField label={t("What would you like help with?", "¿En qué podemos ayudarte?")} id="what" err={f.errors.what}>
            <textarea {...f.field("what")} rows={4} />
          </HField>
          <button className="hd-btn full" type="submit" disabled={!slot}>
            {slot ? t(`Book ${fmt(slot)}`, `Reservar ${fmt(slot)}`) : t("Choose a time first", "Elige una hora primero")}
          </button>
        </form>
      </div>
    </section>
  )
}

function HField({ label, id, err, children }: { label: string; id: string; err?: string; children: ReactNode }) {
  return (
    <div className={`hd-field ${err ? "bad" : ""}`}>
      <label htmlFor={`f-${id}`}>{label}</label>
      {children}
      {err && (
        <p className="hd-err" id={`f-${id}-err`}>
          {err}
        </p>
      )}
    </div>
  )
}

/* ── coverage checker ────────────────────────────────────────────── */

function Coverage() {
  const t = useT()
  const [plan, setPlan] = useState("basic")
  const [svc, setSvc] = useState("gp")
  const PLANS: [string, string, string][] = [
    ["basic", "Basic insurance (basisverzekering)", "Seguro básico (basisverzekering)"],
    ["supp", "Basic + supplementary", "Básico + complementario"],
    ["expat", "International / expat plan", "Plan internacional / expatriado"],
    ["none", "Not insured in the Netherlands", "Sin seguro en Países Bajos"],
  ]
  const SVCS: [string, string, string][] = [
    ["gp", "GP or video visit", "Médico general o vídeo"],
    ["lab", "Blood test ordered by a GP", "Análisis pedido por el médico"],
    ["physio", "Physiotherapy", "Fisioterapia"],
    ["spec", "Specialist referral", "Derivación a especialista"],
  ]
  const answer = (): { ok: "yes" | "part" | "no"; en: string; es: string; cost: string } => {
    if (plan === "none") return { ok: "no", en: "Self-pay at fixed prices. You'll see the price before you confirm.", es: "Pago directo a precio fijo. Verás el precio antes de confirmar.", cost: svc === "gp" ? "€49" : svc === "lab" ? "€35 – €90" : svc === "physio" ? "€62" : "€120+" }
    if (plan === "expat") return { ok: "part", en: "Most international plans reimburse this. We send an itemised invoice you can claim with.", es: "La mayoría de planes internacionales lo reembolsan. Te enviamos una factura detallada para reclamar.", cost: t("Claim back", "Reembolsable") }
    if (svc === "gp") return { ok: "yes", en: "Fully covered and doesn't touch your annual deductible.", es: "Cubierto al 100% y no afecta a tu franquicia anual.", cost: "€0" }
    if (svc === "lab") return { ok: "part", en: "Covered, but counts towards your annual deductible (eigen risico).", es: "Cubierto, pero cuenta para tu franquicia anual (eigen risico).", cost: t("From deductible", "De la franquicia") }
    if (svc === "physio") return plan === "supp" ? { ok: "part", en: "Covered up to your supplementary plan's session limit.", es: "Cubierto hasta el límite de sesiones de tu plan complementario.", cost: t("Plan limit", "Límite del plan") } : { ok: "no", en: "Not covered by basic insurance for most adults. Self-pay applies.", es: "El seguro básico no lo cubre para la mayoría de adultos. Se paga directamente.", cost: "€62" }
    return { ok: "part", en: "Covered with a GP referral; counts towards your deductible.", es: "Cubierto con derivación del médico; cuenta para tu franquicia.", cost: t("From deductible", "De la franquicia") }
  }
  const a = answer()
  return (
    <section className="hd-page">
      <p className="hd-eyebrow">{t("Coverage", "Cobertura")}</p>
      <h1 className="hd-ph">{t("Know what you'll pay before you come.", "Sabe lo que pagarás antes de venir.")}</h1>
      <div className="hd-cov">
        <div>
          <h2 className="hd-h3">{t("Your insurance", "Tu seguro")}</h2>
          <div className="hd-opts col">
            {PLANS.map(([id, en, es]) => (
              <button key={id} className={plan === id ? "on" : ""} aria-pressed={plan === id} onClick={() => setPlan(id)}>
                {t(en, es)}
              </button>
            ))}
          </div>
          <h2 className="hd-h3">{t("The care you need", "La atención que necesitas")}</h2>
          <div className="hd-opts col">
            {SVCS.map(([id, en, es]) => (
              <button key={id} className={svc === id ? "on" : ""} aria-pressed={svc === id} onClick={() => setSvc(id)}>
                {t(en, es)}
              </button>
            ))}
          </div>
        </div>
        <div className={`hd-cov-out ok-${a.ok}`} aria-live="polite">
          <span className="hd-cov-badge">{a.ok === "yes" ? t("Covered", "Cubierto") : a.ok === "part" ? t("Partly covered", "Cubierto en parte") : t("Self-pay", "Pago directo")}</span>
          <p className="hd-cov-cost">{a.cost}</p>
          <p>{t(a.en, a.es)}</p>
          <p className="hd-small">{t("General guidance for Dutch insurance. Your policy documents are the final word.", "Orientación general sobre seguros neerlandeses. Tu póliza tiene la última palabra.")}</p>
        </div>
      </div>
    </section>
  )
}

/* ── portal preview ──────────────────────────────────────────────── */

function Portal() {
  const t = useT()
  const [refill, setRefill] = useState<Record<string, boolean>>({})
  const [rem, setRem] = useState({ sms: true, email: true, cal: false })
  const [tab, setTab] = useState<"overview" | "results" | "messages">("overview")
  const RESULTS = [
    { n: t("Vitamin D", "Vitamina D"), v: "62 nmol/L", r: "50 – 125", ok: true, note: t("Normal. No change needed.", "Normal. Sin cambios.") },
    { n: "HbA1c", v: "41 mmol/mol", r: "< 42", ok: true, note: t("At the top of normal — we'll recheck in a year.", "En el límite alto de lo normal — repetiremos en un año.") },
    { n: t("Ferritin", "Ferritina"), v: "18 µg/L", r: "20 – 200", ok: false, note: t("Slightly low. Dr. de Vries has messaged you.", "Algo baja. La Dra. de Vries te ha escrito.") },
  ]
  return (
    <section className="hd-page hd-portal">
      <p className="hd-demo">{t("Demo account — sample data, no real patient.", "Cuenta de demostración — datos de ejemplo.")}</p>
      <div className="hd-portal-head">
        <div>
          <p className="hd-eyebrow">{t("My Halden", "Mi Halden")}</p>
          <h1 className="hd-ph">{t("Good afternoon, Sanne.", "Buenas tardes, Sanne.")}</h1>
        </div>
        <div className="hd-ptabs" role="tablist">
          {(
            [
              ["overview", "Overview", "Resumen"],
              ["results", "Results", "Resultados"],
              ["messages", "Messages (1)", "Mensajes (1)"],
            ] as const
          ).map(([id, en, es]) => (
            <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? "on" : ""} onClick={() => setTab(id)}>
              {t(en, es)}
            </button>
          ))}
        </div>
      </div>

      {tab === "overview" && (
        <div className="hd-dash">
          <article className="hd-card">
            <h2 className="hd-h3">{t("Next appointment", "Próxima cita")}</h2>
            <p className="hd-big">{t("Thu 12 Nov · 09:30", "jue 12 nov · 09:30")}</p>
            <p>{t("Follow-up on blood results · Video · Dr. de Vries", "Seguimiento de análisis · Vídeo · Dra. de Vries")}</p>
          </article>
          <article className="hd-card">
            <h2 className="hd-h3">{t("Prescriptions", "Recetas")}</h2>
            {[
              ["Ferrous fumarate 200 mg", t("1 daily · 12 left", "1 al día · quedan 12")],
              ["Cetirizine 10 mg", t("as needed · 4 left", "si es necesario · quedan 4")],
            ].map(([n, d]) => (
              <div key={n} className="hd-rx">
                <span>
                  <b>{n}</b>
                  <small>{d}</small>
                </span>
                <button className={`hd-chip ${refill[n] ? "done" : ""}`} disabled={refill[n]} onClick={() => setRefill((r) => ({ ...r, [n]: true }))}>
                  {refill[n] ? t("Requested ✓", "Solicitada ✓") : t("Request refill", "Pedir más")}
                </button>
              </div>
            ))}
          </article>
          <article className="hd-card">
            <h2 className="hd-h3">{t("Reminders", "Recordatorios")}</h2>
            {(
              [
                ["sms", "Text message the day before", "SMS el día anterior"],
                ["email", "Email with preparation notes", "Email con instrucciones"],
                ["cal", "Add to my calendar automatically", "Añadir a mi calendario"],
              ] as const
            ).map(([k, en, es]) => (
              <label key={k} className="hd-switch">
                <input type="checkbox" checked={rem[k]} onChange={(e) => setRem({ ...rem, [k]: e.target.checked })} />
                <span aria-hidden />
                {t(en, es)}
              </label>
            ))}
          </article>
          <article className="hd-card">
            <h2 className="hd-h3">{t("Who can see my record", "Quién ve mi historial")}</h2>
            <p>{t("Your GP (Huisartsenpraktijk Kralingen) · Halden care team", "Tu médico (Huisartsenpraktijk Kralingen) · equipo Halden")}</p>
            <p className="hd-small">{t("Last opened by Dr. de Vries, 2 days ago.", "Abierto por última vez por la Dra. de Vries, hace 2 días.")}</p>
          </article>
        </div>
      )}
      {tab === "results" && (
        <ul className="hd-results">
          {RESULTS.map((r) => (
            <li key={r.n} className={r.ok ? "" : "flag"}>
              <b>{r.n}</b>
              <span className="hd-val">{r.v}</span>
              <span className="hd-small">
                {t("Range", "Rango")} {r.r}
              </span>
              <p>{r.note}</p>
            </li>
          ))}
        </ul>
      )}
      {tab === "messages" && (
        <article className="hd-card hd-msg">
          <p className="hd-small">Dr. Eva de Vries · {t("yesterday 16:42", "ayer 16:42")}</p>
          <p>{t("Hi Sanne — your ferritin is a little low, which may explain the tiredness. I've prescribed iron for three months; take it with orange juice, not tea. We'll recheck at your video visit on the 12th.", "Hola Sanne — tu ferritina está algo baja, lo que podría explicar el cansancio. Te he recetado hierro durante tres meses; tómalo con zumo de naranja, no con té. Lo revisaremos en la videoconsulta del día 12.")}</p>
        </article>
      )}
    </section>
  )
}
