// Seed data + in-memory store for the expense tracker so the admin panel
// runs without a backend. Swap lib/api/expenses.ts to hit Supabase / Laravel
// when a backend is configured.

export interface ExpenseCategory {
  id: number;
  name: string;
  icon: string;
  color_hex: string;
  type: "personal" | "business";
}

// A "member" is a person who manages WABIL finances and can add / share expenses.
export interface Member {
  id: number;
  name: string;
  role: string;
  color: string;
}

// How a single expense is divided between members.
export interface ExpenseSplit {
  type: "equal" | "custom";
  shares: { memberId: number; amount_pkr: number }[];
}

export interface Expense {
  id: number;
  title: string;
  description?: string;
  amount_pkr: number;
  date: string;
  payment_method: "cash" | "card" | "bank" | "jazzcash" | "easypaisa";
  is_recurring: boolean;
  recurrence?: "daily" | "weekly" | "monthly" | null;
  tags: string[];
  notes?: string;
  category: ExpenseCategory;
  addedBy: Member; // who recorded the expense
  split: ExpenseSplit | null; // null = not split (fully owned by addedBy)
}

export interface Income {
  id: number;
  source: string;
  amount_pkr: number;
  date: string;
  note?: string;
}

export interface Budget {
  id: number;
  category: ExpenseCategory;
  month: number;
  year: number;
  budget_amount: number;
}

export const categories: ExpenseCategory[] = [
  { id: 1, name: "Fabric & Stock", icon: "shirt", color_hex: "#C9A96E", type: "business" },
  { id: 2, name: "Marketing", icon: "megaphone", color_hex: "#F4C2C2", type: "business" },
  { id: 3, name: "Salaries", icon: "users", color_hex: "#1A1A2E", type: "business" },
  { id: 4, name: "Logistics", icon: "truck", color_hex: "#8E9AAF", type: "business" },
  { id: 5, name: "Groceries", icon: "shopping-basket", color_hex: "#A3B18A", type: "personal" },
  { id: 6, name: "Utilities", icon: "zap", color_hex: "#E07A5F", type: "personal" },
  { id: 7, name: "Dining", icon: "utensils", color_hex: "#BC6C25", type: "personal" },
  { id: 8, name: "Health", icon: "heart-pulse", color_hex: "#D62828", type: "personal" },
];

export const members: Member[] = [
  { id: 1, name: "Wabil Ahmed", role: "Owner", color: "#C9A96E" },
  { id: 2, name: "Hamza Tariq", role: "Co-owner", color: "#8E9AAF" },
  { id: 3, name: "Sana Yousuf", role: "Accountant", color: "#A3B18A" },
  { id: 4, name: "Bilal Khan", role: "Manager", color: "#E07A5F" },
];

const cat = (id: number) => categories.find((c) => c.id === id)!;
const mem = (id: number) => members.find((m) => m.id === id)!;

// Helper to build an equal split across member ids.
export function equalSplit(amount: number, memberIds: number[]): ExpenseSplit {
  const each = Math.round((amount / memberIds.length) * 100) / 100;
  return {
    type: "equal",
    shares: memberIds.map((memberId, i) => ({
      memberId,
      // last share absorbs rounding remainder
      amount_pkr: i === memberIds.length - 1 ? Math.round((amount - each * (memberIds.length - 1)) * 100) / 100 : each,
    })),
  };
}

const today = new Date("2026-06-17");
function daysAgo(n: number) {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
function monthsAgo(n: number, day = 12) {
  const d = new Date(today.getFullYear(), today.getMonth() - n, day);
  return d.toISOString().slice(0, 10);
}

let expenseSeq = 100;
const seed: Omit<Expense, "id">[] = [
  { title: "Lawn fabric — 200m", amount_pkr: 320000, date: daysAgo(1), payment_method: "bank", is_recurring: false, tags: ["summer", "lawn"], category: cat(1), addedBy: mem(1), split: null },
  { title: "Instagram ads", amount_pkr: 85000, date: daysAgo(2), payment_method: "card", is_recurring: true, recurrence: "monthly", tags: ["meta", "ads"], category: cat(2), addedBy: mem(4), split: null },
  { title: "Tailoring staff salaries", amount_pkr: 540000, date: daysAgo(3), payment_method: "bank", is_recurring: true, recurrence: "monthly", tags: ["payroll"], category: cat(3), addedBy: mem(3), split: { type: "custom", shares: [{ memberId: 1, amount_pkr: 300000 }, { memberId: 2, amount_pkr: 240000 }] } },
  { title: "TCS courier batch", amount_pkr: 47500, date: daysAgo(4), payment_method: "easypaisa", is_recurring: false, tags: ["shipping"], category: cat(4), addedBy: mem(4), split: null },
  { title: "Weekly groceries (office)", amount_pkr: 18900, date: daysAgo(5), payment_method: "cash", is_recurring: true, recurrence: "weekly", tags: [], category: cat(5), addedBy: mem(3), split: equalSplit(18900, [1, 2, 3, 4]) },
  { title: "Electricity bill", amount_pkr: 36400, date: daysAgo(6), payment_method: "jazzcash", is_recurring: true, recurrence: "monthly", tags: ["k-electric"], category: cat(6), addedBy: mem(1), split: null },
  { title: "Team lunch", amount_pkr: 12300, date: daysAgo(7), payment_method: "card", is_recurring: false, tags: ["dawat"], category: cat(7), addedBy: mem(2), split: equalSplit(12300, [1, 2, 4]) },
  { title: "Pharmacy", amount_pkr: 6800, date: daysAgo(9), payment_method: "cash", is_recurring: false, tags: [], category: cat(8), addedBy: mem(2), split: null },
  { title: "Embroidery thread restock", amount_pkr: 96000, date: daysAgo(11), payment_method: "bank", is_recurring: false, tags: ["zari"], category: cat(1), addedBy: mem(1), split: null },
  { title: "Influencer collab", amount_pkr: 150000, date: daysAgo(13), payment_method: "bank", is_recurring: false, tags: ["pr"], category: cat(2), addedBy: mem(4), split: { type: "custom", shares: [{ memberId: 1, amount_pkr: 100000 }, { memberId: 4, amount_pkr: 50000 }] } },
  // previous months for trend chart
  { title: "Fabric — May", amount_pkr: 410000, date: monthsAgo(1), payment_method: "bank", is_recurring: false, tags: [], category: cat(1), addedBy: mem(1), split: null },
  { title: "Ads — May", amount_pkr: 92000, date: monthsAgo(1, 5), payment_method: "card", is_recurring: false, tags: [], category: cat(2), addedBy: mem(4), split: null },
  { title: "Salaries — May", amount_pkr: 520000, date: monthsAgo(1, 1), payment_method: "bank", is_recurring: false, tags: [], category: cat(3), addedBy: mem(3), split: null },
  { title: "Fabric — Apr", amount_pkr: 380000, date: monthsAgo(2), payment_method: "bank", is_recurring: false, tags: [], category: cat(1), addedBy: mem(1), split: null },
  { title: "Salaries — Apr", amount_pkr: 500000, date: monthsAgo(2, 1), payment_method: "bank", is_recurring: false, tags: [], category: cat(3), addedBy: mem(3), split: null },
  { title: "Fabric — Mar", amount_pkr: 350000, date: monthsAgo(3), payment_method: "bank", is_recurring: false, tags: [], category: cat(1), addedBy: mem(1), split: null },
  { title: "Fabric — Feb", amount_pkr: 300000, date: monthsAgo(4), payment_method: "bank", is_recurring: false, tags: [], category: cat(1), addedBy: mem(2), split: null },
  { title: "Fabric — Jan", amount_pkr: 280000, date: monthsAgo(5), payment_method: "bank", is_recurring: false, tags: [], category: cat(1), addedBy: mem(2), split: null },
];

export const expenses: Expense[] = seed.map((e) => ({ ...e, id: ++expenseSeq }));

export const income: Income[] = [
  { id: 1, source: "Online store sales", amount_pkr: 2450000, date: daysAgo(2), note: "Eid collection drop" },
  { id: 2, source: "Wholesale order — Dubai", amount_pkr: 890000, date: daysAgo(8), note: "50 units bridal" },
  { id: 3, source: "Exhibition stall", amount_pkr: 320000, date: daysAgo(14), note: "Expo Centre" },
  { id: 4, source: "Sales — May", amount_pkr: 2100000, date: monthsAgo(1), note: "" },
  { id: 5, source: "Sales — Apr", amount_pkr: 1850000, date: monthsAgo(2), note: "" },
  { id: 6, source: "Sales — Mar", amount_pkr: 1600000, date: monthsAgo(3), note: "" },
  { id: 7, source: "Sales — Feb", amount_pkr: 1400000, date: monthsAgo(4), note: "" },
  { id: 8, source: "Sales — Jan", amount_pkr: 1250000, date: monthsAgo(5), note: "" },
];

export const budgets: Budget[] = [
  { id: 1, category: cat(1), month: 6, year: 2026, budget_amount: 500000 },
  { id: 2, category: cat(2), month: 6, year: 2026, budget_amount: 200000 },
  { id: 3, category: cat(3), month: 6, year: 2026, budget_amount: 600000 },
  { id: 4, category: cat(4), month: 6, year: 2026, budget_amount: 80000 },
  { id: 5, category: cat(5), month: 6, year: 2026, budget_amount: 60000 },
  { id: 6, category: cat(6), month: 6, year: 2026, budget_amount: 40000 },
  { id: 7, category: cat(7), month: 6, year: 2026, budget_amount: 30000 },
  { id: 8, category: cat(8), month: 6, year: 2026, budget_amount: 25000 },
];

export const REFERENCE_TODAY = today;
