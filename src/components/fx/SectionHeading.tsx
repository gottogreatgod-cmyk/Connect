"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { DemoBadge } from "./Atoms";

/**
 * SectionHeading — the editorial header used across all houses.
 * kicker (mono overline) / title (display serif) / lede / actions / demo flag.
 */
export function SectionHeading({
  kicker,
  title,
  lede,
  actions,
  demo,
  align = "left",
  className,
  id,
}: {
  kicker: string;
  title: ReactNode;
  lede?: ReactNode;
  actions?: ReactNode;
  demo?: boolean;
  align?: "left" | "center";
  className?: string;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={cn(
        "flex flex-col gap-5",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      <Reveal>
        <div className="flex flex-wrap items-center gap-3">
          <p className="overline text-ember-deep dark:text-ember">{kicker}</p>
          <span aria-hidden className="h-px w-10 bg-ember/50" />
          {demo && <DemoBadge compact />}
        </div>
      </Reveal>
      <Reveal delay={0.06}>
        <h2 className="max-w-3xl text-balance text-3xl font-semibold leading-[1.08] tracking-tight sm:text-4xl lg:text-[2.9rem]">
          {title}
        </h2>
      </Reveal>
      {lede && (
        <Reveal delay={0.12}>
          <p className="max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">{lede}</p>
        </Reveal>
      )}
      {actions && (
        <Reveal delay={0.18}>
          <div className="flex flex-wrap items-center gap-3">{actions}</div>
        </Reveal>
      )}
    </div>
  );
}
