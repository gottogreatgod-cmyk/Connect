"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarCheck, Phone, Cookie, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/site";
import { useApp } from "@/store/useApp";
import { cn } from "@/lib/utils";

/** StickyActionBar — mobile conversion rail (safe-area aware). */
export function StickyActionBar({ onReserve }: { onReserve: () => void }) {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > 720);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const reduced = useReducedMotion();
  if (!past) return null;
  return (
    <motion.div
      initial={reduced ? false : { y: 80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 bottom-0 z-40 lg:hidden"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <div className="shell flex items-center gap-2.5 rounded-2xl border border-border/80 bg-card/95 p-2 pl-3 shadow-[0_-8px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl">
        <a
          href={BRAND.phoneHref}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border text-foreground/80"
          aria-label={`Call ${BRAND.name}`}
        >
          <Phone className="h-[18px] w-[18px]" />
        </a>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted-foreground">Reception answers 07–22</p>
          <p className="truncate font-display text-sm font-semibold">{BRAND.phone}</p>
        </div>
        <Button
          onClick={onReserve}
          className="h-11 shrink-0 rounded-full bg-pine px-5 text-cream hover:bg-pine-deep dark:bg-ember dark:text-ink dark:hover:bg-ember-deep"
        >
          <CalendarCheck className="mr-1.5 h-4 w-4" aria-hidden /> Reserve
        </Button>
      </div>
    </motion.div>
  );
}

/** BackToTop */
export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 1400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!show) return null;
  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "fixed bottom-24 right-4 z-40 h-11 w-11 rounded-full border-border bg-card/90 shadow-lg backdrop-blur lg:bottom-8",
      )}
    >
      <ArrowUp className="h-4 w-4" />
    </Button>
  );
}

/** CookieConsent — gates concierge + personalization (ConsentGate). */
export function CookieConsent() {
  const consent = useApp((s) => s.consent);
  const setConsent = useApp((s) => s.setConsent);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  if (!mounted || consent !== "unset") return null;

  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-20 left-4 z-40 w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur-xl lg:bottom-8"
    >
      <div className="flex gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ember-soft text-ember-deep dark:text-ember">
          <Cookie className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold">A quiet word about cookies</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            We’d like to remember your shortlist, your cart and your locale — and let the demo
            concierge answer. Decline and the valley still works; the concierge stays asleep.
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              onClick={() => setConsent("granted")}
              className="rounded-full bg-pine text-cream hover:bg-pine-deep dark:bg-ember dark:text-ink dark:hover:bg-ember-deep"
            >
              Accept
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConsent("declined")} className="rounded-full">
              Decline
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
