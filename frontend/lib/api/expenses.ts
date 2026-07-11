// Client-side data layer for the expense tracker.
// Routes to Supabase when NEXT_PUBLIC_SUPABASE_* env vars are set, otherwise
// falls back to the in-memory mock store so the app works without a backend.

import {
  type Budget,
  type Expense,
  type Income,
  type Member,
  REFERENCE_TODAY,
  budgets as budgetsSeed,
  categories,
  expenses as expensesSeed,
  income as incomeSeed,
  members,
} from "@/lib/mock/expenses";
import { supabaseEnabled } from "@/lib/supabase";
import * as sb from "@/lib/api/expenses.supabase";

// Mutable in-memory copies (reset on reload — demo only).
let _expenses = [...expensesSeed];
let _income = [...incomeSeed];
let _budgets = [...budgetsSeed];
let _seq = 9000;

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

export interface ExpenseFilters {
  category?: number;
  payment_method?: string;
  member?: number;
  from?: string;
  to?: string;
  min?: number;
  max?: number;
  search?: string;
  sort?: "date" | "amount_pkr";
  dir?: "asc" | "desc";
}

export async function listExpenses(filters: ExpenseFilters = {}): Promise<Expense[]> {
  if (supabaseEnabled) return sb.listExpenses(filters);
  await delay();
  let rows = [..._expenses];
  if (filters.category) rows = rows.filter((e) => e.category.id === filters.category);
  if (filters.payment_method) rows = rows.filter((e) => e.payment_method === filters.payment_method);
  if (filters.member) {
    rows = rows.filter(
      (e) => e.addedBy.id === filters.member || e.split?.shares.some((s) => s.memberId === filters.member),
    );
  }
  if (filters.from) rows = rows.filter((e) => e.date >= filters.from!);
  if (filters.to) rows = rows.filter((e) => e.date <= filters.to!);
  if (filters.min != null) rows = rows.filter((e) => e.amount_pkr >= filters.min!);
  if (filters.max != null) rows = rows.filter((e) => e.amount_pkr <= filters.max!);
  if (filters.search) {
    const t = filters.search.toLowerCase();
    rows = rows.filter(
      (e) => e.title.toLowerCase().includes(t) || e.tags.some((tag) => tag.toLowerCase().includes(t)),
    );
  }
  const sort = filters.sort ?? "date";
  const dir = filters.dir ?? "desc";
  rows.sort((a, b) => {
    const av = sort === "amount_pkr" ? a.amount_pkr : a.date;
    const bv = sort === "amount_pkr" ? b.amount_pkr : b.date;
    return (av < bv ? -1 : av > bv ? 1 : 0) * (dir === "asc" ? 1 : -1);
  });
  return rows;
}

export async function createExpense(input: Omit<Expense, "id">): Promise<Expense> {
  if (supabaseEnabled) { await sb.createExpense(input); return { ...input, id: Date.now() }; }
  await delay();
  const row = { ...input, id: ++_seq };
  _expenses = [row, ..._expenses];
  return row;
}

export async function updateExpense(id: number, patch: Partial<Expense>): Promise<void> {
  await delay();
  _expenses = _expenses.map((e) => (e.id === id ? { ...e, ...patch } : e));
}

export async function deleteExpenses(ids: number[]): Promise<void> {
  if (supabaseEnabled) return sb.deleteExpenses(ids);
  await delay();
  _expenses = _expenses.filter((e) => !ids.includes(e.id));
}

export async function listIncome(): Promise<Income[]> {
  if (supabaseEnabled) return sb.listIncome();
  await delay();
  return [..._income].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function createIncome(input: Omit<Income, "id">): Promise<Income> {
  if (supabaseEnabled) return sb.createIncome(input);
  await delay();
  const row = { ...input, id: ++_seq };
  _income = [row, ..._income];
  return row;
}

export async function listBudgets(): Promise<Budget[]> {
  if (supabaseEnabled) return sb.listBudgets();
  await delay();
  return [..._budgets];
}

export async function upsertBudget(input: Omit<Budget, "id">): Promise<void> {
  if (supabaseEnabled) return sb.upsertBudget(input);
  await delay();
  const existing = _budgets.find(
    (b) =>
      b.category.id === input.category.id &&
      b.month === input.month &&
      b.year === input.year,
  );
  if (existing) {
    _budgets = _budgets.map((b) => (b.id === existing.id ? { ...b, budget_amount: input.budget_amount } : b));
  } else {
    _budgets = [..._budgets, { ...input, id: ++_seq }];
  }
}

export interface Overview {
  summary: {
    total_spent: number;
    total_income: number;
    net_balance: number;
    budget_total: number;
    budget_used_pct: number;
  };
  by_category: { category: string; color: string; icon: string; total: number }[];
  by_member: { member: string; color: string; total: number }[];
  trend: { month: string; expense: number; income: number }[];
  recent: Expense[];
}

export async function getOverview(): Promise<Overview> {
  if (supabaseEnabled) return sb.getOverview();
  await delay();
  const now = REFERENCE_TODAY;
  const y = now.getFullYear();
  const m = now.getMonth();
  const inMonth = (d: string) => {
    const dt = new Date(d);
    return dt.getFullYear() === y && dt.getMonth() === m;
  };

  const monthExpenses = _expenses.filter((e) => inMonth(e.date));
  const totalSpent = monthExpenses.reduce((s, e) => s + e.amount_pkr, 0);
  const totalIncome = _income.filter((i) => inMonth(i.date)).reduce((s, i) => s + i.amount_pkr, 0);
  const budgetTotal = _budgets
    .filter((b) => b.month === m + 1 && b.year === y)
    .reduce((s, b) => s + b.budget_amount, 0);

  const byCatMap = new Map<number, number>();
  monthExpenses.forEach((e) => byCatMap.set(e.category.id, (byCatMap.get(e.category.id) ?? 0) + e.amount_pkr));
  const by_category = [...byCatMap.entries()].map(([id, total]) => {
    const c = categories.find((c) => c.id === id)!;
    return { category: c.name, color: c.color_hex, icon: c.icon, total };
  });

  // Attribute each expense to members: split shares if present, else fully to addedBy.
  const byMemberMap = new Map<number, number>();
  const addMember = (id: number, amt: number) => byMemberMap.set(id, (byMemberMap.get(id) ?? 0) + amt);
  monthExpenses.forEach((e) => {
    if (e.split && e.split.shares.length) {
      e.split.shares.forEach((s) => addMember(s.memberId, s.amount_pkr));
    } else {
      addMember(e.addedBy.id, e.amount_pkr);
    }
  });
  const by_member = [...byMemberMap.entries()]
    .map(([id, total]) => {
      const m = members.find((m) => m.id === id)!;
      return { member: m.name, color: m.color, total };
    })
    .sort((a, b) => b.total - a.total);

  const trend = Array.from({ length: 6 }, (_, idx) => {
    const i = 5 - idx;
    const dt = new Date(y, m - i, 1);
    const label = dt.toLocaleString("en", { month: "short" });
    const exp = _expenses
      .filter((e) => {
        const d = new Date(e.date);
        return d.getFullYear() === dt.getFullYear() && d.getMonth() === dt.getMonth();
      })
      .reduce((s, e) => s + e.amount_pkr, 0);
    const inc = _income
      .filter((x) => {
        const d = new Date(x.date);
        return d.getFullYear() === dt.getFullYear() && d.getMonth() === dt.getMonth();
      })
      .reduce((s, x) => s + x.amount_pkr, 0);
    return { month: label, expense: exp, income: inc };
  });

  const recent = [..._expenses].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 10);

  return {
    summary: {
      total_spent: totalSpent,
      total_income: totalIncome,
      net_balance: totalIncome - totalSpent,
      budget_total: budgetTotal,
      budget_used_pct: budgetTotal > 0 ? Math.round((totalSpent / budgetTotal) * 1000) / 10 : 0,
    },
    by_category,
    by_member,
    trend,
    recent,
  };
}

export { categories, members };
export type { Member };
