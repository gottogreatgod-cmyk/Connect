/**
 * The Motion Craft engine — one grammar distilled from five master sources.
 *
 * Curves, springs, duration scales and brand-personality presets normalised
 * from the five integrated skill packs (see `engine/motion-skills.ts`):
 *
 *   · emilkowalski/skills        — the animate gate, easing + duration tables
 *   · greensock/gsap-skills      — timeline choreography, transforms only
 *   · remotion-dev/skills        — composition thinking, spring() physics
 *   · talknerdytome …/wiggle     — brand-personality → motion-type mapping
 *   · iart-ai/web-animation-skills — micro-interaction + 60fps contracts
 *
 * Pure data + helpers — no React, no DOM. Anything can consume it: the site
 * kit modules, the Motion Lab, and any external agent through /api/skills.
 */

/* ── easing curves ─────────────────────────────────────────────────── */

/**
 * Named CSS cubic-bezier curves. `css` is the value you put in a style
 * sheet; `motion` is the array form framer-motion expects; `gsap` is the
 * CustomEase-able control points.
 */
export interface EasingCurve {
  id: string
  label: string
  css: string
  motion: [number, number, number, number]
  note: string
}

export const CURVES: Record<string, EasingCurve> = {
  'ease-out': {
    id: 'ease-out',
    label: 'Strong ease-out',
    css: 'cubic-bezier(0.23, 1, 0.32, 1)',
    motion: [0.23, 1, 0.32, 1],
    note: 'Entrances & exits. The default for UI — never ease-in on interface.',
  },
  'ease-in-out': {
    id: 'ease-in-out',
    label: 'Strong ease-in-out',
    css: 'cubic-bezier(0.77, 0, 0.175, 1)',
    motion: [0.77, 0, 0.175, 1],
    note: 'Elements moving on screen (morphs, reordering, travel).',
  },
  drawer: {
    id: 'drawer',
    label: 'Drawer curve',
    css: 'cubic-bezier(0.32, 0.72, 0, 1)',
    motion: [0.32, 0.72, 0, 1],
    note: 'iOS-like sheet/drawer. Decelerate hard, settle without overshoot.',
  },
  enter: {
    id: 'enter',
    label: 'Entrance',
    css: 'cubic-bezier(0.16, 1, 0.3, 1)',
    motion: [0.16, 1, 0.3, 1],
    note: 'Fast pickup, long glide — modal and popover entrances.',
  },
  overshoot: {
    id: 'overshoot',
    label: 'Tasteful overshoot',
    css: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    motion: [0.34, 1.56, 0.64, 1],
    note: 'Playful arrivals. Reserve for rare/first-time moments.',
  },
  standard: {
    id: 'standard',
    label: 'Standard move',
    css: 'cubic-bezier(0.4, 0, 0.2, 1)',
    motion: [0.4, 0, 0.2, 1],
    note: 'Material standard — generic movement between states.',
  },
}

/** Lottie/wiggle bezier pairs — value pairs for the `i`/`o` tangents. */
export const LOTTIE_EASE = {
  standard: { i: 0.42, o: 0.58 },
  organic: { i: 0.25, o: 0.75 },
  bounce: { i: 0.34, o: 1.56 },
  backIn: { i: 0.6, o: -0.28 },
  backOut: { i: 0.735, o: 0.045 },
} as const

/* ── durations (the UI ceiling is 300ms) ───────────────────────────── */

export interface DurationScale {
  id: string
  ms: [number, number]
  note: string
}

export const DURATIONS: DurationScale[] = [
  { id: 'press', ms: [100, 160], note: 'Button press feedback — instant, felt before seen.' },
  { id: 'tooltip', ms: [125, 200], note: 'Tooltips and small popovers.' },
  { id: 'dropdown', ms: [150, 250], note: 'Dropdowns, selects, menus. A 180ms dropdown beats a 400ms one.' },
  { id: 'modal', ms: [200, 500], note: 'Modals and drawers — the only place past 300ms.' },
]

/* ── springs ───────────────────────────────────────────────────────── */

export interface SpringPreset {
  id: string
  label: string
  /** framer-motion / motion form */
  motion: { type: 'spring'; [k: string]: unknown }
  note: string
}

export const SPRINGS: Record<string, SpringPreset> = {
  snappy: {
    id: 'snappy',
    label: 'Snappy UI',
    motion: { type: 'spring', stiffness: 400, damping: 30 },
    note: 'The default for press/hover feedback. Fast, no visible bounce.',
  },
  layout: {
    id: 'layout',
    label: 'Layout',
    motion: { type: 'spring', stiffness: 500, damping: 40 },
    note: 'Reordering and shared-element moves — position only.',
  },
  alive: {
    id: 'alive',
    label: 'Alive',
    motion: { type: 'spring', stiffness: 400, damping: 12 },
    note: 'Visible bounce for drag-with-momentum and playful elements.',
  },
  apple: {
    id: 'apple',
    label: 'Apple-style',
    motion: { type: 'spring', duration: 0.5, bounce: 0.2 },
    note: 'Easier to reason about than raw physics. Bounce 0.1–0.3, rarely more.',
  },
}

/* ── the animate gate (should this animate at all?) ────────────────── */

export interface GateTier {
  id: string
  frequency: string
  decision: string
}

export const GATE_TIERS: GateTier[] = [
  { id: 'constant', frequency: '100+ times/day (keyboard shortcuts, palette toggles)', decision: 'No animation. Ever.' },
  { id: 'frequent', frequency: 'Tens of times/day (hovers, list navigation)', decision: 'Near-imperceptible only — fast and subtle, or nothing.' },
  { id: 'occasional', frequency: 'Occasional (modals, drawers, toasts)', decision: 'Standard animation.' },
  { id: 'rare', frequency: 'Rare / first-time (onboarding, success, celebration)', decision: 'The delight budget lives here.' },
]

export const PURPOSES = [
  'Feedback — confirming the interface heard the user',
  'Spatial consistency — showing where something came from or went',
  'State indication — making a state change legible',
  'Preventing a jarring change — bridging content that would teleport',
  'Explanation — demonstrating how something works (marketing only)',
  'Delight — allowed only at the rare/first-time tier',
] as const

/* ── brand personality → motion type (the wiggle mapping) ──────────── */

export interface PersonalityPreset {
  id: string
  label: string
  brands: string
  keyframes: string
  easing: string
  fps: number
  duration: string
  css: string
  spring: string
  note: string
}

export const PERSONALITIES: Record<string, PersonalityPreset> = {
  corporate: {
    id: 'corporate',
    label: 'Confident professionalism',
    brands: 'B2B, finance, legal, insurance',
    keyframes: '8–12 (sparse, deliberate)',
    easing: '0.42/0.58 standard ease-in-out',
    fps: 30,
    duration: '1.5–2s',
    css: 'fade + gentle scale 95→100%',
    spring: '— (no overshoot, ever)',
    note: 'Slow ease-out fade, no overshoot. Restraint reads as trust.',
  },
  organic: {
    id: 'organic',
    label: 'Organic / continuous',
    brands: 'audio, music, speech AI, nature',
    keyframes: '25–45 (critical for smoothness)',
    easing: '0.25/0.75 soft organic',
    fps: 60,
    duration: '3s loop',
    css: 'waveforms, pulses, flowing rhythms',
    spring: 'soft, long settle',
    note: 'Dense keyframes at 60fps are what make it feel alive, not choppy.',
  },
  bold: {
    id: 'bold',
    label: 'Bold / attention-grabbing',
    brands: 'startups, social, marketing',
    keyframes: '15–25',
    easing: '0.34/1.56 bounce or 0.6/-0.28 back',
    fps: 60,
    duration: '0.8–1.5s',
    css: 'overshoot entrances, ±10–20% scale',
    spring: 'visible bounce (damping 10–15)',
    note: 'Fast and dynamic — the entrance IS the brand voice.',
  },
  cinematic: {
    id: 'cinematic',
    label: 'Cinematic / complex',
    brands: 'luxury, film, premium agencies',
    keyframes: '50–120',
    easing: 'custom bezier, variable timing',
    fps: 60,
    duration: '3–5s',
    css: 'slow reveals, masked wipes',
    spring: '—',
    note: 'Time is the luxury signal. Slow means expensive.',
  },
}

/* ── choreography (gsap timeline grammar) ──────────────────────────── */

export const TIMELINE_GRAMMAR = {
  position: [
    { token: '0.5', meaning: 'absolute — start at 0.5s' },
    { token: '+=0.5', meaning: 'relative — 0.5s after the previous end' },
    { token: '-=0.2', meaning: 'overlap — 0.2s before the previous end' },
    { token: '"<"', meaning: 'start when the previous animation starts' },
    { token: '">"', meaning: 'start when the previous animation ends (default)' },
    { token: '"label+=0.3"', meaning: '0.3s after the named label' },
  ],
  stagger: [
    { token: '0.04', meaning: 'each 40ms apart — the 30–80ms sweet spot' },
    { token: '{ each: 0.05, from: "center" }', meaning: 'ripple outward from the middle' },
    { token: '{ grid: [3,3], from: "start" }', meaning: 'grid sweep for card matrices' },
  ],
} as const

/* ── the 60fps contract ────────────────────────────────────────────── */

export const FPS_CONTRACT = {
  animateOnly: ['transform', 'opacity', 'clip-path (the sanctioned fourth)'],
  neverAnimate: ['width', 'height', 'margin', 'padding', 'top', 'left'],
  rules: [
    'Nothing enters from scale(0) — start at 0.9–0.97 with opacity 0.',
    'transform-origin at the trigger for popovers; modals are exempt (centered).',
    'Percentages in translate() are relative to the element itself — prefer over pixels.',
    'Exit the way it entered — symmetric paths make swipe-to-dismiss obvious.',
    'Transitions (not keyframes) for anything a user can fire twice a second.',
    'prefers-reduced-motion ships with the animation, never as a follow-up.',
    'Hover motion is gated behind @media (hover: hover) and (pointer: fine).',
  ],
} as const
