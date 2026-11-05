"use client"

/**
 * Motion preference — a global toggle that every effect layer respects.
 * Ported from OMNIFORGE: effects check caps AND this preference; the
 * OS-level reduced-motion media query forces it off regardless.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

const MotionContext = createContext<{ motion: boolean; setMotion: (v: boolean) => void }>({
  motion: true,
  setMotion: () => {},
})

export const MOTION_STORAGE_KEY = "gos:motion"

export function MotionPrefProvider({ children }: { children: ReactNode }) {
  const [motion, setMotionState] = useState(true)

  /* hydrate from storage, then keep OS preference as a hard cap —
     the deliberate storage-sync pattern; setState here is the point. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(MOTION_STORAGE_KEY)
      if (raw !== null) setMotionState(raw === "1")
    } catch {
      /* storage unavailable — keep the default */
    }
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const apply = () => {
      if (mq.matches) setMotionState(false)
    }
    apply()
    mq.addEventListener?.("change", apply)
    return () => mq.removeEventListener?.("change", apply)
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  const setMotion = (v: boolean) => {
    setMotionState(v)
    try {
      localStorage.setItem(MOTION_STORAGE_KEY, v ? "1" : "0")
    } catch {
      /* ignore */
    }
  }

  return <MotionContext.Provider value={{ motion, setMotion }}>{children}</MotionContext.Provider>
}

export function useMotionPref() {
  return useContext(MotionContext)
}
