"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Cookie, Send, Sparkles, X, TriangleAlert, Mountain, Wine as WineIcon, ConciergeBell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/store/useApp";
import { CONCIERGE_DISCLAIMER, CONCIERGE_PROMPTS } from "@/lib/site";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };
type Mode = "host" | "sommelier" | "guide";

const MODE_META: Record<Mode, { label: string; icon: React.ElementType; hello: string }> = {
  host: {
    label: "Host",
    icon: ConciergeBell,
    hello: "Good day — the counter here. Tell me who’s coming and when; I’ll build the stay.",
  },
  sommelier: {
    label: "Sommelier",
    icon: WineIcon,
    hello: "The cellar speaking. Tell me the course or the mood — I’ll pour from the real list.",
  },
  guide: {
    label: "Guide",
    icon: Mountain,
    hello: "Trailhead. Tell me honestly how the knees feel and how many hours you want — I’ll match the route.",
  },
};

/**
 * ConciergeWidget — AiConcierge with three moods, gated by CookieConsent.
 * Talks to /api/concierge (LLM) with the valley’s real data as its ground truth.
 */
export function ConciergeWidget() {
  const open = useApp((s) => s.conciergeOpen);
  const mode = useApp((s) => s.conciergeMode);
  const setConcierge = useApp((s) => s.setConcierge);
  const consent = useApp((s) => s.consent);
  const setConsent = useApp((s) => s.setConsent);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGate, setShowGate] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const meta = MODE_META[mode];
  const prompts = CONCIERGE_PROMPTS.filter((_, i) => (mode === "host" ? [0, 3] : mode === "sommelier" ? [1] : [2]).includes(i));

  useEffect(() => {
    if (open) {
      setMsgs((m) => (m.length ? m : [{ role: "assistant", content: mode === "host" ? MODE_META.host.hello : mode === "sommelier" ? MODE_META.sommelier.hello : MODE_META.guide.hello }]));
    }
  }, [open, mode]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: reduced ? "auto" : "smooth" });
  }, [msgs, busy, reduced]);

  const send = async (text: string) => {
    const clean = text.trim();
    if (!clean || busy) return;
    if (consent !== "granted") {
      setShowGate(true);
      return;
    }
    setError(null);
    setInput("");
    const next: Msg[] = [...msgs, { role: "user", content: clean }];
    setMsgs(next);
    setBusy(true);
    try {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.filter((m) => m.role === "user" || m.role === "assistant").slice(-10), mode }),
      });
      if (!res.ok) throw new Error("bad status");
      const data = (await res.json()) as { reply?: string };
      if (!data.reply) throw new Error("empty");
      setMsgs((m) => [...m, { role: "assistant", content: data.reply! }]);
    } catch {
      setError("The walkie gave up. Try again — or call the counter, they always answer.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* Launcher */}
      <Button
        onClick={() => (consent === "granted" ? setConcierge(!open) : (setConcierge(true), setShowGate(true)))}
        aria-label="Ask the valley — AI concierge"
        data-tour="concierge"
        data-cursor="Ask"
        className={cn(
          "fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-2xl transition-transform hover:scale-105 lg:bottom-8 lg:right-8",
          open && "scale-0 opacity-0",
        )}
      >
        <Sparkles className={cn("h-6 w-6", consent === "granted" ? "text-cream" : "text-cream/70")} />
        {consent !== "granted" && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-card bg-[#e8c089]" aria-hidden />}
      </Button>

      {/* Panel */}
      {open && (
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-label="AI concierge"
          className="fixed bottom-36 right-4 z-40 flex h-[min(34rem,72vh)] w-[min(24.5rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl lg:bottom-24 lg:right-8"
        >
          {/* header */}
          <div className="flex items-start justify-between gap-3 border-b bg-pine p-4 text-cream dark:bg-[#20342c]">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream/15">
                <meta.icon className="h-5 w-5 text-[#e8c089]" aria-hidden />
              </span>
              <div>
                <p className="font-display text-base font-semibold leading-tight text-cream">Ask the valley</p>
                <p className="text-[11px] text-cream/70">{CONCIERGE_DISCLAIMER}</p>
              </div>
            </div>
            <button onClick={() => setConcierge(false)} aria-label="Close concierge" className="rounded-full p-1.5 text-cream/80 hover:bg-cream/10">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* mode switch */}
          <div className="flex items-center gap-1.5 border-b px-3 py-2" role="tablist" aria-label="Concierge mode">
            {(Object.keys(MODE_META) as Mode[]).map((m) => {
              const M = MODE_META[m];
              return (
                <button
                  key={m}
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => {
                    useApp.getState().setConcierge(true, m);
                    setMsgs([{ role: "assistant", content: M.hello }]);
                    setError(null);
                  }}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    mode === m ? "bg-pine text-cream dark:bg-ember dark:text-ink" : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  <M.icon className="h-3.5 w-3.5" aria-hidden /> {M.label}
                </button>
              );
            })}
          </div>

          {/* messages */}
          <div ref={listRef} className="scroll-slim flex-1 space-y-3 overflow-y-auto p-4">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  m.role === "user"
                    ? "ml-auto rounded-br-md bg-pine text-cream dark:bg-ember dark:text-ink"
                    : "mr-auto rounded-bl-md border bg-background/70",
                )}
              >
                {m.content}
              </div>
            ))}
            {busy && (
              <div className="mr-auto flex items-center gap-2 rounded-2xl border bg-background/70 px-3.5 py-3 text-sm text-muted-foreground">
                <span className="flex gap-1" aria-hidden>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ember [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ember [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ember [animation-delay:300ms]" />
                </span>
                thinking about it properly…
              </div>
            )}
            {error && (
              <div role="alert" className="mr-auto flex items-start gap-2 rounded-2xl border border-[#e8c089]/50 bg-ember-soft/50 px-3.5 py-3 text-sm dark:bg-ember-soft/25">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#8a6b2a] dark:text-[#e8c089]" aria-hidden />
                <span>
                  {error}{" "}
                  <button className="font-medium underline" onClick={() => send(msgs.filter((m) => m.role === "user").slice(-1)[0]?.content ?? "")}>
                    Retry
                  </button>
                </span>
              </div>
            )}
            {msgs.length <= 1 && !busy && (
              <div className="flex flex-wrap gap-2 pt-1">
                {prompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    className="rounded-full border px-3 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:border-ember/60 hover:text-foreground"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* input */}
          <form
            className="flex items-center gap-2 border-t p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={consent === "granted" ? "Ask anything about the valley…" : "Accept cookies to wake the concierge"}
              disabled={consent !== "granted"}
              aria-label="Message the concierge"
              className="h-10 flex-1 rounded-full border bg-background/60 px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
            />
            <Button type="submit" size="icon" disabled={busy || !input.trim() || consent !== "granted"} className="h-10 w-10 shrink-0 rounded-full bg-ember text-ink hover:bg-gold" aria-label="Send">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </motion.div>
      )}

      {/* ConsentGate card */}
      {showGate && consent !== "granted" && (
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-36 right-4 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border bg-card p-5 shadow-2xl lg:bottom-24 lg:right-8"
          role="dialog"
          aria-label="Cookie consent for concierge"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ember-soft text-ember-deep dark:text-ember">
              <Cookie className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold">The concierge sleeps until you say so</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                It needs local storage for the chat and your shortlist. Nothing leaves the valley —
                the demo label stays on every reply.
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  className="rounded-full bg-pine text-cream hover:bg-pine-deep dark:bg-ember dark:text-ink dark:hover:bg-ember-deep"
                  onClick={() => {
                    setConsent("granted");
                    setShowGate(false);
                  }}
                >
                  Accept — wake it
                </Button>
                <Button size="sm" variant="ghost" className="rounded-full" onClick={() => { setShowGate(false); setConcierge(false); }}>
                  Let it sleep
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}
