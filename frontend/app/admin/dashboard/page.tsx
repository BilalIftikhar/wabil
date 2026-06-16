"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DollarSign, Package, TrendingUp, Users } from "lucide-react";
import { CountUp } from "@/components/ui/CountUp";
import { useCurrency } from "@/store/useCurrency";
import { getOverview } from "@/lib/api/expenses";

// Storefront analytics are mocked here; the expense widget pulls live from the
// expense tracker to show "net profit vs expenses".
const revenue7d = [
  { d: "Mon", v: 420000 },
  { d: "Tue", v: 380000 },
  { d: "Wed", v: 560000 },
  { d: "Thu", v: 610000 },
  { d: "Fri", v: 720000 },
  { d: "Sat", v: 980000 },
  { d: "Sun", v: 845000 },
];
const ordersByStatus = [
  { name: "Delivered", value: 142, color: "#A3B18A" },
  { name: "Shipped", value: 64, color: "#C9A96E" },
  { name: "Processing", value: 38, color: "#F4C2C2" },
  { name: "Pending", value: 21, color: "#8E9AAF" },
];
const topProducts = [
  { name: "Zara Bridal", sales: 86 },
  { name: "Rose Lawn 3pc", sales: 72 },
  { name: "Charcoal Silk", sales: 65 },
  { name: "Blush Chiffon", sales: 54 },
  { name: "Ivory Formal", sales: 41 },
];
const lowStock = [
  { name: "Rose Lawn 3pc — M", stock: 3 },
  { name: "Charcoal Silk — L", stock: 2 },
  { name: "Blush Chiffon — S", stock: 5 },
];

export default function Dashboard() {
  const { format } = useCurrency();
  const { data: expense } = useQuery({ queryKey: ["expense-overview"], queryFn: getOverview });

  const kpis = [
    { label: "Revenue Today", value: 845000, icon: DollarSign, money: true },
    { label: "Orders", value: 265, icon: Package, money: false },
    { label: "New Customers", value: 48, icon: Users, money: false },
    { label: "Conversion Rate", value: 3.8, icon: TrendingUp, money: false, suffix: "%" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-4xl font-semibold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-border bg-card p-5 shadow-luxe"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground/55">{k.label}</span>
                <Icon size={18} className="text-rosegold" />
              </div>
              <div className="mt-3 font-heading text-3xl font-semibold">
                {k.money ? (
                  <CountUp value={k.value} format={(n) => format(n)} />
                ) : (
                  <CountUp value={k.value} format={(n) => `${n.toFixed(k.suffix ? 1 : 0)}${k.suffix ?? ""}`} />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Revenue — last 7 days" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenue7d}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C9A96E" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#C9A96E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="d" fontSize={12} stroke="#9b9b9b" />
              <YAxis fontSize={12} stroke="#9b9b9b" tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(v: number) => format(v)} />
              <Area type="monotone" dataKey="v" stroke="#C9A96E" strokeWidth={3} fill="url(#rev)" animationDuration={1100} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Orders by Status">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={ordersByStatus} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                {ordersByStatus.map((s) => (
                  <Cell key={s.name} fill={s.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Top 5 Products" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topProducts} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" fontSize={12} stroke="#9b9b9b" />
              <YAxis type="category" dataKey="name" fontSize={12} width={100} stroke="#9b9b9b" />
              <Tooltip />
              <Bar dataKey="sales" fill="#C9A96E" radius={[0, 6, 6, 0]} animationDuration={900} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <div className="space-y-4">
          <Card title="Net Profit vs Expenses">
            <div className="space-y-2 text-sm">
              <Row label="Income (mo)" value={format(expense?.summary.total_income ?? 0)} tone="text-emerald-600" />
              <Row label="Expenses (mo)" value={format(expense?.summary.total_spent ?? 0)} tone="text-rose-500" />
              <div className="my-2 border-t border-border" />
              <Row
                label="Net Profit"
                value={format(expense?.summary.net_balance ?? 0)}
                tone={(expense?.summary.net_balance ?? 0) >= 0 ? "text-emerald-600 font-semibold" : "text-rose-500 font-semibold"}
              />
            </div>
          </Card>

          <Card title="Low Stock Alerts">
            <ul className="space-y-2 text-sm">
              {lowStock.map((p) => (
                <li key={p.name} className="flex items-center justify-between">
                  <span>{p.name}</span>
                  <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-xs font-medium text-rose-500">
                    {p.stock} left
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-border bg-card p-5 shadow-luxe ${className ?? ""}`}
    >
      <h3 className="mb-4 font-heading text-xl font-semibold">{title}</h3>
      {children}
    </motion.div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-foreground/55">{label}</span>
      <span className={tone}>{value}</span>
    </div>
  );
}
