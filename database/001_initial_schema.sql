create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'transaction_type') then
    create type public.transaction_type as enum ('income', 'expense');
  end if;

  if not exists (select 1 from pg_type where typname = 'category_type') then
    create type public.category_type as enum ('income', 'expense', 'both');
  end if;
end
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.categories (
  id text primary key,
  label text not null,
  icon text not null,
  color text not null,
  type public.category_type not null
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id text not null references public.categories (id),
  amount numeric(12,2) not null check (amount > 0),
  description text,
  transaction_date timestamptz not null default timezone('utc', now()),
  type public.transaction_type not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  month text not null check (month ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  total_limit numeric(12,2) not null check (total_limit > 0),
  created_at timestamptz not null default timezone('utc', now()),
  constraint budgets_user_month_key unique (user_id, month)
);

create table if not exists public.budget_categories (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references public.budgets (id) on delete cascade,
  category_id text not null references public.categories (id),
  amount_limit numeric(12,2) not null check (amount_limit > 0),
  constraint budget_categories_budget_category_key unique (budget_id, category_id)
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  target_amount numeric(12,2) not null check (target_amount > 0),
  current_amount numeric(12,2) not null default 0 check (current_amount >= 0),
  target_date date,
  icon text not null,
  color text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists transactions_user_id_idx on public.transactions (user_id);
create index if not exists transactions_user_id_transaction_date_idx on public.transactions (user_id, transaction_date desc);
create index if not exists budgets_user_id_idx on public.budgets (user_id);
create index if not exists budget_categories_budget_id_idx on public.budget_categories (budget_id);
create index if not exists goals_user_id_idx on public.goals (user_id);

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.budget_categories enable row level security;
alter table public.goals enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "categories_select_authenticated" on public.categories;
create policy "categories_select_authenticated"
on public.categories
for select
to authenticated
using (true);

drop policy if exists "transactions_select_own" on public.transactions;
create policy "transactions_select_own"
on public.transactions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "transactions_insert_own" on public.transactions;
create policy "transactions_insert_own"
on public.transactions
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "transactions_update_own" on public.transactions;
create policy "transactions_update_own"
on public.transactions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "transactions_delete_own" on public.transactions;
create policy "transactions_delete_own"
on public.transactions
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "budgets_select_own" on public.budgets;
create policy "budgets_select_own"
on public.budgets
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "budgets_insert_own" on public.budgets;
create policy "budgets_insert_own"
on public.budgets
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "budgets_update_own" on public.budgets;
create policy "budgets_update_own"
on public.budgets
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "budgets_delete_own" on public.budgets;
create policy "budgets_delete_own"
on public.budgets
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "budget_categories_select_own" on public.budget_categories;
create policy "budget_categories_select_own"
on public.budget_categories
for select
to authenticated
using (
  exists (
    select 1
    from public.budgets b
    where b.id = budget_categories.budget_id
      and b.user_id = auth.uid()
  )
);

drop policy if exists "budget_categories_insert_own" on public.budget_categories;
create policy "budget_categories_insert_own"
on public.budget_categories
for insert
to authenticated
with check (
  exists (
    select 1
    from public.budgets b
    where b.id = budget_categories.budget_id
      and b.user_id = auth.uid()
  )
);

drop policy if exists "budget_categories_update_own" on public.budget_categories;
create policy "budget_categories_update_own"
on public.budget_categories
for update
to authenticated
using (
  exists (
    select 1
    from public.budgets b
    where b.id = budget_categories.budget_id
      and b.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.budgets b
    where b.id = budget_categories.budget_id
      and b.user_id = auth.uid()
  )
);

drop policy if exists "budget_categories_delete_own" on public.budget_categories;
create policy "budget_categories_delete_own"
on public.budget_categories
for delete
to authenticated
using (
  exists (
    select 1
    from public.budgets b
    where b.id = budget_categories.budget_id
      and b.user_id = auth.uid()
  )
);

drop policy if exists "goals_select_own" on public.goals;
create policy "goals_select_own"
on public.goals
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "goals_insert_own" on public.goals;
create policy "goals_insert_own"
on public.goals
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "goals_update_own" on public.goals;
create policy "goals_update_own"
on public.goals
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "goals_delete_own" on public.goals;
create policy "goals_delete_own"
on public.goals
for delete
to authenticated
using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name')
  on conflict (id) do update
  set display_name = coalesce(excluded.display_name, public.profiles.display_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

insert into public.categories (id, label, icon, color, type)
values
  ('supermercado', 'Supermercado', 'shopping-cart', '#22C55E', 'expense'),
  ('transporte', 'Transporte', 'directions-car', '#3B82F6', 'expense'),
  ('comida', 'Comida', 'restaurant', '#F59E0B', 'expense'),
  ('salud', 'Salud', 'local-hospital', '#EF4444', 'expense'),
  ('suscripciones', 'Suscripciones', 'subscriptions', '#8B5CF6', 'expense'),
  ('entretenimiento', 'Entretenimiento', 'movie', '#EC4899', 'expense'),
  ('ropa', 'Ropa', 'checkroom', '#F97316', 'expense'),
  ('educacion', 'Educación', 'school', '#06B6D4', 'expense'),
  ('hogar', 'Hogar', 'home', '#84CC16', 'expense'),
  ('tecnologia', 'Tecnología', 'devices', '#6366F1', 'expense'),
  ('viajes', 'Viajes', 'flight', '#14B8A6', 'expense'),
  ('mascotas', 'Mascotas', 'pets', '#A78BFA', 'expense'),
  ('salario', 'Salario', 'account-balance-wallet', '#22C55E', 'income'),
  ('freelance', 'Freelance', 'work', '#3B82F6', 'income'),
  ('inversiones', 'Inversiones', 'trending-up', '#F59E0B', 'income'),
  ('regalo', 'Regalo', 'card-giftcard', '#EC4899', 'income'),
  ('otros_ingreso', 'Otros', 'attach-money', '#6B7280', 'income'),
  ('otros_gasto', 'Otros', 'more-horiz', '#6B7280', 'expense'),
  ('deporte', 'Deporte', 'fitness-center', '#10B981', 'expense')
on conflict (id) do update
set
  label = excluded.label,
  icon = excluded.icon,
  color = excluded.color,
  type = excluded.type;
