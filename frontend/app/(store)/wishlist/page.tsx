"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, ShoppingBag, X } from "lucide-react";
import { toast } from "sonner";
import { useWishlist } from "@/store/useWishlist";
import { useCart } from "@/store/useCart";
import { useCurrency } from "@/store/useCurrency";

export default function WishlistPage() {
  const { items, remove } = useWishlist();
  const addToCart = useCart((s) => s.add);
  const { format } = useCurrency();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="mb-1 font-heading text-4xl font-semibold">My Wishlist</h1>
      <p className="mb-8 text-foreground/55">{items.length} saved pieces</p>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-20 text-foreground/50">
          <Heart size={40} />
          <p>Your wishlist is empty</p>
          <Link href="/shop" className="text-rosegold underline">
            Discover the collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <AnimatePresence>
            {items.map((it) => (
              <motion.div
                key={it.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group"
              >
                <div className="relative overflow-hidden rounded-2xl bg-muted">
                  <Link href={`/shop/${it.slug}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={it.image} alt={it.name} className="aspect-[3/4] w-full object-cover" />
                  </Link>
                  <button
                    onClick={() => remove(it.id)}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur hover:text-rose-500"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="mt-3 space-y-2">
                  <Link href={`/shop/${it.slug}`} className="block font-medium hover:text-rosegold">
                    {it.name}
                  </Link>
                  <span className="font-semibold">{format(it.pricePkr)}</span>
                  <button
                    onClick={() => {
                      addToCart({
                        id: `${it.id}-default`,
                        productId: it.id,
                        name: it.name,
                        image: it.image,
                        pricePkr: it.pricePkr,
                        size: "M",
                        color: "Default",
                        qty: 1,
                      });
                      remove(it.id);
                      toast.success("Moved to bag");
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-charcoal py-2.5 text-sm font-medium text-ivory transition hover:bg-charcoal/90"
                  >
                    <ShoppingBag size={15} /> Move to Bag
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
