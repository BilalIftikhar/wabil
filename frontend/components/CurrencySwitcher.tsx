"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { CURRENCIES } from "@/lib/currency";
import { useCurrency } from "@/store/useCurrency";

export function CurrencySwitcher() {
  const { code, setCode } = useCurrency();
  const [open, setOpen] = useState(false);
  const current = CURRENCIES.find((c) => c.code === code)!;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm transition-colors hover:border-rosegold"
      >
        <span>{current.flag}</span>
        <span className="font-medium">{current.code}</span>
        <ChevronDown size={14} className={open ? "rotate-180 transition" : "transition"} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.ul
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute right-0 z-50 mt-2 w-36 overflow-hidden rounded-xl border border-border bg-card shadow-luxe"
            >
              {CURRENCIES.map((c) => (
                <li key={c.code}>
                  <button
                    onClick={() => {
                      setCode(c.code);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted ${
                      c.code === code ? "text-rosegold" : ""
                    }`}
                  >
                    <span>{c.flag}</span>
                    <span>{c.code}</span>
                  </button>
                </li>
              ))}
            </motion.ul>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
