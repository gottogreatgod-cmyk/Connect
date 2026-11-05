import { ATMOSPHERES, VOICES, contrast, mix, type Genome, type Mode, type Palette } from "./genome"
import type { TemplateDef } from "./registry"
import { tierOf, type TierId } from "./tiers"

export interface Resolved {
  mode: Mode
  palette: Palette
  display: string
  body: string
  radius: number
  density: number
  motion: 0 | 1 | 2 | 3
  motionCap: 0 | 1 | 2 | 3
}

/** Template DNA + genome switches → the final token set the site renders with.
 *  `tier` overrides the template's native tier — the tier morph ladder uses
 *  this so the SAME design can render Starter → Flagship: motion caps and
 *  the honest tier promise follow the effective step. */
export function resolve(t: TemplateDef, g: Genome, tier: TierId = t.tier): Resolved {
  const mode: Mode = g.light === "light" || g.light === "dark" ? g.light : t.mode
  const atmos = ATMOSPHERES.find((a) => a.id === g.atmosphere)
  let palette: Palette = atmos ? atmos[mode] : t[mode]

  if (g.contrast === "high") {
    palette = {
      ...palette,
      muted: mix(palette.muted, palette.ink, 0.5),
      line: mix(palette.line, palette.ink, 0.25),
    }
  }

  const voice = VOICES.find((v) => v.id === g.voice)
  const radius = g.material === "crisp" ? 0 : g.material === "soft" ? Math.max(14, t.radius * 1.6) : t.radius
  const density = g.density === "compact" ? 0.72 : g.density === "airy" ? 1.3 : 1
  const cap = tierOf(tier).motionCap
  const motion = (g.motion === "still" ? 0 : g.motion === "subtle" ? Math.min(1, cap) : cap) as Resolved["motion"]

  return {
    mode,
    palette,
    display: voice?.display ?? t.voice.display,
    body: voice?.body ?? t.voice.body,
    radius,
    density,
    motion,
    motionCap: cap,
  }
}

/**
 * Write the token contract onto a CONTAINER element (not <html> — the
 * library shell owns the document; each site preview owns its subtree).
 * The site base css scopes every reset + motion contract under .gos-site.
 */
export function applyTokens(el: HTMLElement, r: Resolved) {
  const p = r.palette
  const set = (k: string, v: string) => el.style.setProperty(k, v)
  set("--bg", p.bg)
  set("--surface", p.surface)
  set("--ink", p.ink)
  set("--muted", p.muted)
  set("--line", p.line)
  set("--primary", p.primary)
  set("--on-primary", p.onPrimary)
  set("--accent", p.accent)
  set("--display", r.display)
  set("--body", r.body)
  set("--mono", "var(--gf-jetbrains-mono, ui-monospace), ui-monospace, monospace")
  set("--r", `${r.radius}px`)
  set("--d", String(r.density))
  set("--dur", `${[0, 160, 320, 520][r.motion]}ms`)
  el.dataset.motion = String(r.motion)
  el.dataset.mode = r.mode

  /* ── the factory bridge ──────────────────────────────────────────
     The same resolved palette + voice, projected onto the shadcn
     variable namespace. Module-built sites and the factory kit render
     through shadcn utilities (bg-background, text-muted-foreground…),
     so this bridge makes them honor the SAME token contract as the
     21 token-built templates — genome switches re-skin them too.
     Brand roots (.brand-*) may still override --primary etc. on their
     own subtree: brand identity survives the re-forge. */
  const mutedBg = mix(p.bg, p.ink, 0.07)
  const onAccent = contrast(p.accent, p.bg) >= contrast(p.accent, p.ink) ? p.bg : p.ink
  set("--background", p.bg)
  set("--foreground", p.ink)
  set("--card", p.surface)
  set("--card-foreground", p.ink)
  set("--popover", p.surface)
  set("--popover-foreground", p.ink)
  set("--primary", p.primary)
  set("--primary-foreground", p.onPrimary)
  set("--secondary", mix(p.bg, p.ink, 0.1))
  set("--secondary-foreground", p.ink)
  set("--muted-foreground", p.muted)
  set("--accent-foreground", onAccent)
  set("--border", p.line)
  set("--input", p.line)
  set("--ring", p.primary)
  set("--radius", `${r.radius}px`)
  set("--font-sans", "var(--body)")
}
