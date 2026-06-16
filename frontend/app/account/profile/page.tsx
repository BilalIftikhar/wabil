"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/store/useAuth";

export default function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
  }, [user]);

  const input =
    "w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none transition focus:border-rosegold focus:ring-2 focus:ring-rosegold/20";

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={(e) => {
        e.preventDefault();
        toast.success("Profile updated");
      }}
      className="max-w-lg space-y-5 rounded-2xl border border-border bg-card p-6 shadow-luxe"
    >
      <h2 className="font-heading text-2xl font-semibold">Profile</h2>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground/70">Full name</label>
        <input className={input} value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground/70">Email</label>
        <input className={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground/70">Phone</label>
        <input className={input} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 3xx xxxxxxx" />
      </div>
      <motion.button whileTap={{ scale: 0.97 }} className="rounded-xl bg-charcoal px-6 py-2.5 text-sm font-medium text-ivory hover:bg-charcoal/90">
        Save changes
      </motion.button>
    </motion.form>
  );
}
