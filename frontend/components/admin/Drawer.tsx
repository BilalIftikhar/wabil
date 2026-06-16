"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

// Right-side slide-in panel for create/edit forms and detail views.
export function Drawer({
  open,
  title,
  onClose,
  children,
  footer,
  width = "max-w-lg",
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[9994] bg-charcoal/40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className={`fixed right-0 top-0 z-[9995] flex h-full w-full ${width} flex-col bg-card shadow-luxe`}
          >
            <div className="flex items-center justify-between border-b border-border p-5">
              <h2 className="font-heading text-2xl font-semibold">{title}</h2>
              <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{children}</div>
            {footer && <div className="border-t border-border p-5">{footer}</div>}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
