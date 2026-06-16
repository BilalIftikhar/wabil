# WABIL — Deployment Guide (Vercel + Supabase)

Frontend → **Vercel**. Backend/data → **Supabase** (Postgres + Auth + auto REST API + RLS).

> Note: Laravel (in `backend/`) cannot run on Supabase — it's a PHP app and Supabase
> hosts Postgres/Edge Functions, not PHP. For this deployment Supabase **is** the
> backend. The Laravel code remains as an optional self-host alternative (Railway/Fly/Render).

The app runs **without any backend** on built-in mock data, so you can deploy the
frontend first and wire Supabase after.

---

## 1 · Supabase (backend)

1. Create a project at <https://supabase.com> → note the project URL and **anon public** key
   (Project Settings → API).
2. Open **SQL Editor → New query**, paste the entire contents of
   [`supabase/schema.sql`](./supabase/schema.sql), and **Run**.
   This creates all tables (expense tracker **with members + splits**, storefront,
   RLS policies) and seeds members, expense categories, and shipping methods.
3. (Auth) Authentication → Providers: enable **Email**, and **Google** if you want OAuth.
4. Make yourself an admin so the expense tracker is visible: after signing up once,
   run in SQL Editor:
   ```sql
   update profiles set role = 'admin' where email = 'you@example.com';
   ```

### Switch the frontend from mock → Supabase
The expense pages import from `@/lib/api/expenses` (mock). A ready Supabase adapter
lives at `@/lib/api/expenses.supabase.ts` with identical signatures. To go live, either
change those imports, or re-export the Supabase version from `lib/api/expenses.ts`.
Storefront product/order reads can use the Supabase client in `lib/supabase.ts` directly.

---

## 2 · Vercel (frontend)

### Option A — Dashboard (no CLI)
1. Push this repo to GitHub.
2. <https://vercel.com/new> → import the repo.
3. **Root Directory:** `frontend`  (important — the Next app is not at the repo root).
4. Framework preset auto-detects **Next.js**. Build = `next build`, Install = `npm install`.
5. **Environment Variables** (Settings → Environment Variables):
   | Key | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://YOUR-PROJECT.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon public key |
   | `NEXT_PUBLIC_DEFAULT_CURRENCY` | `PKR` |
6. **Deploy.**

### Option B — CLI
```bash
npm i -g vercel
cd frontend
vercel            # link & configure (set root to current dir)
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel --prod
```

After deploy, set Supabase **Auth → URL Configuration → Site URL** to your Vercel domain
so email/OAuth redirects resolve.

---

## 3 · Local development

```bash
cd frontend
cp .env.local.example .env.local      # optional — fill in Supabase keys to use the DB
npm install
npm run dev                            # http://localhost:3000
```

Without `.env.local`, everything works on mock data (great for design/QA).

---

## 4 · Verify before shipping

```bash
cd frontend
npm install
npx tsc --noEmit      # type-check (strict mode)
npm run build         # production build
```

CI runs these on every push (`.github/workflows/ci.yml`).

---

## 5 · Custom domain

Vercel → Project → Domains → add `wabil.pk` (or your domain) and follow the DNS steps.
Update the Supabase Site URL + redirect allow-list to match.
