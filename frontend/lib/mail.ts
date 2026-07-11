import nodemailer from "nodemailer";
import type { StoreSettings } from "@/lib/settings";
import { DEFAULT_SETTINGS, rowToSettings, type StoreSettingsRow } from "@/lib/settings";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function loadMailSettings(): Promise<StoreSettings> {
  const db = supabaseAdmin();
  if (!db) return DEFAULT_SETTINGS;

  const { data, error } = await db.from("store_settings").select("*").eq("id", 1).maybeSingle();
  if (error || !data) return DEFAULT_SETTINGS;
  return rowToSettings(data as StoreSettingsRow);
}

export function smtpConfigured(s: StoreSettings) {
  return Boolean(s.smtpHost && s.smtpUser && s.smtpPass);
}

function fromAddress(s: StoreSettings) {
  return s.smtpFrom || s.supportEmail || s.smtpUser;
}

export async function sendMail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  settings?: StoreSettings;
}) {
  const settings = opts.settings ?? (await loadMailSettings());
  if (!smtpConfigured(settings)) {
    throw new Error("SMTP is not configured. Add host, username, and password in Admin → Settings → Email / SMTP.");
  }

  const transporter = nodemailer.createTransport({
    host: settings.smtpHost,
    port: Number(settings.smtpPort || 587),
    secure: Number(settings.smtpPort) === 465,
    auth: { user: settings.smtpUser, pass: settings.smtpPass },
  });

  await transporter.verify();

  const info = await transporter.sendMail({
    from: `"${settings.storeName}" <${fromAddress(settings)}>`,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text ?? opts.html.replace(/<[^>]+>/g, ""),
  });

  return info;
}

export function orderConfirmationHtml(opts: {
  orderId: string;
  customerName: string;
  total: string;
  items: { name: string; qty: number; price: string }[];
  storeName: string;
}) {
  const rows = opts.items
    .map((i) => `<tr><td style="padding:8px 0;border-bottom:1px solid #eee">${i.name} × ${i.qty}</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${i.price}</td></tr>`)
    .join("");

  return `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1a1a2e">
      <h1 style="color:#C9A96E;font-size:28px">${opts.storeName}</h1>
      <p>Hi ${opts.customerName},</p>
      <p>Thank you for your order <strong>#${opts.orderId}</strong>. We're preparing it now.</p>
      <table style="width:100%;margin:20px 0">${rows}</table>
      <p style="font-size:18px"><strong>Total: ${opts.total}</strong></p>
      <p style="color:#666;font-size:14px">You'll receive another email when your order ships.</p>
    </div>
  `;
}

export function passwordResetHtml(opts: { storeName: string; link: string }) {
  return `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1a1a2e">
      <h1 style="color:#C9A96E;font-size:28px">${opts.storeName}</h1>
      <p>We received a request to reset your password.</p>
      <p><a href="${opts.link}" style="display:inline-block;background:#1a1a2e;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none">Reset password</a></p>
      <p style="color:#666;font-size:14px">If you didn't request this, you can ignore this email.</p>
    </div>
  `;
}
