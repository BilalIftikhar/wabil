import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/require-admin";
import { loadMailSettings, sendMail } from "@/lib/mail";

export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if ("error" in auth && auth.error) return auth.error;

  const body = (await req.json()) as { to?: string };
  if (!body.to) {
    return NextResponse.json({ error: "Enter a recipient email" }, { status: 400 });
  }

  try {
    const settings = await loadMailSettings();
    await sendMail({
      settings,
      to: body.to,
      subject: `${settings.storeName} — SMTP test`,
      html: `<p>Your SMTP settings are working. Emails from <strong>${settings.storeName}</strong> will be sent through this mail server.</p>`,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "SMTP test failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
