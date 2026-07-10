// Products data layer. When Supabase is configured, admin writes and storefront
// reads go to the shared `shop_products` table (real, visible to everyone).
// When it isn't, these no-op / return null and the app uses the local store.

import { supabase, supabaseEnabled } from "@/lib/supabase";
import type { StoreProduct } from "@/store/useProducts";

export const productsRemote = supabaseEnabled;

// shop_products row → StoreProduct
function fromRow(r: any): StoreProduct {
  const images: string[] = r.images ?? [];
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    category: r.category,
    pricePkr: Number(r.price_pkr),
    comparePkr: r.compare_pkr != null ? Number(r.compare_pkr) : undefined,
    image: images[0] ?? "",
    hoverImage: images[1] ?? images[0] ?? "",
    images,
    video: r.video ?? undefined,
    colors: r.colors ?? [],
    sizes: r.sizes ?? [],
    badge: r.badge ?? undefined,
    rating: Number(r.rating ?? 5),
    status: r.status,
    variants: r.variants ?? [],
    seoTitle: r.seo_title ?? undefined,
    seoDescription: r.seo_description ?? undefined,
  };
}

// StoreProduct → shop_products row
function toRow(p: StoreProduct) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    price_pkr: p.pricePkr,
    compare_pkr: p.comparePkr ?? null,
    images: p.images,
    video: p.video ?? null,
    colors: p.colors,
    sizes: p.sizes,
    badge: p.badge ?? null,
    rating: p.rating,
    status: p.status,
    variants: p.variants,
    seo_title: p.seoTitle ?? null,
    seo_description: p.seoDescription ?? null,
  };
}

/** Returns all products, or null when Supabase isn't configured. */
export async function fetchProducts(): Promise<StoreProduct[] | null> {
  if (!supabaseEnabled || !supabase) return null;
  const { data, error } = await supabase.from("shop_products").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function saveProduct(p: StoreProduct): Promise<void> {
  if (!supabaseEnabled || !supabase) return;
  const { error } = await supabase.from("shop_products").upsert(toRow(p));
  if (error) throw error;
}

export async function deleteProducts(ids: string[]): Promise<void> {
  if (!supabaseEnabled || !supabase) return;
  const { error } = await supabase.from("shop_products").delete().in("id", ids);
  if (error) throw error;
}
