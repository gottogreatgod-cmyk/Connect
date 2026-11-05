"use client";

import { useEffect } from "react";
import { useApp } from "@/store/useApp";

/**
 * Watches the page’s sections and reports the active one to the store —
 * drives the dynamic breadcrumb and nav state.
 */
export function SectionObserver() {
  const setActiveSection = useApp((s) => s.setActiveSection);

  useEffect(() => {
    const ids = [
      "top",
      "story",
      "stay",
      "reserve",
      "dine",
      "drink",
      "cafe",
      "adventure",
      "camp",
      "celebrate",
      "club",
      "journal",
      "local",
    ];
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);

    const visible = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.set(e.target.id, e.intersectionRatio);
          else visible.delete(e.target.id);
        }
        if (visible.size) {
          const best = [...visible.entries()].sort((a, b) => b[1] - a[1])[0][0];
          setActiveSection(best);
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0.05, 0.2, 0.5, 0.8] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [setActiveSection]);

  return null;
}
