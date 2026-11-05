"use client"

import dynamic from "next/dynamic"
import type { CSSProperties } from "react"

/**
 * Client-side entry points. The original library was two client-only
 * bundles (index.html → shell, site.html → renderer); next/dynamic with
 * ssr:false keeps that behaviour in the App Router.
 */

function Boot({ label }: { label: string }) {
  const style: CSSProperties = {
    position: "fixed",
    inset: 0,
    display: "grid",
    placeItems: "center",
    gap: 10,
    background: "#f6f5f2",
    color: "#9a9892",
    fontFamily: "ui-monospace, monospace",
    fontSize: 12,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  }
  return (
    <div style={style} role="status" aria-live="polite">
      {label} — loading…
    </div>
  )
}

const Shell = dynamic(() => import("./shell/App").then((m) => ({ default: m.App })), {
  ssr: false,
  loading: () => <Boot label="Growth OS" />,
})

const Site = dynamic(() => import("./renderer").then((m) => ({ default: m.SiteDocument })), {
  ssr: false,
  loading: () => <Boot label="Template" />,
})

export function ShellEntry() {
  return <Shell />
}

export function SiteEntry({ slug, g }: { slug: string; g?: string | null }) {
  return <Site slug={slug} g={g} />
}
