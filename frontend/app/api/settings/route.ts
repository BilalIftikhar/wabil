import { NextResponse } from "next/server";
import {
  DEFAULT_SETTINGS,
  maskSecrets,
  mergeSecrets,
  rowToSettings,
  settingsToRow,
  type StoreSettings,
  type StoreSettingsRow,
} from "@/lib/settings";
import { requireAdmin } from "@/lib/api/require-admin";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function readSettings(): Promise<StoreSettings> {
  const db = supabaseAdmin();
  if (!db) return DEFAULT_SETTINGS;

  const { data, error } = await db.from("store_settings").select("*").eq("id", 1).maybeSingle();
  if (error || !data) return DEFAULT_SETTINGS;
  return rowToSettings(data as StoreSettingsRow);
}

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if ("error" in auth && auth.error) return auth.error;

  const settings = await readSettings();
  return NextResponse.json({ settings: maskSecrets(settings) });
}

export async function PUT(req: Request) {
  const auth = await requireAdmin(req);
  if ("error" in auth && auth.error) return auth.error;

  const db = supabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: "Server database not configured" }, { status: 503 });
  }

  const body = (await req.json()) as { settings?: StoreSettings };
  if (!body.settings) {
    return NextResponse.json({ error: "Missing settings" }, { status: 400 });
  }

  const existing = await readSettings();
  const merged = mergeSecrets(body.settings, existing);
  const row = { id: 1, ...settingsToRow(merged), updated_at: new Date().toISOString() };

  const { error } = await db.from("store_settings").upsert(row);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ settings: maskSecrets(merged), ok: true });
}
