"use client";

import { useState } from "react";
import { ThemeProvider } from "next-themes";
import { SiteHeader } from "@/components/chrome/SiteHeader";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { BackToTop, CookieConsent, StickyActionBar } from "@/components/chrome/Overlays";
import { CommandPalette } from "@/components/chrome/CommandPalette";
import { GuidedTour } from "@/components/chrome/GuidedTour";
import { CursorLayer } from "@/components/chrome/CursorLayer";
import { SectionObserver } from "@/components/chrome/SectionObserver";
import { HeroSection, TrustBand } from "@/components/sections/HeroSection";
import { StorySection } from "@/components/sections/StorySection";
import { StaySection } from "@/components/sections/StaySection";
import { DineSection } from "@/components/sections/DineSection";
import { DrinkSection } from "@/components/sections/DrinkSection";
import { CafeSection } from "@/components/sections/CafeSection";
import { AdventureSection } from "@/components/sections/AdventureSection";
import { CampSection } from "@/components/sections/CampSection";
import { CelebrateSection } from "@/components/sections/CelebrateSection";
import { ClubSection } from "@/components/sections/ClubSection";
import { FieldNotesSection, LocalSection } from "@/components/sections/FieldNotesSection";
import { ReservationFlow } from "@/components/flows/ReservationFlow";
import { CartSheet } from "@/components/flows/CheckoutFlow";
import { PortalDialog } from "@/components/flows/PortalDialog";
import { ConciergeWidget } from "@/components/concierge/ConciergeWidget";
import { Toaster } from "@/components/ui/sonner";
import { useApp } from "@/store/useApp";

/**
 * KestrelValeApp — the whole flagship on one route.
 * Chrome → hero → trust → story → six houses → club → notes → local → footer.
 * Overlays: reservation engine, cart, portal, ⌘K, tour, concierge.
 */
export function KestrelValeApp() {
  const [reserveOpen, setReserveOpen] = useState(false);
  const [reserveMode, setReserveMode] = useState<"stay" | "table">("stay");
  const [fixedRoom, setFixedRoom] = useState<string | undefined>(undefined);
  const setCartOpen = useApp((s) => s.setCartOpen);
  const cartOpen = useApp((s) => s.cartOpen);

  const openReserve = (mode: "stay" | "table" = "stay", room?: string) => {
    setReserveMode(mode);
    setFixedRoom(room);
    setReserveOpen(true);
  };

  const goOrder = () => {
    setCartOpen(true);
    document.getElementById("cafe")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <a
        href="#main"
        className="sr-only z-[90] rounded-full bg-pine px-4 py-2 text-sm font-semibold text-cream focus:not-sr-only focus:fixed focus:left-4 focus:top-4 dark:bg-ember dark:text-ink"
      >
        Skip to content
      </a>

      <SiteHeader onReserve={() => openReserve("stay")} />

      <main id="main" className="flex-1">
        <HeroSection onReserve={() => openReserve("stay")} />
        <TrustBand />
        <StorySection />
        <StaySection onBook={(roomId) => openReserve("stay", roomId)} />
        <DineSection
          onTable={() => openReserve("table")}
          onSommelier={() => useApp.getState().setConcierge(true, "sommelier")}
        />
        <DrinkSection />
        <CafeSection />
        <AdventureSection />
        <CampSection />
        <CelebrateSection />
        <ClubSection />
        <FieldNotesSection />
        <LocalSection />
      </main>

      <SiteFooter />

      {/* Overlays */}
      <StickyActionBar onReserve={() => openReserve("stay")} />
      <BackToTop />
      <CookieConsent />
      <ReservationFlow
        open={reserveOpen}
        onOpenChange={setReserveOpen}
        initialMode={reserveMode}
        fixedRoom={fixedRoom}
      />
      <CartSheet open={cartOpen} onOpenChange={(v) => setCartOpen(v)} />
      <PortalDialog />
      <CommandPalette onReserve={() => openReserve("stay")} onOrder={goOrder} />
      <GuidedTour />
      <CursorLayer />
      <SectionObserver />
      <ConciergeWidget />

      <Toaster position="top-center" richColors closeButton />
    </ThemeProvider>
  );
}
