import type { SectionId } from '@/modules/types'

export interface SectionMeta {
  id: SectionId
  title: string
  description: string
  /**
   * The two design paths that apply to every module in this section — the
   * "two unique paths" idea from the Modules Playbook, made explicit.
   */
  paths: [{ label: string; description: string }, { label: string; description: string }]
}

export const SECTIONS: SectionMeta[] = [
  {
    id: 'global',
    title: '01 Global system',
    description: 'Header, footer, bars, navigation and utility shells',
    paths: [
      { label: 'Quiet chrome', description: 'Slim, utility-first bands that let page content lead — monochrome, small type, one accent.' },
      { label: 'Branded frame', description: 'The shell carries the brand: bolder bars, richer colour, promotional messaging woven into the frame.' },
    ],
  },
  {
    id: 'hero',
    title: '02 Heroes and attention',
    description: 'Opening statements that set the page up',
    paths: [
      { label: 'Typographic', description: 'Big statement type on a calm field — the words are the visual; fast, editorial, confident.' },
      { label: 'Cinematic', description: 'Photography or imagery leads the first screen with the message overlaid or beside it.' },
    ],
  },
  {
    id: 'value',
    title: '03 Value and explanation',
    description: 'Benefits, process, pricing and explanation',
    paths: [
      { label: 'Card system', description: 'Discrete bordered cards in a grid — scannable, modular, easy to extend.' },
      { label: 'Editorial flow', description: 'Open, borderless rhythm with numbered steps and long-form, magazine-style pacing.' },
    ],
  },
  {
    id: 'proof',
    title: '04 Proof and trust',
    description: 'Reviews, results, credentials and reassurance',
    paths: [
      { label: 'Numbers first', description: 'Lead with quantified outcomes — big stat strips and measurable results.' },
      { label: 'Voices first', description: 'Lead with human words — quotes, names and faces carrying the persuasion.' },
    ],
  },
  {
    id: 'conversion',
    title: '05 Conversion',
    description: 'Calls to action, enquiries and sign-ups',
    paths: [
      { label: 'Bold band', description: 'One loud, full-width moment of colour and a single unmissable action.' },
      { label: 'Reassuring panel', description: 'Conversion wrapped in reassurance — details, guarantees and low-friction asks side by side.' },
    ],
  },
  {
    id: 'commerce',
    title: '06 Commerce',
    description: 'Catalogue, basket and checkout surfaces',
    paths: [
      { label: 'Product grid', description: 'Classic catalogue cards — image, price, badge, add-to-basket — built for scanning many items.' },
      { label: 'Editorial rows', description: 'One product per row, alternating image and copy — built for considered, higher-ticket purchases.' },
    ],
  },
  {
    id: 'booking',
    title: '07 Booking and operations',
    description: 'Scheduling, reservations and service status',
    paths: [
      { label: 'Service picker', description: 'Choose a service, duration and slot — guided, structured, operations-friendly.' },
      { label: 'Request form', description: 'Describe what you need in a message — flexible, high-context, relationship-first.' },
    ],
  },
  {
    id: 'location',
    title: '08 Location and local SEO',
    description: 'Where you are, hours and service areas',
    paths: [
      { label: 'Map card', description: 'Place-first: map, address and directions dominating one card.' },
      { label: 'Hours first', description: 'Time-first: opening hours, today status and transport detail leading the layout.' },
    ],
  },
  {
    id: 'content',
    title: '09 Content and SEO',
    description: 'Articles, FAQs, resources and structured data',
    paths: [
      { label: 'Interactive', description: 'Accordion and tab patterns that keep long answers collapsed until wanted.' },
      { label: 'Static spread', description: 'Everything visible at once — multi-column grids and reading-order lists for SEO.' },
    ],
  },
  {
    id: 'people',
    title: '10 People and culture',
    description: 'Team, leadership and careers',
    paths: [
      { label: 'Portrait cards', description: 'Photo-forward cards with names and roles — warm, human, egalitarian.' },
      { label: 'Editorial roster', description: 'Text-led list rows with bios — senior, credentials-first, agency style.' },
    ],
  },
  {
    id: 'hospitality',
    title: '11 Hospitality and food',
    description: 'Menus, rooms and experiences',
    paths: [
      { label: 'Classic menu', description: 'Sectioned menu boards with prices in columns — the format guests know.' },
      { label: 'Tasting list', description: 'Minimal numbered lines, no boxes — the format fine-dining uses.' },
    ],
  },
  {
    id: 'property',
    title: '12 Real estate and property',
    description: 'Listings, valuations and property tools',
    paths: [
      { label: 'Spec photo card', description: 'Photo-led card with bed/bath/area chips — portal familiar, fast to scan.' },
      { label: 'Wide detail row', description: 'Panoramic row with room-by-room detail and a soft CTA — brochure feel.' },
    ],
  },
  {
    id: 'automotive',
    title: '13 Automotive',
    description: 'Vehicle stock, service and finance',
    paths: [
      { label: 'Spec hero', description: 'One vehicle, one screen: hero shot plus a technical spec grid.' },
      { label: 'Stock cards', description: 'Inventory grid with year, price and mileage — stocklist scanning.' },
    ],
  },
  {
    id: 'education',
    title: '14 Education and learning',
    description: 'Courses, lessons and enrolment',
    paths: [
      { label: 'Course cards', description: 'Card per course with level, lessons and duration — catalogue browsing.' },
      { label: 'Curriculum list', description: 'Ordered modules with lesson counts — syllabus depth and structure.' },
    ],
  },
  {
    id: 'events',
    title: '15 Events and entertainment',
    description: 'Tickets, venues and programmes',
    paths: [
      { label: 'Event cards', description: 'Poster-style cards with date blocks — festival energy.' },
      { label: 'Schedule timeline', description: 'Time-railed running order — conference clarity.' },
    ],
  },
  {
    id: 'b2b',
    title: '16 B2B and SaaS',
    description: 'Product, pricing, security and developer surfaces',
    paths: [
      { label: 'Integration grid', description: 'Categorised logo grid — breadth of ecosystem at a glance.' },
      { label: 'Connected pills', description: 'Grouped pill clusters with counts and a connect CTA — workflow feel.' },
    ],
  },
  {
    id: 'regulated',
    title: '17 Finance, legal and regulated',
    description: 'Disclosures, consultations and secure intake',
    paths: [
      { label: 'Disclosure card', description: 'Regulator badges, plain-language disclosure and document links.' },
      { label: 'Trust checklist', description: 'Compliance checklist with certificate references — audit ready.' },
    ],
  },
  {
    id: 'nonprofit',
    title: '18 Nonprofit and public sector',
    description: 'Mission, giving and public information',
    paths: [
      { label: 'Progress story', description: 'Mission with a live progress bar toward the goal — momentum giving.' },
      { label: 'Impact stats', description: 'Annual impact numbers as a band of facts — accountability giving.' },
    ],
  },
  {
    id: 'motion',
    title: '19 Motion and premium layers',
    description: 'Interaction, motion and 3D',
    paths: [
      { label: 'Tabbed showcase', description: 'Interactive tabs swap content with smooth transitions — product tour feel.' },
      { label: 'Hover reveals', description: 'Cards that tilt and reveal detail on hover — playful, premium, tactile.' },
    ],
  },
  {
    id: 'forms',
    title: '20 Forms and feedback',
    description: 'Fields, validation, uploads and confirmations',
    paths: [
      { label: 'Stepper', description: 'One question at a time with a progress rail — high completion.' },
      { label: 'One-page', description: 'Every field visible with clear sections and consent — full context.' },
    ],
  },
]

export const SECTION_MAP = new Map(SECTIONS.map((section) => [section.id, section]))
