"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Locale } from "@/lib/site";

/**
 * App-level UI state: consent gate, locale, guided tour, overlays,
 * and the active section (drives the dynamic breadcrumb).
 */
type AppState = {
  consent: "unset" | "granted" | "declined";
  locale: Locale;
  tourSeen: boolean;
  activeSection: string;
  commandOpen: boolean;
  conciergeOpen: boolean;
  conciergeMode: "host" | "sommelier" | "guide";
  portalOpen: boolean;
  cartOpen: boolean;
  toast: string | null;
  setConsent: (v: "granted" | "declined") => void;
  setLocale: (l: Locale) => void;
  setTourSeen: (v: boolean) => void;
  setActiveSection: (id: string) => void;
  setCommandOpen: (v: boolean) => void;
  setConcierge: (v: boolean, mode?: AppState["conciergeMode"]) => void;
  setPortalOpen: (v: boolean) => void;
  setCartOpen: (v: boolean) => void;
  ping: (msg: string) => void;
};

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      consent: "unset",
      locale: "en",
      tourSeen: false,
      activeSection: "top",
      commandOpen: false,
      conciergeOpen: false,
      conciergeMode: "host",
      portalOpen: false,
      cartOpen: false,
      toast: null,
      setConsent: (v) => set({ consent: v }),
      setLocale: (l) => set({ locale: l }),
      setTourSeen: (v) => set({ tourSeen: v }),
      setActiveSection: (id) => set({ activeSection: id }),
      setCommandOpen: (v) => set({ commandOpen: v }),
      setConcierge: (v, mode) => set((s) => ({ conciergeOpen: v, conciergeMode: mode ?? s.conciergeMode })),
      setPortalOpen: (v) => set({ portalOpen: v }),
      setCartOpen: (v) => set({ cartOpen: v }),
      ping: (msg) => set({ toast: msg }),
    }),
    {
      name: "kv-app",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        consent: s.consent,
        locale: s.locale,
        tourSeen: s.tourSeen,
        activeSection: s.activeSection,
      }),
    },
  ),
);
