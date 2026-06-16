"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { Bell, CreditCard, Mail, Moon, Store, Sun } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";

const TABS = [
  { key: "store", label: "Store", icon: Store },
  { key: "payments", label: "Payments", icon: CreditCard },
  { key: "smtp", label: "Email / SMTP", icon: Mail },
  { key: "notifications", label: "Notifications", icon: Bell },
] as const;

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("store");
  const { theme, setTheme } = useTheme();

  const input = "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-rosegold focus:ring-2 focus:ring-rosegold/20";
  const label = "mb-1.5 block text-sm font-medium text-foreground/70";

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Store configuration"
        action={
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:border-rosegold"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="flex h-fit flex-col gap-1 rounded-2xl border border-border bg-card p-2 shadow-luxe">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${active ? "text-charcoal" : "text-foreground/60 hover:text-foreground"}`}
              >
                {active && <motion.span layoutId="settings-active" className="absolute inset-0 -z-10 rounded-xl bg-blush/60" />}
                <Icon size={18} className={active ? "text-rosegold" : ""} />
                {t.label}
              </button>
            );
          })}
        </nav>

        <motion.form
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Settings saved");
          }}
          className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-luxe"
        >
          {tab === "store" && (
            <>
              <h3 className="font-heading text-xl font-semibold">Store Information</h3>
              <div>
                <label className={label}>Store name</label>
                <input className={input} defaultValue="WABIL — Premium Ladies Suits" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={label}>Support email</label>
                  <input className={input} defaultValue="care@wabil.pk" />
                </div>
                <div>
                  <label className={label}>Phone</label>
                  <input className={input} defaultValue="+92 42 111 92245" />
                </div>
              </div>
              <div>
                <label className={label}>Default currency</label>
                <select className={input} defaultValue="PKR">
                  {["PKR", "USD", "GBP", "AED", "SAR", "EUR"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {tab === "payments" && (
            <>
              <h3 className="font-heading text-xl font-semibold">Payment Keys</h3>
              <div>
                <label className={label}>Stripe publishable key</label>
                <input className={input} placeholder="pk_live_…" />
              </div>
              <div>
                <label className={label}>Stripe secret key</label>
                <input className={input} type="password" placeholder="sk_live_…" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={label}>JazzCash Merchant ID</label>
                  <input className={input} placeholder="MC…" />
                </div>
                <div>
                  <label className={label}>EasyPaisa Store ID</label>
                  <input className={input} placeholder="…" />
                </div>
              </div>
            </>
          )}

          {tab === "smtp" && (
            <>
              <h3 className="font-heading text-xl font-semibold">SMTP</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={label}>Host</label>
                  <input className={input} placeholder="smtp.mailgun.org" />
                </div>
                <div>
                  <label className={label}>Port</label>
                  <input className={input} defaultValue="587" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={label}>Username</label>
                  <input className={input} />
                </div>
                <div>
                  <label className={label}>Password</label>
                  <input className={input} type="password" />
                </div>
              </div>
            </>
          )}

          {tab === "notifications" && (
            <>
              <h3 className="font-heading text-xl font-semibold">Notification Preferences</h3>
              {["New order placed", "Low stock alert", "New review submitted", "Daily sales summary"].map((n) => (
                <label key={n} className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm">
                  {n}
                  <input type="checkbox" defaultChecked className="accent-rosegold" />
                </label>
              ))}
            </>
          )}

          <button className="rounded-xl bg-charcoal px-6 py-2.5 text-sm font-medium text-ivory hover:bg-charcoal/90">Save changes</button>
        </motion.form>
      </div>
    </div>
  );
}
