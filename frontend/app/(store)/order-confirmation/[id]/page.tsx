"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Package, Truck, Home, ClipboardCheck } from "lucide-react";

const STAGES = [
  { label: "Order Placed", icon: ClipboardCheck, done: true },
  { label: "Processing", icon: Package, done: true },
  { label: "Shipped", icon: Truck, done: false },
  { label: "Delivered", icon: Home, done: false },
];

export default function OrderConfirmation({ params }: { params: { id: string } }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600"
      >
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.25, type: "spring" }}>
          <Check size={40} />
        </motion.span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 font-heading text-4xl font-semibold"
      >
        Thank you for your order
      </motion.h1>
      <p className="mt-2 text-foreground/55">
        Order <span className="font-semibold text-rosegold">#{params.id}</span> is confirmed. A receipt is on its way to your inbox.
      </p>

      {/* Tracking timeline */}
      <div className="mt-12 rounded-2xl border border-border bg-card p-8 shadow-luxe">
        <h2 className="mb-8 text-left font-heading text-xl font-semibold">Order Tracking</h2>
        <div className="flex items-center justify-between">
          {STAGES.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="relative flex flex-1 flex-col items-center last:flex-none">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.15 }}
                  className={`z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 ${
                    s.done ? "border-rosegold bg-rosegold text-white" : "border-border bg-card text-foreground/40"
                  }`}
                >
                  <Icon size={18} />
                </motion.div>
                <span className={`mt-2 text-xs font-medium ${s.done ? "" : "text-foreground/40"}`}>{s.label}</span>
                {i < STAGES.length - 1 && (
                  <div className="absolute left-1/2 top-5 h-0.5 w-full bg-border">
                    <motion.div
                      className="h-full bg-rosegold"
                      initial={{ width: 0 }}
                      animate={{ width: STAGES[i + 1].done ? "100%" : "0%" }}
                      transition={{ delay: 0.5 + i * 0.15 }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Link href="/account" className="rounded-xl border border-border px-6 py-2.5 text-sm font-medium hover:bg-muted">
          View my orders
        </Link>
        <Link href="/shop" className="rounded-xl bg-charcoal px-6 py-2.5 text-sm font-medium text-ivory hover:bg-charcoal/90">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
