"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

// Curtain-wipe transition between routes.
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div key={pathname}>
        <motion.div
          className="pointer-events-none fixed inset-0 z-[9990] origin-bottom bg-charcoal"
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          exit={{ scaleY: 1 }}
          transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
        />
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
