/**
 * Template Factory — shared types
 */
export type Tier = 1 | 2 | 3 | 4

export interface ModuleRef {
  id: string
  tier: Tier
}

export interface TierLadder {
  tier: Tier
  label: string
  modules: string[]
}

/** A testimonial / review entry (all fictional, badge-required) */
export interface Review {
  name: string
  location: string
  rating: number
  date: string
  service: string
  quote: string
  source: 'Google' | 'Yelp' | 'Site'
}

export interface ServiceItem {
  id: string
  name: string
  description: string
  priceFrom: number
  unit: string
  icon: string
  urgent?: boolean
}

export interface FaqItem {
  q: string
  a: string
  group: string
}

export interface TeamMember {
  name: string
  role: string
  certs: string[]
  years: number
  initials: string
}

export interface CaseStudy {
  title: string
  challenge: string
  result: string
  metric: string
  location: string
}

export interface BlogPost {
  title: string
  category: string
  readMinutes: number
  date: string
  excerpt: string
}

export interface Neighborhood {
  name: string
  etaMinutes: number
  jobs: number
}

export interface BusinessInfo {
  slug: string
  name: string
  tagline: string
  phone: string
  phoneHref: string
  email: string
  city: string
  address: string
  postcode: string
  hours: { day: string; open: string; close: string }[]
  license: string
  founded: number
}

/** Analytics event names from the mapping doc (subset used by demos) */
export type FactoryEventName =
  | 'page_viewed'
  | 'cta_clicked'
  | 'form_started'
  | 'form_submitted'
  | 'booking_started'
  | 'booking_completed'
  | 'quote_started'
  | 'quote_completed'
  | 'call_clicked'
  | 'directions_clicked'
  | 'filter_used'
  | 'search_used'
  | 'consent_blocked'
  | 'language_changed'
  | 'portal_login'
  | 'recommendation_clicked'
  | 'media_opened'
