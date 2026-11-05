"use client";

import { ArrowRight, Award, Quote, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ImageSlot } from "@/components/fx/Media";
import { Reveal, Stagger, StaggerItem } from "@/components/fx/Reveal";
import { DemoBadge, Marquee, Stars } from "@/components/fx/Atoms";
import { DIVISIONS, PRESS } from "@/lib/site";
import { useApp } from "@/store/useApp";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * StorySection — “the collective”: editorial intro, the six-house grid
 * (ServiceCardGrid), press quotes. The heart of the one-brand story.
 */
export function StorySection() {
  const setConcierge = useApp((s) => s.setConcierge);
  return (
    <section id="story" className="section-tight border-b" aria-label="The collective">
      <div className="shell space-y-12">
        <Reveal>
          <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-end">
            <div>
              <p className="overline text-ember-deep dark:text-ember">The collective · est. 1984</p>
              <h2 className="mt-4 max-w-2xl text-balance font-display text-[clamp(2rem,4.5vw,3.4rem)] font-semibold leading-[1.05] tracking-tight">
                Six houses, one ledger, one phone number — and a single page that runs the lot.
              </h2>
            </div>
            <p className="text-pretty leading-relaxed text-muted-foreground">
              The valley was a farm, then a lodge, then — slowly, the way things happen here — a
              restaurant, a winery, a bakery, an outfitter and a campground. We never merged them.
              We just taught them to share. Book the lodge and the canoe in one flow; order pies to
              your pitch; hand the wine list to the concierge. <DemoBadge compact className="ml-1" />
            </p>
          </div>
        </Reveal>

        {/* ServiceCardGrid — the six houses */}
        <Stagger gap={0.07} className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" >
          <div data-tour="houses" className="contents">
            {DIVISIONS.map((d) => (
              <StaggerItem key={d.key} className="h-full">
                <a
                  href={d.anchor}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
                  data-cursor="Visit"
                >
                  <span className="relative">
                    <ImageSlot src={d.img} alt={`${d.house} — ${d.kind}`} className="aspect-[16/10] w-full" sizes="(max-width:768px) 100vw, 33vw" imgClassName="transition-transform duration-700 ease-luxe group-hover:scale-[1.06]" />
                    <span className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink/55 to-transparent" aria-hidden />
                    <Badge className="absolute left-3 top-3 rounded-full border-0 bg-ink/55 text-[11px] font-medium text-cream backdrop-blur hover:bg-ink/55">
                      {d.kind}
                    </Badge>
                  </span>
                  <span className="flex flex-1 flex-col p-5">
                    <span className="font-display text-xl font-semibold group-hover:text-ember-deep dark:group-hover:text-ember">
                      {d.house}
                    </span>
                    <span className="mt-2 text-sm leading-relaxed text-muted-foreground">{d.blurb}</span>
                    <span className="mt-auto flex items-center justify-between pt-4 text-xs">
                      <span className="text-muted-foreground">{d.hours}</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-ember-deep dark:text-ember">
                        {d.cta} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
                      </span>
                    </span>
                  </span>
                </a>
              </StaggerItem>
            ))}
          </div>
        </Stagger>

        {/* PressMentions strip */}
        <Reveal>
          <div className="grid gap-4 rounded-2xl border bg-card p-6 lg:grid-cols-[auto_1fr] lg:items-center">
            <p className="overline text-muted-foreground">the press, unsolicited</p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {PRESS.map((p) => (
                <figure key={p.source} className="border-l-2 border-ember/40 pl-4">
                  <blockquote className="font-display text-lg leading-snug">“{p.quote}”</blockquote>
                  <figcaption className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{p.source}</span>
                    <span className="tnum">{p.year}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
