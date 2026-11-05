import { lazy, type ComponentType, type LazyExoticComponent } from "react"

/** slug → lazily loaded site. Each template is its own chunk. */
export const SITES: Record<string, LazyExoticComponent<ComponentType>> = {
  /* ── food & beverage ── */
  "molo-bakehouse": lazy(() => import("./food/molo")),
  "kumo-omakase": lazy(() => import("./food/kumo")),
  "ember-oak": lazy(() => import("./food/ember-oak")),
  "fuoco-figli": lazy(() => import("./food/fuoco")),
  "maison-ember": lazy(() => import("./food/ember")),
  /* ── healthcare & wellness ── */
  "willow-pediatric": lazy(() => import("./health/willow")),
  "kalm-physio": lazy(() => import("./health/kalm")),
  "northfield-clinic": lazy(() => import("./health/northfield")),
  "halden-health": lazy(() => import("./health/halden")),
  /* ── legal ── */
  "iris-calder": lazy(() => import("./legal/iris")),
  "harrow-finch": lazy(() => import("./legal/harrow")),
  "albright-kerr": lazy(() => import("./legal/albright")),
  "meridian-legal": lazy(() => import("./legal/meridian")),
  /* ── home services ── */
  "kettle-plumbing": lazy(() => import("./home/kettle")),
  clearpane: lazy(() => import("./home/clearpane")),
  brickwell: lazy(() => import("./home/brickwell")),
  "volt-field": lazy(() => import("./home/volt")),
  /* ── factory — module-built (Template Factory merge) ── */
  nightflow: lazy(() => import("./factory/nightflow")),
  thermonorth: lazy(() => import("./factory/thermonorth")),
  /* ── property & real estate ── */
  "harbour-keys": lazy(() => import("./property/harbour-keys")),
  "rowan-vale": lazy(() => import("./property/rowan-vale")),
  "crestline-estates": lazy(() => import("./property/crestline")),
  "northbank-residences": lazy(() => import("./property/northbank")),
}
