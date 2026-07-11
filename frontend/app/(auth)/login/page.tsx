"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/store/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const signIn = useAuth((s) => s.signIn);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const input =
    "w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none transition focus:border-rosegold focus:ring-2 focus:ring-rosegold/20";

  return (
    <div>
      <h1 className="font-heading text-3xl font-semibold">Welcome back</h1>
      <p className="mb-6 mt-1 text-sm text-foreground/55">Sign in to your WABIL account</p>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!email || !password) return toast.error("Enter email and password");
          setBusy(true);
          try {
            const user = await signIn(email, password);
            toast.success(`Welcome, ${user.name}`);
            router.push(user.role === "admin" ? "/admin/dashboard" : "/account");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Sign in failed");
          } finally {
            setBusy(false);
          }
        }}
        className="space-y-4"
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground/70">Email</label>
          <input className={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground/70">Password</label>
          <div className="relative">
            <input
              className={input}
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40">
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div className="flex justify-end">
          <Link href="/forgot" className="text-sm text-rosegold hover:underline">
            Forgot password?
          </Link>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={busy}
          className="w-full rounded-xl bg-charcoal py-3 font-medium text-ivory transition hover:bg-charcoal/90 disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign In"}
        </motion.button>
      </form>

      <p className="mt-6 text-center text-sm text-foreground/55">
        New to WABIL?{" "}
        <Link href="/register" className="font-medium text-rosegold hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
