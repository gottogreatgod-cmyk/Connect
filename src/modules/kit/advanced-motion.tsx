'use client'

/**
 * Advanced motion modules — the runtime layer of the five master skills.
 *
 *   WiggleText · MagneticWrap · MarqueeStrip · StaggerGrid · GlassPanel ·
 *   TiltCard · BrandMotionPanel
 *
 * Every component honours the same contract:
 *   · transform + opacity only (the 60fps contract)
 *   · `useStill()` — one gate for prefers-reduced-motion AND the OS nuke
 *   · when still, the content renders complete — just without movement
 *
 * Used by the composed site templates (through the factory kit) and by
 * the Motion Lab (#/motion) — one runtime, two surfaces.
 */

import * as React from 'react'
import { motion, useReducedMotion, useSpring, useMotionValue, useTransform, type MotionStyle } from 'framer-motion'
import { useMotionPref } from '@/shell/motion'
import { CURVES, PERSONALITIES } from '@/engine/motion-craft'
import { cn } from '@/lib/utils'

/* ── the one gate ──────────────────────────────────────────────────── */

/** true when motion must be dropped: reduced-motion OR the OS nuke. */
export function useStill(): boolean {
  const reduced = useReducedMotion()
  const { motion } = useMotionPref()
  return !!reduced || !motion
}

const EASE_OUT = CURVES['ease-out'].motion
const EASE_ENTER = CURVES.enter.motion

/* ---------------------------------- WiggleText ---------------------------------- */

/**
 * The signature move — per-letter springs with phase offsets.
 * `enter` mode: letters rise in once, staggered (the classy default).
 * `loop` mode: the continuous wave (identity moments, brand strips).
 */
export function WiggleText({
  text,
  as: Tag = 'span',
  mode = 'enter',
  amplitude = 10,
  rotate = 4,
  each = 0.055,
  loopDuration = 1.7,
  disabled = false,
  className,
  style,
}: {
  text: string
  as?: keyof React.JSX.IntrinsicElements
  mode?: 'enter' | 'loop'
  amplitude?: number
  rotate?: number
  each?: number
  loopDuration?: number
  /** extra gate for callers (e.g. a site's per-tier motion cap) */
  disabled?: boolean
  className?: string
  style?: React.CSSProperties
}) {
  const still = useStill() || disabled
  const letters = React.useMemo(() => Array.from(text), [text])
  const MTag = motion[Tag as 'span'] as typeof motion.span

  if (still) {
    return (
      <Tag className={className} style={style}>
        {text}
      </Tag>
    )
  }

  return (
    <MTag className={cn('inline-block', className)} style={style} aria-label={text}>
      {letters.map((ch, i) =>
        ch === ' ' ? (
          <span key={i}>&nbsp;</span>
        ) : mode === 'enter' ? (
          <motion.span
            key={i}
            className="inline-block will-change-transform"
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * each, type: 'spring', stiffness: 320, damping: 24 }}
          >
            {ch}
          </motion.span>
        ) : (
          <motion.span
            key={i}
            className="inline-block will-change-transform"
            animate={{ y: [0, -amplitude, 0], rotate: [0, rotate, 0] }}
            transition={{
              duration: loopDuration,
              repeat: Infinity,
              delay: i * each,
              times: [0, 0.5, 1],
              ease: 'easeInOut',
            }}
          >
            {ch}
          </motion.span>
        ),
      )}
    </MTag>
  )
}

/* ---------------------------------- MagneticWrap ---------------------------------- */

/**
 * Micro-interaction: the element leans toward the pointer inside a
 * magnetic radius and springs home on leave. Instant press feedback
 * (scale 0.96, snappy spring) ships with it.
 */
export function MagneticWrap({
  children,
  radius = 120,
  strength = 0.35,
  max = 14,
  disabled = false,
  className,
}: {
  children: React.ReactNode
  radius?: number
  strength?: number
  max?: number
  /** extra gate for callers (e.g. a site's per-tier motion cap) */
  disabled?: boolean
  className?: string
}) {
  const still = useStill() || disabled
  const ref = React.useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 320, damping: 22 })
  const sy = useSpring(y, { stiffness: 320, damping: 22 })

  const onMove = (e: React.PointerEvent) => {
    if (still || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    const dist = Math.hypot(dx, dy)
    if (dist > radius) return
    x.set(Math.max(-max, Math.min(max, dx * strength)))
    y.set(Math.max(-max, Math.min(max, dy * strength)))
  }
  const onLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={cn('inline-block will-change-transform', className)}
      style={{ x: still ? 0 : sx, y: still ? 0 : sy } as MotionStyle}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      whileTap={still ? undefined : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {children}
    </motion.div>
  )
}

/* ---------------------------------- MarqueeStrip ---------------------------------- */

/** Constant motion — linear, off the main thread (pure CSS animation). */
export function MarqueeStrip({
  children,
  seconds = 22,
  reverse = false,
  disabled = false,
  className,
  pauseOnHover = true,
}: {
  children: React.ReactNode
  seconds?: number
  reverse?: boolean
  /** extra gate for callers (e.g. a site's per-tier motion cap) */
  disabled?: boolean
  className?: string
  pauseOnHover?: boolean
}) {
  const still = useStill() || disabled
  const row = (
    <div className="flex shrink-0 items-center gap-10 pr-10" aria-hidden>
      {children}
    </div>
  )
  return (
    <div
      className={cn('relative flex w-full overflow-hidden', className)}
      style={{
        animation: still
          ? undefined
          : `gos-marquee ${seconds}s linear infinite ${reverse ? 'reverse' : ''}`,
        animationPlayState: undefined,
      }}
      data-pause={pauseOnHover ? '' : undefined}
    >
      {row}
      {row}
      <style>{`@keyframes gos-marquee { from { transform: translate3d(0,0,0) } to { transform: translate3d(-50%,0,0) } }
[data-pause]:hover { animation-play-state: paused }`}</style>
    </div>
  )
}

/* ---------------------------------- StaggerGrid ---------------------------------- */

/** Grid/list reveal as one gesture — framer variant choreography. */
export function StaggerGrid({
  children,
  from = 'center',
  each = 0.06,
  className,
  itemClassName,
}: {
  children: React.ReactNode[]
  from?: 'start' | 'center' | 'end'
  each?: number
  className?: string
  itemClassName?: string
}) {
  const still = useStill()
  if (still) {
    return <div className={className}>{children}</div>
  }
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: each } } }}
    >
      {children.map((child, i) => (
        <motion.div
          key={i}
          className={itemClassName}
          variants={{
            hidden: { opacity: 0, y: 18, scale: 0.97 },
            show: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { duration: 0.5, ease: EASE_OUT },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

/* ---------------------------------- GlassPanel ---------------------------------- */

/** The glassmorphism recipe as a surface — depth without weight. */
export function GlassPanel({
  children,
  className,
  blur = 18,
  radius = 18,
}: {
  children?: React.ReactNode
  className?: string
  blur?: number
  radius?: number
}) {
  return (
    <div
      className={cn('glass-panel relative overflow-hidden', className)}
      style={{
        borderRadius: radius,
        backdropFilter: `blur(${blur}px) saturate(160%)`,
        WebkitBackdropFilter: `blur(${blur}px) saturate(160%)`,
      }}
    >
      {children}
    </div>
  )
}

/* ---------------------------------- TiltCard ---------------------------------- */

/** Pointer-driven 3D tilt — two springs, transforms only, 60fps by contract. */
export function TiltCard({
  children,
  max = 10,
  scale = 1.02,
  className,
  perspective = 900,
}: {
  children: React.ReactNode
  max?: number
  scale?: number
  className?: string
  perspective?: number
}) {
  const still = useStill()
  const ref = React.useRef<HTMLDivElement>(null)
  const rx = useSpring(useMotionValue(0), { stiffness: 260, damping: 20 })
  const ry = useSpring(useMotionValue(0), { stiffness: 260, damping: 20 })
  const s = useSpring(useMotionValue(1), { stiffness: 300, damping: 24 })

  const rotateX = useTransform(rx, (v) => `${v}deg`)
  const rotateY = useTransform(ry, (v) => `${v}deg`)
  const scaleT = useTransform(s, (v) => v)

  const onMove = (e: React.PointerEvent) => {
    if (still || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    ry.set(px * max * 2)
    rx.set(-py * max * 2)
    s.set(scale)
  }
  const onLeave = () => {
    rx.set(0)
    ry.set(0)
    s.set(1)
  }

  return (
    <div style={{ perspective }} className={className}>
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{
          rotateX: still ? '0deg' : rotateX,
          rotateY: still ? '0deg' : rotateY,
          scale: still ? 1 : scaleT,
          transformStyle: 'preserve-3d',
        }}
        className="h-full w-full will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  )
}

/* ---------------------------------- BrandMotionPanel ---------------------------------- */

/**
 * The four brand personalities on one stage — each mark moves exactly
 * by its parameter table (wiggle.philosophy). Part demo, part spec sheet.
 */
export function BrandMotionPanel({ compact = false }: { compact?: boolean }) {
  const still = useStill()
  const p = PERSONALITIES

  const Stage = {
    corporate: (
      <div className="flex h-20 items-center justify-center">
        <motion.div
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-lg font-black text-white dark:bg-white dark:text-zinc-900"
          animate={still ? undefined : { opacity: [0, 1], scale: [0.95, 1] }}
          transition={{ duration: 1.6, ease: [0.42, 0.58, 1, 1] }}
        >
          C
        </motion.div>
      </div>
    ),
    organic: (
      <div className="flex h-20 items-end justify-center gap-1.5 pb-3">
        {[0.9, 0.55, 0.75, 0.4, 0.85, 0.5, 0.7, 0.35, 0.8, 0.6].map((h, i) => (
          <motion.span
            key={i}
            className="w-2 rounded-full bg-emerald-500"
            style={{ height: 10 }}
            animate={still ? undefined : { scaleY: [0.3, h * 2.4, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.07, ease: 'easeInOut' }}
          />
        ))}
      </div>
    ),
    bold: (
      <div className="flex h-20 items-center justify-center">
        <motion.div
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-lg font-black text-white"
          animate={still ? undefined : { y: [14, -6, 0], opacity: [0, 1, 1], scale: [0.9, 1.06, 1] }}
          transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
        >
          B
        </motion.div>
      </div>
    ),
    cinematic: (
      <div className="relative flex h-20 items-center justify-center overflow-hidden rounded-lg bg-zinc-950">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-700/40 to-zinc-950"
          animate={still ? undefined : { x: ['-100%', '100%'] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.9 }}
        />
        <motion.span
          className="relative z-10 text-lg font-black tracking-[0.35em] text-zinc-100"
          animate={still ? undefined : { opacity: [0, 1, 1, 0] }}
          transition={{ duration: 3.6, times: [0, 0.25, 0.8, 1] }}
        >
          LUX
        </motion.span>
      </div>
    ),
  } as const

  const rows: { id: keyof typeof Stage; p: (typeof PERSONALITIES)[string] }[] = [
    { id: 'corporate', p: p.corporate },
    { id: 'organic', p: p.organic },
    { id: 'bold', p: p.bold },
    { id: 'cinematic', p: p.cinematic },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {rows.map(({ id, p: row }) => (
        <div key={id} className="rounded-xl border bg-card/60 p-4">
          {Stage[id]}
          <div className="mt-3">
            <p className="text-sm font-bold">{row.label}</p>
            {!compact && (
              <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[10px] text-muted-foreground">
                <div><dt className="inline text-foreground/70">fps</dt> <dd className="inline">{row.fps}</dd></div>
                <div><dt className="inline text-foreground/70">dur</dt> <dd className="inline">{row.duration}</dd></div>
                <div className="col-span-2"><dt className="inline text-foreground/70">ease</dt> <dd className="inline">{row.easing}</dd></div>
                <div className="col-span-2"><dt className="inline text-foreground/70">keys</dt> <dd className="inline">{row.keyframes}</dd></div>
              </dl>
            )}
            <p className="mt-2 text-[11px] leading-snug text-muted-foreground">{row.brands}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── shared easing exports for consumers ──────────────────────────── */

export { EASE_OUT, EASE_ENTER, CURVES }
