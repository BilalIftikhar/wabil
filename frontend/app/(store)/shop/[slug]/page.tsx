"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { Minus, Plus, Star, Truck } from "lucide-react";
import { toast } from "sonner";
import { products } from "@/lib/mock/products";
import { useCart } from "@/store/useCart";
import { useCurrency } from "@/store/useCurrency";
import { ProductCard } from "@/components/store/ProductCard";

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = products.find((p) => p.slug === params.slug);
  const { format } = useCurrency();
  const add = useCart((s) => s.add);

  const [size, setSize] = useState(product?.sizes[0] ?? "");
  const [colorIdx, setColorIdx] = useState(0);
  const [qty, setQty] = useState(1);

  if (!product) return notFound();

  const gallery = [product.image, product.hoverImage, product.image];
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div className="grid grid-cols-[80px_1fr] gap-4">
          <div className="flex flex-col gap-3">
            {gallery.map((g, i) => (
              <button key={i} className="overflow-hidden rounded-xl border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g} alt="" className="aspect-[3/4] w-full object-cover" />
              </button>
            ))}
          </div>
          <motion.div layout className="overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.image} alt={product.name} className="aspect-[3/4] w-full object-cover" />
          </motion.div>
        </div>

        {/* Details */}
        <div>
          <p className="text-sm uppercase tracking-wide text-foreground/45">{product.category}</p>
          <h1 className="mt-1 font-heading text-4xl font-semibold">{product.name}</h1>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className="flex items-center gap-0.5 text-rosegold">
              <Star size={15} className="fill-rosegold" /> {product.rating}
            </span>
            <span className="text-foreground/40">· 128 reviews</span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="font-heading text-3xl font-semibold">{format(product.pricePkr)}</span>
            {product.comparePkr && (
              <span className="text-lg text-foreground/40 line-through">{format(product.comparePkr)}</span>
            )}
          </div>

          {/* Colors */}
          <div className="mt-6">
            <p className="mb-2 text-sm font-medium">Color</p>
            <div className="flex gap-2">
              {product.colors.map((c, i) => (
                <button
                  key={c}
                  onClick={() => setColorIdx(i)}
                  className={`h-9 w-9 rounded-full border-2 transition ${colorIdx === i ? "border-rosegold" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div className="mt-6">
            <div className="mb-2 flex justify-between text-sm">
              <span className="font-medium">Size</span>
              <button onClick={() => toast("Size guide opening…")} className="text-rosegold hover:underline">
                Size guide
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`min-w-[48px] rounded-xl border px-3 py-2 text-sm transition ${
                    size === s ? "border-rosegold bg-rosegold/10 text-rosegold" : "border-border"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Qty + add */}
          <div className="mt-8 flex gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-border px-3">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}>
                <Minus size={16} />
              </button>
              <span className="w-6 text-center">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)}>
                <Plus size={16} />
              </button>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                add({
                  id: `${product.id}-${size}-${colorIdx}`,
                  productId: product.id,
                  name: product.name,
                  image: product.image,
                  pricePkr: product.pricePkr,
                  size,
                  color: product.colors[colorIdx],
                  qty,
                });
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
