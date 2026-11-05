"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Croissant, Coffee as CoffeeIcon, Soup, Plus, Flame, Pizza as PizzaIcon, Minus, Stamp,
  Store, Truck, Repeat2, ShoppingBag, BadgePercent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ImageSlot } from "@/components/fx/Media";
import { Reveal, FadeSwap } from "@/components/fx/Reveal";
import { Counter, DemoBadge, LivePulse } from "@/components/fx/Atoms";
import { SectionHeading } from "@/components/fx/SectionHeading";
import {
  CAFE_ITEMS, CAFE_PRODUCTS, DELIVERY_ZONES, PIZZA_BASE, PIZZA_CHEESE, PIZZA_SIZES,
  PIZZA_SAUCE, SUBSCRIPTIONS, TOPPINGS,
} from "@/lib/site";
import { money } from "@/lib/format";
import { useCart } from "@/store/useCart";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CAT_ICON: Record<string, typeof Croissant> = {
  bakery: Croissant,
  coffee: CoffeeIcon,
  kitchen: Soup,
};

/**
 * CafeSection — Meadowlark & Ember.
 * OrderFlow (counter items) · Configurator (build-your-own pizza) ·
 * ProductGrid (retail) · SubscriptionSelector (beans) ·
 * LoyaltyPanel (stamps) · QueueStatus (live-ish kitchen).
 */
export function CafeSection() {
  const add = useCart((s) => s.add);
  const zone = useCart((s) => s.zone);
  const setZone = useCart((s) => s.setZone);
  const [cat, setCat] = useState("all");
  const items = CAFE_ITEMS.filter((i) => cat === "all" || i.cat === cat);
  const [cups, setCups] = useState(1487);
  const [queue, setQueue] = useState({ pies: 7, eta: 22 });

  // LivePulse counters — a little life
  useEffect(() => {
    const id = setInterval(() => {
      setCups((c) => c + Math.floor(Math.random() * 3));
      setQueue((q) => ({
        pies: Math.max(0, Math.min(14, q.pies + (Math.random() > 0.5 ? 1 : -1))),
        eta: Math.max(12, Math.min(34, q.eta + (Math.random() > 0.5 ? 1 : -1))),
      }));
    }, 4200);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="cafe" className="section" aria-label="Meadowlark & Ember — café">
      <div className="shell space-y-14">
        <SectionHeading
          kicker="Meadowlark & Ember · café"
          title={<>Buns at seven.<br />Pies from six.</>}
          lede="One counter with two personalities: the bakery that wakes the valley, and the wood-fired oven that closes it. Order ahead — pickup, or delivered to your pitch at The Grove."
        />

        {/* live strip: QueueStatus + cups counter */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Reveal>
            <div className="flex h-full items-center gap-4 rounded-2xl border bg-card p-5">
              <Flame className="h-8 w-8 text-ember" aria-hidden />
              <div>
                <LivePulse label="kitchen" />
                <p className="mt-1 text-sm font-medium">
                  {queue.pies} pies in the queue · ~{queue.eta} min
                </p>
                <p className="text-xs text-muted-foreground">Ember oven runs 18:00–21:00 <DemoBadge compact className="ml-1" /></p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <div className="flex h-full items-center gap-4 rounded-2xl border bg-card p-5">
              <CoffeeIcon className="h-8 w-8 text-ember" aria-hidden />
              <div>
                <p className="font-display text-2xl font-semibold tnum text-pine dark:text-ember">
                  <Counter value={cups} />
                </p>
                <p className="text-xs text-muted-foreground">
                  cups pulled today <DemoBadge compact className="ml-1" />
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="flex h-full flex-col justify-center gap-2 rounded-2xl border bg-card p-5">
              <p className="overline text-muted-foreground">Delivery zone</p>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Delivery zone">
                {DELIVERY_ZONES.map((z) => (
                  <button
                    key={z.id}
                    role="radio"
                    aria-checked={zone === z.id}
                    onClick={() => setZone(z.id)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                      zone === z.id ? "bg-pine text-cream dark:bg-ember dark:text-ink" : "border text-muted-foreground hover:border-ember/60",
                    )}
                  >
                    {z.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {DELIVERY_ZONES.find((z) => z.id === zone)?.km === 0
                  ? "Pay at the counter — no fee."
                  : `${DELIVERY_ZONES.find((z) => z.id === zone)?.fee ? money(DELIVERY_ZONES.find((z) => z.id === zone)?.fee ?? 0) : ""} fee · ${DELIVERY_ZONES.find((z) => z.id === zone)?.eta}`}
              </p>
            </div>
          </Reveal>
        </div>

        {/* OrderFlow — counter */}
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Reveal>
            <div className="rounded-2xl border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="overline text-muted-foreground">The counter — order ahead</p>
                <div className="flex gap-1.5" role="tablist" aria-label="Menu categories">
                  {["all", "bakery", "coffee", "kitchen"].map((c) => (
                    <button
                      key={c}
                      role="tab"
                      aria-selected={cat === c}
                      onClick={() => setCat(c)}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium capitalize",
                        cat === c ? "bg-pine text-cream dark:bg-ember dark:text-ink" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <FadeSwap id={cat} className="mt-4">
                <ul className="grid gap-2 sm:grid-cols-2">
                  {items.map((i) => {
                    const Icon = CAT_ICON[i.cat] ?? Soup;
                    return (
                      <li key={i.id}>
                        <button
                          onClick={() => {
                            add({ kind: "cafe", id: i.id, name: i.name, price: i.price, meta: i.desc });
                            toast(`${i.name} — in the bag`, { description: i.desc });
                          }}
                          className="group flex w-full items-center gap-3 rounded-xl border bg-background/60 p-3 text-left transition-all hover:border-ember/60 hover:shadow-md"
                          data-cursor="Add"
                          aria-label={`Add ${i.name} to bag`}
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ember-soft text-ember-deep transition-colors group-hover:bg-ember group-hover:text-cream dark:text-ember">
                            <Icon className="h-5 w-5" aria-hidden />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">{i.name}</span>
                            <span className="block truncate text-xs text-muted-foreground">{i.desc}</span>
                          </span>
                          <span className="tnum text-sm font-semibold">{money(i.price)}</span>
                          <Plus className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-ember" aria-hidden />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </FadeSwap>
              <p className="mt-4 text-xs text-muted-foreground">
                Baked 05:30, gone by two. Espresso is Vale Blend — 18 g in, 27 s out.
              </p>
            </div>
          </Reveal>

          {/* Pizza configurator */}
          <Reveal delay={0.08}>
            <PizzaConfigurator />
          </Reveal>
        </div>

        {/* ProductGrid (retail) + SubscriptionSelector + LoyaltyPanel */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <div className="rounded-2xl border bg-card p-5">
              <div className="flex items-baseline justify-between gap-3">
                <p className="overline text-muted-foreground">The camp store — retail</p>
                <a href="#camp" className="text-xs font-medium text-ember-deep hover:underline dark:text-ember">
                  also delivered to pitches <Store className="ml-1 inline h-3.5 w-3.5" aria-hidden />
                </a>
              </div>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {CAFE_PRODUCTS.map((p) => (
                  <li key={p.id}>
                    <article className="group flex h-full flex-col overflow-hidden rounded-xl border bg-background/60 transition-shadow hover:shadow-md">
                      <ImageSlot
                        src={p.img || "/img/beans-product.jpg"}
                        alt={p.name}
                        className="aspect-[5/4] w-full"
                        sizes="(max-width:768px) 45vw, 22vw"
                      />
                      <div className="flex flex-1 flex-col gap-1 p-3.5">
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.desc}</p>
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <span className="tnum text-sm font-semibold">{money(p.price)}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 rounded-full px-3"
                            onClick={() => {
                              add({ kind: "product", id: p.id, name: p.name, price: p.price, meta: p.desc });
                              toast(`${p.name} — in the bag`);
                            }}
                          >
                            <ShoppingBag className="mr-1 h-3.5 w-3.5" aria-hidden /> Add
                          </Button>
                        </div>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <div className="space-y-6">
            {/* SubscriptionSelector */}
            <Reveal delay={0.05}>
              <div className="rounded-2xl border bg-card p-5">
                <p className="overline text-muted-foreground">Beans, on repeat</p>
                <ul className="mt-4 space-y-2">
                  {SUBSCRIPTIONS.map((s, i) => (
                    <li key={s.id}>
                      <button
                        onClick={() => toast(`${s.label} — set`, { description: `${s.note}. Manage from the portal.` })}
                        className={cn(
                          "flex w-full items-center justify-between gap-3 rounded-xl border p-3.5 text-left transition-colors hover:border-ember/60",
                          i === 1 && "border-ember/60 bg-ember-soft/40 dark:bg-ember-soft/25",
                        )}
                      >
                        <span>
                          <span className="flex items-center gap-2 text-sm font-medium">
                            <Repeat2 className="h-4 w-4 text-ember-deep dark:text-ember" aria-hidden />
                            {s.label}
                          </span>
                          <span className="text-xs text-muted-foreground">{s.note}</span>
                        </span>
                        <span className="tnum text-sm font-semibold">{money(s.per)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {/* LoyaltyPanel */}
            <Reveal delay={0.1}>
              <div className="rounded-2xl border bg-card p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="overline text-muted-foreground">The stamp card</p>
                  <Badge variant="outline" className="rounded-full">6 / 10</Badge>
                </div>
                <div className="mt-4 flex gap-2" aria-label="6 of 10 stamps">
                  {Array.from({ length: 10 }, (_, i) => (
                    <span
                      key={i}
                      className={cn(
                        "flex h-8 flex-1 items-center justify-center rounded-full border text-xs",
                        i < 6 ? "border-ember bg-ember/15 text-ember-deep dark:text-ember" : "border-dashed text-muted-foreground",
                      )}
                    >
                      {i < 6 ? <Stamp className="h-3.5 w-3.5" aria-hidden /> : i === 9 ? "free" : ""}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Tenth coffee is on the house, then the card renews. Stamps live in the portal —
                  we never ask you to carry cardboard. <DemoBadge compact className="ml-1" />
                </p>
              </div>
            </Reveal>

            {/* WholesalePortal teaser */}
            <Reveal delay={0.15}>
              <button
                onClick={() => toast("Wholesale — the B2B door", { description: "Cafés and shops: 5kg minimums, Monday 08:00–10:00 pickup. This is the T4 B2B teaser." })}
                className="flex w-full items-center gap-4 rounded-2xl border border-dashed bg-background/50 p-5 text-left transition-colors hover:border-ember/60"
                data-cursor="B2B"
              >
                <Truck className="h-6 w-6 shrink-0 text-ember-deep dark:text-ember" aria-hidden />
                <span>
                  <span className="block text-sm font-semibold">Wholesale — trade &amp; offices</span>
                  <span className="text-xs text-muted-foreground">5 kg minimums · Monday pickup window · net-14 for the trade</span>
                </span>
              </button>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Configurator — build-your-own pizza with live price. */
function PizzaConfigurator() {
  const add = useCart((s) => s.add);
  const [size, setSize] = useState<string>(PIZZA_SIZES[1].id);
  const [sauce, setSauce] = useState<string>(PIZZA_SAUCE[0].id);
  const [cheese, setCheese] = useState<string>(PIZZA_CHEESE[0].id);
  const [tops, setTops] = useState<string[]>(["mush", "ruc"]);
  const [name, setName] = useState("");

  const price = useMemo(() => {
    const s = PIZZA_SIZES.find((x) => x.id === size)!;
    const sa = PIZZA_SAUCE.find((x) => x.id === sauce)!;
    const ch = PIZZA_CHEESE.find((x) => x.id === cheese)!;
    const topsTotal = TOPPINGS.filter((t) => tops.includes(t.id)).reduce((a, t) => a + t.price, 0);
    return PIZZA_BASE + s.delta + sa.delta + ch.delta + topsTotal;
  }, [size, sauce, cheese, tops]);

  const toggleTop = (id: string) =>
    setTops((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card">
      <div className="img-slot relative">
        <ImageSlot src="/img/oven-fire.jpg" alt="The Ember oven at full flame" className="aspect-[16/9] w-full" sizes="(max-width:1024px) 100vw, 45vw" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-4 pt-10 text-cream">
          <p className="overline text-[#e8c089]">Ember · build your own</p>
          <p className="font-display text-xl font-semibold">The configurator</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-5 p-5">
        <div>
          <p className="text-sm font-medium">Size</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {PIZZA_SIZES.map((s) => (
              <Chip key={s.id} on={size === s.id} onClick={() => setSize(s.id)}>{s.label}</Chip>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium">Sauce</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {PIZZA_SAUCE.map((s) => (
                <Chip key={s.id} on={sauce === s.id} onClick={() => setSauce(s.id)}>{s.label}</Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium">Cheese</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {PIZZA_CHEESE.map((c) => (
                <Chip key={c.id} on={cheese === c.id} onClick={() => setCheese(c.id)}>{c.label}</Chip>
              ))}
            </div>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium">Toppings</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {TOPPINGS.map((t) => (
              <Chip key={t.id} on={tops.includes(t.id)} onClick={() => toggleTop(t.id)}>
                {t.label} {t.price ? `+${money(t.price)}` : ""}
              </Chip>
            ))}
          </div>
        </div>
        <div className="mt-auto space-y-3 rounded-xl border bg-muted/40 p-4">
          <div className="flex items-baseline justify-between">
            <p className="text-sm text-muted-foreground">
              {PIZZA_SIZES.find((s) => s.id === size)?.label} · {tops.length} toppings
            </p>
            <p className="tnum font-display text-2xl font-semibold text-pine dark:text-ember">{money(price)}</p>
          </div>
          <div className="flex gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name this pie (optional)"
              className="h-10 flex-1"
              aria-label="Name this pie"
            />
            <Button
              className="h-10 rounded-full bg-ember px-5 text-ink hover:bg-gold"
              onClick={() => {
                const sizeLabel = PIZZA_SIZES.find((s) => s.id === size)?.label ?? "";
                const topLabels = TOPPINGS.filter((t) => tops.includes(t.id)).map((t) => t.label).join(", ") || "no toppings";
                add({
                  kind: "pizza",
                  id: `pizza-${Date.now()}`,
                  name: name || "Your build",
                  price,
                  meta: `${sizeLabel} · ${PIZZA_SAUCE.find((s) => s.id === sauce)?.label} · ${PIZZA_CHEESE.find((c) => c.id === cheese)?.label} · ${topLabels}`,
                });
                toast("Pie in the bag", { description: `${money(price)} — the oven will know it by name. ${name ? `“${name}”` : ""}` });
                setName("");
              }}
              data-cursor="Add"
            >
              <PizzaIcon className="mr-1.5 h-4 w-4" aria-hidden /> Add to bag
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Every build is priced live: base {money(PIZZA_BASE)} + size + sauce + cheese + toppings.
          </p>
        </div>
      </div>
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
        on ? "border-ember bg-ember/15 text-ember-deep dark:text-ember" : "border text-muted-foreground hover:border-ember/50",
      )}
    >
      {children}
    </button>
  );
}
