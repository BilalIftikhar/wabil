"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80"
          alt="WABIL"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/30 to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute bottom-12 left-12 text-ivory"
        >
          <Link href="/" className="font-heading text-5xl font-semibold">
            WABIL
          </Link>
          <p className="mt-2 text-lg italic text-blush">Dress Like Royalty.</p>
        </motion.div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-background p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <Link href="/" className="mb-8 block text-center font-heading text-3xl font-semibold lg:hidden">
            WABIL
          </Link>
          {children}
        </motion.div>
      </div>
    </div>
  );
}
