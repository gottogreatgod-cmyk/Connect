"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, Flame, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/** DemoContentBadge — fictional proof carries it. Non-negotiable. */
export function DemoBadge({ className, compact = false }: { className?: string; compact?: boolean }) {
  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border border-border bg-card/70 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground backdrop-blur",
              className,
            )}
            aria-label="Demo content"
          >
            <Info className="h-3 w-3" aria-hidden />
            demo
          </span>
        </TooltipTrigger>
        <TooltipContent>Sample content — proof figures are demo values.</TooltipContent>
      </Tooltip>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-2.5 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur",
        className,
      )}
    >
      <Info className="h-3.5 w-3.5" aria-hidden />
      Demo content
    </span>
  );
}

/** Verified-style badge for credentials. */
export function VerifiedBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-pine-soft px-2.5 py-1 text-[11px] font-medium text-pine dark:bg-pine-soft dark:text-pine">
      <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
      {label}
    </span>
  );
}

/** AnimatedCounter — springs to value when in view. */
export function Counter({
  value,
  suffix = "",
  prefix = "",
  duration = 1400,
  className,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      const rid = requestAnimationFrame(() => setDisplay(value));
      return () => cancelAnimationFrame(rid);
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      // easeOutExpo
      const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setDisplay(Math.round(value * e));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration, reduced]);

  return (
    <span ref={ref} className={cn("tnum", className)}>
      {prefix}
      {display.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}

/** LivePulse — for live-ish modules (QueueStatus, conditions). */
export function LivePulse({ className, label = "live" }: { className?: string; label?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-[11px] font-medium text-ember-deep dark:text-ember", className)}>
      <span className="relative flex h-2 w-2" aria-hidden>
        <span className="absolute inline-flex h-full w-full rounded-full bg-ember opacity-60 pulse-dot" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-ember" />
      </span>
      <span className="overline">{label}</span>
    </span>
  );
}

/** Small flame divider used between editorial blocks. */
export function FlameMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-3 text-ember", className)} aria-hidden>
      <span className="h-px w-8 bg-current opacity-40" />
      <Flame className="h-3.5 w-3.5" />
      <span className="h-px w-8 bg-current opacity-40" />
    </span>
  );
}

/** Star rating row. */
export function Stars({ n = 5, className }: { n?: number; className?: string }) {
  return (
    <span className={cn("inline-flex gap-0.5 text-ember", className)} aria-label={`${n} of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-3.5 w-3.5" aria-hidden fill="currentColor" opacity={i < n ? 1 : 0.25}>
          <path d="M10 1.7l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 15l-5.2 2.7 1-5.8L1.6 7.8l5.8-.8z" />
        </svg>
      ))}
    </span>
  );
}

/** TiltCard — pointer-reactive 3D tilt (desktop, motion-allowed only). */
export function TiltCard({
  children,
  className,
  max = 7,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [t, setT] = useState("");

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    const rx = (-py * max).toFixed(2);
    const ry = (px * max).toFixed(2);
    setT(`perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`);
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={() => setT("")}
      className={cn("transition-transform duration-300 ease-luxe will-change-transform", className)}
      style={{ transform: t || undefined }}
    >
      {children}
    </div>
  );
}

/** MarqueeStrip — pure CSS, pauses on hover, honors reduced motion. */
export function Marquee({
  items,
  className,
  reverse = false,
  duration = 42,
  separator = "·",
}: {
  items: React.ReactNode[];
  className?: string;
  reverse?: boolean;
  duration?: number;
  separator?: string;
}) {
  const row = (
    <>
      {items.map((it, i) => (
        <span key={i} className="mx-6 inline-flex items-center gap-6 whitespace-nowrap">
          {it}
          <span aria-hidden className="text-ember/60">{separator}</span>
        </span>
      ))}
    </>
  );
  return (
    <div className={cn("overflow-hidden", className)} aria-hidden={false}>
      <div
        className={cn("flex w-max animate-marquee", reverse && "animate-marquee-reverse")}
        style={{ ["--marquee-duration" as any]: `${duration}s` }}
      >
        <div className="flex">{row}</div>
        <div className="flex" aria-hidden>
          {row}
        </div>
      </div>
    </div>
  );
}

export { motion };
