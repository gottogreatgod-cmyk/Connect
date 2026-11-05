"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, MapPin, Phone, Mail, ArrowUpRight, LayoutGrid, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { BRAND, HOUSE_HOURS } from "@/lib/site";
import { CENSUS, CENSUS_TOTAL, TAXONOMY_SIZE, CENSUS_INSTANCE_NOTE } from "@/lib/module-census";
import { KestrelMark } from "@/components/brand/Mark";
import { useApp } from "@/store/useApp";
import { cn } from "@/lib/utils";

const NewsSchema = z.object({
  email: z.string().email("That address won’t reach the valley"),
});
type NewsForm = z.infer<typeof NewsSchema>;

const HOUSE_LINKS = [
  { label: "The Kestrel Lodge", href: "#stay" },
  { label: "Hearth & Vale", href: "#dine" },
  { label: "The Vessel", href: "#drink" },
  { label: "Meadowlark & Ember", href: "#cafe" },
  { label: "Trailhead", href: "#adventure" },
  { label: "The Grove & The Barn", href: "#camp" },
];

const VALLEY_LINKS = [
  { label: "Field notes", href: "#journal" },
  { label: "Celebrate with us", href: "#celebrate" },
  { label: "The valley, practically", href: "#local" },
  { label: "Vale Club", href: "#club" },
  { label: "Join the crew", href: "#careers" },
];

export function SiteFooter() {
  const setPortalOpen = useApp((s) => s.setPortalOpen);
  const [news, setNews] = useState<"idle" | "done">("idle");
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NewsForm>({ resolver: zodResolver(NewsSchema) });

  const onNews = (data: NewsForm) => {
    setNews("done");
    toast("You’re on the list", { description: "Field notes, first snow, and the odd recipe. Demo flow." });
    reset();
    setTimeout(() => setNews("idle"), 5000);
  };

  return (
    <footer className="mt-auto border-t bg-pine-deep text-cream/90 dark:bg-[oklch(0.14_0.015_175)]">
      {/* NewsletterSignup band */}
      <div className="border-b border-cream/10">
        <div className="shell grid gap-8 py-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <p className="overline text-gold">The letter</p>
            <h3 className="mt-3 font-display text-2xl font-semibold text-cream">
              First snow, first releases, and the odd recipe.
            </h3>
            <p className="mt-2 max-w-md text-sm text-cream/70">
              One letter a month from the valley. No noise — we don’t have the bandwidth for it.
            </p>
          </div>
          <form
            onSubmit={handleSubmit(onNews)}
            className="flex flex-col gap-2 sm:flex-row"
            aria-label="Newsletter signup"
            noValidate
          >
            <div className="flex-1">
              <label htmlFor="news-email" className="sr-only">
                Email
              </label>
              <Input
                id="news-email"
                type="email"
                placeholder="you@example.com"
                className="h-11 border-cream/20 bg-cream/10 text-cream placeholder:text-cream/40 focus-visible:ring-gold"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-[#f3b95f]" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="h-11 rounded-full bg-ember px-5 text-ink hover:bg-gold"
              disabled={news === "done"}
            >
              {news === "done" ? <Check className="h-4 w-4" aria-hidden /> : "Send it up"}
            </Button>
          </form>
        </div>
      </div>

      {/* Main grid */}
      <div className="shell grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
        {/* NAP + hours */}
        <div>
          <div className="flex items-center gap-3">
            <KestrelMark tone="cream" className="h-9 w-9" />
            <div>
              <p className="font-display text-lg font-semibold text-cream">Kestrel Vale</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cream/60">
                Est. {BRAND.est} · Alpine collective
              </p>
            </div>
          </div>
          <address className="mt-5 space-y-2 text-sm not-italic text-cream/75">
            <a href={BRAND.phoneHref} className="flex items-center gap-2 hover:text-cream">
              <Phone className="h-3.5 w-3.5" aria-hidden /> {BRAND.phone}
            </a>
            <a href={`mailto:${BRAND.email}`} className="flex items-center gap-2 hover:text-cream">
              <Mail className="h-3.5 w-3.5" aria-hidden /> {BRAND.email}
            </a>
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              {BRAND.address}
              <br />
              {BRAND.region}
            </p>
            <a
              className="inline-flex items-center gap-1 text-gold underline-offset-4 hover:underline"
              href="https://www.google.com/maps/search/?api=1&query=Kestrel+Vale+Vale+Hollow"
              target="_blank"
              rel="noreferrer"
            >
              Directions <ArrowUpRight className="h-3 w-3" aria-hidden />
            </a>
          </address>

          {/* HoursTable */}
          <Accordion type="single" collapsible className="mt-6">
            <AccordionItem value="hours" className="border-cream/15">
              <AccordionTrigger className="py-2 text-sm text-cream/90 hover:no-underline">
                House hours
              </AccordionTrigger>
              <AccordionContent className="scroll-slim max-h-72 overflow-y-auto text-sm">
                <dl className="space-y-4">
                  {HOUSE_HOURS.map((h) => (
                    <div key={h.house}>
                      <dt className="font-medium text-cream">{h.house}</dt>
                      {h.rows.map(([k, v]) => (
                        <dd key={k} className="flex justify-between gap-4 text-cream/70">
                          <span>{k}</span>
                          <span className="tnum">{v}</span>
                        </dd>
                      ))}
                    </div>
                  ))}
                </dl>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Houses */}
        <nav aria-label="The houses">
          <p className="overline mb-4 text-cream/50">The houses</p>
          <ul className="space-y-2.5 text-sm">
            {HOUSE_LINKS.map((l) => (
              <li key={l.href + l.label}>
                <a href={l.href} className="text-cream/75 transition-colors hover:text-gold">
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <button onClick={() => setPortalOpen(true)} className="text-cream/75 hover:text-gold">
                Vale portal
              </button>
            </li>
          </ul>
        </nav>

        {/* Valley */}
        <nav aria-label="The valley">
          <p className="overline mb-4 text-cream/50">The valley</p>
          <ul className="space-y-2.5 text-sm">
            {VALLEY_LINKS.map((l) => (
              <li key={l.href + l.label}>
                <a href={l.href} className="text-cream/75 transition-colors hover:text-gold">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Module census */}
        <div>
          <p className="overline mb-4 text-cream/50">Build honesty</p>
          <p className="text-sm leading-relaxed text-cream/75">
            A single page, engineered like a portal. It ships{" "}
            <strong className="text-cream">{CENSUS_TOTAL} distinct modules</strong> from the{" "}
            {TAXONOMY_SIZE}-module taxonomy — two categories (Food &amp; Hospitality × Travel &amp; Outdoors),
            all four tiers, flagship layer included.
          </p>
          <p className="mt-2 text-xs text-cream/50">{CENSUS_INSTANCE_NOTE}.</p>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 gap-2 rounded-full border-cream/25 bg-transparent text-cream hover:bg-cream/10 hover:text-gold"
              >
                <LayoutGrid className="h-4 w-4" aria-hidden /> Read the module census
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto border-cream/15 bg-pine-deep text-cream dark:bg-[oklch(0.16_0.02_175)]">
              <DialogHeader>
                <DialogTitle className="text-cream">
                  Module census — {CENSUS_TOTAL} of {TAXONOMY_SIZE}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {CENSUS.map((g) => (
                  <section key={g.area}>
                    <p className="overline text-gold">
                      {g.area} · {g.modules.length}
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {g.modules.map((m) => (
                        <li key={m.name} className="flex flex-wrap justify-between gap-2 border-b border-cream/10 pb-1.5 text-sm">
                          <span className="font-medium text-cream">{m.name}</span>
                          <span className="text-cream/60">{m.where}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Legal strip */}
      <div className="border-t border-cream/10">
        <div className="shell flex flex-wrap items-center justify-between gap-3 py-5 text-xs text-cream/55">
          <p>
            © {new Date().getFullYear()} Kestrel Vale — a fictional place. Reviews, figures and awards
            are demo content, badged as such where they appear.
          </p>
          <p className="flex items-center gap-4">
            <span>Privacy (the short version: we forget)</span>
            <span className="inline-flex items-center gap-1">
              <ScrollText className="h-3 w-3" aria-hidden /> Terms of the valley
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
