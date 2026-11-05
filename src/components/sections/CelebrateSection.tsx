"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Armchair, ArrowRight, CalendarDays, Check, ChevronLeft, ChevronRight, FileUp, PartyPopper,
  Users2, LayoutTemplate, Sparkles, TriangleAlert, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { ImageSlot } from "@/components/fx/Media";
import { Reveal, FadeSwap } from "@/components/fx/Reveal";
import { DemoBadge } from "@/components/fx/Atoms";
import { SectionHeading } from "@/components/fx/SectionHeading";
import {
  CATERING_TIERS, EVENT_ADDONS, PUBLIC_EVENTS, SEAT_TIERS, VENUES,
} from "@/lib/site";
import { money, fmtDate, addDays } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * CelebrateSection — The Barn & the meadow.
 * VenueSpaceCard · FloorplanViewer (capacity-reactive SVG) ·
 * QuoteCalculator (per-head catering) · EventPackageBuilder ·
 * EventCalendar (month grid) · SeatMap + TicketSelector (supper club) ·
 * WaitlistForm · GroupBookingForm (RFP w/ IntakeDocumentUpload).
 */
export function CelebrateSection() {
  const [venue, setVenue] = useState("barn");
  const [guests, setGuests] = useState(80);
  const [tier, setTier] = useState("family");
  const [addons, setAddons] = useState<Record<string, boolean>>({ lights: true, sound: true });
  const [monthOffset, setMonthOffset] = useState(0);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [rfpOpen, setRfpOpen] = useState(false);
  const [seatSel, setSeatSel] = useState<string[]>(["hearth-r1-3", "hall-r2-5"]);

  const venueObj = VENUES.find((v) => v.id === venue)!;

  const quote = useMemo(() => {
    const t = CATERING_TIERS.find((x) => x.id === tier)!;
    const perHead = t.per * guests;
    const addonLines = EVENT_ADDONS.filter((a) => addons[a.id]);
    const addonTotal = addonLines.reduce((a, x) => a + x.price, 0);
    const siteFee = venueObj.price;
    const sub = perHead + addonTotal + siteFee;
    const tax = Math.round(sub * 0.08 * 100) / 100;
    return {
      perHead,
      addonLines,
      addonTotal,
      siteFee,
      sub,
      tax,
      total: Math.round((sub + tax) * 100) / 100,
      perGuest: Math.round(((sub + tax) / Math.max(1, guests)) * 100) / 100,
    };
  }, [tier, guests, addons, venueObj]);

  return (
    <section id="celebrate" className="section" aria-label="Celebrate — The Barn">
      <div className="shell space-y-14">
        <SectionHeading
          kicker="Celebrate · the barn"
          title={<>They married in the meadow.<br />We fed eighty in the barn.</>}
          lede="One 1840s timber barn, a loft above the cellar, and a river bend for the big ones. Floorplans, per-head pricing and a waitlist that actually behaves — all live."
          demo
        />

        {/* VenueSpaceCard row */}
        <div className="grid gap-6 md:grid-cols-3">
          {VENUES.map((v, i) => (
            <Reveal key={v.id} delay={i * 0.06} className="h-full">
              <button
                onClick={() => {
                  setVenue(v.id);
                  setGuests(Math.min(guests, v.seated));
                }}
                aria-pressed={venue === v.id}
                className={cn(
                  "flex h-full w-full flex-col overflow-hidden rounded-2xl border text-left transition-all",
                  venue === v.id ? "border-ember shadow-lg ring-1 ring-ember/30" : "hover:shadow-md",
                )}
              >
                <span className="relative">
                  <ImageSlot src={v.img} alt={v.name} className="aspect-[16/10] w-full" sizes="(max-width:768px) 100vw, 33vw" />
                  {venue === v.id && (
                    <span className="absolute right-3 top-3 rounded-full bg-ember px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cream">selected</span>
                  )}
                </span>
                <span className="flex flex-1 flex-col p-4">
                  <span className="font-display text-lg font-semibold">{v.name}</span>
                  <span className="text-xs text-muted-foreground">{v.note}</span>
                  <span className="mt-3 flex gap-3 text-sm text-muted-foreground">
                    <span className="tnum">seated {v.seated}</span>·<span className="tnum">standing {v.standing}</span>
                  </span>
                  <span className="mt-auto pt-3 text-sm font-semibold tnum text-ember-deep dark:text-ember">
                    {money(v.price)} <span className="font-normal text-muted-foreground">site fee</span>
                  </span>
                </span>
              </button>
            </Reveal>
          ))}
        </div>

        {/* FloorplanViewer + QuoteCalculator */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="rounded-2xl border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="overline text-muted-foreground">Floorplan — capacity-reactive</p>
                <Badge variant="outline" className="rounded-full tnum">
                  {guests} seated
                </Badge>
              </div>
              <FadeSwap id={`${venue}-${guests}`} className="mt-4">
                <Floorplan venue={venue} guests={guests} setGuests={setGuests} max={venueObj.seated} />
              </FadeSwap>
              <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
                <Users2 className="h-4 w-4" aria-hidden />
                Drag the slider — tables appear and disappear as the room fills.
              </div>
            </div>
          </Reveal>

          {/* QuoteCalculator */}
          <Reveal delay={0.08}>
            <div className="flex h-full flex-col rounded-2xl border bg-card p-5">
              <p className="overline text-muted-foreground">Quote calculator — live per-head</p>
              <div className="mt-4 space-y-4">
                <div>
                  <Label className="text-sm">Service style</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {CATERING_TIERS.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTier(t.id)}
                        aria-pressed={tier === t.id}
                        className={cn(
                          "rounded-full px-3.5 py-1.5 text-xs font-medium",
                          tier === t.id ? "bg-pine text-cream dark:bg-ember dark:text-ink" : "border text-muted-foreground hover:border-ember/60",
                        )}
                      >
                        {t.label} · {money(t.per)}/head
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm">Add-ons</Label>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {EVENT_ADDONS.map((a) => (
                      <label
                        key={a.id}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-xl border p-2.5 text-sm",
                          addons[a.id] && "border-ember bg-ember-soft/40 dark:bg-ember-soft/20",
                        )}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={!!addons[a.id]}
                          onChange={(e) => setAddons((x) => ({ ...x, [a.id]: e.target.checked }))}
                        />
                        <span
                          className={cn(
                            "flex h-5 w-5 items-center justify-center rounded-[6px] border",
                            addons[a.id] ? "border-ember bg-ember text-cream" : "border-input",
                          )}
                          aria-hidden
                        >
                          {addons[a.id] && <Check className="h-3 w-3" />}
                        </span>
                        {a.label} <span className="ml-auto tnum text-xs text-muted-foreground">{money(a.price)}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <dl className="space-y-1.5 border-t pt-4 text-sm" aria-live="polite">
                  <div className="flex justify-between text-muted-foreground">
                    <dt>{CATERING_TIERS.find((t) => t.id === tier)?.label} × {guests}</dt>
                    <dd className="tnum">{money(quote.perHead)}</dd>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <dt>{venueObj.name} site fee</dt>
                    <dd className="tnum">{money(quote.siteFee)}</dd>
                  </div>
                  {quote.addonLines.map((a) => (
                    <div key={a.id} className="flex justify-between text-muted-foreground">
                      <dt>{a.label}</dt>
                      <dd className="tnum">{money(a.price)}</dd>
                    </div>
                  ))}
                  <div className="flex justify-between text-muted-foreground">
                    <dt>Valley tax 8%</dt>
                    <dd className="tnum">{money(quote.tax)}</dd>
                  </div>
                  <div className="flex items-baseline justify-between border-t pt-2 font-display text-xl font-semibold">
                    <dt>Total</dt>
                    <dd className="tnum">{money(quote.total)}</dd>
                  </div>
                  <p className="text-xs text-muted-foreground">≈ {money(quote.perGuest)} per guest, all-in.</p>
                </dl>
                <div className="mt-auto flex flex-wrap gap-2">
                  <Button
                    className="rounded-full bg-pine text-cream hover:bg-pine-deep dark:bg-ember dark:text-ink dark:hover:bg-ember-deep"
                    onClick={() => toast("Quote snapshot saved (demo)", { description: `${money(quote.total)} — attached to your enquiry draft.` })}
                  >
                    Snapshot this quote
                  </Button>
                  <Button variant="outline" className="rounded-full" onClick={() => setRfpOpen(true)}>
                    Send an enquiry <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Supper club: SeatMap + TicketSelector + WaitlistForm */}
        <Reveal>
          <div className="grid gap-6 rounded-2xl border bg-card p-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="overline text-muted-foreground">Supper club — Fire &amp; Ice</p>
                  <h3 className="font-display text-xl font-semibold">Six courses on ember, served on ice</h3>
                </div>
                <Badge className="rounded-full bg-destructive/15 text-destructive hover:bg-destructive/15">sold out</Badge>
              </div>
              {/* SeatMap */}
              <div className="mt-5 rounded-xl border bg-background/60 p-5">
                <div className="mx-auto w-fit rounded-full bg-pine px-4 py-1.5 text-xs font-semibold text-cream dark:bg-ember dark:text-ink">
                  🔥 the fire — the pass
                </div>
                <div className="mt-6 space-y-5">
                  {SEAT_TIERS.map((st) => (
                    <div key={st.id}>
                      <div className="mb-1.5 flex items-baseline justify-between text-xs">
                        <span className="font-medium">{st.label}</span>
                        <span className="text-muted-foreground tnum">
                          {money(st.price)} · {st.note}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5" role="group" aria-label={st.label}>
                        {Array.from({ length: st.rows * 6 }, (_, i) => {
                          const id = `${st.id}-r${Math.floor(i / 6) + 1}-${(i % 6) + 1}`;
                          const taken = (i * 7) % 5 === 2;
                          const sel = seatSel.includes(id);
                          return (
                            <button
                              key={id}
                              disabled={taken}
                              onClick={() => setSeatSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))}
                              aria-label={`Seat ${id}${taken ? " — taken" : sel ? " — selected" : ""}`}
                              aria-pressed={sel}
                              className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-lg border text-[10px] transition-colors",
                                taken && "cursor-not-allowed border-dashed bg-muted text-muted-foreground opacity-50",
                                !taken && sel && "border-ember bg-ember text-cream",
                                !taken && !sel && "border hover:border-ember/60",
                              )}
                            >
                              {taken ? <X className="h-3 w-3" aria-hidden /> : <Armchair className="h-3.5 w-3.5" aria-hidden />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-xs text-muted-foreground">
                  {seatSel.length} selected — {seatSel.length ? money(SEAT_TIERS.reduce((a, st) => a + seatSel.filter((s) => s.startsWith(st.id)).length * st.price, 0)) : money(0)}. Every seat faces the fire; the loft rail looks down on the pass.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="rounded-xl border bg-ember-soft/50 p-4 dark:bg-ember-soft/25">
                <p className="font-display text-lg font-semibold">23 Jan, 19:00 — The Barn</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  36 covers, one seating, six courses. Ember-cooked, ice-served. Gloves provided;
                  mittens discouraged.
                </p>
                <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <li className="flex justify-between"><span>Hearth counter</span><span className="tnum">{money(120)}</span></li>
                  <li className="flex justify-between"><span>Hall table</span><span className="tnum">{money(85)}</span></li>
                  <li className="flex justify-between"><span>Loft rail</span><span className="tnum">{money(65)}</span></li>
                </ul>
              </div>
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => setWaitlistOpen(true)}
              >
                Join the waitlist <ChevronRight className="ml-1.5 h-4 w-4" aria-hidden />
              </Button>
              <p className="text-xs text-muted-foreground">
                Waitlist behavior: seats release 72h before, in order, no jumping. Demo module —
                real events work like this and half the industry doesn’t.
              </p>
            </div>
          </div>
        </Reveal>

        {/* EventCalendar — month grid */}
        <Reveal>
          <div className="rounded-2xl border bg-card p-5">
            <EventCalendar monthOffset={monthOffset} onOffset={setMonthOffset} />
          </div>
        </Reveal>
      </div>

      <WaitlistDialog open={waitlistOpen} onOpenChange={setWaitlistOpen} />
      <RfpDialog open={rfpOpen} onOpenChange={setRfpOpen} />
    </section>
  );
}

/** FloorplanViewer — SVG that reacts to guest count. */
function Floorplan({ venue, guests, setGuests, max }: { venue: string; guests: number; setGuests: (n: number) => void; max: number }) {
  const tableCount = Math.max(2, Math.min(12, Math.round(guests / 8) + 1));
  const layout = venue === "barn" ? "barn" : venue === "loft" ? "loft" : "meadow";
  return (
    <div className="space-y-4">
      <div className="img-slot relative aspect-[16/10] w-full rounded-xl" role="img" aria-label={`Floorplan for ${venue} with ${guests} seated`}>
        <svg viewBox="0 0 100 62" className="absolute inset-0 h-full w-full" aria-hidden>
          <rect x="4" y="4" width="92" height="54" rx="3" fill="#1f3d33" fillOpacity="0.08" stroke="#1f3d33" strokeOpacity="0.35" />
          {layout === "barn" && (
            <>
              <rect x="4" y="46" width="18" height="12" rx="2" fill="#c08555" fillOpacity="0.25" />
              <text x="13" y="53.5" fontSize="3" textAnchor="middle" fill="#8a5a2a">stage</text>
              <rect x="82" y="46" width="14" height="12" rx="2" fill="#1f3d33" fillOpacity="0.15" />
              <text x="89" y="53.5" fontSize="3" textAnchor="middle" fill="#5c7a6c">bar</text>
            </>
          )}
          {layout === "loft" && (
            <>
              <rect x="4" y="46" width="92" height="12" rx="2" fill="#c08555" fillOpacity="0.2" />
              <text x="50" y="53.5" fontSize="3" textAnchor="middle" fill="#8a5a2a">candles only — the loft’s one rule</text>
            </>
          )}
          {layout === "meadow" && (
            <path d="M4 50 C 30 44, 60 58, 96 50" fill="none" stroke="#7da393" strokeWidth="3" strokeOpacity="0.7" />
          )}
          {/* long tables */}
          {Array.from({ length: tableCount }, (_, i) => {
            const cols = 3;
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = 12 + col * 28;
            const y = 12 + row * 12;
            return (
              <g key={i}>
                <rect x={x} y={y} width="22" height="7" rx="1.5" fill="#c08555" fillOpacity={0.28 + (venue === "loft" ? 0.08 : 0)} stroke="#c08555" strokeOpacity="0.6" />
                <text x={x + 11} y={y + 4.6} fontSize="2.8" textAnchor="middle" fill="#8a5a2a">
                  table {i + 1}
                </text>
              </g>
            );
          })}
          <text x="50" y="60" fontSize="3" textAnchor="middle" fill="#8b826b">
            {venue} · {guests} seated · {tableCount} tables
          </text>
        </svg>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-muted-foreground">20</span>
        <Slider min={20} max={max} step={2} value={[guests]} onValueChange={(v) => setGuests(v[0])} aria-label="Guests seated" />
        <span className="text-xs text-muted-foreground tnum">{max}</span>
      </div>
    </div>
  );
}

/** EventCalendar — real month grid with the valley’s events. */
function EventCalendar({ monthOffset, onOffset }: { monthOffset: number; onOffset: (n: number) => void }) {
  const base = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + monthOffset, 1);
  }, [monthOffset]);
  const monthStart = base;
  const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
  const firstWeekday = monthStart.getDay();
  const cells: (Date | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(monthStart.getFullYear(), monthStart.getMonth(), i + 1)),
  ];
  while (cells.length % 7) cells.push(null);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, (typeof PUBLIC_EVENTS)[number][]>();
    for (const e of PUBLIC_EVENTS) {
      const d = new Date(e.date);
      if (d.getMonth() === monthStart.getMonth() && d.getFullYear() === monthStart.getFullYear()) {
        const k = String(d.getDate());
        map.set(k, [...(map.get(k) ?? []), e]);
      }
    }
    return map;
  }, [monthStart]);

  const monthLabel = monthStart.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="overline text-muted-foreground">The valley calendar</p>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOffset(monthOffset - 1)} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <p className="min-w-36 text-center font-display text-sm font-semibold">{monthLabel}</p>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOffset(monthOffset + 1)} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1.5 text-center">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i} className="py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {d}
          </span>
        ))}
        {cells.map((d, i) => {
          if (!d) return <span key={i} />;
          const evs = eventsByDay.get(String(d.getDate())) ?? [];
          const today = new Date().toDateString() === d.toDateString();
          return (
            <div
              key={i}
              className={cn(
                "flex min-h-16 flex-col rounded-lg border p-1.5 text-left",
                today ? "border-ember bg-ember-soft/40 dark:bg-ember-soft/20" : "bg-background/50",
              )}
            >
              <span className={cn("tnum text-xs font-semibold", today && "text-ember-deep dark:text-ember")}>
                {d.getDate()}
              </span>
              {evs.map((e) => (
                <span key={e.id} className="mt-0.5 truncate rounded bg-pine/10 px-1 text-[9px] font-medium leading-4 text-pine dark:text-ember" title={`${e.name} — ${e.time}`}>
                  {e.name}
                </span>
              ))}
            </div>
          );
        })}
      </div>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {PUBLIC_EVENTS.map((e) => (
          <li key={e.id} className="flex items-baseline gap-3 rounded-xl border bg-background/60 p-3">
            <span className="w-12 shrink-0 rounded-lg bg-pine px-2 py-1 text-center text-xs font-semibold text-cream dark:bg-ember dark:text-ink tnum">
              {fmtDate(e.date)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{e.name}</span>
              <span className="block text-xs text-muted-foreground">
                {e.time} · {e.where} · {e.price === "0" ? "no charge" : money(Number(e.price))}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** WaitlistForm dialog. */
function WaitlistDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const schema = z.object({
    name: z.string().min(2, "A name for the list"),
    contact: z.string().min(5, "Email or phone — where the knock lands"),
    party: z.number().min(1).max(4, "Waitlist holds up to 4"),
  });
  type F = z.infer<typeof schema>;
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<F>({ resolver: zodResolver(schema) });

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setDone(false); reset(); } }}>
      <DialogContent aria-describedby={undefined} className="max-w-md">
        <DialogHeader>
          <DialogTitle>Fire &amp; Ice — the waitlist</DialogTitle>
        </DialogHeader>
        {done ? (
          <div className="space-y-4">
            <div className="rounded-xl border bg-ember-soft/60 p-4 dark:bg-ember-soft/30">
              <p className="font-display text-lg font-semibold">You’re #14 in line</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Seats release 72h before, in order, no jumping. We knock once; if you’re asleep,
                the next name gets it. That’s the whole policy.
              </p>
            </div>
            <Button variant="outline" className="rounded-full" onClick={() => { setDone(false); reset(); }}>
              Add another name
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(() => { setDone(true); toast("On the list — #14 (demo)"); })} className="grid gap-4" noValidate>
            <div>
              <Label htmlFor="wl-name">Name</Label>
              <Input id="wl-name" className="mt-1.5" aria-invalid={!!errors.name} {...register("name")} />
              {errors.name && <p className="mt-1 text-xs text-destructive" role="alert">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="wl-contact">Email or phone</Label>
              <Input id="wl-contact" className="mt-1.5" aria-invalid={!!errors.contact} {...register("contact")} />
              {errors.contact && <p className="mt-1 text-xs text-destructive" role="alert">{errors.contact.message}</p>}
            </div>
            <div>
              <Label htmlFor="wl-party">Party size (1–4)</Label>
              <Input id="wl-party" type="number" min={1} max={4} className="mt-1.5" aria-invalid={!!errors.party} {...register("party", { valueAsNumber: true })} />
              {errors.party && <p className="mt-1 text-xs text-destructive" role="alert">{errors.party.message}</p>}
            </div>
            <Button type="submit" className="rounded-full bg-pine text-cream hover:bg-pine-deep dark:bg-ember dark:text-ink dark:hover:bg-ember-deep">
              Join the list <PartyPopper className="ml-1.5 h-4 w-4" aria-hidden />
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** GroupBookingForm — RFP with IntakeDocumentUpload (mood board). */
function RfpDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [step, setStep] = useState(0);
  const [occasion, setOccasion] = useState("wedding");
  const [files, setFiles] = useState<{ name: string; url: string }[]>([]);
  const [sent, setSent] = useState(false);
  const schema = z.object({
    name: z.string().min(2, "A name for the file"),
    email: z.string().email("Where the BEO lands"),
    date: z.string().min(4, "A rough date is enough"),
    budget: z.string().optional(),
    brief: z.string().min(20, "Twenty words — the shape of the day"),
  });
  type F = z.infer<typeof schema>;
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<F>({ resolver: zodResolver(schema) });

  const onFiles = (fl: FileList | null) => {
    if (!fl) return;
    const arr = Array.from(fl)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, 4);
    setFiles(arr.map((f) => ({ name: f.name, url: URL.createObjectURL(f) })));
    if (arr.length) toast("Mood board attached (demo)", { description: `${arr.length} image${arr.length === 1 ? "" : "s"} — stays in this browser.` });
  };

  const occasions = [
    { id: "wedding", label: "A wedding", pack: "Barn + meadow ceremony, festoon, florals, supper" },
    { id: "retreat", label: "A retreat", pack: "Lodge block-booking, sauna, two guided days" },
    { id: "supper", label: "A supper club", pack: "Loft, six courses, one seating, 30 covers" },
    { id: "corporate", label: "An offsite", pack: "The Study + e-bike loop + Hearth private table" },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setStep(0); setSent(false); reset(); setFiles([]); } }}>
      <DialogContent aria-describedby={undefined} className="scroll-slim max-h-[92vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Event enquiry — we write the BEO with you</DialogTitle>
        </DialogHeader>
        {sent ? (
          <div className="space-y-4">
            <div className="rounded-xl border bg-ember-soft/60 p-4 dark:bg-ember-soft/30">
              <p className="font-display text-lg font-semibold">Enquiry in — a host answers within a day</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Next: a 20-minute call, two menu sketches, and a date hold that costs nothing for
                fourteen days. Demo flow.
              </p>
            </div>
            <Button variant="outline" className="rounded-full" onClick={() => { setSent(false); setStep(0); reset(); setFiles([]); }}>
              Start another enquiry
            </Button>
          </div>
        ) : step === 0 ? (
          <div className="space-y-4">
            <p className="text-sm font-medium">What are we celebrating?</p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {occasions.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setOccasion(o.id)}
                  aria-pressed={occasion === o.id}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-colors",
                    occasion === o.id ? "border-ember bg-ember-soft/50 dark:bg-ember-soft/25" : "hover:border-ember/60",
                  )}
                >
                  <span className="block text-sm font-semibold">{o.label}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{o.pack}</span>
                </button>
              ))}
            </div>
            <Button className="rounded-full bg-pine text-cream hover:bg-pine-deep dark:bg-ember dark:text-ink dark:hover:bg-ember-deep" onClick={() => setStep(1)}>
              Continue <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
            </Button>
          </div>
        ) : step === 1 ? (
          <div className="space-y-5">
            <div>
              <Label htmlFor="rfp-files" className="text-sm">
                Mood board (optional — IntakeDocumentUpload)
              </Label>
              <label
                htmlFor="rfp-files"
                className="mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-6 text-center text-muted-foreground transition-colors hover:border-ember/60 hover:text-foreground"
                data-cursor="Upload"
              >
                <FileUp className="h-6 w-6" aria-hidden />
                <span className="text-sm">Drop images — the feel of the day</span>
                <span className="text-xs">up to 4 · never leaves this browser</span>
                <input id="rfp-files" type="file" accept="image/*" multiple className="sr-only" onChange={(e) => onFiles(e.target.files)} />
              </label>
              {files.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {files.map((f) => (
                    <li key={f.url} className="relative">
                      <img src={f.url} alt={f.name} className="h-16 w-16 rounded-lg border object-cover" />
                      <span className="absolute inset-x-0 bottom-0 truncate rounded-b-lg bg-ink/70 px-1 text-[9px] text-cream">{f.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" className="rounded-full" onClick={() => setStep(0)}>
                <ChevronLeft className="mr-1 h-4 w-4" aria-hidden /> Back
              </Button>
              <Button className="rounded-full bg-pine text-cream hover:bg-pine-deep dark:bg-ember dark:text-ink dark:hover:bg-ember-deep" onClick={() => setStep(2)}>
                Continue <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(() => { setSent(true); toast("Enquiry sent — a host answers within a day"); })} className="grid gap-4 sm:grid-cols-2" noValidate>
            <div>
              <Label htmlFor="rfp-name">Name</Label>
              <Input id="rfp-name" className="mt-1.5" aria-invalid={!!errors.name} {...register("name")} />
              {errors.name && <p className="mt-1 text-xs text-destructive" role="alert">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="rfp-email">Email</Label>
              <Input id="rfp-email" type="email" className="mt-1.5" aria-invalid={!!errors.email} {...register("email")} />
              {errors.email && <p className="mt-1 text-xs text-destructive" role="alert">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="rfp-date">Rough date</Label>
              <Input id="rfp-date" type="date" className="mt-1.5" aria-invalid={!!errors.date} {...register("date")} />
              {errors.date && <p className="mt-1 text-xs text-destructive" role="alert">{errors.date.message}</p>}
            </div>
            <div>
              <Label htmlFor="rfp-budget">Budget, if you have one</Label>
              <Input id="rfp-budget" placeholder="e.g. 8–12k" className="mt-1.5" {...register("budget")} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="rfp-brief">The shape of the day</Label>
              <Textarea id="rfp-brief" rows={3} className="mt-1.5" aria-invalid={!!errors.brief} {...register("brief")} />
              {errors.brief && <p className="mt-1 text-xs text-destructive" role="alert">{errors.brief.message}</p>}
            </div>
            <div className="flex justify-between sm:col-span-2">
              <Button type="button" variant="ghost" className="rounded-full" onClick={() => setStep(1)}>
                <ChevronLeft className="mr-1 h-4 w-4" aria-hidden /> Back
              </Button>
              <Button type="submit" className="rounded-full bg-pine text-cream hover:bg-pine-deep dark:bg-ember dark:text-ink dark:hover:bg-ember-deep">
                Send enquiry <Sparkles className="ml-1.5 h-4 w-4" aria-hidden />
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
