'use client'

/**
 * The kit registry — playbook module id → REAL Template Factory component.
 *
 * When a module mounted in the forge matches an id below, ModuleCard renders
 * the actual interactive kit component (src/modules/kit/*) with honest demo
 * props instead of the generic archetype card. Demo content derives from the
 * mounted template's industry content pack (CONTENT_PACKS[tpl.industry]) plus
 * one fictional NAP block — every fabricated proof point is marked with a
 * DemoContentBadge so the demo never lies about being a demo.
 *
 * Note on the import cycle (index.tsx ⇄ registry): this module only touches
 * CONTENT_PACKS inside adapter bodies — never at module-eval time — so the
 * live binding is resolved by the time any adapter runs.
 */
import * as React from 'react'
import type { PlaybookModule } from '@/engine/playbook'
import type { TemplateDef } from '@/engine/registry'
import type { Review, TeamMember, CaseStudy, Neighborhood, BlogPost } from '@/factory/types'
import { CONTENT_PACKS } from './index'

import { Section, DemoContentBadge } from '@/modules/kit/primitives'
import {
  SkipToContent, AnnouncementBar, ThemeToggle, LanguageSwitcher, BackToTop,
  CookieConsent, TemplateErrorBoundary, Breadcrumb, OfflineBanner,
} from '@/modules/kit/system'
import { SiteHeader, SiteFooter, StickyActionBar, StickyIcons, type NavGroup } from '@/modules/kit/chrome'
import { HeroUrgent, HeroLocal, HeroCampaign, HeroCinematic, HeroVideo, OpenNowBadge } from '@/modules/kit/heroes'
import {
  TrustBar, ReviewCarousel, ReviewWall, GoogleReviewsEmbed, CaseStudyCard, CaseStudyIndex,
  CredentialWall, GuaranteePanel, TeamGrid, TeamCredentials, ResultsStatStrip,
} from '@/modules/kit/proof'
import {
  ContactForm, CallNowPanel, QuoteRequestForm, CallbackRequest, BookingCalendar,
  MembershipSignup, NewsletterSignup, FormField, SuccessState,
} from '@/modules/kit/conversion'
import {
  ProcessTimeline, ComparisonTable, CostCalculator, QuoteCalculator, FinancingCalculator,
  Configurator, PersonalizedRecommendations,
} from '@/modules/kit/value'
import { EmergencyTriage, JobDispatchTeaser, ProjectStatusPortal, ClientDashboardTeaser } from '@/modules/kit/ops'
import { GoogleMapEmbed, HoursTable, ServiceAreaMap, PostcodeChecker, NeighborhoodPages } from '@/modules/kit/local'
import { BlogIndex, StructuredDataBlock } from '@/modules/kit/content'
import { AiConcierge, WhatsAppButton } from '@/modules/kit/ai'
import { AnimatedCounter, BeforeAfterSlider, BeforeAfterTransition, Hero3DObject } from '@/modules/kit/motion'
import { SiteContext } from '@/sites/kit/site-kit'
import { Button } from '@/components/ui/button'

/* ── fictional NAP — same for every demo, deliberately not the template's ── */

const NAP = {
  phone: { display: '+49 30 555 0134', href: 'tel:+49305550134' },
  email: 'desk@example.com',
  address: '14 Foundry Lane',
  city: 'Berlin',
}

type Pack = (typeof CONTENT_PACKS)[TemplateDef['industry']]

/* ── shared demo-data derivations (industry pack → kit prop shapes) ─────── */

function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function priceLabel(price: string): string {
  if (!/\d/.test(price)) return 'on request'
  return /^from/i.test(price) ? price : `from ${price}`
}

function kitReviews(pack: Pack): Review[] {
  const dates = ['3 weeks ago', '1 month ago', '2 months ago', '3 months ago']
  const sources: Review['source'][] = ['Google', 'Google', 'Site', 'Yelp']
  return pack.reviews.map((r, i) => ({
    name: r.by.split(',')[0].trim(),
    location: NAP.city,
    rating: i % 3 === 2 ? 4 : 5,
    date: dates[i % dates.length],
    service: pack.menu[i % pack.menu.length]?.name ?? 'General',
    quote: r.quote,
    source: sources[i % sources.length],
  }))
}

function kitTeam(pack: Pack): TeamMember[] {
  const certSets = [['Certified'], ['Certified', 'First aid'], ['Certified', 'Senior']]
  const years = [12, 8, 15]
  return pack.team.map((t, i) => ({
    name: t.name,
    role: t.role,
    certs: certSets[i % certSets.length],
    years: years[i % years.length],
    initials: initials(t.name),
  }))
}

function kitStudies(pack: Pack, m: PlaybookModule): CaseStudy[] {
  return [
    {
      title: `${pack.menu[0]?.name ?? m.name} — first engagement`,
      challenge: m.purpose,
      result: `${pack.features[0]?.title ?? m.name}: ${pack.features[0]?.note ?? 'delivered as specified, on the quoted number.'}`,
      metric: pack.stats[0]?.n ?? '1st',
      location: NAP.city,
    },
    {
      title: `${pack.menu[1]?.name ?? m.name} — repeat client`,
      challenge: pack.faq[0]?.q ?? 'The question every client asks first',
      result: pack.faq[0]?.a ?? 'Answered in plain language, then delivered.',
      metric: pack.stats[1]?.n ?? '×2',
      location: NAP.city,
    },
    {
      title: `${pack.menu[2]?.name ?? m.name} — the full plan`,
      challenge: pack.faq[2]?.q ?? 'What the work involves',
      result: `${pack.timeline[2]?.step ?? 'Delivered'} — ${pack.timeline[2]?.note ?? 'handled end to end, one named contact.'}`,
      metric: pack.stats[2]?.n ?? '100%',
      location: NAP.city,
    },
  ]
}

function kitStats(pack: Pack): { value: number; suffix: string; label: string; decimals?: number }[] {
  return pack.stats.map((s) => {
    const parsed = parseFloat(s.n)
    const value = Number.isFinite(parsed) && parsed > 0 ? parsed : 4
    return {
      value,
      suffix: /\D/.test(s.n) ? s.n.replace(/[0-9.]/g, '') : '',
      label: s.label,
      decimals: value % 1 !== 0 ? 1 : undefined,
    }
  })
}

function kitNav(pack: Pack): NavGroup[] {
  return [
    {
      label: 'Services',
      items: pack.menu.slice(0, 3).map((x) => ({ label: x.name, href: '#services', hint: x.note })),
    },
    {
      label: 'Company',
      items: [
        { label: 'About', href: '#about', hint: 'who you deal with' },
        { label: 'Contact', href: '#contact', hint: 'the desk, directly' },
      ],
    },
  ]
}

function kitPlans(pack: Pack): { name: string; priceMonthly: number; perks: string[]; popular?: boolean }[] {
  const nums = pack.menu
    .map((x) => {
      const match = x.price.replace(/,/g, '').match(/\d+(\.\d+)?/)
      const v = match ? parseFloat(match[0]) : NaN
      return Number.isFinite(v) && v >= 5 ? Math.round(v) : null
    })
    .filter((v): v is number => v !== null)
    .sort((a, b) => a - b)
  const fallback = [19, 39, 59].filter((p) => !nums.includes(p))
  const prices = [...nums, ...fallback].slice(0, 3)
  const perkSets = [
    [pack.features[0]?.title ?? 'The core benefit', 'Pause or cancel monthly'],
    [pack.features[1]?.title ?? 'Priority handling', 'Everything in Essential', 'Priority line'],
    ['Everything in Complete', 'Named contact', 'Cancel anytime'],
  ]
  return ['Essential', 'Complete', 'Bespoke'].map((name, i) => ({
    name,
    priceMonthly: prices[i] ?? 19,
    perks: perkSets[i],
    popular: i === 1,
  }))
}

function kitPosts(pack: Pack): BlogPost[] {
  const d = (days: number) => new Date(Date.now() - days * 86400000).toISOString().slice(0, 10)
  return [
    {
      title: `Behind ${pack.menu[0]?.name?.toLowerCase() ?? 'the counter'}`,
      category: 'Field notes',
      readMinutes: 4,
      date: d(3),
      excerpt: `${pack.menu[0]?.note ?? 'How the work is actually done.'} — what changes when it is done right.`,
    },
    {
      title: pack.features[0]?.title ?? 'Why we do it this way',
      category: 'Guide',
      readMinutes: 6,
      date: d(11),
      excerpt: pack.features[0]?.note ?? 'The reasoning, in plain language.',
    },
    {
      title: pack.faq[0]?.q ?? 'Asked before booking',
      category: 'FAQ',
      readMinutes: 3,
      date: d(24),
      excerpt: pack.faq[0]?.a ?? 'The short, honest answer.',
    },
    {
      title: `A week with ${pack.team[0]?.name ?? 'the desk'}`,
      category: 'People',
      readMinutes: 5,
      date: d(40),
      excerpt: `${pack.team[0]?.role ?? 'The desk'} — how the work actually gets scheduled and done.`,
    },
  ]
}

function kitSeasonRecs(pack: Pack): { season: string; items: { title: string; reason: string; price: string }[] }[] {
  return ['Spring', 'Summer', 'Autumn', 'Winter'].map((season) => ({
    season,
    items: pack.menu.slice(0, 3).map((x, i) => ({
      title: x.name,
      reason: `${season} pick ${i + 1}: ${x.note.toLowerCase()}`,
      price: priceLabel(x.price),
    })),
  }))
}

const NEIGHBORHOODS: Neighborhood[] = [
  { name: 'Mitte', etaMinutes: 18, jobs: 112 },
  { name: 'Kreuzberg', etaMinutes: 22, jobs: 96 },
  { name: 'Prenzlauer Berg', etaMinutes: 26, jobs: 87 },
  { name: 'Charlottenburg', etaMinutes: 31, jobs: 64 },
  { name: 'Neukölln', etaMinutes: 28, jobs: 73 },
]

const HOURS: { day: string; open: string; close: string }[] = [
  { day: 'Monday', open: '08:00', close: '18:00' },
  { day: 'Tuesday', open: '08:00', close: '18:00' },
  { day: 'Wednesday', open: '08:00', close: '18:00' },
  { day: 'Thursday', open: '08:00', close: '18:00' },
  { day: 'Friday', open: '08:00', close: '17:00' },
  { day: 'Saturday', open: '09:00', close: '13:00' },
  { day: 'Sunday', open: 'Closed', close: 'Emergency line only' },
]

const TRUST_ICONS = ['BadgeCheck', 'ShieldCheck', 'HeartHandshake']

/** Sizing basis for the hvac-sizing CostCalculator (mirrors the ThermoNorth factory template). */
const HVAC_BASE: Record<string, number> = { 'heat-pump': 118, 'gas-condensing': 52, hybrid: 96 }

/* ── small local wrappers ──────────────────────────────────────────────── */

/** Presents a kit band with the playbook module's own eyebrow/title/purpose. */
function KitBand({ m, description, children }: { m: PlaybookModule; description?: string; children?: React.ReactNode }) {
  return (
    <Section eyebrow={m.section} title={m.name} description={description ?? m.purpose}>
      {children}
    </Section>
  )
}

/** The mandatory marker under any adapter that fabricates proof figures. */
function DemoNote({ label = 'Demo content' }: { label?: string }) {
  return (
    <p className="mt-3 text-center">
      <DemoContentBadge label={label} />
    </p>
  )
}

/** Demo payload for the error boundary — throws during render on demand. */
function FaultDemo() {
  const [armed, setArmed] = React.useState(false)
  if (armed) {
    throw new Error('Demo fault injected by the forge — exactly the kind of crash the boundary catches.')
  }
  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-sm leading-relaxed text-muted-foreground">
        A short demo paragraph wrapped by the boundary. Everything renders normally until you inject a
        fault — then the boundary takes over and the rest of the page keeps working.
      </p>
      <Button variant="outline" size="sm" className="mt-4" onClick={() => setArmed(true)}>
        Inject a render fault
      </Button>
    </div>
  )
}

/* ── the registry: playbook id → real kit component with demo props ────── */

type KitAdapter = (m: PlaybookModule, tpl: TemplateDef, pack: Pack) => React.ReactNode

const REGISTRY: Record<string, KitAdapter> = {
  /* ── chrome & system (kit/system, kit/chrome) ─────────────────────── */
  'skip-to-content': (m) => (
    <KitBand
      m={m}
      description="An accessibility affordance, not a visual band: the link is screen-reader only until it receives keyboard focus — press Tab in the preview and it appears."
    >
      <div className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">
        <p>
          The first Tab stop on the page. Try it: click into the preview, hit{' '}
          <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">Tab</kbd> and the skip
          link appears top-left, jumping straight to #main-content.
        </p>
        <div className="mt-4">
          <SkipToContent />
        </div>
      </div>
    </KitBand>
  ),

  'cookie-consent': (m) => (
    <KitBand
      m={m}
      description="Renders from factory state: once you accept or reject, the choice persists to localStorage (gos:factory-consent) and the banner renders null. Clear the key to see it again — the Manage dialog gates analytics and marketing per category."
    >
      <CookieConsent />
    </KitBand>
  ),

  'theme-toggle': (m) => (
    <KitBand
      m={m}
      description="Merged into Growth OS: the toggle drives the OS shell's daylight / evening mode (EditionProvider) — one switch re-skins shell, previews and module-built sites."
    >
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <span className="text-sm text-muted-foreground">Click it — the whole shell flips.</span>
      </div>
    </KitBand>
  ),

  'language-switcher': (m) => (
    <KitBand
      m={m}
      description="EN / DE / FR preview locale held in the factory store — the SiteFooter greeting and locale-aware copy follow the choice. Kit tier 3+."
    >
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <span className="text-sm text-muted-foreground">Pick a locale — the greeting in SiteFooter follows.</span>
      </div>
    </KitBand>
  ),

  'back-to-top': (m) => (
    <KitBand
      m={m}
      description="Fixed bottom-right, appears only after 700px of scroll — scroll the preview down and watch it fade in; click for a smooth return."
    >
      <BackToTop />
    </KitBand>
  ),

  'offline-banner': (m) => (
    <KitBand
      m={m}
      description="Renders nothing while online — it listens to the browser's online/offline events and appears as a fixed pill the moment the connection drops (toggle it in devtools)."
    >
      <OfflineBanner />
      <p className="mt-4 rounded-xl border border-dashed bg-muted/40 p-4 text-sm text-muted-foreground">
        Nothing visible right now? That is the point — the pill only mounts when the browser reports
        itself offline.
      </p>
    </KitBand>
  ),

  'error-boundary': (m) => (
    <KitBand
      m={m}
      description="A real class boundary: inject the demo fault and it catches the render error, shows a recovery panel and lets the user try again — the rest of the page never notices."
    >
      <TemplateErrorBoundary>
        <FaultDemo />
      </TemplateErrorBoundary>
    </KitBand>
  ),

  breadcrumb: (m, tpl) => (
    <KitBand
      m={m}
      description="Where-am-I affordance with accessible markup — the last crumb is the current page (aria-current), the rest link up the tree."
    >
      <Breadcrumb trail={['Home', tpl.kind, tpl.city]} />
    </KitBand>
  ),

  'announcement-bar': (_m, _tpl, pack) => (
    <AnnouncementBar
      messages={[
        { icon: '📣', text: pack.ctaLine },
        { icon: '🕒', text: 'Open today — book the early slot' },
      ]}
    />
  ),

  'open-now-badge': (m) => (
    <KitBand
      m={m}
      description="Computes open/closed live from the Europe/Berlin clock and re-checks every 30 seconds — two instances, two different windows."
    >
      <div className="flex flex-wrap items-center gap-3">
        <OpenNowBadge />
        <span className="text-xs text-muted-foreground">default: 24/7 window</span>
        <OpenNowBadge hours={{ open: 14, close: 18 }} />
        <span className="text-xs text-muted-foreground">bounded: 14:00–18:00</span>
      </div>
    </KitBand>
  ),

  'site-header': (_m, tpl, pack) => (
    <SiteHeader
      brand={{ name: tpl.name, mark: initials(tpl.name), sub: tpl.kind }}
      nav={kitNav(pack)}
      cta={{ label: pack.bookingCta, href: '#contact' }}
      phone={NAP.phone}
    />
  ),

  'site-footer': (_m, tpl, pack) => (
    <SiteFooter
      brand={{ name: tpl.name, mark: initials(tpl.name) }}
      nav={kitNav(pack)}
      nap={{ address: [NAP.address, NAP.city], phone: NAP.phone.display, email: NAP.email }}
      certifications={['Master certified', 'Fully insured']}
    />
  ),

  'sticky-action-bar': (m) => (
    <KitBand
      m={m}
      description="Mobile-only by design (hidden from md up): a fixed 44px-min action rail — call, book, quote — that follows the thumb. Narrow the preview below the md breakpoint to see it."
    >
      <StickyActionBar
        actions={[
          { id: 'call', label: 'Call', icon: StickyIcons.call, href: NAP.phone.href },
          { id: 'book', label: 'Book', icon: StickyIcons.book, href: '#booking' },
          { id: 'quote', label: 'Quote', icon: StickyIcons.quote, href: '#quote' },
        ]}
      />
    </KitBand>
  ),

  'mega-menu': (m, tpl, pack) => (
    <KitBand
      m={m}
      description="The mega pattern is part of SiteHeader, not a separate component: from kit tier 3 (Business) up, the nav dropdowns widen into columned links with hints plus a featured callout. The header below is pinned to tier 3 so the pattern renders."
    >
      <SiteContext.Provider
        value={{ page: 'home', go: () => {}, motion: 3, tier: 'high', tierStep: 'high', embedded: false }}
      >
        <SiteHeader
          brand={{ name: tpl.name, mark: initials(tpl.name), sub: tpl.kind }}
          nav={kitNav(pack)}
          cta={{ label: pack.bookingCta, href: '#contact' }}
          phone={NAP.phone}
        />
      </SiteContext.Provider>
    </KitBand>
  ),

  /* ── heroes (kit/heroes, kit/motion) ─────────────────────────────── */
  'hero-urgent': (m, tpl, pack) => (
    <HeroUrgent
      brand={tpl.name}
      headline={pack.ctaLine}
      subhead={m.purpose}
      phone={NAP.phone}
      responseTime="41 min avg. arrival"
      openNow={<OpenNowBadge />}
      trustPoints={pack.features.map((f) => f.title)}
      primaryCta={{ label: NAP.phone.display, href: NAP.phone.href }}
      secondaryCta={{ label: 'See how it works', href: '#services' }}
    />
  ),

  'hero-local': (m, tpl, pack) => (
    <HeroLocal
      eyebrow={tpl.kind}
      headline={pack.ctaLine}
      subhead={m.purpose}
      phone={NAP.phone}
      location={NAP.city}
      hoursNote="Mon–Fri 8–18 · Sat 9–13"
      openNow={<OpenNowBadge hours={{ open: 8, close: 18 }} />}
      primaryCta={{ label: pack.bookingCta, href: '#booking' }}
      secondaryCta={{ label: 'Call the desk', href: NAP.phone.href }}
      stats={pack.stats.map((s) => ({ value: s.n, label: s.label }))}
    />
  ),

  'hero-campaign': (m, _tpl, pack) => (
    <HeroCampaign
      offer={{ title: 'Season opener', detail: pack.features[0]?.note ?? m.purpose }}
      deadline={new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10)}
      eligibility="New clients in the coverage zone"
      cta={{ label: pack.bookingCta, href: '#offer' }}
    />
  ),

  'hero-cinematic': (m, _tpl, pack) => <HeroCinematic title={pack.ctaLine} caption={m.purpose} />,

  'hero-video': (m, _tpl, pack) => <HeroVideo title={pack.ctaLine} caption={m.purpose} />,

  '3-d-hero-object': () => <Hero3DObject />,

  /* ── proof & trust (kit/proof, kit/motion) ───────────────────────── */
  'review-carousel': (_m, _tpl, pack) => <ReviewCarousel reviews={kitReviews(pack)} />,

  'review-wall': (_m, _tpl, pack) => <ReviewWall reviews={kitReviews(pack)} />,

  'google-reviews-embed': (_m, _tpl, pack) => (
    <GoogleReviewsEmbed rating={4.9} count={pack.reviews.length * 37} reviews={kitReviews(pack).slice(0, 3)} />
  ),

  'case-study-card': (m, _tpl, pack) => (
    <KitBand
      m={m}
      description="One engagement, told with a number — challenge, result and the metric that mattered. Fictional, and badged as such on every card."
    >
      <div className="grid gap-4 @min-[768px]:grid-cols-2">
        {kitStudies(pack, m).slice(0, 2).map((s) => (
          <CaseStudyCard key={s.title} study={s} />
        ))}
      </div>
    </KitBand>
  ),

  'case-study-index': (m, _tpl, pack) => <CaseStudyIndex studies={kitStudies(pack, m)} />,

  'credential-wall': () => (
    <>
      <CredentialWall
        credentials={[
          { label: 'Registered & licensed', detail: `Trade register ${NAP.city} — reg. GO-20447-B`, kind: 'license' },
          { label: 'Fully insured', detail: '€3,000,000 public liability incl. consequential damage', kind: 'insurance' },
          { label: 'Certified specialists', detail: 'Team certification, renewed annually', kind: 'cert' },
          { label: 'Background-checked staff', detail: 'Every visit documented, every ID verified', kind: 'background' },
        ]}
      />
      <DemoNote label="Fictional credentials" />
    </>
  ),

  'guarantee-panel': (_m, _tpl, pack) => (
    <>
      <GuaranteePanel guarantees={pack.features.map((f) => ({ title: f.title, detail: f.note }))} />
      <DemoNote />
    </>
  ),

  'team-grid': (_m, _tpl, pack) => (
    <>
      <TeamGrid members={kitTeam(pack)} />
      <DemoNote label="Fictional people & credentials" />
    </>
  ),

  'team-credentials': (_m, _tpl, pack) => (
    <>
      <TeamCredentials members={kitTeam(pack)} />
      <DemoNote label="Fictional people & credentials" />
    </>
  ),

  'trust-bar': (_m, _tpl, pack) => (
    <>
      <TrustBar
        items={pack.features.map((f, i) => ({
          icon: TRUST_ICONS[i % TRUST_ICONS.length],
          label: f.title,
          detail: f.note,
        }))}
      />
      <DemoNote />
    </>
  ),

  'results-stat-strip': (_m, _tpl, pack) => <ResultsStatStrip stats={kitStats(pack)} />,

  'animated-counter': (m, _tpl, pack) => (
    <KitBand
      m={m}
      description="Counts up when it scrolls into view — once, eased, and frozen to the final value under reduced-motion."
    >
      <div className="grid grid-cols-3 gap-4 text-center">
        {kitStats(pack).map((s) => (
          <div key={s.label}>
            <p className="text-4xl font-black tracking-tight text-primary">
              <AnimatedCounter value={s.value} suffix={s.suffix} decimals={s.decimals} />
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
      <DemoNote label="Demo figures" />
    </KitBand>
  ),

  /* ── conversion (kit/conversion, kit/value, kit/ops) ─────────────── */
  'contact-form': (_m, _tpl, pack) => <ContactForm subjects={pack.menu.map((x) => x.name)} />,

  'call-now-panel': () => (
    <CallNowPanel
      phone={NAP.phone}
      hours="Mon–Fri 08:00–18:00 · Sat 09:00–13:00"
      emergencyNote="24/7 line for anything urgent — a human answers, night or day."
    />
  ),

  'quote-request-form': (_m, _tpl, pack) => <QuoteRequestForm serviceOptions={pack.menu.map((x) => x.name)} />,

  'callback-request': () => <CallbackRequest />,

  'booking-calendar': (_m, _tpl, pack) => (
    <BookingCalendar
      serviceOptions={pack.menu.map((x) => x.name).slice(0, 3)}
      slots={['09:00', '11:00', '14:00']}
      confirmTitle="Confirmed"
      confirmSteps={['Confirmation email within minutes', 'Reminder 24 h before the slot']}
    />
  ),

  'membership-signup': (_m, _tpl, pack) => (
    <>
      <MembershipSignup plans={kitPlans(pack)} />
      <DemoNote label="Fictional plans & prices" />
    </>
  ),

  'newsletter-signup': (_m, _tpl, pack) => (
    <NewsletterSignup promise={pack.ctaLine} frequency="Monthly, 2-minute read" />
  ),

  'emergency-triage': () => <EmergencyTriage />,

  'financing-calculator': () => <FinancingCalculator />,

  'quote-calculator': (m) => (
    <QuoteCalculator
      title="Instant budget range"
      description={m.purpose}
      calc={(sqft) => ({ min: sqft * 9, max: sqft * 14 })}
    />
  ),

  'cost-calculator': (_m, _tpl, pack) => (
    <>
      <CostCalculator
        title="What would my system cost?"
        fields="hvac-sizing"
        calc={({ size, type, efficiency }) => {
          const base = HVAC_BASE[type] ?? 90
          const eff = efficiency === 'premium' ? 1.08 : 1
          const min = Math.round((size * base * eff) / 100) * 100
          return {
            min,
            max: Math.round((min * 1.22) / 100) * 100,
            note: `${size} m² · ${type} · ${efficiency} class. Includes standard install; extras quoted after the on-site survey.`,
          }
        }}
        ctaLabel={pack.bookingCta}
        ctaHref="#booking"
      />
      <DemoNote label="Demo estimate basis" />
    </>
  ),

  'comparison-table': (_m, _tpl, pack) => (
    <>
      <ComparisonTable
        columns={[
          { name: 'Essential', note: 'the honest core' },
          { name: 'Complete', popular: true },
          { name: 'Bespoke' },
        ]}
        rows={[
          { label: pack.features[0]?.title ?? 'Core scope included', values: [true, true, true] },
          { label: 'Response window', values: ['48 h', '24 h', 'same day'] },
          { label: 'Priority line', values: [false, true, true] },
          { label: 'Guarantee period', values: ['6 months', '12 months', '24 months'] },
        ]}
      />
      <DemoNote label="Fictional plan details" />
    </>
  ),

  configurator: () => (
    <>
      <Configurator
        title="Build your package"
        steps={[
          {
            id: 'fuel',
            label: 'Power source',
            options: [
              { id: 'standard', label: 'Standard connection', price: 0 },
              { id: 'high-output', label: 'High-output variant', price: 340, hint: 'for heavy load' },
            ],
          },
          {
            id: 'capacity',
            label: 'Capacity',
            options: [
              { id: 'single', label: 'Single room', price: 0, hint: 'up to 25 m²' },
              { id: 'floor', label: 'Whole floor', price: 260, hint: 'up to 120 m²' },
            ],
          },
          {
            id: 'addons',
            label: 'Add-ons',
            options: [
              { id: 'care', label: 'Care plan · 12 months', price: 90, hint: 'priority line' },
              { id: 'none', label: 'No add-ons', price: 0 },
            ],
          },
        ]}
        basePrice={1900}
      />
      <DemoNote label="Demo configuration & prices" />
    </>
  ),

  'process-timeline': (_m, _tpl, pack) => (
    <ProcessTimeline
      steps={pack.timeline.map((t, i) => ({
        title: t.step,
        detail: t.note,
        duration: `Stage ${i + 1} of ${pack.timeline.length}`,
      }))}
    />
  ),

  'personalized-recommendations': (_m, _tpl, pack) => (
    <PersonalizedRecommendations recommendations={kitSeasonRecs(pack)} />
  ),

  'whats-app-button': (m) => (
    <KitBand
      m={m}
      description="Deep-links into WhatsApp with a pre-filled message — the number is fictional, the click tracking is real."
    >
      <WhatsAppButton />
    </KitBand>
  ),

  'ai-concierge': (m) => (
    <KitBand
      m={m}
      description="A floating launcher (bottom-right) that opens a grounded chat — the module itself calls /api/concierge with the last eight turns and stays disclaimed for safety-critical cases."
    >
      <AiConcierge brand="Growth OS" />
    </KitBand>
  ),

  'live-chat-launcher': (m) => (
    <KitBand
      m={m}
      description="The human channel: the same launcher in live variant — a scripted demo agent, so the flow can be walked end to end without staffing a queue."
    >
      <AiConcierge brand="Growth OS" variant="live" />
    </KitBand>
  ),

  'client-dashboard': (_m, tpl) => <ClientDashboardTeaser brand={tpl.name} />,

  'client-portal-teaser': (_m, tpl) => <ClientDashboardTeaser brand={tpl.name} />,

  'project-status-portal': () => <ProjectStatusPortal />,

  'job-dispatch-teaser': () => <JobDispatchTeaser />,

  /* ── local & content (kit/local, kit/content) ────────────────────── */
  'hours-table': () => <HoursTable hours={HOURS} holidayNote="Public holidays: emergency line only" />,

  'google-map-embed': (_m, tpl) => (
    <GoogleMapEmbed address={NAP.address} city={NAP.city} label={`${tpl.name} — ${NAP.city}`} />
  ),

  'service-area-map': () => (
    <>
      <ServiceAreaMap zone={`${NAP.city} metro`} neighborhoods={NEIGHBORHOODS} />
      <DemoNote label="Fictional coverage figures" />
    </>
  ),

  'postcode-checker': () => <PostcodeChecker validPrefixes={['10', '12']} />,

  'neighborhood-pages': () => (
    <>
      <NeighborhoodPages neighborhoods={NEIGHBORHOODS} />
      <DemoNote label="Fictional local figures" />
    </>
  ),

  'blog-index': (_m, _tpl, pack) => <BlogIndex posts={kitPosts(pack)} />,

  'structured-data-block': (m, tpl) => (
    <KitBand
      m={m}
      description="Emits JSON-LD for the local business — invisible in the page itself; open the module-labels toggle in the top bar to inspect the raw payload."
    >
      <StructuredDataBlock
        schema={{
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: tpl.name,
          telephone: NAP.phone.display,
          email: NAP.email,
          address: {
            '@type': 'PostalAddress',
            streetAddress: NAP.address,
            addressLocality: NAP.city,
            addressCountry: 'DE',
          },
          openingHours: 'Mo-Fr 08:00-18:00, Sa 09:00-13:00',
          areaServed: `${NAP.city} metro`,
        }}
      />
    </KitBand>
  ),

  /* ── motion (kit/motion) ─────────────────────────────────────────── */
  'before-after-slider': () => (
    <BeforeAfterSlider
      beforeLabel="Before"
      afterLabel="After"
      before={{ background: 'linear-gradient(135deg,#8a7a68,#c9b9a5)' }}
      after={{ background: 'linear-gradient(135deg,#2e4b3f,#77a583)' }}
    />
  ),

  'before-after-transition': () => (
    <BeforeAfterTransition
      beforeLabel="Old bill"
      afterLabel="New bill"
      before={{ background: 'linear-gradient(135deg,#5b5b66,#8e8e99)' }}
      after={{ background: 'linear-gradient(135deg,#1f6f50,#6fc496)' }}
      caption="Scroll-linked comparison — keep scrolling to wipe from the old state to the new one."
    />
  ),

  /* ── forms, validation, feedback (kit/conversion) ────────────────── */
  'form-field': (m) => (
    <KitBand
      m={m}
      description="The shared field primitive: label, input, hint and error all wired for a11y (aria-describedby, role=alert) — every kit form is built from these."
    >
      <form className="grid gap-4 @min-[640px]:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
        <FormField
          label="Full name"
          hint="As it should appear on the confirmation"
          placeholder="e.g. Marta Voss"
          autoComplete="name"
        />
        <FormField
          label="Email"
          type="email"
          hint="One confirmation, nothing else"
          placeholder="you@example.com"
          autoComplete="email"
        />
      </form>
    </KitBand>
  ),

  'inline-validation': (m) => (
    <KitBand
      m={m}
      description="The error state, shown deliberately: aria-invalid, a role=alert message and the destructive ring — in real forms the message appears on blur, never mid-keystroke."
    >
      <div className="max-w-md">
        <FormField label="Email" error="Enter a valid email address" defaultValue="not-an-email" />
      </div>
    </KitBand>
  ),

  'phone-field': (m) => (
    <KitBand m={m} description="A tel-typed field with the callback promise stated in the hint.">
      <div className="max-w-md">
        <FormField
          label="Phone"
          type="tel"
          hint="We call back within one business day"
          placeholder="+49 …"
          autoComplete="tel"
        />
      </div>
    </KitBand>
  ),

  'success-state': () => (
    <SuccessState
      title="Request received"
      reference="GO-4821"
      nextSteps={['Confirmation email within minutes', 'The desk replies within one business day']}
      onReset={() => {}}
    />
  ),
}

/* ── public API ─────────────────────────────────────────────────────────── */

/** Every playbook module id that has a real kit implementation. */
export const KIT_MODULE_IDS: string[] = Object.keys(REGISTRY)

/** Does this playbook module id map to a real factory-kit component? */
export function hasKitModule(id: string): boolean {
  return Object.prototype.hasOwnProperty.call(REGISTRY, id)
}

/**
 * Render the real kit component for a playbook module — null when the id has
 * no kit implementation (the caller falls back to the archetype card).
 */
export function renderKitModule(m: PlaybookModule, tpl: TemplateDef): React.ReactNode {
  if (!hasKitModule(m.id)) return null
  return REGISTRY[m.id](m, tpl, CONTENT_PACKS[tpl.industry])
}
