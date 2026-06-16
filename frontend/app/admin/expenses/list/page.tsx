"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowUpDown, Download, Search, Trash2 } from "lucide-react";
import {
  type ExpenseFilters,
  categories,
  deleteExpenses,
  listExpenses,
  members,
} from "@/lib/api/expenses";
import { useCurrency } from "@/store/useCurrency";
import { CategoryIcon } from "@/components/admin/CategoryIcon";
import { MemberAvatar } from "@/components/admin/MemberAvatar";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { Skeleton } from "@/components/ui/Skeleton";
import { exportCsv } from "@/lib/export";
import { formatDate } from "@/lib/utils";

export default function ExpenseListPage() {
  const { format } = useCurrency();
  const qc = useQueryClient();

  const [filters, setFilters] = useState<ExpenseFilters>({ sort: "date", dir: "desc" });
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [confirm, setConfirm] = useState<{ open: boolean; ids: number[] }>({ open: false, ids: [] });

  const { data, isLoading } = useQuery({
    queryKey: ["expenses", filters, search],
    queryFn: () => listExpenses({ ...filters, search: search || undefined }),
  });

  const del = useMutation({
    mutationFn: (ids: number[]) => deleteExpenses(ids),
    onSuccess: (_, ids) => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["expense-overview"] });
      setSelected((s) => s.filter((id) => !ids.includes(id)));
      toast.success(`Deleted ${ids.length} expense${ids.length > 1 ? "s" : ""}`);
    },
  });

  const toggleSort = (col: "date" | "amount_pkr") =>
    setFilters((f) => ({
      ...f,
      sort: col,
      dir: f.sort === col && f.dir === "desc" ? "asc" : "desc",
    }));

  const allSelected = !!data?.length && selected.length === data.length;

  const inputCls =
    "rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-rosegold";

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-luxe">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            className={`${inputCls} w-full pl-9`}
            placeholder="Search title or tags…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className={inputCls}
          value={filters.category ?? ""}
          onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value ? Number(e.target.value) : undefined }))}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          className={inputCls}
          value={filters.payment_method ?? ""}
          onChange={(e) => setFilters((f) => ({ ...f, payment_method: e.target.value || undefined }))}
        >
          <option value="">All methods</option>
          {["cash", "card", "bank", "jazzcash", "easypaisa"].map((m) => (
            <option key={m} value={m} className="capitalize">
              {m}
            </option>
          ))}
        </select>
        <select
          className={inputCls}
          value={filters.member ?? ""}
          onChange={(e) => setFilters((f) => ({ ...f, member: e.target.value ? Number(e.target.value) : undefined }))}
        >
          <option value="">All members</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          className={inputCls}
          value={filters.from ?? ""}
          onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value || undefined }))}
        />
        <input
          type="date"
          className={inputCls}
          value={filters.to ?? ""}
          onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value || undefined }))}
        />
        <button
          onClick={() =>
            exportCsv(
              "wabil-expenses.csv",
              (data ?? []).map((e) => ({
                title: e.title,
                category: e.category.name,
                amount_pkr: e.amount_pkr,
                date: e.date,
                payment_method: e.payment_method,
                added_by: e.addedBy.name,
                split: e.split ? e.split.shares.map((s) => `${members.find((m) => m.id === s.memberId)?.name}:${s.amount_pkr}`).join(" | ") : "",
                tags: e.tags.join("|"),
              })),
            )
          }
          className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm hover:border-rosegold"
        >
          <Download size={16} /> CSV
        </button>
      </div>

      {/* Bulk bar */}
      {selected.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between rounded-xl bg-charcoal px-4 py-2.5 text-ivory"
        >
          <span className="text-sm">{selected.length} selected</span>
          <button
            onClick={() => setConfirm({ open: true, ids: selected })}
            className="flex items-center gap-1.5 rounded-lg bg-rose-500 px-3 py-1.5 text-sm"
          >
            <Trash2 size={14} /> Delete selected
          </button>
        </motion.div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-luxe">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-foreground/50">
              <th className="p-3">
                <input
                  type="checkbox"
                  className="accent-rosegold"
                  checked={allSelected}
                  onChange={(e) => setSelected(e.target.checked ? (data ?? []).map((x) => x.id) : [])}
                />
              </th>
              <th className="p-3 font-medium">Title</th>
              <th className="p-3 font-medium">Category</th>
              <th className="p-3 font-medium">Added by</th>
              <th className="p-3 font-medium">Method</th>
              <th className="p-3 font-medium">
                <button onClick={() => toggleSort("date")} className="inline-flex items-center gap-1">
                  Date <ArrowUpDown size={12} />
                </button>
              </th>
              <th className="p-3 text-right font-medium">
                <button onClick={() => toggleSort("amount_pkr")} className="inline-flex items-center gap-1">
                  Amount <ArrowUpDown size={12} />
                </button>
              </th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-border/60">
                  <td colSpan={8} className="p-2">
                    <Skeleton className="h-9 w-full" />
                  </td>
                </tr>
              ))}
            {data?.map((e, i) => (
              <motion.tr
                key={e.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                className="border-b border-border/60 hover:bg-muted/40"
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    className="accent-rosegold"
                    checked={selected.includes(e.id)}
                    onChange={(ev) =>
                      setSelected((s) => (ev.target.checked ? [...s, e.id] : s.filter((id) => id !== e.id)))
                    }
                  />
                </td>
                <td className="p-3 font-medium">
                  <div className="flex items-center gap-2">
                    {e.title}
                    {e.split && (
                      <span className="rounded-full bg-rosegold/15 px-2 py-0.5 text-[10px] font-medium text-rosegold" title={e.split.shares.map((s) => `${members.find((m) => m.id === s.memberId)?.name}: Rs ${s.amount_pkr.toLocaleString()}`).join("\n")}>
                        Split ×{e.split.shares.length}
                      </span>
                    )}
                  </div>
                  {e.tags.length > 0 && (
                    <span className="text-xs text-foreground/40">{e.tags.map((t) => `#${t}`).join(" ")}</span>
                  )}
                </td>
                <td className="p-3">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                    style={{ backgroundColor: `${e.category.color_hex}22`, color: e.category.color_hex }}
                  >
                    <CategoryIcon name={e.category.icon} size={12} />
                    {e.category.name}
                  </span>
                </td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-2">
                    <MemberAvatar member={e.addedBy} size={24} />
                    <span className="text-foreground/70">{e.addedBy.name.split(" ")[0]}</span>
                  </span>
                </td>
                <td className="p-3 capitalize text-foreground/60">{e.payment_method}</td>
                <td className="p-3 text-foreground/60">{formatDate(e.date)}</td>
                <td className="p-3 text-right font-semibold">{format(e.amount_pkr)}</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => setConfirm({ open: true, ids: [e.id] })}
                    className="rounded-lg p-1.5 text-foreground/40 hover:bg-rose-500/10 hover:text-rose-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </motion.tr>
            ))}
            {data?.length === 0 && !isLoading && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-foreground/40">
                  No expenses match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={confirm.open}
        title="Delete expense"
        message={`This will permanently remove ${confirm.ids.length} expense${confirm.ids.length > 1 ? "s" : ""}.`}
        onClose={() => setConfirm({ open: false, ids: [] })}
        onConfirm={() => {
          del.mutate(confirm.ids);
          setConfirm({ open: false, ids: [] });
        }}
      />
    </div>
  );
}
