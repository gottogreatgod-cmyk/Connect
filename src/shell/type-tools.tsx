"use client"

/**
 * TypeTools — the shared cluster: the click-to-edit toggle and the
 * site-wide typography scale (A− / A+), with reset affordances.
 *
 * Rendered on every surface that shows a live preview — the library
 * topbar, the site view's sticky bar and the module forge header — so
 * text is editable wherever the work happens.
 */
import { Minus, Pencil, Plus, RotateCcw } from "lucide-react"
import { FONT_SCALE_MAX, FONT_SCALE_MIN, useGos } from "./gos-context"

export function TypeTools() {
  const gos = useGos()
  return (
    <div className="gos-chip-row gos-type-tools" role="group" aria-label="Type tools">
      <button
        type="button"
        className={`chip ${gos.editMode ? "is-on" : ""}`}
        onClick={() => gos.setEditMode(!gos.editMode)}
        aria-pressed={gos.editMode}
        title="Edit text — click any text on the preview to rewrite it"
      >
        <Pencil size={13} aria-hidden />
        <span className={gos.editMode ? "" : "hidden xl:inline"}>{gos.editMode ? "Editing" : "Edit text"}</span>
      </button>
      <span className="gos-typescale" title="Site-wide type scale — shrinks / expands every text on the live previews">
        <button
          type="button"
          className="gos-icon-btn xs"
          onClick={() => gos.setFontScale(gos.fontScale - 0.05)}
          disabled={gos.fontScale <= FONT_SCALE_MIN + 1e-9}
          aria-label="Shrink text"
        >
          <Minus size={12} />
        </button>
        <span className="gos-typescale-num mono" aria-live="polite" title="Current type scale">
          {Math.round(gos.fontScale * 100)}%
        </span>
        <button
          type="button"
          className="gos-icon-btn xs"
          onClick={() => gos.setFontScale(gos.fontScale + 0.05)}
          disabled={gos.fontScale >= FONT_SCALE_MAX - 1e-9}
          aria-label="Expand text"
        >
          <Plus size={12} />
        </button>
        {gos.fontScale !== 1 && (
          <button type="button" className="gos-icon-btn xs" onClick={() => gos.setFontScale(1)} aria-label="Reset type scale" title="Reset type scale to 100%">
            <RotateCcw size={12} />
          </button>
        )}
        {gos.editMode && (
          <button
            type="button"
            className="gos-icon-btn xs"
            onClick={() => gos.resetEdits()}
            aria-label="Reset all text edits"
            title="Reset every text edit — re-mounts the live sites"
          >
            <RotateCcw size={12} />
          </button>
        )}
      </span>
    </div>
  )
}
