import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function requireAdmin(req: Request) {
  if (!url || !anonKey) {
    return { error: NextResponse.json({ error: "Supabase not configured" }, { status: 503 }) };
  }

  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const token = auth.slice(7);
  const client = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: userData, error: userError } = await client.auth.getUser(token);
  if (userError || !userData.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const { data: profile } = await client
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { user: userData.user };
}
