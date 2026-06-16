// Live currency: prices stored in PKR, converted on the client.
// Rates fetched from exchangerate-api (USD base) and cached 1h in localStorage.

export const CURRENCIES = [
  { code: "PKR", flag: "🇵🇰", symbol: "Rs" },
  { code: "USD", flag: "🇺🇸", symbol: "$" },
  { code: "GBP", flag: "🇬🇧", symbol: "£" },
  { code: "AED", flag: "🇦🇪", symbol: "د.إ" },
  { code: "SAR", flag: "🇸🇦", symbol: "﷼" },
  { code: "EUR", flag: "🇪🇺", symbol: "€" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

const FALLBACK: Record<string, number> = {
  USD: 1,
  PKR: 278,
  GBP: 0.79,
  AED: 3.67,
  SAR: 3.75,
  EUR: 0.92,
};

const CACHE_KEY = "wabil_rates";
const TTL = 1000 * 60 * 60; // 1 hour

export async function fetchRates(): Promise<Record<string, number>> {
  if (typeof window !== "undefined") {
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
      if (cached && Date.now() - cached.at < TTL) return cached.rates;
    } catch {
      /* ignore */
    }
  }

  try {
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
    const data = await res.json();
    const rates = data.rates as Record<string, number>;
    if (typeof window !== "undefined") {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), rates }));
    }
    return rates;
  } catch {
    return FALLBACK;
  }
}

/** Convert a PKR amount to the target currency using USD-based rates. */
export function convertFromPKR(
  amountPkr: number,
  target: CurrencyCode,
  rates: Record<string, number>,
): number {
  const pkr = rates.PKR ?? FALLBACK.PKR;
  const targetRate = rates[target] ?? FALLBACK[target] ?? pkr;
  return (amountPkr / pkr) * targetRate;
}

export function formatMoney(amount: number, code: CurrencyCode): string {
  const meta = CURRENCIES.find((c) => c.code === code)!;
  const value = amount.toLocaleString("en-US", {
    minimumFractionDigits: code === "PKR" ? 0 : 2,
    maximumFractionDigits: code === "PKR" ? 0 : 2,
  });
  return `${meta.symbol} ${value}`;
}
