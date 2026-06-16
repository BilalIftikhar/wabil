"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type CurrencyCode,
  convertFromPKR,
  fetchRates,
  formatMoney,
} from "@/lib/currency";

interface CurrencyState {
  code: CurrencyCode;
  rates: Record<string, number>;
  setCode: (code: CurrencyCode) => void;
  loadRates: () => Promise<void>;
  format: (amountPkr: number) => string;
}

export const useCurrency = create<CurrencyState>()(
  persist(
    (set, get) => ({
      code: "PKR",
      rates: { PKR: 278, USD: 1 },
      setCode: (code) => set({ code }),
      loadRates: async () => {
        const rates = await fetchRates();
        set({ rates });
      },
      format: (amountPkr) => {
        const { code, rates } = get();
        return formatMoney(convertFromPKR(amountPkr, code, rates), code);
      },
    }),
    { name: "wabil-currency", partialize: (s) => ({ code: s.code }) },
  ),
);
