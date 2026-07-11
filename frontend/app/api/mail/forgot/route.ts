import { NextResponse } from "next/server";
import { loadMailSettings, passwordResetHtml, sendMail, smtpConfigured } from "@/lib/mail";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  const body = (await req.json()) as { email?: string };
  if (!body.email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const settings = await loadMailSettings();
  if (!smtpConfigured(settings)) {
    return NextResponse.json(
      { error: "SMTP is not configured. Set it up in Admin → Settings → Email / SMTP." },
      { status: 503 },
    );
  }

  const admin = supabaseAdmin();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wabil1.vercel.app";

  try {
    let resetLink = `${siteUrl}/reset`;

    if (admin) {
      const { data, error } = await admin.auth.admin.generateLink({
        type: "recovery",
        email: body.email,
        options: { redirectTo: `${siteUrl}/reset` },
      });
      if (!error && data.properties?.action_link) {
        resetLink = data.properties.action_link;
      }
    }

    await sendMail({
      settings,
      to: body.email,
      subject: `${settings.storeName} — Reset your password`,
      html: passwordResetHtml({ storeName: settings.storeName, link: resetLink }),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to send reset email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
