export interface ShippingMethod {
  id: string;
  name: string;
  pricePkr: number;
  etaDays: string;
}

export const SHIPPING_METHODS: ShippingMethod[] = [
  { id: "standard", name: "Standard Delivery", pricePkr: 200, etaDays: "3–5 days" },
];

export const PAYMENT_OPTIONS = [
  { id: "cod", label: "Cash on Delivery", hint: "Pay in cash when your order arrives" },
  // Other methods are pending — re-enable once the payment gateways are live.
  // { id: "card", label: "Credit / Debit Card", hint: "Visa, Mastercard via Stripe" },
  // { id: "jazzcash", label: "JazzCash", hint: "Mobile wallet" },
  // { id: "easypaisa", label: "EasyPaisa", hint: "Mobile wallet" },
] as const;
