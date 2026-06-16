"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/store/useCart";
import { useCurrency } from "@/store/useCurrency";

export function CartDrawer() {
  const { open, setOpen, items, remove, setQty, subtotalPkr } = useCart();
  const { format } = useCurrency();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-card shadow-luxe"
          >
            <div className="flex items-center justify-between border-b border-border p-5">
              <h2 className="font-heading text-2xl font-semibold">Your Bag</h2>
              <button onClick={() => setOpen(false)}>
                <X size={22} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 text-foreground/50">
                <ShoppingBag size={40} />
                <p>Your bag is empty</p>
                <Link href="/shop" onClick={() => setOpen(false)} className="text-rosegold underline">
                  Continue shopping
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-4 overflow-y-auto p-5">
                  {items.map((it) => (
                    <motion.div
                      key={it.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 40 }}
                      className="flex gap-3"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={it.image} alt={it.name} className="h-24 w-20 rounded-lg object-cover" />
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between">
                          <p className="font-medium">{it.name}</p>
                          <button onClick={() => remove(it.id)} className="text-foreground/40 hover:text-rose-500">
                            <X size={16} />
                          </button>
                        </div>
                        <p className="text-xs text-foreground/50">
                          {it.size} · {it.color}
                        </p>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-2 rounded-lg border border-border">
                            <button onClick={() => setQty(it.id, it.qty - 1)} className="px-2 py-1">
                              <Minus size={14} />
                            </button>
                            <span className="text-sm">{it.qty}</span>
                            <button onClick={() => setQty(it.id, it.qty + 1)} className="px-2 py-1">
                              <Plus size={14} />
                            </button>
                          </div>
                          <span className="font-semibold">{format(it.pricePkr * it.qty)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="border-t border-border p-5">
                  <div className="mb-3 flex justify-between">
                    <span className="text-foreground/60">Subtotal</span>
                    <span className="font-heading text-xl font-semibold">{format(subtotalPkr())}</span>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={() => setOpen(false)}
                    className="block rounded-xl bg-charcoal py-3 text-center font-medium text-ivory transition hover:bg-charcoal/90"
                  >
                    Checkout
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
