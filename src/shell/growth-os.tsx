"use client"

/**
 * GrowthOS — the single-route root of the merged system.
 *
 *   #/                        home — the OS's own landing (front door)
 *   #/build[/<step>]          the Website Builder — the direct flow
 *   #/ai[/<family>]           the AI Intelligence layer — the agent +
 *   #/library[/<slug>]        the library; a slug stages that template
 *   #/catalogue               every template, searchable
 *   #/playbook[/<moduleId>]   the 344-module build standard
 *   #/forge[/<moduleId>]      any module, mounted live on any template
 *   #/site/<slug>[/<page>]    one template, full-bleed with consoles
 *
 * Providers: MotionPrefProvider (the nuke toggle) → EditionProvider (the
 * shell's skin) → FxProvider (the finish tier's effects caps). The
 * location is read after mount so SSR HTML and the first client render
 * agree (no hydration mismatch on deep links).
 */
import { useEffect, useState } from "react"
import { MotionPrefProvider } from "@/shell/motion"
import { NAV_EVENT, readLocation, setParam, type LocationState } from "@/engine/nav"
import { DEFAULT_FINISH, isFinishId, type FinishId } from "@/engine/finish"
import { track } from "@/engine/analytics"
import { findTemplate } from "@/engine/registry"
import { EditionProvider } from "./edition-provider"
import { CursorLabel, FxProvider } from "./fx"
import { CommandPalette } from "./command-palette"
import { GosProvider } from "./gos-context"
import { SwapTicker } from "./randomizer"
import "./shell.css"
import { LibraryView } from "./views/library"
import { HomeView } from "./views/home"
import { BuilderView } from "./views/builder"
import { AiStudioView } from "./views/ai-studio"
import { MotionLabView } from "./views/motion-lab"
import { SourcesView } from "./views/sources"
import { CatalogueView } from "./views/catalogue"
import { ForgeView } from "./views/forge"
import { PlaybookView } from "./views/playbook-view"
import { SiteView } from "./views/site-view"

export function GrowthOS() {
  /* null until mounted — SSR and the client's first render both show the
     home view (the bare-/ default); the real location applies after mount. */
  const [loc, setLoc] = useState<LocationState | null>(null)

  useEffect(() => {
    const sync = () => setLoc(readLocation())
    sync()
    window.addEventListener(NAV_EVENT, sync)
    window.addEventListener("popstate", sync)
    window.addEventListener("hashchange", sync)
    return () => {
      window.removeEventListener(NAV_EVENT, sync)
      window.removeEventListener("popstate", sync)
      window.removeEventListener("hashchange", sync)
    }
  }, [])

  /* deep-link guard: an unknown finish falls back to Showcase */
  useEffect(() => {
    const f = readLocation().finish
    if (f && !isFinishId(f)) setParam("finish", DEFAULT_FINISH)
  }, [])

  /* page_viewed per view change (the playbook's own event vocabulary) */
  useEffect(() => {
    if (loc) track("page_viewed", { view: loc.view, slug: loc.slug ?? undefined, page: loc.page ?? undefined })
  }, [loc?.view, loc?.slug, loc?.page])

  const finishId: FinishId = isFinishId(loc?.finish) ? loc!.finish : DEFAULT_FINISH
  const view = loc?.view ?? "home"
  const initialSlug = loc?.slug ?? "maison-ember"

  return (
    <MotionPrefProvider>
      <EditionProvider>
        <FxProvider finishId={finishId}>
          <GosProvider initialSlug={findTemplate(initialSlug) ? initialSlug : "maison-ember"} initialView={view === "ai" || view === "motion" || view === "build" || view === "sources" ? "library" : view}>
            <div className="gos" data-finish={finishId}>
              {view === "home" && <HomeView />}
              {view === "build" && <BuilderView step={loc?.slug ?? null} />}
              {view === "ai" && <AiStudioView skill={loc?.slug ?? null} />}
              {view === "motion" && <MotionLabView demo={loc?.slug ?? null} />}
              {view === "sources" && <SourcesView />}
              {view === "library" && <LibraryView finishId={finishId} />}
              {view === "catalogue" && <CatalogueView />}
              {view === "forge" && <ForgeView />}
              {view === "playbook" && <PlaybookView />}
              {view === "site" && <SiteView slug={loc?.slug ?? null} page={loc?.page ?? null} published={loc?.published ?? false} />}
            </div>
            <CommandPalette finishId={finishId} />
            <CursorLabel />
            <SwapTicker />
          </GosProvider>
        </FxProvider>
      </EditionProvider>
    </MotionPrefProvider>
  )
}
