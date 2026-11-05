import { lazy, type ComponentType, type LazyExoticComponent } from "react"

/** slug → lazily loaded site. Each template is its own chunk. */
export const SITES: Record<string, LazyExoticComponent<ComponentType>> = {
  "molo-bakehouse": lazy(() => import("./food/molo")),
  "kumo-omakase": lazy(() => import("./food/kumo")),
  "fuoco-figli": lazy(() => import("./food/fuoco")),
  "maison-ember": lazy(() => import("./food/ember")),
  "willow-pediatric": lazy(() => import("./health/willow")),
  "kalm-physio": lazy(() => import("./health/kalm")),
  "northfield-clinic": lazy(() => import("./health/northfield")),
  "halden-health": lazy(() => import("./health/halden")),
  "iris-calder": lazy(() => import("./legal/iris")),
  "harrow-finch": lazy(() => import("./legal/harrow")),
  "albright-kerr": lazy(() => import("./legal/albright")),
  "meridian-legal": lazy(() => import("./legal/meridian")),
  "kettle-plumbing": lazy(() => import("./home/kettle")),
  "clearpane": lazy(() => import("./home/clearpane")),
  "brickwell": lazy(() => import("./home/brickwell")),
  "volt-field": lazy(() => import("./home/volt")),
}
