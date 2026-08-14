-- Supabase schema and RLS for G1 Creative Agency print orders

create extension if not exists pgcrypto;

create table public.orders (
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

alter table public.orders enable row level security;

-- anon (order form) can INSERT only -- never select/update/delete anything
create policy "Public can submit orders" on public.orders
  for insert to anon with check (true);

-- authenticated (logged-in dashboard) can SELECT
create policy "Staff can view orders" on public.orders
  for select to authenticated using (true);

-- authenticated (logged-in dashboard) can UPDATE (status changes)
create policy "Staff can update orders" on public.orders
  for update to authenticated using (true) with check (true);

-- Notes:
-- 1) Run this once in the Supabase SQL Editor.
-- 2) Ensure your Supabase project's anon key is the one embedded in the static files
--     (or change the data- attributes in the HTML to match your project).
