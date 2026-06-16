"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Overview", href: "/admin/expenses" },
  { label: "Add", href: "/admin/expenses/add" },
  { label: "All Expenses", href: "/admin/expenses/list" },
  { label: "Income", href: "/admin/expenses/income" },
  { label: "Budgets", href: "/admin/expenses/budgets" },
  { label: "Reports", href: "/admin/expenses/reports" },
];

export default function ExpensesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-4xl font-semibold">Personal Finance</h1>
        <p className="text-sm text-foreground/50">
          Track spending, income & budgets across the WABIL business.
        </p>
      </div>

      <nav className="flex flex-wrap gap-1 border-b border-border">
        {TABS.map((tab) => {
          const active =
            tab.href === "/admin/expenses"
              ? pathname === tab.href
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative px-4 py-2.5 text-sm font-medium transition-colors",
                active ? "text-rosegold" : "text-foreground/55 hover:text-foreground",
              )}
            >
              {tab.label}
              {active && (
                <motion.div
                  layoutId="expense-tab"
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-rosegold"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
