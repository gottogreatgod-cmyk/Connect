"use client";

import { useRef, useState } from "react";
import {
  Award, BadgeCheck, Clock, Download, Flame, Heart, MapPin, Mountain as MountainIcon, ShieldCheck,
  TriangleAlert, Umbrella, FileText, PenLine, Check, ArrowRight, Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ImageSlot, Rail } from "@/components/fx/Media";
import { Reveal, FadeSwap } from "@/components/fx/Reveal";
import { DemoBadge, LivePulse, VerifiedBadge } from "@/components/fx/Atoms";
import { SectionHeading } from "@/components/fx/SectionHeading";
import { EXPERIENCES, GUIDES, TRAIL_CONDITIONS, type Difficulty } from "@/lib/site";
import { money } from "@/lib/format";
import { buildPdf, downloadPdf, type LineSpec } from "@/lib/pdf";
import { useShortlist } from "@/store/useShortlist";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DIFF_LABEL: Record<Difficulty, string> = { 1: "Easy", 2: "Moderate", 3: "Hard" };

/**
 * AdventureSection — Trailhead.
 * ExperienceBooking cards · StatusPageEmbed (trail conditions) ·
 * TeamGrid (guides + CoachProfiles + CredentialWall) ·
 * GuaranteePanel · DownloadableAsset (gear list PDF, trail map SVG) ·
 * HorizontalGallery itinerary reel (StickySection).
 */
export function AdventureSection() {
  const [booking, setBooking] = useState<string | null>(null);
  const exp = EXPERIENCES.find((e) => e.id === booking) ?? null;
  const savedItems = useShortlist((s) => s.items);

  const gearPdf = () => {
    const lines: LineSpec[] = [
      { t: "note", text: "Printed from the page, packed from the shed. Demo list — the real one is laminated at the hut." },
      { t: "h", text: "On your body" },
      { t: "item", name: "Boots with ankle support", price: "—", note: "broken-in, not brand-new" },
      { t: "item", name: "Layer system (base + mid + shell)", price: "—", note: "the valley swings 12°C in a day" },
      { t: "item", name: "Sun hat + warm hat", price: "—", note: "both, honestly" },
      { t: "h", text: "In the pack" },
      { t: "item", name: "1.5 L water minimum", price: "—", note: "streams are drinkable above the moraine" },
      { t: "item", name: "Snacks, salty ones", price: "—", note: "the hut sells granola" },
      { t: "item", name: "Headlamp", price: "—", note: "for the cave on Via the Falls" },
      { t: "item", name: "Poles if you like them", price: "—", note: "we carry spares" },
      { t: "h", text: "We provide" },
      { t: "item", name: "Ropes, helmets, first aid", price: "included", note: "every guide carries WFR" },
      { t: "item", name: "Hot drink at the turn", price: "included", note: "the thermos is famous" },
      { t: "rule" },
      { t: "note", text: "Weather policy: rain we go, storms we don’t — free move to any date in season. Questions: the hut answers 06:30–19:00." },
    ];
    downloadPdf("kestrel-vale-gear-list.pdf", buildPdf("Trailhead — gear list", "What to bring on a guided day", lines));
    toast("Gear list PDF downloaded", { description: "A real PDF, generated in your browser." });
  };

  return (
    <section id="adventure" className="section" aria-label="Trailhead — adventures">
      <div className="shell space-y-14">
        <SectionHeading
          kicker="Trailhead · adventures"
          title={<>Guides who have read<br />this valley for years.</>}
          lede="Six routes, three difficulties, every guide carrying wilderness medicine. Book a place, sign the waiver on glass, meet at the hut."
          demo
        />

        {/* StatusPageEmbed — valley conditions */}
        <Reveal>
          <div className="grid gap-3 rounded-2xl border bg-card p-5 sm:grid-cols-2 lg:grid-cols-5">
            <div className="flex flex-col justify-center gap-1.5 sm:col-span-2 lg:col-span-1">
              <LivePulse label="conditions" />
              <p className="font-display text-lg font-semibold">Valley conditions</p>
              <p className="text-xs text-muted-foreground">the hut posts at 06:00 and 16:00</p>
            </div>
            {TRAIL_CONDITIONS.map((t) => (
              <div key={t.id} className="rounded-xl border bg-background/60 p-3.5">
                <p className="flex items-center justify-between gap-2 text-sm font-medium">
                  {t.name}
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                      t.status === "open" && "bg-pine/15 text-pine dark:text-ember",
                      t.status === "caution" && "bg-[#e8c089]/25 text-[#8a6b2a] dark:text-[#e8c089]",
                      t.status === "closed" && "bg-destructive/15 text-destructive",
                    )}
                  >
                    {t.status}
                  </span>
                </p>
                <p className="mt-1.5 text-xs text-muted-foreground">{t.note}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ExperienceBooking grid */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {EXPERIENCES.map((e, i) => (
            <Reveal key={e.id} delay={i * 0.05} className="h-full">
              <ExperienceCard exp={e} onBook={() => setBooking(e.id)} />
            </Reveal>
          ))}
        </div>

        {/* Guides: TeamGrid + CoachProfiles + CredentialWall */}
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <div className="overflow-hidden rounded-2xl border">
              <ImageSlot src="/img/guides.jpg" alt="The Trailhead guides resting on the ledge" className="aspect-[4/3] w-full" sizes="(max-width:1024px) 100vw, 40vw" />
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="rounded-2xl border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-display text-xl font-semibold">The guides</h3>
                <div className="flex flex-wrap gap-1.5">
                  <VerifiedBadge label="WFR all guides" />
                  <VerifiedBadge label="Insured to the ridge" />
                </div>
              </div>
              <ul className="mt-4 space-y-3">
                {GUIDES.map((g) => (
                  <li key={g.name} className="flex items-center gap-3.5 rounded-xl border bg-background/60 p-3.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ember-soft font-display text-base font-semibold text-ember-deep dark:text-ember">
                      {g.name.split(" ").map((w) => w[0]).join("")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {g.name} <span className="font-normal text-muted-foreground">· {g.role}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{g.note}</p>
                    </div>
                    <p className="tnum text-xs text-muted-foreground">{g.years} yrs</p>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                Every guide re-certifies every three years. The map in your pocket was drawn by two of them.
                <DemoBadge compact className="ml-1" />
              </p>
            </div>
          </Reveal>
        </div>

        {/* GuaranteePanel + DownloadableAsset */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Reveal>
            <div className="flex h-full flex-col gap-3 rounded-2xl border bg-card p-5">
              <Umbrella className="h-6 w-6 text-ember-deep dark:text-ember" aria-hidden />
              <h3 className="font-display text-lg font-semibold">The weather guarantee</h3>
              <p className="text-sm text-muted-foreground">
                Rain, we go — it’s the valley. Storms, we don’t. Either way: move your booking to any
                date in season, free, no conversation required. The lake calls off canoe for lightning only.
              </p>
              <p className="mt-auto text-xs text-muted-foreground">This panel is policy, not marketing. It’s in every confirmation.</p>
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <div className="flex h-full flex-col gap-3 rounded-2xl border bg-card p-5">
              <Download className="h-6 w-6 text-ember-deep dark:text-ember" aria-hidden />
              <h3 className="font-display text-lg font-semibold">Take the paper</h3>
              <ul className="mt-1 space-y-2 text-sm">
                <li>
                  <button onClick={gearPdf} className="font-medium text-foreground underline decoration-ember/50 underline-offset-4 hover:decoration-ember">
                    Gear list (PDF)
                  </button>{" "}
                  <span className="text-muted-foreground">— generated live</span>
                </li>
                <li>
                  <button
                    onClick={() => toast("Trail map — SVG edition", { description: "Surveyed 2024. Water-resistant at the hut." })}
                    className="font-medium text-foreground underline decoration-ember/50 underline-offset-4 hover:decoration-ember"
                  >
                    Trail map (A2)
                  </button>{" "}
                  <span className="text-muted-foreground">— 41 km, 6 routes</span>
                </li>
                <li>
                  <a href="#camp" className="font-medium text-foreground underline decoration-ember/50 underline-offset-4 hover:decoration-ember">
                    The Grove camp book
                  </a>{" "}
                  <span className="text-muted-foreground">— rules &amp; quiet hours</span>
                </li>
              </ul>
              <p className="mt-auto text-xs text-muted-foreground">Everything downloadable from this page is generated or drawn by it.</p>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="flex h-full flex-col gap-3 rounded-2xl border bg-card p-5">
              <Radio className="h-6 w-6 text-ember-deep dark:text-ember" aria-hidden />
              <h3 className="font-display text-lg font-semibold">Alpine start, 04:45</h3>
              <p className="text-sm text-muted-foreground">
                Kestrel Peak by 09:00, roped on the headwall, breakfast on the summit plateau. The
                hardest book on this page and the one people write about.
              </p>
              <Button
                variant="outline"
                className="mt-auto rounded-full"
                onClick={() => {
                  const alpine = EXPERIENCES.find((e) => e.id === "summit");
                  if (alpine) toast(`${alpine.name} — ${money(alpine.price)}`, { description: alpine.fitness });
                }}
              >
                See the start <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
              </Button>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Itinerary reel — HorizontalGallery (snap rail, wide cards) */}
      <div className="mt-14 border-y bg-muted/30 py-10">
        <div className="shell">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-display text-2xl font-semibold">Sample days, hour by hour</h3>
            <p className="hidden text-sm text-muted-foreground sm:block">drag or scroll the reel →</p>
          </div>
        </div>
        <div className="shell">
          <Rail className="mt-5">
            {[
              { h: "05:45", t: "Dawn canoe", d: "Coffee from a thermos, herons working the reeds. Back by 08:00 for buns.", img: "/img/lake-canoe.jpg" },
              { h: "06:30", t: "Ridge Traverse", d: "The full spine, hands on granite, three cols, rope-assisted descent.", img: "/img/trail-ridge.jpg" },
              { h: "10:00", t: "Forage & Fire", d: "Walk the moraine with a chef, cook what the season offers over river stone.", img: "/img/vineyard.jpg" },
              { h: "12:30", t: "Slow lunch", d: "Shoulder of lamb, flatbreads, herbs. The dining room at its calmest.", img: "/img/dining-hall.jpg" },
              { h: "16:00", t: "Sauna & plunge", d: "Book a slot at the hut. The cold bath is river-fed.", img: "/img/camp-night.jpg" },
              { h: "18:00", t: "Ember pies", d: "Wood-fired, 22 minutes, delivered to pitches at The Grove.", img: "/img/oven-fire.jpg" },
              { h: "22:30", t: "Quiet hours", d: "The valley amplifies everything. Step out — the whole sky is on.", img: "/img/hero-valley.jpg" },
            ].map((slot, i) => (
              <article
                key={slot.h}
                className="flex w-[78vw] shrink-0 snap-start overflow-hidden rounded-2xl border bg-card sm:w-[420px]"
                aria-label={`${slot.h} — ${slot.t}`}
              >
                <div className="w-20 shrink-0 border-r bg-ember-soft/60 p-3 text-center dark:bg-ember-soft/30">
                  <p className="tnum font-display text-sm font-semibold text-ember-deep dark:text-ember">{slot.h}</p>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">day {Math.floor(i / 3) + 1}</p>
                </div>
                <div className="min-w-0 p-4">
                  <p className="font-display text-lg font-semibold">{slot.t}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{slot.d}</p>
                </div>
              </article>
            ))}
          </Rail>
        </div>
      </div>

      {/* ExperienceFlow dialog */}
      {exp && <ExperienceFlow exp={exp} onClose={() => setBooking(null)} />}
    </section>
  );
}

function ExperienceCard({
  exp,
  onBook,
}: {
  exp: (typeof EXPERIENCES)[number];
  onBook: () => void;
}) {
  const saved = useShortlist((s) => s.has(exp.id));
  const toggle = useShortlist((s) => s.toggle);
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-xl">
      <div className="relative">
        <ImageSlot src={exp.img} alt={exp.name} className="aspect-[16/10] w-full" sizes="(max-width:768px) 100vw, 33vw" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink/55 to-transparent" aria-hidden />
        <div className="absolute inset-x-3 bottom-2 flex items-center justify-between text-cream">
          <p className="flex items-center gap-1.5 text-[11px] font-medium">
            <Clock className="h-3.5 w-3.5" aria-hidden /> {exp.hours}h · {exp.season}
          </p>
          <p className="tnum rounded-full bg-ink/55 px-2.5 py-1 text-xs font-semibold backdrop-blur">
            {money(exp.price)} <span className="font-normal opacity-80">/ person</span>
          </p>
        </div>
        <button
          onClick={() => {
            const now = toggle({ id: exp.id, kind: "experience", name: exp.name, price: exp.price, unit: "person" });
            toast(now ? `${exp.name} — saved` : `${exp.name} — removed`);
          }}
          aria-label={saved ? `Remove ${exp.name}` : `Save ${exp.name}`}
          aria-pressed={saved}
          className={cn(
            "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur",
            saved ? "bg-ember text-cream" : "bg-ink/45 text-cream hover:bg-ink/70",
          )}
        >
          <Heart className={cn("h-4 w-4", saved && "fill-current")} aria-hidden />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-xl font-semibold">{exp.name}</h3>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
              exp.difficulty === 3 && "bg-destructive/10 text-destructive",
              exp.difficulty === 2 && "bg-[#e8c089]/25 text-[#8a6b2a] dark:text-[#e8c089]",
              exp.difficulty === 1 && "bg-pine/10 text-pine dark:text-ember",
            )}
          >
            {DIFF_LABEL[exp.difficulty]}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{exp.desc}</p>
        <p className="text-xs text-muted-foreground">
          <MapPin className="mr-1 inline h-3 w-3" aria-hidden /> {exp.meet} · guide {exp.guide}
        </p>
        <div className="mt-auto flex items-center gap-2 pt-1">
          <span className="text-xs text-muted-foreground">Fitness: {exp.fitness}</span>
        </div>
        <Button
          className="rounded-full bg-pine text-cream hover:bg-pine-deep dark:bg-ember dark:text-ink dark:hover:bg-ember-deep"
          onClick={onBook}
          data-cursor="Book"
        >
          Book a place
        </Button>
      </div>
    </article>
  );
}

/**
 * ExperienceFlow — steps: slot → intake(fitness) → insurance → waiver(canvas signature) → confirm.
 * Ships MultiStepIntake, InsuranceChecker, SignaturePad.
 */
function ExperienceFlow({ exp, onClose }: { exp: (typeof EXPERIENCES)[number]; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [slot, setSlot] = useState(exp.slots[0]);
  const [people, setPeople] = useState(2);
  const [fitness, setFitness] = useState<string[]>([]);
  const [insurance, setInsurance] = useState<"yes" | "no" | null>(null);
  const [signed, setSigned] = useState(false);
  const sigRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const steps = ["Slot", "Readiness", "Insurance", "Waiver", "Done"];
  const total = exp.price * people;

  // SignaturePad canvas
  const drawOn = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !sigRef.current) return;
    const ctx = sigRef.current.getContext("2d");
    if (!ctx) return;
    const r = sigRef.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * sigRef.current.width;
    const y = ((e.clientY - r.top) / r.height) * sigRef.current.height;
    ctx.lineTo(x, y);
    ctx.stroke();
    setSigned(true);
  };
  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    const ctx = sigRef.current?.getContext("2d");
    if (!ctx || !sigRef.current) return;
    const r = sigRef.current.getBoundingClientRect();
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1f3d33";
    ctx.beginPath();
    ctx.moveTo(((e.clientX - r.left) / r.width) * sigRef.current.width, ((e.clientY - r.top) / r.height) * sigRef.current.height);
  };
  const clearSig = () => {
    const ctx = sigRef.current?.getContext("2d");
    if (ctx && sigRef.current) ctx.clearRect(0, 0, sigRef.current.width, sigRef.current.height);
    setSigned(false);
  };

  const fitnessOk = fitness.length >= 2;

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="scroll-slim max-h-[92vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {exp.name} — {money(exp.price)}/person
          </DialogTitle>
        </DialogHeader>
        <Progress value={((step + 1) / steps.length) * 100} className="h-1" aria-label={`Step ${step + 1} of ${steps.length}`} />
        <p className="overline text-muted-foreground">
          Step {step + 1}/{steps.length} · {steps[step]}
        </p>

        {step === 0 && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {exp.slots.map((s) => (
                <button
                  key={s}
                  onClick={() => setSlot(s)}
                  aria-pressed={slot === s}
                  className={cn("rounded-full px-4 py-2 text-sm font-medium", slot === s ? "bg-pine text-cream dark:bg-ember dark:text-ink" : "border text-muted-foreground hover:border-ember/60")}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 rounded-xl border bg-muted/40 p-5">
              <Button variant="outline" size="icon" aria-label="Fewer places" onClick={() => setPeople(Math.max(1, people - 1))}>–</Button>
              <p className="text-center">
                <span className="tnum font-display text-2xl font-semibold">{people}</span>
                <span className="block text-xs text-muted-foreground">places · {money(total)} total</span>
              </p>
              <Button variant="outline" size="icon" aria-label="More places" onClick={() => setPeople(Math.min(8, people + 1))}>+</Button>
            </div>
            <p className="text-xs text-muted-foreground">Meet at {exp.meet}. Fitness: {exp.fitness}</p>
          </div>
        )}

        {step === 1 && (
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Self-assessment — tick what’s true (MultiStepIntake)</legend>
            {[
              "I can walk 3 hours with breaks",
              "I’m comfortable on exposed ground" ,
              "No heart, knee or ankle issues today",
              "I’ll tell the guide if that changes",
            ].map((f) => (
              <label key={f} className="flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 hover:bg-muted/40">
                <Checkbox
                  checked={fitness.includes(f)}
                  onCheckedChange={(v) => setFitness((x) => (v ? [...x, f] : x.filter((y) => y !== f)))}
                />
                <span className="text-sm">{f}</span>
              </label>
            ))}
            <p className={cn("text-xs", fitnessOk ? "text-pine dark:text-ember" : "text-muted-foreground")}>
              {fitnessOk ? "That’s what we need — guides take it from here." : "Tick at least two, and mean them."}
            </p>
          </fieldset>
        )}

        {step === 2 && (
          <fieldset className="space-y-4">
            <legend className="text-sm font-medium">InsuranceChecker — do you carry travel insurance?</legend>
            {(
              [
                { id: "yes", label: "Yes — it covers guided mountain days", note: "standard on most policies" },
                { id: "no", label: "No / not sure", note: "we’ll send a 1-page explainer before you arrive — no judgment" },
              ] as const
            ).map((o) => (
              <label
                key={o.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-4",
                  insurance === o.id && "border-ember bg-ember-soft/50 dark:bg-ember-soft/25",
                )}
              >
                <Checkbox checked={insurance === o.id} onCheckedChange={() => setInsurance(o.id)} />
                <span>
                  <span className="block text-sm font-medium">{o.label}</span>
                  <span className="text-xs text-muted-foreground">{o.note}</span>
                </span>
              </label>
            ))}
            <p className="flex items-start gap-2 rounded-xl border bg-muted/40 p-3 text-xs text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              The guide carries the rope, the radio and the wilderness medicine. Insurance is for the
              drive here, mostly.
            </p>
          </fieldset>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-xl border bg-muted/40 p-4 text-sm">
              <p className="font-medium">The waiver, in plain words</p>
              <p className="mt-1 text-muted-foreground">
                Mountains are mountains. I confirm the self-assessment above is honest, I’ll follow
                the guide, and I accept the ordinary risks of a guided day. Demo signature — nothing
                is stored.
              </p>
            </div>
            <div className="rounded-xl border p-3">
              <canvas
                ref={sigRef}
                width={480}
                height={150}
                className="signature-pad h-[150px] w-full rounded-lg bg-[repeating-linear-gradient(0deg,transparent,transparent_39px,var(--border)_39px,var(--border)_40px)]"
                onPointerDown={startDraw}
                onPointerMove={drawOn}
                onPointerUp={() => (drawing.current = false)}
                onPointerLeave={() => (drawing.current = false)}
                role="img"
                aria-label="Signature area — draw your signature"
              />
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {signed ? "Signed — that’s binding in spirit." : "Sign on the glass (draw with mouse or finger)"}
                </p>
                <Button variant="ghost" size="sm" className="h-7 rounded-full" onClick={clearSig}>
                  Clear
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="rounded-xl border bg-ember-soft/60 p-4 dark:bg-ember-soft/30">
              <p className="flex items-center gap-2 font-display text-lg font-semibold">
                <Check className="h-5 w-5 text-pine dark:text-ember" aria-hidden /> {exp.name} is in the book
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {slot} · {people} {people === 1 ? "place" : "places"} · {money(total)} · meet {exp.meet}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Weather guarantee applies automatically. A demo email would confirm; none will send.
              </p>
            </div>
            <Button className="w-full rounded-full bg-pine text-cream hover:bg-pine-deep dark:bg-ember dark:text-ink dark:hover:bg-ember-deep" onClick={onClose}>
              Done
            </Button>
          </div>
        )}

        {step < 4 && (
          <div className="flex justify-between pt-1">
            <Button variant="ghost" className="rounded-full" disabled={step === 0} onClick={() => setStep(step - 1)}>
              Back
            </Button>
            <Button
              className="rounded-full bg-pine text-cream hover:bg-pine-deep dark:bg-ember dark:text-ink dark:hover:bg-ember-deep"
              disabled={(step === 1 && !fitnessOk) || (step === 2 && insurance === null) || (step === 3 && !signed)}
              onClick={() => setStep(step + 1)}
            >
              Continue <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
