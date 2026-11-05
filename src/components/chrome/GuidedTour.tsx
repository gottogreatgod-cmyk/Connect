"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, X } from "lucide-react";
import { useApp } from "@/store/useApp";

type Step = {
  target: string | null; // data-tour value
  title: string;
  body: string;
  cta: string;
};

const STEPS: Step[] = [
  {
    target: null,
    title: "This is one page — a whole valley",
    body:
      "Six houses (hotel, restaurant, winery, café, outfitter, campground), a portal, a store and a concierge — engineered on one route like a flagship property site.",
    cta: "Walk me through",
  },
  {
    target: "houses",
    title: "The six houses",
    body:
      "Every card is a working division: real menus, real booking flows, real calculators. Pick a house or keep scrolling — the page reads like a field guide.",
    cta: "Next",
  },
  {
    target: "reserve",
    title: "One dominant CTA",
    body:
      "“Plan your stay” opens a multi-step reservation engine — dates, guests, room, extras, promo code, confirmation with a calendar file. It also books tables.",
    cta: "Next",
  },
  {
    target: "concierge",
    title: "Ask the valley",
    body:
      "A demo AI concierge with three moods — host, sommelier, field guide. It reads the valley’s real data (menus, trips, prices) and answers like one of us.",
    cta: "Next",
  },
  {
    target: "tools",
    title: "Your tools",
    body:
      "⌘K opens the command palette — go anywhere, do anything. The portal holds your stays and shortlist. The bag is a real order flow. Try the theme toggle, too.",
    cta: "Start exploring",
  },
];

/** GuidedTour — first-visit spotlight onboarding. */
export function GuidedTour() {
  const tourSeen = useApp((s) => s.tourSeen);
  const setTourSeen = useApp((s) => s.setTourSeen);
  const [step, setStep] = useState<number | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [pos, setPos] = useState<"below" | "above">("below");
  const reduced = useReducedMotion();
  const raf = useRef(0);

  useEffect(() => {
    if (!tourSeen) {
      const id = setTimeout(() => setStep(0), 1900);
      return () => clearTimeout(id);
    }
  }, [tourSeen]);

  const close = useCallback(() => {
    setStep(null);
    setTourSeen(true);
  }, [setTourSeen]);

  useEffect(() => {
    if (step === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, close]);

  useLayoutEffect(() => {
    if (step === null) return;
    const s = STEPS[step];
    const measure = () => {
      if (!s.target) {
        setRect(null);
        return;
      }
      const el = document.querySelector(`[data-tour="${s.target}"]`) as HTMLElement | null;
      if (!el) {
        setRect(null);
        return;
      }
      el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
      const id = setTimeout(() => {
        const r = el.getBoundingClientRect();
        setRect(r);
        setPos(r.top > window.innerHeight / 2 ? "above" : "below");
      }, reduced ? 60 : 620);
      return () => clearTimeout(id);
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", () => setRect(null), { passive: true });
    return () => window.removeEventListener("resize", measure);
  }, [step, reduced]);

  if (step === null || tourSeen) return null;

  const s = STEPS[step];
  const last = step === STEPS.length - 1;

  // card positioning
  const cardStyle: React.CSSProperties = rect
    ? {
        position: "fixed",
        top: pos === "below" ? Math.min(rect.bottom + 16, window.innerHeight - 230) : Math.max(rect.top - 210, 16),
        left: Math.min(Math.max(rect.left, 16), window.innerWidth - 400),
        width: "min(380px, calc(100vw - 32px))",
      }
    : {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "min(420px, calc(100vw - 32px))",
      };

  return (
    <div role="dialog" aria-modal="true" aria-label="Guided tour" className="fixed inset-0 z-[70]">
      {/* spotlight hole */}
      {rect ? (
        <div
          aria-hidden
          className="absolute rounded-xl transition-all duration-500 ease-luxe"
          style={{
            left: rect.left - 6,
            top: rect.top - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            boxShadow: "0 0 0 9999px rgba(16, 20, 17, 0.66)",
            border: "1.5px solid rgba(192,133,85,0.9)",
          }}
        />
      ) : (
        <div aria-hidden className="absolute inset-0 bg-[oklch(0.14_0.02_170)]/70 backdrop-blur-[2px]" />
      )}

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        style={cardStyle}
        className="rounded-2xl border border-border bg-card p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <p className="overline text-ember-deep dark:text-ember">
            {step + 1} / {STEPS.length}
          </p>
          <Button variant="ghost" size="icon" className="-mr-2 -mt-2 h-8 w-8" onClick={close} aria-label="Close tour">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <h3 className="mt-1 font-display text-xl font-semibold">{s.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-1" aria-hidden>
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${i <= step ? "bg-ember" : "bg-border"}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)} className="rounded-full">
                <ArrowLeft className="mr-1 h-3.5 w-3.5" aria-hidden /> Back
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => (last ? close() : setStep(step + 1))}
              className="rounded-full bg-pine text-cream hover:bg-pine-deep dark:bg-ember dark:text-ink dark:hover:bg-ember-deep"
            >
              {s.cta} {last ? null : <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden />}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
