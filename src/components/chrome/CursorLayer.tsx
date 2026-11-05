"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * CursorContextLayer — a lerp-following ring that picks up contextual
 * labels from [data-cursor] elements. Desktop + motion-allowed only.
 */
export function CursorLayer() {
  const reduced = useReducedMotion();
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });
  const [label, setLabel] = useState<string | null>(null);
  const [fine, setFine] = useState(false);
  const [down, setDown] = useState(false);

  useEffect(() => {
    const fineRaf = requestAnimationFrame(() => setFine(window.matchMedia("(pointer: fine)").matches));
    return () => cancelAnimationFrame(fineRaf);
  }, []);

  useEffect(() => {
    if (reduced || !fine) return;

    let raf = 0;
    const loop = () => {
      const p = pos.current;
      const t = target.current;
      const nx = p.x + (t.x - p.x) * 0.18;
      const ny = p.y + (t.y - p.y) * 0.18;
      pos.current = { x: nx, y: ny };
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${nx}px, ${ny}px) translate(-50%, -50%) scale(${label ? 1.65 : down ? 0.8 : 1})`;
      }
      if (labelRef.current) {
        labelRef.current.style.transform = `translate(${nx + 26}px, ${ny + 22}px)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onMove = (e: PointerEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };
    const onOver = (e: PointerEvent) => {
      const el = (e.target as HTMLElement)?.closest?.("[data-cursor]") as HTMLElement | null;
      setLabel(el?.dataset.cursor ?? null);
    };
    const onDown = () => setDown(true);
    const onUp = () => setDown(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [reduced, fine, label, down]);

  if (reduced || !fine) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[80] hidden md:block">
      <div
        ref={ringRef}
        className="absolute left-0 top-0 h-7 w-7 rounded-full border-[1.5px] border-ember/90 transition-[width,height] duration-300 ease-luxe"
        style={{ willChange: "transform" }}
      />
      <span
        ref={labelRef}
        className="absolute left-0 top-0 rounded-full bg-ink/85 px-2.5 py-1 text-[11px] font-medium text-cream opacity-0 transition-opacity duration-200"
        style={{ opacity: label ? 1 : 0, willChange: "transform" }}
      >
        {label ?? ""}
      </span>
    </div>
  );
}
