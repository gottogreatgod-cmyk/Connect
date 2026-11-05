"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DELIVERY_ZONES, PROMOS } from "@/lib/site";

export type CartKind =
  | { kind: "cafe"; id: string; name: string; price: number; qty: number; meta?: string }
  | { kind: "pizza"; id: string; name: string; price: number; qty: number; meta: string }
  | { kind: "product"; id: string; name: string; price: number; qty: number; meta?: string }
  | { kind: "gift"; id: string; name: string; price: number; qty: number; meta: string };

type CartState = {
  items: CartKind[];
  promo: string | null;
  zone: string;
  lastOrderId: string | null;
  add: (item: Omit<CartKind, "qty"> & { qty?: number }) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  applyPromo: (code: string) => { ok: boolean; message: string };
  clearPromo: () => void;
  setZone: (z: string) => void;
  completeOrder: () => string;
  subtotal: () => number;
  discount: () => number;
  deliveryFee: () => number;
  taxes: () => number;
  total: () => number;
};

const TAX_RATE = 0.08;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      promo: null,
      zone: "z0",
      lastOrderId: null,
      add: (item) =>
        set((s) => {
          const qty = ("qty" in item && item.qty) || 1;
          const existing = s.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: s.items.map((i) => (i.id === item.id ? { ...i, qty: i.qty + qty } : i)),
            };
          }
          return { items: [...s.items, { ...item, qty } as CartKind] };
        }),
      setQty: (id, qty) =>
        set((s) => ({
          items: qty <= 0 ? s.items.filter((i) => i.id !== id) : s.items.map((i) => (i.id === id ? { ...i, qty } : i)),
        })),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [], promo: null, lastOrderId: null }),
      applyPromo: (code) => {
        const c = code.trim().toUpperCase();
        if (!c) return { ok: false, message: "Enter a code" };
        if (PROMOS[c]) {
          set({ promo: c });
          return { ok: true, message: PROMOS[c].label };
        }
        return { ok: false, message: "That code isn’t in the book" };
      },
      clearPromo: () => set({ promo: null }),
      setZone: (z) => set({ zone: z }),
      completeOrder: () => {
        const id = `KV-${Math.floor(100000 + Math.random() * 900000)}`;
        set({ lastOrderId: id, items: [], promo: null });
        return id;
      },
      subtotal: () => get().items.reduce((acc, i) => acc + i.price * i.qty, 0),
      discount: () => {
        const { promo, items } = get();
        if (!promo || !PROMOS[promo]) return 0;
        const sub = items.reduce((acc, i) => acc + i.price * i.qty, 0);
        return Math.round(sub * (PROMOS[promo].pct / 100) * 100) / 100;
      },
      deliveryFee: () => {
        const { zone, items } = get();
        const z = DELIVERY_ZONES.find((d) => d.id === zone) ?? DELIVERY_ZONES[0];
        if (z.km === 0) return 0;
        return items.length ? z.fee : 0;
      },
      taxes: () => {
        const { items, promo } = get();
        const sub = items.reduce((acc, i) => acc + i.price * i.qty, 0);
        const disc = promo && PROMOS[promo] ? Math.round(sub * (PROMOS[promo].pct / 100) * 100) / 100 : 0;
        return Math.round((sub - disc) * TAX_RATE * 100) / 100;
      },
      total: () => {
        const { items, promo, zone } = get();
        const sub = items.reduce((acc, i) => acc + i.price * i.qty, 0);
        const disc = promo && PROMOS[promo] ? Math.round(sub * (PROMOS[promo].pct / 100) * 100) / 100 : 0;
        const z = DELIVERY_ZONES.find((d) => d.id === zone) ?? DELIVERY_ZONES[0];
        const fee = z.km === 0 || !items.length ? 0 : z.fee;
        return Math.round((sub - disc + fee) * (1 + TAX_RATE) * 100) / 100;
      },
    }),
    {
      name: "kv-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items, promo: s.promo, zone: s.zone, lastOrderId: s.lastOrderId }),
    },
  ),
);

export const cartCount = (items: CartKind[]) => items.reduce((a, i) => a + i.qty, 0);
