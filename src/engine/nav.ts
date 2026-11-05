/**
 * The system path — the merged OS's single address grammar.
 *
 * Everything lives on the one Next.js route (/); identity is a hash PATH,
 * state rides in the hash QUERY (never sent to the server):
 *
 *   #/                          home — the OS's own landing (front door)
 *   #/build[/<step>]            the Website Builder — one direct flow:
 *                               brief → design → content → art → motion →
 *                               launch, with live generations
 *   #/ai[/<family>]             the AI Intelligence layer — the unified
 *                               agent + four guided skill families
 *   #/motion[/<demo>]           the Motion Lab — 19 master skills from five
 *                               sources, 11 live stages, one grammar
 *   #/sources                   the Source Ledger — every cloned repo,
 *                               our explanations, the live census + MCP
 *   #/library[/<slug>]          the library; a slug stages that template
 *   #/catalogue                 every template, searchable
 *   #/playbook[/<moduleId>]     the 344-module build standard, deep-linkable
 *   #/forge[/<moduleId>]        any module, mounted live on any template
 *   #/site/<slug>[/<page>]      one template, full-bleed, page by page
 *
 *   ?finish=<id>                the FX finish tier
 *   ?edition=<id>               the shell skin (edition)
 *   ?on=<slug>                  the template a forge module is mounted on
 *   ?published=1                client-presentation mode on the site view
 *
 * Legacy addresses (?view=site&t=slug…, #maison-ember, #m-<moduleId>,
 * #published) migrate to clean paths on read, so every old link keeps
 * resolving — the URL in the address bar always ends up clean.
 */

export const NAV_EVENT = "gos:navigate"

export type ViewId = "home" | "build" | "ai" | "motion" | "sources" | "library" | "catalogue" | "playbook" | "forge" | "site"
export const VIEW_IDS: ViewId[] = ["home", "build", "ai", "motion", "sources", "library", "catalogue", "playbook", "forge", "site"]

/** The AI Studio's skill families — slug forms of the deep-linkable second
 *  segment. The families are task-shaped (voice, art, research…) so each
 *  tab can guide a user through every function of one kind. */
export const AI_SKILLS = ["agent", "chat", "art", "voice", "research"] as const
export type AiSkillId = (typeof AI_SKILLS)[number]

/** The original flat skill ids → the family they now live in. Old deep
 *  links (#/ai/image, #/ai/tts, …) resolve to the family, never 404. */
export const LEGACY_AI_SKILL: Record<string, AiSkillId> = {
  image: "art",
  video: "art",
  tts: "voice",
  asr: "voice",
  vlm: "research",
  search: "research",
  reader: "research",
}

export function resolveAiSkill(seg: string | null): AiSkillId | null {
  if (!seg) return null
  if ((AI_SKILLS as readonly string[]).includes(seg)) return seg as AiSkillId
  const mapped = LEGACY_AI_SKILL[seg]
  return mapped ?? null
}

/** The Motion Lab's live stages — deep-linkable the same way as AI skills. */
export const MOTION_DEMOS = [
  "feel",
  "presence",
  "timeline",
  "stagger-grid",
  "scrolltrack",
  "compositor",
  "personalities",
  "wiggle-text",
  "micro",
  "transitions",
  "glass",
] as const
export type MotionDemoId = (typeof MOTION_DEMOS)[number]

/** The Website Builder's steps — deep-linkable the same way. */
export const BUILDER_STEPS = ["brief", "design", "content", "art", "motion", "launch"] as const
export type BuilderStepId = (typeof BUILDER_STEPS)[number]

export interface LocationState {
  view: ViewId
  /** the template: staged (library), rendered (site) or mounted-on (forge) */
  slug: string | null
  /** the site page (site view) — deep-linkable, one path segment */
  page: string | null
  /** deep link to a playbook module (playbook + forge views) */
  mod: string | null
  /** FX finish tier (?finish=) */
  finish: string
  /** shell skin (?edition=) */
  edition: string
  /** the template a forge module is mounted on (?on=) */
  on: string | null
  /** client-presentation mode (?published=1) */
  published: boolean
}

/** The system map — shown on the landing and used for the palette hints. */
export const SYSTEM_MAP: { path: string; label: string; note: string }[] = [
  { path: "/", label: "Home", note: "the OS's own landing — the front door" },
  { path: "/build", label: "Builder", note: "the direct path — brief, design, copy, generated art, motion, launch" },
  { path: "/build/<step>", label: "Builder · one step", note: "brief · design · content · art · motion · launch" },
  { path: "/ai", label: "AI Studio", note: "the intelligence layer — the unified agent + four guided skill families" },
  { path: "/ai/<family>", label: "AI Studio · one family", note: "agent · chat · art · voice · research" },
  { path: "/motion", label: "Motion Lab", note: "layer two — 19 master skills from five sources, 11 live stages" },
  { path: "/motion/<demo>", label: "Motion Lab · one stage", note: "feel · timeline · compositor · wiggle · glass · …" },
  { path: "/sources", label: "Sources", note: "the source ledger — 9 cloned repos, the live census, the MCP server" },
  { path: "/library", label: "Library", note: "the working shell — sidebar · stage · genome inspector" },
  { path: "/library/<slug>", label: "Library · one template", note: "a template staged in the library" },
  { path: "/catalogue", label: "Catalogue", note: "every template as a searchable grid" },
  { path: "/playbook", label: "Playbook", note: "the 344-module build standard" },
  { path: "/playbook/<moduleId>", label: "Playbook · one module", note: "rules and reference code, deep-linked" },
  { path: "/forge", label: "Forge", note: "any module, mounted live on any template" },
  { path: "/site/<slug>", label: "Site", note: "one template, full-bleed with consoles" },
  { path: "/site/<slug>/<page>", label: "Site · one page", note: "the plate on a given page" },
]

/* ── parsing ──────────────────────────────────────────────────────── */

const isView = (v: string | null): v is ViewId => !!v && (VIEW_IDS as string[]).includes(v)

interface ParsedPath {
  view: ViewId
  slug: string | null
  page: string | null
  mod: string | null
}

/** `#/site/ember-oak/menu` → { view: "site", slug: "ember-oak", page: "menu" } */
function parsePath(path: string): ParsedPath {
  const seg = path.split("/").filter(Boolean).map(decodeURIComponent)
  const head = seg[0] ?? ""
  if (!head) return { view: "home", slug: null, page: null, mod: null }
  if (head === "ai") {
    const skill = resolveAiSkill(seg[1] ?? null)
    return { view: "ai", slug: skill, page: null, mod: null }
  }
  if (head === "motion") {
    const demo = seg[1] ?? null
    const ok = demo !== null && (MOTION_DEMOS as readonly string[]).includes(demo)
    return { view: "motion", slug: ok ? demo : null, page: null, mod: null }
  }
  if (head === "build") {
    const step = seg[1] ?? null
    const ok = step !== null && (BUILDER_STEPS as readonly string[]).includes(step)
    return { view: "build", slug: ok ? step : null, page: null, mod: null }
  }
  if (head === "library" || head === "catalogue" || head === "sources") {
    return { view: head, slug: seg[1] ?? null, page: null, mod: null }
  }
  if (head === "playbook" || head === "forge") {
    return { view: head, slug: null, page: null, mod: seg[1] ?? null }
  }
  if (head === "site") {
    return { view: "site", slug: seg[1] ?? null, page: seg[2] ?? null, mod: null }
  }
  /* a bare slug (`#/maison-ember`) is a short library deep link */
  return { view: "library", slug: head, page: null, mod: null }
}

/** current hash split into [path, query] — query without the "?" */
function splitHash(): [string, URLSearchParams] {
  const raw = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : ""
  const qi = raw.indexOf("?")
  const path = qi === -1 ? raw : raw.slice(0, qi)
  const query = new URLSearchParams(qi === -1 ? "" : raw.slice(qi + 1))
  return [path, query]
}

/* ── legacy migration ─────────────────────────────────────────────── */

let migrated = false

/**
 * Old addresses → clean paths, once per load (and again only if a legacy
 * query string somehow reappears). Rewrites with replaceState so the
 * address bar shows the clean system path.
 */
function migrateLegacy(): void {
  if (migrated) return
  const p = new URLSearchParams(window.location.search)
  const view = p.get("view")
  const t = p.get("t")
  const m = p.get("m")
  const finish = p.get("finish")
  const edition = p.get("edition")
  if (!view && !t && !m && !finish && !edition && !window.location.hash.startsWith("#m-") && !window.location.hash.startsWith("#published")) return

  const anchor = window.location.hash ? window.location.hash.slice(1) : ""
  let path = "/"
  if (isView(view) && view === "site" && t) path = `/site/${encodeURIComponent(t)}`
  else if (isView(view) && (view === "playbook" || view === "forge") && m) path = `/${view}/${encodeURIComponent(m)}`
  else if (isView(view) && view === "library" && anchor && anchor !== "published" && !anchor.startsWith("m-")) {
    path = `/library/${encodeURIComponent(anchor)}`
  } else if (isView(view)) path = `/${view}`
  else if (t) path = `/site/${encodeURIComponent(t)}`
  else if (m) path = `/forge/${encodeURIComponent(m)}`
  else if (anchor.startsWith("m-")) path = `/playbook/${encodeURIComponent(anchor.slice(2))}`
  else if (anchor && anchor !== "published" && !anchor.includes("/")) path = `/library/${encodeURIComponent(anchor)}`

  const q = new URLSearchParams()
  if (finish) q.set("finish", finish)
  if (edition) q.set("edition", edition)
  if (anchor === "published") q.set("published", "1")
  if (isView(view) && view === "forge" && t) q.set("on", t)
  const qs = q.toString()
  window.history.replaceState(null, "", `${window.location.pathname}#${path}${qs ? `?${qs}` : ""}`)
  migrated = true
}

/* ── the public surface ───────────────────────────────────────────── */

export function readLocation(): LocationState {
  if (typeof window === "undefined") {
    return { view: "home", slug: null, page: null, mod: null, finish: "", edition: "", on: null, published: false }
  }
  migrateLegacy()

  let [path, query] = splitHash()

  /* legacy anchors that predate the path system (#m-<id>, #published) */
  if (!path.startsWith("/") && path) {
    if (path.startsWith("m-")) {
      window.history.replaceState(null, "", `${window.location.pathname}#/playbook/${encodeURIComponent(path.slice(2))}${window.location.hash.includes("?") ? window.location.hash.slice(window.location.hash.indexOf("?")) : ""}`)
      ;[path, query] = splitHash()
    } else if (path === "published") {
      const q = new URLSearchParams(query)
      q.set("published", "1")
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.hash.split("?")[0]}?${q.toString()}`)
      ;[path, query] = splitHash()
      path = path || "/"
    } else {
      /* #maison-ember — the old library stage anchor */
      window.history.replaceState(null, "", `${window.location.pathname}#/library/${encodeURIComponent(path)}${window.location.hash.includes("?") ? window.location.hash.slice(window.location.hash.indexOf("?")) : ""}`)
      ;[path, query] = splitHash()
    }
  }

  const parsed = parsePath(path.startsWith("/") ? path : `/${path}`)
  return {
    view: parsed.view,
    slug: parsed.slug,
    page: parsed.page,
    mod: parsed.mod,
    finish: query.get("finish") ?? "",
    edition: query.get("edition") ?? "",
    on: query.get("on") ?? null,
    published: query.get("published") === "1",
  }
}

/** Navigate to a system path — `go("/site/ember-oak/menu")`. */
export function go(path: string, opts: { replace?: boolean } = {}) {
  const clean = path.startsWith("/") ? path : `/${path}`
  const url = `${window.location.pathname}#${clean}`
  if (opts.replace) window.history.replaceState(null, "", url)
  else window.history.pushState(null, "", url)
  window.dispatchEvent(new CustomEvent(NAV_EVENT))
}

/** Navigate while keeping the current state params (?finish= ?edition= …). */
export function goKeepingParams(path: string, opts: { replace?: boolean } = {}) {
  const [, query] = splitHash()
  const qs = query.toString()
  go(qs ? `${path}?${qs}` : path, opts)
}

export type ParamKey = "finish" | "edition" | "on" | "published"

/** Set / clear a state param in place — identity (the path) is untouched. */
export function setParam(key: ParamKey, value: string | boolean | null) {
  const [path, query] = splitHash()
  if (value === null || value === false || value === "") query.delete(key)
  else query.set(key, value === true ? "1" : value)
  const qs = query.toString()
  window.history.replaceState(null, "", `${window.location.pathname}#${path}${qs ? `?${qs}` : ""}`)
  window.dispatchEvent(new CustomEvent(NAV_EVENT))
}

/** The current clean path (with state params) — for readouts and hrefs. */
export function systemPath(): string {
  const [path, query] = splitHash()
  const qs = query.toString()
  return `${path || "/"}${qs ? `?${qs}` : ""}`
}

/** Build an href for <a> anchors — `href("/site/ember-oak")` → `#/site/ember-oak`. */
export function href(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`
  return `#${clean}`
}
