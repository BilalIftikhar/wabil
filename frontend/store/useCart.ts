"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  pricePkr: number;
  size: string;
  color: string;
  qty: number;
}

interface CartState {
  items: CartItem[];
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (item: CartItem) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: () => number;
  subtotalPkr: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      open: false,
      setOpen: (open) => set({ open }),
      add: (item) =>
        set((s) => {
          const existing = s.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              open: true,
              items: s.items.map((i) =>
                i.id === item.id ? { ...i, qty: i.qty + item.qty } : i,
              ),
            };
          }
          return { open: true, items: [...s.items, item] };
        }),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      setQty: (id, qty) =>
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i)),
        })),
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((n, i) => n + i.qty, 0),
      subtotalPkr: () => get().items.reduce((n, i) => n + i.pricePkr * i.qty, 0),
    }),
    { name: "wabil-cart", partialize: (s) => ({ items: s.items }) },
  ),
);
