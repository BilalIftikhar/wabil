"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Ban, Check, Loader2, Search } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminCustomers } from "@/lib/mock/admin";
import { listCustomers, setCustomerBlocked } from "@/lib/api/admin.supabase";
import { supabaseEnabled } from "@/lib/supabase";
import { useCurrency } from "@/store/useCurrency";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDate } from "@/lib/utils";

export default function AdminCustomersPage() {
  const { format } = useCurrency();
  const qc = useQueryClient();
  const [query, setQuery] = useState("");

  const { data: customers = adminCustomers, isLoading } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: listCustomers,
    enabled: supabaseEnabled,
    staleTime: 30_000,
  });

  const { mutate: toggleBlock } = useMutation({
    mutationFn: ({ id, blocked }: { id: string; blocked: boolean }) =>
      setCustomerBlocked(id, blocked),
    onSuccess: (_, { id, blocked }) => {
      qc.invalidateQueries({ queryKey: ["admin-customers"] });
      toast.success(blocked ? "Customer blocked" : "Customer unblocked");
    },
    onError: () => toast.error("Failed to update customer"),
  });

  const filtered = useMemo(
    () =>
      customers.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.email.toLowerCase().includes(query.toLowerCase()),
      ),
    [customers, query],
  );

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle={isLoading ? "Loading…" : `${customers.length} registered`}
      />

      <div className="mb-4 rounded-2xl border border-border bg-card p-4 shadow-luxe">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customers…"
            className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-rosegold"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-rosegold" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-luxe">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-foreground/50">
                <th className="p-3 font-medium">Customer</th>
                <th className="p-3 font-medium">Orders</th>
                <th className="p-3 font-medium">Total Spent</th>
                <th className="p-3 font-medium">Joined</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  className="border-b border-border/60 hover:bg-muted/40"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-charcoal text-xs font-semibold text-ivory">
                        {c.name[0]}
                      </div>
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-foreground/45">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-foreground/60">{c.orders}</td>
                  <td className="p-3 font-medium">{format(c.spentPkr)}</td>
                  <td className="p-3 text-foreground/60">{formatDate(c.joined)}</td>
                  <td className="p-3">
                    <StatusBadge
                      label={c.blocked ? "blocked" : "active"}
                      color={c.blocked ? "#D62828" : "#A3B18A"}
                    />
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => toggleBlock({ id: c.id, blocked: !c.blocked })}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs ${c.blocked ? "bg-emerald-600/10 text-emerald-600" : "bg-rose-500/10 text-rose-500"}`}
                    >
                      {c.blocked ? <Check size={13} /> : <Ban size={13} />}
                      {c.blocked ? "Unblock" : "Block"}
                    </button>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-foreground/40">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
