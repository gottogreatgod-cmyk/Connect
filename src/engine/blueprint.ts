/**
 * The Template Blueprint — the definition discipline of the merged
 * production, ported from the Bolt-Ember project's template-definition.ts
 * (fb-002 · Restaurant Reservations — Growth) and lifted into the OS.
 *
 * A registry entry says what a template IS (tokens, pages, modules); a
 * blueprint says what it was COMMISSIONED to do — the personas it must
 * win, the journeys it must complete, the SEO it must carry, the QA it
 * must pass and the performance budget it must live inside. Templates
 * that arrive as merged productions carry their blueprint here; the site
 * view renders it as the Blueprint console.
 */

export interface BlueprintDef {
  /** the production id the blueprint was commissioned under (e.g. "fb-002") */
  id: string
  /** where this blueprint came from — the merge trail, honestly stated */
  source: string
  businessType: string
  positioning: string
  primaryConversion: string
  secondaryConversions: string[]
  /** buyer personas the design must win */
  personas: string[]
  /** customer journeys the design must complete */
  journeys: string[]
  /** every content field the business must supply */
  contentFields: string[]
  integrations: string[]
  seo: {
    title: string
    description: string
    structuredData: string[]
  }
  accessibility: string[]
  performanceBudget: {
    /** largest contentful paint, mobile, seconds */
    lcp: number
    /** cumulative layout shift */
    cls: number
    /** interaction to next paint, milliseconds */
    inp: number
  }
  qaChecklist: string[]
}

export const BLUEPRINTS: Record<string, BlueprintDef> = {
  "ember-oak": {
    id: "fb-002",
    source: "Merged from the Bolt-Ember production — Restaurant Reservations · Growth",
    businessType: "Full-service restaurant with reservation flow",
    positioning:
      "A neighbourhood wood-fire grill where seasonal ingredients meet open-flame cooking. Approachable fine dining without the formality — and a reservation flow that fills the room.",
    primaryConversion: "reservation",
    secondaryConversions: ["call", "private-dining enquiry"],
    personas: [
      "Couples seeking a memorable date-night dinner",
      "Groups of 4–8 celebrating birthdays and anniversaries",
      "Local food enthusiasts who value seasonal, sourced ingredients",
      "Professionals booking client dinners in a warm but refined setting",
    ],
    journeys: [
      "Discover via search or recommendation → browse the menu → reserve a table",
      "See availability for a specific date → complete the reservation → receive confirmation",
      "Explore private dining for a group → submit the enquiry → a coordinator follows up",
      "Browse the menu → call for same-day availability → walk-in or hold a table",
    ],
    contentFields: [
      "businessName", "tagline", "description", "phone", "email", "address", "hours",
      "menuCategories", "menuItems", "reviews", "teamMembers", "galleryImages", "faqs",
      "privateDiningPackages", "socialLinks",
    ],
    integrations: ["reservation-confirmation", "private-dining-enquiry", "phone-click-to-call"],
    seo: {
      title: "{businessName} — Wood-Fire Grill & Seasonal Kitchen | {city}",
      description:
        "Wood-fire grill in {neighborhood}. Seasonal menus, open-flame cooking, and warm hospitality. Reserve your table at {businessName}.",
      structuredData: ["Restaurant", "Menu", "OpeningHoursSpecification", "Reservation"],
    },
    accessibility: [
      "Skip link to main content",
      "Keyboard-navigable forms and navigation",
      "ARIA labels on icon-only buttons",
      "Form field labels and error announcements",
      "Focus-visible outlines on all interactive elements",
      "Reduced-motion respected for all transitions",
    ],
    performanceBudget: { lcp: 2.5, cls: 0.1, inp: 200 },
    qaChecklist: [
      "Every page has a unique title and meta description",
      "Primary CTA (Reserve) reachable in the header on every page",
      "Reservation form validates date, time, party size, and contact fields",
      "Menu page has all categories with prices and descriptions",
      "Private Dining has an enquiry form with event details",
      "Contact page has address, hours, map link, phone, and email",
      "All images have descriptive alt text",
      "No placeholder text anywhere",
      "Mobile layout requires no pinching or horizontal scroll",
      "Footer has contact, hours, navigation, and social links",
    ],
  },
}

export function blueprintOf(slug: string): BlueprintDef | null {
  return BLUEPRINTS[slug] ?? null
}
