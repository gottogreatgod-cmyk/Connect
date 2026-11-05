"use client"

/**
 * FinishStrip — every finish tier on one line, ported from OMNIFORGE's
 * TierStrip. The finish steers the effects layer: what's enabled right
 * now is printed honestly beside the chips (caps readout), because a
 * tier is a set of capabilities, not a colour change.
 */
import { Check } from "lucide-react"
import { CAP_LABELS, FINISHES, finishOf, type FinishCaps } from "@/engine/finish"
import { setParam } from "@/engine/nav"
import { track } from "@/engine/analytics"
import { useFx } from "./fx"

const FX_KEYS: (keyof FinishCaps)[] = ["hoverLift", "shimmer", "spin", "spinProximity", "tilt3d", "cursorFx"]

export function FinishStrip({ finishId }: { finishId: string }) {
  const { caps } = useFx()
  const active = finishOf(finishId)

  return (
    <div className="gos-finish" role="radiogroup" aria-label="Finish tier — the effects layer">
      <div className="gos-finish-chips">
        {FINISHES.map((f) => {
          const on = f.id === finishId
          return (
            <button
              key={f.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => {
                track("finish_selected", { finish: f.id, via: "strip" })
                setParam("finish", f.id)
              }}
              className={`fs-chip ${on ? "on" : ""}`}
              title={`${f.blurb} — ${f.price}`}
            >
              <b>{f.name}</b>
              <small>{f.price}</small>
              {on && <Check size={11} aria-hidden />}
            </button>
          )
        })}
      </div>
      <p className="gos-finish-readout">
        <span className="vis-label">FX on · {active.name}</span>
        {FX_KEYS.filter((k) => caps[k]).map((k) => (
          <span key={k} className="fs-cap">
            {CAP_LABELS[k]}
          </span>
        ))}
        <span className="fs-cap">
          {caps.genomeOverrides} genome {caps.genomeOverrides === 1 ? "switch" : "switches"}
        </span>
        <span className="fs-cap">
          {caps.consoles} console{caps.consoles === 1 ? "" : "s"}
        </span>
        {caps.concierge && <span className="fs-cap">Concierge</span>}
      </p>
    </div>
  )
}
