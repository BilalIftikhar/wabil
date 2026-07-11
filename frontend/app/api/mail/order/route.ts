import { NextResponse } from "next/server";
import { loadMailSettings, orderConfirmationHtml, sendMail, smtpConfigured } from "@/lib/mail";
import { orderNotifyRecipients } from "@/lib/settings";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    email?: string;
    customerName?: string;
    orderId?: string;
    total?: string;
    items?: { name: string; qty: number; price: string }[];
  };

  if (!body.email || !body.orderId || !body.customerName) {
    return NextResponse.json({ error: "Missing order email details" }, { status: 400 });
  }

  const settings = await loadMailSettings();
  if (!smtpConfigured(settings)) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    const html = orderConfirmationHtml({
      orderId: body.orderId,
      customerName: body.customerName,
      total: body.total ?? "",
      items: body.items ?? [],
      storeName: settings.storeName,
    });

    await sendMail({
      settings,
      to: body.email,
      subject: `${settings.storeName} — Order #${body.orderId} confirmed`,
      html,
    });

    if (settings.notifyNewOrder) {
      const adminHtml = `<p>New order from <strong>${body.customerName}</strong> (${body.email}) — total ${body.total ?? ""}.</p>`;
      for (const to of orderNotifyRecipients(settings)) {
        await sendMail({
          settings,
          to,
          subject: `New order #${body.orderId}`,
          html: adminHtml,
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to send order email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
