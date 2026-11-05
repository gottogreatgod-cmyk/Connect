"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/use-mounted";
import {
  CalendarCheck, Coffee, Languages, Menu, Moon, Search, ShoppingBag, Sun, UserRound, X, Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wordmark } from "@/components/brand/Mark";
import { useApp } from "@/store/useApp";
import { useCart, cartCount } from "@/store/useCart";
import { BRAND, DICT, LOCALES, type Locale } from "@/lib/site";
import { openState } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const NAV = [
  { href: "#stay", key: "nav_stay", id: "stay" },
  { href: "#dine", key: "nav_dine", id: "dine" },
  { href: "#drink", key: "nav_drink", id: "drink" },
  { href: "#cafe", key: "nav_cafe", id: "cafe" },
  { href: "#adventure", key: "nav_adventure", id: "adventure" },
  { href: "#camp", key: "nav_camp", id: "camp" },
  { href: "#celebrate", key: "nav_celebrate", id: "celebrate" },
  { href: "#journal", key: "nav_journal", id: "journal" },
  { href: "#local", key: "nav_local", id: "local" },
] as const;

const SECTION_LABEL: Record<string, string> = {
  top: "The valley",
  story: "The collective",
  stay: "The Kestrel Lodge",
  reserve: "Reserve",
  dine: "Hearth & Vale",
  drink: "The Vessel",
  cafe: "Meadowlark & Ember",
  adventure: "Trailhead",
  camp: "The Grove",
  celebrate: "The Barn",
  club: "Vale Club",
  journal: "Field notes",
  local: "The valley, practically",
};

export function SiteHeader({ onReserve }: { onReserve: () => void }) {
  const locale = useApp((s) => s.locale);
  const setLocale = useApp((s) => s.setLocale);
  const activeSection = useApp((s) => s.activeSection);
  const setCommandOpen = useApp((s) => s.setCommandOpen);
  const setPortalOpen = useApp((s) => s.setPortalOpen);
  const setCartOpen = useApp((s) => s.setCartOpen);
  const items = useCart((s) => s.items);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const t = DICT[locale];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const crumb = SECTION_LABEL[activeSection] ?? "The valley";
  const isOpen = useMemo(() => openState("meadowlark").open, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-luxe",
        scrolled ? "bg-background/85 shadow-[0_1px_0_hsl(var(--border))] backdrop-blur-xl" : "bg-transparent",
      )}
    >
      {/* AnnouncementBar */}
      <div className="bg-pine text-cream">
        <div className="shell flex h-8 items-center justify-between gap-4 text-[11px]">
          <p className="truncate">
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-gold align-middle" aria-hidden />
            {BRAND.name}: winter stays open Dec 6 — Supper Club “Fire &amp; Ice” waitlist is live
          </p>
          <a href={BRAND.phoneHref} className="hidden shrink-0 items-center gap-1.5 underline-offset-4 hover:underline sm:flex">
            <Phone className="h-3 w-3" aria-hidden /> {BRAND.phone}
          </a>
        </div>
      </div>

      <div className={cn("shell flex items-center justify-between gap-3 py-3 transition-all", scrolled && "py-2")}>
        {/* Brand + dynamic Breadcrumb */}
        <div className="flex min-w-0 items-center gap-4">
          <a href="#top" aria-label="Kestrel Vale — home" data-tour="brand">
            <Wordmark sub={false} className="shrink-0" />
          </a>
          <span aria-hidden className={cn("hidden h-4 w-px bg-border md:block", !scrolled && "bg-cream/25")} />
          <nav aria-label="Breadcrumb" className="hidden min-w-0 md:block">
            <ol className="flex items-center gap-2 text-xs text-muted-foreground">
              <li className="hidden sm:list-item"><a href="#top" className="hover:text-foreground">Valley</a></li>
              <li aria-hidden className="hidden sm:list-item">/</li>
              <li aria-current="page" className="truncate font-medium text-foreground/80">{crumb}</li>
            </ol>
          </nav>
        </div>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden items-center gap-1 xl:flex" data-tour="nav">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className={cn(
                "link-grow rounded-full px-3 py-2 text-[13px] font-medium text-foreground/75 hover:text-foreground",
                activeSection === n.id && "text-ember-deep dark:text-ember",
              )}
            >
              {t[n.key]}
            </a>
          ))}
        </nav>

        {/* Tools */}
        <div className="flex items-center gap-1.5" data-tour="tools">
          <Button
            variant="ghost"
            size="icon"
            aria-label={t.search}
            onClick={() => setCommandOpen(true)}
            className="text-foreground/80"
          >
            <Search className="h-[18px] w-[18px]" />
          </Button>

          {/* LanguageSwitcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Language" className="text-foreground/80">
                <Languages className="h-[18px] w-[18px]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-40">
              {LOCALES.map((l) => (
                <DropdownMenuItem
                  key={l.id}
                  onClick={() => {
                    setLocale(l.id as Locale);
                    toast(`Locale: ${l.label}`, {
                      description: "Demo localization — chrome and hero strings translate; houses stay in English.",
                    });
                  }}
                  className={cn(locale === l.id && "text-ember-deep dark:text-ember font-semibold")}
                >
                  {l.flag} · {l.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* ThemeToggle */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-foreground/80"
          >
            {mounted && theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </Button>

          {/* Portal */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Vale portal"
            onClick={() => setPortalOpen(true)}
            className="text-foreground/80"
          >
            <UserRound className="h-[18px] w-[18px]" />
          </Button>

          {/* Cart */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Your order"
            onClick={() => setCartOpen(true)}
            className="relative text-foreground/80"
          >
            <ShoppingBag className="h-[18px] w-[18px]" />
            {items.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ember px-1 text-[10px] font-bold text-cream">
                {cartCount(items)}
              </span>
            )}
          </Button>

          {/* Primary CTA — dominant: reserve */}
          <Button
            onClick={onReserve}
            size="sm"
            className="hidden gap-2 rounded-full bg-pine px-4 text-cream hover:bg-pine-deep dark:bg-ember dark:text-ink dark:hover:bg-ember-deep sm:inline-flex"
            data-tour="reserve"
          >
            <CalendarCheck className="h-4 w-4" aria-hidden />
            {t.cta_primary}
          </Button>

          {/* MobileNav trigger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menu" className="text-foreground/80 xl:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[19rem] gap-0 p-0">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="flex items-center justify-between border-b px-5 py-4">
                <Wordmark />
                <Button variant="ghost" size="icon" aria-label="Close" onClick={() => setOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <nav aria-label="Mobile" className="flex flex-col gap-1 overflow-y-auto p-4">
                {NAV.map((n) => (
                  <a
                    key={n.href}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-lg px-3 py-2.5 text-[15px] font-medium hover:bg-accent",
                      activeSection === n.id && "text-ember-deep dark:text-ember",
                    )}
                  >
                    {t[n.key]}
                  </a>
                ))}
                <div className="my-3 h-px bg-border" />
                <a href={BRAND.phoneHref} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent">
                  <Phone className="h-4 w-4" aria-hidden /> {BRAND.phone}
                </a>
                <button
                  onClick={() => {
                    setOpen(false);
                    onReserve();
                  }}
                  className="mt-2 flex items-center justify-center gap-2 rounded-full bg-pine px-4 py-3 text-sm font-semibold text-cream dark:bg-ember dark:text-ink"
                >
                  <CalendarCheck className="h-4 w-4" aria-hidden /> {t.cta_primary}
                </button>
                <p className="mt-4 flex items-center gap-2 px-3 text-xs text-muted-foreground">
                  <Coffee className="h-3.5 w-3.5" aria-hidden />
                  {isOpen ? "The counter is open — pies from 18:00" : "The counter opens at 07:00"}
                </p>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
