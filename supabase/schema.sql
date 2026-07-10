-- ============================================================================
-- WABIL — Supabase schema (Postgres)
-- Run in: Supabase Dashboard → SQL Editor → New query → paste → Run.
-- Idempotent-ish: safe to re-run on a fresh project.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Profiles (1:1 with auth.users) + role
-- ----------------------------------------------------------------------------
create type user_role as enum ('admin', 'vendor', 'customer');

create table if not exists profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text,
  email       text,
  role        user_role not null default 'customer',
  blocked     boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Auto-create a profile row when a new auth user signs up.
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Helper: is the current user an admin?
create or replace function is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- ============================================================================
-- EXPENSE TRACKER
-- ============================================================================

-- People who manage WABIL finances and can add / share expenses.
create table if not exists expense_members (
  id          bigint generated always as identity primary key,
  name        text not null,
  role        text not null default 'Member',
  color       text not null default '#C9A96E',
  created_at  timestamptz not null default now()
);

create table if not exists expense_categories (
  id          bigint generated always as identity primary key,
  name        text not null,
  icon        text not null default 'wallet',
  color_hex   text not null default '#C9A96E',
  type        text not null default 'personal' check (type in ('personal', 'business')),
  created_at  timestamptz not null default now()
);

create table if not exists expenses (
  id                  bigint generated always as identity primary key,
  admin_user_id       uuid references auth.users (id) on delete set null,
  expense_category_id bigint not null references expense_categories (id) on delete cascade,
  added_by_member_id  bigint references expense_members (id) on delete set null,
  title               text not null,
  description         text,
  amount_pkr          numeric(14,2) not null,
  currency            text not null default 'PKR',
  converted_amount    numeric(14,2),
  exchange_rate       numeric(14,6),
  date                date not null,
  payment_method      text not null default 'cash'
                        check (payment_method in ('cash','card','bank','jazzcash','easypaisa')),
  receipt_image       text,
  is_recurring        boolean not null default false,
  recurrence          text check (recurrence in ('daily','weekly','monthly')),
  -- 'none' | 'equal' | 'custom'; shares live in expense_splits
  split_type          text not null default 'none' check (split_type in ('none','equal','custom')),
  tags                text[] not null default '{}',
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index if not exists expenses_date_idx on expenses (date desc);
create index if not exists expenses_category_idx on expenses (expense_category_id);
create index if not exists expenses_member_idx on expenses (added_by_member_id);

-- How an expense is divided between members (one row per participant).
create table if not exists expense_splits (
  id          bigint generated always as identity primary key,
  expense_id  bigint not null references expenses (id) on delete cascade,
  member_id   bigint not null references expense_members (id) on delete cascade,
  amount_pkr  numeric(14,2) not null,
  created_at  timestamptz not null default now(),
  unique (expense_id, member_id)
);

create table if not exists expense_budgets (
  id                  bigint generated always as identity primary key,
  admin_user_id       uuid references auth.users (id) on delete set null,
  expense_category_id bigint not null references expense_categories (id) on delete cascade,
  month               smallint not null check (month between 1 and 12),
  year                smallint not null,
  budget_amount       numeric(14,2) not null,
  created_at          timestamptz not null default now(),
  unique (expense_category_id, month, year)
);

create table if not exists expense_income (
  id            bigint generated always as identity primary key,
  admin_user_id uuid references auth.users (id) on delete set null,
  source        text not null,
  amount_pkr    numeric(14,2) not null,
  date          date not null,
  note          text,
  created_at    timestamptz not null default now()
);

create table if not exists exchange_rate_cache (
  id          bigint generated always as identity primary key,
  base        text not null default 'USD',
  rates       jsonb not null,
  fetched_at  timestamptz not null default now()
);

-- ============================================================================
-- STOREFRONT
-- ============================================================================

create table if not exists categories (
  id          bigint generated always as identity primary key,
  name        text not null,
  slug        text not null unique,
  image       text,
  created_at  timestamptz not null default now()
);

create table if not exists products (
  id              bigint generated always as identity primary key,
  name            text not null,
  slug            text not null unique,
  category_id     bigint references categories (id) on delete set null,
  description     text,
  price_pkr       numeric(12,2) not null,
  compare_pkr     numeric(12,2),
  rating          numeric(3,2) not null default 0,
  status          text not null default 'draft' check (status in ('active','draft')),
  seo_title       text,
  seo_description text,
  created_at      timestamptz not null default now()
);

create table if not exists product_variants (
  id          bigint generated always as identity primary key,
  product_id  bigint not null references products (id) on delete cascade,
  size        text,
  color       text,
  sku         text,
  stock       integer not null default 0
);

create table if not exists product_images (
  id          bigint generated always as identity primary key,
  product_id  bigint not null references products (id) on delete cascade,
  url         text not null,
  position    smallint not null default 0
);

create table if not exists orders (
  id               bigint generated always as identity primary key,
  reference        text not null unique,
  user_id          uuid references auth.users (id) on delete set null,
  status           text not null default 'pending'
                     check (status in ('pending','processing','shipped','delivered','cancelled')),
  subtotal_pkr     numeric(12,2) not null,
  shipping_pkr     numeric(12,2) not null default 0,
  discount_pkr     numeric(12,2) not null default 0,
  total_pkr        numeric(12,2) not null,
  currency         text not null default 'PKR',
  payment_method   text not null default 'cod' check (payment_method in ('card','jazzcash','easypaisa','cod')),
  payment_status   text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  shipping_address jsonb not null,
  created_at       timestamptz not null default now()
);

create table if not exists order_items (
  id          bigint generated always as identity primary key,
  order_id    bigint not null references orders (id) on delete cascade,
  product_id  bigint references products (id) on delete set null,
  name        text not null,
  variant     text,
  quantity    integer not null,
  price_pkr   numeric(12,2) not null
);

create table if not exists coupons (
  id          bigint generated always as identity primary key,
  code        text not null unique,
  type        text not null check (type in ('percent','fixed')),
  value       numeric(12,2) not null,
  expires_at  date,
  usage_limit integer,
  used_count  integer not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists reviews (
  id          bigint generated always as identity primary key,
  product_id  bigint not null references products (id) on delete cascade,
  user_id     uuid references auth.users (id) on delete set null,
  rating      smallint not null check (rating between 1 and 5),
  body        text not null,
  status      text not null default 'pending' check (status in ('pending','approved','rejected')),
  reply       text,
  created_at  timestamptz not null default now()
);

create table if not exists shipping_methods (
  id          bigint generated always as identity primary key,
  name        text not null,
  price_pkr   numeric(12,2) not null default 0,
  eta_days    text,
  active      boolean not null default true
);

create table if not exists wishlists (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  product_id  bigint not null references products (id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, product_id)
);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table profiles            enable row level security;
alter table expense_members     enable row level security;
alter table expense_categories  enable row level security;
alter table expenses            enable row level security;
alter table expense_splits      enable row level security;
alter table expense_budgets     enable row level security;
alter table expense_income      enable row level security;
alter table products            enable row level security;
alter table categories          enable row level security;
alter table reviews             enable row level security;
alter table orders              enable row level security;
alter table wishlists           enable row level security;

-- Profiles: a user sees & edits their own; admins see all.
create policy "own profile read"  on profiles for select using (id = auth.uid() or is_admin());
create policy "own profile write" on profiles for update using (id = auth.uid());

-- Expense tracker: admin-only (the finance section lives in the admin panel).
create policy "expenses admin all"   on expenses           for all using (is_admin()) with check (is_admin());
create policy "splits admin all"     on expense_splits     for all using (is_admin()) with check (is_admin());
create policy "members admin all"    on expense_members    for all using (is_admin()) with check (is_admin());
create policy "ecats admin all"      on expense_categories for all using (is_admin()) with check (is_admin());
create policy "budgets admin all"    on expense_budgets    for all using (is_admin()) with check (is_admin());
create policy "income admin all"     on expense_income     for all using (is_admin()) with check (is_admin());

-- Catalogue: public read, admin write.
create policy "products public read" on products   for select using (true);
create policy "products admin write" on products   for all using (is_admin()) with check (is_admin());
create policy "cats public read"     on categories for select using (true);
create policy "cats admin write"     on categories for all using (is_admin()) with check (is_admin());

-- Reviews: anyone reads approved; owners insert; admins moderate.
create policy "reviews read"   on reviews for select using (status = 'approved' or is_admin() or user_id = auth.uid());
create policy "reviews insert" on reviews for insert with check (user_id = auth.uid());
create policy "reviews admin"  on reviews for update using (is_admin());

-- Orders & wishlists: a customer sees their own; admins see all.
create policy "orders own"     on orders    for select using (user_id = auth.uid() or is_admin());
create policy "orders insert"  on orders    for insert with check (user_id = auth.uid());
create policy "wishlist own"   on wishlists for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================================
-- SEED DATA
-- ============================================================================
insert into expense_members (name, role, color) values
  ('Wabil Ahmed', 'Owner', '#C9A96E'),
  ('Hamza Tariq', 'Co-owner', '#8E9AAF'),
  ('Sana Yousuf', 'Accountant', '#A3B18A'),
  ('Bilal Khan', 'Manager', '#E07A5F')
on conflict do nothing;

insert into expense_categories (name, icon, color_hex, type) values
  ('Fabric & Stock', 'shirt', '#C9A96E', 'business'),
  ('Marketing', 'megaphone', '#F4C2C2', 'business'),
  ('Salaries', 'users', '#1A1A2E', 'business'),
  ('Logistics', 'truck', '#8E9AAF', 'business'),
  ('Groceries', 'shopping-basket', '#A3B18A', 'personal'),
  ('Utilities', 'zap', '#E07A5F', 'personal'),
  ('Dining', 'utensils', '#BC6C25', 'personal'),
  ('Health', 'heart-pulse', '#D62828', 'personal')
on conflict do nothing;

insert into shipping_methods (name, price_pkr, eta_days, active) values
  ('Standard (TCS)', 300, '3–5 days', true),
  ('Express (Leopards)', 600, '1–2 days', true),
  ('Free Shipping', 0, '5–7 days', true)
on conflict do nothing;

-- ============================================================================
-- STOREFRONT CATALOG (denormalized — used by the Next.js app + admin panel)
-- One row per product; media are public URLs from the `media` storage bucket.
-- ============================================================================
create table if not exists shop_products (
  id              text primary key,
  slug            text unique not null,
  name            text not null,
  category        text not null,
  price_pkr       numeric(12,2) not null,
  compare_pkr     numeric(12,2),
  images          jsonb not null default '[]',   -- ["https://.../a.jpg", ...]
  video           text,                          -- public URL or null
  colors          jsonb not null default '[]',   -- ["#C9A96E", ...]
  sizes           jsonb not null default '[]',   -- ["S","M","L"]
  badge           text,
  rating          numeric(3,2) not null default 5,
  status          text not null default 'active' check (status in ('active','draft')),
  variants        jsonb not null default '[]',   -- [{size,color,stock}]
  seo_title       text,
  seo_description text,
  created_at      timestamptz not null default now()
);

alter table shop_products enable row level security;
drop policy if exists "shop read"  on shop_products;
drop policy if exists "shop write" on shop_products;
create policy "shop read"  on shop_products for select using (status = 'active' or is_admin());
create policy "shop write" on shop_products for all using (is_admin()) with check (is_admin());

-- ---- Media storage bucket (public read, admin write) ----------------------
insert into storage.buckets (id, name, public) values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "media public read" on storage.objects;
drop policy if exists "media admin write" on storage.objects;
drop policy if exists "media admin update" on storage.objects;
drop policy if exists "media admin delete" on storage.objects;
create policy "media public read"  on storage.objects for select using (bucket_id = 'media');
create policy "media admin write"  on storage.objects for insert with check (bucket_id = 'media' and is_admin());
create policy "media admin update" on storage.objects for update using (bucket_id = 'media' and is_admin());
create policy "media admin delete" on storage.objects for delete using (bucket_id = 'media' and is_admin());

-- ---- Seed catalog ----------------------------------------------------------
insert into shop_products (id, slug, name, category, price_pkr, compare_pkr, images, colors, sizes, badge, rating, variants) values
  ('p1','rose-lawn-3pc','Rose Lawn 3-Piece','Unstitched',8900,11900,
    '["https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=800&q=80"]',
    '["#F4C2C2","#C9A96E","#1A1A2E"]','["S","M","L"]','Bestseller',4.8,
    '[{"size":"S","color":"Blush","stock":12},{"size":"M","color":"Blush","stock":6},{"size":"L","color":"Rose Gold","stock":8}]'),
  ('p2','charcoal-silk','Charcoal Silk Formal','Formal',18500,null,
    '["https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80"]',
    '["#1A1A2E","#C9A96E"]','["S","M","L","XL"]','New',4.9,
    '[{"size":"M","color":"Charcoal","stock":6},{"size":"L","color":"Charcoal","stock":4}]'),
  ('p3','blush-chiffon','Blush Chiffon Party','Party',14200,16900,
    '["https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80"]',
    '["#F4C2C2","#FAFAFA"]','["S","M","L"]',null,4.7,
    '[{"size":"S","color":"Blush","stock":10}]'),
  ('p4','zara-bridal','Zara Bridal Couture','Bridal',89000,110000,
    '["https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=800&q=80"]',
    '["#C9A96E","#F4C2C2"]','["Custom"]','Couture',5.0,
    '[{"size":"Custom","color":"Rose Gold","stock":4}]'),
  ('p5','ivory-formal','Ivory Embroidered','Formal',22500,null,
    '["https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=800&q=80"]',
    '["#FAFAFA","#C9A96E"]','["S","M","L"]',null,4.6,
    '[{"size":"M","color":"Ivory","stock":7}]'),
  ('p6','emerald-velvet','Emerald Velvet Winter','Winter',26900,31000,
    '["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=800&q=80"]',
    '["#2d6a4f","#C9A96E"]','["M","L","XL"]','Limited',4.8,
    '[{"size":"L","color":"Emerald","stock":5}]'),
  ('p7','midnight-organza','Midnight Organza','Party',19900,null,
    '["https://images.unsplash.com/photo-1469504512102-900f29606341?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=800&q=80"]',
    '["#1A1A2E","#8E9AAF"]','["S","M","L"]',null,4.5,
    '[{"size":"M","color":"Midnight","stock":9}]'),
  ('p8','sand-cotton','Sand Cotton Casual','Casual',6900,8500,
    '["https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?auto=format&fit=crop&w=800&q=80"]',
    '["#C9A96E","#FAFAFA"]','["S","M","L","XL"]',null,4.4,
    '[{"size":"M","color":"Sand","stock":15}]')
on conflict (id) do nothing;
