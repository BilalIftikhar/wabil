"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { Bell, Check, CreditCard, Loader2, Mail, Moon, Send, Store, Sun } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { authFetch } from "@/lib/api/auth-fetch";
import { useStoreSettings, type StoreSettings } from "@/store/useStore";

const TABS = [
  { key: "store", label: "Store", icon: Store },
  { key: "payments", label: "Payments", icon: CreditCard },
  { key: "smtp", label: "Email / SMTP", icon: Mail },
  { key: "notifications", label: "Notifications", icon: Bell },
] as const;

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("store");
  const { theme, setTheme } = useTheme();
  const { settings, loadAdmin, saveAdmin } = useStoreSettings();
  const [draft, setDraft] = useState<StoreSettings>(settings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const remote = await loadAdmin();
      if (remote) setDraft(remote);
      setLoading(false);
    })();
  }, [loadAdmin]);

  const set = (patch: Partial<StoreSettings>) => setDraft((d) => ({ ...d, ...patch }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const ok = await saveAdmin(draft);
    setSaving(false);
    if (ok) {
      toast.success("Settings saved", {
        description: "Store and mail settings are synced to the server.",
        icon: <Check size={16} />,
      });
    } else {
      toast.error("Could not save settings. Make sure you're logged in as admin.");
    }
  };

  const testSmtp = async () => {
    if (!testEmail) return toast.error("Enter an email to send the test to");
    setTesting(true);
    try {
      const res = await authFetch("/api/mail/test", {
        method: "POST",
        body: JSON.stringify({ to: testEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "SMTP test failed");
      toast.success("Test email sent", { description: `Check ${testEmail}` });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "SMTP test failed");
    } finally {
      setTesting(false);
    }
  };

  const input =
    "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-rosegold focus:ring-2 focus:ring-rosegold/20";
  const label = "mb-1.5 block text-sm font-medium text-foreground/70";

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center">
        <Loader2 size={28} className="animate-spin text-rosegold" />
      </div>
    );
  }

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
                {active && (
                  <motion.span layoutId="settings-active" className="absolute inset-0 -z-10 rounded-xl bg-blush/60" />
                )}
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
          onSubmit={save}
          className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-luxe"
        >
          {tab === "store" && (
            <>
              <h3 className="font-heading text-xl font-semibold">Store Information</h3>
              <div>
                <label className={label}>Store name</label>
                <input className={input} value={draft.storeName} onChange={(e) => set({ storeName: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={label}>Support email</label>
                  <input className={input} type="email" value={draft.supportEmail} onChange={(e) => set({ supportEmail: e.target.value })} />
                </div>
                <div>
                  <label className={label}>Phone</label>
                  <input className={input} value={draft.phone} onChange={(e) => set({ phone: e.target.value })} />
                </div>
              </div>
              <div>
                <label className={label}>Default currency</label>
                <select className={input} value={draft.defaultCurrency} onChange={(e) => set({ defaultCurrency: e.target.value })}>
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
                <input className={input} placeholder="pk_live_…" value={draft.stripeKey} onChange={(e) => set({ stripeKey: e.target.value })} />
              </div>
              <div>
                <label className={label}>Stripe secret key</label>
                <input className={input} type="password" placeholder="sk_live_…" value={draft.stripeSecret} onChange={(e) => set({ stripeSecret: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={label}>JazzCash Merchant ID</label>
                  <input className={input} placeholder="MC…" value={draft.jazzcashId} onChange={(e) => set({ jazzcashId: e.target.value })} />
                </div>
                <div>
                  <label className={label}>EasyPaisa Store ID</label>
                  <input className={input} placeholder="…" value={draft.easypaisaId} onChange={(e) => set({ easypaisaId: e.target.value })} />
                </div>
              </div>
            </>
          )}

          {tab === "smtp" && (
            <>
              <h3 className="font-heading text-xl font-semibold">SMTP</h3>
              <p className="text-sm text-foreground/55">
                Used for password reset, order confirmations, and newsletter emails.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={label}>Host</label>
                  <input className={input} placeholder="smtp.gmail.com" value={draft.smtpHost} onChange={(e) => set({ smtpHost: e.target.value })} />
                </div>
                <div>
                  <label className={label}>Port</label>
                  <input className={input} value={draft.smtpPort} onChange={(e) => set({ smtpPort: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={label}>Username</label>
                  <input className={input} value={draft.smtpUser} onChange={(e) => set({ smtpUser: e.target.value })} />
                </div>
                <div>
                  <label className={label}>Password</label>
                  <input className={input} type="password" placeholder="Leave blank to keep current" value={draft.smtpPass} onChange={(e) => set({ smtpPass: e.target.value })} />
                </div>
              </div>
              <div>
                <label className={label}>From email</label>
                <input className={input} type="email" placeholder="noreply@wabil.pk" value={draft.smtpFrom} onChange={(e) => set({ smtpFrom: e.target.value })} />
              </div>

              <div className="rounded-xl border border-border bg-muted/40 p-4">
                <p className="mb-3 text-sm font-medium">Test connection</p>
                <div className="flex gap-2">
                  <input
                    className={`${input} flex-1`}
                    type="email"
                    placeholder="Send test to…"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={testSmtp}
                    disabled={testing}
                    className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:border-rosegold disabled:opacity-60"
                  >
                    {testing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    Test
                  </button>
                </div>
              </div>
            </>
          )}

          {tab === "notifications" && (
            <>
              <h3 className="font-heading text-xl font-semibold">Notification Preferences</h3>
              {(
                [
                  { key: "notifyNewOrder", label: "New order placed" },
                  { key: "notifyLowStock", label: "Low stock alert" },
                  { key: "notifyNewReview", label: "New review submitted" },
                  { key: "notifyDailySummary", label: "Daily sales summary" },
                ] as const
              ).map((item) => (
                <label key={item.key} className="flex cursor-pointer items-center justify-between rounded-xl border border-border px-4 py-3 text-sm hover:border-rosegold/50">
                  {item.label}
                  <input type="checkbox" className="accent-rosegold h-4 w-4" checked={draft[item.key]} onChange={(e) => set({ [item.key]: e.target.checked })} />
                </label>
              ))}
            </>
          )}

          <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-xl bg-charcoal px-6 py-2.5 text-sm font-medium text-ivory hover:bg-charcoal/90 disabled:opacity-60">
            {saving && <Loader2 size={14} className="animate-spin" />}
            Save changes
          </button>
        </motion.form>
      </div>
    </div>
  );
}
