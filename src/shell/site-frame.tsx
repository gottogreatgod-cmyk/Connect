"use client"

/**
 * SiteFrame — the inline renderer. Loads ONE template inside a container
 * that owns the token contract (.gos-site), applies genome tokens to that
 * container (never to <html> — the shell owns the document), and provides
 * the SiteContext (page routing, motion, tier, embedded flag).
 *
 * This replaces the old iframe + postMessage bridge: same isolation via
 * scoped CSS (every template stylesheet is namespaced under its root
 * class), zero double-load, and the genome still can't break a layout.
 *
 * New cross-cutting tools:
 *   · tier — the EFFECTIVE tier (tier morphing); overrides the template's
 *     native tier for resolve() + SiteContext, so pages filter, TierGate
 *     sections gate and motion caps follow the ladder step.
 *   · fontScale — site-wide typography scale (A− / A+). Template CSS is
 *     px-based, so the scale is applied by walking the DOM: strip inline
 *     sizes, read the true computed base, write base × scale. A scoped
 *     MutationObserver catches content that appears later.
 *   · editMode — click-to-edit text. Delegated capture handler finds the
 *     nearest text-bearing element and makes it contentEditable while
 *     suppressing site navigation, so every preview is copy-editable.
 */
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, type CSSProperties, type ReactNode } from "react"
import { applyTokens, resolve } from "@/engine/resolve"
import type { Genome } from "@/engine/genome"
import type { TemplateDef } from "@/engine/registry"
import type { TierId } from "@/engine/tiers"
import { SITES } from "@/sites"
import { SiteContext } from "@/sites/kit/site-kit"
import "@/sites/kit/site-base.css"

const TEXT_SELECTOR =
  "h1,h2,h3,h4,h5,h6,p,li,blockquote,figcaption,dt,dd,th,td,label,summary,button,a,span"

export function SiteFrame({
  tpl,
  genome,
  page,
  onPage,
  width,
  height,
  style,
  className = "",
  tier,
  fontScale = 1,
  editMode = false,
  remountKey,
  insertTop,
  insertBottom,
}: {
  tpl: TemplateDef
  genome: Genome
  page: string
  onPage?: (p: string) => void
  width?: number | string
  height?: number | string
  style?: CSSProperties
  className?: string
  /** effective tier — the morph ladder step (defaults to the template's own) */
  tier?: TierId
  /** site-wide typography scale, 0.8 – 1.3 */
  fontScale?: number
  /** click-to-edit text on this preview */
  editMode?: boolean
  /** change to force a clean re-mount (wipes in-place text edits) */
  remountKey?: string | number
  /** composed into the same .gos-site flow, inside the token contract — the module forge mounts modules here so they render native */
  insertTop?: ReactNode
  insertBottom?: ReactNode
}) {
  const effectiveTier = tier ?? tpl.tier
  const resolved = useMemo(() => resolve(tpl, genome, effectiveTier), [tpl, genome, effectiveTier])
  const ref = useRef<HTMLDivElement>(null)
  const Site = SITES[tpl.slug]

  /* tokens before paint */
  useLayoutEffect(() => {
    if (ref.current) applyTokens(ref.current, resolved)
  }, [resolved])

  const ctx = useMemo(
    () => ({
      page,
      go: (p: string) => {
        onPage?.(p)
        if (!onPage) window.scrollTo({ top: 0, behavior: "auto" })
      },
      motion: resolved.motion,
      tier: tpl.tier,
      tierStep: effectiveTier,
      embedded: true,
    }),
    [page, onPage, resolved.motion, tpl.tier, effectiveTier],
  )

  /* ── typography scale ──────────────────────────────────────────── */
  /* Idempotent walk: strip every inline size FIRST (so computed falls
     back to the template's own px — never a previously scaled value),
     then write base × scale. Template CSS is px-based and carries no
     inline HTML font sizes, so this is safe to run any number of
     times, on any mutation. */
  const walkScale = (scale: number) => {
    const root = ref.current
    if (!root) return
    for (const el of root.querySelectorAll<HTMLElement>(TEXT_SELECTOR)) {
      if (scale === 1) {
        el.style.fontSize = ""
        continue
      }
      el.style.fontSize = ""
      const base = parseFloat(getComputedStyle(el).fontSize)
      if (Number.isFinite(base)) el.style.fontSize = `${Math.round(base * scale * 100) / 100}px`
    }
  }

  useEffect(() => {
    if (fontScale === 1) {
      walkScale(1)
      return
    }
    const id = window.setTimeout(() => walkScale(fontScale), 60)
    return () => window.clearTimeout(id)
  }, [fontScale, page, tpl.slug, genome, effectiveTier, remountKey])

  /* catch content that mounts after the walk (accordions, tabs, reveals,
     conditional sections). contentEditable typing also mutates the tree —
     the strip-first walk keeps it honest without flicker because the
     edited element's computed size is re-derived from its CSS class. */
  useEffect(() => {
    const root = ref.current
    if (!root || fontScale === 1) return
    let t = 0
    const mo = new MutationObserver(() => {
      window.clearTimeout(t)
      t = window.setTimeout(() => walkScale(fontScale), 200)
    })
    mo.observe(root, { childList: true, subtree: true })
    return () => {
      window.clearTimeout(t)
      mo.disconnect()
    }
  }, [fontScale])

  /* ── click-to-edit text ────────────────────────────────────────── */
  useEffect(() => {
    const root = ref.current
    if (!root || !editMode) return
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const el = target.closest<HTMLElement>(TEXT_SELECTOR)
      if (!el || !root.contains(el)) return
      e.preventDefault()
      e.stopPropagation()
      if (el.isContentEditable) return
      el.contentEditable = "true"
      el.dataset.edited = ""
      el.focus()
      /* caret near the click point */
      const range = document.caretRangeFromPoint?.(e.clientX, e.clientY)
      if (range) {
        const sel = window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(range)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") (document.activeElement as HTMLElement | null)?.blur()
    }
    /* capture so no template handler (nav, go()) fires while editing */
    root.addEventListener("click", onClick, true)
    root.addEventListener("keydown", onKey)
    return () => {
      root.removeEventListener("click", onClick, true)
      root.removeEventListener("keydown", onKey)
      for (const el of root.querySelectorAll<HTMLElement>("[contenteditable='true']")) el.contentEditable = "false"
    }
  }, [editMode])

  return (
    <div
      ref={ref}
      className={`gos-site ${className}`}
      data-slug={tpl.slug}
      data-edit={editMode ? "on" : undefined}
      style={{ width, minHeight: height, ...style }}
      aria-label={`${tpl.name} live preview`}
    >
      <SiteContext.Provider value={ctx}>
        {insertTop}
        <Suspense
          fallback={
            <div className="gos-loading" role="status">
              Loading {tpl.name}…
            </div>
          }
        >
          {Site ? <Site key={`${tpl.slug}-${remountKey ?? 0}`} /> : null}
        </Suspense>
        {insertBottom}
      </SiteContext.Provider>
    </div>
  )
}
