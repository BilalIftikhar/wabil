"use client";

import { motion } from "framer-motion";
import { useCurrency } from "@/store/useCurrency";
import { STATUS_COLOR, customerOrders } from "@/lib/mock/orders";
import { formatDate } from "@/lib/utils";

export default function OrdersPage() {
  const { format } = useCurrency();

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-2xl font-semibold">Order History</h2>
      {customerOrders.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-foreground/50">
          <p className="font-heading text-xl">No orders yet</p>
          <p className="mt-1 text-sm">Your past orders will show up here.</p>
        </div>
      )}
      {customerOrders.map((o, i) => (
        <motion.div
          key={o.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="rounded-2xl border border-border bg-card p-5 shadow-luxe"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <p className="font-semibold">#{o.id}</p>
              <p className="text-sm text-foreground/50">Placed {formatDate(o.date)}</p>
            </div>
            <span
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{ backgroundColor: `${STATUS_COLOR[o.status]}22`, color: STATUS_COLOR[o.status] }}
            >
              {o.status}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3">
            <div className="flex gap-2">
              {o.items.map((it, j) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={j} src={it.image} alt={it.name} className="h-16 w-12 rounded-lg object-cover" />
              ))}
            </div>
            <div className="text-right">
              <p className="text-sm text-foreground/55">{o.items.reduce((n, it) => n + it.qty, 0)} items</p>
              <p className="font-heading text-xl font-semibold">{format(o.totalPkr)}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
