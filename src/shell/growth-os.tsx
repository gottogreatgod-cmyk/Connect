"use client"

/**
 * GrowthOS — the single-route root of the merged system.
 *
 *   #/                        home — the OS's own landing (the guided tour)
 *   #/build[/<step>]          the Website Builder — the direct flow
 *   #/ai[/<family>]           the AI Intelligence layer — the agent +
 *                             preview dock, plus four guided families
 *   #/motion[/<demo>]         the Motion Lab
 *   #/sources                 the Source Ledger
 *   #/library[/<slug>]        the library; a slug stages that template
 *   #/catalogue               every template, searchable
 *   #/playbook[/<moduleId>]   the 344-module build standard
 *   #/forge[/<moduleId>]      any module, mounted live on any template
 *   #/site/<slug>[/<page>]    one template, full-bleed with consoles
 *
 * ONE shell, ONE header: the Topbar renders here, above every view, so
 * the system's eight destinations are always one click away — the header
 * never disappears, no matter where you are. (The only exception is the
 * site view's published mode — client presentation is chrome-free.)
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
import { Topbar } from "./topbar"
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
  /* the library sidebar drawer (narrow screens) — owned here so the
     topbar's hamburger and the library view share one source of truth */
  const [navOpen, setNavOpen] = useState(false)

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

  /* any navigation closes the drawer — navigating away from the library
     never leaves an open scrim behind (external-event subscription) */
  useEffect(() => {
    const close = () => setNavOpen(false)
    window.addEventListener(NAV_EVENT, close)
    window.addEventListener("popstate", close)
    return () => {
      window.removeEventListener(NAV_EVENT, close)
      window.removeEventListener("popstate", close)
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

  /* the one exception: published mode is a chrome-free client presentation */
  const showTopbar = !(view === "site" && (loc?.published ?? false))

  return (
    <MotionPrefProvider>
      <EditionProvider>
        <FxProvider finishId={finishId}>
          <GosProvider initialSlug={findTemplate(initialSlug) ? initialSlug : "maison-ember"} initialView={view === "ai" || view === "motion" || view === "build" || view === "sources" ? "library" : view}>
            <div className={`gos ${navOpen ? "nav-open" : ""}`} data-finish={finishId}>
              {/* ONE header for the whole system — never disappears */}
              {showTopbar && <Topbar navOpen={navOpen} onNav={setNavOpen} />}

              {/* the view fills the rest; each view manages its own scroll */}
              <div className="gos-view-flex">
                {view === "home" && <HomeView />}
                {view === "build" && <BuilderView step={loc?.slug ?? null} />}
                {view === "ai" && <AiStudioView skill={loc?.slug ?? null} />}
                {view === "motion" && <MotionLabView demo={loc?.slug ?? null} />}
                {view === "sources" && <SourcesView />}
                {view === "library" && <LibraryView finishId={finishId} navOpen={navOpen} onNav={setNavOpen} />}
                {view === "catalogue" && <CatalogueView />}
                {view === "forge" && <ForgeView />}
                {view === "playbook" && <PlaybookView />}
                {view === "site" && <SiteView slug={loc?.slug ?? null} page={loc?.page ?? null} published={loc?.published ?? false} />}
              </div>
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
