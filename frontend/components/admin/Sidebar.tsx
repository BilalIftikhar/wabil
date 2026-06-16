"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Ticket,
  Star,
  Truck,
  Settings,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Coupons", href: "/admin/coupons", icon: Ticket },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "Shipping", href: "/admin/shipping", icon: Truck },
  { label: "Expenses", href: "/admin/expenses", icon: Wallet },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 248 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className="sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-card md:flex"
    >
      <div className="flex h-16 items-center justify-between px-5">
        <Link href="/admin/dashboard" className="overflow-hidden">
          <AnimatePresence mode="wait">
            {!collapsed ? (
              <motion.span
                key="full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-heading text-2xl font-semibold tracking-wide"
              >
                WABIL
              </motion.span>
            ) : (
              <motion.span
                key="mark"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-heading text-2xl font-semibold text-rosegold"
              >
                W
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="rounded-lg p-1.5 text-foreground/60 hover:bg-muted"
        >
          <ChevronLeft size={18} className={cn("transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "text-charcoal" : "text-foreground/60 hover:text-foreground",
              )}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 -z-10 rounded-xl bg-blush/60"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon size={20} className={cn("shrink-0", active && "text-rosegold")} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4 text-xs text-foreground/40">
        {!collapsed && "WABIL Admin · v0.1"}
      </div>
    </motion.aside>
  );
}
