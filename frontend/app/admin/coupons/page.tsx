"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, Plus, Ticket, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type AdminCoupon, adminCoupons } from "@/lib/mock/admin";
import { listCoupons, saveCoupon, deleteCoupon } from "@/lib/api/admin.supabase";
import { supabaseEnabled } from "@/lib/supabase";
import { PageHeader } from "@/components/admin/PageHeader";
import { Drawer } from "@/components/admin/Drawer";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDate } from "@/lib/utils";

const blank: AdminCoupon = { id: "", code: "", type: "percent", value: 10, expiry: "2026-12-31", used: 0, limit: 100, active: true };

export default function AdminCouponsPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<AdminCoupon | null>(null);
  const [draft, setDraft] = useState<AdminCoupon>(blank);

  const { data: coupons = adminCoupons, isLoading } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: listCoupons,
    enabled: supabaseEnabled,
    staleTime: 30_000,
  });

  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: saveCoupon,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-coupons"] });
      setEditing(null);
      toast.success(draft.id ? "Coupon updated" : "Coupon created");
    },
    onError: () => toast.error("Failed to save coupon"),
  });

  const { mutate: remove } = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast.success("Coupon deleted");
    },
    onError: () => toast.error("Failed to delete coupon"),
  });

  const open = (c: AdminCoupon) => {
    setDraft({ ...c });
    setEditing(c);
  };

  const handleSave = () => {
    if (!draft.code) return toast.error("Enter a coupon code");
    save(draft);
  };

  const input = "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-rosegold focus:ring-2 focus:ring-rosegold/20";
  const label = "mb-1.5 block text-sm font-medium text-foreground/70";

  return (
    <div>
      <PageHeader
        title="Coupons"
        subtitle={isLoading ? "Loading…" : `${coupons.length} promo codes`}
        action={
          <button
            onClick={() => open({ ...blank })}
            className="flex items-center gap-2 rounded-xl bg-charcoal px-4 py-2.5 text-sm font-medium text-ivory"
          >
            <Plus size={16} /> New coupon
          </button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-rosegold" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coupons.map((c, i) => {
            const pct = c.limit > 0 ? Math.round((c.used / c.limit) * 100) : 0;
            return (
              <motion.div
                key={c.id || c.code}
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
                    <span>{c.used} / {c.limit || "∞"} used</span>
                    <span>{c.expiry ? `Expires ${formatDate(c.expiry)}` : "No expiry"}</span>
                  </div>
                  {c.limit > 0 && (
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(pct, 100)}%` }}
                        transition={{ delay: i * 0.06 + 0.2 }}
                        className="h-full bg-rosegold"
                      />
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => open(c)}
                    className="flex-1 rounded-lg border border-border py-1.5 text-sm hover:border-rosegold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(c.id)}
                    className="rounded-lg border border-border px-2.5 text-foreground/40 hover:border-rose-500 hover:text-rose-500"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </motion.div>
            );
          })}
          {coupons.length === 0 && (
            <p className="col-span-full py-12 text-center text-foreground/40">No coupons yet.</p>
          )}
        </div>
      )}

      <Drawer
        open={!!editing}
        title={editing?.id ? "Edit coupon" : "New coupon"}
        onClose={() => setEditing(null)}
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setEditing(null)}
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-charcoal px-6 py-2.5 text-sm font-medium text-ivory disabled:opacity-60"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Save coupon
            </button>
          </div>
        }
      >
        <div className="space-y-5">
          <div>
            <label className={label}>Code</label>
            <input
              className={`${input} uppercase`}
              value={draft.code}
              onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })}
              placeholder="EID20"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Type</label>
              <select
                className={input}
                value={draft.type}
                onChange={(e) => setDraft({ ...draft, type: e.target.value as AdminCoupon["type"] })}
              >
                <option value="percent">Percent (%)</option>
                <option value="fixed">Fixed (Rs)</option>
              </select>
            </div>
            <div>
              <label className={label}>Value</label>
              <input
                className={input}
                type="number"
                value={draft.value}
                onChange={(e) => setDraft({ ...draft, value: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Expiry</label>
              <input
                className={input}
                type="date"
                value={draft.expiry}
                onChange={(e) => setDraft({ ...draft, expiry: e.target.value })}
              />
            </div>
            <div>
              <label className={label}>Usage limit</label>
              <input
                className={input}
                type="number"
                value={draft.limit}
                onChange={(e) => setDraft({ ...draft, limit: Number(e.target.value) })}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="accent-rosegold"
              checked={draft.active}
              onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
            />
            Active
          </label>
        </div>
      </Drawer>
    </div>
  );
}
