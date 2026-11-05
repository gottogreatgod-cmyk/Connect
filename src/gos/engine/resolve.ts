import { ATMOSPHERES, VOICES, mix, type Genome, type Mode, type Palette } from "./genome"
import type { TemplateDef } from "./registry"
import { tierOf } from "./tiers"

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

/** Template DNA + genome switches → the final token set the site renders with. */
export function resolve(t: TemplateDef, g: Genome): Resolved {
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
  const cap = tierOf(t.tier).motionCap
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

/** Write the token contract onto an element (the renderer's <html>). */
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
  set("--mono", "'JetBrains Mono', ui-monospace, monospace")
  set("--r", `${r.radius}px`)
  set("--d", String(r.density))
  set("--dur", `${[0, 160, 320, 520][r.motion]}ms`)
  el.dataset.motion = String(r.motion)
  el.dataset.mode = r.mode
  el.style.colorScheme = r.mode
}
