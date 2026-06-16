"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, LogOut, MapPin, Package, User } from "lucide-react";
import { Navbar } from "@/components/store/Navbar";
import { Footer } from "@/components/store/Footer";
import { CartDrawer } from "@/components/store/CartDrawer";
import { useAuth } from "@/store/useAuth";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Orders", href: "/account", icon: Package },
  { label: "Addresses", href: "/account/addresses", icon: MapPin },
  { label: "Wishlist", href: "/account/wishlist", icon: Heart },
  { label: "Profile", href: "/account/profile", icon: User },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <>
      <Navbar />
      <CartDrawer />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="mb-8 font-heading text-4xl font-semibold">My Account</h1>
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="h-fit rounded-2xl border border-border bg-card p-4 shadow-luxe">
            <div className="mb-4 flex items-center gap-3 border-b border-border px-2 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-charcoal text-sm font-semibold text-ivory">
                {(user?.name ?? "G")[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user?.name ?? "Guest"}</p>
                <p className="truncate text-xs text-foreground/50">{user?.email ?? "Not signed in"}</p>
              </div>
            </div>
            <nav className="space-y-1">
              {NAV.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      active ? "text-charcoal" : "text-foreground/60 hover:text-foreground",
                    )}
                  >
                    {active && <motion.span layoutId="acct-active" className="absolute inset-0 -z-10 rounded-xl bg-blush/60" />}
                    <Icon size={18} className={active ? "text-rosegold" : ""} />
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-500/10"
              >
                <LogOut size={18} /> Sign out
              </button>
            </nav>
          </aside>
          <div>{children}</div>
        </div>
      </div>
      <Footer />
    </>
  );
}
