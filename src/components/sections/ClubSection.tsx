"use client";

import { Check, Gem, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/fx/Reveal";
import { DemoBadge } from "@/components/fx/Atoms";
import { SectionHeading } from "@/components/fx/SectionHeading";
import { useApp } from "@/store/useApp";
import { useShortlist, recommendFrom } from "@/store/useShortlist";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * ClubSection — Vale Club (LoyaltySignup), ClientPortalTeaser,
 * PersonalizedRecommendations driven by the live shortlist.
 */
export function ClubSection() {
  const setPortalOpen = useApp((s) => s.setPortalOpen);
  const items = useShortlist((s) => s.items);
  const recs = recommendFrom(items);

  return (
    <section id="club" className="section" aria-label="Vale Club">
      <div className="shell space-y-12">
        <SectionHeading
          kicker="Vale Club · loyalty"
          title={<>Stay twice, and the<br />valley remembers.</>}
          lede="Points on everything — rooms, pies, tastings, firewood. 100 points is a night. No card to carry: the portal holds it."
          demo
        />

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          {/* LoyaltySignup — tiers */}
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { name: "Cairn", need: "0 nights", perks: ["Full points earning", "Stamp card auto-applied", "The letter"], now: true },
              { name: "Kestrel", need: "5 nights", perks: ["+10% points", "Free cancellations to 48h", "First call on releases"] },
              { name: "Summit", need: "15 nights", perks: ["+25% points", "The Study on request", "A named cask after a year"] },
            ].map((t, i) => (
              <Reveal key={t.name} delay={i * 0.06} className="h-full">
                <article className={cn("flex h-full flex-col rounded-2xl border bg-card p-5", t.now && "border-ember/60")}>
                  <div className="flex items-center justify-between">
                    <Gem className={cn("h-5 w-5", t.now ? "text-ember" : "text-muted-foreground")} aria-hidden />
                    {t.now && <Badge className="rounded-full border-0 bg-ember text-cream hover:bg-ember">you start here</Badge>}
                  </div>
                  <h3 className="mt-3 font-display text-lg font-semibold">{t.name}</h3>
                  <p className="text-xs text-muted-foreground">{t.need}</p>
                  <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                    {t.perks.map((p) => (
                      <li key={p} className="flex gap-1.5">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-pine dark:text-ember" aria-hidden /> {p}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
            <div className="sm:col-span-3">
              <Button
                variant="outline"
                className="w-full rounded-full"
                onClick={() => {
                  setPortalOpen(true);
                  toast("Vale Club — joined (demo)", { description: "Cairn tier. Points backdated to this browser session only." });
                }}
              >
                <Sparkles className="mr-2 h-4 w-4" aria-hidden /> Join the club — it costs an email
              </Button>
            </div>
          </div>

          {/* ClientPortalTeaser */}
          <Reveal delay={0.1}>
            <button
              onClick={() => setPortalOpen(true)}
              className="flex h-full w-full flex-col overflow-hidden rounded-2xl border bg-card text-left transition-shadow hover:shadow-xl"
              data-cursor="Open"
            >
              <div className="img-slot relative border-b">
                <div className="grain absolute inset-0 bg-gradient-to-br from-pine to-pine-deep" aria-hidden />
                <div className="relative p-6 text-cream">
                  <p className="overline text-[#e8c089]">the portal — a working preview</p>
                  <p className="mt-3 font-display text-2xl font-semibold">Your stays, invoices, packing lists, stamps.</p>
                  <div className="mt-6 grid grid-cols-3 gap-3 text-cream/85">
                    {[
                      { k: "Next stay", v: "Aspen Suite · 3 nights" },
                      { k: "Points", v: "1,240 → Cairn" },
                      { k: "Stamps", v: "6 / 10" },
                    ].map((x) => (
                      <div key={x.k} className="rounded-xl border border-cream/20 bg-cream/10 p-3 backdrop-blur">
                        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-cream/60">{x.k}</p>
                        <p className="mt-1 text-sm font-medium">{x.v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="flex items-center justify-between p-5 text-sm">
                <span className="text-muted-foreground">Open the portal — it’s the T4 layer; every number in it is live from this page.</span>
                <span className="font-semibold text-ember-deep dark:text-ember">Enter →</span>
              </p>
            </button>
          </Reveal>
        </div>

        {/* PersonalizedRecommendations */}
        <Reveal>
          <div className="rounded-2xl border border-dashed bg-card/60 p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <p className="overline text-muted-foreground">
                Suggested for you — from your shortlist ({items.length ? `${items.length} saved` : "nothing saved yet"})
              </p>
              <DemoBadge compact />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {recs.map((r) => (
                <a key={r.title} href={r.anchor} className="group rounded-xl border bg-background/70 p-4 transition-colors hover:border-ember/60">
                  <p className="text-sm font-semibold group-hover:text-ember-deep dark:group-hover:text-ember">{r.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{r.why}</p>
                  <p className="mt-3 text-xs font-medium text-ember-deep dark:text-ember">{r.cta} →</p>
                </a>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Deterministic engine over what you’ve saved — no tracking, no third parties. Clear the
              shortlist and it resets to house picks.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
