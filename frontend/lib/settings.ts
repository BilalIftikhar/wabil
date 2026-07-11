export interface StoreSettings {
  storeName: string;
  supportEmail: string;
  phone: string;
  defaultCurrency: string;
  stripeKey: string;
  stripeSecret: string;
  jazzcashId: string;
  easypaisaId: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  notifyNewOrder: boolean;
  notifyLowStock: boolean;
  notifyNewReview: boolean;
  notifyDailySummary: boolean;
}

export type PublicStoreSettings = Pick<
  StoreSettings,
  "storeName" | "supportEmail" | "phone" | "defaultCurrency"
>;

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "WABIL — Premium Ladies Suits",
  supportEmail: "wabilmanagamenet@gmail.com",
  phone: "+923215635736",
  defaultCurrency: "PKR",
  stripeKey: "",
  stripeSecret: "",
  jazzcashId: "",
  easypaisaId: "",
  smtpHost: "smtp.gmail.com",
  smtpPort: "587",
  smtpUser: "wabilmanagamenet@gmail.com",
  smtpPass: "",
  smtpFrom: "wabilmanagamenet@gmail.com",
  notifyNewOrder: true,
  notifyLowStock: true,
  notifyNewReview: true,
  notifyDailySummary: false,
};

export interface StoreSettingsRow {
  id: number;
  store_name: string;
  support_email: string;
  phone: string | null;
  default_currency: string;
  stripe_key: string | null;
  stripe_secret: string | null;
  jazzcash_id: string | null;
  easypaisa_id: string | null;
  smtp_host: string | null;
  smtp_port: string | null;
  smtp_user: string | null;
  smtp_pass: string | null;
  smtp_from: string | null;
  notify_new_order: boolean;
  notify_low_stock: boolean;
  notify_new_review: boolean;
  notify_daily_summary: boolean;
  updated_at?: string;
}

export function rowToSettings(row: StoreSettingsRow): StoreSettings {
  return {
    storeName: row.store_name,
    supportEmail: row.support_email,
    phone: row.phone ?? "",
    defaultCurrency: row.default_currency,
    stripeKey: row.stripe_key ?? "",
    stripeSecret: row.stripe_secret ?? "",
    jazzcashId: row.jazzcash_id ?? "",
    easypaisaId: row.easypaisa_id ?? "",
    smtpHost: row.smtp_host ?? "",
    smtpPort: row.smtp_port ?? "587",
    smtpUser: row.smtp_user ?? "",
    smtpPass: row.smtp_pass ?? "",
    smtpFrom: row.smtp_from ?? "",
    notifyNewOrder: row.notify_new_order,
    notifyLowStock: row.notify_low_stock,
    notifyNewReview: row.notify_new_review,
    notifyDailySummary: row.notify_daily_summary,
  };
}

export function settingsToRow(s: StoreSettings): Omit<StoreSettingsRow, "id" | "updated_at"> {
  return {
    store_name: s.storeName,
    support_email: s.supportEmail,
    phone: s.phone || null,
    default_currency: s.defaultCurrency,
    stripe_key: s.stripeKey || null,
    stripe_secret: s.stripeSecret || null,
    jazzcash_id: s.jazzcashId || null,
    easypaisa_id: s.easypaisaId || null,
    smtp_host: s.smtpHost || null,
    smtp_port: s.smtpPort || "587",
    smtp_user: s.smtpUser || null,
    smtp_pass: s.smtpPass || null,
    smtp_from: s.smtpFrom || null,
    notify_new_order: s.notifyNewOrder,
    notify_low_stock: s.notifyLowStock,
    notify_new_review: s.notifyNewReview,
    notify_daily_summary: s.notifyDailySummary,
  };
}

export function maskSecrets(s: StoreSettings): StoreSettings {
  return {
    ...s,
    stripeSecret: s.stripeSecret ? "••••••••" : "",
    smtpPass: s.smtpPass ? "••••••••" : "",
  };
}

export function mergeSecrets(incoming: StoreSettings, existing: StoreSettings): StoreSettings {
  return {
    ...incoming,
    stripeSecret: incoming.stripeSecret === "••••••••" ? existing.stripeSecret : incoming.stripeSecret,
    smtpPass: incoming.smtpPass === "••••••••" ? existing.smtpPass : incoming.smtpPass,
  };
}
