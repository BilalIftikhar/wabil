"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { products as seedProducts } from "@/lib/mock/products";

// localStorage wrapper that never throws — large media (esp. video base64) can
// blow the quota; we prefer keeping the in-memory session working over crashing.
const safeStorage = {
  getItem: (name: string) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    try {
      localStorage.setItem(name, value);
    } catch {
      /* quota exceeded — media stays in memory for this session only */
    }
  },
  removeItem: (name: string) => {
    try {
      localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};

// Single source of truth shared by the admin panel and the storefront.
// Uploaded media (images/video) are stored as data URLs so they persist in
// localStorage and render on the live site. For production scale, swap the
// upload handler to Supabase Storage and store the returned public URL instead.
export interface Variant {
  size: string;
  color: string;
  stock: number;
}

export interface StoreProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  pricePkr: number;
  comparePkr?: number;
  image: string; // primary
  hoverImage: string; // second image used for the hover crossfade
  images: string[]; // full gallery (includes primary)
  video?: string; // optional product video (data URL or hosted URL)
  rating: number;
  colors: string[];
  sizes: string[];
  badge?: string;
  status: "active" | "draft";
  variants: Variant[];
  seoTitle?: string;
  seoDescription?: string;
}

const seed: StoreProduct[] = seedProducts.map((p) => ({
  ...p,
  images: [p.image, p.hoverImage],
  status: "active" as const,
  variants: p.sizes.map((size) => ({ size, color: p.colors[0] ?? "Default", stock: 10 })),
}));

interface ProductState {
  products: StoreProduct[];
  add: (p: StoreProduct) => void;
  update: (p: StoreProduct) => void;
  remove: (ids: string[]) => void;
  bySlug: (slug: string) => StoreProduct | undefined;
}

export const useProducts = create<ProductState>()(
  persist(
    (set, get) => ({
      products: seed,
      add: (p) => set((s) => ({ products: [p, ...s.products] })),
      update: (p) => set((s) => ({ products: s.products.map((x) => (x.id === p.id ? p : x)) })),
      remove: (ids) => set((s) => ({ products: s.products.filter((x) => !ids.includes(x.id)) })),
      bySlug: (slug) => get().products.find((p) => p.slug === slug),
    }),
    {
      name: "wabil-products",
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      // Rehydrated manually after mount (see Providers) so SSR HTML matches the
      // first client render and there is no hydration mismatch.
      skipHydration: true,
    },
  ),
);

export function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Helper: list of unique active categories for storefront filters.
export function activeProducts(products: StoreProduct[]) {
  return products.filter((p) => p.status === "active");
}
