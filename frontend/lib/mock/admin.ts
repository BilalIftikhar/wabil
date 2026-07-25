// Admin-side mock data for the CRUD sections. Mirrors the intended Laravel
// resources so pages can be swapped to live API calls later.

export interface AdminVariant {
  size: string;
  color: string;
  stock: number;
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  pricePkr: number;
  comparePkr?: number;
  image: string;
  status: "active" | "draft";
  variants: AdminVariant[];
  seoTitle?: string;
  seoDescription?: string;
}

export const adminProducts: AdminProduct[] = [];

export interface AdminOrder {
  id: string;
  customer: string;
  email: string;
  date: string;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  totalPkr: number;
  items: number;
  timeline: { label: string; at: string; done: boolean }[];
}

export const ORDER_STATUSES: AdminOrder["status"][] = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

export const STATUS_COLOR: Record<AdminOrder["status"], string> = {
  Pending: "#E07A5F",
  Processing: "#8E9AAF",
  Shipped: "#C9A96E",
  Delivered: "#A3B18A",
  Cancelled: "#D62828",
};

export const adminOrders: AdminOrder[] = [
  {
    id: "WB748210", customer: "Ayesha Khan", email: "ayesha@example.com", date: "2026-06-15",
    status: "Processing", totalPkr: 27400, items: 3,
    timeline: [
      { label: "Order placed", at: "2026-06-15 10:24", done: true },
      { label: "Payment confirmed", at: "2026-06-15 10:25", done: true },
      { label: "Processing", at: "2026-06-15 14:10", done: true },
      { label: "Shipped", at: "", done: false },
      { label: "Delivered", at: "", done: false },
    ],
  },
  {
    id: "WB748055", customer: "Fatima Riaz", email: "fatima@example.com", date: "2026-06-14",
    status: "Shipped", totalPkr: 18500, items: 1,
    timeline: [
      { label: "Order placed", at: "2026-06-14 09:00", done: true },
      { label: "Payment confirmed", at: "2026-06-14 09:01", done: true },
      { label: "Processing", at: "2026-06-14 11:00", done: true },
      { label: "Shipped", at: "2026-06-15 08:30", done: true },
      { label: "Delivered", at: "", done: false },
    ],
  },
  {
    id: "WB747980", customer: "Noor Sheikh", email: "noor@example.com", date: "2026-06-13",
    status: "Delivered", totalPkr: 89000, items: 1,
    timeline: [
      { label: "Order placed", at: "2026-06-10 16:40", done: true },
      { label: "Payment confirmed", at: "2026-06-10 16:42", done: true },
      { label: "Processing", at: "2026-06-11 10:00", done: true },
      { label: "Shipped", at: "2026-06-12 09:00", done: true },
      { label: "Delivered", at: "2026-06-13 13:20", done: true },
    ],
  },
  {
    id: "WB747820", customer: "Sana Malik", email: "sana@example.com", date: "2026-06-12",
    status: "Pending", totalPkr: 14200, items: 1,
    timeline: [{ label: "Order placed", at: "2026-06-12 19:05", done: true }],
  },
];

export interface AdminCoupon {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  expiry: string;
  used: number;
  limit: number;
  active: boolean;
}

export const adminCoupons: AdminCoupon[] = [
  { id: "c1", code: "EID20", type: "percent", value: 20, expiry: "2026-07-01", used: 142, limit: 500, active: true },
  { id: "c2", code: "WELCOME10", type: "percent", value: 10, expiry: "2026-12-31", used: 388, limit: 1000, active: true },
  { id: "c3", code: "FLAT2000", type: "fixed", value: 2000, expiry: "2026-06-20", used: 64, limit: 100, active: true },
  { id: "c4", code: "WINTER15", type: "percent", value: 15, expiry: "2026-01-31", used: 210, limit: 300, active: false },
];

export interface AdminReview {
  id: string;
  product: string;
  customer: string;
  rating: number;
  text: string;
  date: string;
  status: "pending" | "approved" | "rejected";
  reply?: string;
}

export const adminReviews: AdminReview[] = [
  { id: "r1", product: "Rose Lawn 3-Piece", customer: "Ayesha K.", rating: 5, text: "Absolutely stunning fabric and stitching!", date: "2026-06-14", status: "pending" },
  { id: "r2", product: "Charcoal Silk Formal", customer: "Fatima R.", rating: 4, text: "Lovely colour, slightly tight on the waist.", date: "2026-06-13", status: "pending" },
  { id: "r3", product: "Zara Bridal Couture", customer: "Noor S.", rating: 5, text: "Felt like royalty on my big day. Thank you WABIL!", date: "2026-06-11", status: "approved", reply: "Thank you Noor — congratulations! ♥" },
  { id: "r4", product: "Blush Chiffon Party", customer: "Hira J.", rating: 2, text: "Colour faded after one wash.", date: "2026-06-10", status: "pending" },
];

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  orders: number;
  spentPkr: number;
  joined: string;
  blocked: boolean;
}

export const adminCustomers: AdminCustomer[] = [
  { id: "u1", name: "Ayesha Khan", email: "ayesha@example.com", orders: 12, spentPkr: 184000, joined: "2025-02-11", blocked: false },
  { id: "u2", name: "Fatima Riaz", email: "fatima@example.com", orders: 7, spentPkr: 96500, joined: "2025-05-03", blocked: false },
  { id: "u3", name: "Noor Sheikh", email: "noor@example.com", orders: 3, spentPkr: 251000, joined: "2025-09-22", blocked: false },
  { id: "u4", name: "Sana Malik", email: "sana@example.com", orders: 1, spentPkr: 14200, joined: "2026-06-01", blocked: true },
];

export interface AdminShipping {
  id: string;
  name: string;
  pricePkr: number;
  etaDays: string;
  active: boolean;
}

export const adminShipping: AdminShipping[] = [
  { id: "s1", name: "Standard (TCS)", pricePkr: 300, etaDays: "3–5 days", active: true },
  { id: "s2", name: "Express (Leopards)", pricePkr: 600, etaDays: "1–2 days", active: true },
  { id: "s3", name: "Free Shipping (over Rs 15,000)", pricePkr: 0, etaDays: "5–7 days", active: true },
];
