"use client"

/**
 * The Randomizer — the unified system's auto-swapper for the little
 * details, in three shapes:
 *
 *   RandomizerTools    the topbar cluster — deal a genome (dice) and the
 *                      auto-cruise toggle (orbit); locked honestly when
 *                      the finish tier allows no overrides
 *   SwapTicker         the global floating chip — every move the system
 *                      makes on its own is announced, then fades
 *   RandomizerSection  the Genome panel block — the big controls, the
 *                      budget note and the live swap feed
 *
 * One instrument, same state everywhere (gos-context): shuffle deals a
 * fresh curated genome within the finish budget, cruise keeps swapping
 * one detail at a time until the visitor takes the wheel.
 */
import { useEffect, useState } from "react"
import { Dices, Lock, Orbit } from "lucide-react"
import { useGos, type SwapEntry } from "./gos-context"

/* ── the topbar cluster ──────────────────────────────────────────── */

export function RandomizerTools() {
  const gos = useGos()
  const locked = gos.genomeBudget <= 0

  return (
    <div className="gos-chip-row gos-rand-tools" role="group" aria-label="Genome randomizer">
      <button
        type="button"
        className="chip"
        onClick={() => gos.shuffleGenome()}
        disabled={locked}
        title={
          locked
            ? "The Studio finish keeps every template as drawn — move up a finish to unlock the randomizer"
            : `Deal a fresh genome — ${gos.genomeBudget} curated ${gos.genomeBudget === 1 ? "switch" : "switches"} within this finish`
        }
      >
        <Dices size={13} aria-hidden />
        <span className="hidden xl:inline">Shuffle</span>
      </button>
      <button
        type="button"
        className={`chip ${gos.autoSwap ? "is-on" : ""}`}
        onClick={() => gos.setAutoSwap(!gos.autoSwap)}
        aria-pressed={gos.autoSwap}
        disabled={locked}
        title={
          locked
            ? "Auto-cruise needs at least one genome override — move up a finish"
            : gos.autoSwap
              ? "Auto-cruise running — the system swaps one detail every few seconds. Click to stop"
              : "Auto-cruise — let the system swap the little details on its own"
        }
      >
        <Orbit size={13} className={gos.autoSwap ? "rand-orbit" : ""} aria-hidden />
        <span className="hidden xl:inline">{gos.autoSwap ? "Cruising" : "Cruise"}</span>
        {gos.autoSwap && <span className="rand-dot" aria-hidden />}
      </button>
    </div>
  )
}

/* ── the global swap ticker ──────────────────────────────────────── */

export function SwapTicker() {
  const { swapFeed } = useGos()
  const latest: SwapEntry | null = swapFeed[0] ?? null
  const [phase, setPhase] = useState<"hidden" | "shown" | "fading">("hidden")

  /* announce each new move, hold, fade — the deliberate announce pattern */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!latest) return
    setPhase("shown")
    const t1 = window.setTimeout(() => setPhase((p) => (p === "shown" ? "fading" : p)), 3000)
    const t2 = window.setTimeout(() => setPhase("hidden"), 3550)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [latest])
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!latest || phase === "hidden") return null

  const shown = latest.swaps.slice(0, 3)
  const extra = latest.swaps.length - shown.length

  return (
    <div className={`gos-swap-ticker ${phase === "fading" ? "fade" : ""}`} role="status" aria-live="polite" key={latest.id}>
      <span className="rand-kind">
        {latest.kind === "auto" ? <Orbit size={12} aria-hidden /> : <Dices size={12} aria-hidden />}
        {latest.kind === "auto" ? "auto-swap" : "shuffled"}
      </span>
      <span className="rand-moves">
        {shown.map((s) => (
          <span key={s.id} className="rand-move">
            <small>{s.label}</small>
            <b>{s.to}</b>
          </span>
        ))}
        {extra > 0 && <span className="rand-move">+{extra} more</span>}
      </span>
    </div>
  )
}

/* ── the Genome panel section ────────────────────────────────────── */

export function RandomizerSection() {
  const gos = useGos()
  const locked = gos.genomeBudget <= 0

  return (
    <>
      <div className="gos-switch-head">
        <p className="eyebrow">Randomizer</p>
        <span className="sw-budget">
          {locked ? "locked" : `budget ${gos.genomeBudget}`}
        </span>
      </div>

      {locked ? (
        <p className="gos-cap-notice">
          <Lock size={12} aria-hidden /> The Studio finish keeps every template as drawn — move up a finish (the strip below the
          topbar) and the randomizer wakes up.
        </p>
      ) : (
        <div className="gos-rand-row" role="group" aria-label="Genome randomizer">
          <button type="button" className="gos-rand-deal" onClick={() => gos.shuffleGenome()}>
            <Dices size={15} aria-hidden />
            <span>
              <b>Deal a genome</b>
              <small>{gos.genomeBudget} curated {gos.genomeBudget === 1 ? "switch" : "switches"} · always a visible change</small>
            </span>
          </button>
          <button
            type="button"
            className={`gos-rand-cruise ${gos.autoSwap ? "on" : ""}`}
            onClick={() => gos.setAutoSwap(!gos.autoSwap)}
            aria-pressed={gos.autoSwap}
          >
            <Orbit size={15} className={gos.autoSwap ? "rand-orbit" : ""} aria-hidden />
            <span>
              <b>{gos.autoSwap ? "Cruising" : "Auto-cruise"}</b>
              <small>{gos.autoSwap ? "one detail moves every few seconds — any manual pick stops it" : "let the system swap details on its own"}</small>
            </span>
          </button>
        </div>
      )}

      <ul className="gos-rand-feed" aria-label="Recent genome moves">
        {gos.swapFeed.length === 0 && (
          <li className="rand-empty">
            {locked ? "No moves yet — the finish tier holds the wheel." : "No moves yet — deal a genome or start the cruise."}
          </li>
        )}
        {gos.swapFeed.map((e) => (
          <li key={e.id}>
            <span className="rand-feed-kind">
              {e.kind === "auto" ? <Orbit size={10} aria-hidden /> : <Dices size={10} aria-hidden />}
            </span>
            <span className="rand-feed-body">
              {e.swaps.map((s) => (
                <span key={s.id} className="rand-feed-move">
                  {s.label} <i>{s.from}</i> <b>{s.to}</b>
                </span>
              ))}
            </span>
            <time>{new Date(e.at).toLocaleTimeString([], { hour12: false })}</time>
          </li>
        ))}
      </ul>
    </>
  )
}
