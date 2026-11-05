"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import {
  BedDouble, CalendarDays, Coffee, Compass, Gift, GlassWater, Grid2x2, Languages,
  Moon, Mountain, ShoppingBag, Sparkles, Sun, TentTree, UserRound, UtensilsCrossed, Phone, PartyPopper,
} from "lucide-react";
import { useApp } from "@/store/useApp";
import { useCart } from "@/store/useCart";
import { BRAND } from "@/lib/site";
import { toast } from "sonner";

/**
 * CommandPalette — ⌘K / Ctrl+K. Search + jump + actions.
 * The power tool: go anywhere, do anything, from one place.
 */
export function CommandPalette({ onReserve, onOrder }: { onReserve: () => void; onOrder: () => void }) {
  const commandOpen = useApp((s) => s.commandOpen);
  const setCommandOpen = useApp((s) => s.setCommandOpen);
  const setPortalOpen = useApp((s) => s.setPortalOpen);
  const setCartOpen = useApp((s) => s.setCartOpen);
  const setConcierge = useApp((s) => s.setConcierge);
  const setLocale = useApp((s) => s.setLocale);
  const locale = useApp((s) => s.locale);
  const { theme, setTheme } = useTheme();
  const items = useCart((s) => s.items);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen(!commandOpen);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [commandOpen, setCommandOpen]);

  const go = (hash: string) => {
    setCommandOpen(false);
    const el = document.querySelector(hash);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
      <CommandInput placeholder="Go anywhere, do anything…" />
      <CommandList className="scroll-slim">
        <CommandEmpty>Nothing in the valley by that name.</CommandEmpty>
        <CommandGroup heading="The houses">
          <CommandItem onSelect={() => go("#stay")}>
            <BedDouble className="mr-2 h-4 w-4" /> The Kestrel Lodge <span className="ml-auto text-xs text-muted-foreground">Stay</span>
          </CommandItem>
          <CommandItem onSelect={() => go("#dine")}>
            <UtensilsCrossed className="mr-2 h-4 w-4" /> Hearth &amp; Vale <span className="ml-auto text-xs text-muted-foreground">Dine</span>
          </CommandItem>
          <CommandItem onSelect={() => go("#drink")}>
            <GlassWater className="mr-2 h-4 w-4" /> The Vessel <span className="ml-auto text-xs text-muted-foreground">Drink</span>
          </CommandItem>
          <CommandItem onSelect={() => go("#cafe")}>
            <Coffee className="mr-2 h-4 w-4" /> Meadowlark &amp; Ember <span className="ml-auto text-xs text-muted-foreground">Café</span>
          </CommandItem>
          <CommandItem onSelect={() => go("#adventure")}>
            <Mountain className="mr-2 h-4 w-4" /> Trailhead <span className="ml-auto text-xs text-muted-foreground">Adventures</span>
          </CommandItem>
          <CommandItem onSelect={() => go("#camp")}>
            <TentTree className="mr-2 h-4 w-4" /> The Grove <span className="ml-auto text-xs text-muted-foreground">Camp</span>
          </CommandItem>
          <CommandItem onSelect={() => go("#celebrate")}>
            <PartyPopper className="mr-2 h-4 w-4" /> The Barn <span className="ml-auto text-xs text-muted-foreground">Celebrate</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Do">
          <CommandItem
            onSelect={() => {
              setCommandOpen(false);
              onReserve();
            }}
          >
            <CalendarDays className="mr-2 h-4 w-4" /> Book a stay or a table
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setCommandOpen(false);
              onOrder();
            }}
          >
            <ShoppingBag className="mr-2 h-4 w-4" /> Order buns or pies
            {items.length > 0 && (
              <span className="ml-auto rounded-full bg-ember px-1.5 text-[10px] font-bold text-cream">
                {items.length}
              </span>
            )}
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setCommandOpen(false);
              setConcierge(true);
            }}
          >
            <Sparkles className="mr-2 h-4 w-4" /> Ask the valley (AI concierge)
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setCommandOpen(false);
              setPortalOpen(true);
            }}
          >
            <UserRound className="mr-2 h-4 w-4" /> Open the Vale portal
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setCommandOpen(false);
              go("#gift");
            }}
          >
            <Gift className="mr-2 h-4 w-4" /> Design a gift card
          </CommandItem>
          <CommandItem onSelect={() => { setCommandOpen(false); window.location.href = BRAND.phoneHref; }}>
            <Phone className="mr-2 h-4 w-4" /> Call the house
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="The rest">
          <CommandItem onSelect={() => go("#journal")}>
            <Compass className="mr-2 h-4 w-4" /> Field notes
          </CommandItem>
          <CommandItem onSelect={() => go("#local")}>
            <Grid2x2 className="mr-2 h-4 w-4" /> The valley, practically
          </CommandItem>
          <CommandItem
            onSelect={() => {
              const next = theme === "dark" ? "light" : "dark";
              setTheme(next);
              setCommandOpen(false);
              toast(next === "dark" ? "Night in the valley" : "Morning in the valley");
            }}
          >
            <Moon className="mr-2 h-4 w-4" /> Toggle day / night
          </CommandItem>
          <CommandItem
            onSelect={() => {
              const order = ["en", "fr", "de"] as const;
              const next = order[(order.indexOf(locale) + 1) % 3];
              setLocale(next);
              setCommandOpen(false);
              toast(`Locale → ${next.toUpperCase()}`, { description: "Demo localization of chrome strings." });
            }}
          >
            <Languages className="mr-2 h-4 w-4" /> Switch language
          </CommandItem>
          <CommandItem onSelect={() => { setTheme("light" as never); }}>
            <Sun className="mr-2 h-4 w-4" /> <span className="sr-only">Set light theme (demo)</span>
            Light mode
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
