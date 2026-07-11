import { NextResponse } from "next/server";
import { DEFAULT_SETTINGS, rowToSettings, type StoreSettingsRow } from "@/lib/settings";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const db = supabaseAdmin();
  if (!db) {
    return NextResponse.json({
      settings: {
        storeName: DEFAULT_SETTINGS.storeName,
        supportEmail: DEFAULT_SETTINGS.supportEmail,
        phone: DEFAULT_SETTINGS.phone,
        defaultCurrency: DEFAULT_SETTINGS.defaultCurrency,
      },
    });
  }

  const { data, error } = await db
    .from("store_settings")
    .select("store_name, support_email, phone, default_currency")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({
      settings: {
        storeName: DEFAULT_SETTINGS.storeName,
        supportEmail: DEFAULT_SETTINGS.supportEmail,
        phone: DEFAULT_SETTINGS.phone,
        defaultCurrency: DEFAULT_SETTINGS.defaultCurrency,
      },
    });
  }

  const row = data as Pick<StoreSettingsRow, "store_name" | "support_email" | "phone" | "default_currency">;
  return NextResponse.json({
    settings: {
      storeName: row.store_name,
      supportEmail: row.support_email,
      phone: row.phone ?? "",
      defaultCurrency: row.default_currency,
    },
  });
}
