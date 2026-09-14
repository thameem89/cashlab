-- Cash Lab admin operations: profit-share configuration, commissions, and auditability.
-- All records are scoped by the existing is_cashlab_admin() role predicate.

create table if not exists public.admin_settings (
  key text primary key,
  value_json jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

insert into public.admin_settings (key, value_json)
values ('profit_share', jsonb_build_object('default_rate', 30, 'currency_policy', 'separate'))
on conflict (key) do nothing;

create table if not exists public.user_profit_share_rates (
  user_id uuid primary key references auth.users(id) on delete cascade,
  rate numeric(7,4) not null default 30 check (rate >= 0 and rate <= 100),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.trading_account_profit_share_overrides (
  trading_account_id uuid primary key references public.trading_accounts(id) on delete cascade,
  rate numeric(7,4) not null check (rate >= 0 and rate <= 100),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.commission_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trading_account_id uuid not null references public.trading_accounts(id) on delete restrict,
  period_start date not null,
  period_end date not null,
  opening_value numeric(20,4),
  closing_value numeric(20,4),
  deposits numeric(20,4) not null default 0,
  withdrawals numeric(20,4) not null default 0,
  gross_trading_profit numeric(20,4) not null default 0,
  eligible_profit numeric(20,4) not null default 0,
  profit_share_rate numeric(7,4) not null check (profit_share_rate >= 0 and profit_share_rate <= 100),
  commission_amount numeric(20,4) not null default 0 check (commission_amount >= 0),
  approved_amount numeric(20,4),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  status text not null default 'calculated' check (status in ('calculated','pending','approved','paid','cancelled','adjusted')),
  adjustment_reason text,
  created_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  paid_at timestamptz,
  calculated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  notes text,
  check (period_end >= period_start)
);

create index if not exists commission_records_user_idx on public.commission_records(user_id, created_at desc);
create index if not exists commission_records_status_idx on public.commission_records(status, created_at desc);
create index if not exists commission_records_account_idx on public.commission_records(trading_account_id);

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_user_id uuid references auth.users(id) on delete set null,
  target_account_id uuid references public.trading_accounts(id) on delete set null,
  target_commission_id uuid references public.commission_records(id) on delete set null,
  previous_value jsonb,
  new_value jsonb,
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_created_idx on public.admin_audit_log(created_at desc);

alter table public.admin_settings enable row level security;
alter table public.user_profit_share_rates enable row level security;
alter table public.trading_account_profit_share_overrides enable row level security;
alter table public.commission_records enable row level security;
alter table public.admin_audit_log enable row level security;

create policy "Admins manage admin settings" on public.admin_settings for all to authenticated
  using ((select public.is_cashlab_admin())) with check ((select public.is_cashlab_admin()));
create policy "Users read own profit share" on public.user_profit_share_rates for select to authenticated
  using ((select auth.uid()) = user_id or (select public.is_cashlab_admin()));
create policy "Admins manage user profit share" on public.user_profit_share_rates for all to authenticated
  using ((select public.is_cashlab_admin())) with check ((select public.is_cashlab_admin()));
create policy "Users read own account override" on public.trading_account_profit_share_overrides for select to authenticated
  using (exists (select 1 from public.trading_accounts a where a.id = trading_account_id and a.user_id = (select auth.uid())) or (select public.is_cashlab_admin()));
create policy "Admins manage account overrides" on public.trading_account_profit_share_overrides for all to authenticated
  using ((select public.is_cashlab_admin())) with check ((select public.is_cashlab_admin()));
create policy "Admins manage commissions" on public.commission_records for all to authenticated
  using ((select public.is_cashlab_admin())) with check ((select public.is_cashlab_admin()));
create policy "Users read own commissions" on public.commission_records for select to authenticated
  using ((select auth.uid()) = user_id or (select public.is_cashlab_admin()));
create policy "Admins read audit log" on public.admin_audit_log for select to authenticated
  using ((select public.is_cashlab_admin()));
create policy "Admins write audit log" on public.admin_audit_log for insert to authenticated
  with check ((select public.is_cashlab_admin()) and admin_user_id = (select auth.uid()));

revoke all on public.admin_settings, public.user_profit_share_rates,
  public.trading_account_profit_share_overrides, public.commission_records,
  public.admin_audit_log from anon;
grant select on public.user_profit_share_rates, public.trading_account_profit_share_overrides,
  public.commission_records to authenticated;
grant all on public.admin_settings, public.user_profit_share_rates,
  public.trading_account_profit_share_overrides, public.commission_records to authenticated;
grant select, insert on public.admin_audit_log to authenticated;

create or replace function public.calculate_profit_share(
  p_eligible_profit numeric,
  p_rate numeric
)
returns numeric
language sql
immutable
set search_path = ''
as $$
  select greatest(coalesce(p_eligible_profit, 0), 0) * greatest(least(coalesce(p_rate, 0), 100), 0) / 100;
$$;

revoke all on function public.calculate_profit_share(numeric, numeric) from public, anon;
grant execute on function public.calculate_profit_share(numeric, numeric) to authenticated;
