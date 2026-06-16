"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/mock/products";
import { useCart } from "@/store/useCart";
import { useCurrency } from "@/store/useCurrency";
import { useWishlist } from "@/store/useWishlist";

export function ProductCard({ product }: { product: Product }) {
  const { format } = useCurrency();
  const add = useCart((s) => s.add);
  const { has, toggle } = useWishlist();
  const [hover, setHover] = useState(false);
  const liked = has(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group"
    >
      <div className="relative overflow-hidden rounded-2xl bg-muted">
        <Link href={`/shop/${product.slug}`}>
          <div className="relative aspect-[3/4]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.image} alt={product.name} className="absolute inset-0 h-full w-full object-cover" />
            <motion.img
              src={product.hoverImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              animate={{ opacity: hover ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </Link>

        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-charcoal px-2.5 py-1 text-xs font-medium text-ivory">
            {product.badge}
          </span>
        )}

        <button
          onClick={() => {
            const nowLiked = toggle({
              id: product.id,
              slug: product.slug,
              name: product.name,
              image: product.image,
              pricePkr: product.pricePkr,
              comparePkr: product.comparePkr,
            });
            toast(nowLiked ? "Added to wishlist ♥" : "Removed from wishlist");
          }}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur"
        >
          <motion.span animate={liked ? { scale: [1, 1.4, 1] } : {}}>
            <Heart size={16} className={liked ? "fill-rosegold text-rosegold" : ""} />
          </motion.span>
        </button>

        <AnimatePresence>
          {hover && (
            <motion.button
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              onClick={() =>
                add({
                  id: `${product.id}-${product.sizes[0]}`,
                  productId: product.id,
                  name: product.name,
                  image: product.image,
                  pricePkr: product.pricePkr,
                  size: product.sizes[0],
                  color: "Default",
                  qty: 1,
                })
              }
              className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-2 rounded-xl bg-charcoal py-2.5 text-sm font-medium text-ivory"
            >
              <ShoppingBag size={16} /> Add to Bag
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-3 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-foreground/45">{product.category}</p>
          <span className="flex items-center gap-0.5 text-xs text-foreground/55">
            <Star size={12} className="fill-rosegold text-rosegold" /> {product.rating}
          </span>
        </div>
        <Link href={`/shop/${product.slug}`} className="block font-medium hover:text-rosegold">
          {product.name}
        </Link>
        <div className="flex items-center gap-2">
          <span className="font-semibold">{format(product.pricePkr)}</span>
          {product.comparePkr && (
            <span className="text-sm text-foreground/40 line-through">{format(product.comparePkr)}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
