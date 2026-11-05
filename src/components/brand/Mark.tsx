"use client";

import { cn } from "@/lib/utils";

/** The Kestrel mark — a kestral glyph over a valley notch. */
export function KestrelMark({
  className,
  tone = "brand",
}: {
  className?: string;
  tone?: "brand" | "cream";
}) {
  const valley = tone === "cream" ? "fill-cream/15" : "fill-pine/15";
  const wing = tone === "cream" ? "fill-cream" : "fill-pine";
  const eye = tone === "cream" ? "fill-pine-deep" : "fill-cream";
  return (
    <svg viewBox="0 0 40 40" className={cn("h-7 w-7", className)} aria-hidden fill="none">
      <path d="M4 32 L14 18 L20 24 L26 12 L36 32 Z" className={valley} />
      <path d="M7 13 Q16 2 33 9 Q26 10 22 14 Q18 12 14 16 Q11 15 7 13 Z" className={wing} />
      <circle cx="24.6" cy="11.2" r="1.1" className={eye} />
    </svg>
  );
}

export function Wordmark({ className, sub = true }: { className?: string; sub?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2.5 leading-none", className)}>
      <KestrelMark />
      <span className="flex flex-col">
        <span className="font-display text-[1.05rem] font-semibold tracking-tight">
          Kestrel&nbsp;Vale
        </span>
        {sub && (
          <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.28em] text-muted-foreground">
            Alpine collective
          </span>
        )}
      </span>
    </span>
  );
}
