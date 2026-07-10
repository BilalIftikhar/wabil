"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";

// Global fallback for any unmatched route — shown instead of a bare 404 so
// links to not-yet-built areas read as "coming soon" rather than broken.
export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 text-center">
      {/* soft brand glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-blush/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-rosegold/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 max-w-md"
      >
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-rosegold/15 text-rosegold"
        >
          <Sparkles size={28} />
        </motion.span>

        <p className="text-sm uppercase tracking-[0.3em] text-rosegold">WABIL</p>
        <h1 className="mt-3 font-heading text-5xl font-semibold">Coming Soon</h1>
        <p className="mt-4 text-foreground/60">
          This feature is being tailored to perfection. We&apos;re adding the finishing
          stitches — check back shortly.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="flex items-center gap-2 rounded-full bg-charcoal px-6 py-3 text-sm font-medium text-ivory transition hover:bg-charcoal/90">
            <ArrowLeft size={16} /> Back home
          </Link>
          <Link href="/shop" className="rounded-full border border-border px-6 py-3 text-sm font-medium transition hover:border-rosegold">
            Explore the collection
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
