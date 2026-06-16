import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Supabase is OPTIONAL. When the two public env vars are set (Vercel project
// settings or .env.local), `supabase` is a live client; otherwise it's null and
// the app falls back to the in-memory mock data layer in lib/api/*.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseEnabled = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = supabaseEnabled
  ? createClient(url as string, anonKey as string, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;
