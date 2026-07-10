"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div>
          <h3 className="font-heading text-3xl font-semibold">WABIL</h3>
          <p className="mt-2 text-sm italic text-rosegold">Dress Like Royalty.</p>
          <p className="mt-4 max-w-xs text-sm text-foreground/55">
            Premium ladies suits, bridal couture & everyday elegance — crafted in Pakistan.
          </p>
        </div>

        {[
          {
            title: "Shop",
            links: [
              { label: "New Arrivals", href: "/shop" },
              { label: "Bridal", href: "/categories/bridal" },
              { label: "Formal", href: "/categories/formal" },
              { label: "Party", href: "/categories/party" },
              { label: "Unstitched", href: "/categories/unstitched" },
            ],
          },
          {
            title: "Help",
            links: [
              { label: "Size Guide", href: "/help/size-guide" },
              { label: "Shipping", href: "/help/shipping" },
              { label: "Returns", href: "/help/returns" },
              { label: "Track Order", href: "/account" },
              { label: "Contact", href: "/help/contact" },
            ],
          },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide">{col.title}</h4>
            <ul className="space-y-2 text-sm text-foreground/55">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-rosegold">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide">Newsletter</h4>
          <p className="mb-3 text-sm text-foreground/55">Join for early access & 10% off your first order.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email) {
                toast.success("Subscribed! Check your inbox ✉️");
                setEmail("");
              }
            }}
            className="flex gap-2"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-rosegold"
            />
            <button className="rounded-xl bg-charcoal px-4 text-sm font-medium text-ivory">Join</button>
          </form>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-foreground/40">
        © 2026 WABIL — Premium Ladies Suits. All rights reserved.
      </div>
    </footer>
  );
}
