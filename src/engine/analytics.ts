/**
 * Analytics — the Module Playbook's tracked-events vocabulary, ported from
 * OMNIFORGE and pointed at the Growth OS API. Every event carries the
 * view, template and finish tier — one decision the business can act on,
 * never free text or personal data.
 */

type Detail = Record<string, string | number | boolean | null | undefined>

let queue: { name: string; detail: Detail }[] = []
let flushing = false

function flush() {
  if (flushing || !queue.length) return
  flushing = true
  const batch = queue
  queue = []
  const body = batch.map((e) => ({
    name: e.name,
    route: typeof e.detail.view === "string" ? e.detail.view : undefined,
    template: typeof e.detail.slug === "string" ? e.detail.slug : undefined,
    tier: typeof e.detail.tier === "string" ? e.detail.tier : undefined,
    detail: JSON.stringify(e.detail).slice(0, 500),
  }))
  try {
    void fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ events: body }),
      keepalive: true,
    }).catch(() => {})
  } catch {
    /* analytics must never break the app */
  } finally {
    flushing = false
    if (queue.length) flush()
  }
}

export function track(name: string, detail: Detail = {}) {
  if (typeof window === "undefined") return
  queue.push({ name, detail })
  if (queue.length >= 8) flush()
  else window.setTimeout(flush, 1200)
}

/* The 23-event vocabulary from the Module Playbook (used across sites
   and shell). Shell events reuse the same names so the pulse readout is
   one coherent stream.) */
export const EVENT_NAMES = [
  "page_viewed", "cta_clicked", "form_started", "form_abandoned", "form_submitted",
  "booking_started", "booking_completed", "quote_started", "quote_completed",
  "product_viewed", "add_to_cart", "checkout_started", "purchase_completed",
  "donation_started", "donation_completed", "filter_used", "search_used",
  "media_opened", "portal_login", "recommendation_clicked", "call_clicked",
  "directions_clicked", "language_changed",
] as const

export type EventName = (typeof EVENT_NAMES)[number] | "template_viewed" | "edition_switched" | "finish_selected" | "genome_changed" | "palette_opened" | "concierge_used" | "spin_block_engaged"
