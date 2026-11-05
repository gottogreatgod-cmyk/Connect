"use client";

import { lazy, Suspense, useEffect, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Play, ChevronDown, Sun, CloudDrizzle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ImageSlot } from "@/components/fx/Media";
import { Reveal } from "@/components/fx/Reveal";
import { Counter, DemoBadge, LivePulse, Marquee, Stars } from "@/components/fx/Atoms";
import { AWARDS, BRAND, DICT, REVIEWS, STATS } from "@/lib/site";
import { openState } from "@/lib/format";
import { useApp } from "@/store/useApp";
import { ErrorBoundary3D } from "@/components/three/ErrorBoundary3D";
import { cn } from "@/lib/utils";

const HeroTerrain = lazy(() => import("@/components/three/HeroTerrain"));

/** HeroCinematic — parallax valley with live badges, film lightbox, 3D accent. */
export function HeroSection({ onReserve }: { onReserve: () => void }) {
  const locale = useApp((s) => s.locale);
  const t = DICT[locale];
  const [film, setFilm] = useState(false);
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const yBg = useTransform(scrollY, [0, 900], [0, 220]);
  const yFg = useTransform(scrollY, [0, 900], [0, -60]);
  const fade = useTransform(scrollY, [0, 700], [1, 0]);

  const lodgeOpen = openState("lodge");
  const counterOpen = openState("meadowlark");
  const trailOpen = openState("trailhead");

  return (
    <section id="top" className="relative isolate overflow-hidden" data-tour="hero" aria-label="Welcome">
      {/* Parallax valley */}
      <motion.div style={reduced ? undefined : { y: yBg }} className="absolute inset-0 -z-10" aria-hidden>
        <div className="grain absolute inset-0">
          <ImageSlot
            src="/img/hero-valley.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="h-full w-full"
            imgClassName="kenburns"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-ink/45 via-ink/25 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/40 via-transparent to-transparent" />
      </motion.div>

      <div className="shell grid min-h-[100svh] items-center gap-10 pb-24 pt-36 lg:grid-cols-[1.15fr_0.85fr] lg:pb-32">
        {/* Copy */}
        <motion.div style={reduced ? undefined : { y: yFg, opacity: fade }} className="max-w-2xl">
          <Reveal>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-cream/30 bg-ink/30 px-3 py-1 text-[11px] font-medium text-cream backdrop-blur">
                {t.hero_kicker}
              </span>
              {lodgeOpen.open && (
                <span className="inline-flex items-center gap-2 rounded-full border border-cream/30 bg-ink/30 px-3 py-1 text-[11px] font-medium text-cream backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8fd6a4]" aria-hidden />
                  {t.open_now} — reception to 22:00
                </span>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="mt-6 text-[clamp(3rem,9vw,6.2rem)] font-semibold leading-[0.95] tracking-tight text-cream [text-shadow:0_2px_30px_rgba(0,0,0,0.35)]">
              {t.hero_title}
              <br />
              <span className="text-[#e8c089]">{t.hero_title_2}</span>
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-cream/85 [text-shadow:0_1px_12px_rgba(0,0,0,0.3)]">
              A lodge above the lake, a candle-lit table, a working winery, a bakery that turns
              pizzeria at six, guides who read the ridges, and a river-meadow camp under the milky
              way. Book any of it — or all of it — from this one page.
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-8 flex flex-wrap items-center gap-3" data-tour="hero-ctas">
              <Button
                onClick={onReserve}
                size="lg"
                className="h-12 rounded-full bg-cream px-7 text-base font-semibold text-ink shadow-xl transition-transform hover:scale-[1.02] hover:bg-[#f3e3c3]"
                data-cursor="Book"
              >
                {t.cta_primary}
              </Button>
              <Button
                onClick={() => setFilm(true)}
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-cream/40 bg-ink/25 px-6 text-base font-medium text-cream backdrop-blur hover:bg-ink/45"
                data-cursor="Play"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cream/90 text-ink">
                  <Play className="h-3.5 w-3.5 fill-current" aria-hidden />
                </span>
                {t.cta_secondary}
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-cream/20 pt-5 text-cream/90">
              {[
                { k: "Counter", v: counterOpen.open ? "Open — pies 18:00" : "Opens 07:00", live: counterOpen.open },
                { k: "Trailhead", v: trailOpen.open ? "Guides in — 06:30" : "From 06:30", live: trailOpen.open },
                { k: "Cellar", v: "Thu–Sat 11:00", live: false },
              ].map((s) => (
                <div key={s.k}>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream/60">{s.k}</dt>
                  <dd className="mt-1 text-sm font-medium">
                    {s.live && <LivePulse label="live" className="mb-1 block !text-cream/80 [&_span:last-child]:text-cream/80" />}
                    {s.v}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </motion.div>

        {/* 3D accent — 3DHeroObject */}
        <div className="relative mx-auto hidden aspect-square w-full max-w-[440px] lg:block" aria-hidden>
          <div className="absolute inset-0 rounded-[2rem] border border-cream/15 bg-ink/10 backdrop-blur-[2px]" />
          <ErrorBoundary3D
            fallback={
              <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center text-cream/70">
                <Sun className="h-6 w-6" aria-hidden />
                <p className="text-sm">The valley model is resting (WebGL unavailable). The view works fine without it.</p>
              </div>
            }
          >
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center text-cream/60">
                  <CloudDrizzle className="h-6 w-6 animate-pulse" aria-hidden />
                </div>
              }
            >
              <HeroTerrain className="h-full w-full" />
            </Suspense>
          </ErrorBoundary3D>
          <p className="absolute -bottom-7 right-2 rounded-full bg-ink/55 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-cream/90 backdrop-blur">
            the valley, as the crow flies — 3D
          </p>
        </div>
      </div>

      {/* scroll cue */}
      <motion.a
        href="#story"
        aria-label="Scroll to the collective"
        style={reduced ? undefined : { opacity: fade }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 rounded-full bg-ink/45 px-3.5 py-1.5 text-cream/90 backdrop-blur md:flex"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.3em]">the valley</span>
        <ChevronDown className="h-4 w-4 animate-bounce" aria-hidden />
      </motion.a>

      {/* HeroVideo — film lightbox */}
      <Dialog open={film} onOpenChange={setFilm}>
        <DialogContent aria-describedby={undefined} className="max-w-4xl overflow-hidden border-0 bg-ink/95 p-0 [&>button]:z-10 [&>button]:text-cream">
          <DialogTitle className="sr-only">The valley film</DialogTitle>
          <div className="relative aspect-video">
            <FilmSeq />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-ink/80 to-transparent p-4 text-cream">
              <div>
                <p className="font-display text-lg font-semibold">The valley, slowly</p>
                <p className="text-xs text-cream/70">A demo reel — stills, moved like film. Sound is the river in your head.</p>
              </div>
              <span className="rounded-full border border-cream/30 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em]">demo film</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

/** Film sequence — crossfading ken-burns stills. */
function FilmSeq() {
  const frames = [
    { src: "/img/hero-valley.jpg", alt: "The valley at dusk" },
    { src: "/img/lodge-exterior.jpg", alt: "The lodge at blue hour" },
    { src: "/img/camp-night.jpg", alt: "The Grove at night" },
    { src: "/img/trail-ridge.jpg", alt: "Above the clouds" },
  ];
  const [i, setI] = useState(0);
  useEffectFrameTimer(() => setI((x) => (x + 1) % frames.length), 4200);
  return (
    <div className="absolute inset-0" aria-live="off">
      {frames.map((f, idx) => (
        <div
          key={f.src}
          className={cn("absolute inset-0 transition-opacity duration-1000 ease-luxe", idx === i ? "opacity-100" : "opacity-0")}
          aria-hidden={idx !== i}
        >
          <ImageSlot src={f.src} alt={idx === i ? f.alt : ""} fill sizes="90vw" className="h-full w-full" imgClassName={idx === i ? "kenburns" : ""} />
        </div>
      ))}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-cream/20">
        <motion.div key={i} initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 4.2, ease: "linear" }} className="h-full bg-[#e8c089]" />
      </div>
      <span className="absolute right-4 top-4 rounded-full bg-ink/60 px-2.5 py-1 font-mono text-[10px] text-cream/90 tnum">
        {String(i + 1).padStart(2, "0")} / {String(frames.length).padStart(2, "0")}
      </span>
    </div>
  );
}

/** film-sequence timer helper */
function useEffectFrameTimer(cb: () => void, ms: number) {
  useEffect(() => {
    const id = setInterval(cb, ms);
    return () => clearInterval(id);
  }, [ms]);
}

/** ResultsStatStrip + AwardStrip marquee + a review rail — the trust band under the hero. */
export function TrustBand() {
  return (
    <section className="section-tight border-y bg-card/60" aria-label="The collective in numbers">
      <div className="shell space-y-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.06}>
              <div className="flex items-baseline gap-3 rounded-2xl border bg-background/70 p-5">
                <p className="font-display text-4xl font-semibold tracking-tight text-pine dark:text-ember">
                  <Counter value={s.value} suffix={s.suffix} />
                </p>
                <p className="text-sm leading-tight text-muted-foreground">
                  {s.label}
                  <br />
                  <DemoBadge compact className="mt-1 inline-flex" />
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Marquee
          className="border-y py-3 text-sm font-medium text-foreground/80"
          items={AWARDS.map((a) => (
            <span key={a} className="flex items-center gap-2">
              <Stars n={5} className="!text-ember" /> {a}
            </span>
          ))}
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {REVIEWS.slice(0, 3).map((r, i) => (
            <Reveal key={r.name} delay={i * 0.07}>
              <figure className="flex h-full flex-col rounded-2xl border bg-background/70 p-5">
                <blockquote className="flex-1 text-sm leading-relaxed">
                  “{r.quote}”
                </blockquote>
                <figcaption className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    <Stars n={r.stars} className="mb-1" />
                    {r.name} · {r.visit}
                  </span>
                  <DemoBadge compact />
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
