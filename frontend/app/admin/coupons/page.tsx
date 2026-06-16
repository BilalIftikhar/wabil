"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Plus, Ticket, Trash2 } from "lucide-react";
import { type AdminCoupon, adminCoupons } from "@/lib/mock/admin";
import { PageHeader } from "@/components/admin/PageHeader";
import { Drawer } from "@/components/admin/Drawer";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDate } from "@/lib/utils";

const blank: AdminCoupon = { id: "", code: "", type: "percent", value: 10, expiry: "2026-12-31", used: 0, limit: 100, active: true };

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState(adminCoupons);
  const [editing, setEditing] = useState<AdminCoupon | null>(null);
  const [draft, setDraft] = useState<AdminCoupon>(blank);

  const open = (c: AdminCoupon) => {
    setDraft({ ...c });
    setEditing(c);
  };

  const save = () => {
    if (!draft.code) return toast.error("Enter a coupon code");
    if (draft.id) {
      setCoupons((list) => list.map((c) => (c.id === draft.id ? draft : c)));
      toast.success("Coupon updated");
    } else {
      setCoupons((list) => [{ ...draft, id: "c" + (list.length + 1) }, ...list]);
      toast.success("Coupon created");
    }
    setEditing(null);
  };

  const remove = (id: string) => {
    setCoupons((list) => list.filter((c) => c.id !== id));
    toast.success("Coupon deleted");
  };

  const input = "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-rosegold focus:ring-2 focus:ring-rosegold/20";
  const label = "mb-1.5 block text-sm font-medium text-foreground/70";

  return (
    <div>
      <PageHeader
        title="Coupons"
        subtitle={`${coupons.length} promo codes`}
        action={
          <button onClick={() => open({ ...blank })} className="flex items-center gap-2 rounded-xl bg-charcoal px-4 py-2.5 text-sm font-medium text-ivory">
            <Plus size={16} /> New coupon
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {coupons.map((c, i) => {
          const pct = Math.round((c.used / c.limit) * 100);
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl border border-border bg-card p-5 shadow-luxe"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rosegold/15 text-rosegold">
                    <Ticket size={16} />
                  </span>
                  <div>
                    <p className="font-heading text-xl font-semibold tracking-wide">{c.code}</p>
                    <p className="text-xs text-foreground/50">
                      {c.type === "percent" ? `${c.value}% off` : `Rs ${c.value} off`}
                    </p>
                  </div>
                </div>
                <StatusBadge label={c.active ? "active" : "inactive"} color={c.active ? "#A3B18A" : "#8E9AAF"} />
              </div>

              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs text-foreground/55">
                  <span>{c.used} / {c.limit} used</span>
                  <span>Expires {formatDate(c.expiry)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(pct, 100)}%` }} transition={{ delay: i * 0.06 + 0.2 }} className="h-full bg-rosegold" />
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button onClick={() => open(c)} className="flex-1 rounded-lg border border-border py-1.5 text-sm hover:border-rosegold">
                  Edit
                </button>
                <button onClick={() => remove(c.id)} className="rounded-lg border border-border px-2.5 text-foreground/40 hover:border-rose-500 hover:text-rose-500">
                  <Trash2 size={15} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <Drawer
        open={!!editing}
        title={editing?.id ? "Edit coupon" : "New coupon"}
        onClose={() => setEditing(null)}
        footer={
          <div className="flex justify-end gap-3">
            <button onClick={() => setEditing(null)} className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted">
              Cancel
            </button>
            <button onClick={save} className="rounded-xl bg-charcoal px-6 py-2.5 text-sm font-medium text-ivory">
              Save coupon
            </button>
          </div>
        }
      >
        <div className="space-y-5">
          <div>
            <label className={label}>Code</label>
            <input className={`${input} uppercase`} value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })} placeholder="EID20" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Type</label>
              <select className={input} value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as AdminCoupon["type"] })}>
                <option value="percent">Percent (%)</option>
                <option value="fixed">Fixed (Rs)</option>
              </select>
            </div>
            <div>
              <label className={label}>Value</label>
              <input className={input} type="number" value={draft.value} onChange={(e) => setDraft({ ...draft, value: Number(e.target.value) })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Expiry</label>
              <input className={input} type="date" value={draft.expiry} onChange={(e) => setDraft({ ...draft, expiry: e.target.value })} />
            </div>
            <div>
              <label className={label}>Usage limit</label>
              <input className={input} type="number" value={draft.limit} onChange={(e) => setDraft({ ...draft, limit: Number(e.target.value) })} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="accent-rosegold" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} />
            Active
          </label>
        </div>
      </Drawer>
    </div>
  );
}
