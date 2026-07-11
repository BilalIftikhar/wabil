"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Check, Download, Eye, Loader2, Search } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type AdminOrder, ORDER_STATUSES, STATUS_COLOR, adminOrders } from "@/lib/mock/admin";
import { listOrders, updateOrderStatus } from "@/lib/api/admin.supabase";
import { supabaseEnabled } from "@/lib/supabase";
import { useCurrency } from "@/store/useCurrency";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Drawer } from "@/components/admin/Drawer";
import { exportCsv } from "@/lib/export";
import { formatDate } from "@/lib/utils";

export default function AdminOrdersPage() {
  const { format } = useCurrency();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [query, setQuery] = useState("");
  const [viewing, setViewing] = useState<AdminOrder | null>(null);

  const { data: orders = adminOrders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: listOrders,
    enabled: supabaseEnabled,
    staleTime: 30_000,
  });

  const { mutate: setStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AdminOrder["status"] }) =>
      updateOrderStatus(id, status),
    onSuccess: (_, { id, status }) => {
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      setViewing((v) => (v && v.id === id ? { ...v, status } : v));
      toast.success(`Order ${id} → ${status}`);
    },
    onError: () => toast.error("Failed to update order status"),
  });

  const filtered = useMemo(
    () =>
      orders.filter(
        (o) =>
          (!statusFilter || o.status === statusFilter) &&
          (o.id.toLowerCase().includes(query.toLowerCase()) ||
            o.customer.toLowerCase().includes(query.toLowerCase())),
      ),
    [orders, statusFilter, query],
  );

  const inputCls =
    "rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-rosegold";

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle={isLoading ? "Loading…" : `${orders.length} orders`}
        action={
          <button
            onClick={() =>
              exportCsv(
                "wabil-orders.csv",
                filtered.map((o) => ({
                  id: o.id,
                  customer: o.customer,
                  email: o.email,
                  date: o.date,
                  status: o.status,
                  total_pkr: o.totalPkr,
                  items: o.items,
                })),
              )
            }
            className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:border-rosegold"
          >
            <Download size={16} /> Export CSV
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-luxe">
        <div className="relative min-w-[200px] flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search order # or customer…"
            className={`${inputCls} w-full pl-9`}
          />
        </div>
        <select
          className={inputCls}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-rosegold" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-luxe">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-foreground/50">
                <th className="p-3 font-medium">Order</th>
                <th className="p-3 font-medium">Customer</th>
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">Items</th>
                <th className="p-3 font-medium">Total</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((o, i) => (
                <motion.tr
                  key={o.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  className="border-b border-border/60 hover:bg-muted/40"
                >
                  <td className="p-3 font-semibold">#{o.id}</td>
                  <td className="p-3">
                    <p className="font-medium">{o.customer}</p>
                    <p className="text-xs text-foreground/45">{o.email}</p>
                  </td>
                  <td className="p-3 text-foreground/60">{formatDate(o.date)}</td>
                  <td className="p-3 text-foreground/60">{o.items}</td>
                  <td className="p-3 font-medium">{format(o.totalPkr)}</td>
                  <td className="p-3">
                    <select
                      value={o.status}
                      onChange={(e) => setStatus({ id: o.id, status: e.target.value as AdminOrder["status"] })}
                      className="rounded-lg border border-border bg-background px-2 py-1 text-xs outline-none focus:border-rosegold"
                      style={{ color: STATUS_COLOR[o.status] }}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s} className="text-foreground">
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => setViewing(o)} className="rounded-lg p-1.5 hover:bg-muted">
                      <Eye size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-foreground/40">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Drawer
        open={!!viewing}
        title={viewing ? `Order #${viewing.id}` : ""}
        onClose={() => setViewing(null)}
      >
        {viewing && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{viewing.customer}</p>
                <p className="text-sm text-foreground/50">{viewing.email}</p>
              </div>
              <StatusBadge label={viewing.status} color={STATUS_COLOR[viewing.status]} />
            </div>

            <div className="rounded-xl border border-border p-4">
              <div className="flex justify-between text-sm">
                <span className="text-foreground/55">Placed</span>
                <span>{formatDate(viewing.date)}</span>
              </div>
              <div className="mt-1 flex justify-between text-sm">
                <span className="text-foreground/55">Total</span>
                <span className="font-semibold">{format(viewing.totalPkr)}</span>
              </div>
            </div>

            <div>
              <p className="mb-4 text-sm font-semibold">Timeline</p>
              <div className="space-y-0">
                {viewing.timeline.map((t, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full ${t.done ? "bg-rosegold text-white" : "border border-border text-foreground/30"}`}
                      >
                        <Check size={14} />
                      </div>
                      {i < viewing.timeline.length - 1 && (
                        <div
                          className={`w-px flex-1 ${t.done ? "bg-rosegold" : "bg-border"}`}
                          style={{ minHeight: 28 }}
                        />
                      )}
                    </div>
                    <div className="pb-5">
                      <p className={`text-sm font-medium ${t.done ? "" : "text-foreground/40"}`}>
                        {t.label}
                      </p>
                      {t.at && <p className="text-xs text-foreground/45">{t.at}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold">Update status</p>
              <div className="flex flex-wrap gap-2">
                {ORDER_STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus({ id: viewing.id, status: s })}
                    className={`rounded-lg border px-3 py-1.5 text-xs transition ${viewing.status === s ? "border-rosegold bg-rosegold/10 text-rosegold" : "border-border"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
