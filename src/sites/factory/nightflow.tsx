'use client'

/**
 * Template 1.1 — 24/7 Emergency Plumbing · `nightflow`
 * Family F1 Home Services & Trades · DNA: urgent call + trust proof
 * Composed from the shared module library; sections appear per tier (T1 ⊂ T2 ⊂ T3 ⊂ T4).
 */

import * as React from 'react'
import { nightflow as D } from '@/factory/nightflow'
import { useFactory } from '@/factory/store'
import { kitTier } from '@/factory/ladder'
import type { Tier } from '@/factory/types'
import { useSite } from '@/sites/kit/site-kit'

import { ModuleTag, Section, DemoContentBadge } from '@/modules/kit/primitives'
import { SkipToContent, AnnouncementBar, Breadcrumb, BackToTop, CookieConsent, OfflineBanner, TemplateErrorBoundary } from '@/modules/kit/system'
import { SiteHeader, SiteFooter, StickyActionBar, StickyIcons } from '@/modules/kit/chrome'
import { HeroUrgent, OpenNowBadge, HeroCinematic } from '@/modules/kit/heroes'
import { ServiceCardGrid, FinancingCalculator } from '@/modules/kit/value'
import { TrustBar, ReviewCarousel, CaseStudyCard, CredentialWall, GuaranteePanel, TeamGrid, ResultsStatStrip } from '@/modules/kit/proof'
import { ContactForm, CallNowPanel, QuoteRequestForm, CallbackRequest, BookingCalendar, NewsletterSignup } from '@/modules/kit/conversion'
import { GoogleMapEmbed, ServiceAreaMap, PostcodeChecker, NeighborhoodPages } from '@/modules/kit/local'
import { FAQAccordion, BlogIndex, StructuredDataBlock } from '@/modules/kit/content'
import { EmergencyTriage, JobDispatchTeaser, ProjectStatusPortal } from '@/modules/kit/ops'
import { RevealOnScroll, BeforeAfterSlider, Hero3DObject } from '@/modules/kit/motion'
import { MarqueeStrip } from '@/modules/kit/advanced-motion'
import { AiConcierge, WhatsAppButton } from '@/modules/kit/ai'

/* The composition — a pure function of the factory tier (T1 ⊂ T2 ⊂ T3 ⊂ T4). */
function NightflowTemplate({ tier }: { tier: Tier }) {
  const track = useFactory((s) => s.track)
  /* the site's own motion cap — the advanced-motion layer honours it */
  const siteMotion = useSite().motion
  React.useEffect(() => {
    track('page_viewed', `nightflow@T${tier}`)
  }, [tier])

  const stickyActions = [
    { id: 'call', label: 'Call now', icon: StickyIcons.call, href: D.phone.href, onClick: () => track('call_clicked', 'sticky') },
    ...(tier >= 3 ? [{ id: 'book', label: 'Book', icon: StickyIcons.book, href: '#booking' }] : []),
    ...(tier >= 2 ? [{ id: 'quote', label: 'Quote', icon: StickyIcons.quote, href: '#quote' }] : []),
    ...(tier >= 2 ? [{ id: 'chat', label: 'WhatsApp', icon: StickyIcons.chat, href: 'https://wa.me/492115550123' }] : []),
  ]

  return (
    <div className="brand-nightflow flex flex-col bg-background text-foreground">
      <SkipToContent />
      <TemplateErrorBoundary>
        <AnnouncementBar
          moduleTag="AnnouncementBar@1"
          messages={[
            { icon: '🚨', text: '24/7 emergency dispatch is fully staffed tonight — avg. arrival 41 min.' },
            { icon: '❄️', text: 'Freeze warning: insulate exposed pipes now, guide in our knowledge base.' },
          ]}
        />
        <SiteHeader
          brand={{ name: D.name, mark: D.mark, sub: D.sub }}
          nav={D.nav}
          cta={{ label: 'Book a plumber', href: tier >= 3 ? '#booking' : '#contact' }}
          phone={D.phone}
        />
        <Breadcrumb trail={['Home', 'Emergency plumber', 'Düsseldorf']} />

        <main id="main-content">
          <HeroUrgent
            brand={D.name}
            headline="Water where it should not be? We are already awake."
            subhead="Master-licensed plumbers on dispatch around the clock. A calm voice on the phone in 3 rings, a technician at your door in about 41 minutes — with a fixed price agreed before any tool comes out."
            phone={D.phone}
            responseTime="41 min avg. arrival"
            openNow={<OpenNowBadge />}
            trustPoints={['Master license DE-DUS-88412-A', '€5M insured', 'No subcontracting', 'Fixed price in writing']}
            primaryCta={{ label: D.phone.display, href: D.phone.href }}
            secondaryCta={{ label: tier >= 2 ? 'Run 60-second triage' : 'Request a quote', href: tier >= 2 ? '#triage' : '#contact' }}
          />

          {/* the trust marquee — constant linear motion, the sanctioned kind */}
          <div className="border-y border-zinc-800/60 bg-zinc-950/40" aria-label="Trust highlights">
            <MarqueeStrip seconds={24} disabled={siteMotion < 2} className="py-3 text-sm text-zinc-400">
              {[
                ...D.certifications,
                ...D.services.map((s) => s.name),
                '41 min avg. arrival',
                'Fixed price in writing',
              ].map((chip) => (
                <span key={chip} className="flex shrink-0 items-center gap-2 whitespace-nowrap">
                  <span className="size-1.5 rounded-full bg-amber-500/80" aria-hidden />
                  {chip}
                </span>
              ))}
            </MarqueeStrip>
          </div>

          {tier >= 2 && (
            <TrustBar items={D.trustItems} />
          )}

          <Section id="services" eyebrow="Services" title="One crew for everything water, gas and heat" description="Transparent price-from figures, 24/7 availability where it matters, and same-day slots for everything else.">
            <ModuleTag ids={['Section:Services']} />
            <RevealOnScroll>
              <ServiceCardGrid services={D.services} ctaLabel="Get fixed quote" />
            </RevealOnScroll>
          </Section>

          {tier >= 2 && (
            <Section id="triage" tone="muted" eyebrow="Emergency triage" title="Not sure how urgent it is?" description="Three questions, thirty seconds — we route you to the night desk or a cheaper daytime slot, honestly.">
              <ModuleTag ids={['Section:Triage']} />
              <div className="grid gap-6 @min-[1024px]:grid-cols-2">
                <RevealOnScroll><EmergencyTriage /></RevealOnScroll>
                <RevealOnScroll delay={0.08}>
                  <div className="flex h-full flex-col gap-4">
                    <PostcodeChecker validPrefixes={D.postcodes} />
                    <WhatsAppButton label="Ask via WhatsApp" />
                  </div>
                </RevealOnScroll>
              </div>
            </Section>
          )}

          <Section id="coverage" tone={tier >= 2 ? 'default' : 'muted'} eyebrow="Coverage" title={tier >= 3 ? 'Local crews across the Rhein-Ruhr zone' : 'Serving Düsseldorf & the Rhein-Ruhr zone'} description="One dispatch centre, six neighbourhood crews. Your postcode decides the ETA — check it above or browse the local pages.">
            <ModuleTag ids={['Section:Coverage']} />
            {tier >= 2 && (
              <RevealOnScroll className="mb-10">
                <ServiceAreaMap zone={D.coverageZone} neighborhoods={D.neighborhoods} />
              </RevealOnScroll>
            )}
            {tier >= 3 && (
              <RevealOnScroll className="mb-10">
                <NeighborhoodPages neighborhoods={D.neighborhoods} />
              </RevealOnScroll>
            )}
            <RevealOnScroll>
              <div className="grid gap-4 @min-[768px]:grid-cols-2">
                <GoogleMapEmbed address={D.address} city={D.city} label={`${D.name} — HQ & night desk`} />
                <div className="flex flex-col justify-center gap-3 rounded-2xl border bg-card p-6">
                  <h3 className="text-lg font-bold">Address & directions</h3>
                  <p className="text-sm text-muted-foreground">
                    {D.address} · {D.postcode} {D.city}<br />
                    Night desk reachable 24/7 via {D.phone.display}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {D.certifications.map((c) => (
                      <span key={c} className="rounded-full bg-muted px-2.5 py-1 font-medium">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </Section>

          {tier >= 2 && (
            <Section id="proof-gallery" tone="muted" eyebrow="Before / after" title="Proof you can drag" description="Every job ends with documented results. Drag the handle — captions and keyboard control included.">
              <ModuleTag ids={['Section:ProofGallery']} />
              <div className="mx-auto max-w-3xl">
                <RevealOnScroll>
                  <BeforeAfterSlider
                    beforeLabel="Corroded riser, 1974"
                    afterLabel="Press-fit replacement"
                    before={{
                      background:
                        'repeating-linear-gradient(105deg, #5b4636 0px, #5b4636 18px, #4a3a2c 18px, #4a3a2c 34px), radial-gradient(circle at 30% 40%, #7c5c40, #3f3025)',
                    }}
                    after={{
                      background:
                        'repeating-linear-gradient(105deg, #d99a4e 0px, #d99a4e 18px, #b5773a 18px, #b5773a 34px), radial-gradient(circle at 70% 60%, #eab676, #a56a2f)',
                    }}
                  />
                </RevealOnScroll>
              </div>
            </Section>
          )}

          {tier >= 3 && (
            <Section id="booking" tone="muted" eyebrow="Booking" title="Plan it, do not emergency it" description="Non-urgent jobs get a calendared slot with a fixed-price confirmation — usually cheaper than the night rate.">
              <ModuleTag ids={['Section:Booking']} />
              <div className="grid gap-6 @min-[1024px]:grid-cols-[1.4fr_1fr]">
                <RevealOnScroll>
                  <BookingCalendar
                    serviceOptions={['Boiler service (from €149)', 'Leak inspection (from €189)', 'Gas safety check (€119)', 'Bathroom survey (free)']}
                    slots={['08:00', '10:30', '13:00', '15:30', '18:00']}
                    confirmTitle="Slot reserved"
                    confirmSteps={['SMS confirmation with the crew name', 'Technician texts 15 min before arrival', 'Fixed price confirmed on site before work starts']}
                  />
                </RevealOnScroll>
                <div className="flex flex-col gap-4">
                  <RevealOnScroll delay={0.08}><JobDispatchTeaser /></RevealOnScroll>
                  <RevealOnScroll delay={0.14}><CallbackRequest /></RevealOnScroll>
                </div>
              </div>
            </Section>
          )}

          {tier >= 2 && (
            <Section id="quote" eyebrow="Quotes" title="Fixed price before we knock" description="Describe the job, get a survey slot, receive a binding quote within 24 hours. Quotes stay valid 30 days.">
              <ModuleTag ids={['Section:Quote']} />
              <div className="mx-auto max-w-2xl">
                <RevealOnScroll><QuoteRequestForm serviceOptions={D.services.map((s) => s.name)} /></RevealOnScroll>
              </div>
            </Section>
          )}

          {tier >= 3 && (
            <Section tone="muted" eyebrow="Financing" title="Big projects without the lump sum" description="Bathroom rebuilds and boiler replacements from €2,000 — partner-bank financing with a soft check.">
              <ModuleTag ids={['Section:Financing']} />
              <RevealOnScroll className="mx-auto max-w-3xl">
                <FinancingCalculator defaultAmount={4800} maxAmount={20000} />
              </RevealOnScroll>
            </Section>
          )}

          {tier >= 3 && (
            <Section id="team" eyebrow="Team" title="Names on the van, faces at your door" description="Permanently employed, background-checked, master-certified. The person who answers is the person who arrives.">
              <ModuleTag ids={['Section:Team']} />
              <RevealOnScroll><TeamGrid members={D.team} /></RevealOnScroll>
              <RevealOnScroll className="mt-10">
                <CredentialWall credentials={D.credentials} />
              </RevealOnScroll>
            </Section>
          )}

          {tier >= 3 && (
            <Section id="guarantees" tone="muted" eyebrow="Guarantees" title="Promises we put in writing">
              <ModuleTag ids={['Section:Guarantees']} />
              <RevealOnScroll><GuaranteePanel guarantees={D.guarantees} /></RevealOnScroll>
            </Section>
          )}

          {tier >= 3 && (
            <Section id="cases" eyebrow="Case studies" title="Jobs with numbers attached" description="Anonymised where required, always with the measurable outcome.">
              <ModuleTag ids={['Section:Cases']} />
              <div className="grid gap-4 @min-[768px]:grid-cols-3">
                {D.caseStudies.map((s, i) => (
                  <RevealOnScroll key={s.title} delay={i * 0.06}>
                    <CaseStudyCard study={s} />
                  </RevealOnScroll>
                ))}
              </div>
            </Section>
          )}

          {tier >= 4 && (
            <>
              <Section tone="muted" eyebrow="Operating figures" title="The night desk, quantified" description="Counters animate when they enter the viewport; all figures are fictional demo data.">
                <ModuleTag ids={['Section:Stats']} />
                <RevealOnScroll><ResultsStatStrip stats={D.stats} /></RevealOnScroll>
                <div className="mt-10 grid items-center gap-8 @min-[768px]:grid-cols-2">
                  <RevealOnScroll><Hero3DObject /></RevealOnScroll>
                  <RevealOnScroll delay={0.1}>
                    <div>
                      <h3 className="text-xl font-bold">Cutaway: what our cameras see</h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        The flagship layer loads an isolated 3D model of a press-fit riser — inspect the valve seat, the
                        flow path and the section plane. Under reduced motion it renders a static poster instead, and
                        the full workflow degrades gracefully to photos.
                      </p>
                      <ul className="mt-4 space-y-2 text-sm">
                        {['Lazy WebGL load with poster fallback', 'Pointer tilt disabled on touch devices', 'Reduced-motion static frame'].map((t) => (
                          <li key={t} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> {t}</li>
                        ))}
                      </ul>
                    </div>
                  </RevealOnScroll>
                </div>
              </Section>

              <HeroCinematic title="120 seconds inside the night desk" caption="Radio chatter, coffee, and a master plumber calibrating pressure at 3 a.m. — the film our customers never see, shown anyway." />

              <Section eyebrow="Client portal" title="Follow your job like a parcel">
                <ModuleTag ids={['Section:Portal']} />
                <RevealOnScroll className="mx-auto max-w-3xl"><ProjectStatusPortal /></RevealOnScroll>
              </Section>
            </>
          )}

          <Section id="reviews" tone="muted" eyebrow="Reviews" title="What night callers say afterwards">
            <ModuleTag ids={['Section:Reviews']} />
            <RevealOnScroll><ReviewCarousel reviews={D.reviews} /></RevealOnScroll>
          </Section>

          <Section id="call" eyebrow="Contact" title="Call, WhatsApp, or write — the calm voice answers">
            <ModuleTag ids={['Section:Contact']} />
            <div className="grid gap-6 @min-[1024px]:grid-cols-[0.9fr_1.1fr]">
              <div className="flex flex-col gap-4">
                <RevealOnScroll>
                  <CallNowPanel
                    phone={D.phone}
                    hours="Open now — 24/7/365, including holidays"
                    emergencyNote="If water is actively flowing: call first, then close the main shut-off valve while you wait. The dispatcher stays on the line with you."
                  />
                </RevealOnScroll>
                <RevealOnScroll delay={0.08}>
                  <div className="rounded-2xl border bg-card p-5">
                    <h3 className="text-sm font-bold">Prefer writing?</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      WhatsApp gets a human reply in under 5 minutes during emergencies, under 2 hours otherwise. Email:
                      dispatch@nightflow.example
                    </p>
                  </div>
                </RevealOnScroll>
              </div>
              <RevealOnScroll delay={0.05}>
                <ContactForm subjects={['Emergency call-out', 'Leak inspection', 'Drain problem', 'Heating / boiler', 'Bathroom project', 'Something else']} />
              </RevealOnScroll>
            </div>
          </Section>

          <Section id="faq" tone="muted" eyebrow="FAQ" title="Questions night callers ask most" description="Grouped by topic, searchable — schema.org FAQPage markup ships with this template.">
            <ModuleTag ids={['Section:FAQ']} />
            <FAQAccordion faqs={D.faqs} />
          </Section>

          {tier >= 2 && (
            <Section id="blog" eyebrow="Knowledge base" title="Guides that prevent the 3 a.m. call" description="Practical prevention content — the quiet SEO engine behind every Growth-tier template.">
              <ModuleTag ids={['Section:Blog']} />
              <BlogIndex posts={D.posts} />
            </Section>
          )}

          {tier >= 4 && (
            <Section tone="muted">
              <ModuleTag ids={['Section:Newsletter']} />
              <RevealOnScroll>
                <NewsletterSignup
                  promise="Freeze alerts & seasonal plumbing checklists for your postcode"
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
        {tier >= 4 && <AiConcierge brand="Nightflow" variant="ai" />}
        {tier >= 4 && <AiConcierge brand="Nightflow" variant="live" position="secondary" />}
        <CookieConsent />
        <OfflineBanner />
        <div className="sr-only"><DemoContentBadge /></div>
      </TemplateErrorBoundary>
    </div>
  )
}

/* ── the Growth OS mount ──────────────────────────────────────────
   Tier comes from the OS tier-morph ladder (five steps folding onto
   the factory's four rungs), in-site anchor navigation routes through
   the OS page router, and the registry page tabs scroll to their
   sections — exactly like the 21 token-built templates. */
const PAGES = new Set(['home', 'services', 'coverage', 'reviews', 'call', 'faq', 'blog', 'booking'])

export default function NightflowSite() {
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
      <NightflowTemplate tier={tier} />
    </div>
  )
}
