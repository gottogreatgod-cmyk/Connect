"use client";

import { useState } from "react";
import { Briefcase, ChevronRight, Clock, Library, MapPin, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ImageSlot } from "@/components/fx/Media";
import { Reveal } from "@/components/fx/Reveal";
import { DemoBadge } from "@/components/fx/Atoms";
import { SectionHeading } from "@/components/fx/SectionHeading";
import { FAQS, GLOSSARY, JOURNAL, JOBS, NEIGHBORHOOD } from "@/lib/site";
import { useApp } from "@/store/useApp";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * FieldNotesSection — Journal (BlogIndex + ArticleTemplate),
 * Glossary/KB, CareersBoard, ChangelogFeed.
 */
export function FieldNotesSection() {
  const [cat, setCat] = useState("all");
  const [reading, setReading] = useState<string | null>(null);
  const cats = ["all", "field", "kitchen", "houses"];
  const posts = JOURNAL.filter((j) => cat === "all" || j.cat === cat);
  const article = JOURNAL.find((j) => j.id === reading) ?? null;

  return (
    <section id="journal" className="section" aria-label="Field notes">
      <div className="shell space-y-12">
        <SectionHeading
          kicker="Field notes · journal"
          title={<>What the valley taught<br />us this season.</>}
          lede="Written by the people who work it — the kitchen, the guides, the barn. No SEO strategy, just notes that earned their place."
        />

        {/* filter chips */}
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Journal categories">
          {cats.map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={cat === c}
              onClick={() => setCat(c)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors",
                cat === c ? "bg-pine text-cream dark:bg-ember dark:text-ink" : "border text-muted-foreground hover:border-ember/60",
              )}
            >
              {c === "all" ? "everything" : c}
            </button>
          ))}
        </div>

        {/* BlogIndex */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {posts.map((j, i) => (
            <Reveal key={j.id} delay={i * 0.05} className="h-full">
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-lg">
                <button onClick={() => setReading(j.id)} className="text-left" data-cursor="Read">
                  <span className="relative block">
                    <ImageSlot src={j.img} alt="" className="aspect-[16/11] w-full" sizes="(max-width:768px) 50vw, 25vw" />
                    <span className="absolute right-3 top-3 rounded-full bg-ink/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-cream backdrop-blur">
                      {j.cat}
                    </span>
                  </span>
                  <span className="flex flex-1 flex-col p-4">
                    <span className="font-display text-lg font-semibold leading-snug group-hover:text-ember-deep dark:group-hover:text-ember">
                      {j.title}
                    </span>
                    <span className="mt-2 text-sm leading-relaxed text-muted-foreground">{j.blurb}</span>
                    <span className="mt-auto flex items-center gap-3 pt-3 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" aria-hidden /> {j.read}
                      <ChevronRight className="ml-auto h-4 w-4 text-ember-deep opacity-0 transition-opacity group-hover:opacity-100 dark:text-ember" aria-hidden />
                    </span>
                  </span>
                </button>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Glossary + KnowledgeBase + Careers */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Reveal>
            <div className="h-full rounded-2xl border bg-card p-5">
              <p className="overline text-muted-foreground">Plain words (Glossary)</p>
              <Accordion type="single" collapsible className="mt-3">
                {GLOSSARY.slice(0, 4).map((g) => (
                  <AccordionItem key={g.term} value={g.term}>
                    <AccordionTrigger className="text-sm">{g.term}</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">{g.def}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <div className="h-full rounded-2xl border bg-card p-5">
              <p className="overline text-muted-foreground">Trail safety, in six lines (KB)</p>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li>Weather turns fast above the moraine — the guide decides, not the watch.</li>
                <li>Streams are drinkable above the moraine; filter below the camp.</li>
                <li>Bears: make noise on the blueberry stretches, they’re more polite than most.</li>
                <li>The gorge keeps spray on the slabs even in dry weeks — poles advised.</li>
                <li>Alpine starts mean headlamps; pack one even in June.</li>
                <li>Turn-around times are fixed at the hut. The summit is optional; the dinner isn’t.</li>
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">
                The full library is laminated at the hut. <DemoBadge compact className="ml-1" />
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="h-full rounded-2xl border bg-card p-5" id="careers">
              <p className="overline text-muted-foreground">Join the crew (CareersBoard)</p>
              <ul className="mt-4 space-y-2.5">
                {JOBS.map((j) => (
                  <li key={j.title}>
                    <button
                      onClick={() => toast(`${j.title} — application note`, { description: "Demo board. Real roles answer within a week — we’re smaller than we look." })}
                      className="w-full rounded-xl border bg-background/60 p-3.5 text-left transition-colors hover:border-ember/60"
                    >
                      <span className="block text-sm font-medium">{j.title}</span>
                      <span className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <Briefcase className="h-3 w-3" aria-hidden /> {j.dept} · {j.type} · {j.season}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                Staff eat what the kitchen eats. That’s the entire benefits paragraph, plus the sauna.
              </p>
            </div>
          </Reveal>
        </div>

        {/* ChangelogFeed — house notes */}
        <Reveal>
          <div className="rounded-2xl border bg-card p-5">
            <p className="overline text-muted-foreground">House notes — the changelog</p>
            <ol className="mt-4 space-y-3 border-l pl-5 text-sm">
              {[
                { when: "this week", what: "Winter rooms open Dec 6 — the Attic gets wool blankets, not heaters." },
                { when: "last week", what: "The stamp card moved into the portal. No more cardboard." },
                { when: "this month", what: "Trail crew cleared the gorge after the June drop. Poles still advised." },
                { when: "this season", what: "Ember pizzas now deliver to The Grove pitches — 18:00–21:00, ring the hut." },
              ].map((n) => (
                <li key={n.when} className="relative">
                  <span className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-ember bg-card" aria-hidden />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{n.when}</span>
                  <span className="block text-foreground">{n.what}</span>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </div>

      {/* ArticleTemplate — reading dialog */}
      <Dialog open={!!article} onOpenChange={(v) => !v && setReading(null)}>
        <DialogContent aria-describedby={undefined} className="scroll-slim max-h-[92vh] max-w-2xl overflow-y-auto">
          {article && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl leading-tight">{article.title}</DialogTitle>
              </DialogHeader>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <Badge variant="outline" className="rounded-full">{article.cat}</Badge>
                <span>{article.date}</span>
                <span>· {article.read}</span>
                <DemoBadge compact className="ml-auto" />
              </div>
              <ImageSlot src={article.img} alt="" className="aspect-[16/9] w-full rounded-xl" sizes="90vw" />
              <div className="space-y-4 text-[15px] leading-relaxed text-foreground/90">
                <p className="font-display text-lg">{article.blurb}</p>
                <p>
                  The valley keeps its own calendar, and it does not consult ours. What follows is the
                  working version of this note — the one pinned inside the relevant house, written by
                  the person whose name is on it.
                </p>
                <p>
                  We measure the year in small firsts: the first frost that silvers the meadow, the
                  first tray of buns that sells out before eight, the first night the milky way is
                  bright enough to read a map by. None of these are events. All of them are why
                  people come back, and every one of them is free.
                </p>
                <p>
                  In practice: the kitchen ferments what the field gives; the guides re-walk the
                  trails each spring with a surveyor; the barn keeps its char because the beams
                  earned it. The houses share one ledger and one phone number. That’s the whole
                  operating model — a single page that knows the valley.
                </p>
                <p className="text-sm text-muted-foreground">
                  — Filed from the counter, {article.date}. This is demo editorial; the bylines are
                  the people you’d actually meet.
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

/**
 * LocalSection — NeighborhoodGuide + LocalLandingPage + MultiLocationMap +
 * HoursTable reference + FAQAccordion + ContactForm + AccessibilityStatement.
 */
export function LocalSection() {
  const setConcierge = useApp((s) => s.setConcierge);
  return (
    <section id="local" className="section bg-muted/30" aria-label="The valley, practically">
      <div className="shell space-y-12">
        <SectionHeading
          kicker="The valley · practically"
          title={<>Everything within a walk.<br />Nothing you need a car for.</>}
          lede="The village is nine minutes on foot. The jetty, four. The falls, fifty if you’re enjoying it. Here’s the map, the hours, the rules and the honest answers."
        />

        {/* MultiLocationMap — valley SVG with all houses */}
        <Reveal>
          <div className="overflow-hidden rounded-2xl border bg-card">
            <div className="relative aspect-[21/10] bg-[#e9e4d8] dark:bg-[#1c2a24]">
              <svg viewBox="0 0 100 48" className="absolute inset-0 h-full w-full" role="img" aria-label="Valley map: the six houses, village, jetty and falls">
                {/* lake */}
                <ellipse cx="42" cy="30" rx="20" ry="9" fill="#8fb6a6" fillOpacity="0.5" />
                <text x="42" y="31" fontSize="2.8" textAnchor="middle" fill="#2f4a3e" className="dark:[fill:#c8d4cd]">the lake</text>
                {/* river */}
                <path d="M4 8 C 22 14, 30 10, 46 14 S 70 12, 96 18" fill="none" stroke="#8fb6a6" strokeWidth="2.4" strokeOpacity="0.6" />
                {/* ridge */}
                <path d="M0 4 L14 10 L26 2 L38 9 L52 3 L66 10 L80 4 L100 8" fill="none" stroke="#1f3d33" strokeOpacity="0.35" strokeWidth="1.6" />
                <text x="50" y="4.5" fontSize="2.8" textAnchor="middle" fill="#2f4a3e" className="dark:[fill:#c8d4cd]">kestrel ridge</text>
                {/* pass road */}
                <path d="M4 40 C 30 36, 60 44, 96 38" fill="none" stroke="#c9bfa8" strokeWidth="2" strokeDasharray="5 3" />
                <text x="8" y="43.5" fontSize="2.6" fill="#6b6353" className="dark:[fill:#b9b1a2]">pass road</text>
                {/* houses */}
                {[
                  { x: 34, y: 24, label: "The Lodge", href: "#stay" },
                  { x: 55, y: 22, label: "Hearth & Vale", href: "#dine" },
                  { x: 60, y: 33, label: "The Vessel", href: "#drink" },
                  { x: 24, y: 38, label: "Meadowlark", href: "#cafe" },
                  { x: 74, y: 26, label: "Trailhead", href: "#adventure" },
                  { x: 14, y: 33, label: "The Grove", href: "#camp" },
                  { x: 84, y: 36, label: "The Barn", href: "#celebrate" },
                  { x: 90, y: 24, label: "Village", href: "#local" },
                ].map((h) => (
                  <g key={h.label} transform={`translate(${h.x} ${h.y})`} className="cursor-pointer">
                    <a href={h.href}>
                      <rect x={-3.4} y={-3.4} width={7} height={7} rx={1.6} fill="#c08555" fillOpacity={0.9} />
                      <rect x={-1.2} y={-1.2} width={2.6} height={2.6} rx={0.4} fill="#fff7e8" />
                      <text y={6.6} fontSize="2.6" textAnchor="middle" fill="#2f4a3e" className="dark:[fill:#c8d4cd]">{h.label}</text>
                    </a>
                  </g>
                ))}
                {/* neighborhood points */}
                {NEIGHBORHOOD.map((n) => (
                  <g key={n.name} transform={`translate(${n.x / 1.9} ${Math.min(46, n.y / 1.6 + 8)})`} opacity={0.9}>
                    <circle r={1.6} fill="#1f3d33" className="dark:[fill:#c8d4cd]" />
                    <text y={-3} fontSize="2.6" textAnchor="middle" fill="#2f4a3e" className="dark:[fill:#c8d4cd]">{n.name}</text>
                  </g>
                ))}
              </svg>
              <span className="absolute bottom-3 right-4 font-mono text-[10px] text-muted-foreground">
                not to scale — the walk is real though
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4">
              <p className="text-xs text-muted-foreground">
                Tap any house on the map to jump to it. Distances below are honest ones.
              </p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Kestrel+Vale+Vale+Hollow"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-ember-deep hover:underline dark:text-ember"
              >
                <MapPin className="h-3.5 w-3.5" aria-hidden /> Open in maps
              </a>
            </div>
          </div>
        </Reveal>

        {/* Neighborhood cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {NEIGHBORHOOD.map((n, i) => (
            <Reveal key={n.name} delay={i * 0.05} className="h-full">
              <article className="flex h-full gap-4 rounded-2xl border bg-card p-4">
                {n.img ? (
                  <ImageSlot src={n.img} alt={n.name} className="h-20 w-24 shrink-0 rounded-xl" sizes="120px" />
                ) : (
                  <span className="flex h-20 w-24 shrink-0 items-center justify-center rounded-xl bg-ember-soft text-ember-deep dark:text-ember">
                    <Sparkles className="h-6 w-6" aria-hidden />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="flex items-baseline justify-between gap-2">
                    <span className="font-display text-base font-semibold">{n.name}</span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{n.walk}</span>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{n.note}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {/* FAQ + Contact + Accessibility */}
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <div className="h-full rounded-2xl border bg-card p-5">
              <p className="overline text-muted-foreground">Honest answers (FAQ)</p>
              <Accordion type="single" collapsible className="mt-3">
                <FaqItems />
              </Accordion>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="flex h-full flex-col gap-4 rounded-2xl border bg-card p-5">
              <p className="overline text-muted-foreground">Ask a human instead</p>
              <p className="text-sm text-muted-foreground">
                The concierge answers from the same data this page is built on — menus, prices,
                policies. It’s a demo, and it says so.
              </p>
              <Button
                className="rounded-full bg-pine text-cream hover:bg-pine-deep dark:bg-ember dark:text-ink dark:hover:bg-ember-deep"
                onClick={() => setConcierge(true)}
              >
                <Sparkles className="mr-2 h-4 w-4" aria-hidden /> Open the concierge
              </Button>
              <div className="mt-2 rounded-xl border bg-background/60 p-4 text-xs leading-relaxed text-muted-foreground">
                <p className="font-medium text-foreground">Accessibility statement</p>
                Step-free: the Lodge, Meadowlark, the cellar, The Barn. Accessible washrooms in all
                four. The Attic is stairs by design; the Aspen Suite is the equivalent room. Trail
                trips vary — the canoe and e-bike loop work for most chairs, call the hut and we’ll
                be specific.
              </div>
              <p className="mt-auto text-xs text-muted-foreground">
                <Library className="mr-1 inline h-3.5 w-3.5" aria-hidden />
                Printed copies of everything on this page live at reception.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function FaqItems() {
  return (
    <>
      {FAQS.map((f) => (
        <AccordionItem key={f.q} value={f.q}>
          <AccordionTrigger className="text-left text-sm font-medium">{f.q}</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
        </AccordionItem>
      ))}
    </>
  );
}
