"use client";

import { useState } from "react";
import {
  Armchair, Backpack, BellRing, FileDown, Heart, Receipt, Sparkles, TentTree, Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buildIcs, downloadIcs } from "@/lib/ics";
import { money, fmtRange, addDays } from "@/lib/format";
import { recommendFrom, useShortlist } from "@/store/useShortlist";
import { useApp } from "@/store/useApp";
import { cn } from "@/lib/utils";

/**
 * PortalDialog — ClientDashboard (T4 portal layer).
 * Stays, invoices, packing lists, loyalty, and live recommendations —
 * all seeded from the page’s own state. Demo, clearly labelled.
 */
export function PortalDialog() {
  const open = useApp((s) => s.portalOpen);
  const setPortalOpen = useApp((s) => s.setPortalOpen);
  const items = useShortlist((s) => s.items);
  const recs = recommendFrom(items);
  const [reminders, setReminders] = useState<Record<string, boolean>>({ stay: true, event: false });

  const nextStay = {
    room: "Aspen Suite",
    from: addDays(new Date(), 21),
    to: addDays(new Date(), 24),
    ref: "KV-48213",
  };

  const invoices = [
    { id: "INV-2041", what: "Slow Weekend · Vale Room ×2", when: "last month", amount: 812, status: "paid" },
    { id: "INV-2078", what: "Cellar tasting, four pours", when: "last month", amount: 68, status: "paid" },
    { id: "INV-2090", what: "Firewood, 3 nights", when: "this week", amount: 27, status: "due" },
  ];

  return (
    <DialogWrap open={open} onOpenChange={setPortalOpen}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="overline text-muted-foreground">Vale portal · demo tenant</p>
            <h2 className="font-display text-2xl font-semibold">Good evening. The valley kept your place.</h2>
          </div>
          <Badge variant="outline" className="rounded-full border-ember/50 text-ember-deep dark:text-ember">
            ClientDashboard
          </Badge>
        </div>

        <Tabs defaultValue="stays" className="gap-4">
          <TabsList className="h-auto flex-wrap justify-start gap-1 rounded-full bg-muted/70 p-1">
            {[
              ["stays", "Stays"],
              ["invoices", "Invoices"],
              ["packing", "Packing lists"],
              ["loyalty", "Vale Club"],
              ["foryou", "For you"],
            ].map(([v, l]) => (
              <TabsTrigger
                key={v}
                value={v}
                className="rounded-full px-4 data-[state=active]:bg-pine data-[state=active]:text-cream dark:data-[state=active]:bg-ember dark:data-[state=active]:text-ink"
              >
                {l}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="stays" className="mt-0 space-y-4">
            <div className="rounded-xl border bg-ember-soft/50 p-4 dark:bg-ember-soft/25">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="overline text-muted-foreground">Next stay</p>
                  <p className="font-display text-lg font-semibold">
                    {nextStay.room} · {fmtRange(nextStay.from, nextStay.to)}
                  </p>
                  <p className="text-xs text-muted-foreground">Ref {nextStay.ref} · breakfast included</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    onClick={() =>
                      downloadIcs(
                        nextStay.ref,
                        buildIcs({
                          title: `Kestrel Vale — ${nextStay.room}`,
                          description: `Ref ${nextStay.ref}. Check-in 15:00, checkout 11:00.`,
                          location: "Kestrel Vale, 4 Pass Road, Vale Hollow",
                          start: nextStay.from,
                          end: addDays(nextStay.to, 1),
                          uid: `${nextStay.ref}@kestrelvale.demo`,
                        }),
                      )
                    }
                  >
                    <FileDown className="mr-1.5 h-4 w-4" aria-hidden /> .ics
                  </Button>
                  <Button
                    size="sm"
                    variant={reminders.stay ? "default" : "outline"}
                    className={cn("rounded-full", reminders.stay && "bg-pine text-cream hover:bg-pine-deep dark:bg-ember dark:text-ink")}
                    onClick={() => setReminders((r) => ({ ...r, stay: !r.stay }))}
                  >
                    <BellRing className="mr-1.5 h-4 w-4" aria-hidden /> {reminders.stay ? "Reminder on" : "Remind me"}
                  </Button>
                </div>
              </div>
            </div>

            {items.filter((i) => i.kind === "room" || i.kind === "experience").length > 0 && (
              <div className="rounded-xl border p-4">
                <p className="overline mb-3 text-muted-foreground">Your shortlist (live from the page)</p>
                <ul className="space-y-2">
                  {items
                    .filter((i) => i.kind === "room" || i.kind === "experience")
                    .map((i) => (
                      <li key={i.id} className="flex items-center gap-3 rounded-lg border bg-background/60 p-3 text-sm">
                        <Heart className="h-4 w-4 fill-current text-ember" aria-hidden />
                        <span className="flex-1">
                          <span className="font-medium">{i.name}</span>
                          <span className="block text-xs text-muted-foreground">
                            {i.kind} · {money(i.price)}/{i.unit}
                          </span>
                        </span>
                        <span className="text-xs text-muted-foreground">saved on the page</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Everything above is demo data — the shortlist rows are the only live part, and they’re
              yours.
            </p>
          </TabsContent>

          <TabsContent value="invoices" className="mt-0 space-y-3">
            {invoices.map((inv) => (
              <div key={inv.id} className="flex flex-wrap items-center gap-3 rounded-xl border bg-background/60 p-4">
                <Receipt className="h-5 w-5 text-muted-foreground" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{inv.what}</p>
                  <p className="text-xs text-muted-foreground">
                    {inv.id} · {inv.when}
                  </p>
                </div>
                <p className="tnum text-sm font-semibold">{money(inv.amount)}</p>
                <Badge
                  variant="outline"
                  className={cn(
                    "rounded-full",
                    inv.status === "paid" ? "border-pine/40 text-pine dark:text-ember" : "border-[#e8c089]/60 text-[#8a6b2a] dark:text-[#e8c089]",
                  )}
                >
                  {inv.status}
                </Badge>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">Demo ledger. Tipping is included by policy — no line for it, ever.</p>
          </TabsContent>

          <TabsContent value="packing" className="mt-0 space-y-4">
            {[
              {
                icon: Backpack,
                title: "Ridge Traverse — 06:30",
                list: ["Boots, broken-in", "1.5 L water", "Salty snacks", "Headlamp", "Sun hat + warm hat"],
              },
              {
                icon: TentTree,
                title: "The Grove — seasonal pitch",
                list: ["Bedding (or ask us)", "Torch, red filter after 22:30", "Coffee for the fire", "Slower mornings"],
              },
              {
                icon: Armchair,
                title: "The Study — private table",
                list: ["An appetite", "A story worth the room"],
              },
            ].map((p) => (
              <div key={p.title} className="flex gap-4 rounded-xl border bg-background/60 p-4">
                <p.icon className="h-6 w-6 shrink-0 text-ember-deep dark:text-ember" aria-hidden />
                <div>
                  <p className="text-sm font-semibold">{p.title}</p>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {p.list.map((l) => (
                      <li key={l} className="rounded-full border bg-card px-2.5 py-1 text-xs text-muted-foreground">
                        {l}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="loyalty" className="mt-0 space-y-4">
            <div className="rounded-xl border bg-gradient-to-br from-pine to-pine-deep p-5 text-cream dark:from-[#2a3d33] dark:to-pine-deep">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="overline text-[#e8c089]">Cairn tier · Vale Club</p>
                  <p className="mt-2 font-display text-3xl font-semibold tnum">1,240 pts</p>
                  <p className="text-xs text-cream/70">240 pts to Kestrel tier · 100 pts ≈ one night</p>
                </div>
                <Wallet className="h-8 w-8 text-[#e8c089]" aria-hidden />
              </div>
              <Progress value={80} className="mt-4 h-1.5 bg-cream/20 [&>div]:bg-[#e8c089]" aria-label="Tier progress" />
              <ul className="mt-4 grid gap-2 text-sm text-cream/85 sm:grid-cols-3">
                {["Stamps: 6 / 10", "This season: 3 stays", "A named cask: 9 months away"].map((x) => (
                  <li key={x} className="rounded-lg border border-cream/20 bg-cream/10 p-3">{x}</li>
                ))}
              </ul>
            </div>
            <p className="text-xs text-muted-foreground">
              Points never expire while the valley stands. Demo values, real policy.
            </p>
          </TabsContent>

          <TabsContent value="foryou" className="mt-0 space-y-3">
            <p className="overline text-muted-foreground">Because of what you’ve saved</p>
            {recs.map((r) => (
              <a key={r.title} href={r.anchor} className="flex items-center gap-3 rounded-xl border bg-background/60 p-4 transition-colors hover:border-ember/60">
                <Sparkles className="h-5 w-5 text-ember-deep dark:text-ember" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{r.why}</p>
                </div>
                <span className="text-xs font-semibold text-ember-deep dark:text-ember">{r.cta} →</span>
              </a>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DialogWrap>
  );
}

function DialogWrap({ open, onOpenChange, children }: { open: boolean; onOpenChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="scroll-slim max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogTitle className="sr-only">Vale portal</DialogTitle>
        {children}
      </DialogContent>
    </Dialog>
  );
}
