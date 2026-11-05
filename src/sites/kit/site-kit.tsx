"use client"

import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react"
import { TIER_ORDER, type TierId } from "@/engine/tiers"

/**
 * The site kit — behaviour only, never visuals. Every template draws its
 * own buttons, inputs and cards; the kit just gives them routing, motion
 * gating and honest form validation so each flow actually works.
 *
 * Ported from the Growth OS renderer: `embedded` is true whenever the site
 * renders inside the library stage or the full-bleed site view.
 */

export interface SiteCtx {
  page: string
  go: (page: string) => void
  motion: 0 | 1 | 2 | 3
  /** the template's native product tier */
  tier: TierId
  /** the EFFECTIVE tier this render is running at — the tier morph ladder. */
  tierStep: TierId
  embedded: boolean
}

export const SiteContext = createContext<SiteCtx>({ page: "home", go: () => {}, motion: 0, tier: "low", tierStep: "low", embedded: false })
export const useSite = () => useContext(SiteContext)

export const tierRank = (t: TierId) => TIER_ORDER.indexOf(t)

/**
 * TierGate — the tier morph primitive. Wrap any optional section:
 *
 *   <TierGate need="business">…portal, gallery, commerce…</TierGate>
 *
 * The section renders only when the effective tier step has reached
 * `need`, so ONE design walks Starter → Flagship by adding depth
 * instead of swapping to a different site.
 */
export function TierGate({ need, children }: { need: TierId; children: ReactNode }) {
  const { tierStep } = useSite()
  if (tierRank(tierStep) < tierRank(need)) return null
  return <>{children}</>
}

/** Inverse gate — content only the simplest tiers show (e.g. a call-to-order block the flagship replaces with a live flow). */
export function TierBelow({ need, children }: { need: TierId; children: ReactNode }) {
  const { tierStep } = useSite()
  if (tierRank(tierStep) >= tierRank(need)) return null
  return <>{children}</>
}

/** Scroll-reveal that only exists at tiers (and genome settings) that allow motion ≥ 2. */
export function Reveal({
  as: Tag = "div",
  delay = 0,
  className,
  style,
  children,
}: {
  as?: ElementType
  delay?: number
  className?: string
  style?: CSSProperties
  children: ReactNode
}) {
  const { motion } = useSite()
  const ref = useRef<HTMLElement>(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    if (motion < 2 || !ref.current) return
    const el = ref.current
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          setShown(true)
          io.disconnect()
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [motion])
  const animated = motion >= 2
  return (
    <Tag
      ref={ref}
      className={className}
      data-reveal={animated ? "" : undefined}
      data-in={animated && shown ? "" : undefined}
      style={animated ? { ...style, transitionDelay: `${delay}ms` } : style}
    >
      {children}
    </Tag>
  )
}

/** Pointer position as CSS vars on an element — for cursor light at motion 3. */
export function usePointerVars<T extends HTMLElement>(enabled: boolean) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!enabled || !el) return
    let raf = 0
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect()
        el.style.setProperty("--mx", `${e.clientX - r.left}px`)
        el.style.setProperty("--my", `${e.clientY - r.top}px`)
      })
    }
    el.addEventListener("pointermove", onMove)
    return () => {
      el.removeEventListener("pointermove", onMove)
      cancelAnimationFrame(raf)
    }
  }, [enabled])
  return ref
}

/** Scroll progress (0–1) of an element through the viewport. */
export function useScrollProgress<T extends HTMLElement>(enabled: boolean) {
  const ref = useRef<T>(null)
  const [p, setP] = useState(0)
  useEffect(() => {
    if (!enabled) return
    let raf = 0
    const tick = () => {
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const total = r.height - window.innerHeight
      setP(total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0)
    }
    const on = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(tick)
    }
    tick()
    window.addEventListener("scroll", on, { passive: true })
    window.addEventListener("resize", on)
    return () => {
      window.removeEventListener("scroll", on)
      window.removeEventListener("resize", on)
    }
  }, [enabled])
  return [ref, p] as const
}

/* ── forms ───────────────────────────────────────────────────────── */

export type Rule = (v: string, all: Record<string, string>) => string | null

export const rules = {
  required:
    (msg = "Please fill this in."): Rule =>
    (v) =>
      v.trim() ? null : msg,
  email: (): Rule => (v) => (!v.trim() ? "We need an email to reply to." : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? null : "That email doesn't look complete."),
  phone: (): Rule => (v) => (!v.trim() ? "Add a number we can call." : v.replace(/[^\d]/g, "").length >= 9 ? null : "That number looks too short."),
  checked:
    (msg = "Please confirm to continue."): Rule =>
    (v) =>
      v === "yes" ? null : msg,
  min:
    (n: number, msg?: string): Rule =>
    (v) =>
      v.trim().length >= n ? null : msg ?? `A little more detail, please (at least ${n} characters).`,
}

export function useForm<K extends string>(initial: Record<K, string>, schema: Partial<Record<K, Rule[]>>) {
  const [values, setValues] = useState<Record<K, string>>(initial)
  const [errors, setErrors] = useState<Partial<Record<K, string>>>({})
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle")

  const check = (k: K, all: Record<K, string>) => {
    for (const r of schema[k] ?? []) {
      const e = r(all[k] ?? "", all as Record<string, string>)
      if (e) return e
    }
    return null
  }

  const set = (k: K, v: string) => {
    setValues((prev) => {
      const next = { ...prev, [k]: v }
      if (errors[k]) setErrors((e) => ({ ...e, [k]: check(k, next) ?? undefined }))
      return next
    })
  }

  const validate = (keys?: K[]) => {
    const ks = keys ?? (Object.keys(schema) as K[])
    const next: Partial<Record<K, string>> = { ...errors }
    let ok = true
    for (const k of ks) {
      const e = check(k, values)
      next[k] = e ?? undefined
      if (e) ok = false
    }
    setErrors(next)
    return ok
  }

  const submit = (onOk?: () => void) => (e?: { preventDefault: () => void }) => {
    e?.preventDefault()
    if (!validate()) {
      requestAnimationFrame(() => {
        const first = document.querySelector<HTMLElement>("[aria-invalid='true']")
        first?.focus()
      })
      return
    }
    setStatus("sending")
    window.setTimeout(() => {
      setStatus("done")
      onOk?.()
    }, 650)
  }

  const reset = () => {
    setValues(initial)
    setErrors({})
    setStatus("idle")
  }

  /** Spread onto an input/textarea/select for value, change and a11y wiring. */
  const field = (k: K) => ({
    id: `f-${k}`,
    name: k,
    value: values[k],
    onChange: (e: { target: { value: string } }) => set(k, e.target.value),
    "aria-invalid": errors[k] ? ("true" as const) : ("false" as const),
    "aria-describedby": errors[k] ? `f-${k}-err` : undefined,
  })

  return { values, set, errors, status, validate, submit, reset, field }
}

/* ── small utilities ─────────────────────────────────────────────── */

export function ref(prefix: string) {
  const n = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}-${n}`
}

/** Opening-hours helper: hours[day 0=Sun] = [open, close] in decimal hours or null. */
export function openState(hours: ([number, number] | null)[], now = new Date()) {
  const d = now.getDay()
  const h = now.getHours() + now.getMinutes() / 60
  const today = hours[d]
  const fmt = (x: number) => `${Math.floor(x)}:${String(Math.round((x % 1) * 60)).padStart(2, "0")}`
  if (today && h >= today[0] && h < today[1]) return { open: true, line: `Open now · until ${fmt(today[1])}` }
  if (today && h < today[0]) return { open: false, line: `Opens today at ${fmt(today[0])}` }
  for (let i = 1; i <= 7; i++) {
    const nd = (d + i) % 7
    const n = hours[nd]
    if (n) {
      const name = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][nd]
      return { open: false, line: `Closed · opens ${i === 1 ? "tomorrow" : name} at ${fmt(n[0])}` }
    }
  }
  return { open: false, line: "Closed" }
}

/** Next N days as Date objects starting tomorrow (or today). */
export function nextDays(n: number, fromToday = false) {
  const base = new Date()
  base.setHours(12, 0, 0, 0)
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(base)
    d.setDate(base.getDate() + i + (fromToday ? 0 : 1))
    return d
  })
}

export const dayShort = (d: Date) => d.toLocaleDateString("en-GB", { weekday: "short" })
export const dayNum = (d: Date) => d.getDate()
export const monthShort = (d: Date) => d.toLocaleDateString("en-GB", { month: "short" })
export const longDate = (d: Date) => d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })

/** Deterministic pseudo-random (mulberry32) for stable "availability" per date. */
export function seeded(seed: number) {
  let a = (seed ^ 0x9e3779b9) >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
export const dateSeed = (d: Date) => d.getFullYear() * 1000 + d.getMonth() * 40 + d.getDate()
