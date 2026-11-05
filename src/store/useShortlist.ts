"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * SavedItems — the shortlist. Rooms, experiences, venues and events
 * can be saved; the portal and concierge read it for personalization.
 */
export type ShortlistKind = "room" | "experience" | "venue" | "event";

export type ShortlistItem = {
  id: string;
  kind: ShortlistKind;
  name: string;
  price: number;
  unit: string;
  note?: string;
};

type State = {
  items: ShortlistItem[];
  toggle: (item: ShortlistItem) => boolean;
  has: (id: string) => boolean;
  clear: () => void;
  byKind: (k: ShortlistKind) => ShortlistItem[];
};

export const useShortlist = create<State>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) => {
        const exists = get().items.some((i) => i.id === item.id);
        set((s) => ({
          items: exists ? s.items.filter((i) => i.id !== item.id) : [...s.items, item],
        }));
        return !exists;
      },
      has: (id) => get().items.some((i) => i.id === id),
      clear: () => set({ items: [] }),
      byKind: (k) => get().items.filter((i) => i.kind === k),
    }),
    { name: "kv-shortlist", storage: createJSONStorage(() => localStorage) },
  ),
);

/** PersonalizedRecommendations — deterministic engine over the shortlist. */
export function recommendFrom(items: ShortlistItem[]): { title: string; why: string; anchor: string; cta: string }[] {
  const out: { title: string; why: string; anchor: string; cta: string }[] = [];
  const kinds = new Set(items.map((i) => i.kind));
  if (kinds.has("room")) {
    out.push({
      title: "Add a cellar tasting to your stay",
      why: "because you saved a room at the Lodge",
      anchor: "#drink",
      cta: "See the cellar",
    });
  }
  if (kinds.has("experience")) {
    out.push({
      title: "The sauna block books out by 16:00",
      why: "because you saved a guided trip",
      anchor: "#camp",
      cta: "Reserve a slot",
    });
  }
  if (kinds.has("venue")) {
    out.push({
      title: "Supper Club — Fire & Ice (waitlist)",
      why: "because you saved a venue",
      anchor: "#celebrate",
      cta: "Join the waitlist",
    });
  }
  if (kinds.has("event")) {
    out.push({
      title: "Stay the night of the event at the Lodge",
      why: "because you saved an event",
      anchor: "#stay",
      cta: "Check rooms",
    });
  }
  if (!out.length) {
    out.push(
      {
        title: "The Slow Weekend, 2 nights",
        why: "the house standard",
        anchor: "#stay",
        cta: "View package",
      },
      {
        title: "Dawn Canoe, 05:45",
        why: "the quietest hour on the lake",
        anchor: "#adventure",
        cta: "See the trip",
      },
    );
  }
  return out.slice(0, 3);
}
