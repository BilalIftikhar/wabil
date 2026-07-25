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

const today = new Date();

export const expenses: Expense[] = [];

export const income: Income[] = [];

export const budgets: Budget[] = [];

export const REFERENCE_TODAY = today;
