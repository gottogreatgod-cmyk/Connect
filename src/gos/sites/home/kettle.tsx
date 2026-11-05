import "./kettle.css"
import { openState } from "../../kit/site-kit"

/**
 * KETTLE & CO PLUMBING — Low · Starter · Local Service One-Page
 * Two vans, one phone number. The phone number IS the website.
 */

const PHONE = "0113 496 0188"
const TEL = "tel:01134960188"
const HOURS: ([number, number] | null)[] = [[9, 14], [7.5, 18], [7.5, 18], [7.5, 18], [7.5, 18], [7.5, 18], [8, 14]]

const JOBS = [
  ["Leaks & burst pipes", "Same day in most of LS6 – LS17. Water off first — we'll talk you through finding your stopcock on the phone."],
  ["Boiler repair & service", "Gas Safe engineers. Worcester, Vaillant, Ideal, Baxi. Annual service with a written safety record."],
  ["Blocked drains & toilets", "Sinks, toilets, outside gullies. Rods and jetting on the van, no subcontractors."],
  ["Taps, valves & cisterns", "Dripping taps, running toilets, sticky valves. Usually fixed in one visit with parts we carry."],
  ["Radiators & heating", "Cold spots, bleeding, balancing, new radiators and thermostatic valves."],
  ["Bathrooms", "Full refits planned and quoted in writing. Booked weeks ahead, finished on the day we say."],
]

const PRICES = [
  ["Call-out & first 30 min", "£65"],
  ["Each extra 30 min", "£30"],
  ["Boiler service", "£85"],
  ["Gas safety certificate (landlord)", "£70"],
  ["Emergency after 6pm / weekends", "+£40"],
]

const AREAS = ["LS6 Headingley", "LS5 Kirkstall", "LS4 Burley", "LS16 Adel & Cookridge", "LS17 Alwoodley", "LS7 Chapel Allerton", "LS8 Roundhay", "LS18 Horsforth"]

export default function Kettle() {
  const st = openState(HOURS)
  return (
    <div className="kt">
      <a href="#main" className="skip">
        Skip to content
      </a>
      <div className="kt-bar">
        <span className={st.open ? "on" : ""}>
          <i aria-hidden /> {st.open ? "Phones open — answered by Dan or Shaz" : st.line}
        </span>
        <span>Gas Safe registered · 2 vans · North Leeds</span>
      </div>
      <header className="kt-head">
        <a href="#top" className="kt-logo" aria-label="Kettle & Co Plumbing">
          <span className="kt-badge" aria-hidden>
            K&amp;Co
          </span>
          <span>
            KETTLE &amp; CO
            <small>Plumbing &amp; heating</small>
          </span>
        </a>
        <a href={TEL} className="kt-headcall">
          {PHONE}
        </a>
      </header>

      <main id="main">
        <section className="kt-hero" id="top">
          <p className="kt-tag">Leak? No heating? Blocked?</p>
          <h1>Call us. We'll tell you straight if it needs a visit.</h1>
          <a href={TEL} className="kt-mega" aria-label={`Call ${PHONE}`}>
            <span>Tap to call</span>
            {PHONE}
          </a>
          <ul className="kt-promises">
            <li>
              <b>£65</b> call-out, first half hour included
            </li>
            <li>
              <b>2 hrs</b> typical arrival for leaks
            </li>
            <li>
              <b>12 mo</b> guarantee on all work
            </li>
          </ul>
        </section>

        <section className="kt-jobs" aria-labelledby="jobs-h">
          <h2 id="jobs-h">What we fix</h2>
          <ol>
            {JOBS.map(([h, p], i) => (
              <li key={h}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <h3>{h}</h3>
                <p>{p}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="kt-sheet" aria-labelledby="price-h">
          <div className="kt-sheet-card">
            <p className="kt-sheet-head">
              <span>JOB SHEET</span>
              <span>PRICES INC. VAT</span>
            </p>
            <h2 id="price-h">What it costs</h2>
            <table>
              <caption className="sr-only">Price guide</caption>
              <tbody>
                {PRICES.map(([k, v]) => (
                  <tr key={k}>
                    <th scope="row">{k}</th>
                    <td>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="kt-fine">Parts charged at cost, shown to you before we fit them. Card or bank transfer on the day. No VAT surprises.</p>
          </div>
          <div className="kt-areas">
            <h2>Where we go</h2>
            <p>From our yard on Kirkstall Road. Outside these? Call anyway — if we can't help, we'll tell you who can.</p>
            <ul>
              {AREAS.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="kt-reviews" aria-labelledby="rev-h">
          <h2 id="rev-h">From the neighbours</h2>
          <div>
            {[
              ["Pipe burst under the sink on a Sunday. Dan talked me through turning the water off, then turned up 90 minutes later.", "Helen, Headingley"],
              ["Quoted £180 for the valve, charged £180. Showed me the old part. That's all I want from a plumber.", "Raj, Adel"],
              ["Annual boiler service, on time, boots off at the door, certificate emailed before he'd left the street.", "Mrs O'Neill, Roundhay"],
            ].map(([q, a]) => (
              <figure key={a}>
                <blockquote>{q}</blockquote>
                <figcaption>
                  {a} <span>Demo review</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="kt-last">
          <h2>Water where it shouldn't be?</h2>
          <p>Turn off the stopcock (usually under the kitchen sink), switch off the electrics near the leak, then call.</p>
          <a href={TEL} className="kt-mega small">
            {PHONE}
          </a>
        </section>
      </main>

      <footer className="kt-foot">
        <span>Kettle &amp; Co Plumbing Ltd · Unit 4, Kirkstall Road Yard, Leeds LS4 2AZ</span>
        <span>dan@kettleplumbing.co.uk</span>
        <span>Demo business — Growth OS Starter template.</span>
      </footer>
      <a href={TEL} className="kt-float" aria-label={`Call ${PHONE}`}>
        Call {PHONE}
      </a>
    </div>
  )
}
