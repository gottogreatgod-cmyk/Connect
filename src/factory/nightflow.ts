import type { TierLadder, Review, ServiceItem, FaqItem, TeamMember, CaseStudy, BlogPost, Neighborhood } from './types'

export const nightflow = {
  slug: 'nightflow',
  name: 'Nightflow 24/7 Plumbing',
  mark: 'NF',
  sub: 'Emergency plumbing',
  tagline: 'The calm voice at 3 a.m.',
  phone: { display: '+49 211 555 0123', href: 'tel:+492115550123' },
  email: 'dispatch@nightflow.example',
  city: 'Düsseldorf',
  address: 'Gladbecker Str. 12',
  postcode: '40470',
  license: 'DE-DUS-88412-A',
  founded: 2011,
  coverageZone: 'Düsseldorf',
  hours: [
    { day: 'Monday', open: '00:00', close: '24:00' },
    { day: 'Tuesday', open: '00:00', close: '24:00' },
    { day: 'Wednesday', open: '00:00', close: '24:00' },
    { day: 'Thursday', open: '00:00', close: '24:00' },
    { day: 'Friday', open: '00:00', close: '24:00' },
    { day: 'Saturday', open: '00:00', close: '24:00' },
    { day: 'Sunday', open: '00:00', close: '24:00' },
  ],

  nav: [
    {
      label: 'Services',
      items: [
        { label: 'Emergency call-outs', href: '#services', hint: 'under 45 min, 24/7' },
        { label: 'Leak detection', href: '#services', hint: 'non-invasive, camera + acoustics' },
        { label: 'Drains & blockages', href: '#services', hint: 'same-day guarantee' },
        { label: 'Boiler & heating', href: '#services', hint: 'all major brands' },
        { label: 'Bathroom projects', href: '#services', hint: 'fixed-price packages' },
      ],
    },
    {
      label: 'Coverage',
      items: [
        { label: 'Düsseldorf', href: '#coverage', hint: 'full dispatch zone' },
        { label: 'Neuss & Meerbusch', href: '#coverage', hint: '~25 min response' },
        { label: 'Essen & Oberhausen', href: '#coverage', hint: '~40 min response' },
        { label: 'Postcode checker', href: '#coverage', hint: 'instant eligibility' },
      ],
    },
    {
      label: 'Trust',
      items: [
        { label: 'Reviews', href: '#reviews', hint: '4.9 avg (fictional)' },
        { label: 'Guarantees', href: '#guarantees', hint: 'written into every quote' },
        { label: 'Team', href: '#team', hint: 'master-certified' },
        { label: 'Knowledge base', href: '#blog', hint: 'guides & prevention' },
      ],
    },
  ],

  services: [
    { id: 'burst-pipe', name: 'Burst pipe & flooding', description: 'Immediate shut-off guidance, water extraction and full repair — one crew, one visit.', priceFrom: 129, unit: 'call-out', icon: 'Droplets', urgent: true },
    { id: 'leak-detection', name: 'Hidden leak detection', description: 'Acoustic and thermal imaging finds the source without opening your walls.', priceFrom: 189, unit: 'flat', icon: 'Gauge' },
    { id: 'drain', name: 'Drain unblocking', description: 'High-pressure jetting with camera proof — the blockage is gone or you pay nothing.', priceFrom: 99, unit: 'service', icon: 'Wrench', urgent: true },
    { id: 'boiler', name: 'Boiler & heating repair', description: 'Certified for all major brands, original parts on the van.', priceFrom: 149, unit: 'diagnosis', icon: 'Flame' },
    { id: 'bathroom', name: 'Bathroom renovation', description: 'Fixed-price packages with a 10-year workmanship warranty.', priceFrom: 4800, unit: 'project', icon: 'Thermometer' },
    { id: 'gas', name: 'Gas line safety check', description: 'Mandatory periodic inspection with digital protocol and TÜV-ready report.', priceFrom: 119, unit: 'flat', icon: 'Sparkles' },
  ] as ServiceItem[],

  reviews: [
    { name: 'Sabine R.', location: 'Oberkassel', rating: 5, date: '2 weeks ago', service: 'Burst pipe', quote: 'Called at 2:40 am in full panic — a calm voice walked me to the shut-off valve and Marco arrived before 3:15. Water damage stayed under one cabinet.', source: 'Google' },
    { name: 'Jonas T.', location: 'Flingern', rating: 5, date: '1 month ago', service: 'Drain unblocking', quote: 'Camera proof of the cleared pipe on his phone, fixed price exactly as quoted on the phone. Rare combination, honestly.', source: 'Google' },
    { name: 'Priya M.', location: 'Bilk', rating: 5, date: '1 month ago', service: 'Leak detection', quote: 'They found a slab leak in 40 minutes that another company wanted to "explore" for a week. Thermal imaging does not lie.', source: 'Yelp' },
    { name: 'Heinz W.', location: 'Gerresheim', rating: 4, date: '2 months ago', service: 'Boiler repair', quote: 'Heating back on the same evening. One star off because the spare part took two hours — but they kept me updated the whole time.', source: 'Google' },
    { name: 'Elif K.', location: 'Derendorf', rating: 5, date: '2 months ago', service: 'Bathroom project', quote: 'Fixed-price bathroom, ten-year warranty, and the crew actually cleaned up every day. Project manager sent daily photo updates.', source: 'Site' },
    { name: 'Dieter L.', location: 'Kaiserswerth', rating: 5, date: '3 months ago', service: 'Gas safety check', quote: 'Digital report the same evening, landlord accepted it without questions. Will book the recurring plan.', source: 'Google' },
  ] as Review[],

  faqs: [
    { group: 'Emergencies', q: 'How fast can you actually be here?', a: 'Our published average for the Düsseldorf zone is 41 minutes from call to door, measured over the last 90 nights. Inner-city addresses are typically under 30 minutes. The dispatcher gives you a live ETA and the technician updates it en route.' },
    { group: 'Emergencies', q: 'What should I do while waiting?', a: 'If water is flowing, close the main shut-off valve (the dispatcher will guide you by phone), move valuables, and cut power to affected rooms at the breaker. Photograph everything for your insurance — our report also documents cause and damage.' },
    { group: 'Pricing', q: 'What does an emergency call-out cost?', a: 'Night-time call-outs start at €129 including the first 30 minutes on site. You get a binding price range on the phone before we drive, and the technician confirms it in writing before any work starts. No surprises, ever.' },
    { group: 'Pricing', q: 'Do you offer financing for larger projects?', a: 'Yes — bathroom projects and boiler replacements from €2,000 can be financed through our partner bank from 0% down payment, with a soft credit check that does not affect your score.' },
    { group: 'Guarantees', q: 'What if the repair fails again?', a: 'Every repair carries a 24-month workmanship warranty; new installations carry 10 years. If the same fault returns within the warranty window, we return and fix it free — including weekend call-outs.' },
    { group: 'Guarantees', q: 'Are you insured and licensed?', a: 'Fully: master-plumber license DE-DUS-88412-A, €5M liability insurance, and every technician is background-checked and permanently employed — we never subcontract emergency work.' },
  ] as FaqItem[],

  team: [
    { name: 'Marco Kowalski', role: 'Master plumber · night lead', certs: ['Master craftsman', 'Gas certified'], years: 17, initials: 'MK' },
    { name: 'Aylin Demir', role: 'Leak-detection specialist', certs: ['Thermography lvl 2', 'Acoustics cert'], years: 9, initials: 'AD' },
    { name: 'Piotr Nowak', role: 'Heating engineer', certs: ['Shk Meister', 'Viessmann partner'], years: 12, initials: 'PN' },
    { name: 'Sarah Osei', role: 'Bathroom project manager', certs: ['PMP', 'Warranty officer'], years: 8, initials: 'SO' },
  ] as TeamMember[],

  caseStudies: [
    { title: 'Server-room flood contained in 50 minutes', challenge: 'A corroded riser flooded an office server room at 1 am — hundreds of thousands of euros at risk.', result: 'Shut-off, extraction and dehumidifier placement inside 50 minutes; server racks stayed dry. Insurance report same week.', metric: '0 € loss', location: 'Düsseldorf' },
    { title: 'Hidden slab leak found without breaking the floor', challenge: 'A 1970s bungalow lost 900 litres of water per day with no visible damage.', result: 'Acoustic correlation pinpointed the leak to 30 cm. One 40 cm tile opened instead of the entire hallway.', metric: '1 tile', location: 'Meerbusch' },
    { title: 'Full bathroom rebuild for a tenant with fixed price', challenge: 'Landlord needed a guaranteed budget and zero overrun across 6 units.', result: 'All six bathrooms delivered at quote, two days early each, with a 10-year warranty handed to the landlord.', metric: '−2 days', location: 'Neuss' },
  ] as CaseStudy[],

  neighborhoods: [
    { name: 'Altstadt', etaMinutes: 18, jobs: 214 },
    { name: 'Flingern', etaMinutes: 22, jobs: 189 },
    { name: 'Oberkassel', etaMinutes: 25, jobs: 156 },
    { name: 'Gerresheim', etaMinutes: 31, jobs: 132 },
    { name: 'Neuss', etaMinutes: 28, jobs: 121 },
    { name: 'Essen', etaMinutes: 42, jobs: 87 },
  ] as Neighborhood[],

  posts: [
    { title: 'The 90-second shut-off drill every household should know', category: 'Prevention', readMinutes: 4, date: 'Mar 2025', excerpt: 'Where the valve is, how it works, and why you should test it twice a year — with a printable tag for your fuse box.' },
    { title: 'Why autumn bursts your oldest pipes', category: 'Explainers', readMinutes: 6, date: 'Oct 2024', excerpt: 'Thermal contraction, pressure spikes and the three pipe materials we replace most often in 40-year-old buildings.' },
    { title: 'Insurance claims after water damage — a clean-paperwork playbook', category: 'Insurance', readMinutes: 8, date: 'Jan 2025', excerpt: 'The five photos, two documents and one report wording that make claims settle in days instead of months.' },
    { title: 'Hard water in the Rhein-Ruhr region: what it costs you', category: 'Explainers', readMinutes: 5, date: 'Feb 2025', excerpt: 'Limescale is not just taste — the real numbers on appliance lifetime and energy loss, with softener payback math.' },
  ] as BlogPost[],

  trustItems: [
    { icon: 'BadgeCheck', label: 'Master-licensed', detail: 'DE-DUS-88412-A' },
    { icon: 'ShieldCheck', label: '€5M insured', detail: 'liability + damage' },
    { icon: 'Lock', label: 'Background-checked', detail: 'no subcontracting' },
    { icon: 'HeartHandshake', label: 'Price guarantee', detail: 'quote binds, always' },
  ],

  credentials: [
    { label: 'Master plumber license', detail: 'Chamber of Crafts Düsseldorf — reg. DE-DUS-88412-A', kind: 'license' },
    { label: '€5,000,000 liability', detail: 'Property damage & consequential water damage covered', kind: 'insurance' },
    { label: 'Gas & steam certified', detail: 'All technicians hold current gas-work permits', kind: 'cert' },
    { label: 'Clean-record team', detail: 'Every employee police-checked, permanently employed', kind: 'background' },
  ] as { label: string; detail: string; kind: 'license' | 'insurance' | 'cert' | 'background' }[],

  guarantees: [
    { title: '45-minute response', detail: 'Late? Your call-out fee is zero. Measured, not promised.' },
    { title: 'Fixed price in writing', detail: 'The quote you approve is the invoice you pay.' },
    { title: '24-month repair warranty', detail: 'Same fault returns? We fix it free, any hour.' },
    { title: 'Clean-site promise', detail: 'Dust sheets, extraction, and a mop before we leave.' },
  ],

  stats: [
    { value: 41, suffix: ' min', label: 'avg. night response' },
    { value: 12480, label: 'emergency jobs since 2011' },
    { value: 4.9, decimals: 1, label: 'avg. rating (fictional)' },
    { value: 97, suffix: '%', label: 'one-visit fix rate' },
  ],

  certifications: ['Master-plumber licensed', '€5M insured', 'Biogas-ready partner', 'Chamber of Crafts member'],

  postcodes: ['40', '41', '42', '45', '47'],

  tierLadder: [
    {
      tier: 1,
      label: 'Starter',
      modules: ['SiteHeader', 'MobileNav', 'SiteFooter', 'StickyActionBar', 'AnnouncementBar', 'Breadcrumb', 'SkipToContent', 'CookieConsent + ConsentGate', 'ErrorBoundary', 'FormField / InlineValidation / SuccessState', 'HeroUrgent', 'OpenNowBadge', 'CallNowPanel', 'ServiceCardGrid', 'GoogleMapEmbed', 'ReviewCarousel', 'FAQAccordion', 'ContactForm'],
    },
    {
      tier: 2,
      label: 'Growth',
      modules: ['ThemeToggle + BackToTop', 'EmergencyTriage', 'PostcodeChecker', 'ServiceAreaMap', 'QuoteRequestForm', 'BeforeAfterSlider', 'TrustBar', 'WhatsAppButton', 'BlogIndex', 'NewsletterSignup'],
    },
    {
      tier: 3,
      label: 'Business',
      modules: ['LanguageSwitcher', 'BookingCalendar', 'JobDispatchTeaser', 'FinancingCalculator', 'CredentialWall', 'GuaranteePanel', 'TeamGrid', 'NeighborhoodPages', 'CaseStudyCard', 'CallbackRequest', 'StructuredDataBlock', 'MegaMenu'],
    },
    {
      tier: 4,
      label: 'Flagship',
      modules: ['ProjectStatusPortal', 'AiConcierge', '3DHeroObject', 'AnimatedCounter', 'HeroCinematic', 'LiveChatLauncher', 'ResultsStatStrip'],
    },
  ] as TierLadder[],

  schema: {
    '@context': 'https://schema.org',
    '@type': 'Plumber',
    name: 'Nightflow 24/7 Plumbing',
    telephone: '+49 211 555 0123',
    address: { '@type': 'PostalAddress', streetAddress: 'Gladbecker Str. 12', postalCode: '40470', addressLocality: 'Düsseldorf', addressCountry: 'DE' },
    openingHoursSpecification: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '00:00', closes: '23:59' },
    areaServed: 'Rhein-Ruhr, 25 km radius',
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '6' },
  },
}
