"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Truck } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type AdminShipping, adminShipping } from "@/lib/mock/admin";
import { listShipping, saveShipping, deleteShipping } from "@/lib/api/admin.supabase";
import { supabaseEnabled } from "@/lib/supabase";
import { useCurrency } from "@/store/useCurrency";
import { PageHeader } from "@/components/admin/PageHeader";
import { Drawer } from "@/components/admin/Drawer";

const blank: AdminShipping = { id: "", name: "", pricePkr: 0, etaDays: "", active: true };

export default function AdminShippingPage() {
  const { format } = useCurrency();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<AdminShipping | null>(null);
  const [draft, setDraft] = useState<AdminShipping>(blank);

  const { data: methods = adminShipping, isLoading } = useQuery({
    queryKey: ["admin-shipping"],
    queryFn: listShipping,
    enabled: supabaseEnabled,
    staleTime: 60_000,
  });

  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: saveShipping,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-shipping"] });
      setEditing(null);
      toast.success(draft.id ? "Method updated" : "Method added");
    },
    onError: () => toast.error("Failed to save shipping method"),
  });

  const { mutate: remove } = useMutation({
    mutationFn: deleteShipping,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-shipping"] });
      toast.success("Method deleted");
    },
    onError: () => toast.error("Failed to delete shipping method"),
  });

  const { mutate: toggleActive } = useMutation({
    mutationFn: (m: AdminShipping) => saveShipping({ ...m, active: !m.active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-shipping"] }),
    onError: () => toast.error("Failed to update method"),
  });

  const open = (m: AdminShipping) => {
    setDraft({ ...m });
    setEditing(m);
  };

  const handleSave = () => {
    if (!draft.name) return toast.error("Enter a method name");
    save(draft);
  };

  const input = "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-rosegold focus:ring-2 focus:ring-rosegold/20";
  const labelCls = "mb-1.5 block text-sm font-medium text-foreground/70";

  return (
    <div>
      <PageHeader
        title="Shipping"
        subtitle="Delivery methods & rates"
        action={
          <button
            onClick={() => open({ ...blank })}
            className="flex items-center gap-2 rounded-xl bg-charcoal px-4 py-2.5 text-sm font-medium text-ivory"
          >
            <Plus size={16} /> New method
          </button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-rosegold" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {methods.map((m, i) => (
            <motion.div
              key={m.id || m.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl border border-border bg-card p-5 shadow-luxe"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-rosegold/15 text-rosegold">
                  <Truck size={18} />
                </span>
                <button
                  onClick={() => toggleActive(m)}
                  className={`relative h-6 w-11 rounded-full transition ${m.active ? "bg-rosegold" : "bg-muted"}`}
                >
                  <motion.span
                    className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
                    animate={{ left: m.active ? 22 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
              <p className="mt-3 font-medium">{m.name}</p>
              <p className="text-sm text-foreground/50">{m.etaDays}</p>
              <p className="mt-2 font-heading text-xl font-semibold">
                {m.pricePkr === 0 ? "Free" : format(m.pricePkr)}
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => open(m)}
                  className="flex-1 rounded-lg border border-border py-1.5 text-sm hover:border-rosegold"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(m.id)}
                  className="rounded-lg border border-border px-2.5 text-foreground/40 hover:border-rose-500 hover:text-rose-500"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </motion.div>
          ))}
          {methods.length === 0 && (
            <p className="col-span-full py-12 text-center text-foreground/40">No shipping methods yet.</p>
          )}
        </div>
      )}

      <Drawer
        open={!!editing}
        title={editing?.id ? "Edit method" : "New method"}
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
              Save
            </button>
          </div>
        }
      >
        <div className="space-y-5">
          <div>
            <label className={labelCls}>Method name</label>
            <input
              className={input}
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Express (Leopards)"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Price (PKR)</label>
              <input
                className={input}
                type="number"
                value={draft.pricePkr}
                onChange={(e) => setDraft({ ...draft, pricePkr: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className={labelCls}>Estimated days</label>
              <input
                className={input}
                value={draft.etaDays}
                onChange={(e) => setDraft({ ...draft, etaDays: e.target.value })}
                placeholder="1–2 days"
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
