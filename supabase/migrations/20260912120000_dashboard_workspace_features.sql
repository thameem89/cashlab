create table if not exists public.account_performance_points (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trading_account_id uuid not null references public.trading_accounts(id) on delete cascade,
  balance numeric(18,2),
  equity numeric(18,2),
  recorded_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (trading_account_id, recorded_at)
);

create table if not exists public.financial_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trading_account_id uuid not null references public.trading_accounts(id) on delete restrict,
  request_type text not null check (request_type in ('deposit', 'withdrawal')),
  amount numeric(18,2) not null check (amount > 0),
  currency text not null check (currency in ('USD', 'USC')),
  method text not null default 'manual_review',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
  reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.referral_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  referral_code text not null unique,
  successful_referrals integer not null default 0 check (successful_referrals >= 0),
  reward_amount numeric(18,2) not null default 0 check (reward_amount >= 0),
  reward_currency text not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customer_plans (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'standard' check (plan in ('standard', 'pro')),
  status text not null default 'inactive' check (status in ('inactive', 'active', 'past_due', 'cancelled')),
  provider_customer_id text,
  provider_subscription_id text,
  updated_at timestamptz not null default now()
);

create index if not exists account_performance_user_idx on public.account_performance_points(user_id);
create index if not exists account_performance_account_time_idx on public.account_performance_points(trading_account_id, recorded_at desc);
create index if not exists financial_requests_user_idx on public.financial_requests(user_id);
create index if not exists financial_requests_account_idx on public.financial_requests(trading_account_id);

alter table public.account_performance_points enable row level security;
alter table public.financial_requests enable row level security;
alter table public.promotions enable row level security;
alter table public.referral_profiles enable row level security;
alter table public.customer_plans enable row level security;

create policy "Users read own performance" on public.account_performance_points for select to authenticated using ((select auth.uid()) = user_id or (select public.is_cashlab_admin()));
create policy "Users read own financial requests" on public.financial_requests for select to authenticated using ((select auth.uid()) = user_id or (select public.is_cashlab_admin()));
create policy "Users create own financial requests" on public.financial_requests for insert to authenticated with check (
  (select auth.uid()) = user_id and exists (
    select 1 from public.trading_accounts a where a.id = trading_account_id and a.user_id = (select auth.uid())
  )
);
create policy "Authenticated users read active promotions" on public.promotions for select to authenticated using ((active and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at >= now())) or (select public.is_cashlab_admin()));
create policy "Users read own referral profile" on public.referral_profiles for select to authenticated using ((select auth.uid()) = user_id or (select public.is_cashlab_admin()));
create policy "Users read own plan" on public.customer_plans for select to authenticated using ((select auth.uid()) = user_id or (select public.is_cashlab_admin()));

create policy "Admins manage performance" on public.account_performance_points for all to authenticated using ((select public.is_cashlab_admin())) with check ((select public.is_cashlab_admin()));
create policy "Admins manage financial requests" on public.financial_requests for all to authenticated using ((select public.is_cashlab_admin())) with check ((select public.is_cashlab_admin()));
create policy "Admins manage promotions" on public.promotions for all to authenticated using ((select public.is_cashlab_admin())) with check ((select public.is_cashlab_admin()));
create policy "Admins manage referrals" on public.referral_profiles for all to authenticated using ((select public.is_cashlab_admin())) with check ((select public.is_cashlab_admin()));
create policy "Admins manage plans" on public.customer_plans for all to authenticated using ((select public.is_cashlab_admin())) with check ((select public.is_cashlab_admin()));

revoke all on public.account_performance_points, public.financial_requests, public.promotions, public.referral_profiles, public.customer_plans from anon;
grant select, insert, update, delete on public.account_performance_points, public.promotions, public.referral_profiles, public.customer_plans to authenticated;
grant select, insert, update, delete on public.financial_requests to authenticated;

create trigger financial_requests_set_updated_at before update on public.financial_requests for each row execute function private.set_updated_at();
create trigger promotions_set_updated_at before update on public.promotions for each row execute function private.set_updated_at();
create trigger referral_profiles_set_updated_at before update on public.referral_profiles for each row execute function private.set_updated_at();

create or replace function public.get_or_create_referral_profile()
returns public.referral_profiles
language plpgsql
security definer
set search_path = ''
as $$
declare result public.referral_profiles;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  insert into public.referral_profiles (user_id, referral_code)
  values (auth.uid(), upper(substr(replace(auth.uid()::text, '-', ''), 1, 10)))
  on conflict (user_id) do nothing;
  select * into result from public.referral_profiles where user_id = auth.uid();
  return result;
end;
$$;
revoke all on function public.get_or_create_referral_profile() from public, anon;
grant execute on function public.get_or_create_referral_profile() to authenticated;
