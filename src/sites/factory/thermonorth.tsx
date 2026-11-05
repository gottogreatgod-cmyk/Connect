'use client'

/**
 * Template 1.2 — HVAC Company · `thermonorth`
 * Family F1 Home Services & Trades · DNA: comfort engineering + energy savings
 * Composed from the shared module library; sections appear per tier (T1 ⊂ T2 ⊂ T3 ⊂ T4).
 */

import * as React from 'react'
import { thermonorth as D } from '@/factory/thermonorth'
import { useFactory } from '@/factory/store'
import { kitTier } from '@/factory/ladder'
import type { Tier } from '@/factory/types'
import { useSite } from '@/sites/kit/site-kit'

import { ModuleTag, Section, DemoContentBadge } from '@/modules/kit/primitives'
import { SkipToContent, AnnouncementBar, Breadcrumb, BackToTop, CookieConsent, OfflineBanner, TemplateErrorBoundary } from '@/modules/kit/system'
import { SiteHeader, SiteFooter, StickyActionBar, StickyIcons } from '@/modules/kit/chrome'
import { HeroLocal, OpenNowBadge, HeroCampaign, HeroVideo } from '@/modules/kit/heroes'
import { ServiceCardGrid, CostCalculator, QuoteCalculator, FinancingCalculator, ComparisonTable, Configurator, PersonalizedRecommendations, ProcessTimeline } from '@/modules/kit/value'
import { ReviewWall, GoogleReviewsEmbed, CaseStudyIndex, TeamCredentials, GuaranteePanel, ResultsStatStrip } from '@/modules/kit/proof'
import { ContactForm, CallNowPanel, BookingCalendar, MembershipSignup, NewsletterSignup } from '@/modules/kit/conversion'
import { GoogleMapEmbed, ServiceAreaMap, PostcodeChecker, HoursTable } from '@/modules/kit/local'
import { FAQAccordion, StructuredDataBlock } from '@/modules/kit/content'
import { ClientDashboardTeaser } from '@/modules/kit/ops'
import { RevealOnScroll, BeforeAfterTransition } from '@/modules/kit/motion'
import { WiggleText, MarqueeStrip } from '@/modules/kit/advanced-motion'
import { AiConcierge } from '@/modules/kit/ai'

/* The composition — a pure function of the factory tier (T1 ⊂ T2 ⊂ T3 ⊂ T4). */
function ThermonorthTemplate({ tier }: { tier: Tier }) {
  const track = useFactory((s) => s.track)
  /* the site's own motion cap — the advanced-motion layer honours it */
  const siteMotion = useSite().motion
  React.useEffect(() => {
    track('page_viewed', `thermonorth@T${tier}`)
  }, [tier])

  const stickyActions = [
    { id: 'call', label: 'Call', icon: StickyIcons.call, href: D.phone.href, onClick: () => track('call_clicked', 'sticky') },
    ...(tier >= 3 ? [{ id: 'book', label: 'Book survey', icon: StickyIcons.book, href: '#booking' }] : []),
    ...(tier >= 2 ? [{ id: 'quote', label: 'Estimate', icon: StickyIcons.quote, href: '#calculator' }] : []),
    { id: 'faq', label: 'FAQ', icon: StickyIcons.chat, href: '#faq', variant: 'ghost' as const },
  ]

  return (
    <div className="brand-thermonorth flex flex-col bg-background text-foreground">
      <SkipToContent />
      <TemplateErrorBoundary>
        <AnnouncementBar
          moduleTag="AnnouncementBar@1"
          messages={[
            { icon: '⚡', text: 'Heating season check: 2 survey slots left this week — book below.' },
            { icon: '💶', text: 'Up to 45% subsidy on replacement heating — we file the paperwork.' },
          ]}
        />
        <SiteHeader
          brand={{ name: D.name, mark: D.mark, sub: D.sub }}
          nav={D.nav}
          cta={{ label: 'Free survey', href: tier >= 3 ? '#booking' : '#contact' }}
          phone={D.phone}
        />
        <Breadcrumb trail={['Home', 'Heating & cooling', 'Hamburg']} />

        <main id="main-content">
          <HeroLocal
            eyebrow="Meisterbetrieb since 2008 · Hamburg"
            headline={
              <WiggleText
                text="Heat pumps, gas and hybrid — engineered around your actual bills"
                mode="enter"
                each={0.02}
                disabled={siteMotion < 2}
              />
            }
            subhead="We size every system from your real consumption data, handle the subsidy paperwork, and stay reachable long after commissioning. 2,140 systems installed across Hamburg and the metro area."
            phone={D.phone}
            location="Hamburg & metro, 40 km"
            hoursNote="Mon–Fri 7:00–18:00 · Sat till 13:00"
            openNow={<OpenNowBadge hours={{ open: 7, close: 18 }} />}
            primaryCta={{ label: 'Book a free survey', href: tier >= 3 ? '#booking' : '#contact' }}
            secondaryCta={{ label: 'Size my system', href: '#calculator' }}
            stats={[
              { value: '2,140', label: 'systems installed' },
              { value: '−34%', label: 'avg. energy bill' },
              { value: '4.8★', label: 'avg. rating' },
            ]}
          />

          {/* the trust marquee — constant linear motion, the sanctioned kind */}
          <div className="border-y bg-muted/40" aria-label="Trust highlights">
            <MarqueeStrip seconds={26} disabled={siteMotion < 2} className="py-3 text-sm text-muted-foreground">
              {[
                ...D.certifications,
                ...D.services.map((s) => s.name),
                ...D.stats.map((s) => `${s.value.toLocaleString()}${s.suffix ?? ''} ${s.label}`),
              ].map((chip) => (
                <span key={chip} className="flex shrink-0 items-center gap-2 whitespace-nowrap">
                  <span className="size-1.5 rounded-full bg-primary/70" aria-hidden />
                  {chip}
                </span>
              ))}
            </MarqueeStrip>
          </div>

          {tier >= 2 && (
            <HeroCampaign
              offer={{
                title: 'Winter-ready tune-up — €99 instead of €189',
                detail: 'Combustion analysis, coil clean, wear-parts check and a written efficiency report. Booked before the first frost.',
              }}
              deadline="6 days 14 h"
              eligibility="Gas boilers & heat pumps · 8+ years old · Hamburg metro"
              cta={{ label: 'Claim tune-up offer', href: '#booking' }}
            />
          )}

          <Section id="services" eyebrow="Systems" title="One partner for the next 20 winters" description="Every technology on one price board — no upsell bias, the heat-load calculation decides, not the margin.">
            <ModuleTag ids={['Section:Systems']} />
            <RevealOnScroll>
              <ServiceCardGrid services={D.services} ctaLabel="Get estimate" />
            </RevealOnScroll>
          </Section>

          <Section id="calculator" tone="muted" eyebrow="Instant estimate" title={tier >= 2 ? 'Size your system in 20 seconds' : 'Talk to a planner'} description={tier >= 2 ? 'A real calculation basis: living area, system type and efficiency class produce the investment range our surveys confirm within ±5%.' : 'Leave your details and a planner calls you back with a realistic budget range.'}>
            <ModuleTag ids={['Section:Calculator']} />
            {tier >= 2 ? (
              <RevealOnScroll className="mx-auto max-w-4xl">
                <CostCalculator
                  title="What would my system cost?"
                  fields="hvac-sizing"
                  calc={({ size, type, efficiency }) => {
                    const base = { 'heat-pump': 118, 'gas-condensing': 52, hybrid: 96 }[type] ?? 90
                    const eff = efficiency === 'premium' ? 1.08 : 1
                    const min = Math.round((size * base * eff) / 100) * 100
                    return { min, max: Math.round((min * 1.22) / 100) * 100, note: `${size} m² · ${type} · ${efficiency} class. Includes standard install; radiators/electrical upgrades quoted after survey.` }
                  }}
                  ctaLabel="Book free survey"
                  ctaHref="#booking"
                />
              </RevealOnScroll>
            ) : (
              <RevealOnScroll className="mx-auto max-w-2xl">
                <CallNowPanel
                  phone={D.phone}
                  hours="Office hours + emergency line for total failures"
                  emergencyNote="No heating at all? Call the emergency line — plan members get a 24-hour response guarantee."
                />
              </RevealOnScroll>
            )}
          </Section>

          {tier >= 2 && (
            <Section id="process" eyebrow="How it works" title="From first call to warm rooms — four steps" description="A process you can plan around: every step has a duration, a deliverable and a named contact.">
              <ModuleTag ids={['Section:Process']} />
              <RevealOnScroll>
                <ProcessTimeline
                  steps={[
                    { title: 'Phone pre-check', detail: 'We look at your consumption data, building age and existing emitters before we ever drive out — many questions are answered in 10 minutes.', duration: '10 min call' },
                    { title: 'On-site survey', detail: 'Room-by-room heat-load calculation, radiator check, electrical and flue assessment. You get the full measurement protocol.', duration: '90 min on site' },
                    { title: 'Fixed quote + subsidy file', detail: 'Line-item quote plus the completed BEG subsidy application — you sign once, we file everything.', duration: '2–4 days' },
                    { title: 'Install & commissioning', detail: 'One crew, one schedule. Old unit disposed, app set up, walkthrough with the commissioning protocol in your hand.', duration: '1–3 days' },
                  ]}
                />
              </RevealOnScroll>
            </Section>
          )}

          {tier >= 3 && (
            <Section id="compare" tone="muted" eyebrow="Comparison" title="Heat pump vs. gas vs. hybrid — honest table" description="No technology religion. This is what the numbers look like for a typical 1960s Hamburg semi.">
              <ModuleTag ids={['Section:Compare']} />
              <RevealOnScroll>
                <ComparisonTable
                  columns={[
                    { name: 'Air/water heat pump', popular: true },
                    { name: 'Gas condensing', note: 'cheapest entry' },
                    { name: 'Hybrid', note: 'flexible' },
                  ]}
                  rows={[
                    { label: 'Investment (140 m², installed)', values: ['€16,500–21,500', '€7,000–9,500', '€13,000–17,000'] },
                    { label: 'Subsidy eligibility', values: [true, false, true] },
                    { label: 'CO₂ reduction vs. old gas', values: ['up to 70%', '15–25%', '45–60%'] },
                    { label: 'Annual energy (140 m²)', values: ['~€1,150', '~€1,850', '~€1,400'] },
                    { label: 'Works in 1960s building', values: ['with emitter check', true, true] },
                    { label: 'Maintenance interval', values: ['1 year', '2 years', '1 year'] },
                    { label: 'Noise on property', values: ['35 dB(A) at 3 m', 'flue only', '35 dB(A) at 3 m'] },
                  ]}
                />
              </RevealOnScroll>
            </Section>
          )}

          {tier >= 4 && (
            <Section id="configurator" eyebrow="Configurator" title="Build your efficiency package" description="Pick fuel, capacity and add-ons — the estimate updates live. The survey then fixes every line item.">
              <ModuleTag ids={['Section:Configurator']} />
              <RevealOnScroll>
                <Configurator
                  title="Efficiency package builder"
                  basePrice={0}
                  steps={[
                    {
                      id: 'fuel',
                      label: 'Energy source',
                      options: [
                        { id: 'hp', label: 'Air/water heat pump', price: 16500, hint: 'max. subsidy' },
                        { id: 'gas', label: 'Gas condensing', price: 7400, hint: 'fast swap' },
                        { id: 'hybrid', label: 'Hybrid', price: 13900, hint: 'flexible' },
                      ],
                    },
                    {
                      id: 'capacity',
                      label: 'Capacity class',
                      options: [
                        { id: 's', label: 'Small — up to 100 m²', price: 0 },
                        { id: 'm', label: 'Medium — 100–180 m²', price: 1400 },
                        { id: 'l', label: 'Large — 180 m²+', price: 2900 },
                      ],
                    },
                    {
                      id: 'addons',
                      label: 'Add-ons',
                      options: [
                        { id: 'thermo', label: 'Smart thermostat + app', price: 480 },
                        { id: 'buffer', label: 'Buffer tank', price: 2200 },
                        { id: 'water', label: 'Domestic hot water module', price: 1650 },
                        { id: 'none', label: 'None', price: 0 },
                      ],
                    },
                  ]}
                />
              </RevealOnScroll>
            </Section>
          )}

          {tier >= 3 && (
            <Section id="financing" tone="muted" eyebrow="Financing" title="Spread the investment, keep the grant" description="Subsidies and financing combine — most clients finance the net amount after the grant is confirmed.">
              <ModuleTag ids={['Section:Financing']} />
              <div className="grid gap-6 @min-[1024px]:grid-cols-2">
                <RevealOnScroll><FinancingCalculator defaultAmount={12000} maxAmount={30000} apr={6.9} /></RevealOnScroll>
                <RevealOnScroll delay={0.08}>
                  <QuoteCalculator
                    title="Quick pre-estimate"
                    description="Rough budget by floor area — delivered by email in seconds (demo)."
                    calc={(area) => ({ min: Math.round((area * 108) / 100) * 100, max: Math.round((area * 132) / 100) * 100 })}
                  />
                </RevealOnScroll>
              </div>
            </Section>
          )}

          <Section id="coverage" eyebrow="Coverage" title="Hamburg & 40 km metro — from Blankenese to Barmbek">
            <ModuleTag ids={['Section:Coverage']} />
            {tier >= 2 && (
              <RevealOnScroll className="mb-10">
                <ServiceAreaMap zone={D.coverageZone} neighborhoods={[{ name: 'Altona', etaMinutes: 25, jobs: 214 }, { name: 'Eimsbüttel', etaMinutes: 20, jobs: 188 }, { name: 'Wandsbek', etaMinutes: 30, jobs: 165 }, { name: 'Harburg', etaMinutes: 38, jobs: 92 }]} />
              </RevealOnScroll>
            )}
            {tier >= 2 && (
              <RevealOnScroll className="mb-10 max-w-xl">
                <PostcodeChecker validPrefixes={D.postcodes} />
              </RevealOnScroll>
            )}
            <RevealOnScroll>
              <div className="grid gap-4 @min-[768px]:grid-cols-2">
                <GoogleMapEmbed address={D.address} city={D.city} label={`${D.name} — workshop & showroom`} />
                <HoursTable hours={D.hours} holidayNote="Emergency line staffed 24/7 for total heating failures." />
              </div>
            </RevealOnScroll>
          </Section>

          <Section id="reviews" tone="muted" eyebrow="Reviews">
            <ModuleTag ids={['Section:Reviews']} />
            {tier >= 2 ? (
              <RevealOnScroll>
                <ReviewWall reviews={D.reviews} />
              </RevealOnScroll>
            ) : (
              <RevealOnScroll>
                <GoogleReviewsEmbed rating={4.8} count={312} reviews={D.reviews} />
              </RevealOnScroll>
            )}
          </Section>

          {tier >= 3 && (
            <Section id="membership" eyebrow="Maintenance plans" title="Never think about service dates again" description="Members get automatic scheduling, priority dispatch and fixed annual pricing.">
              <ModuleTag ids={['Section:Membership']} />
              <RevealOnScroll>
                <MembershipSignup
                  plans={[
                    { name: 'Basic care', priceMonthly: 19, perks: ['Annual combustion check', 'Reminder service', '10% repair discount'] },
                    { name: 'Comfort', priceMonthly: 29, perks: ['Everything in Basic', '24 h priority dispatch', 'Annual heat-pump coil clean', 'Free wear-parts check'], popular: true },
                    { name: 'Complete', priceMonthly: 44, perks: ['Everything in Comfort', 'All wear parts included', 'Remote monitoring', 'Annual efficiency report'] },
                  ]}
                  ctaLabel="Choose plan"
                />
              </RevealOnScroll>
            </Section>
          )}

          {tier >= 3 && (
            <Section id="booking" tone="muted" eyebrow="Booking" title="Book the free survey" description="Ninety minutes on site, full heat-load calculation, zero cost, zero obligation.">
              <ModuleTag ids={['Section:Booking']} />
              <RevealOnScroll className="mx-auto max-w-4xl">
                <BookingCalendar
                  serviceOptions={['Free survey (90 min)', 'Tune-up offer €99', 'Second-opinion consult (free)', 'Cooling planning (free)']}
                  slots={['07:30', '10:00', '13:30', '16:00']}
                  confirmTitle="Survey reserved"
                  confirmSteps={['Planner assigned — you get their direct line', 'Energy bills requested for the heat-load calc', 'Fixed quote + subsidy file within 4 days']}
                />
              </RevealOnScroll>
            </Section>
          )}

          {tier >= 3 && (
            <Section id="team" eyebrow="Team" title="Certified engineers, not commission-hungry salespeople" description="Four F-gas category I engineers, a dena-listed energy consultant on staff, and 91 combined years in building services.">
              <ModuleTag ids={['Section:Team']} />
              <RevealOnScroll><TeamCredentials members={D.team} /></RevealOnScroll>
              <RevealOnScroll className="mt-10"><GuaranteePanel guarantees={D.guarantees} /></RevealOnScroll>
            </Section>
          )}

          {tier >= 3 && (
            <Section id="cases" tone="muted" eyebrow="Case studies" title="Projects with measured outcomes" description="Every case study shows the meter reading, not a marketing claim.">
              <ModuleTag ids={['Section:Cases']} />
              <RevealOnScroll><CaseStudyIndex studies={D.caseStudies} /></RevealOnScroll>
            </Section>
          )}

          {tier >= 4 && (
            <>
              <Section id="proof-motion" eyebrow="Before / after" title="Watch the bill fall as you scroll" description="The scroll-linked transition blends the old gas bill into the new heat-pump bill — reduced-motion users see the static comparison.">
                <ModuleTag ids={['Section:ProofMotion']} />
                <div className="mx-auto max-w-3xl">
                  <RevealOnScroll>
                    <BeforeAfterTransition
                      beforeLabel="Gas bill 2021 — €2,310/yr"
                      afterLabel="Heat pump 2024 — €1,148/yr"
                      before={{
                        background:
                          'repeating-linear-gradient(115deg, #8b8b8b 0px, #8b8b8b 26px, #777 26px, #777 52px), radial-gradient(circle at 30% 30%, #a8a29e, #57534e)',
                      }}
                      after={{
                        background:
                          'repeating-linear-gradient(115deg, #f59e0b 0px, #f59e0b 26px, #d97706 26px, #d97706 52px), radial-gradient(circle at 70% 70%, #fbbf24, #b45309)',
                      }}
                      caption="Scroll to sweep — fictional demo figures marked as demo content."
                    />
                  </RevealOnScroll>
                </div>
              </Section>

              <Section tone="muted" eyebrow="Operating figures" title="Eleven winters of numbers">
                <ModuleTag ids={['Section:Stats']} />
                <RevealOnScroll><ResultsStatStrip stats={D.stats} /></RevealOnScroll>
              </Section>

              <Section eyebrow="Seasonal loop" title="See a tune-up before you book one">
                <ModuleTag ids={['Section:HeroVideo']} />
                <div className="mx-auto max-w-3xl">
                  <RevealOnScroll>
                    <HeroVideo title="Tune-up, 90 seconds" caption="Combustion analysis → coil clean → wear parts → efficiency report. Poster fallback shown here." />
                  </RevealOnScroll>
                </div>
              </Section>

              <Section tone="muted" eyebrow="For your home" title="Season-aware recommendations">
                <ModuleTag ids={['Section:Recommendations']} />
                <RevealOnScroll>
                  <PersonalizedRecommendations
                    recommendations={[
                      {
                        season: 'Winter',
                        items: [
                          { title: 'Heating-curve check', reason: 'Cold months expose wrong curves — costs drop ~6% after optimisation.', price: '€89' },
                          { title: 'Emergency priority slot', reason: 'Plan members get guaranteed 24 h response until March.', price: 'included' },
                          { title: 'Frost-watch remote setup', reason: 'Get an alert before pipes or pumps freeze.', price: 'free with app' },
                        ],
                      },
                      {
                        season: 'Spring',
                        items: [
                          { title: 'Heat-pump coil clean', reason: 'Pollen load cuts output by up to 12% — clean before summer mode.', price: '€129' },
                          { title: 'Subsidy pre-check', reason: 'Spring is the queue-free window for BEG filings.', price: 'free' },
                          { title: 'Cooling commissioning', reason: 'Split units tested before the first heatwave.', price: '€99' },
                        ],
                      },
                      {
                        season: 'Summer',
                        items: [
                          { title: 'Cooling tune-up', reason: 'Refrigerant and filter check keeps SEER at spec.', price: '€119' },
                          { title: 'Ventilation hygiene check', reason: 'HRV filters replaced, airflow rebalanced.', price: '€89' },
                          { title: 'Hydraulic balancing', reason: 'Quieter, cheaper heating before the season starts.', price: 'from €450' },
                        ],
                      },
                      {
                        season: 'Autumn',
                        items: [
                          { title: 'Full winter readiness', reason: 'Combustion analysis + wear parts — the €99 campaign slot.', price: '€99' },
                          { title: 'Radiator bleed & balancing', reason: 'Cold-feet corners fixed before it matters.', price: '€79' },
                          { title: 'System health report', reason: 'Written baseline for the heating season.', price: 'included' },
                        ],
                      },
                    ]}
                  />
                </RevealOnScroll>
              </Section>

              <Section tone="muted" eyebrow="Client portal" title="Your heating, one login">
                <ModuleTag ids={['Section:Dashboard']} />
                <RevealOnScroll><ClientDashboardTeaser brand="ThermoNorth" /></RevealOnScroll>
              </Section>
            </>
          )}

          <Section id="contact" eyebrow="Contact" title="Call the office, or let the advisor route you">
            <ModuleTag ids={['Section:Contact']} />
            <div className="grid gap-6 @min-[1024px]:grid-cols-[0.9fr_1.1fr]">
              <div className="flex flex-col gap-4">
                <RevealOnScroll>
                  <CallNowPanel
                    phone={D.phone}
                    hours="Mon–Fri 7:00–18:00 · Sat 9:00–13:00 · Emergency line 24/7"
                    emergencyNote="Total heating failure in winter? The emergency line rings through to the on-call engineer — 84% of failures are resolved remotely on the first call."
                  />
                </RevealOnScroll>
                <RevealOnScroll delay={0.08}>
                  <div className="rounded-2xl border bg-card p-5">
                    <h3 className="text-sm font-bold">Showroom</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      See and hear three running systems (heat pump, hybrid, split unit) before deciding.
                      Osterfeldstraße 44, 22529 Hamburg — coffee is on us.
                    </p>
                  </div>
                </RevealOnScroll>
              </div>
              <RevealOnScroll delay={0.05}>
                <ContactForm subjects={['Heat pump planning', 'Boiler replacement', 'Cooling / split units', 'Maintenance plan', 'Subsidy question', 'Something else']} />
              </RevealOnScroll>
            </div>
          </Section>

          <Section id="faq" tone="muted" eyebrow="FAQ" title="Questions planners hear weekly" description="Searchable, grouped, FAQPage-schema ready.">
            <ModuleTag ids={['Section:FAQ']} />
            <FAQAccordion faqs={D.faqs} />
          </Section>

          {tier >= 2 && (
            <Section>
              <ModuleTag ids={['Section:Newsletter']} />
              <RevealOnScroll>
                <NewsletterSignup
                  promise="Subsidy deadlines & seasonal efficiency tips for Hamburg homes"
                  frequency="Monthly, 2-minute read"
                />
              </RevealOnScroll>
            </Section>
          )}
        </main>

        <SiteFooter
          brand={{ name: D.name, mark: D.mark }}
          nav={D.nav}
          nap={{ address: [D.address, `${D.postcode} ${D.city}`, 'Germany'], phone: D.phone.display, email: D.email }}
          certifications={D.certifications}
        />

        {tier >= 3 && <StructuredDataBlock schema={D.schema} />}
        <StickyActionBar actions={stickyActions} moduleTag="StickyActionBar@1" />
        {tier >= 2 && <BackToTop />}
        {tier >= 4 && <AiConcierge brand="ThermoNorth" variant="ai" />}
        <CookieConsent />
        <OfflineBanner />
        <div className="sr-only"><DemoContentBadge /></div>
      </TemplateErrorBoundary>
    </div>
  )
}

/* ── the Growth OS mount ──────────────────────────────────────────
   Tier from the OS tier-morph ladder, anchors through the OS page
   router, registry page tabs scroll to sections. */
const PAGES = new Set(['home', 'services', 'calculator', 'coverage', 'reviews', 'membership', 'booking', 'contact', 'faq'])

export default function ThermonorthSite() {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const { tierStep, page, go, embedded } = useSite()
  const tier = kitTier(tierStep)

  /* registry page tabs → scroll the matching section into view */
  React.useEffect(() => {
    if (!embedded) return
    const root = rootRef.current
    if (!root) return
    const target = page === 'home' ? root : root.querySelector<HTMLElement>(`#${page}`)
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [page, embedded])

  /* in-site #anchor links → OS router (registry pages) or direct scroll */
  const onAnchorClick = (e: React.MouseEvent) => {
    if (!embedded) return
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]')
    if (!a || !rootRef.current?.contains(a)) return
    const id = a.getAttribute('href')?.slice(1)
    if (!id) return
    e.preventDefault()
    if (PAGES.has(id)) go(id)
    else rootRef.current.querySelector<HTMLElement>(`#${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div ref={rootRef} onClickCapture={onAnchorClick}>
      <ThermonorthTemplate tier={tier} />
    </div>
  )
}
