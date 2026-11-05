"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * ImageSlot — img with a designed gradient backstop (img-slot) so missing
 * assets never break the composition. Optional ImageRevealMask + KenBurns.
 */
export function ImageSlot({
  src,
  alt,
  className,
  imgClassName,
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
  reveal = false,
  kenburns = false,
  fill = false,
  width,
  height,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  priority?: boolean;
  reveal?: boolean;
  kenburns?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
}) {
  const reduced = useReducedMotion();
  const [ok, setOk] = useState(true);
  const [loaded, setLoaded] = useState(false);

  const inner = ok ? (
    <Image
      src={src}
      alt={alt}
      fill={fill || undefined}
      width={fill ? undefined : (width ?? 1200)}
      height={fill ? undefined : (height ?? 800)}
      sizes={sizes}
      priority={priority}
      onError={() => setOk(false)}
      onLoad={() => setLoaded(true)}
      className={cn(
        "object-cover transition-opacity duration-700 ease-luxe",
        loaded ? "opacity-100" : "opacity-0",
        kenburns && !reduced ? (Math.random() > 0.5 ? "kenburns" : "kenburns-b") : "",
        imgClassName,
      )}
    />
  ) : null;

  if (reveal && !reduced) {
    return (
      <span className={cn("img-slot block overflow-hidden", className)}>
        <motion.span
          className="block h-full w-full"
          initial={{ clipPath: "inset(12% 8% 12% 8%)", opacity: 0.4 }}
          whileInView={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }}
          viewport={{ once: true, margin: "-8% 0px" }}
          transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
        >
          {inner}
        </motion.span>
      </span>
    );
  }

  return (
    <span className={cn("img-slot block overflow-hidden", className)}>
      {inner}
      {!loaded && (
        <span aria-hidden className="absolute inset-0 animate-pulse bg-black/5" />
      )}
    </span>
  );
}

/** ParallaxMedia — scroll-driven drift wrapper. */
export function Parallax({
  children,
  className,
  amount = 40,
}: {
  children: React.ReactNode;
  className?: string;
  amount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [amount, -amount]);
  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div style={reduced ? undefined : { y }} className="h-full w-full will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}

/** BeforeAfterSlider — drag the divider (also keyboard operable). */
export function BeforeAfter({
  beforeLabel = "Before",
  afterLabel = "After",
  before,
  after,
  beforeAlt = "Before",
  afterAlt = "After",
  className,
}: {
  beforeLabel?: string;
  afterLabel?: string;
  before: string;
  after: string;
  beforeAlt?: string;
  afterAlt?: string;
  className?: string;
}) {
  const [pos, setPos] = useState(55);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const setFromClientX = (clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };

  return (
    <div
      ref={ref}
      className={cn("img-slot relative aspect-[16/10] w-full cursor-ew-resize select-none overflow-hidden rounded-xl", className)}
      onPointerDown={(e) => {
        dragging.current = true;
        setFromClientX(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && setFromClientX(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerLeave={() => (dragging.current = false)}
    >
      <Image src={after} alt={afterAlt} fill sizes="(max-width:768px) 100vw, 60vw" className="object-cover" />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <Image src={before} alt={beforeAlt} fill sizes="(max-width:768px) 100vw, 60vw" className="object-cover grayscale-[35%] sepia-[18%]" />
        <span className="absolute left-3 top-3 rounded-full bg-ink/70 px-2.5 py-1 text-[11px] font-medium text-cream backdrop-blur">
          {beforeLabel}
        </span>
      </div>
      <span className="absolute right-3 top-3 rounded-full bg-cream/80 px-2.5 py-1 text-[11px] font-medium text-ink backdrop-blur">
        {afterLabel}
      </span>
      <div
        className="absolute inset-y-0"
        style={{ left: `${pos}%` }}
        role="separator"
        tabIndex={0}
        aria-label="Before and after slider"
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 4));
          if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 4));
        }}
      >
        <span className="absolute inset-y-0 -left-px w-0.5 bg-cream shadow-[0_0_12px_rgba(0,0,0,0.35)]" />
        <span className="absolute top-1/2 -left-5 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-cream text-ink shadow-lg">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M8 7l-4 5 4 5M16 7l4 5-4 5" />
          </svg>
        </span>
      </div>
    </div>
  );
}

/** HorizontalGallery rail (drag with grab cursor; page also scrolls it). */
export function Rail({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "scroll-slim flex gap-5 overflow-x-auto pb-4 pr-2 snap-x snap-mandatory",
        className,
      )}
      role="region"
      aria-label="Gallery reel"
    >
      {children}
    </div>
  );
}
