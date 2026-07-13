"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/store/useCart";
import { useCurrency } from "@/store/useCurrency";
import { PAYMENT_OPTIONS, SHIPPING_METHODS, type ShippingMethod } from "@/lib/shipping";

const STEPS = ["Address", "Shipping", "Payment", "Review"] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotalPkr, clear } = useCart();
  const { format } = useCurrency();

  const [step, setStep] = useState(0);
  const [address, setAddress] = useState({ name: "", email: "", phone: "", line: "", city: "", postal: "" });
  const [shipping, setShipping] = useState<ShippingMethod>(SHIPPING_METHODS[0]);
  const [payment, setPayment] = useState<string>("cod");

  const subtotal = subtotalPkr();
  const total = subtotal + shipping.pricePkr;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-heading text-3xl font-semibold">Your bag is empty</h1>
        <Link href="/shop" className="mt-4 inline-block text-rosegold underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  const next = () => {
    if (step === 0 && (!address.name || !address.email || !address.phone || !address.line || !address.city)) {
      return toast.error("Please complete your address");
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const placeOrder = async () => {
    const id = "WB" + Math.floor(100000 + (subtotal % 900000));
    const orderItems = items.map((it) => ({
      name: it.name,
      qty: it.qty,
      price: format(it.pricePkr * it.qty),
    }));

    try {
      await fetch("/api/mail/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: address.email,
          customerName: address.name,
          orderId: id,
          total: format(total),
          items: orderItems,
        }),
      });
    } catch {
      // order still completes even if email fails
    }

    clear();
    toast.success("Order placed successfully");
    router.push(`/order-confirmation/${id}`);
  };

  const input =
    "w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none transition focus:border-rosegold focus:ring-2 focus:ring-rosegold/20";

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-8 font-heading text-4xl font-semibold">Checkout</h1>

      {/* Stepper */}
      <div className="mb-10 flex items-center">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <motion.div
                animate={{
                  backgroundColor: i <= step ? "#C9A96E" : "transparent",
                  borderColor: i <= step ? "#C9A96E" : "var(--border)",
                  color: i <= step ? "#fff" : "var(--foreground)",
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold"
              >
                {i < step ? <Check size={16} /> : i + 1}
              </motion.div>
              <span className="mt-1.5 text-xs font-medium">{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="mx-2 h-px flex-1 bg-border">
                <motion.div className="h-full bg-rosegold" animate={{ width: i < step ? "100%" : "0%" }} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-luxe">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3 }}
            >
              {step === 0 && (
                <div className="space-y-4">
                  <h2 className="font-heading text-2xl font-semibold">Shipping Address</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input className={input} placeholder="Full name" value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} />
                    <input className={input} type="email" placeholder="Email" value={address.email} onChange={(e) => setAddress({ ...address, email: e.target.value })} />
                  </div>
                  <input className={input} placeholder="Phone" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
                  <input className={input} placeholder="Street address" value={address.line} onChange={(e) => setAddress({ ...address, line: e.target.value })} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input className={input} placeholder="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                    <input className={input} placeholder="Postal code" value={address.postal} onChange={(e) => setAddress({ ...address, postal: e.target.value })} />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="font-heading text-2xl font-semibold">Shipping Method</h2>
                  {SHIPPING_METHODS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setShipping(m)}
                      className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
                        shipping.id === m.id ? "border-rosegold bg-rosegold/5" : "border-border"
                      }`}
                    >
                      <div>
                        <p className="font-medium">{m.name}</p>
                        <p className="text-sm text-foreground/55">{m.etaDays}</p>
                      </div>
                      <span className="font-semibold">{m.pricePkr === 0 ? "Free" : format(m.pricePkr)}</span>
                    </button>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="font-heading text-2xl font-semibold">Payment</h2>
                  {PAYMENT_OPTIONS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPayment(p.id)}
                      className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
                        payment === p.id ? "border-rosegold bg-rosegold/5" : "border-border"
                      }`}
                    >
                      <div>
                        <p className="font-medium">{p.label}</p>
                        <p className="text-sm text-foreground/55">{p.hint}</p>
                      </div>
                      <span className={`h-4 w-4 rounded-full border-2 ${payment === p.id ? "border-rosegold bg-rosegold" : "border-border"}`} />
                    </button>
                  ))}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h2 className="font-heading text-2xl font-semibold">Review Order</h2>
                  <Summary title="Ship to" lines={[address.name, address.line, `${address.city} ${address.postal}`, address.phone]} />
                  <Summary title="Method" lines={[`${shipping.name} · ${shipping.etaDays}`]} />
                  <Summary title="Payment" lines={[PAYMENT_OPTIONS.find((p) => p.id === payment)?.label ?? ""]} />
                  <div className="rounded-xl border border-border p-4">
                    {items.map((it) => (
                      <div key={it.id} className="flex justify-between py-1 text-sm">
                        <span>
                          {it.name} × {it.qty}
                        </span>
                        <span>{format(it.pricePkr * it.qty)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium disabled:opacity-40"
            >
              Back
            </button>
            {step < STEPS.length - 1 ? (
              <motion.button whileTap={{ scale: 0.97 }} onClick={next} className="rounded-xl bg-charcoal px-6 py-2.5 text-sm font-medium text-ivory">
                Continue
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={placeOrder}
                className="flex items-center gap-2 rounded-xl bg-rosegold px-6 py-2.5 text-sm font-medium text-white"
              >
                <Lock size={15} /> Place Order · {format(total)}
              </motion.button>
            )}
          </div>
        </div>

        {/* Order summary */}
        <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-luxe">
          <h3 className="mb-4 font-heading text-xl font-semibold">Order Summary</h3>
          <div className="space-y-3">
            {items.map((it) => (
              <div key={it.id} className="flex gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.image} alt={it.name} className="h-16 w-12 rounded-lg object-cover" />
                <div className="flex flex-1 justify-between text-sm">
                  <div>
                    <p className="font-medium">{it.name}</p>
                    <p className="text-foreground/50">
                      {it.size} · ×{it.qty}
                    </p>
                  </div>
                  <span>{format(it.pricePkr * it.qty)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <Row label="Subtotal" value={format(subtotal)} />
            <Row label="Shipping" value={shipping.pricePkr === 0 ? "Free" : format(shipping.pricePkr)} />
            <div className="flex justify-between border-t border-border pt-2 font-heading text-lg font-semibold">
              <span>Total</span>
              <span>{format(total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Summary({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <p className="mb-1 text-xs uppercase tracking-wide text-foreground/45">{title}</p>
      {lines.filter(Boolean).map((l, i) => (
        <p key={i} className="text-sm">
          {l}
        </p>
      ))}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-foreground/65">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
