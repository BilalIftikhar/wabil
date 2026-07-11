"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Check, Loader2, MessageSquare, Star, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type AdminReview, adminReviews } from "@/lib/mock/admin";
import { listReviews, updateReview } from "@/lib/api/admin.supabase";
import { supabaseEnabled } from "@/lib/supabase";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDate } from "@/lib/utils";

const STATUS_COLOR = { pending: "#E07A5F", approved: "#A3B18A", rejected: "#D62828" } as const;
const TABS = ["pending", "approved", "rejected"] as const;

export default function AdminReviewsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<(typeof TABS)[number]>("pending");
  const [replyFor, setReplyFor] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const { data: reviews = adminReviews, isLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: listReviews,
    enabled: supabaseEnabled,
    staleTime: 30_000,
  });

  const { mutate: mutateReview } = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: { status?: AdminReview["status"]; reply?: string } }) =>
      updateReview(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success("Review updated");
    },
    onError: () => toast.error("Failed to update review"),
  });

  const filtered = useMemo(() => reviews.filter((r) => r.status === tab), [reviews, tab]);
  const counts = useMemo(
    () => TABS.reduce((acc, t) => ({ ...acc, [t]: reviews.filter((r) => r.status === t).length }), {} as Record<string, number>),
    [reviews],
  );

  const setStatus = (id: string, status: AdminReview["status"]) => {
    mutateReview({ id, patch: { status } });
    toast.success(`Review ${status}`);
  };

  const sendReply = (id: string) => {
    mutateReview({ id, patch: { reply: replyText } });
    setReplyFor(null);
    setReplyText("");
  };

  return (
    <div>
      <PageHeader
        title="Reviews"
        subtitle={isLoading ? "Loading…" : "Moderation queue"}
      />

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-rosegold" />
        </div>
      ) : (
        <>
          <div className="mb-5 flex gap-1 border-b border-border">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative px-4 py-2.5 text-sm font-medium capitalize transition-colors ${tab === t ? "text-rosegold" : "text-foreground/55 hover:text-foreground"}`}
              >
                {t} ({counts[t] ?? 0})
                {tab === t && (
                  <motion.div layoutId="review-tab" className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-rosegold" />
                )}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((r) => (
                <motion.div
                  key={r.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  className="rounded-2xl border border-border bg-card p-5 shadow-luxe"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{r.customer}</p>
                        <span className="text-xs text-foreground/45">on {r.product}</span>
                      </div>
                      <div className="mt-1 flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={14} className={i < r.rating ? "fill-rosegold text-rosegold" : "text-border"} />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge label={r.status} color={STATUS_COLOR[r.status]} />
                      <span className="text-xs text-foreground/45">{formatDate(r.date)}</span>
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-foreground/75">"{r.text}"</p>

                  {r.reply && (
                    <div className="mt-3 rounded-xl bg-muted p-3 text-sm">
                      <span className="font-medium text-rosegold">WABIL replied:</span> {r.reply}
                    </div>
                  )}

                  {replyFor === r.id ? (
                    <div className="mt-3 flex gap-2">
                      <input
                        autoFocus
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply…"
                        className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-rosegold"
                      />
                      <button
                        onClick={() => sendReply(r.id)}
                        className="rounded-xl bg-charcoal px-4 text-sm font-medium text-ivory"
                      >
                        Send
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 flex gap-2">
                      {r.status !== "approved" && (
                        <button
                          onClick={() => setStatus(r.id, "approved")}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-600/10 px-3 py-1.5 text-sm text-emerald-600 hover:bg-emerald-600/20"
                        >
                          <Check size={14} /> Approve
                        </button>
                      )}
                      {r.status !== "rejected" && (
                        <button
                          onClick={() => setStatus(r.id, "rejected")}
                          className="flex items-center gap-1.5 rounded-lg bg-rose-500/10 px-3 py-1.5 text-sm text-rose-500 hover:bg-rose-500/20"
                        >
                          <X size={14} /> Reject
                        </button>
                      )}
                      <button
                        onClick={() => { setReplyFor(r.id); setReplyText(r.reply ?? ""); }}
                        className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm hover:border-rosegold"
                      >
                        <MessageSquare size={14} /> Reply
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {filtered.length === 0 && (
              <p className="py-12 text-center text-foreground/40">No {tab} reviews.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
