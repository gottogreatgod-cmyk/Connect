/**
 * Genome — the personalisation layer that sits on top of every template.
 *
 * Each template is hand-built on a small token contract (colour, type,
 * radius, density, motion). The genome swaps those tokens with named,
 * curated choices — never raw controls — so a buyer can see the same
 * finished site in their own atmosphere without breaking its design.
 *
 * Ported from the original Omniforge genome (lib/genome.ts) and reduced
 * to the seven switches that every template genuinely honours.
 */

export type Mode = "light" | "dark"

export interface Palette {
  bg: string
  surface: string
  ink: string
  muted: string
  line: string
  primary: string
  onPrimary: string
  accent: string
}

export interface Voice {
  id: string
  label: string
  display: string
  body: string
  note: string
}

const stack = (f: string, fallback: string) => `'${f}', ${fallback}`
const SERIF = "Georgia, 'Times New Roman', serif"
const SANS = "system-ui, -apple-system, 'Segoe UI', sans-serif"

export const font = {
  fraunces: stack("Fraunces", SERIF),
  instrument: stack("Instrument Serif", SERIF),
  playfair: stack("Playfair Display", SERIF),
  cormorant: stack("Cormorant Garamond", SERIF),
  newsreader: stack("Newsreader", SERIF),
  dmSerif: stack("DM Serif Display", SERIF),
  bricolage: stack("Bricolage Grotesque", SANS),
  outfit: stack("Outfit", SANS),
  archivo: stack("Archivo", SANS),
  archivoBlack: stack("Archivo Black", SANS),
  syne: stack("Syne", SANS),
  space: stack("Space Grotesk", SANS),
  inter: stack("Inter", SANS),
  dmSans: stack("DM Sans", SANS),
  manrope: stack("Manrope", SANS),
  mono: stack("JetBrains Mono", "ui-monospace, monospace"),
}

/* ── 01 · colour atmospheres ─────────────────────────────────────── */

export interface Atmosphere {
  id: string
  label: string
  feeling: string
  light: Palette
  dark: Palette
}

export const ATMOSPHERES: Atmosphere[] = [
  {
    id: "ivory",
    label: "Ivory Archive",
    feeling: "Quiet, museum-like, timeless",
    light: { bg: "#F7F2E8", surface: "#EFE7D9", ink: "#1C1815", muted: "#6B6052", line: "#D8CDB8", primary: "#7A5C17", onPrimary: "#FFFDF7", accent: "#A0522D" },
    dark: { bg: "#14110C", surface: "#1D1913", ink: "#F2E9DA", muted: "#A89A86", line: "#3A3226", primary: "#C9A227", onPrimary: "#14100C", accent: "#D07A45" },
  },
  {
    id: "charcoal",
    label: "Charcoal Studio",
    feeling: "Confident, modern, premium",
    light: { bg: "#F4F4F2", surface: "#FFFFFF", ink: "#141414", muted: "#5F5F5C", line: "#D6D6D2", primary: "#111111", onPrimary: "#FFFFFF", accent: "#3F5A8A" },
    dark: { bg: "#101113", surface: "#17181B", ink: "#EDEFF2", muted: "#959DA7", line: "#2A2D35", primary: "#EDEFF2", onPrimary: "#0B0C0E", accent: "#7DA2FF" },
  },
  {
    id: "botanical",
    label: "Deep Botanical",
    feeling: "Organic, expensive, calm",
    light: { bg: "#F3F6F0", surface: "#FFFFFF", ink: "#14231A", muted: "#53675A", line: "#D2DCCC", primary: "#1F5F43", onPrimary: "#F7FFF9", accent: "#8E6E16" },
    dark: { bg: "#0B1410", surface: "#13201A", ink: "#EFE9DC", muted: "#9CAFA4", line: "#24352C", primary: "#5FA37E", onPrimary: "#08120D", accent: "#C9A227" },
  },
  {
    id: "oxblood",
    label: "Oxblood Club",
    feeling: "Rich, traditional, powerful",
    light: { bg: "#F7F1EC", surface: "#FFFFFF", ink: "#241417", muted: "#6E5559", line: "#DFCFC7", primary: "#6E1423", onPrimary: "#FFF5F4", accent: "#8C6A1F" },
    dark: { bg: "#160D0F", surface: "#1F1417", ink: "#F2E4E0", muted: "#AF9598", line: "#392329", primary: "#C2475A", onPrimary: "#FFF0EC", accent: "#C9A227" },
  },
  {
    id: "champagne",
    label: "Champagne Gallery",
    feeling: "Soft, refined, celebratory",
    light: { bg: "#FAF5EA", surface: "#FFFFFF", ink: "#241F15", muted: "#6E6553", line: "#E4D9C2", primary: "#7E5F1B", onPrimary: "#FFFDF7", accent: "#A84E1C" },
    dark: { bg: "#171310", surface: "#201A14", ink: "#F3EBDD", muted: "#ACA190", line: "#383025", primary: "#D4AF37", onPrimary: "#171310", accent: "#C79A7A" },
  },
  {
    id: "midnight",
    label: "Midnight Instrument",
    feeling: "Technical, futuristic, precise",
    light: { bg: "#F5F7FB", surface: "#FFFFFF", ink: "#0D1B34", muted: "#4C5A72", line: "#D3DCEA", primary: "#123C8C", onPrimary: "#FFFFFF", accent: "#A84E1C" },
    dark: { bg: "#080B14", surface: "#111726", ink: "#EAF0FF", muted: "#9AA8C7", line: "#232D45", primary: "#7DA2FF", onPrimary: "#06101F", accent: "#F0B429" },
  },
]

/* ── 02 · typographic voices ─────────────────────────────────────── */

export const VOICES: Voice[] = [
  { id: "serif", label: "Editorial serif", display: font.cormorant, body: font.inter, note: "Cormorant over Inter" },
  { id: "grotesk", label: "Modern grotesque", display: font.inter, body: font.inter, note: "One neutral grotesque" },
  { id: "contrast", label: "High contrast", display: font.playfair, body: font.manrope, note: "Playfair over Manrope" },
  { id: "technical", label: "Technical", display: font.space, body: font.inter, note: "Space Grotesk, mono data" },
  { id: "humanist", label: "Humanist warm", display: font.fraunces, body: font.manrope, note: "Fraunces over Manrope" },
  { id: "poster", label: "Poster", display: font.syne, body: font.dmSans, note: "Wide Syne headlines" },
]

/* ── the seven switches ──────────────────────────────────────────── */

export type SwitchId = "atmosphere" | "voice" | "light" | "material" | "density" | "motion" | "contrast"
export type Genome = Record<SwitchId, string>

export const NATIVE: Genome = {
  atmosphere: "native",
  voice: "native",
  light: "native",
  material: "native",
  density: "native",
  motion: "native",
  contrast: "native",
}

export interface SwitchOption {
  id: string
  label: string
  hint: string
}

export interface GenomeSwitch {
  id: SwitchId
  no: string
  label: string
  line: string
  options: SwitchOption[]
}

const AS_DRAWN = (hint: string): SwitchOption => ({ id: "native", label: "As drawn", hint })

export const SWITCHES: GenomeSwitch[] = [
  {
    id: "atmosphere",
    no: "01",
    label: "Colour atmosphere",
    line: "The emotional temperature — named palettes, never raw hex.",
    options: [AS_DRAWN("The template keeps its own palette"), ...ATMOSPHERES.map((a) => ({ id: a.id, label: a.label, hint: a.feeling }))],
  },
  {
    id: "voice",
    no: "02",
    label: "Typographic voice",
    line: "Display and body roles swap together, so hierarchy holds.",
    options: [AS_DRAWN("The template keeps its own pairing"), ...VOICES.map((v) => ({ id: v.id, label: v.label, hint: v.note }))],
  },
  {
    id: "light",
    no: "03",
    label: "Light",
    line: "Every template exists in daylight and evening.",
    options: [
      AS_DRAWN("The light the designer chose"),
      { id: "light", label: "Daylight", hint: "Force the light rendering" },
      { id: "dark", label: "Evening", hint: "Force the dark rendering" },
    ],
  },
  {
    id: "material",
    no: "04",
    label: "Material",
    line: "Corner geometry across cards, buttons, inputs and frames.",
    options: [
      AS_DRAWN("The template keeps its own corners"),
      { id: "crisp", label: "Crisp", hint: "Square, printed, architectural" },
      { id: "soft", label: "Soft", hint: "Rounded, friendly, tactile" },
    ],
  },
  {
    id: "density",
    no: "05",
    label: "Density",
    line: "Section rhythm — how much air sits between ideas.",
    options: [
      { id: "compact", label: "Compact", hint: "Tighter sections, more per screen" },
      AS_DRAWN("The template keeps its own rhythm"),
      { id: "airy", label: "Airy", hint: "Gallery spacing, slower reading" },
    ],
  },
  {
    id: "motion",
    no: "06",
    label: "Motion",
    line: "Never more than the tier allows — only ever less.",
    options: [
      AS_DRAWN("Everything this tier includes"),
      { id: "subtle", label: "Subtle", hint: "Hover and focus only" },
      { id: "still", label: "Still", hint: "No movement at all" },
    ],
  },
  {
    id: "contrast",
    no: "07",
    label: "Contrast",
    line: "Accessibility headroom for muted text and rules.",
    options: [
      AS_DRAWN("Meets WCAG AA as designed"),
      { id: "high", label: "High contrast", hint: "Muted text pulled towards ink" },
    ],
  },
]

/* ── colour maths ────────────────────────────────────────────────── */

export function hexToRgb(hex: string) {
  const h = hex.replace("#", "")
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h
  const n = parseInt(full, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

export function mix(a: string, b: string, t = 0.5): string {
  const x = hexToRgb(a)
  const y = hexToRgb(b)
  const c = (k: "r" | "g" | "b") =>
    Math.max(0, Math.min(255, Math.round(x[k] * (1 - t) + y[k] * t)))
      .toString(16)
      .padStart(2, "0")
  return `#${c("r")}${c("g")}${c("b")}`
}

function luminance(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  const ch = (c: number) => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)
}

export function contrast(a: string, b: string): number {
  const l1 = luminance(a)
  const l2 = luminance(b)
  return Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100) / 100
}

export interface Check {
  label: string
  ratio: number
  target: number
  pass: boolean
}

/** The five-check quality gate shown in the Build panel. */
export function qualityGate(p: Palette) {
  const checks: Check[] = [
    { label: "Body text on background", ratio: contrast(p.ink, p.bg), target: 7 },
    { label: "Muted text on background", ratio: contrast(p.muted, p.bg), target: 4.5 },
    { label: "Muted text on surface", ratio: contrast(p.muted, p.surface), target: 4.5 },
    { label: "Button label on primary", ratio: contrast(p.onPrimary, p.primary), target: 4.5 },
    { label: "Accent on background", ratio: contrast(p.accent, p.bg), target: 3 },
  ].map((c) => ({ ...c, pass: c.ratio >= c.target }))
  const score = Math.round((checks.reduce((s, c) => s + Math.min(1, c.ratio / c.target), 0) / checks.length) * 100)
  return { score, checks, passed: checks.filter((c) => c.pass).length }
}

export function isGenome(v: unknown): v is Genome {
  if (!v || typeof v !== "object") return false
  return SWITCHES.every((s) => typeof (v as Record<string, unknown>)[s.id] === "string")
}

export const encodeGenome = (g: Genome) =>
  SWITCHES.map((s) => (g[s.id] === "native" ? "" : `${s.id}:${g[s.id]}`))
    .filter(Boolean)
    .join(",")

export function decodeGenome(raw: string | null): Genome {
  const g: Genome = { ...NATIVE }
  if (!raw) return g
  for (const part of raw.split(",")) {
    const [k, v] = part.split(":")
    const sw = SWITCHES.find((s) => s.id === k)
    if (sw && sw.options.some((o) => o.id === v)) g[sw.id] = v
  }
  return g
}
