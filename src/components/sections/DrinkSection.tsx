"use client";

import { useRef, useState } from "react";
import {
  Check, Gift, Hand, Rotate3d, CalendarDays, Package, Sparkles, Wine as WineIcon, BadgePercent, Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageSlot } from "@/components/fx/Media";
import { Reveal } from "@/components/fx/Reveal";
import { DemoBadge } from "@/components/fx/Atoms";
import { SectionHeading } from "@/components/fx/SectionHeading";
import { CLUB_TIERS, PUBLIC_EVENTS, WINE_FILTERS, WINES, SUBSCRIPTIONS } from "@/lib/site";
import { money, fmtDate } from "@/lib/format";
import { useCart } from "@/store/useCart";
import { useApp } from "@/store/useApp";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * DrinkSection — The Vessel.
 * VirtualTourEmbed (drag-pan barrel hall) · full WineList with filters ·
 * MembershipSignup (club tiers) + SubscriptionSelector (cadence) ·
 * cellar events · GiftCardModule (design-a-card).
 */
export function DrinkSection() {
  const [filter, setFilter] = useState<string>("all");
  const [clubOpen, setClubOpen] = useState<string | null>(null);
  const [cadence, setCadence] = useState("w4");
  const setConcierge = useApp((s) => s.setConcierge);
  const wines = WINES.filter((w) => filter === "all" || w.type === filter);
  const clubEvents = PUBLIC_EVENTS.filter((e) => ["tasting", "supper"].includes(e.kind)).slice(0, 3);

  return (
    <section id="drink" className="section" aria-label="The Vessel — drink">
      <div className="shell space-y-14">
        <SectionHeading
          kicker="The Vessel · drink"
          title={<>Terraced vines, a candle-lit<br />barrel hall, and a club.</>}
          lede="The cellar pours Thursdays to Saturdays. The club ships four times a year and gets first call on everything."
        />

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* VirtualTourEmbed — drag pan */}
          <Reveal>
            <div className="overflow-hidden rounded-2xl border">
              <PanViewer src="/img/wine-cellar.jpg" alt="The barrel hall, candle-lit" />
              <div className="flex items-center justify-between gap-3 border-t bg-card p-4">
                <div>
                  <p className="font-display text-lg font-semibold">The barrel hall</p>
                  <p className="text-xs text-muted-foreground">Drag to look around — 180° of the cellar you drink in.</p>
                </div>
                <Badge variant="outline" className="rounded-full border-ember/50 text-ember-deep dark:text-ember">pan</Badge>
              </div>
            </div>
          </Reveal>

          {/* WineList — filterable */}
          <Reveal delay={0.08}>
            <div className="rounded-2xl border bg-card p-5">
              <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Wine filters">
                {WINE_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    role="tab"
                    aria-selected={filter === f.id}
                    onClick={() => setFilter(f.id)}
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                      filter === f.id
                        ? "bg-pine text-cream dark:bg-ember dark:text-ink"
                        : "border text-muted-foreground hover:border-ember/60 hover:text-foreground",
                    )}
                  >
                    {f.label}
                  </button>
                ))}
                <button
                  onClick={() => setConcierge(true, "sommelier")}
                  className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-ember-deep hover:underline dark:text-ember"
                >
                  <WineIcon className="h-3.5 w-3.5" aria-hidden /> pair with the concierge
                </button>
              </div>
              <ul className="mt-5 space-y-4" aria-live="polite">
                {wines.map((w) => (
                  <li key={w.name} className="price-row flex items-baseline text-sm">
                    <span>
                      <span className="font-display text-[15px]">{w.name}</span>{" "}
                      <span className="text-xs text-muted-foreground">{w.year}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{w.note}</span>
                    </span>
                    <span className="menu-leader" aria-hidden />
                    <span className="tnum text-right text-xs text-muted-foreground">
                      <span className="block font-semibold text-foreground">{money(w.glass)}</span>
                      glass · {money(w.bottle)} btl
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <DemoBadge compact /> Vessel wines are the house’s own; small growers fill the rest of the list.
              </p>
            </div>
          </Reveal>
        </div>

        {/* MembershipSignup — club tiers */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h3 className="font-display text-2xl font-semibold">The cellar club</h3>
            <p className="text-sm text-muted-foreground">Cancel any month. Bottles you’ve already paid for always ship.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {CLUB_TIERS.map((tier, i) => (
              <Reveal key={tier.id} delay={i * 0.06} className="h-full">
                <article
                  className={cn(
                    "flex h-full flex-col rounded-2xl border bg-card p-6",
                    tier.tag === "Most loved" && "border-ember/60 shadow-[0_0_0_1px_var(--ember)_30%]",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-display text-xl font-semibold">{tier.name}</h4>
                    {tier.tag && (
                      <Badge variant="outline" className="rounded-full border-ember/50 text-[10px] uppercase tracking-wider text-ember-deep dark:text-ember">
                        {tier.tag}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-3">
                    <span className="tnum font-display text-3xl font-semibold">{money(tier.price)}</span>
                    <span className="text-sm text-muted-foreground"> /{tier.per} · {tier.bottles}</span>
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    {tier.perks.map((p) => (
                      <li key={p} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-pine dark:text-ember" aria-hidden />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-5 rounded-full bg-pine text-cream hover:bg-pine-deep dark:bg-ember dark:text-ink dark:hover:bg-ember-deep"
                    onClick={() => setClubOpen(tier.id)}
                  >
                    Join {tier.name}
                  </Button>
                </article>
              </Reveal>
            ))}
          </div>

          {/* cellar events + subscription cadence note */}
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <Reveal>
              <div className="rounded-2xl border bg-card p-5">
                <p className="overline text-muted-foreground">In the cellar soon</p>
                <ul className="mt-4 space-y-4">
                  {clubEvents.map((e) => (
                    <li key={e.id} className="flex items-baseline gap-4">
                      <span className="w-14 shrink-0 text-center">
                        <span className="block rounded-lg bg-pine px-2 py-1 text-xs font-semibold text-cream dark:bg-ember dark:text-ink tnum">
                          {fmtDate(e.date)}
                        </span>
                      </span>
                      <span className="min-w-0">
                        <span className="block font-medium">{e.name}</span>
                        <span className="block text-xs text-muted-foreground">
                          {e.time} · {e.where} · {e.price === "0" ? "no charge" : money(Number(e.price))}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
                <a href="#celebrate" className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-ember-deep hover:underline dark:text-ember">
                  The full valley calendar <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                </a>
              </div>
            </Reveal>

            {/* SubscriptionSelector (club cadence inside dialog too; here the bean cadence) */}
            <Reveal delay={0.08}>
              <div className="rounded-2xl border bg-card p-5" id="gift">
                <p className="overline text-muted-foreground">Gift a house — or a month of it</p>
                <GiftCardDesigner />
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Club join dialog — MembershipSignup + SubscriptionSelector */}
      <Dialog open={!!clubOpen} onOpenChange={(v) => !v && setClubOpen(null)}>
        <DialogContent aria-describedby={undefined} className="max-w-md">
          <DialogHeader>
            <DialogTitle>Join the {CLUB_TIERS.find((t) => t.id === clubOpen)?.name} club</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <fieldset>
              <legend className="text-sm font-medium">Shipment cadence</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {SUBSCRIPTIONS.map((s) => {
                  const months = s.id === "w1" ? "monthly" : s.id === "w2" ? "every 2 months" : "quarterly";
                  return (
                    <button
                      key={s.id}
                      onClick={() => setCadence(s.id)}
                      aria-pressed={cadence === s.id}
                      className={cn(
                        "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                        cadence === s.id ? "bg-pine text-cream dark:bg-ember dark:text-ink" : "border text-muted-foreground hover:border-ember/60",
                      )}
                    >
                      {months}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Quarterly is the house standard — wine rests, you rest.
              </p>
            </fieldset>
            <div className="rounded-xl border bg-muted/40 p-4 text-sm">
              <p className="flex justify-between">
                <span>{CLUB_TIERS.find((t) => t.id === clubOpen)?.bottles} per shipment</span>
                <span className="tnum font-semibold">
                  {money(CLUB_TIERS.find((t) => t.id === clubOpen)?.price ?? 0)}
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Pause or cancel from the portal, any month. Demo signup — nothing charges.</p>
            </div>
            <Button
              className="w-full rounded-full bg-pine text-cream hover:bg-pine-deep dark:bg-ember dark:text-ink dark:hover:bg-ember-deep"
              onClick={() => {
                setClubOpen(null);
                toast("Welcome to the club", { description: "First shipment leaves the cellar on the 1st. Demo flow." });
              }}
            >
              <Package className="mr-2 h-4 w-4" aria-hidden /> Confirm membership
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

/** Drag-pan VirtualTourEmbed — wide image, pointer-driven background-position. */
function PanViewer({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);
  const setFromClientX = (x: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((x - r.left) / r.width) * 100)));
  };
  return (
    <div
      ref={ref}
      className="img-slot relative aspect-[16/10] w-full cursor-grab touch-none overflow-hidden active:cursor-grabbing"
      onPointerDown={(e) => {
        dragging.current = true;
        setFromClientX(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && setFromClientX(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerLeave={() => (dragging.current = false)}
      role="region"
      aria-label={alt}
    >
      <ImageSlot
        src={src}
        alt={alt}
        fill
        sizes="(max-width:1024px) 100vw, 55vw"
        className="h-full w-full"
        imgClassName="object-cover"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-transform duration-75 ease-out"
        style={{
          background: `linear-gradient(to ${pos > 50 ? "left" : "right"}, transparent ${Math.abs(50 - pos) * 1.6}%, rgba(20,26,22,0.5))`,
        }}
      />
      <span className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink/60 px-3 py-1.5 text-[11px] font-medium text-cream backdrop-blur">
        <Rotate3d className="h-3.5 w-3.5" aria-hidden /> drag to look · {Math.round(pos)}°
      </span>
      <span className="pointer-events-none absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-ink/60 text-cream backdrop-blur">
        <Hand className="h-4 w-4" aria-hidden />
      </span>
    </div>
  );
}

/** GiftCardModule — design-a-card, live preview, adds to the bag. */
function GiftCardDesigner() {
  const [amount, setAmount] = useState(100);
  const [custom, setCustom] = useState("");
  const [to, setTo] = useState("");
  const [msg, setMsg] = useState("For a slow weekend in the valley.");
  const add = useCart((s) => s.add);
  const amounts = [50, 100, 200];

  const value = custom ? Math.min(500, Math.max(25, Number(custom) || 0)) : amount;

  return (
    <div className="mt-4 space-y-5">
      {/* live card preview */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-pine to-pine-deep p-5 text-cream shadow-lg dark:from-[#2a3d33] dark:to-pine-deep">
        <div className="grain absolute inset-0" aria-hidden />
        <div className="relative flex items-start justify-between">
          <p className="font-display text-lg font-semibold">Kestrel Vale</p>
          <Gift className="h-5 w-5 text-[#e8c089]" aria-hidden />
        </div>
        <p className="relative mt-6 font-display text-4xl font-semibold tnum">{money(value)}</p>
        <p className="relative mt-1 text-xs text-cream/70">any house · any stay · no expiry</p>
        {to && <p className="relative mt-3 text-sm text-cream/90">to {to}{msg ? " — " : ""}{msg ? `“${msg}”` : ""}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label className="text-sm">Amount</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {amounts.map((a) => (
              <button
                key={a}
                onClick={() => { setAmount(a); setCustom(""); }}
                aria-pressed={!custom && amount === a}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium",
                  !custom && amount === a ? "bg-pine text-cream dark:bg-ember dark:text-ink" : "border text-muted-foreground hover:border-ember/60",
                )}
              >
                {money(a)}
              </button>
            ))}
            <Input
              value={custom}
              onChange={(e) => setCustom(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="custom"
              inputMode="numeric"
              className="h-9 w-24 rounded-full"
              aria-label="Custom amount"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="gc-to" className="text-sm">To</Label>
          <Input id="gc-to" value={to} onChange={(e) => setTo(e.target.value)} placeholder="Their name" className="mt-2" />
          <Label htmlFor="gc-msg" className="mt-3 block text-sm">Note</Label>
          <Textarea id="gc-msg" rows={2} value={msg} onChange={(e) => setMsg(e.target.value)} className="mt-2" />
        </div>
      </div>

      <Button
        className="w-full rounded-full bg-ember text-ink hover:bg-gold"
        onClick={() => {
          add({ kind: "gift", id: `gift-${value}-${Date.now()}`, name: `Gift card${to ? ` for ${to}` : ""}`, price: value, meta: msg });
          toast("Gift card in the bag", { description: `${money(value)} — checkout when you’re ready.` });
        }}
      >
        <BadgePercent className="mr-2 h-4 w-4" aria-hidden /> Add to bag — {money(value)}
      </Button>
    </div>
  );
}
