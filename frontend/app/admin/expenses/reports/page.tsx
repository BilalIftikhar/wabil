"use client";

import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Printer } from "lucide-react";
import { getOverview } from "@/lib/api/expenses";
import { useCurrency } from "@/store/useCurrency";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ReportsPage() {
  const { format, code, rates } = useCurrency();
  const { data, isLoading } = useQuery({ queryKey: ["expense-overview"], queryFn: getOverview });

  if (isLoading || !data) return <Skeleton className="h-96 w-full" />;

  const totalSpent = data.by_category.reduce((s, c) => s + c.total, 0);
  const netSavings = data.summary.net_balance;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <p className="text-sm text-foreground/55">
          Branded financial report · generated for WABIL — Premium Ladies Suits.
        </p>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-xl bg-charcoal px-4 py-2.5 text-sm font-medium text-ivory hover:bg-charcoal/90"
        >
          <Printer size={16} /> Export PDF / Print
        </button>
      </div>

      {/* Print-friendly report */}
      <div className="space-y-6 rounded-2xl border border-border bg-card p-8 shadow-luxe print:border-0 print:shadow-none">
        <header className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h1 className="font-heading text-3xl font-semibold">WABIL</h1>
            <p className="text-xs uppercase tracking-widest text-rosegold">Financial Report</p>
          </div>
          <div className="text-right text-sm text-foreground/55">
            <p>This month summary</p>
            <p>Currency: {code}</p>
          </div>
        </header>

        {/* Monthly summary */}
        <section className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Income", value: data.summary.total_income, tone: "text-emerald-600" },
            { label: "Expenses", value: data.summary.total_spent, tone: "text-rose-500" },
            { label: "Net Savings", value: netSavings, tone: netSavings >= 0 ? "text-emerald-600" : "text-rose-500" },
          ].map((m) => (
            <div key={m.label} className="rounded-xl border border-border p-4">
              <p className="text-sm text-foreground/55">{m.label}</p>
              <p className={`mt-1 font-heading text-2xl font-semibold ${m.tone}`}>{format(m.value)}</p>
            </div>
          ))}
        </section>

        {/* Category breakdown */}
        <section>
          <h2 className="mb-3 font-heading text-xl font-semibold">Category Breakdown</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-foreground/50">
                <th className="py-2 font-medium">Category</th>
                <th className="py-2 text-right font-medium">Amount</th>
                <th className="py-2 text-right font-medium">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {data.by_category
                .sort((a, b) => b.total - a.total)
                .map((c) => (
                  <tr key={c.category} className="border-b border-border/60">
                    <td className="py-2.5">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color }} />
                        {c.category}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-medium">{format(c.total)}</td>
                    <td className="py-2.5 text-right text-foreground/55">
                      {((c.total / totalSpent) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              <tr className="font-semibold">
                <td className="py-2.5">Total</td>
                <td className="py-2.5 text-right">{format(totalSpent)}</td>
                <td className="py-2.5 text-right">100%</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Trend / YoY-style comparison */}
        <section>
          <h2 className="mb-3 font-heading text-xl font-semibold">6-Month Comparison</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis
                fontSize={12}
                tickFormatter={(v) => `${Math.round(((v / (rates.PKR ?? 278)) * (rates[code] ?? 1)) / 1000)}k`}
              />
              <Tooltip formatter={(v: number) => format(v)} />
              <Legend />
              <Bar dataKey="income" name="Income" fill="#A3B18A" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" name="Expense" fill="#C9A96E" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <footer className="border-t border-border pt-4 text-center text-xs text-foreground/40">
          WABIL — Dress Like Royalty · Confidential financial summary
        </footer>
      </div>
    </div>
  );
}
