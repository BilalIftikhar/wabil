"use client";

import Link from "next/link";
import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { motion } from "framer-motion";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";
import { useCart } from "@/store/useCart";

const LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "Bridal", href: "/categories/bridal" },
  { label: "Formal", href: "/categories/formal" },
  { label: "Party", href: "/categories/party" },
];

export function Navbar() {
  const { count, setOpen } = useCart();
  const items = count();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <button className="md:hidden">
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
          <Link href="/login" className="hidden sm:block">
            <User size={20} />
          </Link>
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
    </header>
  );
}
