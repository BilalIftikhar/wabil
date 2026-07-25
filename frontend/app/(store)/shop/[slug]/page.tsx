"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Minus, Plus, Star, Truck } from "lucide-react";
import { toast } from "sonner";
import { activeProducts, useProducts } from "@/store/useProducts";
import { useCart } from "@/store/useCart";
import { useCurrency } from "@/store/useCurrency";
import { ProductCard } from "@/components/store/ProductCard";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ProductPage({ params }: { params: { slug: string } }) {
  const { format } = useCurrency();
  const add = useCart((s) => s.add);
  const all = useProducts((s) => s.products);
  const product = all.find((p) => p.slug === params.slug);

  const [mounted, setMounted] = useState(false);
  const [size, setSize] = useState("");
  const [colorIdx, setColorIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeMedia, setActiveMedia] = useState(0);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (product && !size) setSize(product.sizes[0] ?? "");
  }, [product, size]);

  // Before hydration completes we can't be sure a product is truly missing.
  if (!mounted && !product) {
    return (
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-10 lg:grid-cols-2">
        <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="font-heading text-3xl font-semibold">Product not found</h1>
        <p className="mt-2 text-foreground/55">This piece may have sold out or been unpublished.</p>
        <Link href="/shop" className="mt-6 inline-block rounded-xl bg-charcoal px-6 py-2.5 text-sm font-medium text-ivory">
          Back to shop
        </Link>
      </div>
    );
  }

  const gallery = product.images.length ? product.images : [product.image];
  const media: { type: "image" | "video"; src: string }[] = [
    ...gallery.map((src) => ({ type: "image" as const, src })),
    ...(product.video ? [{ type: "video" as const, src: product.video }] : []),
  ];
  const current = media[activeMedia] ?? media[0];
  const related = activeProducts(all).filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div className="grid grid-cols-[80px_1fr] gap-4">
          <div className="flex flex-col gap-3">
            {media.map((m, i) => (
              <button key={i} onClick={() => setActiveMedia(i)} className={`relative overflow-hidden rounded-xl border ${activeMedia === i ? "border-rosegold" : "border-border"}`}>
                {m.type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.src} alt="" className="aspect-[3/4] w-full object-cover" />
                ) : (
                  <div className="flex aspect-[3/4] w-full items-center justify-center bg-charcoal text-[10px] font-medium text-ivory">▶ VIDEO</div>
                )}
              </button>
            ))}
          </div>
          <motion.div key={activeMedia} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden rounded-2xl">
            {current.type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={current.src} alt={product.name} className="aspect-[3/4] w-full object-cover" />
            ) : (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video src={current.src} controls autoPlay muted loop className="aspect-[3/4] w-full bg-black object-contain" />
            )}
          </motion.div>
        </div>

        {/* Details */}
        <div>
          <p className="text-sm uppercase tracking-wide text-foreground/45">{product.category}</p>
          <h1 className="mt-1 font-heading text-4xl font-semibold">{product.name}</h1>
          {product.rating > 0 && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="flex items-center gap-0.5 text-rosegold">
                <Star size={15} className="fill-rosegold" /> {product.rating}
              </span>
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <span className="font-heading text-3xl font-semibold">{format(product.pricePkr)}</span>
            {product.comparePkr && <span className="text-lg text-foreground/40 line-through">{format(product.comparePkr)}</span>}
          </div>

          <div className="mt-6">
            <p className="mb-2 text-sm font-medium">Color</p>
            <div className="flex gap-2">
              {product.colors.map((c, i) => (
                <button key={c + i} onClick={() => setColorIdx(i)} className={`h-9 w-9 rounded-full border-2 transition ${colorIdx === i ? "border-rosegold" : "border-transparent"}`} style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex justify-between text-sm">
              <span className="font-medium">Size</span>
              <button onClick={() => toast("Size guide opening…")} className="text-rosegold hover:underline">Size guide</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button key={s} onClick={() => setSize(s)} className={`min-w-[48px] rounded-xl border px-3 py-2 text-sm transition ${size === s ? "border-rosegold bg-rosegold/10 text-rosegold" : "border-border"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-border px-3">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus size={16} /></button>
              <span className="w-6 text-center">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)}><Plus size={16} /></button>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                add({ id: `${product.id}-${size}-${colorIdx}`, productId: product.id, name: product.name, image: product.image, pricePkr: product.pricePkr, size, color: product.colors[colorIdx], qty });
                toast.success("Added to bag");
              }}
              className="flex-1 rounded-xl bg-charcoal py-3 font-medium text-ivory hover:bg-charcoal/90"
            >
              Add to Bag
            </motion.button>
          </div>

          <div className="mt-6 flex items-center gap-2 rounded-xl bg-muted p-4 text-sm text-foreground/65">
            <Truck size={18} className="text-rosegold" />
            Free delivery on orders over Rs 15,000 · 7-day easy returns
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 font-heading text-3xl font-semibold">You may also love</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
