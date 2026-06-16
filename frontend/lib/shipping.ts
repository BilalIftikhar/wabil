export interface ShippingMethod {
  id: string;
  name: string;
  pricePkr: number;
  etaDays: string;
}

export const SHIPPING_METHODS: ShippingMethod[] = [
  { id: "standard", name: "Standard (TCS)", pricePkr: 300, etaDays: "3–5 days" },
  { id: "express", name: "Express (Leopards)", pricePkr: 600, etaDays: "1–2 days" },
  { id: "free", name: "Free Shipping", pricePkr: 0, etaDays: "5–7 days" },
];

export const PAYMENT_OPTIONS = [
  { id: "card", label: "Credit / Debit Card", hint: "Visa, Mastercard via Stripe" },
  { id: "jazzcash", label: "JazzCash", hint: "Mobile wallet" },
  { id: "easypaisa", label: "EasyPaisa", hint: "Mobile wallet" },
  { id: "cod", label: "Cash on Delivery", hint: "Pay when it arrives" },
] as const;
