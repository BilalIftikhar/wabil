"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { categories, getOverview, listBudgets, upsertBudget } from "@/lib/api/expenses";
import { useCurrency } from "@/store/useCurrency";
import { CategoryIcon } from "@/components/admin/CategoryIcon";
import { monthName } from "@/lib/utils";
import { REFERENCE_TODAY } from "@/lib/mock/expenses";

export default function BudgetsPage() {
  const { format } = useCurrency();
  const qc = useQueryClient();
  const { data: budgets } = useQuery({ queryKey: ["budgets"], queryFn: listBudgets });
  const { data: overview } = useQuery({ queryKey: ["expense-overview"], queryFn: getOverview });

  const [categoryId, setCategoryId] = useState(categories[0].id);
  const [month, setMonth] = useState(REFERENCE_TODAY.getMonth() + 1);
  const [year, setYear] = useState(REFERENCE_TODAY.getFullYear());
  const [amount, setAmount] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      upsertBudget({
        category: categories.find((c) => c.id === categoryId)!,
        month,
        year,
        budget_amount: parseFloat(amount),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Budget saved");
      setAmount("");
    },
  });

  const spentFor = (name: string) => overview?.by_category.find((c) => c.category === name)?.total ?? 0;
  const inputCls =
    "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-rosegold focus:ring-2 focus:ring-rosegold/20";

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!amount) return toast.error("Enter a budget amount");
          mutation.mutate();
        }}
        className="h-fit rounded-2xl border border-border bg-card p-6 shadow-luxe"
      >
        <h2 className="mb-5 font-heading text-2xl font-semibold">Set Budget</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground/70">Category</label>
            <select className={inputCls} value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground/70">Month</label>
              <select className={inputCls} value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {monthName(i + 1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground/70">Year</label>
              <input className={inputCls} type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground/70">Budget (PKR)</label>
            <input className={inputCls} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="w-full rounded-xl bg-charcoal py-3 font-medium text-ivory hover:bg-charcoal/90"
          >
            Save Budget
          </motion.button>
        </div>
      </form>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-luxe">
        <h2 className="mb-5 font-heading text-2xl font-semibold">Budget vs Actual — {monthName(REFERENCE_TODAY.getMonth() + 1)}</h2>
        <div className="space-y-5">
          {budgets?.map((b, i) => {
            const spent = spentFor(b.category.name);
            const pct = Math.round((spent / b.budget_amount) * 100);
            const over = pct > 100;
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium">
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-md"
                      style={{ backgroundColor: `${b.category.color_hex}22`, color: b.category.color_hex }}
                    >
                      <CategoryIcon name={b.category.icon} size={13} />
                    </span>
                    {b.category.name}
                    {over && (
                      <span className="flex items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-xs text-rose-500">
                        <AlertTriangle size={11} /> Over budget
                      </span>
                    )}
                  </span>
                  <span className={over ? "font-semibold text-rose-500" : "text-foreground/60"}>
                    {format(spent)} / {format(b.budget_amount)} · {pct}%
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(pct, 100)}%` }}
                    transition={{ type: "spring", stiffness: 55, damping: 16, delay: i * 0.05 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: over ? "#ef4444" : b.category.color_hex }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
