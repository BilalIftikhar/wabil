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

export const adminOrders: AdminOrder[] = [];

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

export const adminCoupons: AdminCoupon[] = [];

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

export const adminReviews: AdminReview[] = [];

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  orders: number;
  spentPkr: number;
  joined: string;
  blocked: boolean;
}

export const adminCustomers: AdminCustomer[] = [];

export interface AdminShipping {
  id: string;
  name: string;
  pricePkr: number;
  etaDays: string;
  active: boolean;
}

export const adminShipping: AdminShipping[] = [];
