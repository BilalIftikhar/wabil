// Supabase-backed implementation of the expense data layer.
// Mirrors the mock API's return shapes exactly so pages can use either source.

import { supabase } from "@/lib/supabase";
import type { Budget, Expense, ExpenseSplit, Income, Member } from "@/lib/mock/expenses";
import type { ExpenseFilters, Overview } from "@/lib/api/expenses";

function client() {
  if (!supabase) throw new Error("Supabase is not configured — set NEXT_PUBLIC_SUPABASE_URL / ANON_KEY");
  return supabase;
}

// Map a joined Supabase row → the frontend Expense shape.
function mapExpense(row: any): Expense {
  const split: ExpenseSplit | null =
    row.split_type && row.split_type !== "none" && Array.isArray(row.expense_splits) && row.expense_splits.length
      ? {
          type: row.split_type,
          shares: row.expense_splits.map((s: any) => ({ memberId: s.member_id, amount_pkr: Number(s.amount_pkr) })),
        }
      : null;

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    amount_pkr: Number(row.amount_pkr),
    date: row.date,
    payment_method: row.payment_method,
    is_recurring: row.is_recurring,
    recurrence: row.recurrence ?? null,
    tags: row.tags ?? [],
    notes: row.notes ?? undefined,
    category: row.expense_categories,
    addedBy: row.expense_members as Member,
    split,
  };
}

const SELECT = "*, expense_categories(*), expense_members(*), expense_splits(member_id, amount_pkr)";

export async function listExpenses(filters: ExpenseFilters = {}): Promise<Expense[]> {
  let q = client().from("expenses").select(SELECT);
  if (filters.category) q = q.eq("expense_category_id", filters.category);
  if (filters.payment_method) q = q.eq("payment_method", filters.payment_method);
  if (filters.member) q = q.eq("added_by_member_id", filters.member);
  if (filters.from) q = q.gte("date", filters.from);
  if (filters.to) q = q.lte("date", filters.to);
  if (filters.min != null) q = q.gte("amount_pkr", filters.min);
  if (filters.max != null) q = q.lte("amount_pkr", filters.max);
  if (filters.search) q = q.ilike("title", `%${filters.search}%`);

  const { data, error } = await q.order(filters.sort ?? "date", {
    ascending: (filters.dir ?? "desc") === "asc",
  });
  if (error) throw error;
  return (data ?? []).map(mapExpense);
}

export async function createExpense(input: Omit<Expense, "id">): Promise<void> {
  const db = client();
  const { data, error } = await db
    .from("expenses")
    .insert({
      title: input.title,
      description: input.description,
      amount_pkr: input.amount_pkr,
      date: input.date,
      payment_method: input.payment_method,
      is_recurring: input.is_recurring,
      recurrence: input.recurrence,
      tags: input.tags,
      notes: input.notes,
      expense_category_id: input.category.id,
      added_by_member_id: input.addedBy.id,
      split_type: input.split?.type ?? "none",
    })
    .select("id")
    .single();
  if (error) throw error;

  if (input.split && data) {
    const rows = input.split.shares.map((s) => ({ expense_id: data.id, member_id: s.memberId, amount_pkr: s.amount_pkr }));
    const { error: splitError } = await db.from("expense_splits").insert(rows);
    if (splitError) throw splitError;
  }
}

export async function deleteExpenses(ids: number[]): Promise<void> {
  const { error } = await client().from("expenses").delete().in("id", ids);
  if (error) throw error;
}

// ─── INCOME ──────────────────────────────────────────────────────────────────

export async function listIncome(): Promise<Income[]> {
  const { data, error } = await client()
    .from("expense_income")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    id: r.id,
    source: r.source,
    amount_pkr: Number(r.amount_pkr),
    date: r.date,
    note: r.note ?? undefined,
  }));
}

export async function createIncome(input: Omit<Income, "id">): Promise<Income> {
  const { data, error } = await client()
    .from("expense_income")
    .insert({ source: input.source, amount_pkr: input.amount_pkr, date: input.date, note: input.note })
    .select()
    .single();
  if (error) throw error;
  return { id: data.id, source: data.source, amount_pkr: Number(data.amount_pkr), date: data.date, note: data.note ?? undefined };
}

// ─── BUDGETS ─────────────────────────────────────────────────────────────────

export async function listBudgets(): Promise<Budget[]> {
  const { data, error } = await client()
    .from("expense_budgets")
    .select("*, expense_categories(*)")
    .order("id");
  if (error) throw error;
  return (data ?? []).map((b: any) => ({
    id: b.id,
    category: {
      id: b.expense_categories.id,
      name: b.expense_categories.name,
      icon: b.expense_categories.icon,
      color_hex: b.expense_categories.color_hex,
      type: b.expense_categories.type,
    },
    month: b.month,
    year: b.year,
    budget_amount: Number(b.budget_amount),
  }));
}

export async function upsertBudget(input: Omit<Budget, "id">): Promise<void> {
  const { error } = await client().from("expense_budgets").upsert(
    {
      expense_category_id: input.category.id,
      month: input.month,
      year: input.year,
      budget_amount: input.budget_amount,
    },
    { onConflict: "expense_category_id,month,year" },
  );
  if (error) throw error;
}

export async function getOverview(): Promise<Overview> {
  const rows = await listExpenses({});
  const now = new Date();
  const inMonth = (d: string) => {
    const dt = new Date(d);
    return dt.getFullYear() === now.getFullYear() && dt.getMonth() === now.getMonth();
  };
  const month = rows.filter((e) => inMonth(e.date));
  const total_spent = month.reduce((s, e) => s + e.amount_pkr, 0);

  const { data: incomeRows } = await client().from("expense_income").select("amount_pkr, date");
  const total_income = (incomeRows ?? []).filter((i: any) => inMonth(i.date)).reduce((s: number, i: any) => s + Number(i.amount_pkr), 0);

  const byCat = new Map<string, { color: string; icon: string; total: number }>();
  month.forEach((e) => {
    const k = e.category.name;
    const cur = byCat.get(k) ?? { color: e.category.color_hex, icon: e.category.icon, total: 0 };
    cur.total += e.amount_pkr;
    byCat.set(k, cur);
  });

  const byMember = new Map<string, { color: string; total: number }>();
  month.forEach((e) => {
    const add = (name: string, color: string, amt: number) => {
      const cur = byMember.get(name) ?? { color, total: 0 };
      cur.total += amt;
      byMember.set(name, cur);
    };
    if (e.split) e.split.shares.forEach((s) => add(`#${s.memberId}`, "#C9A96E", s.amount_pkr));
    else add(e.addedBy.name, e.addedBy.color, e.amount_pkr);
  });

  return {
    summary: {
      total_spent,
      total_income,
      net_balance: total_income - total_spent,
      budget_total: 0,
      budget_used_pct: 0,
    },
    by_category: [...byCat.entries()].map(([category, v]) => ({ category, ...v })),
    by_member: [...byMember.entries()].map(([member, v]) => ({ member, color: v.color, total: v.total })),
    trend: [],
    recent: rows.slice(0, 10),
  };
}
