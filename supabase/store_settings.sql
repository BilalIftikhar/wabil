-- Run once in Supabase SQL Editor if store_settings doesn't exist yet.

create table if not exists store_settings (
  id                   int primary key default 1 check (id = 1),
  store_name           text not null default 'WABIL — Premium Ladies Suits',
  support_email        text not null default 'wabilmanagamenet@gmail.com',
  phone                text default '+923215635736',
  default_currency     text not null default 'PKR',
  stripe_key           text,
  stripe_secret        text,
  jazzcash_id          text,
  easypaisa_id         text,
  smtp_host            text,
  smtp_port            text default '587',
  smtp_user            text,
  smtp_pass            text,
  smtp_from            text,
  notify_new_order     boolean not null default true,
  notify_low_stock     boolean not null default true,
  notify_new_review    boolean not null default true,
  notify_daily_summary boolean not null default false,
  updated_at           timestamptz not null default now()
);

alter table store_settings enable row level security;
drop policy if exists "settings admin all" on store_settings;
create policy "settings admin all" on store_settings for all using (is_admin()) with check (is_admin());

insert into store_settings (id, store_name, support_email, phone, smtp_host, smtp_port, smtp_user, smtp_from)
values (1, 'WABIL — Premium Ladies Suits', 'wabilmanagamenet@gmail.com', '+923215635736', 'smtp.gmail.com', '587', 'wabilmanagamenet@gmail.com', 'wabilmanagamenet@gmail.com')
on conflict (id) do update set
  support_email = excluded.support_email,
  phone = excluded.phone,
  smtp_host = coalesce(nullif(store_settings.smtp_host, ''), excluded.smtp_host),
  smtp_port = coalesce(nullif(store_settings.smtp_port, ''), excluded.smtp_port),
  smtp_user = coalesce(nullif(store_settings.smtp_user, ''), excluded.smtp_user),
  smtp_from = coalesce(nullif(store_settings.smtp_from, ''), excluded.smtp_from),
  updated_at = now();
