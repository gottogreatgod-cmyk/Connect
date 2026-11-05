import type { TierLadder, Review, ServiceItem, FaqItem, TeamMember, CaseStudy } from './types'

export const thermonorth = {
  slug: 'thermonorth',
  name: 'ThermoNorth Heating & Cooling',
  mark: 'TN',
  sub: 'HVAC systems',
  tagline: 'Warm winters. Cool summers. One partner.',
  phone: { display: '+49 40 555 0188', href: 'tel:+49405550188' },
  email: 'service@thermonorth.example',
  city: 'Hamburg',
  address: 'Osterfeldstraße 44',
  postcode: '22529',
  license: 'HH-TN-20447-B',
  founded: 2008,
  coverageZone: 'Hamburg',
  hours: [
    { day: 'Monday', open: '07:00', close: '18:00' },
    { day: 'Tuesday', open: '07:00', close: '18:00' },
    { day: 'Wednesday', open: '07:00', close: '18:00' },
    { day: 'Thursday', open: '07:00', close: '18:00' },
    { day: 'Friday', open: '07:00', close: '16:00' },
    { day: 'Saturday', open: '09:00', close: '13:00' },
    { day: 'Sunday', open: 'Closed', close: 'Emergency line only' },
  ],

  nav: [
    {
      label: 'Systems',
      items: [
        { label: 'Heat pumps', href: '#services', hint: 'air/water · subsidies ready' },
        { label: 'Gas condensing boilers', href: '#services', hint: 'replacement in 1 day' },
        { label: 'Hybrid systems', href: '#services', hint: 'best of both worlds' },
        { label: 'Cooling & ventilation', href: '#services', hint: 'split + comfort cooling' },
      ],
    },
    {
      label: 'Homeowners',
      items: [
        { label: 'System sizing calculator', href: '#calculator', hint: 'instant estimate' },
        { label: 'Efficiency configurator', href: '#configurator', hint: 'build your package' },
        { label: 'Financing', href: '#financing', hint: 'from €89/month' },
        { label: 'Maintenance plans', href: '#membership', hint: 'priority dispatch' },
      ],
    },
    {
      label: 'Trust',
      items: [
        { label: 'Reviews', href: '#reviews', hint: '4.8 avg (fictional)' },
        { label: 'Case studies', href: '#cases', hint: 'real energy bills' },
        { label: 'Certified team', href: '#team', hint: 'F-gas certified' },
      ],
    },
  ],

  services: [
    { id: 'heat-pump', name: 'Heat pump installation', description: 'Sized from your actual consumption data, subsidy paperwork handled end-to-end.', priceFrom: 12900, unit: 'installed', icon: 'Thermometer' },
    { id: 'boiler-swap', name: 'Boiler replacement', description: 'Old boiler out, condensing unit running — completed within one working day.', priceFrom: 6400, unit: 'installed', icon: 'Flame' },
    { id: 'hybrid', name: 'Hybrid systems', description: 'Gas covers the coldest days, the pump does the rest. Cuts bills ~35%.', priceFrom: 15400, unit: 'installed', icon: 'Gauge' },
    { id: 'cooling', name: 'Comfort cooling', description: 'Whisper-quiet split units that heat in winter too — 4 seasons, one device.', priceFrom: 2900, unit: 'per unit', icon: 'Snowflake' },
    { id: 'service', name: 'Maintenance & inspection', description: 'Combustion analysis, coil clean, wear-parts check — with priority dispatch.', priceFrom: 189, unit: 'per year', icon: 'Wrench' },
    { id: 'ventilation', name: 'Ventilation with heat recovery', description: 'Fresh air without heat loss. Plan, install, commission — airtight certified.', priceFrom: 7800, unit: 'installed', icon: 'Wind' },
  ] as ServiceItem[],

  reviews: [
    { name: 'Katrin B.', location: 'Eimsbüttel', rating: 5, date: '3 weeks ago', service: 'Heat pump', quote: 'The sizing calculator on their site matched the final quote within 4%. Heating bill dropped from €2,300 to €1,150 gas+power combined.', source: 'Google' },
    { name: 'Sönke H.', location: 'Altona', rating: 5, date: '1 month ago', service: 'Boiler replacement', quote: 'Crew arrived 7:30, old boiler out by 10, heating again by 14:00. They registered everything with the Schornsteinfeger themselves.', source: 'Google' },
    { name: 'Melissa O.', location: 'Winterhude', rating: 5, date: '2 months ago', service: 'Maintenance plan', quote: 'The maintenance plan pays for itself: priority slots and the last two years not a single cold radiators morning.', source: 'Site' },
    { name: 'Tobias F.', location: 'Wandsbek', rating: 4, date: '2 months ago', service: 'Comfort cooling', quote: 'Units are genuinely quiet. Planning took a week longer than promised, but the installation itself was flawless.', source: 'Google' },
    { name: 'Ingrid S.', location: 'Blankenese', rating: 5, date: '3 months ago', service: 'Hybrid system', quote: 'Finally a company that explains the hybrid logic with real numbers instead of brochures. The 35% savings estimate was spot on.', source: 'Yelp' },
  ] as Review[],

  faqs: [
    { group: 'Heat pumps', q: 'Will a heat pump work in my 1960s building?', a: 'Usually yes — with a hydraulic balancing and correctly sized radiators. We start every planning with a room-by-room heat-load calculation, not a rule of thumb. If the building needs upgrades first, we tell you honestly and price them separately.' },
    { group: 'Heat pumps', q: 'How much subsidy is available right now?', a: 'Basic funding covers 30% of eligible costs, with efficiency bonuses up to 45% for replacement heating in older buildings. We prepare the full application — historically our clients received the grant in 6–10 weeks.' },
    { group: 'Service', q: 'How often does my system need maintenance?', a: 'Heat pumps: once a year (coil, refrigerant circuit, controls). Gas boilers: every two years by law for combustion check. Maintenance-plan members get automatic scheduling and priority dispatch within 24 h.' },
    { group: 'Service', q: 'What happens if the heating fails on a weekend?', a: 'Service-plan members reach the on-call engineer directly; we resolve 84% of failures remotely and stock the 12 most common failure parts in every van.' },
    { group: 'Costs', q: 'Can I spread the investment?', a: 'Yes — from €2,000 project value we offer partner-bank financing from 6.9% APR with terms up to 84 months, or a €0-down lease for the maintenance-inclusive package.' },
    { group: 'Costs', q: 'Why is the calculator range sometimes wide?', a: 'The range reflects honest unknowns: radiator condition, flue routing, electrical upgrade needs. The on-site survey fixes every line item before you sign anything.' },
  ] as FaqItem[],

  team: [
    { name: 'Lars Öztürk', role: 'F-gas & heat-pump lead', certs: ['F-gas cat. I', 'Bosch certified'], years: 14, initials: 'LÖ' },
    { name: 'Frauke Jensen', role: 'Head of planning', certs: ['DIN heat-load', 'Energy consultant (dena)'], years: 11, initials: 'FJ' },
    { name: 'Milan Horvat', role: 'Refrigeration engineer', certs: ['F-gas cat. I', 'Split-unit pro'], years: 9, initials: 'MH' },
    { name: 'Anke Rudolph', role: 'Service & recalls manager', certs: ['Viessmann partner', 'Stiebel trainer'], years: 16, initials: 'AR' },
  ] as TeamMember[],

  caseStudies: [
    { title: '1930s villa: from oil tank to 45% subsidy', challenge: 'Oil heating from 1998, protected façade, no room for outdoor units at the front.', result: 'Two silent units at the garden side, buffer tank in the cellar, 45% subsidy approved — total bill cut by 52%.', metric: '−52% bill', location: 'Blankenese' },
    { title: 'Apartment block with 12 flat-roof units', challenge: 'Owners association needed one partner for 12 split systems without scaffolding conflicts.', result: 'Phased installation over one summer, crane lift coordinated per building section, zero tenant complaints.', metric: '12 units', location: 'Barmbek' },
    { title: 'Bakery: process heat + cooling from one system', challenge: 'Ovens heat the shop to 30 °C while the counter needs 18 °C.', result: 'Heat-recovery system moves oven waste heat to hot water; comfort cooling runs on the same circuit.', metric: '−38% energy', location: 'Eimsbüttel' },
  ] as CaseStudy[],

  trustItems: [
    { icon: 'BadgeCheck', label: 'Meisterbetrieb', detail: 'HWK Hamburg reg. HH-TN-20447-B' },
    { icon: 'ShieldCheck', label: 'F-gas certified', detail: 'category I team' },
    { icon: 'FileCheck', label: 'Subsidy service', detail: 'BEG paperwork included' },
    { icon: 'HeartHandshake', label: 'Performance promise', detail: 'sized to your real bills' },
  ],

  credentials: [
    { label: 'Registered master company', detail: 'Handelskammer Hamburg — reg. HH-TN-20447-B', kind: 'license' },
    { label: 'F-gas category I', detail: 'Refrigerant work legally certified, team of 4', kind: 'cert' },
    { label: 'dena energy consultant', detail: 'Official BAFA-listed efficiency expert on staff', kind: 'cert' },
    { label: '€3,000,000 liability', detail: 'Including consequential water & fire damage', kind: 'insurance' },
  ],

  guarantees: [
    { title: 'Sizing guarantee', detail: 'Delivered output matches the heat-load plan — or we upgrade free.' },
    { title: 'Subsidy included', detail: 'We file, chase and confirm — the grant is part of the quote.' },
    { title: '24 h priority', detail: 'Plan members never wait longer than a day in heating season.' },
    { title: 'Clean handover', detail: 'Commissioning protocol, app setup and a walkthrough included.' },
  ],

  stats: [
    { value: 2140, label: 'systems installed' },
    { value: 34, suffix: '%', label: 'avg. energy-bill cut' },
    { value: 4.8, decimals: 1, label: 'avg. rating (fictional)' },
    { value: 98, suffix: '%', label: 'subsidy approval rate' },
  ],

  certifications: ['Meisterbetrieb', 'F-gas cat. I', 'dena energy consultant', 'BEG subsidy service'],

  postcodes: ['22', '20', '21', '25'],

  tierLadder: [
    {
      tier: 1,
      label: 'Starter',
      modules: ['SiteHeader', 'MobileNav', 'SiteFooter', 'StickyActionBar', 'AnnouncementBar', 'Breadcrumb', 'SkipToContent', 'CookieConsent + ConsentGate', 'ErrorBoundary', 'FormField / InlineValidation / SuccessState', 'HeroLocal', 'OpenNowBadge', 'ServiceCardGrid', 'CallNowPanel', 'HoursTable', 'GoogleReviewsEmbed', 'FAQAccordion', 'ContactForm'],
    },
    {
      tier: 2,
      label: 'Growth',
      modules: ['ThemeToggle + BackToTop', 'HeroCampaign', 'CostCalculator', 'ProcessTimeline', 'ReviewWall', 'ServiceAreaMap', 'NewsletterSignup', 'PostcodeChecker'],
    },
    {
      tier: 3,
      label: 'Business',
      modules: ['LanguageSwitcher', 'MembershipSignup', 'BookingCalendar', 'FinancingCalculator', 'ComparisonTable', 'TeamCredentials', 'CaseStudyIndex', 'QuoteCalculator', 'StructuredDataBlock', 'MegaMenu', 'GuaranteePanel'],
    },
    {
      tier: 4,
      label: 'Flagship',
      modules: ['Configurator', 'HeroVideo', 'AiConcierge', 'PersonalizedRecommendations', 'ClientDashboard', 'BeforeAfterTransition', 'ResultsStatStrip'],
    },
  ] as TierLadder[],

  schema: {
    '@context': 'https://schema.org',
    '@type': 'HVACBusiness',
    name: 'ThermoNorth Heating & Cooling',
    telephone: '+49 40 555 0188',
    address: { '@type': 'PostalAddress', streetAddress: 'Osterfeldstraße 44', postalCode: '22529', addressLocality: 'Hamburg', addressCountry: 'DE' },
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '07:00', closes: '18:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '09:00', closes: '13:00' },
    ],
    areaServed: 'Hamburg & metro',
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '5' },
  },
}
