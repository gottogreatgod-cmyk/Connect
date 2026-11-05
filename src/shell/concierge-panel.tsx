"use client"

/**
 * Concierge panel — the grounded recommender surface, ported from
 * OMNIFORGE and merged with the Template Factory's AI concierge.
 * Two engines, one panel: the deterministic scorer (typed brief →
 * cited template list) and the AI librarian (LLM via /api/concierge,
 * grounded on the merged system). Gated to the Spectacle finish and
 * up (the palette's inline concierge works at every tier).
 */
import { useMemo, useRef, useState } from "react"
import { Bot, ConciergeBell, Loader2, Lock, Send, Sparkles, X } from "lucide-react"
import { askConcierge, CONCIERGE_CHIPS, type ConciergeAnswer } from "@/engine/concierge"
import { track } from "@/engine/analytics"
import { useFx } from "./fx"
import { useGos } from "./gos-context"

export function ConciergePanel() {
  const { caps } = useFx()
  const gos = useGos()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState("")
  const [submitted, setSubmitted] = useState<string | null>(null)
  /* the AI librarian thread — merged from the Template Factory concierge */
  const [ai, setAi] = useState<{ role: "user" | "assistant"; content: string }[]>([])
  const [aiBusy, setAiBusy] = useState(false)

  const answer: ConciergeAnswer | null = useMemo(() => (submitted ? askConcierge(submitted) : null), [submitted])

  const locked = !caps.concierge

  const ask = (brief: string) => {
    if (!brief.trim()) return
    setQ(brief)
    setSubmitted(brief)
    track("concierge_used", { query: brief.slice(0, 80) })
  }

  const sendAi = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || aiBusy) return
    const next = [...ai, { role: "user" as const, content: trimmed }]
    setAi(next)
    setAiBusy(true)
    track("concierge_used", { ai: true, query: trimmed.slice(0, 80) })
    try {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ template: "growthos", messages: next.slice(-8) }),
      })
      const data = await res.json()
      setAi((m) => [...m, { role: "assistant", content: data.reply ?? "The librarian could not answer — try the deterministic search above." }])
    } catch {
      setAi((m) => [...m, { role: "assistant", content: "The AI librarian is unreachable right now — the deterministic search above still works." }])
    } finally {
      setAiBusy(false)
    }
  }

  const openTemplate = (slug: string) => {
    gos.select(slug)
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => (locked ? undefined : setOpen((o) => !o))}
        className="gos-btn-ghost"
        aria-pressed={open}
        data-cursor-label={caps.cursorFx && !locked ? "ASK THE CONCIERGE" : undefined}
        title={locked ? "The concierge arrives with the Spectacle finish — ⌘K answers briefs at every tier" : "Ask the concierge (a typed brief)"}
        style={locked ? { opacity: 0.55 } : undefined}
      >
        {locked ? <Lock size={14} aria-hidden /> : <Sparkles size={14} aria-hidden />}
        <span className="hidden xl:inline">Concierge</span>
      </button>

      {open && !locked && (
        <div className="fixed inset-0 z-[70] flex justify-end bg-black/30 backdrop-blur-[2px]" onClick={() => setOpen(false)}>
          <aside
            className="ed-panel of-float-panel flex h-full w-full max-w-md flex-col border-l border-border bg-card text-foreground shadow-2xl"
            style={{ "--enter-x": "10px" } as React.CSSProperties}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Concierge"
          >
            <header className="flex items-center gap-3 border-b border-border px-5 py-4">
              <ConciergeBell size={17} className="text-primary" aria-hidden />
              <div className="flex-1">
                <h2 className="ed-display text-lg leading-tight">The concierge</h2>
                <p className="text-[11px] text-muted-foreground">Deterministic scoring over the 23 templates — every match cites its evidence. Or ask the AI concierge below.</p>
              </div>
              <button type="button" className="gos-icon-btn sm" onClick={() => setOpen(false)} aria-label="Close concierge">
                <X size={15} />
              </button>
            </header>

            <div className="border-b border-border px-5 py-4">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="concierge-q">
                Your brief
              </label>
              <textarea
                id="concierge-q"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    ask(q)
                  }
                }}
                rows={3}
                placeholder="A restaurant that takes bookings, needs a menu and fills two sittings a night…"
                className="mt-2 w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <div className="mt-3 flex flex-wrap gap-1.5">
                {CONCIERGE_CHIPS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => ask(c)}
                    className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="of-list-scroll flex-1 overflow-y-auto px-5 py-4">
              {!answer && !ai.length && (
                <p className="ed-eyebrow mb-2">Try a chip above, or type the business you need</p>
              )}
              {answer && (
                <div className="ed-rise">
                  <div className="flex items-center justify-between gap-3">
                    <p className="ed-display text-base">{answer.headline}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] ${
                        answer.confidence === "high" ? "bg-primary/15 text-primary" : answer.confidence === "medium" ? "bg-muted text-muted-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {answer.confidence} confidence
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{answer.note}</p>

                  {answer.items.length === 0 && (
                    <p className="mt-4 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                      Nothing scored — the library is honest. Try naming the business, the action you need
                      (bookings, quotes, listings) or the depth (portal, live tracking).
                    </p>
                  )}

                  <ul className="mt-4 flex flex-col gap-3">
                    {answer.items.map((item) => (
                      <li key={item.slug}>
                        <button
                          type="button"
                          onClick={() => openTemplate(item.slug)}
                          className="ed-card block w-full p-4 text-left transition-transform hover:-translate-y-0.5"
                          data-cursor-label={caps.cursorFx ? `OPEN · ${item.name.toUpperCase()}` : undefined}
                        >
                          <div className="flex items-baseline justify-between gap-3">
                            <b className="ed-display text-base">{item.name}</b>
                            <span className="font-mono text-[10px] text-primary">{item.score} pts</span>
                          </div>
                          <p className="mt-0.5 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                            {item.industry} · {item.tierPlan} · {item.kind}
                          </p>
                          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.why}</p>
                          <span className="mt-2 inline-block text-[11px] font-medium text-primary">Open this template →</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <AiLibrarian thread={ai} onSend={sendAi} busy={aiBusy} />
            </div>

            <footer className="border-t border-border px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
              Deterministic scorer + AI librarian (/api/concierge) · grounded on the registry
            </footer>
          </aside>
        </div>
      )}
    </>
  )
}

/* ── the AI librarian — merged from the Template Factory's AiConcierge,
   re-grounded on the Growth OS registry (see /api/concierge). ───── */
function AiLibrarian({
  thread,
  onSend,
  busy,
}: {
  thread: { role: "user" | "assistant"; content: string }[]
  onSend: (text: string) => void
  busy: boolean
}) {
  const [text, setText] = useState("")
  const endRef = useRef<HTMLDivElement>(null)

  return (
    <section className="mt-5 rounded-xl border border-dashed border-border p-3.5" aria-label="AI librarian">
      <p className="ed-eyebrow mb-1 flex items-center gap-1.5">
        <Bot size={12} aria-hidden /> AI librarian · grounded on the merged system
      </p>
      {thread.length > 0 && (
        <div className="of-list-scroll mt-2 max-h-72 space-y-2 overflow-y-auto pr-1">
          {thread.map((m, i) => (
            <p
              key={i}
              className={`max-w-[92%] whitespace-pre-wrap rounded-xl px-3 py-2 text-[12.5px] leading-relaxed ${
                m.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted text-foreground"
              }`}
            >
              {m.content}
            </p>
          ))}
          {busy && (
            <p className="flex w-fit items-center gap-2 rounded-xl bg-muted px-3 py-2 text-[12.5px] text-muted-foreground">
              <Loader2 size={12} className="animate-spin" aria-hidden /> thinking…
            </p>
          )}
          <div ref={endRef} />
        </div>
      )}
      <form
        className="mt-2.5 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          onSend(text)
          setText("")
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask: which template fits a bakery? what does Business add?"
          aria-label="Ask the AI librarian"
          className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-[12.5px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button
          type="submit"
          disabled={busy || !text.trim()}
          className="gos-btn-ghost shrink-0"
          aria-label="Send to the AI librarian"
        >
          {busy ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <Send size={14} aria-hidden />}
        </button>
      </form>
    </section>
  )
}
