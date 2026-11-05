/**
 * The Edition registry — the single source of truth for the SHELL's skin.
 *
 * Ported from OMNIFORGE (lib/editions.ts) and merged into Growth OS: an
 * Edition defines EVERY shell layer at once, so one click in the topbar
 * re-forges brand, type, colour, layout, material, detail and copy across
 * the library chrome, the forge landing and the catalogue — while the
 * template previews keep their own DNA (that is the Genome's job).
 *
 * Fonts resolve through the --gf-* next/font variables from app/layout.tsx.
 */

export type EditionId = "emerald" | "obsidian" | "nocturne" | "midhigh" | "agencyos" | "templateos" | "studioos"
export type Mode = "light" | "dark"

export type HeroLayout = "monument" | "editorial" | "cinema" | "blueprint" | "catalog" | "ledger"
export type Arrangement = "grid" | "list" | "mosaic"
export type Material = "plate" | "silk" | "ink" | "metal" | "paper" | "glass"
export type Detail = "numbering" | "foil" | "hairlines" | "blueprint" | "marker" | "scan"

export interface Palette {
  bg: string
  surface: string
  surface2: string
  ink: string
  muted: string
  line: string
  primary: string
  onPrimary: string
  accent: string
  onAccent: string
}

export interface LayerReadout {
  id: LayerId
  label: string
  value: string
  note: string
}

export type LayerId = "direction" | "voice" | "atmosphere" | "material" | "composition" | "detail" | "copy"

export interface Edition {
  id: EditionId
  name: string
  short: string
  lineage: string
  tagline: string
  nativeMode: Mode
  fonts: { display: string; body: string; label: string }
  display: { weight: number; tracking: string; transform: "none" | "uppercase"; style: "normal" | "italic" }
  radius: number
  palette: Record<Mode, Palette>
  hero: HeroLayout
  arrangement: Arrangement
  material: Material
  detail: Detail
  copy: {
    eyebrow: string
    headline: [string, string, string]
    sub: string
    cta: string
    ctaSecondary: string
    closing: string
    signature: string
  }
  layers: Record<LayerId, { value: string; note: string }>
}

const F = (v: string) => `var(--gf-${v})`

export const EDITIONS: Record<EditionId, Edition> = {
  emerald: {
    id: "emerald",
    name: "Emerald OS",
    short: "EM",
    lineage: "AI Superpowers · the merged default",
    tagline: "The intelligence layer's own skin — calm green, sharp type, live AI.",
    nativeMode: "light",
    fonts: { display: F("space-grotesk"), body: F("inter"), label: "Space Grotesk × Inter" },
    display: { weight: 600, tracking: "-0.02em", transform: "none", style: "normal" },
    radius: 12,
    palette: {
      light: {
        bg: "#f7fbf8", surface: "#ffffff", surface2: "#e6f4ec", ink: "#14201a", muted: "#4b5f55",
        line: "#d9e8de", primary: "#059669", onPrimary: "#ffffff", accent: "#34d399", onAccent: "#06301f",
      },
      dark: {
        bg: "#0c1210", surface: "#121a16", surface2: "#1a2420", ink: "#e8f2ec", muted: "#93a89c",
        line: "#223029", primary: "#34d399", onPrimary: "#06281b", accent: "#6ee7b7", onAccent: "#06281b",
      },
    },
    hero: "editorial",
    arrangement: "grid",
    material: "glass",
    detail: "foil",
    copy: {
      eyebrow: "One system · AI first",
      headline: ["Every superpower,", "one system,", "all live."],
      sub: "Eight AI skills wired straight into the Growth OS — chat, images, speech, vision, video, search and reading — then 23 finished templates, a 344-module playbook and a live forge, all re-forging in one click.",
      cta: "Open AI Studio",
      ctaSecondary: "Browse the library",
      closing: "Intelligence, engraved green.",
      signature: "EMERALD",
    },
    layers: {
      direction: { value: "Modern", note: "Calm green surfaces, confident contrast" },
      voice: { value: "Space Grotesk × Inter", note: "Technical display, neutral body" },
      atmosphere: { value: "Greenhouse", note: "Mint-white with emerald foil" },
      material: { value: "Glass", note: "Soft lifted cards, blurred depth" },
      composition: { value: "Editorial", note: "Left-weighted headline, stats rail" },
      detail: { value: "Emerald foil", note: "Gradient headline emphasis" },
      copy: { value: "Direct & capable", note: "Product-engineering tone" },
    },
  },
  obsidian: {
    id: "obsidian",
    name: "Obsidian & Brass",
    short: "OB",
    lineage: "In-house prestige atelier",
    tagline: "Engraved plates, foil prices, wax-seal receipts.",
    nativeMode: "light",
    fonts: { display: F("fraunces"), body: F("inter"), label: "Fraunces × Inter" },
    display: { weight: 600, tracking: "-0.02em", transform: "none", style: "normal" },
    radius: 10,
    palette: {
      light: {
        bg: "#f7f4ee", surface: "#fffdf8", surface2: "#efe9dd", ink: "#23201c", muted: "#6f665a",
        line: "#ddd3c1", primary: "#7a5c17", onPrimary: "#fffdf7", accent: "#b8913f", onAccent: "#1c1813",
      },
      dark: {
        bg: "#14110c", surface: "#1d1913", surface2: "#272118", ink: "#f2e9da", muted: "#a2937f",
        line: "#3a3226", primary: "#c9a227", onPrimary: "#14100c", accent: "#e2c27a", onAccent: "#14100c",
      },
    },
    hero: "monument",
    arrangement: "grid",
    material: "plate",
    detail: "numbering",
    copy: {
      eyebrow: "The library · Edition 2026",
      headline: ["Every template,", "finished", "before you buy it."],
      sub: "Pick a business, press one edition, and watch the whole system re-forge itself — type, colour, layout, material and copy. What you see is exactly what ships.",
      cta: "Browse the library",
      ctaSecondary: "See how it works",
      closing: "Engraved once. Delivered forever.",
      signature: "LIBRARY",
    },
    layers: {
      direction: { value: "Heritage", note: "Classic proportions, archival restraint" },
      voice: { value: "Fraunces × Inter", note: "Engraved serif display, neutral sans body" },
      atmosphere: { value: "Ivory Archive", note: "Museum ivory with brass foil" },
      material: { value: "Engraved plate", note: "Inset borders, soft lifted shadow" },
      composition: { value: "Centered monument", note: "Symmetry, ceremonial pacing" },
      detail: { value: "Archival numbering", note: "Edition numbers on every section" },
      copy: { value: "Assured & archival", note: "Calm, confident, collector tone" },
    },
  },
  nocturne: {
    id: "nocturne",
    name: "Nocturne",
    short: "NC",
    lineage: "Design map · candlelit pattern",
    tagline: "Candlelit serif, slow reveals, oxblood warmth.",
    nativeMode: "dark",
    fonts: { display: F("cormorant"), body: F("plex-sans"), label: "Cormorant × Plex Sans" },
    display: { weight: 500, tracking: "-0.01em", transform: "none", style: "italic" },
    radius: 18,
    palette: {
      light: {
        bg: "#f6efe3", surface: "#fbf6ee", surface2: "#ede2d0", ink: "#241a10", muted: "#76634f",
        line: "#dccbb2", primary: "#8a2f22", onPrimary: "#fff6ef", accent: "#a05a26", onAccent: "#fff6ef",
      },
      dark: {
        bg: "#100b08", surface: "#1a130d", surface2: "#241a12", ink: "#f2e7d8", muted: "#ad9882",
        line: "#3a2b1f", primary: "#d98e4a", onPrimary: "#160d07", accent: "#c0473a", onAccent: "#fff0ea",
      },
    },
    hero: "editorial",
    arrangement: "list",
    material: "silk",
    detail: "foil",
    copy: {
      eyebrow: "Twelve seats · One fire",
      headline: ["Your brand,", "by candlelight,", "in a single evening."],
      sub: "A slower, warmer edition. Soft silk surfaces, italic serifs and foil accents turn the same library into something you would book a table for.",
      cta: "Reserve a preview",
      ctaSecondary: "Read the menu",
      closing: "Lit once. Remembered long after.",
      signature: "NOCTURNE",
    },
    layers: {
      direction: { value: "Editorial", note: "Huge headlines, generous margins" },
      voice: { value: "Cormorant × Plex Sans", note: "Italic display, humanist body" },
      atmosphere: { value: "Oxblood Club", note: "Ember orange over deep umber" },
      material: { value: "Silk", note: "Soft gradients, large curves" },
      composition: { value: "Stacked editorial", note: "Single column, long reads" },
      detail: { value: "Foil accents", note: "Metallic sheen on key words" },
      copy: { value: "Warm & sensory", note: "Hospitality, invitation tone" },
    },
  },
  midhigh: {
    id: "midhigh",
    name: "Mid-to-High Dining",
    short: "MH",
    lineage: "Design map · restaurant engine",
    tagline: "Gallery-black, terracotta, zero-radius precision.",
    nativeMode: "dark",
    fonts: { display: F("cormorant"), body: F("inter"), label: "Cormorant caps × Inter" },
    display: { weight: 500, tracking: "0.06em", transform: "uppercase", style: "normal" },
    radius: 0,
    palette: {
      light: {
        bg: "#f4f2ef", surface: "#ffffff", surface2: "#e9e6e1", ink: "#141414", muted: "#5e5a55",
        line: "#d6d2cc", primary: "#a34a2c", onPrimary: "#ffffff", accent: "#141414", onAccent: "#ffffff",
      },
      dark: {
        bg: "#0a0a0a", surface: "#121212", surface2: "#1b1b1b", ink: "#ece8e2", muted: "#9a948b",
        line: "#2a2a2a", primary: "#c4643f", onPrimary: "#0a0a0a", accent: "#e4b93b", onAccent: "#0a0a0a",
      },
    },
    hero: "cinema",
    arrangement: "list",
    material: "ink",
    detail: "hairlines",
    copy: {
      eyebrow: "Plated · Precise · Private",
      headline: ["Gallery-black.", "Plated", "to the millimetre."],
      sub: "Photography leads, interface steps back. Zero radius, hairline rules and capitalised serifs give every template the composure of a tasting menu.",
      cta: "View the collection",
      ctaSecondary: "Book a walkthrough",
      closing: "Nothing extra on the plate.",
      signature: "DINING",
    },
    layers: {
      direction: { value: "Gallery", note: "Image first, tiny captions" },
      voice: { value: "Cormorant caps × Inter", note: "Wide-tracked capitals" },
      atmosphere: { value: "Charcoal Studio", note: "Gallery-black with terracotta" },
      material: { value: "Matte ink", note: "Flat, print-like, no gloss" },
      composition: { value: "Full-bleed cinema", note: "Photography edge to edge" },
      detail: { value: "Hairline rules", note: "1px structure at precise spacing" },
      copy: { value: "Spare & precise", note: "Short lines, menu cadence" },
    },
  },
  agencyos: {
    id: "agencyos",
    name: "Agency OS",
    short: "AO",
    lineage: "Design map · agency-os hub",
    tagline: "Swiss grid, eyebrow dashes, ember CTAs.",
    nativeMode: "dark",
    fonts: { display: F("space-grotesk"), body: F("dm-sans"), label: "Space Grotesk × DM Sans" },
    display: { weight: 700, tracking: "-0.035em", transform: "uppercase", style: "normal" },
    radius: 2,
    palette: {
      light: {
        bg: "#fafafa", surface: "#ffffff", surface2: "#efefef", ink: "#0a0a0c", muted: "#55565c",
        line: "#dcdcdf", primary: "#c23d12", onPrimary: "#ffffff", accent: "#8a6e2b", onAccent: "#ffffff",
      },
      dark: {
        bg: "#0a0a0c", surface: "#121317", surface2: "#1a1b20", ink: "#f5f5f0", muted: "#8a8f98",
        line: "#262830", primary: "#ff5722", onPrimary: "#0a0a0c", accent: "#d4af37", onAccent: "#0a0a0c",
      },
    },
    hero: "blueprint",
    arrangement: "grid",
    material: "metal",
    detail: "blueprint",
    copy: {
      eyebrow: "— Production OS · v4.2",
      headline: ["Ship the", "system,", "not the mockup."],
      sub: "Blueprint grid underfoot, brushed-metal panels and kinetic grotesk type. The same library, re-specified as a production operating system for agencies.",
      cta: "Deploy a template",
      ctaSecondary: "Read the spec",
      closing: "Specified. Shipped. Measured.",
      signature: "SYSTEM",
    },
    layers: {
      direction: { value: "Architectural", note: "Strict grid, technical captions" },
      voice: { value: "Space Grotesk × DM Sans", note: "Tight grotesk capitals" },
      atmosphere: { value: "Midnight Instrument", note: "Carbon with ember and brass" },
      material: { value: "Brushed metal", note: "Fine gradient, precise hairlines" },
      composition: { value: "Grid ledger", note: "Visible structure, split hero" },
      detail: { value: "Blueprint grid", note: "Engineering grid underfoot" },
      copy: { value: "Direct & technical", note: "Imperative, spec-sheet tone" },
    },
  },
  templateos: {
    id: "templateos",
    name: "Template OS",
    short: "TO",
    lineage: "Design map · template-os source",
    tagline: "Warm dark, lime primary, catalogue chrome.",
    nativeMode: "dark",
    fonts: { display: F("syne"), body: F("manrope"), label: "Syne × Manrope" },
    display: { weight: 700, tracking: "-0.03em", transform: "none", style: "normal" },
    radius: 22,
    palette: {
      light: {
        bg: "#faf6ee", surface: "#fffdf8", surface2: "#f0eadc", ink: "#26231e", muted: "#6b665b",
        line: "#e1d9c8", primary: "#3f6212", onPrimary: "#f7fee7", accent: "#b35b3b", onAccent: "#fffaf5",
      },
      dark: {
        bg: "#1f1d1a", surface: "#292622", surface2: "#33302b", ink: "#f0ede6", muted: "#aaa597",
        line: "#3d3934", primary: "#a3e635", onPrimary: "#1a2e05", accent: "#e07a55", onAccent: "#1f1d1a",
      },
    },
    hero: "catalog",
    arrangement: "mosaic",
    material: "paper",
    detail: "marker",
    copy: {
      eyebrow: "The catalogue · 23 templates",
      headline: ["A catalogue that", "sells itself", "while you sleep."],
      sub: "Big rounded cards, lime marker sweeps and a mosaic layout built for browsing. The commercial edition — made to turn visitors into buyers.",
      cta: "Shop the catalogue",
      ctaSecondary: "Compare tiers",
      closing: "Browse it. Love it. Buy it.",
      signature: "CATALOG",
    },
    layers: {
      direction: { value: "Atelier", note: "Handcrafted warmth, friendly" },
      voice: { value: "Syne × Manrope", note: "Expressive display, round body" },
      atmosphere: { value: "Lime Botanical", note: "Warm dark with lime marker" },
      material: { value: "Paper", note: "Warm cards, subtle depth" },
      composition: { value: "Modular mosaic", note: "Card-based, content-dense" },
      detail: { value: "Marker sweeps", note: "Highlighter on key phrases" },
      copy: { value: "Commercial & upbeat", note: "Benefit-led, retail tone" },
    },
  },
  studioos: {
    id: "studioos",
    name: "Studio OS",
    short: "SO",
    lineage: "OmniForge OS · uploaded source",
    tagline: "Rule grid, film band, glass and pulse rings.",
    nativeMode: "dark",
    fonts: { display: F("fraunces"), body: F("inter"), label: "Fraunces italic × Inter" },
    display: { weight: 400, tracking: "-0.03em", transform: "none", style: "italic" },
    radius: 6,
    palette: {
      light: {
        bg: "#f4f0e8", surface: "#fbf8f2", surface2: "#e9e3d7", ink: "#26211a", muted: "#6c6455",
        line: "#d8cfbe", primary: "#7d6120", onPrimary: "#fffaf0", accent: "#4a6b8a", onAccent: "#ffffff",
      },
      dark: {
        bg: "#0b0908", surface: "#151210", surface2: "#1e1a16", ink: "#f6f1e4", muted: "#9c9485",
        line: "#2c2620", primary: "#dcab59", onPrimary: "#140f07", accent: "#7fb2d9", onAccent: "#06121c",
      },
    },
    hero: "ledger",
    arrangement: "grid",
    material: "glass",
    detail: "scan",
    copy: {
      eyebrow: "Studio OS · Live",
      headline: ["The template", "operating system", "for studios."],
      sub: "Glass panels, rule-grid plates and a running film band. The edition for studios that sell many templates and need one console to show them all.",
      cta: "Open the console",
      ctaSecondary: "Watch the reel",
      closing: "One console. Every template.",
      signature: "STUDIO",
    },
    layers: {
      direction: { value: "Futurist", note: "Luminous accents, dark surfaces" },
      voice: { value: "Fraunces italic × Inter", note: "Light italic display" },
      atmosphere: { value: "Studio Night", note: "Near-black with gold and ice" },
      material: { value: "Glass", note: "Translucent, blurred depth" },
      composition: { value: "Ledger console", note: "Stats rail beside the headline" },
      detail: { value: "Scan & ticker", note: "Film band and scan line" },
      copy: { value: "Confident & modern", note: "Product-console tone" },
    },
  },
}

export const EDITION_ORDER: EditionId[] = ["emerald", "obsidian", "nocturne", "midhigh", "agencyos", "templateos", "studioos"]
export const DEFAULT_EDITION: EditionId = "emerald"

export const LAYER_ORDER: { id: LayerId; label: string; scope: string }[] = [
  { id: "direction", label: "Creative direction", scope: "Hero layout, pacing, section order" },
  { id: "voice", label: "Typographic voice", scope: "Display, body, weight, case, tracking" },
  { id: "atmosphere", label: "Colour atmosphere", scope: "Surfaces, ink, primary, accent" },
  { id: "material", label: "Material & finish", scope: "Cards, borders, shadows, blur" },
  { id: "composition", label: "Composition", scope: "Grid, list or mosaic arrangement" },
  { id: "detail", label: "Detail signature", scope: "Emphasis, motifs, backdrops" },
  { id: "copy", label: "Copy voice", scope: "Headlines, CTAs, closing lines" },
]

export function isEditionId(v: unknown): v is EditionId {
  return typeof v === "string" && v in EDITIONS
}
export function isMode(v: unknown): v is Mode {
  return v === "light" || v === "dark"
}

export function resolveMode(id: EditionId, choice: Mode | null): Mode {
  return choice ?? EDITIONS[id].nativeMode
}

function materialVars(m: Material, p: Palette, mode: Mode): Record<string, string> {
  const dark = mode === "dark"
  switch (m) {
    case "plate":
      return {
        "--ed-card-bg": p.surface,
        "--ed-card-border": p.line,
        "--ed-card-shadow": dark
          ? "inset 0 1px 0 rgba(255,255,255,0.04), 0 10px 30px -12px rgba(0,0,0,0.6)"
          : "inset 0 1px 0 rgba(255,255,255,0.9), 0 10px 30px -14px rgba(60,45,20,0.25)",
        "--ed-card-blur": "none",
      }
    case "silk":
      return {
        "--ed-card-bg": `linear-gradient(160deg, ${p.surface} 0%, ${p.surface2} 100%)`,
        "--ed-card-border": "transparent",
        "--ed-card-shadow": dark ? "0 24px 60px -24px rgba(0,0,0,0.7)" : "0 24px 50px -24px rgba(90,50,20,0.3)",
        "--ed-card-blur": "none",
      }
    case "ink":
      return {
        "--ed-card-bg": p.surface,
        "--ed-card-border": p.line,
        "--ed-card-shadow": "none",
        "--ed-card-blur": "none",
      }
    case "metal":
      return {
        "--ed-card-bg": `linear-gradient(180deg, ${p.surface2} 0%, ${p.surface} 60%)`,
        "--ed-card-border": p.line,
        "--ed-card-shadow": dark
          ? "inset 0 1px 0 rgba(255,255,255,0.06)"
          : "inset 0 1px 0 #ffffff, 0 1px 2px rgba(0,0,0,0.06)",
        "--ed-card-blur": "none",
      }
    case "paper":
      return {
        "--ed-card-bg": p.surface,
        "--ed-card-border": p.line,
        "--ed-card-shadow": dark ? "0 2px 0 rgba(0,0,0,0.35)" : "0 2px 0 rgba(60,50,30,0.08)",
        "--ed-card-blur": "none",
      }
    case "glass":
      return {
        "--ed-card-bg": dark ? "rgba(30,26,22,0.55)" : "rgba(255,252,246,0.6)",
        "--ed-card-border": dark ? "rgba(246,241,228,0.1)" : "rgba(38,33,26,0.12)",
        "--ed-card-shadow": dark ? "0 20px 50px -20px rgba(0,0,0,0.8)" : "0 20px 40px -20px rgba(40,30,10,0.2)",
        "--ed-card-blur": "blur(14px)",
      }
  }
}

function detailVars(d: Detail, p: Palette): Record<string, string> {
  switch (d) {
    case "foil":
    case "scan":
      return {
        "--ed-emph-bg": `linear-gradient(100deg, ${p.primary} 0%, ${p.accent} 50%, ${p.primary} 100%)`,
        "--ed-emph-clip": "text",
        "--ed-emph-color": "transparent",
        "--ed-emph-deco": "none",
      }
    case "marker":
      return {
        "--ed-emph-bg": `linear-gradient(transparent 58%, color-mix(in srgb, ${p.primary} 55%, transparent) 58%)`,
        "--ed-emph-clip": "border-box",
        "--ed-emph-color": "inherit",
        "--ed-emph-deco": "none",
      }
    case "hairlines":
      return {
        "--ed-emph-bg": "none",
        "--ed-emph-clip": "border-box",
        "--ed-emph-color": p.primary,
        "--ed-emph-deco": "underline",
      }
    case "blueprint":
      return {
        "--ed-emph-bg": "none",
        "--ed-emph-clip": "border-box",
        "--ed-emph-color": p.primary,
        "--ed-emph-deco": "none",
      }
    case "numbering":
      return {
        "--ed-emph-bg": `linear-gradient(100deg, ${p.primary} 0%, ${p.accent} 60%, ${p.primary} 100%)`,
        "--ed-emph-clip": "text",
        "--ed-emph-color": "transparent",
        "--ed-emph-deco": "none",
      }
  }
}

/** Every CSS variable an edition controls, resolved for a mode. */
export function editionVars(id: EditionId, mode: Mode): Record<string, string> {
  const e = EDITIONS[id]
  const p = e.palette[mode]
  return {
    "--background": p.bg,
    "--foreground": p.ink,
    "--card": p.surface,
    "--card-foreground": p.ink,
    "--popover": p.surface,
    "--popover-foreground": p.ink,
    "--primary": p.primary,
    "--primary-foreground": p.onPrimary,
    "--secondary": p.surface2,
    "--secondary-foreground": p.ink,
    "--muted": p.surface2,
    "--muted-foreground": p.muted,
    "--accent": p.accent,
    "--accent-foreground": p.onAccent,
    "--border": p.line,
    "--input": p.line,
    "--ring": p.primary,
    "--radius": `${e.radius}px`,
    "--ed-font-display": e.fonts.display,
    "--ed-font-body": e.fonts.body,
    "--ed-display-weight": String(e.display.weight),
    "--ed-display-tracking": e.display.tracking,
    "--ed-display-transform": e.display.transform,
    "--ed-display-style": e.display.style,
    ...materialVars(e.material, p, mode),
    ...detailVars(e.detail, p),
  }
}

export function layerReadout(id: EditionId): LayerReadout[] {
  const e = EDITIONS[id]
  return LAYER_ORDER.map((l) => ({ id: l.id, label: l.label, ...e.layers[l.id] }))
}

export const EDITION_STORAGE_KEY = "gos:edition"
export const MODE_STORAGE_KEY = "gos:mode"

/* ── edition → site presets ─────────────────────────────────────────
 * The editions were shell-only; now one click re-forges the TEMPLATE
 * PREVIEWS too. Each edition carries a curated site genome preset —
 * the same seven switches the genome panel exposes — merged under the
 * user's own switches (an explicit user choice always wins). Disable
 * via the toggle in the topbar to compare a template's native DNA.
 */
import type { Genome } from "./genome"

export interface EditionSitePreset {
  /** genome defaults this edition presses onto template previews */
  genome: Partial<Genome>
  /** one-line readout for the topbar toggle */
  note: string
}

export const EDITION_SITE: Record<EditionId, EditionSitePreset> = {
  emerald: {
    genome: { atmosphere: "botanical", voice: "technical", material: "crisp", density: "airy" },
    note: "Deep botanical green, Space Grotesk data voice, crisp plates",
  },
  obsidian: {
    genome: { atmosphere: "champagne", voice: "humanist", material: "soft", density: "airy" },
    note: "Champagne warmth, Fraunces voice, soft corners",
  },
  nocturne: {
    genome: { atmosphere: "oxblood", voice: "serif", light: "dark", material: "soft", density: "airy" },
    note: "Oxblood evening, candlelit serif, soft corners",
  },
  midhigh: {
    genome: { atmosphere: "charcoal", voice: "contrast", light: "dark", material: "crisp", density: "compact" },
    note: "Gallery charcoal, Playfair contrast, zero radius",
  },
  agencyos: {
    genome: { atmosphere: "charcoal", voice: "grotesk", material: "crisp", density: "compact" },
    note: "Swiss neutral grotesque, crisp plates, tight rhythm",
  },
  templateos: {
    genome: { atmosphere: "midnight", voice: "technical", light: "dark", material: "crisp" },
    note: "Midnight technical, Space Grotesk data voice",
  },
  studioos: {
    genome: { atmosphere: "midnight", voice: "technical", material: "crisp", contrast: "high" },
    note: "Instrument midnight, technical voice, high contrast",
  },
}

export const EDITION_SITE_STORAGE_KEY = "gos:edition-sites"
