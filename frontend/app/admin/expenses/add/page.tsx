"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Users, X } from "lucide-react";
import { categories, createExpense, members } from "@/lib/api/expenses";
import { CategoryIcon } from "@/components/admin/CategoryIcon";
import { MemberAvatar } from "@/components/admin/MemberAvatar";
import { convertFromPKR } from "@/lib/currency";
import { useCurrency } from "@/store/useCurrency";
import { REFERENCE_TODAY, type ExpenseSplit, equalSplit } from "@/lib/mock/expenses";

const PAYMENT_METHODS = ["cash", "card", "bank", "jazzcash", "easypaisa"] as const;

const fieldReveal = (i: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
});

export default function AddExpensePage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { rates } = useCurrency();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(REFERENCE_TODAY.toISOString().slice(0, 10));
  const [categoryId, setCategoryId] = useState(categories[0].id);
  const [paymentMethod, setPaymentMethod] = useState<(typeof PAYMENT_METHODS)[number]>("cash");
  const [description, setDescription] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState<"daily" | "weekly" | "monthly">("monthly");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [notes, setNotes] = useState("");
  const [addedById, setAddedById] = useState(members[0].id);
  const [isSplit, setIsSplit] = useState(false);
  const [splitType, setSplitType] = useState<"equal" | "custom">("equal");
  const [splitIds, setSplitIds] = useState<number[]>([members[0].id, members[1].id]);
  const [customShares, setCustomShares] = useState<Record<number, string>>({});

  const amountNum = parseFloat(amount) || 0;

  const usdPreview = useMemo(() => {
    if (!amountNum) return null;
    return convertFromPKR(amountNum, "USD", rates);
  }, [amountNum, rates]);

  // Build the split object from current form state (null when not splitting).
  const buildSplit = (): ExpenseSplit | null => {
    if (!isSplit || splitIds.length === 0) return null;
    if (splitType === "equal") return equalSplit(amountNum, splitIds);
    return {
      type: "custom",
      shares: splitIds.map((memberId) => ({ memberId, amount_pkr: parseFloat(customShares[memberId] ?? "") || 0 })),
    };
  };

  const customTotal = splitIds.reduce((s, id) => s + (parseFloat(customShares[id] ?? "") || 0), 0);
  const customRemainder = Math.round((amountNum - customTotal) * 100) / 100;
  const toggleSplitMember = (id: number) =>
    setSplitIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  const mutation = useMutation({
    mutationFn: () =>
      createExpense({
        title,
        amount_pkr: amountNum,
        date,
        category: categories.find((c) => c.id === categoryId)!,
        payment_method: paymentMethod,
        description,
        is_recurring: isRecurring,
        recurrence: isRecurring ? recurrence : null,
        tags,
        notes,
        addedBy: members.find((m) => m.id === addedById)!,
        split: buildSplit(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["expense-overview"] });
      toast.success("Expense added", { description: `${title} · Rs ${amount}` });
      router.push("/admin/expenses/list");
    },
  });

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  };

  const labelCls = "mb-1.5 block text-sm font-medium text-foreground/70";
  const inputCls =
    "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-rosegold focus:ring-2 focus:ring-rosegold/20";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!title || !amount) return toast.error("Title and amount are required");
        if (isSplit && splitIds.length === 0) return toast.error("Select at least one member to split with");
        if (isSplit && splitType === "custom" && Math.abs(customRemainder) > 0.5) {
          return toast.error(`Split shares must total the amount (off by Rs ${Math.abs(customRemainder).toLocaleString()})`);
        }
        mutation.mutate();
      }}
      className="max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-luxe"
    >
      <motion.h2 {...fieldReveal(0)} className="mb-6 font-heading text-2xl font-semibold">
        Add Expense
      </motion.h2>

      <div className="space-y-5">
        <motion.div {...fieldReveal(1)}>
          <label className={labelCls}>Title</label>
          <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Lawn fabric — 200m" />
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2">
          <motion.div {...fieldReveal(2)}>
            <label className={labelCls}>Amount (PKR)</label>
            <input
              className={inputCls}
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
            />
            <AnimatePresence>
              {usdPreview && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-1.5 text-xs text-rosegold"
                >
                  = ${usdPreview.toFixed(2)} USD today
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div {...fieldReveal(3)}>
            <label className={labelCls}>Date</label>
            <input className={inputCls} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </motion.div>
        </div>

        <motion.div {...fieldReveal(4)}>
          <label className={labelCls}>Category</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoryId(c.id)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition ${
                  categoryId === c.id ? "border-transparent text-white" : "border-border hover:border-rosegold"
                }`}
                style={categoryId === c.id ? { backgroundColor: c.color_hex } : undefined}
              >
                <CategoryIcon name={c.icon} size={14} />
                {c.name}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div {...fieldReveal(5)}>
          <label className={labelCls}>Payment Method</label>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setPaymentMethod(m)}
                className={`rounded-xl border px-3.5 py-2 text-sm capitalize transition ${
                  paymentMethod === m ? "border-rosegold bg-rosegold/10 text-rosegold" : "border-border hover:border-rosegold"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Added by */}
        <motion.div {...fieldReveal(6)}>
          <label className={labelCls}>Added by</label>
          <div className="flex flex-wrap gap-2">
            {members.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setAddedById(m.id)}
                className={`flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3 text-sm transition ${
                  addedById === m.id ? "border-rosegold bg-rosegold/10" : "border-border hover:border-rosegold"
                }`}
              >
                <MemberAvatar member={m} size={24} />
                <span>{m.name.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Split expense */}
        <motion.div {...fieldReveal(7)} className="rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-rosegold" />
              <div>
                <p className="text-sm font-medium">Split this expense</p>
                <p className="text-xs text-foreground/50">Divide the cost between members</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsSplit((v) => !v)}
              className={`relative h-6 w-11 rounded-full transition ${isSplit ? "bg-rosegold" : "bg-muted"}`}
            >
              <motion.span
                className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
                animate={{ left: isSplit ? 22 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          </div>

          <AnimatePresence>
            {isSplit && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-3 overflow-hidden"
              >
                <div className="flex gap-2">
                  {(["equal", "custom"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSplitType(t)}
                      className={`flex-1 rounded-lg border py-1.5 text-sm capitalize transition ${
                        splitType === t ? "border-rosegold bg-rosegold/10 text-rosegold" : "border-border"
                      }`}
                    >
                      {t} split
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  {members.map((m) => {
                    const active = splitIds.includes(m.id);
                    const equalShare = active && splitType === "equal" && splitIds.length ? amountNum / splitIds.length : 0;
                    return (
                      <div key={m.id} className={`flex items-center gap-3 rounded-lg border p-2 transition ${active ? "border-rosegold/50" : "border-border"}`}>
                        <button type="button" onClick={() => toggleSplitMember(m.id)} className="flex flex-1 items-center gap-2">
                          <input type="checkbox" readOnly checked={active} className="accent-rosegold" />
                          <MemberAvatar member={m} size={24} />
                          <span className="text-sm">{m.name}</span>
                        </button>
                        {active &&
                          (splitType === "equal" ? (
                            <span className="text-sm font-medium text-foreground/70">Rs {Math.round(equalShare).toLocaleString()}</span>
                          ) : (
                            <input
                              type="number"
                              value={customShares[m.id] ?? ""}
                              onChange={(e) => setCustomShares((s) => ({ ...s, [m.id]: e.target.value }))}
                              placeholder="0"
                              className="w-28 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-rosegold"
                            />
                          ))}
                      </div>
                    );
                  })}
                </div>

                {splitType === "custom" && (
                  <p className={`text-xs ${Math.abs(customRemainder) > 0.5 ? "text-rose-500" : "text-emerald-600"}`}>
                    {Math.abs(customRemainder) > 0.5
                      ? `Remaining to allocate: Rs ${customRemainder.toLocaleString()}`
                      : "Shares balanced ✓"}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div {...fieldReveal(8)}>
          <label className={labelCls}>Description</label>
          <textarea className={inputCls} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </motion.div>

        <motion.div {...fieldReveal(7)} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
          <div>
            <p className="text-sm font-medium">Recurring expense</p>
            <p className="text-xs text-foreground/50">Repeat automatically</p>
          </div>
          <button
            type="button"
            onClick={() => setIsRecurring((v) => !v)}
            className={`relative h-6 w-11 rounded-full transition ${isRecurring ? "bg-rosegold" : "bg-muted"}`}
          >
            <motion.span
              className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
              animate={{ left: isRecurring ? 22 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
        </motion.div>

        <AnimatePresence>
          {isRecurring && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className={labelCls}>Recurrence</label>
              <div className="flex gap-2">
                {(["daily", "weekly", "monthly"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRecurrence(r)}
                    className={`rounded-xl border px-3.5 py-2 text-sm capitalize transition ${
                      recurrence === r ? "border-rosegold bg-rosegold/10 text-rosegold" : "border-border"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div {...fieldReveal(8)}>
          <label className={labelCls}>Tags</label>
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border px-3 py-2">
            {tags.map((t) => (
              <span key={t} className="flex items-center gap-1 rounded-full bg-blush/50 px-2.5 py-1 text-xs">
                {t}
                <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))}>
                  <X size={12} />
                </button>
              </span>
            ))}
            <input
              className="flex-1 bg-transparent text-sm outline-none"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Type & press Enter"
            />
          </div>
        </motion.div>

        <motion.div {...fieldReveal(9)}>
          <label className={labelCls}>Notes</label>
          <textarea className={inputCls} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </motion.div>

        <motion.button
          {...fieldReveal(10)}
          whileTap={{ scale: 0.97 }}
          disabled={mutation.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-charcoal py-3 font-medium text-ivory transition hover:bg-charcoal/90 disabled:opacity-60"
        >
          <Plus size={18} />
          {mutation.isPending ? "Saving…" : "Add Expense"}
        </motion.button>
      </div>
    </form>
  );
}
