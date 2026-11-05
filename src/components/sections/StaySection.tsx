"use client";

import { lazy, Suspense, useState } from "react";
import {
  ArrowRight, Bath, BookOpen, Check, ChevronRight, Heart,
  Layers, MapPin, RadioTower, Snowflake, Sofa, TreePine, Wifi, Armchair,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ImageSlot, Parallax } from "@/components/fx/Media";
import { Reveal, Stagger, StaggerItem } from "@/components/fx/Reveal";
import { DemoBadge, TiltCard } from "@/components/fx/Atoms";
import { SectionHeading } from "@/components/fx/SectionHeading";
import { ErrorBoundary3D } from "@/components/three/ErrorBoundary3D";
import { ROOMS, STAY_PACKAGES } from "@/lib/site";
import { money } from "@/lib/format";
import { useShortlist } from "@/store/useShortlist";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const RoomTour = lazy(() => import("@/components/three/RoomTour"));

/* ---------------- RoomCard (exported — reused by ReservationFlow) ---------------- */

export function RoomCard({
  room,
  onDetail,
  onBook,
}: {
  room: (typeof ROOMS)[number];
  onDetail: (id: string) => void;
  onBook: (id: string) => void;
}) {
  const saved = useShortlist((s) => s.has(room.id));
  const toggle = useShortlist((s) => s.toggle);

  return (
    <TiltCard className="h-full">
      <article className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-shadow duration-500 hover:shadow-xl">
        <div className="relative">
          <ImageSlot
            src={room.img}
            alt={`${room.name} — ${room.bed}`}
            className="aspect-[16/10] w-full"
            sizes="(max-width:768px) 100vw, 33vw"
          />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ink/60 to-transparent" aria-hidden />
          <div className="absolute inset-x-3 bottom-2.5 flex items-end justify-between text-cream">
            <p className="text-[11px] font-medium">{room.floor}</p>
            <p className="tnum rounded-full bg-ink/55 px-2.5 py-1 text-xs font-semibold backdrop-blur">
              {money(room.price)} <span className="font-normal opacity-80">/ night</span>
            </p>
          </div>
          <button
            onClick={() => {
              const now = toggle({ id: room.id, kind: "room", name: room.name, price: room.price, unit: "night" });
              toast(now ? `${room.name} — saved to your shortlist` : `${room.name} — removed from shortlist`);
            }}
            aria-label={saved ? `Remove ${room.name} from shortlist` : `Save ${room.name} to shortlist`}
            aria-pressed={saved}
            className={cn(
              "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur transition-colors",
              saved ? "bg-ember text-cream" : "bg-ink/45 text-cream hover:bg-ink/70",
            )}
          >
            <Heart className={cn("h-4 w-4", saved && "fill-current")} aria-hidden />
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div>
            <h3 className="font-display text-xl font-semibold">{room.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{room.bed} · sleeps {room.sleeps} · {room.size}</p>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{room.note}</p>
          <ul className="mt-auto flex flex-wrap gap-1.5" aria-label="Amenities">
            {room.amenities.slice(0, 4).map((a) => (
              <li key={a} className="rounded-full border bg-background/60 px-2.5 py-1 text-[11px] text-muted-foreground">
                {a}
              </li>
            ))}
          </ul>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" className="rounded-full" onClick={() => onDetail(room.id)}>
              Details
            </Button>
            <Button
              size="sm"
              className="ml-auto rounded-full bg-pine text-cream hover:bg-pine-deep dark:bg-ember dark:text-ink dark:hover:bg-ember-deep"
              onClick={() => onBook(room.id)}
              data-cursor="Book"
            >
              Reserve <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            </Button>
          </div>
        </div>
      </article>
    </TiltCard>
  );
}

/* ---------------- The Stay section ---------------- */

const AMENITY_ICONS: Record<string, typeof Bath> = {
  "Soaking tub": Bath,
  Balcony: MapPin,
  "Reading nook": Armchair,
  "Record player": Layers,
  "Mountain radio": RadioTower,
  "Window seat": Sofa,
  "Rain shower": Bath,
  "Wool throws": Snowflake,
  "Tea tray": BookOpen,
  Skylight: TreePine,
  "Writing desk": BookOpen,
  "Wood stove": Snowflake,
  Lantern: BookOpen,
  "Fire bundle nightly": Snowflake,
  "Sauna pass": Bath,
  "100 m to showers": Bath,
};

export function StaySection({ onBook }: { onBook: (roomId?: string) => void }) {
  const [detail, setDetail] = useState<string | null>(null);
  const [compare, setCompare] = useState(false);
  const room = ROOMS.find((r) => r.id === detail) ?? null;
  const savedCount = useShortlist((s) => s.byKind("room").length);

  return (
    <section id="stay" className="section" aria-label="The Kestrel Lodge — stay">
      <div className="shell space-y-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            kicker="The Kestrel Lodge · stay"
            title={<>Four ways to sleep<br />in this valley.</>}
            lede="Timber suites above the lake to canvas at the river. Breakfast is included in every room at the Lodge; the tents come with a fire bundle and a sauna pass."
            demo
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-full" onClick={() => setCompare((v) => !v)} aria-pressed={compare}>
              <Layers className="mr-1.5 h-4 w-4" aria-hidden /> Compare rooms
            </Button>
            {savedCount > 0 && (
              <Badge variant="outline" className="rounded-full border-ember/50 text-ember-deep dark:text-ember">
                {savedCount} saved to shortlist
              </Badge>
            )}
          </div>
        </div>

        {/* TabbedShowcase — rooms */}
        <Tabs defaultValue="all" className="space-y-8">
          <TabsList className="h-auto flex-wrap justify-start gap-1 rounded-full bg-muted/70 p-1">
            <TabsTrigger value="all" className="rounded-full px-4 data-[state=active]:bg-pine data-[state=active]:text-cream dark:data-[state=active]:bg-ember dark:data-[state=active]:text-ink">All rooms</TabsTrigger>
            <TabsTrigger value="lodge" className="rounded-full px-4 data-[state=active]:bg-pine data-[state=active]:text-cream dark:data-[state=active]:bg-ember dark:data-[state=active]:text-ink">The Lodge</TabsTrigger>
            <TabsTrigger value="grove" className="rounded-full px-4 data-[state=active]:bg-pine data-[state=active]:text-cream dark:data-[state=active]:bg-ember dark:data-[state=active]:text-ink">Canvas at The Grove</TabsTrigger>
          </TabsList>

          {(["all", "lodge", "grove"] as const).map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-0">
              <Stagger className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                {ROOMS.filter((r) => (tab === "all" ? true : tab === "grove" ? r.id === "grove-tent" : r.id !== "grove-tent")).map((r) => (
                  <StaggerItem key={r.id} className="h-full">
                    <RoomCard room={r} onDetail={setDetail} onBook={(id) => onBook(id)} />
                  </StaggerItem>
                ))}
              </Stagger>
            </TabsContent>
          ))}
        </Tabs>

        {/* ComparisonTable */}
        {compare && (
          <Reveal>
            <div className="overflow-x-auto rounded-2xl border" role="region" aria-label="Room comparison">
              <table className="w-full min-w-[640px] text-sm">
                <caption className="bg-muted/60 px-4 py-3 text-left font-medium">
                  The four rooms, side by side
                  <DemoBadge compact className="ml-2" />
                </caption>
                <thead>
                  <tr className="border-b bg-muted/40 text-left">
                    <th scope="col" className="p-3 font-medium">Room</th>
                    <th scope="col" className="p-3 font-medium">Sleeps</th>
                    <th scope="col" className="p-3 font-medium">Size</th>
                    <th scope="col" className="p-3 font-medium">View</th>
                    <th scope="col" className="p-3 font-medium">Best for</th>
                    <th scope="col" className="p-3 text-right font-medium">Night</th>
                  </tr>
                </thead>
                <tbody>
                  {ROOMS.map((r) => (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                      <th scope="row" className="p-3 text-left font-display text-base font-semibold">{r.name}</th>
                      <td className="p-3 tnum">{r.sleeps}</td>
                      <td className="p-3">{r.size}</td>
                      <td className="p-3 text-muted-foreground">{r.view}</td>
                      <td className="p-3 text-muted-foreground">{r.note.split(".")[0]}</td>
                      <td className="p-3 text-right font-semibold tnum">{money(r.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        )}

        {/* PackageCard + VirtualGallery 3D */}
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Packages */}
          <div className="space-y-4">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-display text-2xl font-semibold">Packages — bundled, not marked up</h3>
              <DemoBadge compact />
            </div>
            {STAY_PACKAGES.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.05}>
                <TiltCard>
                  <article className="flex flex-wrap items-center gap-4 rounded-2xl border bg-card p-5 transition-shadow hover:shadow-lg">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-display text-lg font-semibold">{p.name}</h4>
                        <Badge variant="outline" className="rounded-full border-ember/50 text-[10px] uppercase tracking-wider text-ember-deep dark:text-ember">{p.tag}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{p.per}</p>
                      <ul className="mt-3 grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
                        {p.includes.map((inc) => (
                          <li key={inc} className="flex items-start gap-1.5">
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-pine dark:text-ember" aria-hidden />
                            {inc}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-xs text-muted-foreground line-through tnum">{money(p.was)}</p>
                      <p className="font-display text-2xl font-semibold tnum text-pine dark:text-ember">{money(p.price)}</p>
                      <Button
                        size="sm"
                        className="mt-2 rounded-full bg-pine text-cream hover:bg-pine-deep dark:bg-ember dark:text-ink dark:hover:bg-ember-deep"
                        onClick={() => {
                          toast(`${p.name} — added to your stay draft`, { description: "Continue in the reservation flow to pick dates." });
                          onBook();
                        }}
                      >
                        Add to stay <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </Button>
                    </div>
                  </article>
                </TiltCard>
              </Reveal>
            ))}
            <p className="text-xs text-muted-foreground">
              Pricing is demo content. The bundles are how the house actually books — the à la carte
              is there for comparison, not upselling.
            </p>
          </div>

          {/* VirtualGallery — 3D room tour */}
          <Reveal className="h-full">
            <div className="relative flex h-full min-h-[380px] flex-col overflow-hidden rounded-2xl border bg-gradient-to-br from-pine-soft to-card dark:from-pine-deep dark:to-card">
              <div className="relative flex-1">
                <ErrorBoundary3D
                  fallback={
                    <Parallax className="h-full">
                      <ImageSlot src="/img/room-suite.jpg" alt="Aspen Suite" fill sizes="(max-width:1024px) 100vw, 45vw" className="h-full w-full" />
                    </Parallax>
                  }
                >
                  <Suspense fallback={<div className="flex h-full items-center justify-center text-sm text-muted-foreground">Building the room…</div>}>
                    <RoomTour className="h-full w-full" />
                  </Suspense>
                </ErrorBoundary3D>
              </div>
              <div className="flex items-center justify-between gap-3 border-t bg-card/80 p-4 backdrop-blur">
                <div>
                  <p className="font-display text-lg font-semibold">The Aspen Suite, in the round</p>
                  <p className="text-xs text-muted-foreground">
                    Drag to look around — a real 3D scene (WebGL), not a photo. The lamp is on.
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0 rounded-full border-ember/50 text-ember-deep dark:text-ember">3D</Badge>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* RoomDetail dialog */}
      <Dialog open={!!room} onOpenChange={(v) => !v && setDetail(null)}>
        <DialogContent aria-describedby={undefined} className="scroll-slim max-h-[92vh] max-w-3xl overflow-y-auto">
          {room && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{room.name}</DialogTitle>
              </DialogHeader>
              <ImageSlot src={room.img} alt={room.name} className="aspect-[16/9] w-full rounded-xl" sizes="90vw" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1 text-sm">
                  <p className="flex justify-between border-b py-1"><span className="text-muted-foreground">Sleeps</span><span className="tnum">{room.sleeps}</span></p>
                  <p className="flex justify-between border-b py-1"><span className="text-muted-foreground">Bed</span><span>{room.bed}</span></p>
                  <p className="flex justify-between border-b py-1"><span className="text-muted-foreground">Size</span><span>{room.size}</span></p>
                  <p className="flex justify-between py-1"><span className="text-muted-foreground">View</span><span>{room.view}</span></p>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="flex justify-between border-b py-1"><span className="text-muted-foreground">Night</span><span className="font-semibold tnum">{money(room.price)}</span></p>
                  <p className="flex justify-between border-b py-1"><span className="text-muted-foreground">Breakfast</span><span>Included (Lodge rooms)</span></p>
                  <p className="flex justify-between py-1"><span className="text-muted-foreground">Policy</span><span className="text-right text-xs">{room.policies}</span></p>
                </div>
              </div>
              <ul className="flex flex-wrap gap-2" aria-label="All amenities">
                {room.amenities.map((a) => {
                  const Icon = AMENITY_ICONS[a] ?? Check;
                  return (
                    <li key={a} className="inline-flex items-center gap-1.5 rounded-full border bg-background/60 px-3 py-1.5 text-xs">
                      <Icon className="h-3.5 w-3.5 text-ember-deep dark:text-ember" aria-hidden />
                      {a}
                    </li>
                  );
                })}
              </ul>
              <div className="flex flex-wrap gap-2">
                <Button
                  className="rounded-full bg-pine text-cream hover:bg-pine-deep dark:bg-ember dark:text-ink dark:hover:bg-ember-deep"
                  onClick={() => {
                    setDetail(null);
                    onBook(room.id);
                  }}
                  data-cursor="Book"
                >
                  Reserve this room
                </Button>
                <Wifi className="ml-auto self-center text-xs text-muted-foreground" aria-hidden />
                <span className="self-center text-xs text-muted-foreground">Fibre 300 · desk-friendly</span>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
