'use client'

/**
 * The Factory store — the module-built templates' runtime state.
 *
 * Merged into Growth OS: template + tier selection now live in the OS
 * (registry + the tier-morph ladder), so this store keeps only what the
 * factory kit owns: the preview locale, the consent gate and the live
 * event ring. Unblocked events also flow into the OS analytics pipeline
 * (/api/track → the pulse readout).
 */

import { create } from 'zustand'
import { track as osTrack } from '@/engine/analytics'
import type { FactoryEventName } from './types'

export type Locale = 'EN' | 'DE' | 'FR'
export type ConsentCategory = 'analytics' | 'marketing'

interface FactoryEvent {
  id: number
  name: FactoryEventName
  detail?: string
  at: number
}

interface FactoryState {
  locale: Locale
  consent: Record<ConsentCategory, boolean>
  consentDecided: boolean
  events: FactoryEvent[]
  setLocale: (l: Locale) => void
  setConsent: (c: Record<ConsentCategory, boolean>, decided: boolean) => void
  track: (name: FactoryEventName, detail?: string) => void
}

let eventId = 0

/* Analytics-class events the ConsentGate holds back until opt-in. */
const GATED: FactoryEventName[] = [
  'page_viewed',
  'form_started',
  'form_submitted',
  'booking_started',
  'booking_completed',
  'quote_started',
  'quote_completed',
  'filter_used',
  'search_used',
  'recommendation_clicked',
  'media_opened',
]

export const useFactory = create<FactoryState>((set, get) => ({
  locale: 'EN',
  consent: { analytics: false, marketing: false },
  consentDecided: false,
  events: [],
  setLocale: (locale) => {
    get().track('language_changed', locale)
    set({ locale })
  },
  setConsent: (consent, decided) => set({ consent, consentDecided: decided }),
  track: (name, detail) => {
    const state = get()
    const event: FactoryEvent = { id: ++eventId, name, detail, at: Date.now() }
    let blocked = false
    /* ConsentGate: analytics-class events are dropped until consent is granted */
    if (GATED.includes(name) && !state.consent.analytics) {
      blocked = true
      event.name = 'consent_blocked'
      event.detail = `${name} (blocked by ConsentGate)`
    }
    if (typeof console !== 'undefined') console.info('[factory:event]', event.name, event.detail ?? '')
    if (!blocked) osTrack(name, { source: 'factory-kit', note: detail ?? '' })
    set((s) => ({ events: [event, ...s.events].slice(0, 12) }))
  },
}))

export const LOCALE_GREETINGS: Record<Locale, string> = {
  EN: 'Licensed, bonded & on call — day and night.',
  DE: 'Zugelassen, versichert und rund um die Uhr im Einsatz.',
  FR: 'Agréé, assuré et disponible jour et nuit.',
}
