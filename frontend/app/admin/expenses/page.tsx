"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDownRight, ArrowUpRight, PiggyBank, Target } from "lucide-react";
import { getOverview, listBudgets } from "@/lib/api/expenses";
import { useCurrency } from "@/store/useCurrency";
import { CountUp } from "@/components/ui/CountUp";
import { Skeleton } from "@/components/ui/Skeleton";
import { CategoryIcon } from "@/components/admin/CategoryIcon";
import { MemberAvatar } from "@/components/admin/MemberAvatar";
import { formatDate } from "@/lib/utils";
import { convertFromPKR } from "@/lib/currency";

export default function ExpenseOverview() {
  const { code, rates, format } = useCurrency();
  const { data, isLoading } = useQuery({ queryKey: ["expense-overview"], queryFn: getOverview });
  const { data: budgets } = useQuery({ queryKey: ["budgets"], queryFn: listBudgets });

  const toDisplay = (pkr: number) => convertFromPKR(pkr, code, rates);

  if (isLoading || !data) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
        <Skeleton className="h-80 md:col-span-2" />
        <Skeleton className="h-80 md:col-span-2" />
      </div>
    );
  }

  const s = data.summary;
  const cards = [
    { label: "Total Spent", value: s.total_spent, icon: ArrowDownRight, tone: "text-rose-500", bg: "bg-rose-500/10" },
    { label: "Total Income", value: s.total_income, icon: ArrowUpRight, tone: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Net Balance", value: s.net_balance, icon: PiggyBank, tone: s.net_balance >= 0 ? "text-emerald-500" : "text-rose-500", bg: "bg-rosegold/10" },
  ];

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-border bg-card p-5 shadow-luxe"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground/55">{c.label}</span>
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${c.bg}`}>
                  <Icon size={16} className={c.tone} />
                </span>
              </div>
              <div className="mt-3 font-heading text-3xl font-semibold">
                <CountUp value={c.value} format={(n) => format(n)} />
              </div>
              <div className="mt-1 text-xs text-foreground/40">This month</div>
            </motion.div>
          );
        })}

        {/* Budget used */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="rounded-2xl border border-border bg-card p-5 shadow-luxe"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground/55">Budget Used</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rosegold/15">
              <Target size={16} className="text-rosegold" />
            </span>
          </div>
          <div className="mt-3 font-heading text-3xl font-semibold">
            <CountUp value={s.budget_used_pct} format={(n) => `${n.toFixed(1)}%`} />
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(s.budget_used_pct, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={s.budget_used_pct > 100 ? "h-full bg-rose-500" : "h-full bg-rosegold"}
            />
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Spending by Category">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data.by_category}
                dataKey="total"
                nameKey="category"
                innerRadius={64}
                outerRadius={104}
                paddingAngle={2}
                animationDuration={900}
              >
                {data.by_category.map((entry) => (
                  <Cell key={entry.category} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => format(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Spending — last 6 months">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.trend} margin={{ left: -10, right: 10, top: 10 }}>
              <XAxis dataKey="month" stroke="#9b9b9b" fontSize={12} />
              <YAxis stroke="#9b9b9b" fontSize={12} tickFormatter={(v) => `${Math.round(toDisplay(v) / 1000)}k`} />
              <Tooltip formatter={(v: number) => format(v)} />
              <Line type="monotone" dataKey="expense" stroke="#C9A96E" strokeWidth={3} dot={{ r: 4 }} animationDuration={1100} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Income vs Expense">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.trend} margin={{ left: -10, right: 10, top: 10 }}>
              <XAxis dataKey="month" stroke="#9b9b9b" fontSize={12} />
              <YAxis stroke="#9b9b9b" fontSize={12} tickFormatter={(v) => `${Math.round(toDisplay(v) / 1000)}k`} />
              <Tooltip formatter={(v: number) => format(v)} />
              <Legend />
              <Bar dataKey="income" fill="#A3B18A" radius={[6, 6, 0, 0]} animationDuration={900} />
              <Bar dataKey="expense" fill="#C9A96E" radius={[6, 6, 0, 0]} animationDuration={900} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Budget progress bars */}
        <ChartCard title="Budget Progress">
          <div className="space-y-3">
            {budgets?.map((b, i) => {
              const spent = data.by_category.find((c) => c.category === b.category.name)?.total ?? 0;
              const pct = Math.round((spent / b.budget_amount) * 100);
              const over = pct > 100;
              return (
                <div key={b.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5">
                      <CategoryIcon name={b.category.icon} size={14} />
                      {b.category.name}
                    </span>
                    <span className={over ? "text-rose-500" : "text-foreground/55"}>
                      {format(spent)} / {format(b.budget_amount)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(pct, 100)}%` }}
                      transition={{ type: "spring", stiffness: 60, damping: 18, delay: i * 0.05 }}
                      className={over ? "h-full bg-rose-500" : "h-full bg-rosegold"}
                      style={{ backgroundColor: over ? undefined : b.category.color_hex }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>

        {/* Spending by member */}
        <ChartCard title="Spending by Member">
          <div className="space-y-4">
            {data.by_member.map((m, i) => {
              const max = Math.max(...data.by_member.map((x) => x.total), 1);
              return (
                <div key={m.member}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium">{m.member}</span>
                    <span className="text-foreground/60">{format(m.total)}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(m.total / max) * 100}%` }}
                      transition={{ type: "spring", stiffness: 55, damping: 16, delay: i * 0.06 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: m.color }}
                    />
                  </div>
                </div>
              );
            })}
            <p className="pt-1 text-xs text-foreground/45">
              Split expenses are attributed to each member by their share.
            </p>
          </div>
        </ChartCard>
      </div>

      {/* Recent transactions */}
      <ChartCard title="Recent Transactions">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-foreground/50">
                <th className="py-2 font-medium">Title</th>
                <th className="py-2 font-medium">Category</th>
                <th className="py-2 font-medium">Added by</th>
                <th className="py-2 font-medium">Date</th>
                <th className="py-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.recent.map((e, i) => (
                <motion.tr
                  key={e.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-border/60"
                >
                  <td className="py-2.5 font-medium">
                    <span className="flex items-center gap-2">
                      {e.title}
                      {e.split && (
                        <span className="rounded-full bg-rosegold/15 px-1.5 py-0.5 text-[10px] font-medium text-rosegold">
                          Split ×{e.split.shares.length}
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                      style={{ backgroundColor: `${e.category.color_hex}22`, color: e.category.color_hex }}
                    >
                      <CategoryIcon name={e.category.icon} size={12} />
                      {e.category.name}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <span className="inline-flex items-center gap-1.5">
                      <MemberAvatar member={e.addedBy} size={22} />
                      <span className="text-foreground/70">{e.addedBy.name.split(" ")[0]}</span>
                    </span>
                  </td>
                  <td className="py-2.5 text-foreground/55">{formatDate(e.date)}</td>
                  <td className="py-2.5 text-right font-semibold">{format(e.amount_pkr)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card p-5 shadow-luxe"
    >
      <h3 className="mb-4 font-heading text-xl font-semibold">{title}</h3>
      {children}
    </motion.div>
  );
}
