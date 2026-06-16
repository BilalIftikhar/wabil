"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";

// Delete-confirm modal: scale+fade with backdrop blur; the confirm button
// shakes if pressed before the user has acknowledged the warning checkbox.
export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const [ack, setAck] = useState(false);
  const [shake, setShake] = useState(false);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9995] flex items-center justify-center bg-charcoal/40 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-luxe"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/15 text-rose-500">
                <AlertTriangle size={20} />
              </span>
              <h3 className="font-heading text-xl font-semibold">{title}</h3>
            </div>
            <p className="mt-3 text-sm text-foreground/60">{message}</p>

            <label className="mt-4 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="accent-rosegold" />
              I understand this cannot be undone
            </label>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={onClose} className="rounded-xl border border-border px-4 py-2 text-sm hover:bg-muted">
                Cancel
              </button>
              <motion.button
                animate={shake ? { x: [0, -6, 6, -6, 6, 0] } : {}}
                transition={{ duration: 0.4 }}
                onClick={() => {
                  if (!ack) {
                    setShake(true);
                    setTimeout(() => setShake(false), 450);
                    return;
                  }
                  onConfirm();
                  setAck(false);
                }}
                className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600"
              >
                {confirmLabel}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
