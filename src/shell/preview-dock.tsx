"use client"

/**
 * PreviewDock — the AI Studio's permanent preview zone.
 *
 * The chat (or any guided family) lives on the left; this dock lives on the
 * right and shows, at all times, what the engine is building:
 *
 *   building  → the live build log — every streamed loop step landing the
 *               moment it happens, in the mini browser chrome
 *   staged    → the staged site itself, rendering live through the same
 *               SiteFrame the Builder and the full-page view use
 *   idle      → the honest placeholder: what lands here and how to start
 *
 * The staged site comes from the shared Builder store (which the agent's
 * site actions auto-stage into), so the preview survives tab switches and
 * navigation — the zone never "goes missing", it holds the last build.
 */
import { useState } from "react"
import { ArrowRight, Check, ExternalLink, Monitor, PanelRightClose, PanelRightOpen, Smartphone, Wand2 } from "lucide-react"
import { useBuildActivity } from "@/engine/build-activity"
import { findTemplate } from "@/engine/registry"
import { go, href } from "@/engine/nav"
import { NATIVE } from "@/engine/genome"
import { SiteFrame } from "./site-frame"
import { useBuilder } from "./views/builder"
import { BuildProgress, btnGhostCx } from "./views/ai-kit"

/* the collapsed state survives family switches — module scope, like the drafts */
let savedCollapsed = false

export function PreviewDock() {
  const activity = useBuildActivity()
  const build = useBuilder()
  const [collapsed, setCollapsed] = useState(savedCollapsed)
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop")

  const toggle = (v: boolean) => {
    savedCollapsed = v
    setCollapsed(v)
  }

  /* the staged site — from this run, else the persistent Builder store */
  const slug = activity.siteSlug ?? build.tplSlug
  const tpl = slug ? findTemplate(slug) : null
  const business = activity.siteName ?? (build.tplSlug ? build.name : null)

  /* ── collapsed: a slim always-visible rail ── */
  if (collapsed) {
    return (
      <aside className="flex min-h-0 flex-col items-center gap-3 rounded-2xl border border-border bg-card p-2.5" aria-label="Preview zone">
        <button
          type="button"
          onClick={() => toggle(false)}
          className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition hover:text-foreground"
          aria-label="Expand the preview zone"
          title="Expand the preview"
        >
          <PanelRightOpen className="size-4" aria-hidden />
        </button>
        <div className="flex min-h-0 flex-1 flex-col items-center gap-2 overflow-hidden py-1" aria-hidden>
          <span
            className="flex-none rounded-md bg-primary/10 px-1.5 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-primary"
            style={{ writingMode: "vertical-rl" }}
          >
            {activity.status === "building" ? "building" : tpl ? tpl.name : "preview"}
          </span>
          {activity.status === "building" && (
            <span className="relative mt-1 flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
          )}
        </div>
      </aside>
    )
  }

  return (
    <aside
      className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-card"
      aria-label="Live preview zone"
      aria-live="polite"
    >
      {/* ── the dock header ── */}
      <div className="flex flex-none items-center gap-2 border-b border-border bg-muted/40 px-3.5 py-2.5">
        <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-foreground">
          {activity.status === "building" ? (
            <>
              <span className="relative flex size-2" aria-hidden>
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              Building
            </>
          ) : activity.status === "error" ? (
            <>Interrupted</>
          ) : tpl ? (
            <>
              <Check className="size-3.5 text-primary" aria-hidden />
              {tpl.name}
            </>
          ) : (
            <>Preview</>
          )}
        </span>
        <span className="min-w-0 flex-1 truncate font-mono text-[10.5px] text-muted-foreground">
          {(business || tpl?.name || "your-site").toLowerCase().replace(/[^a-z0-9]+/g, "")}.com
        </span>
        {tpl && (
          <div className="flex items-center gap-1" role="radiogroup" aria-label="Preview size">
            {([["desktop", Monitor], ["mobile", Smartphone]] as const).map(([id, Icon]) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={device === id}
                aria-label={id}
                onClick={() => setDevice(id)}
                className={`grid size-7 place-items-center rounded-md border transition-colors ${
                  device === id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted/60"
                }`}
              >
                <Icon className="size-3.5" aria-hidden />
              </button>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => toggle(true)}
          className="grid size-7 place-items-center rounded-md border border-border text-muted-foreground transition hover:text-foreground"
          aria-label="Collapse the preview zone"
          title="Collapse"
        >
          <PanelRightClose className="size-3.5" aria-hidden />
        </button>
      </div>

      {/* ── the live build log while the engine runs ── */}
      {activity.status === "building" && (
        <div className="flex-none p-3">
          <BuildProgress
            steps={activity.steps}
            siteName={activity.siteSlug ? business || tpl?.name || null : null}
            notice={
              activity.notice ??
              (activity.steps.length >= 2
                ? "sub-agents are writing your copy and picking the design — this is the longest step"
                : null)
            }
          />
        </div>
      )}

      {/* ── the staged site, rendering live ── */}
      {tpl ? (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto border-t border-border bg-muted/20">
            <SiteFrame
              tpl={tpl}
              genome={build.tplSlug ? build.genome : NATIVE}
              page="home"
              width={device === "mobile" ? 390 : "100%"}
              style={{ margin: "0 auto" }}
              remountKey={`${tpl.slug}-${device}`}
            />
          </div>
          <div className="flex flex-none flex-wrap items-center gap-2 border-t border-border bg-muted/30 px-3.5 py-2.5">
            <button type="button" className={`${btnGhostCx} h-8 px-3 text-xs`} onClick={() => go("/build/design")}>
              <Wand2 className="size-3.5" aria-hidden /> Open in Builder
            </button>
            <a
              href={href(`/site/${tpl.slug}`)}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground transition hover:text-foreground"
            >
              <ExternalLink className="size-3" aria-hidden /> Full page
            </a>
            {activity.status === "done" && (
              <span className="ml-auto inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-primary">
                <Check className="size-3" aria-hidden /> staged automatically
              </span>
            )}
          </div>
        </>
      ) : (
        /* ── idle: the honest placeholder — what lands here, how to start ── */
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
          <span aria-hidden className="grid size-11 place-items-center rounded-xl border border-dashed border-border bg-muted/40">
            <Monitor className="size-5 text-muted-foreground" />
          </span>
          <p className="max-w-[26ch] text-[13px] leading-relaxed text-muted-foreground">
            {activity.status === "building"
              ? "The engine is working — your site renders here the moment it picks the design."
              : "Ask the agent for a website — the build log streams here live, then the finished site renders right in this zone."}
          </p>
          <button type="button" className={`${btnGhostCx} h-8 px-3 text-xs`} onClick={() => go("/ai/agent")}>
            Ask the agent <ArrowRight className="size-3.5" aria-hidden />
          </button>
        </div>
      )}
    </aside>
  )
}
