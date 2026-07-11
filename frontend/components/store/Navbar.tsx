"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, LogOut, Menu, Search, Settings, ShoppingBag, User, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";
import { useCart } from "@/store/useCart";
import { useAuth } from "@/store/useAuth";

const LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "Bridal", href: "/categories/bridal" },
  { label: "Formal", href: "/categories/formal" },
  { label: "Party", href: "/categories/party" },
];

export function Navbar() {
  const { count, setOpen } = useCart();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const items = count();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    setMenuOpen(false);
    router.push("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <button className="md:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <Menu size={22} />
        </button>

        <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="group relative">
              {l.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-rosegold transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <span className="font-heading text-3xl font-semibold tracking-wide">WABIL</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <CurrencySwitcher />
          <Link href="/search" className="hidden sm:block">
            <Search size={20} />
          </Link>
          <Link href="/wishlist" className="hidden sm:block">
            <Heart size={20} />
          </Link>

          {/* User menu — desktop */}
          <div className="relative hidden sm:block">
            {user ? (
              <>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-charcoal text-xs font-semibold text-ivory hover:opacity-80"
                  aria-label="User menu"
                >
                  {initials}
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-10 z-50 min-w-[180px] rounded-2xl border border-border bg-card p-2 shadow-luxe"
                      >
                        <div className="px-3 py-2 text-xs text-foreground/50">
                          {user.name ?? user.email}
                        </div>
                        <div className="my-1 h-px bg-border" />
                        <Link
                          href="/account"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm hover:bg-muted"
                        >
                          <User size={15} /> My Account
                        </Link>
                        {user.role === "admin" && (
                          <Link
                            href="/admin/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm hover:bg-muted"
                          >
                            <Settings size={15} /> Admin Panel
                          </Link>
                        )}
                        <div className="my-1 h-px bg-border" />
                        <button
                          onClick={handleSignOut}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-rose-500 hover:bg-rose-500/10"
                        >
                          <LogOut size={15} /> Sign out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <Link href="/login">
                <User size={20} />
              </Link>
            )}
          </div>

          <button onClick={() => setOpen(true)} className="relative">
            <ShoppingBag size={20} />
            {items > 0 && (
              <motion.span
                key={items}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-rosegold text-[10px] font-bold text-white"
              >
                {items}
              </motion.span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm md:hidden"
            />
            <motion.nav
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-card p-6 shadow-luxe md:hidden"
            >
              <div className="mb-8 flex items-center justify-between">
                <span className="font-heading text-2xl font-semibold">WABIL</span>
                <button onClick={() => setMenuOpen(false)} aria-label="Close menu">
                  <X size={22} />
                </button>
              </div>

              {/* Shop links */}
              <div className="flex flex-col gap-1">
                {LINKS.map((l) => (
                  <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 text-lg font-medium hover:bg-muted">
                    {l.label}
                  </Link>
                ))}
                <div className="my-3 h-px bg-border" />

                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-3 py-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-charcoal text-xs font-semibold text-ivory">
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user.name ?? user.email}</p>
                        <p className="text-xs text-foreground/50 capitalize">{user.role}</p>
                      </div>
                    </div>
                    <Link href="/account" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2.5 text-foreground/70 hover:bg-muted">
                      My Account
                    </Link>
                    {user.role === "admin" && (
                      <Link href="/admin/dashboard" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2.5 text-foreground/70 hover:bg-muted">
                        Admin Panel
                      </Link>
                    )}
                    <Link href="/search" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2.5 text-foreground/70 hover:bg-muted">
                      Search
                    </Link>
                    <Link href="/wishlist" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2.5 text-foreground/70 hover:bg-muted">
                      Wishlist
                    </Link>
                    <div className="my-2 h-px bg-border" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-rose-500 hover:bg-rose-500/10"
                    >
                      <LogOut size={16} /> Sign out
                    </button>
                  </>
                ) : (
                  <>
                    {[
                      { label: "Search", href: "/search" },
                      { label: "Wishlist", href: "/wishlist" },
                      { label: "My Account", href: "/account" },
                      { label: "Sign In", href: "/login" },
                    ].map((l) => (
                      <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2.5 text-foreground/70 hover:bg-muted">
                        {l.label}
                      </Link>
                    ))}
                  </>
                )}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
