import { Suspense, useEffect, useMemo, useState } from "react"
import { decodeGenome, isGenome, type Genome } from "./engine/genome"
import { findTemplate, TEMPLATES } from "./engine/registry"
import { applyTokens, resolve } from "./engine/resolve"
import { SITES } from "./sites"
import { SiteContext } from "./kit/site-kit"
import "./kit/base.css"

/**
 * The renderer — ported from src/kit/site-main.tsx. Loads ONE template
 * full-page and listens to the library shell (when framed) for genome
 * changes and page jumps. Opened on its own, it is simply that
 * business's website. In this port the shell frames "/?t=<slug>" so the
 * slug (and the optional ?g= genome string) arrive as props.
 */

export function SiteDocument({ slug, g }: { slug: string; g?: string | null }) {
  const tpl = findTemplate(slug) ?? TEMPLATES[0]
  const Site = SITES[tpl.slug]
  const pageIds = useMemo(() => tpl.pages.map((p) => p.id), [tpl])
  const embedded = typeof window !== "undefined" && window.parent !== window

  const initialPage = useMemo(() => {
    if (typeof location === "undefined") return "home"
    const h = location.hash.slice(1)
    const p = new URLSearchParams(location.search).get("p")
    if (h && pageIds.includes(h)) return h
    if (p && pageIds.includes(p)) return p
    return "home"
  }, [])

  const [genome, setGenome] = useState<Genome>(() => decodeGenome(g ?? null))
  const [page, setPage] = useState(initialPage)
  const tokens = useMemo(() => resolve(tpl, genome), [tpl, genome])

  useEffect(() => {
    applyTokens(document.documentElement, tokens)
  }, [tokens])

  const post = (msg: Record<string, unknown>) => {
    if (embedded) window.parent.postMessage({ source: "gos-site", slug: tpl.slug, ...msg }, "*")
  }

  function go(next: string) {
    if (!pageIds.includes(next)) return
    setPage(next)
    window.scrollTo({ top: 0, behavior: "auto" })
    post({ type: "page", page: next })
    if (!embedded) history.replaceState(null, "", next === "home" ? location.pathname + location.search : `#${next}`)
  }

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data as { source?: string; type?: string; genome?: unknown; page?: string }
      if (!d || d.source !== "gos-shell") return
      if (d.type === "genome" && isGenome(d.genome)) setGenome(d.genome)
      if (d.type === "go" && d.page && pageIds.includes(d.page)) go(d.page)
    }
    window.addEventListener("message", onMsg)
    post({ type: "ready", page })
    return () => window.removeEventListener("message", onMsg)
  }, [])

  useEffect(() => {
    if (embedded) return
    const onHash = () => {
      const h = location.hash.slice(1)
      if (pageIds.includes(h)) setPage(h)
      else if (!h) setPage("home")
    }
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [])

  const ctx = useMemo(() => ({ page, go, motion: tokens.motion, tier: tpl.tier, embedded }), [page, tokens.motion, tpl, embedded])

  return (
    <SiteContext.Provider value={ctx}>
      <Suspense fallback={<div className="site-loading">Loading {tpl.name}</div>}>
        <Site />
      </Suspense>
    </SiteContext.Provider>
  )
}
