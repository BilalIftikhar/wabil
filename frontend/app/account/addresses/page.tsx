"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Star } from "lucide-react";
import { toast } from "sonner";

interface Address {
  id: number;
  label: string;
  name: string;
  line: string;
  city: string;
  phone: string;
  primary: boolean;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([
    { id: 1, label: "Home", name: "Ayesha Khan", line: "12 Gulberg III", city: "Lahore 54000", phone: "+92 300 1234567", primary: true },
    { id: 2, label: "Office", name: "Ayesha Khan", line: "Mall Road, Plaza 4", city: "Lahore 54000", phone: "+92 321 7654321", primary: false },
  ]);

  const makePrimary = (id: number) => {
    setAddresses((a) => a.map((x) => ({ ...x, primary: x.id === id })));
    toast.success("Primary address updated");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-semibold">Saved Addresses</h2>
        <button
          onClick={() => toast("Address form modal — wire to API")}
          className="flex items-center gap-2 rounded-xl bg-charcoal px-4 py-2 text-sm font-medium text-ivory"
        >
          <Plus size={16} /> Add new
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {addresses.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`rounded-2xl border p-5 shadow-luxe ${a.primary ? "border-rosegold bg-rosegold/5" : "border-border bg-card"}`}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">{a.label}</span>
              {a.primary ? (
                <span className="flex items-center gap-1 text-xs text-rosegold">
                  <Star size={12} className="fill-rosegold" /> Primary
                </span>
              ) : (
                <button onClick={() => makePrimary(a.id)} className="text-xs text-foreground/50 hover:text-rosegold">
                  Set as primary
                </button>
              )}
            </div>
            <p className="font-medium">{a.name}</p>
            <p className="text-sm text-foreground/60">{a.line}</p>
            <p className="text-sm text-foreground/60">{a.city}</p>
            <p className="mt-1 text-sm text-foreground/60">{a.phone}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
