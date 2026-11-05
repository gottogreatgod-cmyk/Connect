"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, differenceInCalendarDays, format as fnsFormat } from "date-fns";
import type { DateRange } from "react-day-picker";
import { CalendarDays, Check, ChevronLeft, ChevronRight, Sparkles, Tag, Users, BedDouble, UtensilsCrossed, ArrowRight, FileDown, BellRing, BadgePercent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { RoomCard } from "@/components/sections/StaySection";
import { PROMOS, ROOMS, STAY_EXTRAS } from "@/lib/site";
import { money, nightsBetween, fmtRange } from "@/lib/format";
import { buildIcs, downloadIcs } from "@/lib/ics";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * ReservationFlow — one engine, two modes:
 *  - stay: dates → guests → room → extras → promo/contact → confirm
 *  - table: date → guests → time → contact → confirm
 * Ships BookingCalendar, PromoCodeField, SuccessState,
 * BookingConfirmation (ICS + ReminderOptIn).
 */

type Mode = "stay" | "table";

const stepsByMode: Record<Mode, string[]> = {
  stay: ["Dates", "Guests", "Room", "Extras", "Contact", "Confirm"],
  table: ["Date", "Party", "Time", "Contact", "Confirm"],
};

const contactSchema = z.object({
  name: z.string().min(2, "We need a name for the book"),
  email: z.string().email("That email won’t reach us"),
  phone: z.string().min(7, "A reachable number, in case of weather"),
  notes: z.string().max(300, "Keep it field-guide length").optional(),
});
type ContactForm = z.infer<typeof contactSchema>;

const TIMES = ["18:30"];

export function ReservationFlow({
  open,
  onOpenChange,
  initialMode = "stay",
  fixedRoom,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialMode?: Mode;
  fixedRoom?: string;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [step, setStep] = useState(0);
  const [range, setRange] = useState<{ from?: Date; to?: Date }>({});
  const [guests, setGuests] = useState(2);
  const [room, setRoom] = useState(fixedRoom ?? "aspen");
  const [extras, setExtras] = useState<Record<string, boolean>>({});
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<{ code: string; pct: number; label: string } | null>(null);
  const [tableTime, setTableTime] = useState("18:30");
  const [seating, setSeating] = useState<"counter" | "room">("counter");
  const [sms, setSms] = useState(false);
  const [done, setDone] = useState<null | { ref: string; title: string; start: Date; end: Date }>(null);
  const [reminder, setReminder] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactForm>({ resolver: zodResolver(contactSchema) });

  const steps = stepsByMode[mode];
  const nights = range.from && range.to ? nightsBetween(range.from, range.to) : 0;
  const roomObj = ROOMS.find((r) => r.id === room) ?? ROOMS[0];

  const pricing = useMemo(() => {
    if (mode !== "stay" || !nights) return null;
    const base = roomObj.price * Math.max(1, nights);
    const extraLines = STAY_EXTRAS.filter((e) => extras[e.id]).map((e) => ({
      label: e.label,
      amount: e.price * (e.id === "breakfast" ? guests * Math.max(1, nights) : e.id === "sauna" || e.id === "transfer" ? guests : Math.max(1, nights)),
    }));
    const extrasTotal = extraLines.reduce((a, e) => a + e.amount, 0);
    const sub = base + extrasTotal;
    const disc = promo ? Math.round(sub * (promo.pct / 100) * 100) / 100 : 0;
    const tax = Math.round((sub - disc) * 0.08 * 100) / 100;
    return { base, extraLines, extrasTotal, sub, disc, tax, total: Math.round((sub - disc + tax) * 100) / 100 };
  }, [mode, nights, roomObj, extras, guests, promo]);

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (PROMOS[code]) {
      setPromo({ code, pct: PROMOS[code].pct, label: PROMOS[code].label });
      toast(`Applied — ${PROMOS[code].label}`);
    } else {
      toast.error("Not in the book", { description: "Try VALE10 or FIRSTSNOW." });
    }
  };

  const canNext = (): boolean => {
    if (mode === "stay") {
      if (step === 0) return !!(range.from && range.to) && nights >= 1;
      if (step === 1) return guests >= 1 && guests <= 6;
      if (step === 2) return !!room;
      if (step === 3) return true;
      return true;
    }
    if (step === 0) return !!range.from;
    if (step === 1) return guests >= 1 && guests <= 10;
    if (step === 2) return !!tableTime;
    return true;
  };

  const submit = handleSubmit((data) => {
    const ref = `KV-${Math.floor(10000 + Math.random() * 90000)}`;
    const start =
      mode === "stay"
        ? (range.from ?? new Date())
        : new Date((range.from ?? new Date()).toDateString() + " " + tableTime);
    const end =
      mode === "stay"
        ? addDays(range.to ?? new Date(), 1)
        : addDays(start, 3 * 60 * 60 * 1000);
    setDone({
      ref,
      title:
        mode === "stay"
          ? `Stay — ${roomObj.name}, ${nights} night${nights === 1 ? "" : "s"}`
          : `Table — ${seating === "counter" ? "tasting counter" : "dining room"}, ${tableTime}`,
      start,
      end,
    });
    setStep(steps.length - 1);
    toast("The book is written in", { description: `Reference ${ref} · a host confirms by email within the hour.` });
  });

  const reset = () => {
    setStep(0);
    setDone(null);
    setRange({});
    setPromo(null);
    setPromoInput("");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setTimeout(reset, 300); }}>
      <DialogContent aria-describedby={undefined} className="scroll-slim max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-3 text-xl">
            {done ? "The book is in" : mode === "stay" ? "Reserve a stay" : "Reserve a table"}
            {!done && (
              <span className="flex rounded-full border p-0.5" role="tablist" aria-label="Reservation type">
                {(["stay", "table"] as Mode[]).map((m) => (
                  <button
                    key={m}
                    role="tab"
                    aria-selected={mode === m}
                    onClick={() => { setMode(m); setStep(0); setDone(null); }}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                      mode === m ? "bg-pine text-cream dark:bg-ember dark:text-ink" : "text-muted-foreground",
                    )}
                  >
                    {m === "stay" ? "Stay" : "Table"}
                  </button>
                ))}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {done ? (
          /* SuccessState + BookingConfirmation */
          <div className="space-y-5">
            <div className="flex items-center gap-3 rounded-xl border bg-ember-soft/60 p-4 dark:bg-ember-soft/30">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pine text-cream dark:bg-ember dark:text-ink">
                <Check className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="font-display text-lg font-semibold">{done.title}</p>
                <p className="text-sm text-muted-foreground">
                  {mode === "stay" && range.from && range.to
                    ? `${fmtRange(range.from, range.to)} · ${guests} guest${guests === 1 ? "" : "s"} · ${pricing ? money(pricing.total) : ""}`
                    : `${fnsFormat(done.start, "EEE d MMM")} · ${tableTime} · ${guests} guest${guests === 1 ? "" : "s"}`}
                </p>
              </div>
              <span className="ml-auto font-mono text-xs text-muted-foreground">{done.ref}</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                variant="outline"
                className="h-11 justify-start gap-2 rounded-xl"
                onClick={() =>
                  downloadIcs(
                    done.ref,
                    buildIcs({
                      title: `Kestrel Vale — ${done.title}`,
                      description: `Ref ${done.ref}. Questions: the counter answers all day.`,
                      location: "Kestrel Vale, 4 Pass Road, Vale Hollow",
                      start: done.start,
                      end: done.end,
                      uid: `${done.ref}@kestrelvale.demo`,
                    }),
                  )
                }
              >
                <FileDown className="h-4 w-4" aria-hidden /> Add to calendar (.ics)
              </Button>
              <Button
                variant={reminder ? "default" : "outline"}
                onClick={() => {
                  setReminder(!reminder);
                  if (!reminder) toast("We’ll text you the day before", { description: "Demo opt-in — no messages will be sent." });
                }}
                className={cn("h-11 justify-start gap-2 rounded-xl", reminder && "bg-pine text-cream hover:bg-pine-deep dark:bg-ember dark:text-ink")}
              >
                <BellRing className="h-4 w-4" aria-hidden /> {reminder ? "Reminder on" : "Remind me by SMS"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Free cancellation to 72h. A host confirms within the hour — this is a demo flow; nothing
              is charged and nobody writes to you.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={reset} className="rounded-full">Book something else</Button>
              <Button onClick={() => onOpenChange(false)} className="rounded-full bg-pine text-cream hover:bg-pine-deep dark:bg-ember dark:text-ink dark:hover:bg-ember-deep">
                Done
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Progress value={((step + 1) / steps.length) * 100} className="h-1" aria-label={`Step ${step + 1} of ${steps.length}`} />
            <p className="overline text-muted-foreground">
              Step {step + 1}/{steps.length} · {steps[step]}
            </p>

            {/* STEP: dates (stay) / date (table) */}
            {(mode === "stay" ? step === 0 : step === 0) && (
              <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
                <div>
                  {mode === "stay" ? (
                    <Calendar
                      mode="range"
                      selected={range as DateRange}
                      onSelect={(v) => setRange(v ?? {})}
                      disabled={{ before: new Date() }}
                      className="rounded-xl border p-3"
                    />
                  ) : (
                    <Calendar
                      mode="single"
                      selected={range.from as Date | undefined}
                      onSelect={(d: Date | undefined) => setRange({ from: d ?? undefined })}
                      disabled={{ before: new Date() }}
                      className="rounded-xl border p-3"
                    />
                  )}
                </div>
                <div className="space-y-4">
                  <div className="rounded-xl border bg-muted/40 p-4">
                    <p className="flex items-center gap-2 font-medium">
                      <CalendarDays className="h-4 w-4 text-ember-deep dark:text-ember" aria-hidden />
                      {mode === "stay"
                        ? range.from && range.to
                          ? `${fmtRange(range.from, range.to)} · ${nights} night${nights === 1 ? "" : "s"}`
                          : "Pick your dates"
                        : range.from
                          ? fnsFormat(range.from, "EEE d MMM")
                          : "Pick a date — we serve Wed–Sun"}
                    </p>
                    {mode === "stay" && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {[2, 3, 5].map((n) => (
                          <button
                            key={n}
                            onClick={() => {
                              const from = new Date();
                              setRange({ from, to: addDays(from, n) });
                            }}
                            className="rounded-full border px-3 py-1 text-xs hover:border-ember hover:text-ember-deep dark:hover:text-ember"
                          >
                            next {n} nights
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {mode === "stay" && (
                    <div className="rounded-xl border p-4">
                      <Label htmlFor="promo-early" className="flex items-center gap-2 text-sm font-medium">
                        <Tag className="h-4 w-4 text-ember-deep dark:text-ember" aria-hidden /> Promo code
                      </Label>
                      <div className="mt-2 flex gap-2">
                        <Input
                          id="promo-early"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value)}
                          placeholder="VALE10"
                          className="h-10 uppercase"
                        />
                        <Button type="button" variant="outline" className="h-10 rounded-full" onClick={applyPromo}>
                          Apply
                        </Button>
                      </div>
                      {promo && (
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-pine dark:text-ember">
                          <BadgePercent className="h-3.5 w-3.5" aria-hidden /> {promo.label}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP: guests / party */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="flex items-center justify-center gap-6 rounded-xl border bg-muted/40 p-6">
                  <Button variant="outline" size="icon" aria-label="Fewer guests" onClick={() => setGuests(Math.max(1, guests - 1))}>
                    –
                  </Button>
                  <div className="text-center">
                    <p className="font-display text-3xl font-semibold tnum">{guests}</p>
                    <p className="text-xs text-muted-foreground">{mode === "stay" ? "guests (max 6)" : "at the table (max 10)"}</p>
                  </div>
                  <Button variant="outline" size="icon" aria-label="More guests" onClick={() => setGuests(Math.min(mode === "stay" ? 6 : 10, guests + 1))}>
                    +
                  </Button>
                </div>
                {mode === "stay" && guests > 3 && (
                  <p className="rounded-xl border bg-ember-soft/50 p-3 text-sm dark:bg-ember-soft/25">
                    For {guests} guests, the Attic won’t fit — the Aspen Suite or a Grove Tent will.
                  </p>
                )}
                {mode === "table" && guests > 6 && (
                  <p className="rounded-xl border bg-ember-soft/50 p-3 text-sm dark:bg-ember-soft/25">
                    Parties above six sit at the dining room table — the counter is eighteen seats.
                  </p>
                )}
              </div>
            )}

            {/* STEP: room / time */}
            {step === 2 && mode === "stay" && (
              <div className="grid gap-3 sm:grid-cols-2">
                {ROOMS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRoom(r.id)}
                    className={cn(
                      "rounded-xl border p-4 text-left transition-all hover:shadow-md",
                      room === r.id && "border-ember ring-2 ring-ember/30",
                    )}
                    aria-pressed={room === r.id}
                  >
                    <p className="font-display text-base font-semibold">{r.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.bed} · {r.view}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-ember-deep dark:text-ember tnum">
                      {money(r.price)} <span className="text-xs font-normal text-muted-foreground">/ night</span>
                    </p>
                    {r.sleeps < guests && <p className="mt-1 text-xs text-destructive">Too small for {guests}</p>}
                  </button>
                ))}
              </div>
            )}
            {step === 2 && mode === "table" && (
              <div className="space-y-4">
                <RadioGroup value={tableTime} onValueChange={setTableTime} className="flex gap-3">
                  {TIMES.map((t) => (
                    <div key={t}>
                      <RadioGroupItem value={t} id={`t-${t}`} className="peer sr-only" />
                      <Label
                        htmlFor={`t-${t}`}
                        className="flex cursor-pointer items-center gap-2 rounded-xl border px-5 py-3 font-medium peer-data-[state=checked]:border-ember peer-data-[state=checked]:bg-ember-soft/60 dark:peer-data-[state=checked]:bg-ember-soft/30"
                      >
                        <UtensilsCrossed className="h-4 w-4" aria-hidden /> {t}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                <RadioGroup value={seating} onValueChange={(v) => setSeating(v as any)} className="grid gap-3 sm:grid-cols-2">
                  {[
                    { id: "counter", name: "Tasting counter", note: "18 seats · the kitchen in full view · the full Valley Reading" },
                    { id: "room", name: "Dining room", note: "candlelight, à la carte, a little quieter" },
                  ].map((s) => (
                    <div key={s.id}>
                      <RadioGroupItem value={s.id} id={`s-${s.id}`} className="peer sr-only" />
                      <Label
                        htmlFor={`s-${s.id}`}
                        className="flex cursor-pointer flex-col gap-1 rounded-xl border p-4 peer-data-[state=checked]:border-ember peer-data-[state=checked]:bg-ember-soft/60 dark:peer-data-[state=checked]:bg-ember-soft/30"
                      >
                        <span className="font-display text-base font-semibold">{s.name}</span>
                        <span className="text-xs font-normal text-muted-foreground">{s.note}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* STEP: extras (stay) */}
            {step === 3 && mode === "stay" && (
              <div className="space-y-3">
                {STAY_EXTRAS.map((e) => (
                  <label
                    key={e.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-colors hover:bg-muted/40",
                      extras[e.id] && "border-ember bg-ember-soft/50 dark:bg-ember-soft/25",
                    )}
                  >
                    <Checkbox
                      checked={!!extras[e.id]}
                      onCheckedChange={(v) => setExtras((x) => ({ ...x, [e.id]: !!v }))}
                      aria-label={e.label}
                    />
                    <span className="flex-1 text-sm">{e.label}</span>
                    <span className="tnum text-sm font-semibold">{money(e.price)}</span>
                  </label>
                ))}
              </div>
            )}

            {/* STEP: contact */}
            {((mode === "stay" && step === 4) || (mode === "table" && step === 3)) && (
              <form id="reserve-contact" onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
                <div>
                  <Label htmlFor="rc-name">Name</Label>
                  <Input id="rc-name" className="mt-1.5" aria-invalid={!!errors.name} {...register("name")} />
                  {errors.name && <p className="mt-1 text-xs text-destructive" role="alert">{errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="rc-email">Email</Label>
                  <Input id="rc-email" type="email" className="mt-1.5" aria-invalid={!!errors.email} {...register("email")} />
                  {errors.email && <p className="mt-1 text-xs text-destructive" role="alert">{errors.email.message}</p>}
                </div>
                <div>
                  <Label htmlFor="rc-phone">Phone</Label>
                  <Input id="rc-phone" type="tel" className="mt-1.5" aria-invalid={!!errors.phone} {...register("phone")} />
                  {errors.phone && <p className="mt-1 text-xs text-destructive" role="alert">{errors.phone.message}</p>}
                </div>
                <div>
                  <Label htmlFor="rc-notes">Notes (dietary, dogs, occasions)</Label>
                  <Input id="rc-notes" className="mt-1.5" {...register("notes")} />
                </div>
                <label className="flex cursor-pointer items-center gap-2.5 text-sm sm:col-span-2" htmlFor="rc-sms">
                  <Checkbox id="rc-sms" checked={sms} onCheckedChange={(v) => setSms(!!v)} /> Text me the day before (demo)
                </label>
                <div className="flex items-center justify-between gap-2 pt-2 sm:col-span-2">
                  <Button
                    variant="ghost"
                    onClick={() => setStep(step - 1)}
                    className="rounded-full"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden /> Back
                  </Button>
                  <Button type="submit" className="rounded-full bg-pine text-cream hover:bg-pine-deep dark:bg-ember dark:text-ink dark:hover:bg-ember-deep">
                    Confirm the book <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
                  </Button>
                </div>
              </form>
            )}

            {/* live pricing aside (stay) */}
            {mode === "stay" && pricing && step < 5 && (
              <aside className="rounded-xl border bg-muted/40 p-4 text-sm" aria-live="polite">
                <p className="overline text-muted-foreground">Running estimate</p>
                <dl className="mt-2 space-y-1">
                  <div className="flex justify-between"><dt>{roomObj.name} × {nights}</dt><dd className="tnum">{money(pricing.base)}</dd></div>
                  {pricing.extraLines.map((l) => (
                    <div key={l.label} className="flex justify-between text-muted-foreground"><dt>{l.label}</dt><dd className="tnum">{money(l.amount)}</dd></div>
                  ))}
                  {pricing.disc > 0 && (
                    <div className="flex justify-between text-pine dark:text-ember"><dt>Promo {promo?.code}</dt><dd className="tnum">−{money(pricing.disc)}</dd></div>
                  )}
                  <div className="flex justify-between text-muted-foreground"><dt>Valley tax 8%</dt><dd className="tnum">{money(pricing.tax)}</dd></div>
                  <div className="flex justify-between border-t pt-2 font-display text-base font-semibold"><dt>Total</dt><dd className="tnum">{money(pricing.total)}</dd></div>
                </dl>
              </aside>
            )}

            {/* nav */}
            {((mode === "stay" && step === 4) || (mode === "table" && step === 3)) ? null : (
            <div className="flex items-center justify-between gap-2 pt-1">
              <Button
                variant="ghost"
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
                className="rounded-full"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden /> Back
              </Button>
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canNext()}
                className="rounded-full bg-pine text-cream hover:bg-pine-deep dark:bg-ember dark:text-ink dark:hover:bg-ember-deep"
              >
                Continue <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
              </Button>
            </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Standalone trigger button (used by header/hero/rooms). */
export function ReserveButton({
  onOpen,
  mode = "stay",
  label = "Plan your stay",
  size = "default",
  variant = "default",
  className,
}: {
  onOpen: () => void;
  mode?: Mode;
  label?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
  className?: string;
}) {
  return (
    <Button
      onClick={onOpen}
      size={size}
      variant={variant}
      className={cn(
        "rounded-full",
        variant === "default" && "bg-pine text-cream hover:bg-pine-deep dark:bg-ember dark:text-ink dark:hover:bg-ember-deep",
        className,
      )}
      data-cursor="Book"
    >
      {mode === "stay" ? <BedDouble className="mr-2 h-4 w-4" aria-hidden /> : <Sparkles className="mr-2 h-4 w-4" aria-hidden />}
      {label}
      <ArrowRight className="ml-1.5 h-4 w-4 opacity-70" aria-hidden />
    </Button>
  );
}
