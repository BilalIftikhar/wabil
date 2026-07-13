"use client";

import Link from "next/link";
import { useStoreSettings } from "@/store/useStore";

export function Footer() {
  const { settings } = useStoreSettings();

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <h3 className="font-heading text-3xl font-semibold">WABIL</h3>
          <p className="mt-2 text-sm italic text-rosegold">Dress Like Royalty.</p>
          <p className="mt-4 max-w-xs text-sm text-foreground/55">
            Premium ladies suits, bridal couture & everyday elegance — crafted in Pakistan.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide">Shop</h4>
          <ul className="space-y-2 text-sm text-foreground/55">
            {[
              { label: "New Arrivals", href: "/shop" },
              { label: "Bridal", href: "/categories/bridal" },
              { label: "Formal", href: "/categories/formal" },
              { label: "Party", href: "/categories/party" },
              { label: "Unstitched", href: "/categories/unstitched" },
            ].map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="hover:text-rosegold">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide">Get in touch</h4>
          <ul className="space-y-2 text-sm text-foreground/55">
            <li>
              <Link href="/account" className="hover:text-rosegold">
                Track Order
              </Link>
            </li>
            {settings.supportEmail && (
              <li>
                <a href={`mailto:${settings.supportEmail}`} className="hover:text-rosegold">
                  {settings.supportEmail}
                </a>
              </li>
            )}
            {settings.phone && (
              <li>
                <a
                  href={`https://wa.me/${settings.phone.replace(/[^\d]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-rosegold"
                >
                  WhatsApp: {settings.phone}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-foreground/40">
        © 2026 {settings.storeName}. All rights reserved.
      </div>
    </footer>
  );
}
