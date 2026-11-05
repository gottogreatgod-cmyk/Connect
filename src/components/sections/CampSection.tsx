"use client";

import { useMemo, useState } from "react";
import {
  Baby, Bath as BathIcon, Dog, Flame, MoonStar, ShoppingBasket, Sparkles, WashingMachine, TreePine,
  Waves, Check, Info, Repeat2, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { ImageSlot } from "@/components/fx/Media";
import { Reveal, FadeSwap } from "@/components/fx/Reveal";
import { DemoBadge, LivePulse } from "@/components/fx/Atoms";
import { SectionHeading } from "@/components/fx/SectionHeading";
import { CAMP_AMENITIES, CAMP_RULES, CAMP_SITES, DELIVERY_ZONES } from "@/lib/site";
import { money, nightsBetween, fmtRange, addDays } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const AMENITY_ICON: Record<string, React.ElementType> = {
  shower: BathIcon,
  sauna: Waves,
  store: ShoppingBasket,
  laundry: WashingMachine,
  fire: Flame,
  dog: Dog,
};

/**
 * CampSection — The Grove.
 * MapSearch (interactive SVG site picker) · ResourceBooking (dates, extras,
 * RecurringBooking seasonal toggle) · AmenityGrid · HousePolicyPanel.
 */
export function CampSection() {
  const [selected, setSelected] = useState<string | null>("B2");
  const [from, setFrom] = useState<Date | undefined>(addDays(new Date(), 14));
  const [to, setTo] = useState<Date | undefined>(addDays(new Date(), 17));
  const [extras, setExtras] = useState<Record<string, boolean>>({ firewood: true, sauna: false, delivery: false });
  const [seasonal, setSeasonal] = useState(false);
  const site = CAMP_SITES.find((s) => s.id === selected) ?? null;

  const nights = from && to ? Math.max(1, nightsBetween(from, to)) : 0;
  const pricing = useMemo(() => {
    if (!site || !nights) return null;
    const n = seasonal ? Math.max(nights, 14) : nights;
    const base = site.price * n;
    const lines = [
      { label: `${site.zone} ${site.id} × ${n} night${n === 1 ? "" : "s"}`, amount: base },
      extras.firewood && { label: "Fire bundle nightly", amount: 9 * n },
      extras.sauna && { label: "Sauna & plunge (per guest slot)", amount: 22 },
      extras.delivery && { label: "Camp-store delivery to pitch", amount: 6 },
    ].filter(Boolean) as { label: string; amount: number }[];
    const sub = lines.reduce((a, l) => a + l.amount, 0);
    const tax = Math.round(sub * 0.08 * 100) / 100;
    return { lines, sub, tax, total: Math.round((sub + tax) * 100) / 100, n };
  }, [site, nights, extras, seasonal]);

  return (
    <section id="camp" className="section bg-muted/30" aria-label="The Grove — camp">
      <div className="shell space-y-14">
        <SectionHeading
          kicker="The Grove · camp"
          title={<>Eleven pitches, one river,<br />the whole sky.</>}
          lede="Meadow, riverside and forest loops — plus two pre-pitched canvas tents with stoves. Pick your pitch from the map; firewood rides out at six."
          demo
        />

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          {/* MapSearch — interactive SVG */}
          <Reveal>
            <div className="overflow-hidden rounded-2xl border bg-card">
              <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                <p className="overline text-muted-foreground">Pick a pitch — live map</p>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground" aria-hidden>
                  <span className="flex h-2.5 w-2.5 rounded-sm bg-pine" /> pitch
                  <span className="ml-2 flex h-2.5 w-2.5 rounded-sm bg-ember" /> canvas
                  <span className="ml-2 flex h-2.5 w-2.5 rounded-sm bg-ember/40" /> selected
                </div>
              </div>
              <CampMap selected={selected} onSelect={setSelected} />
              <p className="border-t px-4 py-3 text-xs text-muted-foreground">
                Zones: meadow (A1–A4, no hookups) · riverside (B1–B3, water) · forest (C1–C2,
                electric + water) · canvas (T1–T2, stove + lantern). The river runs bottom-left to
                top-right; the sauna block sits by the forest loop.
              </p>
            </div>
          </Reveal>

          {/* ResourceBooking */}
          <div className="space-y-5">
            <FadeSwap id={`${selected}-${nights}-${seasonal}`}>
              {site && pricing ? (
                <div className="rounded-2xl border bg-card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="overline text-muted-foreground">Your pitch</p>
                      <h3 className="font-display text-xl font-semibold">
                        {site.id} — {site.zone}
                      </h3>
                      <p className="text-xs text-muted-foreground">{site.note}</p>
                    </div>
                    <p className="tnum text-right">
                      <span className="font-display text-2xl font-semibold text-pine dark:text-ember">{money(site.price)}</span>
                      <span className="block text-[11px] text-muted-foreground">/ night · sleeps {site.sleeps}</span>
                    </p>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-[auto_1fr]">
                    <div>
                      <Calendar
                        mode="range"
                        selected={{ from, to }}
                        onSelect={(v: any) => {
                          setFrom(v?.from);
                          setTo(v?.to);
                        }}
                        disabled={{ before: new Date() }}
                        className="rounded-xl border p-3"
                      />
                    </div>
                    <div className="space-y-3">
                      <p className="flex items-center gap-2 text-sm font-medium">
                        {from && to ? `${fmtRange(from, to)} · ${nights} nights` : "Pick dates — the map holds your pitch"}
                      </p>
                      <div className="space-y-2">
                        {[
                          { id: "firewood", label: "Fire bundle nightly ($9)", price: 9 },
                          { id: "sauna", label: "Sauna & plunge ($22)", price: 22 },
                          { id: "delivery", label: "Store delivery to pitch ($6)", price: 6 },
                        ].map((x) => (
                          <label
                            key={x.id}
                            className={cn(
                              "flex cursor-pointer items-center gap-2.5 rounded-xl border p-3 text-sm",
                              extras[x.id] && "border-ember bg-ember-soft/40 dark:bg-ember-soft/20",
                            )}
                          >
                            <Checkbox checked={!!extras[x.id]} onCheckedChange={(v) => setExtras((e) => ({ ...e, [x.id]: !!v }))} aria-label={x.label} />
                            {x.label}
                          </label>
                        ))}
                      </div>
                      <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-dashed p-3 text-sm">
                        <Checkbox checked={seasonal} onCheckedChange={(v) => setSeasonal(!!v)} aria-label="Seasonal pitch (recurring)" />
                        <span>
                          Seasonal pitch (RecurringBooking)
                          <span className="block text-xs text-muted-foreground">14+ nights, the same spot all season — rate unchanged</span>
                        </span>
                      </label>
                    </div>
                  </div>

                  <dl className="mt-4 space-y-1.5 border-t pt-4 text-sm" aria-live="polite">
                    {pricing.lines.map((l) => (
                      <div key={l.label} className="flex justify-between text-muted-foreground">
                        <dt>{l.label}</dt>
                        <dd className="tnum">{money(l.amount)}</dd>
                      </div>
                    ))}
                    <div className="flex justify-between text-muted-foreground">
                      <dt>Valley tax 8%</dt>
                      <dd className="tnum">{money(pricing.tax)}</dd>
                    </div>
                    <div className="flex justify-between font-display text-lg font-semibold">
                      <dt>Total</dt>
                      <dd className="tnum">{money(pricing.total)}</dd>
                    </div>
                  </dl>

                  <Button
                    className="mt-4 w-full rounded-full bg-pine text-cream hover:bg-pine-deep dark:bg-ember dark:text-ink dark:hover:bg-ember-deep"
                    onClick={() => toast("Pitch held (demo)", { description: `${site.id} · ${pricing.n} nights · ${money(pricing.total)}. A host confirms within the hour.` })}
                    data-cursor="Hold"
                  >
                    Hold this pitch <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
                  </Button>
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  Pick a pitch on the map to book it.
                </p>
              )}
            </FadeSwap>

            {/* AmenityGrid */}
            <Reveal delay={0.05}>
              <div className="rounded-2xl border bg-card p-5">
                <p className="overline text-muted-foreground">The amenities</p>
                <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {CAMP_AMENITIES.map((a) => {
                    const Icon = AMENITY_ICON[a.icon] ?? Flame;
                    return (
                      <li key={a.name} className="rounded-xl border bg-background/60 p-3">
                        <Icon className="h-5 w-5 text-ember-deep dark:text-ember" aria-hidden />
                        <p className="mt-2 text-sm font-medium">{a.name}</p>
                        <p className="text-xs text-muted-foreground">{a.note}</p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Reveal>

            {/* HousePolicyPanel */}
            <Reveal delay={0.1}>
              <div className="rounded-2xl border bg-card p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="overline text-muted-foreground">House rules</p>
                  <LivePulse label="posted at the hut" />
                </div>
                <ul className="mt-4 space-y-3">
                  {CAMP_RULES.map((r) => (
                    <li key={r.rule} className="text-sm">
                      <p className="font-medium">{r.rule}</p>
                      <p className="text-muted-foreground">{r.detail}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>

        {/* night image + quiet hour note */}
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border">
            <ImageSlot src="/img/camp-night.jpg" alt="The Grove at night — canvas tents, string lights, the milky way" className="aspect-[21/9] w-full" sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" aria-hidden />
            <div className="absolute inset-x-0 bottom-0 p-6 text-cream sm:p-8">
              <p className="overline text-[#e8c089]">22:30 — quiet hours</p>
              <p className="mt-2 max-w-xl font-display text-2xl leading-snug">
                The valley amplifies everything. Step out of the tent — the whole sky is on.
              </p>
              <p className="mt-2 max-w-xl text-sm text-cream/80">
                Dark-sky commended 2024: no site lighting after 22:30, red filters on headlamps, and
                the milky way does the rest. <DemoBadge compact className="ml-1" />
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** Interactive campground SVG map — the MapSearch module. */
function CampMap({ selected, onSelect }: { selected: string | null; onSelect: (id: string) => void }) {
  return (
    <div className="img-slot relative aspect-[16/11] w-full bg-[#e9e4d8] dark:bg-[#1c2a24]" role="img" aria-label="Campground map: meadow, river, forest loops and canvas pitches">
      <svg viewBox="0 0 100 70" className="absolute inset-0 h-full w-full" aria-hidden>
        {/* river */}
        <path d="M0 50 C 20 46, 26 58, 44 60 S 70 66, 84 64 L 100 68" fill="none" stroke="#7da393" strokeOpacity="0.7" strokeWidth="3.2" />
        {/* forest blobs */}
        <circle cx="70" cy="50" r="12" fill="#9db7a4" fillOpacity="0.5" />
        <circle cx="79" cy="42" r="8" fill="#9db7a4" fillOpacity="0.45" />
        {/* meadow */}
        <rect x="18" y="12" width="58" height="22" rx="6" fill="#c8c39a" fillOpacity="0.5" />
        {/* road */}
        <path d="M8 6 L 90 6" stroke="#c9bfa8" strokeWidth="2.4" strokeDasharray="6 3" />
        {/* sauna block */}
        <rect x="62" y="52" width="10" height="8" rx="2" fill="#b98b5e" fillOpacity="0.85" />
        {/* shower block */}
        <rect x="10" y="28" width="8" height="6" rx="2" fill="#b98b5e" fillOpacity="0.85" />
        {/* store */}
        <rect x="44" y="30" width="9" height="7" rx="2" fill="#b98b5e" fillOpacity="0.85" />
        {/* river labels */}
        <text x="6" y="49" fontSize="3" fill="#2f4a3e" className="dark:[fill:#c8d4cd]">river</text>
        <text x="20" y="8" fontSize="3" fill="#6b6353" className="dark:[fill:#b9b1a2]">pass road</text>
        <text x="66" y="70" fontSize="3" fill="#2f4a3e" className="dark:[fill:#c8d4cd]">sauna</text>
        <text x="10" y="27" fontSize="3" fill="#6b6353" className="dark:[fill:#b9b1a2]">showers</text>
        <text x="45" y="29" fontSize="3" fill="#6b6353" className="dark:[fill:#b9b1a2]">store</text>
        {/* sites */}
        {CAMP_SITES.map((s) => {
          const isSel = selected === s.id;
          const isCanvas = s.kind === "Pre-pitched tent";
          return (
            <g key={s.id} transform={`translate(${s.x} ${s.y})`} className="cursor-pointer" onClick={() => onSelect(s.id)} role="button" aria-label={`Select pitch ${s.id}`}>
              <rect
                x={-4}
                y={-3.4}
                width={9}
                height={7}
                rx={1.6}
                fill={isSel ? "#c08555" : isCanvas ? "#c08555" : "#1f3d33"}
                fillOpacity={isSel ? 1 : isCanvas ? 0.85 : 0.75}
                stroke={isSel ? "#7a4e22" : "none"}
                strokeWidth={isSel ? 0.8 : 0}
              />
              <text x={0.5} y={0.9} fontSize="3.4" fontWeight="700" fill={isSel ? "#fff7e8" : "#e9e4d8"} textAnchor="middle">
                {s.id}
              </text>
              {isSel && (
                <rect x={-5.4} y={-4.8} width="11.8" height="9.8" rx={2.4} fill="none" stroke="#c08555" strokeWidth={0.7} strokeDasharray="2 1.4" className="animate-pulse" />
              )}
            </g>
          );
        })}
        {/* compass */}
        <g transform="translate(92 10)">
          <circle r="5" fill="#fff" fillOpacity="0.7" />
          <path d="M0 -3.4 L1.6 2 L0 0.6 L-1.6 2 Z" fill="#1f3d33" className="dark:[fill:#c8d4cd]" />
          <text y="4.6" fontSize="2.8" textAnchor="middle" fill="#1f3d33" className="dark:[fill:#c8d4cd]">N</text>
        </g>
      </svg>
    </div>
  );
}
