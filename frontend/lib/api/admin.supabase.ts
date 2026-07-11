// Supabase-backed admin API.  All functions require the current session user to
// have role = 'admin' (enforced by RLS policies on the Supabase side).

import { supabase } from "@/lib/supabase";
import type { AdminCoupon, AdminCustomer, AdminOrder, AdminReview, AdminShipping } from "@/lib/mock/admin";

function db() {
  if (!supabase) throw new Error("Supabase not configured");
  return supabase;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function buildTimeline(status: string, createdAt: string) {
  const at = new Date(createdAt).toLocaleString("en-PK", { dateStyle: "short", timeStyle: "short" });
  const STEPS = ["Pending", "Processing", "Shipped", "Delivered"];
  const idx = STEPS.findIndex((s) => s.toLowerCase() === status.toLowerCase());
  return STEPS.map((s, i) => ({
    label: s === "Pending" ? "Order placed" : s,
    at: i <= idx ? at : "",
    done: i <= idx,
  }));
}

// ─── ORDERS ────────────────────────────────────────────────────────────────

export async function listOrders(): Promise<AdminOrder[]> {
  const { data: orders, error } = await db()
    .from("orders")
    .select("*, order_items(id)")
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (orders ?? []).map((o: any) => {
    const addr = o.shipping_address ?? {};
    return {
      id: o.reference ?? String(o.id),
      customer: addr.name ?? "—",
      email: addr.email ?? "—",
      date: (o.created_at as string).split("T")[0],
      status: capitalize(o.status) as AdminOrder["status"],
      totalPkr: Number(o.total_pkr),
      items: Array.isArray(o.order_items) ? o.order_items.length : 0,
      timeline: buildTimeline(o.status, o.created_at),
    };
  });
}

export async function updateOrderStatus(id: string, status: string): Promise<void> {
  const s = status.toLowerCase();
  const { error } = await db().from("orders").update({ status: s }).eq("reference", id);
  if (error) {
    const { error: e2 } = await db().from("orders").update({ status: s }).eq("id", id);
    if (e2) throw e2;
  }
}

// ─── CUSTOMERS ─────────────────────────────────────────────────────────────

export async function listCustomers(): Promise<AdminCustomer[]> {
  const [{ data: profiles, error }, { data: orderRows }] = await Promise.all([
    db().from("profiles").select("id, name, email, blocked, created_at").neq("role", "admin").order("created_at", { ascending: false }),
    db().from("orders").select("user_id, total_pkr"),
  ]);
  if (error) throw error;

  const agg = new Map<string, { orders: number; spent: number }>();
  for (const o of orderRows ?? []) {
    if (!o.user_id) continue;
    const cur = agg.get(o.user_id) ?? { orders: 0, spent: 0 };
    cur.orders += 1;
    cur.spent += Number(o.total_pkr);
    agg.set(o.user_id, cur);
  }

  return (profiles ?? []).map((p: any) => ({
    id: p.id,
    name: p.name ?? p.email ?? "—",
    email: p.email ?? "—",
    orders: agg.get(p.id)?.orders ?? 0,
    spentPkr: agg.get(p.id)?.spent ?? 0,
    joined: (p.created_at as string).split("T")[0],
    blocked: p.blocked ?? false,
  }));
}

export async function setCustomerBlocked(id: string, blocked: boolean): Promise<void> {
  const { error } = await db().from("profiles").update({ blocked }).eq("id", id);
  if (error) throw error;
}

// ─── COUPONS ───────────────────────────────────────────────────────────────

export async function listCoupons(): Promise<AdminCoupon[]> {
  const { data, error } = await db().from("coupons").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((c: any) => ({
    id: String(c.id),
    code: c.code,
    type: c.type as "percent" | "fixed",
    value: Number(c.value),
    expiry: c.expires_at ?? "",
    used: c.used_count ?? 0,
    limit: c.usage_limit ?? 0,
    active: c.active,
  }));
}

export async function saveCoupon(coupon: AdminCoupon): Promise<void> {
  const row = {
    code: coupon.code.toUpperCase(),
    type: coupon.type,
    value: coupon.value,
    expires_at: coupon.expiry || null,
    usage_limit: coupon.limit || null,
    active: coupon.active,
  };
  if (coupon.id) {
    const { error } = await db().from("coupons").update(row).eq("id", coupon.id);
    if (error) throw error;
  } else {
    const { error } = await db().from("coupons").insert({ ...row, used_count: 0 });
    if (error) throw error;
  }
}

export async function deleteCoupon(id: string): Promise<void> {
  const { error } = await db().from("coupons").delete().eq("id", id);
  if (error) throw error;
}

// ─── REVIEWS ───────────────────────────────────────────────────────────────

export async function listReviews(): Promise<AdminReview[]> {
  const { data, error } = await db()
    .from("reviews")
    .select("*, products(name), profiles(name, email)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    id: String(r.id),
    product: r.products?.name ?? "Unknown product",
    customer: r.profiles?.name ?? r.profiles?.email ?? r.user_id?.slice(0, 8) ?? "Anonymous",
    rating: r.rating,
    text: r.body,
    date: (r.created_at as string).split("T")[0],
    status: r.status as AdminReview["status"],
    reply: r.reply ?? undefined,
  }));
}

export async function updateReview(id: string, patch: { status?: AdminReview["status"]; reply?: string }): Promise<void> {
  const { error } = await db().from("reviews").update(patch).eq("id", id);
  if (error) throw error;
}

// ─── SHIPPING ──────────────────────────────────────────────────────────────

export async function listShipping(): Promise<AdminShipping[]> {
  const { data, error } = await db().from("shipping_methods").select("*").order("id");
  if (error) throw error;
  return (data ?? []).map((s: any) => ({
    id: String(s.id),
    name: s.name,
    pricePkr: Number(s.price_pkr),
    etaDays: s.eta_days ?? "",
    active: s.active,
  }));
}

export async function saveShipping(method: AdminShipping): Promise<void> {
  const row = { name: method.name, price_pkr: method.pricePkr, eta_days: method.etaDays, active: method.active };
  if (method.id) {
    const { error } = await db().from("shipping_methods").update(row).eq("id", method.id);
    if (error) throw error;
  } else {
    const { error } = await db().from("shipping_methods").insert(row);
    if (error) throw error;
  }
}

export async function deleteShipping(id: string): Promise<void> {
  const { error } = await db().from("shipping_methods").delete().eq("id", id);
  if (error) throw error;
}

// ─── DASHBOARD KPIs ────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  Pending: "#E07A5F",
  Processing: "#8E9AAF",
  Shipped: "#C9A96E",
  Delivered: "#A3B18A",
  Cancelled: "#D62828",
};

export async function getDashboardStats() {
  const today = new Date().toISOString().split("T")[0];

  const [{ data: allOrders }, { count: customerCount }, { data: products }, { data: topItems }] = await Promise.all([
    db().from("orders").select("id, reference, status, total_pkr, created_at"),
    db().from("profiles").select("id", { count: "exact", head: true }).neq("role", "admin"),
    db().from("shop_products").select("name, variants").eq("status", "active"),
    db().from("order_items").select("name, quantity"),
  ]);

  const orders = allOrders ?? [];

  // Revenue today
  const revenueToday = orders.filter((o) => (o.created_at as string).startsWith(today)).reduce((s, o) => s + Number(o.total_pkr), 0);

  // Revenue last 7 days
  const days: string[] = [];
  const dayLabel: string[] = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
    dayLabel.push(dayNames[d.getDay()]);
  }
  const revByDay = new Map<string, number>();
  orders.forEach((o) => {
    const day = (o.created_at as string).split("T")[0];
    if (days.includes(day)) revByDay.set(day, (revByDay.get(day) ?? 0) + Number(o.total_pkr));
  });
  const revenue7d = days.map((d, i) => ({ d: dayLabel[i], v: revByDay.get(d) ?? 0 }));

  // Orders by status
  const statusMap = new Map<string, number>();
  orders.forEach((o) => {
    const k = capitalize(o.status);
    statusMap.set(k, (statusMap.get(k) ?? 0) + 1);
  });
  const ordersByStatus = [...statusMap.entries()].map(([name, value]) => ({
    name,
    value,
    color: STATUS_COLORS[name] ?? "#ccc",
  }));

  // Top products by units sold
  const topMap = new Map<string, number>();
  (topItems ?? []).forEach((item: any) => {
    topMap.set(item.name, (topMap.get(item.name) ?? 0) + (item.quantity ?? 1));
  });
  const topProducts = [...topMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, sales]) => ({ name, sales }));

  // Low stock from shop_products variants JSONB
  const lowStock: { name: string; stock: number }[] = [];
  (products ?? []).forEach((p: any) => {
    const variants = Array.isArray(p.variants) ? p.variants : [];
    variants.forEach((v: any) => {
      if (typeof v.stock === "number" && v.stock <= 5) {
        lowStock.push({ name: `${p.name} — ${v.size ?? v.color ?? ""}`, stock: v.stock });
      }
    });
  });

  return {
    revenueToday,
    orderCount: orders.length,
    customerCount: customerCount ?? 0,
    revenue7d: revenue7d.length ? revenue7d : days.map((_, i) => ({ d: dayLabel[i], v: 0 })),
    ordersByStatus: ordersByStatus.length ? ordersByStatus : [{ name: "No orders", value: 1, color: "#ccc" }],
    topProducts: topProducts.length ? topProducts : [{ name: "No orders yet", sales: 0 }],
    lowStock: lowStock.slice(0, 5),
  };
}
