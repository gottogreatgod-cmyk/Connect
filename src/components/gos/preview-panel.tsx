"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  Check,
  Download,
  ExternalLink,
  Loader2,
  Monitor,
  PanelRightClose,
  RotateCw,
  Smartphone,
  Tablet,
  TriangleAlert,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { BuildPhase, DesignSeed, SiteMeta, Verification } from "@/lib/gos/types"
import { cn } from "@/lib/utils"

type Device = "desktop" | "tablet" | "mobile"

const DEVICE_WIDTH: Record<Device, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
}

export interface CurrentSite extends SiteMeta {
  html: string
  verification?: Verification | null
}

interface PreviewPanelProps {
  site: CurrentSite | null
  building: boolean
  /** the code stream so far — rendered live while the build runs */
  buildHtml?: string
  buildPhase?: BuildPhase | null
  buildError?: string | null
  /** the last agent run failed and nothing is on screen → offer a retry */
  buildFailed?: boolean
  onRetry?: () => void
  onCollapse?: () => void
}

// ── live build helpers ──────────────────────────────────────────────────────

/** Remove script blocks from a partial document (live view re-parses often;
 * scripts run in the FINAL sandboxed render instead). Handles a <script that
 * is still open at the tail of the stream. */
function stripLiveScripts(s: string): string {
  return s.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<script[^>]*$/i, "")
}

/** Try to read the design seed out of a PARTIAL stream (progressive JSON). */
function parsePartialSeed(stream: string): DesignSeed | null {
  const marker = stream.indexOf("===DESIGN===")
  if (marker === -1) return null
  const region = stream.slice(marker, stream.indexOf("===HEAD===", marker) > -1
    ? stream.indexOf("===HEAD===", marker)
    : undefined)
  const first = region.indexOf("{")
  const last = region.lastIndexOf("}")
  if (first === -1 || last <= first) return null
  try {
    return JSON.parse(region.slice(first, last + 1)) as DesignSeed
  } catch {
    return null
  }
}

/** Compose a renderable document from the partial stream.
 *  - new build: slice from <!DOCTYPE / <html onward
 *  - edit build (===BODY=== marker): reuse the live site's head + partial body */
function composeLiveDoc(stream: string, currentHtml?: string): string {
  if (!stream) return ""

  const bodyMarker = stream.indexOf("===BODY===")
  if (bodyMarker !== -1 && currentHtml) {
    const headEnd = currentHtml.toLowerCase().indexOf("<body")
    const head = headEnd > 0 ? currentHtml.slice(0, headEnd) : currentHtml
    let partial = stream.slice(bodyMarker + "===BODY===".length).trim()
    const bIdx = partial.toLowerCase().indexOf("<body")
    if (bIdx >= 0) partial = partial.slice(bIdx)
    else partial = `<body>\n${partial}`
    partial = stripLiveScripts(partial)
    if (!/<\/body>/i.test(partial)) partial += "\n</body>"
    if (!/<\/html>/i.test(partial)) partial += "\n</html>"
    return `${head}\n${partial}`
  }

  const idx = stream.search(/<!doctype|<html/i)
  if (idx === -1) return ""
  let raw = stream.slice(idx)
  if (!/<body/i.test(raw)) return "" // design phase — no document body yet
  raw = stripLiveScripts(raw)
  if (!/<\/body>/i.test(raw)) raw += "\n</body>"
  if (!/<\/html>/i.test(raw)) raw += "\n</html>"
  return raw
}

/** Which sections of the page have landed in the stream so far. */
function detectSections(doc: string, stream: string): string[] {
  const done: string[] = []
  if (/<\/head>|<style/i.test(stream)) done.push("design system")
  if (/<header[\s>]/i.test(doc)) done.push("header")
  if (/class="[^"]*\bhero\b/i.test(doc)) done.push("hero")
  if (/marquee/i.test(doc)) done.push("ticker")
  const sections = (doc.match(/<section[\s>]/gi) ?? []).length
  if (sections > 0) done.push(`${sections} section${sections > 1 ? "s" : ""}`)
  if (/class="[^"]*\bstats\b/i.test(doc)) done.push("stats")
  if (/class="[^"]*\bquotes?\b/i.test(doc)) done.push("testimonials")
  if (/cta-band/i.test(doc)) done.push("cta")
  if (/<footer[\s>]/i.test(doc)) done.push("footer")
  if (/<\/html>/i.test(stream)) done.push("complete")
  return done
}

export function PreviewPanel({
  site,
  building,
  buildHtml = "",
  buildPhase,
  buildError,
  buildFailed,
  onRetry,
  onCollapse,
}: PreviewPanelProps) {
  const [device, setDevice] = useState<Device>("desktop")
  const [reloadKey, setReloadKey] = useState(0)

  // ── live build: throttled snapshot of the code stream (avoids re-parsing
  // the iframe document on every single token)
  const htmlRef = useRef("")
  const [liveDoc, setLiveDoc] = useState("")
  useEffect(() => {
    htmlRef.current = buildHtml
  }, [buildHtml])
  useEffect(() => {
    if (!building) return
    const sync = () => setLiveDoc((cur) => (cur === htmlRef.current ? cur : htmlRef.current))
    const kick = setTimeout(sync, 0) // immediate first snapshot (async, not in effect body)
    const t = setInterval(sync, 600)
    return () => {
      clearTimeout(kick)
      clearInterval(t)
    }
  }, [building])

  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (!building) return
    const t0 = Date.now()
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - t0) / 1000)), 1000)
    return () => {
      clearInterval(t)
      setElapsed(0)
    }
  }, [building])

  const composed = useMemo(() => composeLiveDoc(liveDoc, site?.html), [liveDoc, site?.html])
  const sections = useMemo(() => detectSections(composed, liveDoc), [composed, liveDoc])
  const seed = useMemo(() => parsePartialSeed(liveDoc), [liveDoc])
  const kb = (buildHtml.length / 1024).toFixed(1)

  const makeBlobUrl = () =>
    site ? URL.createObjectURL(new Blob([site.html], { type: "text/html" })) : null

  const download = () => {
    if (!site) return
    const url = makeBlobUrl()
    if (!url) return
    const a = document.createElement("a")
    a.href = url
    a.download = `${site.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-v${site.version}.html`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }

  const openExternal = () => {
    const url = makeBlobUrl()
    if (url) window.open(url, "_blank")
  }

  // final site wins once the run stops building; the live stream shows during
  // the build, and a partial document stays up if the build broke mid-stream
  const showFinalSite = !!site && !building
  const showLiveBuild = building
  const showBrokenBuild = !building && !!buildError && (!!composed || !!liveDoc)
  const showErrorCard = !building && !!buildFailed && !composed && !site

  return (
    <div className="flex h-full min-h-0 flex-col bg-background/40">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/70 px-4 py-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span
            className={cn(
              "h-2 w-2 shrink-0 rounded-full",
              building || showLiveBuild
                ? "gos-pulse-dot bg-primary"
                : site
                  ? "bg-primary"
                  : "bg-border",
            )}
          />
          <span className="truncate font-display text-sm font-medium">
            {building
              ? (buildPhase?.label ?? "Building…")
              : site
                ? site.name
                : "Preview"}
          </span>
          {site && !building && (
            <>
              <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                v{site.version}
              </span>
              {site.score != null && (
                <span
                  className={cn(
                    "shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold",
                    site.score >= 80 ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                  )}
                >
                  {site.score}/100
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {showFinalSite && (
            <div className="flex items-center rounded-lg border border-border/70 p-0.5">
              {(
                [
                  ["desktop", Monitor],
                  ["tablet", Tablet],
                  ["mobile", Smartphone],
                ] as const
              ).map(([d, Icon]) => (
                <button
                  key={d}
                  onClick={() => setDevice(d)}
                  aria-label={`${d} width`}
                  className={cn(
                    "rounded-md p-1.5 transition-colors",
                    device === d
                      ? "bg-accent text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
          )}
          {showFinalSite && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setReloadKey((k) => k + 1)}
              aria-label="Reload preview"
            >
              <RotateCw className="h-3.5 w-3.5" />
            </Button>
          )}
          {showFinalSite && site.verification && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2 font-mono text-[11px]">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  checks
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="p-2">
                  <p className="px-1 pb-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    verification · {site.verification.score}/100
                  </p>
                  {site.verification.checks.map((c) => (
                    <div key={c.id} className="flex items-center gap-2 rounded px-1 py-1.5">
                      <span
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded text-[10px]",
                          c.pass ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive",
                        )}
                      >
                        {c.pass ? "✓" : "✗"}
                      </span>
                      <span className="flex-1 text-xs">{c.label}</span>
                      {c.detail && (
                        <span className="font-mono text-[10px] text-muted-foreground">{c.detail}</span>
                      )}
                    </div>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {showFinalSite && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={download}
                aria-label="Download HTML"
              >
                <Download className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={openExternal}
                aria-label="Open in new tab"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
          {onCollapse && (
            <Button
              variant="ghost"
              size="icon"
              className="hidden h-8 w-8 lg:inline-flex"
              onClick={onCollapse}
              aria-label="Collapse preview panel"
              title="Collapse preview"
            >
              <PanelRightClose className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* viewport */}
      <div className="gos-scroll min-h-0 flex-1 overflow-auto p-3">
        {showFinalSite ? (
          <div
            className="gos-rise mx-auto h-full transition-all duration-300"
            style={{ width: DEVICE_WIDTH[device], maxWidth: "100%" }}
          >
            <div className="h-full overflow-hidden rounded-xl border border-border/70 bg-white shadow-2xl shadow-black/40">
              <iframe
                key={`${site.id}-${site.version}-${reloadKey}`}
                title={`Preview of ${site.name}`}
                srcDoc={site.html}
                sandbox="allow-scripts allow-popups allow-forms"
                className="h-full min-h-[600px] w-full border-0"
              />
            </div>
          </div>
        ) : showLiveBuild ? (
          <div className="flex h-full min-h-0 flex-col gap-3">
            {/* build console */}
            <div className="shrink-0 rounded-xl border border-primary/25 bg-primary/5 px-3.5 py-2.5">
              <div className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-primary" />
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground/90">
                  {buildPhase?.label ?? "Preparing the build…"}
                </span>
                <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                  {kb}KB · {elapsed}s
                </span>
              </div>
              {seed && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {[seed.archetype, seed.palette, seed.typography, seed.voice].filter(Boolean).map((bit) => (
                    <span
                      key={bit}
                      className="rounded-md border border-primary/20 bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] text-primary"
                    >
                      {bit}
                    </span>
                  ))}
                </div>
              )}
              {sections.length > 0 && (
                <div className="mt-1.5 flex flex-wrap items-center gap-1">
                  {sections.map((s, i) => (
                    <span key={`${s}-${i}`} className="flex items-center gap-1">
                      {i > 0 && <span className="font-mono text-[9px] text-muted-foreground/50">→</span>}
                      <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                        {s === "complete" ? "✓" : "✓"} {s}
                      </span>
                    </span>
                  ))}
                  {buildPhase?.phase !== "complete" && (
                    <span className="gos-pulse-dot ml-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </div>
              )}
            </div>

            {/* the document, rendering live as the code is written */}
            {composed ? (
              <div className="gos-rise min-h-0 flex-1 overflow-hidden rounded-xl border border-border/70 bg-white shadow-2xl shadow-black/40">
                <iframe
                  key="live-build"
                  title="Live build — rendering as code is written"
                  srcDoc={composed}
                  sandbox="allow-scripts allow-popups allow-forms"
                  className="h-full min-h-[420px] w-full border-0"
                />
              </div>
            ) : (
              <div className="gos-grid-bg flex min-h-0 flex-1 flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-primary/30 p-8 text-center">
                <div className="w-full max-w-sm space-y-3">
                  <div className="gos-shimmer h-8 w-2/3 rounded-lg" />
                  <div className="gos-shimmer h-24 w-full rounded-lg" />
                  <div className="gos-shimmer h-4 w-1/2 rounded" />
                </div>
                <p className="max-w-xs text-[13px] leading-relaxed text-muted-foreground">
                  The design system is being written — palette, type, motion tokens.
                  The page assembles here section by section the moment the document
                  starts.
                </p>
              </div>
            )}
          </div>
        ) : showBrokenBuild ? (
          <div className="flex h-full min-h-0 flex-col gap-3">
            <div className="flex shrink-0 items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-3.5 py-3">
              <TriangleAlert className="h-4 w-4 shrink-0 text-destructive" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-destructive">The build broke mid-stream</p>
                <p className="truncate text-[11px] text-muted-foreground">{buildError}</p>
              </div>
              {onRetry && (
                <Button size="sm" onClick={onRetry} className="shrink-0 gap-1.5">
                  <RotateCw className="h-3.5 w-3.5" />
                  Retry
                </Button>
              )}
            </div>
            <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-border/70 bg-white shadow-2xl shadow-black/40">
              <iframe
                key="broken-build"
                title="Partial build — the document up to the failure"
                srcDoc={composed || "<!DOCTYPE html><html><body></body></html>"}
                sandbox="allow-scripts allow-popups allow-forms"
                className="h-full min-h-[420px] w-full border-0"
              />
            </div>
          </div>
        ) : showErrorCard && onRetry ? (
          <div className="gos-grid-bg flex h-full flex-col items-center justify-center gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-destructive/30 bg-destructive/10">
              <TriangleAlert className="h-5 w-5 text-destructive" />
            </span>
            <div>
              <h3 className="font-display text-base font-semibold text-foreground/90">The last run failed</h3>
              <p className="mx-auto mt-1.5 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
                Nothing reached the preview. Transient failures are common — one retry usually goes through.
              </p>
            </div>
            <Button onClick={onRetry} className="gap-2">
              <RotateCw className="h-4 w-4" />
              Retry the build
            </Button>
          </div>
        ) : (
          <div className="gos-grid-bg flex h-full flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border/70 p-8 text-center">
            <div className="flex gap-1.5">
              <span className="gos-pulse-dot h-2.5 w-2.5 rounded-full bg-primary/70" />
              <span className="gos-pulse-dot h-2.5 w-2.5 rounded-full bg-primary/50" />
              <span className="gos-pulse-dot h-2.5 w-2.5 rounded-full bg-primary/30" />
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-foreground/90">
                Nothing built yet
              </h3>
              <p className="mx-auto mt-1.5 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
                Ask the agent to build a site on the left — it renders here instantly, at any
                device width, and every version is kept.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
