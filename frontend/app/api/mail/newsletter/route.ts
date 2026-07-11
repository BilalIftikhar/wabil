import { NextResponse } from "next/server";
import { loadMailSettings, sendMail, smtpConfigured } from "@/lib/mail";

export async function POST(req: Request) {
  const body = (await req.json()) as { email?: string };
  if (!body.email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const settings = await loadMailSettings();
  if (!smtpConfigured(settings)) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    await sendMail({
      settings,
      to: body.email,
      subject: `Welcome to ${settings.storeName}`,
      html: `<p>Thanks for subscribing to <strong>${settings.storeName}</strong>. You'll be first to hear about new arrivals and offers.</p>`,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to subscribe";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
