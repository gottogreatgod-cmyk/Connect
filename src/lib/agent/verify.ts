// ─── Verification layer: structural + richness checks before "done" ──────
import type { CheckResult, Verification } from "@/lib/gos/types"

export function verifyHtml(html: string): Verification {
  const checks: CheckResult[] = []
  const add = (id: string, label: string, pass: boolean, detail?: string) =>
    checks.push({ id, label, pass, detail })

  // ── structure ──────────────────────────────────────────────────────────
  add(
    "doctype",
    "HTML5 doctype",
    /^\s*<!doctype\s+html>/i.test(html.trim()),
  )
  add(
    "title",
    "Page title",
    /<title>[^<]{3,}<\/title>/i.test(html),
  )
  add(
    "meta-description",
    "Meta description",
    /<meta\s+name=["']description["'][^>]*content=["'][^"']{10,}/i.test(html),
  )
  add(
    "viewport",
    "Responsive viewport",
    /<meta\s+name=["']viewport["']/i.test(html),
  )

  const sections = (html.match(/<section[\s>]/gi) ?? []).length
  const hasHeader = /<header[\s>]/i.test(html)
  const hasFooter = /<footer[\s>]/i.test(html)
  add(
    "structure",
    "Header + 4+ sections + footer",
    sections >= 4 && hasHeader && hasFooter,
    `${sections} section${sections === 1 ? "" : "s"}, header ${hasHeader ? "✓" : "✗"}, footer ${hasFooter ? "✓" : "✗"}`,
  )

  const placeholders =
    /lorem ipsum|your text here|insert your|placeholder text|todo:/i.exec(html)
  add(
    "copy",
    "No placeholder copy",
    !placeholders,
    placeholders ? `found "${placeholders[0]}"` : undefined,
  )

  // ── hero composition ───────────────────────────────────────────────────
  const heroMatch = html.match(/<section[^>]*class=["'][^"']*hero[^"']*["'][^>]*>[\s\S]{0,4000}?<\/section>/i)
  const heroHtml = heroMatch?.[0] ?? ""
  const heroHasH1 = /<h1[\s>]/i.test(heroHtml)
  const heroVisual =
    /<svg[\s>]/i.test(heroHtml) ||
    /gradient\(/i.test(heroHtml) ||
    /class=["'][^"']*hero-visual/i.test(heroHtml)
  add(
    "hero",
    "Hero: statement + visual composition",
    heroHasH1 && heroVisual,
    heroHasH1 ? (heroVisual ? undefined : "no visual element in hero") : "no h1 in hero",
  )

  // ── visual richness ────────────────────────────────────────────────────
  const svgCount = (html.match(/<svg[\s>]/gi) ?? []).length
  const gradientCount = (html.match(/gradient\(/gi) ?? []).length
  add(
    "richness",
    "Visual richness (3+ SVG, gradients)",
    svgCount >= 3 && gradientCount >= 1,
    `${svgCount} svg · ${gradientCount} gradient${gradientCount === 1 ? "" : "s"}`,
  )

  const statMatch = (html.match(/class=["'][^"']*stat[^"']*["']/gi) ?? []).length
  const hasMarquee = /marquee/i.test(html)
  const hasQuotes = /class=["'][^"']*quote/i.test(html)
  const devices = [statMatch >= 2, hasMarquee, hasQuotes, svgCount >= 5].filter(Boolean).length
  add(
    "devices",
    "Craft devices (stats · marquee · quotes)",
    devices >= 2,
    `${devices} device${devices === 1 ? "" : "s"} in place`,
  )

  // ── motion craft ───────────────────────────────────────────────────────
  const hasMotion =
    /@keyframes/.test(html) && (/transition\s*:/.test(html) || /animation\s*:/i.test(html))
  const hasReducedMotion = /prefers-reduced-motion/i.test(html)
  const hasEasing = /cubic-bezier/.test(html)
  add(
    "motion",
    "Motion craft + reduced-motion respect",
    hasMotion && hasReducedMotion,
    hasEasing ? "custom easings ✓" : undefined,
  )

  // ── typography ─────────────────────────────────────────────────────────
  add(
    "fonts",
    "Distinctive typography",
    /fonts\.googleapis\.com/i.test(html) && !/font-family:\s*('?arial|system-ui)/i.test(html),
  )
  add(
    "fluid-type",
    "Fluid type scale (clamp)",
    /clamp\(/i.test(html),
  )

  // ── substance & self-containment ───────────────────────────────────────
  const sizeKb = Math.round(html.length / 1024)
  add(
    "substance",
    "Substantial document (≥ 8KB)",
    html.length >= 8000,
    `${sizeKb}KB`,
  )

  const imgTags = (html.match(/<img[\s>]/gi) ?? []).length
  add(
    "self-contained",
    "No image file dependencies",
    imgTags === 0,
    imgTags === 0 ? undefined : `${imgTags} <img> tag${imgTags === 1 ? "" : "s"}`,
  )

  const interactive =
    /:hover/i.test(html) + (/details[\s>]/i.test(html) ? 1 : 0) + (/focus-visible/i.test(html) ? 1 : 0)
  add(
    "interactive",
    "Interactivity (hover · details · focus)",
    interactive >= 2,
    `${interactive}/3 signals`,
  )

  const score = Math.round((checks.filter((c) => c.pass).length / checks.length) * 100)
  return { score, checks }
}
