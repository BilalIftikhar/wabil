# WABIL — Premium Ladies Suits

> _Dress Like Royalty._

A premium ladies-suits e-commerce platform (Next.js 14 + Laravel 11) with a built-in
**personal finance / expense tracker** in the admin panel.

Palette — Ivory `#FAFAFA` · Charcoal `#1A1A2E` · Rose Gold `#C9A96E` · Blush `#F4C2C2`
Type — Cormorant Garamond (headings) + DM Sans (body)

---

## ⚠️ Scope of this scaffold

This repository is a **runnable foundation**, not the entire finished platform. The full
spec is multi-month, multi-engineer work. What is built end-to-end here:

| Area | Status |
| --- | --- |
| Design system, theme tokens, fonts, dark mode | ✅ Complete |
| Global animations (cursor, scroll progress, curtain transitions, reveals) | ✅ Complete |
| Live currency switcher (PKR default, 6 currencies, 1h cache) | ✅ Complete |
| Storefront: home (parallax hero + typewriter), shop + filters, product page, cart drawer | ✅ Built |
| Auth: login / register / forgot / reset (split-screen animated) + Google button + mock auth store | ✅ Built |
| Wishlist (store + page + heart wired into product cards) | ✅ Built |
| Checkout: multi-step Address → Shipping → Payment → Review → Place order | ✅ Built |
| Order confirmation + animated tracking timeline | ✅ Built |
| Customer account: orders, addresses, profile, wishlist (sidebar + sign out) | ✅ Built |
| **Admin → Personal Expense Tracker** (overview, add, list, income, budgets, reports) | ✅ **Complete & animated** |
| Expense **members & splits** — "Added by" per expense + equal/custom split between members, spending-by-member chart, member filter, split badges | ✅ Built |
| Deployment: Supabase SQL schema (RLS + seed), Supabase client, `vercel.json`, CI, `DEPLOYMENT.md` | ✅ Built |
| Admin dashboard (KPIs, Recharts, expense widget) | ✅ Built |
| Admin Products (CRUD + slide-in editor, variant manager, SEO, drag-drop image UI, bulk delete) | ✅ Built |
| Admin Orders (filters, inline status, timeline drawer, CSV export) | ✅ Built |
| Admin Coupons / Reviews (moderation + reply) / Customers (block) / Shipping / Settings (tabs, dark mode) | ✅ Built |
| Laravel API: expenses (full), auth (Sanctum), products (index/show) + resources, currency service | ✅ Built |
| Laravel store schema: categories, brands, products, variants, images, orders, items, history, coupons, reviews, shipping, wishlists + Eloquent models | ✅ Built |
| `docker-compose` (Next + Laravel + Postgres + Redis + Meilisearch) | ✅ Built |
| Payments (Stripe/JazzCash/EasyPaisa webhooks), order-write controllers, i18n (next-intl EN/UR/AR) | 🟡 Scaffolded / stubbed — extend next |

The frontend **runs standalone** using an in-memory data layer
(`frontend/lib/api/expenses.ts` + `frontend/lib/mock/*`). Swapping those function bodies
for `fetch()` calls against the Laravel API is the only step needed to go live — the
signatures already mirror `backend/routes/api.php`.

> The frontend was authored but **not `npm install`-ed / built in the authoring
> environment** (no network access there). Run the steps below locally to install and verify.

---

## 🚀 Quick start (frontend only — fastest demo)

```bash
cd frontend
npm install
npm run dev          # http://localhost:3000
```

Key routes to try:

- `/` — storefront home (parallax hero, typewriter, collections, trending, testimonials)
- `/shop` — grid + sidebar filters + sort
- `/shop/rose-lawn-3pc` — product detail + cart drawer
- `/wishlist` — saved grid + move to bag
- `/login` · `/register` · `/forgot` · `/reset` — auth (use an email containing "admin" to land in the admin panel)
- `/checkout` — multi-step checkout → `/order-confirmation/[id]`
- `/account` — orders, addresses, profile, wishlist
- `/admin/dashboard` — admin KPIs + charts
- `/admin/products` · `/orders` · `/coupons` · `/reviews` · `/customers` · `/shipping` · `/settings` — full CRUD
- **`/admin/expenses`** — expense tracker overview (animated KPIs, donut, trend, budgets)
- `/admin/expenses/add` · `/list` · `/income` · `/budgets` · `/reports`

## 🌐 Deploy (Vercel + Supabase)

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the full guide. In short: run
`supabase/schema.sql` in the Supabase SQL editor, import the repo on Vercel with
**Root Directory = `frontend`**, and set `NEXT_PUBLIC_SUPABASE_URL` /
`NEXT_PUBLIC_SUPABASE_ANON_KEY`. The app also runs with zero backend on mock data.

## 🐳 Full stack (Docker)

```bash
docker compose up -d --build
# frontend  → http://localhost:3000
# backend   → http://localhost:8000
# meilisearch → http://localhost:7700
```

## 🔧 Backend setup (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed        # runs ExpenseSeeder
php artisan serve
```

---

## 🗂️ Structure

```
wabil/
├── frontend/                  Next.js 14 · App Router · TS strict
│   ├── app/
│   │   ├── (store)/           storefront (home, shop, product)
│   │   └── admin/
│   │       ├── dashboard/
│   │       └── expenses/      overview · add · list · income · budgets · reports
│   ├── components/            ui/, store/, admin/, global animations
│   ├── lib/                   currency, utils, export, api/, mock/
│   └── store/                 Zustand: currency, cart
├── backend/                   Laravel 11
│   ├── app/Http/Controllers/ExpenseController.php
│   ├── app/Models/            Expense, ExpenseCategory, ExpenseBudget, ExpenseIncome
│   ├── app/Services/CurrencyService.php
│   ├── database/migrations/   expense tables
│   └── routes/api.php
└── docker-compose.yml
```

## 💱 Currency

Prices are stored in **PKR**; rates come from
`https://api.exchangerate-api.com/v4/latest/USD`, cached 1h
(localStorage on the client, Redis on the server). Switcher supports
PKR / USD / GBP / AED / SAR / EUR with flags.

## ✨ Animation system (from scratch)

Custom cursor (dot + ring), top scroll-progress bar, curtain-wipe page transitions,
typewriter hero, parallax, product hover crossfade + heart pop, spring cart drawer,
`whileInView` staggered reveals, count-up KPIs, animated Recharts, spring budget bars,
shake-on-invalid delete confirm, Sonner toasts, skeleton shimmer loaders.

## 🧩 Tech

Next.js 14 · TypeScript (strict) · Tailwind · Framer Motion · Zustand · TanStack Query ·
Recharts · next-themes · Sonner · lucide-react — Laravel 11 · Sanctum · Spatie Permission ·
Scout/Meilisearch · PostgreSQL · Redis.

---

## ▶️ Recommended next steps

1. Wire `frontend/lib/api/expenses.ts` to the Laravel endpoints (`NEXT_PUBLIC_API_URL`).
2. Build auth (Sanctum) + the customer account area.
3. Products/orders CRUD controllers + API resources (mirror the expense slice).
4. Stripe / JazzCash / EasyPaisa checkout + webhooks.
5. next-intl EN/UR/AR and RTL.
```
