"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BookOpen, ChevronDown, Download, Flame, Sparkles, UtensilsCrossed, Wine as WineIcon, Users2, FileDown, Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageSlot, BeforeAfter } from "@/components/fx/Media";
import { Reveal } from "@/components/fx/Reveal";
import { DemoBadge, FlameMark, LivePulse } from "@/components/fx/Atoms";
import { SectionHeading } from "@/components/fx/SectionHeading";
import { MENU, SPECIALS, WINES, BRAND } from "@/lib/site";
import { weekday, money, fmtDateLong } from "@/lib/format";
import { buildPdf, downloadPdf, type LineSpec } from "@/lib/pdf";
import { useApp } from "@/store/useApp";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * DineSection — Hearth & Vale.
 * MenuBoard (tabbed, dotted leaders) · DailySpecials (real weekday) ·
 * tasting counter · PrivateDiningEnquiry · FounderStory ·
 * BeforeAfterSlider (the barn… used here for the dining room) ·
 * MenuPDFDownload (a real generated PDF) · sommelier hand-off.
 */
export function DineSection({ onTable, onSommelier }: { onTable: () => void; onSommelier: () => void }) {
  const today = useMemo(() => new Date(), []);
  const special = SPECIALS[today.getDay() === 0 ? 6 : today.getDay() - 1] ?? SPECIALS[5];
  const [privateOpen, setPrivateOpen] = useState(false);
  const setConcierge = useApp((s) => s.setConcierge);

  const downloadMenu = () => {
    const lines: LineSpec[] = [];
    lines.push({ t: "note", text: MENU.tasting.summary });
    lines.push({ t: "h", text: `Tasting — ${MENU.tasting.courses} courses` });
    lines.push({ t: "item", name: "Valley Reading, per guest", price: `$${MENU.tasting.price}`, note: `wine pairing +$${MENU.tasting.pairing} · ${MENU.tasting.duration}` });
    lines.push({ t: "rule" });
    for (const b of MENU.boards) {
      lines.push({ t: "h", text: b.label });
      for (const item of b.items) {
        lines.push({ t: "item", name: item.name, price: `$${item.price}`, note: item.note });
      }
    }
    lines.push({ t: "rule" });
    lines.push({ t: "note", text: `Served Wed–Sun from 18:30, one seating. Sunday slow lunch 12:30–15:30. ${BRAND.phone}. Everything here is demo content.` });
    downloadPdf("hearth-and-vale-menu.pdf", buildPdf("Hearth & Vale", "The Kestrel Vale reading of the valley — demo menu", lines));
    toast("Menu PDF downloaded", { description: "Generated on the fly — a real PDF, typeset in Helvetica." });
  };

  return (
    <section id="dine" className="section grain relative overflow-hidden bg-pine-deep text-cream dark:bg-[oklch(0.15_0.017_175)]" aria-label="Hearth & Vale — dine">
      <div className="shell space-y-14">
        <SectionHeading
          kicker="Hearth & Vale · dine"
          title={<>A seven-course reading<br />of this valley.</>}
          lede="One long oak table, eighteen seats at the counter, candles and the kitchen in full view. Wed–Sun, one seating at 18:30; slow lunch on Sundays."
          className="[&_p]:text-cream/70 [&_h2]:text-cream [&_.overline]:text-[#e8c089]"
        />

        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          {/* MenuBoard */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <p className="overline text-[#e8c089]">À la carte</p>
              <span aria-hidden className="h-px flex-1 bg-cream/15" />
              <Button variant="outline" size="sm" className="rounded-full border-cream/25 text-cream hover:bg-cream/10" onClick={downloadMenu}>
                <Download className="mr-1.5 h-4 w-4" aria-hidden /> Menu PDF
              </Button>
            </div>
            {MENU.boards.map((b) => (
              <Reveal key={b.id}>
                <div className="rounded-2xl border border-cream/15 bg-cream/[0.04] p-5">
                  <h3 className="overline mb-4 text-cream/60">{b.label}</h3>
                  <ul className="space-y-3.5">
                    {b.items.map((item) => (
                      <li key={item.name} className="price-row flex items-baseline text-[15px]">
                        <span className="font-display">{item.name}</span>
                        <span className="menu-leader" aria-hidden />
                        <span className="tnum text-[#e8c089]">{money(item.price)}</span>
                        <span className="sr-only"> — {item.note}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-xs text-cream/50">
                    {b.items.map((i) => i.note).join(" · ")}
                  </p>
                </div>
              </Reveal>
            ))}

            {/* Tasting */}
            <Reveal>
              <div className="rounded-2xl border border-[#e8c089]/40 bg-[#e8c089]/10 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl font-semibold text-cream">{MENU.tasting.name}</h3>
                    <p className="mt-1 text-sm text-cream/70">{MENU.tasting.summary}</p>
                  </div>
                  <div className="text-right">
                    <p className="tnum font-display text-2xl font-semibold text-[#e8c089]">{money(MENU.tasting.price)}</p>
                    <p className="text-xs text-cream/60">pairing +{money(MENU.tasting.pairing)}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="mt-4 rounded-full bg-[#e8c089] text-ink hover:bg-[#f0d0a6]"
                  onClick={onTable}
                  data-cursor="Book"
                >
                  <UtensilsCrossed className="mr-1.5 h-4 w-4" aria-hidden /> Reserve the counter
                </Button>
              </div>
            </Reveal>
          </div>

          {/* DailySpecials + story + wine hand-off */}
          <div className="space-y-6">
            <Reveal>
              <div className="rounded-2xl border border-cream/15 bg-cream/[0.04] p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="overline text-cream/60">Today — {weekday(today)}</p>
                  <LivePulse label="kitchen" className="!text-[#e8c089] [&_span:last-child]:!text-[#e8c089]" />
                </div>
                {special.price > 0 ? (
                  <>
                    <p className="mt-3 font-display text-xl font-semibold">{special.dish}</p>
                    <p className="mt-1 flex items-baseline justify-between text-sm text-cream/70">
                      <span>{special.note}</span>
                      <span className="tnum text-[#e8c089]">{money(special.price)}</span>
                    </p>
                    <p className="mt-2 text-xs text-cream/50">
                      Served {fmtDateLong(today)} — the specials board is written at 06:00 and photographed
                      to the portal. <DemoBadge compact className="ml-1" />
                    </p>
                  </>
                ) : (
                  <p className="mt-3 text-sm text-cream/70">{special.note} — the kitchen walks the moraine on Mondays.</p>
                )}
              </div>
            </Reveal>

            {/* FounderStory */}
            <Reveal>
              <figure className="overflow-hidden rounded-2xl border border-cream/15">
                <ImageSlot src="/img/chef-portrait.jpg" alt="Mara at the pass" className="aspect-[4/5] w-full sm:aspect-[3/2] lg:aspect-[4/5]" sizes="(max-width:1024px) 100vw, 45vw" />
                <figcaption className="bg-cream/[0.04] p-5">
                  <Quote className="h-5 w-5 text-[#e8c089]" aria-hidden />
                  <p className="mt-2 font-display text-lg leading-snug text-cream">
                    “We cook what the valley hands us. The menu is a field guide with prices.”
                  </p>
                  <p className="mt-3 text-xs text-cream/60">
                    Mara Kestrel, chef-partner · 41st season in this kitchen
                  </p>
                </figcaption>
              </figure>
            </Reveal>

            {/* BeforeAfter — the dining room, restored */}
            <Reveal>
              <div className="rounded-2xl border border-cream/15 bg-cream/[0.04] p-5">
                <p className="overline text-cream/60">The room, 2019 → now</p>
                <div className="mt-3 [&_.img-slot]:rounded-xl">
                  <BeforeAfter
                    before="/img/hero-valley.jpg"
                    after="/img/dining-hall.jpg"
                    beforeLabel="2019 — dusty"
                    afterLabel="Tonight"
                    beforeAlt="The dining room before restoration"
                    afterAlt="The dining room tonight"
                  />
                </div>
                <p className="mt-3 text-xs text-cream/50">
                  We sandblasted nothing. The char on the beams is 1840s and staying.
                </p>
              </div>
            </Reveal>

            {/* PrivateDiningEnquiry + sommelier */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Reveal className="h-full">
                <button
                  onClick={() => setPrivateOpen(true)}
                  className="flex h-full w-full flex-col rounded-2xl border border-cream/15 bg-cream/[0.04] p-5 text-left transition-colors hover:bg-cream/[0.08]"
                  data-cursor="Enquire"
                >
                  <Users2 className="h-5 w-5 text-[#e8c089]" aria-hidden />
                  <p className="mt-3 font-display text-lg font-semibold text-cream">The Study — private table</p>
                  <p className="mt-1 text-sm text-cream/70">Seats 10 behind the cellar door. $450 minimum, menus written with you.</p>
                  <span className="mt-3 text-xs text-[#e8c089]">Enquire for a date →</span>
                </button>
              </Reveal>
              <Reveal delay={0.06} className="h-full">
                <button
                  onClick={() => {
                    setConcierge(true, "sommelier");
                  }}
                  className="flex h-full w-full flex-col rounded-2xl border border-[#e8c089]/40 bg-[#e8c089]/10 p-5 text-left transition-colors hover:bg-[#e8c089]/20"
                  data-cursor="Ask"
                >
                  <WineIcon className="h-5 w-5 text-[#e8c089]" aria-hidden />
                  <p className="mt-3 font-display text-lg font-semibold text-cream">Pair tonight’s courses</p>
                  <p className="mt-1 text-sm text-cream/70">Hand your menu to the sommelier concierge — it reads the real list and answers with pours.</p>
                  <span className="mt-3 text-xs text-[#e8c089]">Ask the sommelier →</span>
                </button>
              </Reveal>
            </div>
          </div>
        </div>

        <FlameMark className="justify-center text-[#e8c089]" />

        {/* Wine list teaser (full cellar lives in Drink) */}
        <Reveal>
          <div className="grid gap-3 rounded-2xl border border-cream/15 bg-cream/[0.04] p-5 sm:grid-cols-2 lg:grid-cols-4">
            {WINES.slice(0, 4).map((w) => (
              <div key={w.name}>
                <p className="text-sm font-medium text-cream">{w.name}</p>
                <p className="mt-1 text-xs text-cream/60">{w.note}</p>
                <p className="mt-1.5 text-xs tnum text-[#e8c089]">glass {money(w.glass)} · bottle {money(w.bottle)}</p>
              </div>
            ))}
            <a href="#drink" className="flex items-center gap-2 self-center text-sm text-[#e8c089] hover:underline">
              The full cellar <ChevronDown className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </Reveal>
      </div>

      {/* PrivateDiningEnquiry dialog */}
      <PrivateDiningForm open={privateOpen} onOpenChange={setPrivateOpen} />
    </section>
  );
}

function PrivateDiningForm({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const schema = z.object({
    name: z.string().min(2, "A name for the table card"),
    email: z.string().email("Reachable email please"),
    date: z.string().min(4, "Pick a rough date"),
    party: z.number().min(2, "The Study seats 2–10").max(10, "The Study seats 2–10"),
    brief: z.string().min(10, "Tell us the occasion — ten words is plenty"),
  });
  type F = z.infer<typeof schema>;
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<F>({ resolver: zodResolver(schema) });

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setSent(false); reset(); } }}>
      <DialogContent aria-describedby={undefined} className="max-w-lg">
        <DialogHeader>
          <DialogTitle>The Study — private dining enquiry</DialogTitle>
        </DialogHeader>
        {sent ? (
          <div className="space-y-4">
            <div className="rounded-xl border bg-ember-soft/60 p-4 dark:bg-ember-soft/30">
              <p className="font-display text-lg font-semibold">Enquiry received</p>
              <p className="mt-1 text-sm text-muted-foreground">
                A host writes back within a day with two menu sketches and a date hold. Demo flow — nothing sends.
              </p>
            </div>
            <Button variant="outline" className="rounded-full" onClick={() => { setSent(false); reset(); }}>
              Send another
            </Button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(() => { setSent(true); toast("The Study — enquiry sent"); })}
            className="grid gap-4 sm:grid-cols-2"
            noValidate
          >
            <div>
              <Label htmlFor="pd-name">Name</Label>
              <Input id="pd-name" className="mt-1.5" aria-invalid={!!errors.name} {...register("name")} />
              {errors.name && <p className="mt-1 text-xs text-destructive" role="alert">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="pd-email">Email</Label>
              <Input id="pd-email" type="email" className="mt-1.5" aria-invalid={!!errors.email} {...register("email")} />
              {errors.email && <p className="mt-1 text-xs text-destructive" role="alert">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="pd-date">Rough date</Label>
              <Input id="pd-date" type="date" className="mt-1.5" aria-invalid={!!errors.date} {...register("date")} />
              {errors.date && <p className="mt-1 text-xs text-destructive" role="alert">{errors.date.message}</p>}
            </div>
            <div>
              <Label htmlFor="pd-party">Party (2–10)</Label>
              <Input id="pd-party" type="number" min={2} max={10} className="mt-1.5" aria-invalid={!!errors.party} {...register("party", { valueAsNumber: true })} />
              {errors.party && <p className="mt-1 text-xs text-destructive" role="alert">{errors.party.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="pd-brief">The occasion</Label>
              <Textarea id="pd-brief" rows={3} className="mt-1.5" aria-invalid={!!errors.brief} {...register("brief")} />
              {errors.brief && <p className="mt-1 text-xs text-destructive" role="alert">{errors.brief.message}</p>}
            </div>
            <Button type="submit" className="rounded-full bg-pine text-cream hover:bg-pine-deep dark:bg-ember dark:text-ink dark:hover:bg-ember-deep sm:col-span-2">
              Send the enquiry <Sparkles className="ml-1.5 h-4 w-4" aria-hidden />
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
