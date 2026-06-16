"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, MailCheck } from "lucide-react";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const input =
    "w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none transition focus:border-rosegold focus:ring-2 focus:ring-rosegold/20";

  if (sent) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
          <MailCheck size={26} />
        </div>
        <h1 className="font-heading text-2xl font-semibold">Check your inbox</h1>
        <p className="mt-2 text-sm text-foreground/55">
          We sent a reset link to <span className="font-medium">{email}</span>.
        </p>
        <Link href="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm text-rosegold hover:underline">
          <ArrowLeft size={14} /> Back to sign in
        </Link>
      </motion.div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-3xl font-semibold">Forgot password?</h1>
      <p className="mb-6 mt-1 text-sm text-foreground/55">We&apos;ll email you a reset link</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!email) return toast.error("Enter your email");
          setSent(true);
        }}
        className="space-y-4"
      >
        <input className={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <motion.button whileTap={{ scale: 0.97 }} className="w-full rounded-xl bg-charcoal py-3 font-medium text-ivory hover:bg-charcoal/90">
          Send reset link
        </motion.button>
      </form>
      <Link href="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm text-rosegold hover:underline">
        <ArrowLeft size={14} /> Back to sign in
      </Link>
    </div>
  );
}
