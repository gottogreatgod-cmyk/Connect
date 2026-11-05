'use client'

/**
 * Motion & interaction modules:
 * RevealOnScroll · AnimatedCounter · BeforeAfterSlider · BeforeAfterTransition · Hero3DObject
 */

import * as React from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ModuleTag } from './primitives'
import { useSite } from '@/sites/kit/site-kit'
import { cn } from '@/lib/utils'

/* ---------------------------------- RevealOnScroll ---------------------------------- */
export function RevealOnScroll({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const reduced = useReducedMotion()
  /* merged: also honour the OS motion contract — genome "still" or a
     Starter-tier motion cap renders the content without animation. */
  const { motion: osMotion } = useSite()
  if (reduced || osMotion < 1) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  )
}

/* ---------------------------------- AnimatedCounter ---------------------------------- */
export function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1600,
}: {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  duration?: number
}) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = React.useState(0)
  const started = React.useRef(false)
  const reduced = useReducedMotion()

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return
        started.current = true
        if (reduced) {
          setDisplay(value)
          return
        }
        const t0 = performance.now()
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / duration)
          const eased = 1 - Math.pow(1 - p, 3)
          setDisplay(value * eased)
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [value, duration, reduced])

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {display.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  )
}

/* ---------------------------------- BeforeAfterSlider ---------------------------------- */
export function BeforeAfterSlider({
  beforeLabel,
  afterLabel,
  before,
  after,
}: {
  beforeLabel: string
  afterLabel: string
  before: React.CSSProperties
  after: React.CSSProperties
}) {
  const [pos, setPos] = React.useState(50)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const dragging = React.useRef(false)

  const updateFromClientX = (clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const pct = ((clientX - rect.left) / rect.width) * 100
    setPos(Math.min(96, Math.max(4, pct)))
  }

  return (
    <div
      ref={containerRef}
      className="relative h-72 cursor-ew-resize select-none overflow-hidden rounded-2xl border shadow-md @min-[768px]:h-96"
      onPointerDown={(e) => {
        dragging.current = true
        updateFromClientX(e.clientX)
        ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
      }}
      onPointerMove={(e) => dragging.current && updateFromClientX(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      <ModuleTag ids={['BeforeAfterSlider@2']} />
      {/* Before layer */}
      <div className="absolute inset-0" style={before}>
        <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">{beforeLabel}</span>
      </div>
      {/* After layer, clipped */}
      <div className="absolute inset-0" style={{ ...after, clipPath: `inset(0 0 0 ${pos}%)` }}>
        <span className="absolute right-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">{afterLabel}</span>
      </div>
      {/* Handle */}
      <div className="absolute inset-y-0 w-0.5 bg-white shadow" style={{ left: `${pos}%` }}>
        <span className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-black/50 text-white backdrop-blur">
          ⇄
        </span>
      </div>
      {/* Keyboard control */}
      <input
        type="range"
        min={4}
        max={96}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Drag to compare before and after"
        className="absolute inset-x-0 bottom-2 mx-auto w-2/3 accent-white opacity-0 transition focus:opacity-100"
      />
    </div>
  )
}

/* ---------------------------------- BeforeAfterTransition (T4, scroll-linked) ---------------------------------- */
export function BeforeAfterTransition({
  beforeLabel,
  afterLabel,
  before,
  after,
  caption,
}: {
  beforeLabel: string
  afterLabel: string
  before: React.CSSProperties
  after: React.CSSProperties
  caption: string
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.35'] })
  const clipValue = useTransform(scrollYProgress, [0, 1], ['100%', '6%'])
  const clipStyle = useTransform(clipValue, (v) => `inset(0 0 0 ${v})`)
  return (
    <div className="relative">
      <ModuleTag ids={['BeforeAfterTransition@4']} />
      <div ref={ref} className="relative h-72 overflow-hidden rounded-2xl border shadow-md @min-[768px]:h-96">
        <div className="absolute inset-0" style={before}>
          <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">{beforeLabel}</span>
        </div>
        {reduced ? (
          <>
            <div className="absolute inset-0" style={after} />
            <span className="absolute right-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">{afterLabel}</span>
          </>
        ) : (
          <motion.div className="absolute inset-0" style={{ clipPath: clipStyle }}>
            <div className="absolute inset-0" style={after} />
            <span className="absolute right-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">{afterLabel}</span>
            <div className="absolute inset-y-0 left-0 w-0.5 bg-white/90 shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
          </motion.div>
        )}
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">{caption}</p>
    </div>
  )
}

/* ---------------------------------- Hero3DObject (T4, isolated) ---------------------------------- */
export function Hero3DObject() {
  const reduced = useReducedMotion()
  const [tilt, setTilt] = React.useState({ x: 0, y: 0 })
  return (
    <div
      className="relative mx-auto w-full max-w-md [perspective:900px]"
      onPointerMove={(e) => {
        if (reduced) return
        const rect = e.currentTarget.getBoundingClientRect()
        setTilt({
          x: ((e.clientY - rect.top) / rect.height - 0.5) * -10,
          y: ((e.clientX - rect.left) / rect.width - 0.5) * 12,
        })
      }}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
      aria-label="Interactive cutaway of pipework (stylised 3D, poster fallback)"
      role="img"
    >
      <ModuleTag ids={['3DHeroObject@4']} />
      <div
        className={cn('transition-transform duration-200 ease-out [transform-style:preserve-3d]', reduced && 'transform-none')}
        style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      >
        <svg viewBox="0 0 320 300" className="w-full drop-shadow-2xl">
          {/* cutaway pipes */}
          <defs>
            <linearGradient id="pipe" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#d4d4d8" />
              <stop offset="55%" stopColor="#71717a" />
              <stop offset="100%" stopColor="#3f3f46" />
            </linearGradient>
            <linearGradient id="water" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          <rect x="40" y="30" width="46" height="200" rx="14" fill="url(#pipe)" transform="rotate(-18 63 130)" />
          <rect x="120" y="60" width="42" height="190" rx="14" fill="url(#pipe)" transform="rotate(14 141 155)" />
          <rect x="210" y="40" width="44" height="210" rx="14" fill="url(#pipe)" transform="rotate(-8 232 145)" />
          {/* flow highlights */}
          <rect x="52" y="42" width="10" height="170" rx="5" fill="url(#water)" opacity="0.9" transform="rotate(-18 57 127)">
            {!reduced && <animate attributeName="opacity" values="0.9;0.3;0.9" dur="2.4s" repeatCount="indefinite" />}
          </rect>
          <rect x="130" y="72" width="9" height="160" rx="4.5" fill="url(#water)" opacity="0.75" transform="rotate(14 134 155)">
            {!reduced && <animate attributeName="opacity" values="0.3;0.9;0.3" dur="3.1s" repeatCount="indefinite" />}
          </rect>
          {/* valve wheel */}
          <circle cx="141" cy="80" r="18" fill="#27272a" stroke="#fbbf24" strokeWidth="3" />
          <circle cx="141" cy="80" r="6" fill="#fbbf24" />
          {/* cut plane */}
          <line x1="20" y1="245" x2="300" y2="245" stroke="#52525b" strokeWidth="2" strokeDasharray="6 6" />
          <text x="20" y="266" fill="#a1a1aa" fontSize="11" fontFamily="monospace">SECTION A–A · copper 22 mm</text>
          <text x="20" y="284" fill="#52525b" fontSize="10" fontFamily="monospace">lazy-loaded model · poster fallback active</text>
        </svg>
      </div>
    </div>
  )
}
