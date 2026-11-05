"use client"

/**
 * FX engine — the tier-gated effects layer, ported from OMNIFORGE.
 *
 * FxProvider exposes the active finish caps + motion preference to every
 * effect in the system. The CursorLabel is the flagship effect: a small
 * label that follows the cursor over elements marked with
 * data-cursor-label — Spectacle tier and up, motion ON only.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { finishOf, type FinishCaps, type FinishId } from "@/engine/finish"
import { useMotionPref } from "@/shell/motion"
import { track } from "@/engine/analytics"

interface FxContextValue {
  finishId: FinishId
  caps: FinishCaps
  motion: boolean
  label: string | null
  setLabel: React.Dispatch<React.SetStateAction<string | null>>
}

const FxContext = createContext<FxContextValue | null>(null)

export function FxProvider({ finishId, children }: { finishId: FinishId; children: ReactNode }) {
  const { motion } = useMotionPref()
  const [label, setLabel] = useState<string | null>(null)
  const caps = finishOf(finishId).caps

  const value = useMemo<FxContextValue>(
    () => ({ finishId, caps, motion, label, setLabel }),
    [finishId, caps, motion, label],
  )

  return <FxContext.Provider value={value}>{children}</FxContext.Provider>
}

export function useFx(): FxContextValue {
  const ctx = useContext(FxContext)
  if (!ctx) throw new Error("useFx must be used inside <FxProvider>")
  return ctx
}

/* ── CursorLabel — follows the pointer over data-cursor-label marks ── */

export function CursorLabel() {
  const { caps, motion, label, setLabel } = useFx()
  const latest = useRef({ x: -100, y: -100 })
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const raf = useRef<number | null>(null)

  const active = caps.cursorFx && motion

  useEffect(() => {
    if (!active) return
    const onMove = (e: PointerEvent) => {
      latest.current = { x: e.clientX, y: e.clientY }
      if (raf.current === null) {
        raf.current = requestAnimationFrame(() => {
          raf.current = null
          setPos(latest.current)
        })
      }
      const el = (e.target as HTMLElement | null)?.closest?.("[data-cursor-label]")
      const next = el?.getAttribute("data-cursor-label") ?? null
      setLabel((prev) => (prev === next ? prev : next))
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => {
      window.removeEventListener("pointermove", onMove)
      if (raf.current !== null) cancelAnimationFrame(raf.current)
    }
  }, [active, setLabel])

  if (!active || !label) return null
  return (
    <div
      aria-hidden
      className="fx-cursor-label"
      style={{ transform: `translate(${pos.x + 18}px, ${pos.y + 18}px)` }}
    >
      {label}
    </div>
  )
}

/* ── data hook for hover labels on any element ─────────────────── */

export function useCursorLabel(label: string) {
  const { caps, motion } = useFx()
  const active = caps.cursorFx && motion
  const onEnter = useCallback(() => undefined, [])
  return active ? { "data-cursor-label": label, onEnter } : {}
}

/* ── Spin blocks ────────────────────────────────────────────────── */
/*
 * Elements that spin and react to the cursor in three tier-gated ways:
 *
 *   spin          (Signature+)   slow continuous rotation while hovered
 *   spinProximity (Showcase+)    blocks tilt, scale and glow as the cursor
 *                                NEARS them — before any hover
 *   tilt3d        (Spectacle+)   full 3D perspective tilt toward the
 *                                cursor while it is inside the block
 *
 * Traversal: crossing a block's edge fires a one-shot `.spin-cross`
 * reaction (and the spin_block_engaged analytics event).
 *
 * Everything is OFF unless the active tier's caps allow it AND the
 * motion preference is ON. One pointer listener per SpinField drives all
 * children through CSS vars — no React re-renders on mouse move.
 */

interface SpinEntry {
  el: HTMLElement
  wasInside: boolean
}

interface SpinFieldContextValue {
  register: (el: HTMLElement | null) => () => void
}

const SpinFieldContext = createContext<SpinFieldContextValue | null>(null)

export function SpinField({
  className,
  children,
  radius = 220,
}: {
  className?: string
  children: ReactNode
  radius?: number
}) {
  const { caps, motion, finishId } = useFx()
  const blocks = useRef(new Set<SpinEntry>())
  const raf = useRef<number | null>(null)
  const pointer = useRef({ x: -9999, y: -9999 })

  const enabled = motion && (caps.spin || caps.spinProximity || caps.tilt3d)

  const register = useCallback((el: HTMLElement | null) => {
    if (!el) return () => undefined
    const entry: SpinEntry = { el, wasInside: false }
    blocks.current.add(entry)
    return () => {
      blocks.current.delete(entry)
    }
  }, [])

  const ctxValue = useMemo(() => ({ register }), [register])

  useEffect(() => {
    if (!enabled) return

    const apply = () => {
      raf.current = null
      const { x, y } = pointer.current
      for (const b of blocks.current) {
        const r = b.el.getBoundingClientRect()
        const cx = r.left + r.width / 2
        const cy = r.top + r.height / 2
        const dx = x - cx
        const dy = y - cy
        const dist = Math.hypot(dx, dy)
        const reach = radius + Math.max(r.width, r.height) / 2
        const p = Math.max(0, 1 - dist / reach) // proximity 0..1
        const inside = x >= r.left && x <= r.right && y >= r.top && y <= r.bottom

        b.el.style.setProperty("--p", p.toFixed(3))
        if (inside || p > 0) {
          b.el.style.setProperty("--tx", Math.max(-1, Math.min(1, dx / (r.width / 2) || 0)).toFixed(3))
          b.el.style.setProperty("--ty", Math.max(-1, Math.min(1, dy / (r.height / 2) || 0)).toFixed(3))
        }

        if (inside !== b.wasInside) {
          b.wasInside = inside
          if (inside) {
            b.el.classList.remove("spin-cross")
            void b.el.offsetWidth /* restart the reaction */
            b.el.classList.add("spin-cross")
            track("spin_block_engaged", { finish: finishId })
          }
        }
      }
    }

    const onMove = (e: PointerEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY }
      if (raf.current === null) raf.current = requestAnimationFrame(apply)
    }

    window.addEventListener("pointermove", onMove, { passive: true })
    return () => {
      window.removeEventListener("pointermove", onMove)
      if (raf.current !== null) cancelAnimationFrame(raf.current)
    }
  }, [enabled, radius, finishId])

  return (
    <SpinFieldContext.Provider value={ctxValue}>
      <div
        className={`spin-field ${!enabled ? "spin-field-off" : ""} ${className ?? ""}`}
        style={{ perspective: caps.tilt3d && motion ? "1000px" : undefined }}
      >
        {children}
      </div>
    </SpinFieldContext.Provider>
  )
}

export function useSpinRegister() {
  const ctx = useContext(SpinFieldContext)
  return ctx?.register ?? null
}

export function SpinBlock({
  className,
  style,
  children,
  /** disable the hover rotor for content that must stay readable */
  rotor = true,
}: {
  className?: string
  style?: React.CSSProperties
  children: ReactNode
  rotor?: boolean
}) {
  const { caps, motion } = useFx()
  const register = useSpinRegister()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!register || !ref.current) return
    return register(ref.current)
  }, [register])

  const spinOn = motion && caps.spin && rotor
  const proxOn = motion && caps.spinProximity
  const tiltOn = motion && caps.tilt3d

  return (
    <div
      ref={ref}
      data-spin-block
      data-spin-hover={spinOn ? "on" : undefined}
      data-spin-prox={proxOn ? "on" : undefined}
      data-spin-tilt={tiltOn ? "on" : undefined}
      className={`spin-block ${className ?? ""}`}
      style={style}
    >
      <div className="spin-tilt">{children}</div>
    </div>
  )
}
