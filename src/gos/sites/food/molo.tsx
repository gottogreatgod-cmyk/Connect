import "./molo.css"
import counterImg from "../../assets/img/cafe-counter.jpg"
import { asset, openState } from "../../kit/site-kit"

const counter = asset(counterImg)

/**
 * MOLO BAKEHOUSE — Low · Starter · Café Essentials
 * One honest page. Answers four questions in order: what's in the oven,
 * are you open, where are you, how do I hold a loaf.
 */

// hours[0=Sun..6=Sat] — decimal hours
const HOURS: ([number, number] | null)[] = [[8, 14], null, [7.5, 15], [7.5, 15], [7.5, 15], [7.5, 15], [8, 15]]
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const fmt = (x: number) => `${Math.floor(x)}:${String(Math.round((x % 1) * 60)).padStart(2, "0")}`
const PHONE = "0131 496 0142"

const BOARD = [
  {
    head: "Bread",
    note: "From 7.30",
    items: [
      ["Country sourdough", "5.80", "out by 11 on Sat"],
      ["Seeded rye tin", "6.20", ""],
      ["Fennel & golden raisin", "4.50", "Thu – Sat"],
      ["Baguette", "2.40", "two bakes, 7.30 & 11.00"],
    ],
  },
  {
    head: "Pastry",
    note: "Laminated in-house",
    items: [
      ["Butter croissant", "2.60", ""],
      ["Almond croissant", "3.40", "contains nuts"],
      ["Cardamom knot", "3.20", "the one people queue for"],
      ["Pain au chocolat", "2.90", ""],
      ["Seasonal Danish — plum", "3.60", ""],
    ],
  },
  {
    head: "Coffee",
    note: "Beans from Machina, Edinburgh",
    items: [
      ["Espresso / long black", "2.40", ""],
      ["Flat white", "3.30", "oat at no extra cost"],
      ["Batch filter", "2.80", "free refill while you sit"],
      ["Hot chocolate", "3.40", ""],
    ],
  },
]

export default function Molo() {
  const st = openState(HOURS)
  const today = new Date().getDay()
  return (
    <div className="molo">
      <a href="#main" className="skip">
        Skip to content
      </a>
      <p className="m-announce">
        Sourdough sells out by 11 on Saturdays — <a href={`tel:${PHONE.replace(/\s/g, "")}`}>call {PHONE}</a> and we'll hold a loaf with your name on it.
      </p>

      <header className="m-head">
        <a href="#top" className="m-logo" aria-label="Molo Bakehouse, home">
          <span>Molo</span>
          <small>Bakehouse · Stockbridge</small>
        </a>
        <nav aria-label="Main">
          <a href="#bake">Today's bake</a>
          <a href="#story">How we bake</a>
          <a href="#visit">Visit</a>
        </nav>
        <a className="m-call" href={`tel:${PHONE.replace(/\s/g, "")}`}>
          <span>Call the bakery</span>
          {PHONE}
        </a>
      </header>

      <main id="main">
        <section className="m-hero" id="top">
          <div className="m-hero-copy">
            <p className={`m-status ${st.open ? "open" : ""}`}>
              <i aria-hidden /> {st.line}
            </p>
            <h1>
              Bread with a <em>long night</em> behind it.
            </h1>
            <p className="m-lede">We mix the dough at four in the afternoon and bake from four in the morning. Sourdough, laminated pastry and a short coffee list on Raeburn Place — open until we sell out.</p>
            <div className="m-actions">
              <a href="#bake" className="m-btn">
                See today's bake
              </a>
              <a href="#visit" className="m-link">
                41 Raeburn Place, EH4 →
              </a>
            </div>
          </div>
          <figure className="m-arch">
            <img src={counter} alt="A flat white and an almond croissant on a worn oak table by the bakery window" width={1264} height={848} />
            <figcaption>
              <b>Almond croissant</b> twice-baked, frangipane, flaked almonds · £3.40
            </figcaption>
          </figure>
        </section>

        <section className="m-board" id="bake" aria-labelledby="bake-h">
          <div className="m-board-head">
            <h2 id="bake-h">Today's bake</h2>
            <p>Written up at 7am. If it's crossed out on the board inside, it's gone — ring ahead for anything you can't miss.</p>
          </div>
          <div className="m-cols">
            {BOARD.map((col) => (
              <div key={col.head} className="m-col">
                <h3>
                  {col.head} <small>{col.note}</small>
                </h3>
                <ul>
                  {col.items.map(([name, price, note]) => (
                    <li key={name}>
                      <span className="m-item">
                        {name}
                        {note && <em>{note}</em>}
                      </span>
                      <span className="m-dots" aria-hidden />
                      <span className="m-price">£{price}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="m-board-foot">Allergens: every bake contains gluten; most contain dairy and egg. Ask at the counter and we'll show you the recipe card.</p>
        </section>

        <section className="m-story" id="story" aria-labelledby="story-h">
          <h2 id="story-h">How a Molo loaf is made</h2>
          <ol>
            <li>
              <span className="m-time">4 pm</span>
              <h3>Mix & rest</h3>
              <p>Stoneground flour from Mungoswells in East Lothian, water, salt and a starter we've fed daily since 2016.</p>
            </li>
            <li>
              <span className="m-time">overnight</span>
              <h3>Sixteen hours, cold</h3>
              <p>The slow, cool prove is where the flavour comes from — and why we can't make more when we run out.</p>
            </li>
            <li>
              <span className="m-time">4 am</span>
              <h3>Into the deck oven</h3>
              <p>Bread first, pastry second. The first croissants come out at seven, just before Ana unlocks the door.</p>
            </li>
          </ol>
          <aside className="m-note">
            <p>
              “We'd rather sell out at two than throw bread away at five. If you want a loaf on a Saturday, a quick call is the surest way.”
            </p>
            <span>Ana Ferreira & Callum Reid, bakers and owners</span>
          </aside>
        </section>

        <section className="m-hold" aria-labelledby="hold-h">
          <div>
            <h2 id="hold-h">Hold a loaf, order a cake</h2>
            <p>For tomorrow's bread, ring before 2pm. Celebration cakes and 10+ loaves need two days' notice. We don't take card payments over the phone — you pay when you collect.</p>
          </div>
          <a className="m-btn big" href={`tel:${PHONE.replace(/\s/g, "")}`}>
            Call {PHONE}
          </a>
        </section>

        <section className="m-visit" id="visit" aria-labelledby="visit-h">
          <div className="m-visit-copy">
            <h2 id="visit-h">Visit</h2>
            <address>
              41 Raeburn Place
              <br />
              Stockbridge, Edinburgh EH4 1HY
            </address>
            <p className="m-small">Ten seats inside, two benches out front. Step-free entrance; dogs welcome on the benches.</p>
            <table className="m-hours">
              <caption className="sr-only">Opening hours</caption>
              <tbody>
                {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                  <tr key={d} className={d === today ? "today" : ""}>
                    <th scope="row">
                      {DAYS[d]}
                      {d === today && <span> · today</span>}
                    </th>
                    <td>{HOURS[d] ? `${fmt(HOURS[d]![0])} – ${fmt(HOURS[d]![1])}` : "Closed — we're baking for Tuesday"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <figure className="m-map" aria-label="Map: Molo sits on Raeburn Place between Comely Bank and the Water of Leith">
            <svg viewBox="0 0 400 300" role="img" aria-hidden>
              <rect width="400" height="300" fill="var(--surface)" />
              <path d="M-10 230 C80 200, 150 250, 230 215 S360 170, 420 190" stroke="color-mix(in srgb, var(--accent) 45%, transparent)" strokeWidth="14" fill="none" />
              <path d="M0 120 L400 105" stroke="var(--line)" strokeWidth="18" />
              <path d="M140 0 L170 300" stroke="var(--line)" strokeWidth="12" />
              <path d="M300 0 L280 300" stroke="var(--line)" strokeWidth="10" />
              <path d="M0 40 L400 60" stroke="var(--line)" strokeWidth="8" />
              <text x="20" y="98" fontSize="11" fill="var(--muted)" fontFamily="var(--body)" letterSpacing="1.5">RAEBURN PLACE</text>
              <text x="182" y="282" fontSize="10" fill="var(--muted)" fontFamily="var(--body)" letterSpacing="1.2" transform="rotate(-84 182 282)">DEAN STREET</text>
              <text x="250" y="244" fontSize="10" fill="var(--muted)" fontFamily="var(--body)" fontStyle="italic">Water of Leith</text>
              <circle cx="222" cy="113" r="16" fill="var(--primary)" />
              <text x="222" y="118" fontSize="13" textAnchor="middle" fill="var(--on-primary)" fontFamily="var(--display)" fontWeight="600">M</text>
            </svg>
            <figcaption>Two minutes from the 24 and 29 bus stops on Raeburn Place.</figcaption>
          </figure>
        </section>
      </main>

      <footer className="m-foot">
        <span className="m-foot-logo">Molo</span>
        <span>41 Raeburn Place, Edinburgh EH4 1HY</span>
        <a href={`tel:${PHONE.replace(/\s/g, "")}`}>{PHONE}</a>
        <span>hello@molobakehouse.co.uk</span>
        <span className="m-foot-small">Demo business — Growth OS Starter template.</span>
      </footer>
    </div>
  )
}
