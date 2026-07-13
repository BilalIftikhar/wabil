"use client";

import { motion } from "framer-motion";
import { useStoreSettings } from "@/store/useStore";

export function WhatsAppButton() {
  const { settings } = useStoreSettings();

  const digits = (settings.phone ?? "").replace(/[^\d]/g, "");
  if (!digits) return null;

  const href = `https://wa.me/${digits}?text=${encodeURIComponent(
    `Hi ${settings.storeName}, I'd like to know more about your products.`,
  )}`;

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      transition={{ delay: 0.4, type: "spring", stiffness: 260, damping: 18 }}
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/40 ring-1 ring-black/5"
    >
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-30" />
      <svg viewBox="0 0 32 32" className="relative h-7 w-7 fill-current" aria-hidden="true">
        <path d="M16.003 3C9.373 3 4 8.373 4 15.003c0 2.115.553 4.183 1.605 6.005L4 29l8.163-1.58a11.94 11.94 0 0 0 3.84.63h.003C22.63 28.05 28 22.677 28 16.047 28 12.83 26.747 9.81 24.47 7.533A11.9 11.9 0 0 0 16.003 3zm0 2.2a9.77 9.77 0 0 1 6.94 2.877 9.72 9.72 0 0 1 2.86 6.97c0 5.415-4.404 9.818-9.82 9.818h-.002a9.8 9.8 0 0 1-3.49-.64l-.25-.1-4.84.936.966-4.72-.163-.25a9.66 9.66 0 0 1-1.48-5.155c0-5.416 4.406-9.82 9.28-9.82zm-4.44 5.06c-.208 0-.545.078-.83.39-.286.31-1.09 1.064-1.09 2.596s1.116 3.012 1.272 3.22c.156.208 2.196 3.352 5.32 4.7.744.32 1.324.51 1.777.653.746.237 1.425.204 1.962.124.599-.09 1.844-.754 2.104-1.48.26-.728.26-1.352.182-1.48-.078-.13-.286-.208-.598-.364-.312-.156-1.844-.91-2.13-1.014-.286-.104-.494-.156-.702.156-.208.312-.806 1.014-.988 1.222-.182.208-.364.234-.676.078-.312-.156-1.316-.485-2.507-1.547-.927-.826-1.552-1.846-1.734-2.158-.182-.312-.02-.48.137-.635.14-.14.312-.364.468-.546.156-.182.208-.312.312-.52.104-.208.052-.39-.026-.546-.078-.156-.702-1.69-.962-2.314-.253-.607-.51-.525-.702-.535-.182-.008-.39-.01-.598-.01z" />
      </svg>
    </motion.a>
  );
}
