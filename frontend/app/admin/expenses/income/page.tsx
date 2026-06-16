"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { createIncome, listIncome } from "@/lib/api/expenses";
import { useCurrency } from "@/store/useCurrency";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/utils";
import { REFERENCE_TODAY } from "@/lib/mock/expenses";

export default function IncomePage() {
  const { format } = useCurrency();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["income"], queryFn: listIncome });

  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(REFERENCE_TODAY.toISOString().slice(0, 10));
  const [note, setNote] = useState("");

  const mutation = useMutation({
    mutationFn: () => createIncome({ source, amount_pkr: parseFloat(amount), date, note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["income"] });
      qc.invalidateQueries({ queryKey: ["expense-overview"] });
      toast.success("Income recorded");
      setSource("");
      setAmount("");
      setNote("");
    },
  });

  const total = data?.reduce((s, i) => s + i.amount_pkr, 0) ?? 0;
  const inputCls =
    "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-rosegold focus:ring-2 focus:ring-rosegold/20";

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!source || !amount) return toast.error("Source and amount required");
          mutation.mutate();
        }}
        className="h-fit rounded-2xl border border-border bg-card p-6 shadow-luxe"
      >
        <h2 className="mb-5 font-heading text-2xl font-semibold">Add Income</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground/70">Source</label>
            <input className={inputCls} value={source} onChange={(e) => setSource(e.target.value)} placeholder="Online store sales" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground/70">Amount (PKR)</label>
            <input className={inputCls} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground/70">Date</label>
            <input className={inputCls} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground/70">Note</label>
            <textarea className={inputCls} rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={mutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            <Plus size={18} /> {mutation.isPending ? "Saving…" : "Add Income"}
          </motion.button>
        </div>
      </form>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-luxe">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-2xl font-semibold">Income History</h2>
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-600">
            Total {format(total)}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-foreground/50">
                <th className="py-2 font-medium">Source</th>
                <th className="py-2 font-medium">Date</th>
                <th className="py-2 font-medium">Note</th>
                <th className="py-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={4} className="p-2">
                      <Skeleton className="h-8 w-full" />
                    </td>
                  </tr>
                ))}
              {data?.map((row, i) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-border/60"
                >
                  <td className="py-2.5 font-medium">{row.source}</td>
                  <td className="py-2.5 text-foreground/55">{formatDate(row.date)}</td>
                  <td className="py-2.5 text-foreground/55">{row.note || "—"}</td>
                  <td className="py-2.5 text-right font-semibold text-emerald-600">{format(row.amount_pkr)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
