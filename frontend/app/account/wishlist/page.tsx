"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, ShoppingBag, X } from "lucide-react";
import { toast } from "sonner";
import { useWishlist } from "@/store/useWishlist";
import { useCart } from "@/store/useCart";
import { useCurrency } from "@/store/useCurrency";

export default function AccountWishlist() {
  const { items, remove } = useWishlist();
  const addToCart = useCart((s) => s.add);
  const { format } = useCurrency();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-foreground/50">
        <Heart size={36} />
        <p>No saved items yet</p>
        <Link href="/shop" className="text-rosegold underline">
          Browse the collection
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-2xl font-semibold">Saved Items</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <AnimatePresence>
          {items.map((it) => (
            <motion.div key={it.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <div className="relative overflow-hidden rounded-2xl bg-muted">
                <Link href={`/shop/${it.slug}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.image} alt={it.name} className="aspect-[3/4] w-full object-cover" />
                </Link>
                <button onClick={() => remove(it.id)} className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur hover:text-rose-500">
                  <X size={14} />
                </button>
              </div>
              <p className="mt-2 text-sm font-medium">{it.name}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{format(it.pricePkr)}</span>
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
                  className="text-rosegold hover:text-charcoal"
                >
                  <ShoppingBag size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
