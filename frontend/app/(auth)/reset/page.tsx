"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function ResetPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const input =
    "w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none transition focus:border-rosegold focus:ring-2 focus:ring-rosegold/20";

  return (
    <div>
      <h1 className="font-heading text-3xl font-semibold">Set a new password</h1>
      <p className="mb-6 mt-1 text-sm text-foreground/55">Choose a strong password for your account</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (password.length < 6) return toast.error("Password must be at least 6 characters");
          if (password !== confirm) return toast.error("Passwords do not match");
          toast.success("Password updated — please sign in");
          router.push("/login");
        }}
        className="space-y-4"
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground/70">New password</label>
          <input className={input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground/70">Confirm password</label>
          <input className={input} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" />
        </div>
        <motion.button whileTap={{ scale: 0.97 }} className="w-full rounded-xl bg-charcoal py-3 font-medium text-ivory hover:bg-charcoal/90">
          Update password
        </motion.button>
      </form>
    </div>
  );
}
