"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/store/useAuth";
import { GoogleButton } from "@/components/auth/GoogleButton";

export default function RegisterPage() {
  const router = useRouter();
  const signUp = useAuth((s) => s.signUp);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const input =
    "w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none transition focus:border-rosegold focus:ring-2 focus:ring-rosegold/20";

  return (
    <div>
      <h1 className="font-heading text-3xl font-semibold">Create account</h1>
      <p className="mb-6 mt-1 text-sm text-foreground/55">Join WABIL — 10% off your first order</p>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!form.name || !form.email || !form.password) return toast.error("All fields are required");
          if (form.password !== form.confirm) return toast.error("Passwords do not match");
          setBusy(true);
          try {
            const user = await signUp(form.name, form.email, form.password);
            toast.success(`Welcome to WABIL, ${user.name}`);
            router.push("/account");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Sign up failed");
          } finally {
            setBusy(false);
          }
        }}
        className="space-y-4"
      >
        {[
          { k: "name", label: "Full name", type: "text", ph: "Ayesha Khan" },
          { k: "email", label: "Email", type: "email", ph: "you@example.com" },
          { k: "password", label: "Password", type: "password", ph: "••••••••" },
          { k: "confirm", label: "Confirm password", type: "password", ph: "••••••••" },
        ].map((f, i) => (
          <motion.div
            key={f.k}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <label className="mb-1.5 block text-sm font-medium text-foreground/70">{f.label}</label>
            <input
              className={input}
              type={f.type}
              value={form[f.k as keyof typeof form]}
              onChange={set(f.k as keyof typeof form)}
              placeholder={f.ph}
            />
          </motion.div>
        ))}
        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={busy}
          className="w-full rounded-xl bg-charcoal py-3 font-medium text-ivory transition hover:bg-charcoal/90 disabled:opacity-60"
        >
          {busy ? "Creating…" : "Create Account"}
        </motion.button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-foreground/40">
        <span className="h-px flex-1 bg-border" /> OR <span className="h-px flex-1 bg-border" />
      </div>
      <GoogleButton label="Sign up with Google" />

      <p className="mt-6 text-center text-sm text-foreground/55">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-rosegold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
