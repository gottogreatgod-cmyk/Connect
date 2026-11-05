"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BadgePercent, Check, ChevronRight, Flame, Minus, Plus, ShoppingBag, Ticket, Truck, X, Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DELIVERY_ZONES, PROMOS } from "@/lib/site";
import { money } from "@/lib/format";
import { cartCount, useCart } from "@/store/useCart";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * CartSheet + CheckoutForm + OrderTracking.
 * The commerce spine for the café: live math (subtotal, promo, delivery,
 * tax), validated checkout, then a tracking view that advances itself.
 */
export function CartSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const promo = useCart((s) => s.promo);
  const applyPromo = useCart((s) => s.applyPromo);
  const clearPromo = useCart((s) => s.clearPromo);
  const zone = useCart((s) => s.zone);
  const setZone = useCart((s) => s.setZone);
  const subtotal = useCart((s) => s.subtotal()) ?? 0;
  const discount = useCart((s) => s.discount()) ?? 0;
  const deliveryFee = useCart((s) => s.deliveryFee()) ?? 0;
  const taxes = useCart((s) => s.taxes()) ?? 0;
  const total = useCart((s) => s.total()) ?? 0;
  const completeOrder = useCart((s) => s.completeOrder);

  const [promoInput, setPromoInput] = useState("");
  const [stage, setStage] = useState<"cart" | "checkout" | "done">("cart");
  const [order, setOrder] = useState<{ id: string; step: number } | null>(null);
  const [tip, setTip] = useState(0.1);

  // OrderTracking — self-advancing stages
  useEffect(() => {
    if (!order) return;
    if (order.step >= 4) return;
    const id = setTimeout(() => setOrder((o) => (o ? { ...o, step: o.step + 1 } : o)), 3600);
    return () => clearTimeout(id);
  }, [order]);

  const zoneObj = DELIVERY_ZONES.find((z) => z.id === zone) ?? DELIVERY_ZONES[0];
  const tipAmount = stage === "done" ? 0 : Math.round(total * tip * 100) / 100;

  return (
    <Sheet open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setTimeout(() => { setStage("cart"); setOrder(null); }, 400); }}>
      <SheetContent className="scroll-slim flex w-full flex-col gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <ShoppingBag className="h-5 w-5" aria-hidden />
            The bag
            {items.length > 0 && (
              <span className="rounded-full bg-ember/15 px-2 py-0.5 text-xs font-semibold text-ember-deep dark:text-ember tnum">
                {cartCount(items)}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {stage === "cart" && (
          <>
            <div className="flex-1 space-y-3 p-4">
              {items.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                  <Flame className="h-6 w-6" aria-hidden />
                  <p className="text-sm">The bag is empty — the oven is on, though.</p>
                  <p className="text-xs">Buns, pies, beans, gift cards: all from this page.</p>
                </div>
              ) : (
                <ul className="space-y-2.5">
                  {items.map((i) => (
                    <li key={i.id} className="flex items-center gap-3 rounded-xl border bg-background/60 p-3">
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-2 text-sm font-medium">
                          {i.name}
                          <span className="rounded-full border px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                            {i.kind === "pizza" ? "build" : i.kind === "gift" ? "gift" : i.kind === "product" ? "retail" : "counter"}
                          </span>
                        </p>
                        {i.meta && <p className="truncate text-xs text-muted-foreground">{i.meta}</p>}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button variant="outline" size="icon" className="h-7 w-7" aria-label={`Fewer ${i.name}`} onClick={() => (i.qty <= 1 ? remove(i.id) : setQty(i.id, i.qty - 1))}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm font-semibold tnum">{i.qty}</span>
                        <Button variant="outline" size="icon" className="h-7 w-7" aria-label={`More ${i.name}`} onClick={() => setQty(i.id, i.qty + 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="w-16 text-right text-sm font-semibold tnum">{money(i.price * i.qty)}</p>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" aria-label={`Remove ${i.name}`} onClick={() => remove(i.id)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="space-y-4 border-t p-4">
                {/* delivery zone (TaxShippingEstimator) */}
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-medium">
                    <Truck className="h-4 w-4 text-ember-deep dark:text-ember" aria-hidden /> Where to?
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {DELIVERY_ZONES.map((z) => (
                      <button
                        key={z.id}
                        onClick={() => setZone(z.id)}
                        aria-pressed={zone === z.id}
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-medium",
                          zone === z.id ? "bg-pine text-cream dark:bg-ember dark:text-ink" : "border text-muted-foreground",
                        )}
                      >
                        {z.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* PromoCodeField */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Ticket className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                    <Input
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      placeholder="Promo code (try VALE10)"
                      className="pl-9 uppercase"
                      aria-label="Promo code"
                    />
                  </div>
                  {promo ? (
                    <Button
                      variant="outline"
                      className="rounded-full"
                      onClick={() => {
                        clearPromo();
                        setPromoInput("");
                        toast("Promo removed");
                      }}
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="rounded-full"
                      onClick={() => {
                        const r = applyPromo(promoInput);
                        if (r.ok) toast(`Applied — ${r.message}`);
                        else toast.error(r.message, { description: "The book has VALE10 and FIRSTSNOW." });
                      }}
                    >
                      <BadgePercent className="mr-1 h-4 w-4" aria-hidden /> Apply
                    </Button>
                  )}
                </div>

                {/* the math, live */}
                <dl className="space-y-1.5 text-sm" aria-live="polite">
                  <div className="flex justify-between text-muted-foreground">
                    <dt>Subtotal</dt>
                    <dd className="tnum">{money(subtotal)}</dd>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-pine dark:text-ember">
                      <dt>Promo {promo} (−10%)</dt>
                      <dd className="tnum">−{money(discount)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <dt>Delivery — {zoneObj.label}</dt>
                    <dd className="tnum">{deliveryFee === 0 ? "free" : money(deliveryFee)}</dd>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <dt>Valley tax 8%</dt>
                    <dd className="tnum">{money(taxes)}</dd>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-display text-lg font-semibold">
                    <dt>Total</dt>
                    <dd className="tnum">{money(total)}</dd>
                  </div>
                </dl>

                <Button
                  className="w-full rounded-full bg-ember text-ink hover:bg-gold"
                  onClick={() => setStage("checkout")}
                >
                  Checkout <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
                </Button>
              </div>
            )}
          </>
        )}

        {stage === "checkout" && (
          <CheckoutForm
            total={total}
            tip={tip}
            setTip={setTip}
            tipAmount={tipAmount}
            onDone={(id) => {
              setOrder({ id, step: 0 });
              setStage("done");
            }}
            onBack={() => setStage("cart")}
          />
        )}

        {stage === "done" && order && (
          <div className="space-y-5 p-4">
            <div className="rounded-xl border bg-ember-soft/60 p-4 dark:bg-ember-soft/30">
              <p className="flex items-center gap-2 font-display text-lg font-semibold">
                <Check className="h-5 w-5 text-pine dark:text-ember" aria-hidden /> Order {order.id} is in
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {zoneObj.km === 0 ? "Pickup at the counter —" : `Delivering to ${zoneObj.label.toLowerCase()} —`}{" "}
                {zoneObj.eta}.
              </p>
            </div>

            {/* OrderTracking */}
            <ol className="space-y-3" aria-label="Order tracking">
              {["Received by the counter", "In the oven / on the tray", "Boxed, labelled", zoneObj.km === 0 ? "On the pass — ask for your name" : "Out for delivery"].map(
                (label, i) => {
                  const state = order.step > i ? "done" : order.step === i ? "now" : "todo";
                  return (
                    <li key={label} className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs",
                          state === "done" && "border-pine bg-pine text-cream dark:border-ember dark:bg-ember dark:text-ink",
                          state === "now" && "border-ember bg-ember/15 text-ember-deep dark:text-ember",
                          state === "todo" && "text-muted-foreground",
                        )}
                      >
                        {state === "done" ? <Check className="h-3.5 w-3.5" aria-hidden /> : i + 1}
                      </span>
                      <span className={cn("text-sm", state === "todo" && "text-muted-foreground")}>
                        {label}
                        {state === "now" && <span className="ml-2 rounded-full bg-ember/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ember-deep dark:text-ember">now</span>}
                      </span>
                    </li>
                  );
                },
              )}
            </ol>

            <Button
              variant="outline"
              className="w-full rounded-full"
              onClick={() => {
                onOpenChange(false);
                setTimeout(() => {
                  setStage("cart");
                  setOrder(null);
                }, 400);
              }}
            >
              <Receipt className="mr-1.5 h-4 w-4" aria-hidden /> Close — keep the tab
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Demo checkout — nothing charges, nobody rides a bike. The tracking advances on its own; it’s theatre with receipts.
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function CheckoutForm({
  total,
  tip,
  setTip,
  tipAmount,
  onDone,
  onBack,
}: {
  total: number;
  tip: number;
  setTip: (n: number) => void;
  tipAmount: number;
  onDone: (id: string) => void;
  onBack: () => void;
}) {
  const schema = z.object({
    name: z.string().min(2, "A name for the order"),
    contact: z.string().min(5, "Phone or email — how we shout when it’s ready"),
    card: z.string()
      .regex(/^[\d ]{12,19}$/, "Card number looks short — demo only, type anything 12–19 digits"),
    expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "MM/YY"),
    cvc: z.string().regex(/^\d{3,4}$/, "3–4 digits"),
  });
  type F = z.infer<typeof schema>;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<F>({ resolver: zodResolver(schema) });

  return (
    <form
      onSubmit={handleSubmit(() => onDone(`KV-${Math.floor(100000 + Math.random() * 900000)}`))}
      className="space-y-5 p-4"
      noValidate
    >
      <div className="flex items-center justify-between">
        <p className="font-display text-lg font-semibold">Checkout</p>
        <Button type="button" variant="ghost" size="sm" className="rounded-full" onClick={onBack}>
          Back to bag
        </Button>
      </div>

      <div className="rounded-xl border bg-muted/40 p-4">
        <p className="flex justify-between text-sm">
          <span className="text-muted-foreground">Order total</span>
          <span className="tnum font-semibold">{money(total)}</span>
        </p>
        <p className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tip (service included — this is extra)</span>
          <span className="tnum">{money(tipAmount)}</span>
        </p>
        <div className="mt-2 flex gap-1.5">
          {[0, 0.1, 0.15].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setTip(v)}
              aria-pressed={tip === v}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium",
                tip === v ? "bg-pine text-cream dark:bg-ember dark:text-ink" : "border text-muted-foreground",
              )}
            >
              {v === 0 ? "no tip" : `${v * 100}%`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="co-name">Name</Label>
          <Input id="co-name" className="mt-1.5" aria-invalid={!!errors.name} {...register("name")} />
          {errors.name && <p className="mt-1 text-xs text-destructive" role="alert">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="co-contact">Phone or email</Label>
          <Input id="co-contact" className="mt-1.5" aria-invalid={!!errors.contact} {...register("contact")} />
          {errors.contact && <p className="mt-1 text-xs text-destructive" role="alert">{errors.contact.message}</p>}
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="co-card">Card (demo — nothing charges)</Label>
          <Input id="co-card" inputMode="numeric" placeholder="4242 4242 4242 4242" className="mt-1.5" aria-invalid={!!errors.card} {...register("card")} />
          {errors.card && <p className="mt-1 text-xs text-destructive" role="alert">{errors.card.message}</p>}
        </div>
        <div>
          <Label htmlFor="co-exp">Expiry</Label>
          <Input id="co-exp" placeholder="04/28" className="mt-1.5" aria-invalid={!!errors.expiry} {...register("expiry")} />
          {errors.expiry && <p className="mt-1 text-xs text-destructive" role="alert">{errors.expiry.message}</p>}
        </div>
        <div>
          <Label htmlFor="co-cvc">CVC</Label>
          <Input id="co-cvc" inputMode="numeric" placeholder="123" className="mt-1.5" aria-invalid={!!errors.cvc} {...register("cvc")} />
          {errors.cvc && <p className="mt-1 text-xs text-destructive" role="alert">{errors.cvc.message}</p>}
        </div>
      </div>

      <Button type="submit" className="w-full rounded-full bg-ember text-ink hover:bg-gold">
        Pay {money(total + tipAmount)} — demo
      </Button>
    </form>
  );
}
