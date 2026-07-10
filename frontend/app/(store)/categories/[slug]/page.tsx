"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/store/ProductCard";
import { activeProducts, useProducts } from "@/store/useProducts";

// Match a URL slug (e.g. "bridal") to a product category label.
function labelFor(slug: string) {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const all = useProducts((s) => s.products);
  const label = labelFor(params.slug);

  const items = useMemo(
    () => activeProducts(all).filter((p) => p.category.toLowerCase() === params.slug.toLowerCase()),
    [all, params.slug],
  );

  const banner =
    items[0]?.image ??
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1600&q=80";

  return (
    <div>
      {/* Category banner */}
      <section className="relative flex h-64 items-center justify-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={banner} alt={label} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-charcoal/45" />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 text-center text-ivory">
          <p className="text-sm uppercase tracking-[0.3em] text-blush">WABIL Collection</p>
          <h1 className="mt-1 font-heading text-5xl font-semibold">{label}</h1>
        </motion.div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-20 text-center text-foreground/50">
            <p className="font-heading text-2xl">Nothing here yet</p>
            <p className="mt-1 text-sm">New pieces for “{label}” are on the way.</p>
            <Link href="/shop" className="mt-4 inline-block text-rosegold underline">
              Browse all products
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-6 text-foreground/55">{items.length} pieces</p>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
