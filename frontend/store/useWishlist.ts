"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistItem {
  id: string;
  slug: string;
  name: string;
  image: string;
  pricePkr: number;
  comparePkr?: number;
}

interface WishlistState {
  items: WishlistItem[];
  toggle: (item: WishlistItem) => boolean; // returns new "liked" state
  has: (id: string) => boolean;
  remove: (id: string) => void;
  clear: () => void;
}

export const useWishlist = create<WishlistState>()(
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
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    { name: "wabil-wishlist" },
  ),
);
