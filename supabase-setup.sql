-- Supabase schema and RLS for G1 Creative Agency print orders

create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null,
  created_at timestamptz not null default now(),
  job text not null,
  copies int not null default 1 check (copies > 0),
  color text,
  paper_size text,
  finishing text,
  customer_name text not null,
  bring_own boolean not null default false,
  file_name text,
  file_link text,
  ticket_link text,
  status text not null default 'new' check (status in ('new','in_progress','done'))
);

-- Keep existing installations compatible with the form and dashboard.
alter table public.orders add column if not exists profile text;
alter table public.orders add column if not exists job_category text;
alter table public.orders add column if not exists card_finish text;
alter table public.orders add column if not exists banner_finish text;
alter table public.orders add column if not exists sticker_finish text;
alter table public.orders add column if not exists shirt_color text;
alter table public.orders add column if not exists shirt_size text;
alter table public.orders add column if not exists print_placement text;

alter table public.orders enable row level security;

drop policy if exists "Public can submit orders" on public.orders;
create policy "Public can submit orders" on public.orders
  for insert to anon with check (true);

drop policy if exists "Staff can view orders" on public.orders;
create policy "Staff can view orders" on public.orders
  for select to authenticated using (true);

drop policy if exists "Staff can update orders" on public.orders;
create policy "Staff can update orders" on public.orders
  for update to authenticated using (true) with check (true);

-- Public portfolio gallery. Images are hosted externally; this table stores
-- their public URL and metadata.
create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null default '',
  category text not null default 'other',
  image_url text not null,
  display_order integer not null default 0
);

alter table public.portfolio_items enable row level security;

drop policy if exists "Public can view portfolio" on public.portfolio_items;
create policy "Public can view portfolio" on public.portfolio_items
  for select to anon, authenticated using (true);

drop policy if exists "Staff can add portfolio" on public.portfolio_items;
create policy "Staff can add portfolio" on public.portfolio_items
  for insert to authenticated with check (true);

drop policy if exists "Staff can update portfolio" on public.portfolio_items;
create policy "Staff can update portfolio" on public.portfolio_items
  for update to authenticated using (true) with check (true);

drop policy if exists "Staff can delete portfolio" on public.portfolio_items;
create policy "Staff can delete portfolio" on public.portfolio_items
  for delete to authenticated using (true);

-- Notes:
-- 1) Run this once in the Supabase SQL Editor; it is safe to re-run.
-- 2) Ensure the anon key embedded in the HTML belongs to this project.
-- 3) Catbox uploads are currently performed by the browser. If Catbox blocks
--    the request with CORS/network errors, move uploads to a same-origin
--    Netlify Function or Supabase Storage; the database policies above still
--    allow the resulting URL to be saved.
