-- CashLab Phase 2: authenticated profiles, trading accounts, and admin reporting.
-- Trading credentials are deliberately excluded. A future MetaTrader bridge must
-- keep secrets in a server-only encrypted store outside browser-readable tables.

create schema if not exists private;

create or replace function public.is_cashlab_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce((select auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'), false);
$$;

revoke all on function public.is_cashlab_admin() from public, anon;
grant execute on function public.is_cashlab_admin() to authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  country text,
  timezone text not null default 'Asia/Dubai',
  preferred_currency text not null default 'USD',
  trading_experience text,
  preferred_markets text[] not null default '{}',
  avatar_url text,
  account_status text not null default 'active'
    check (account_status in ('active', 'disabled')),
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index profiles_email_lower_idx on public.profiles (lower(email));
create index profiles_created_at_idx on public.profiles (created_at desc);

create table public.trading_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (platform in ('MT4', 'MT5')),
  account_label text not null check (char_length(account_label) between 2 and 80),
  broker_name text not null check (char_length(broker_name) between 2 and 120),
  account_number text not null check (account_number ~ '^[A-Za-z0-9-]{3,40}$'),
  broker_server text not null check (char_length(broker_server) between 2 and 120),
  account_type text not null check (account_type in ('demo', 'live')),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  connection_type text not null default 'read_only'
    check (connection_type in ('read_only', 'trading_enabled')),
  connection_status text not null default 'pending'
    check (connection_status in ('pending', 'connected', 'error', 'disconnected')),
  last_connection_attempt_at timestamptz,
  last_sync_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trading_accounts_unique_connection
    unique (user_id, platform, broker_server, account_number)
);

create index trading_accounts_user_id_idx on public.trading_accounts (user_id);
create index trading_accounts_status_idx on public.trading_accounts (connection_status);
create index trading_accounts_platform_idx on public.trading_accounts (platform);
create index trading_accounts_created_at_idx on public.trading_accounts (created_at desc);

create table public.trading_account_metrics (
  id uuid primary key default gen_random_uuid(),
  trading_account_id uuid not null unique references public.trading_accounts(id) on delete cascade,
  balance numeric(20, 4),
  equity numeric(20, 4),
  margin numeric(20, 4),
  free_margin numeric(20, 4),
  floating_pl numeric(20, 4),
  daily_pl numeric(20, 4),
  currency text check (currency is null or currency ~ '^[A-Z]{3}$'),
  synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index trading_account_metrics_account_idx
  on public.trading_account_metrics (trading_account_id);

create table public.trading_positions (
  id uuid primary key default gen_random_uuid(),
  trading_account_id uuid not null references public.trading_accounts(id) on delete cascade,
  external_position_id text not null,
  symbol text not null,
  side text not null check (side in ('buy', 'sell')),
  volume numeric(20, 8),
  open_price numeric(20, 8),
  current_price numeric(20, 8),
  stop_loss numeric(20, 8),
  take_profit numeric(20, 8),
  profit numeric(20, 4),
  opened_at timestamptz,
  synced_at timestamptz,
  created_at timestamptz not null default now(),
  unique (trading_account_id, external_position_id)
);

create index trading_positions_account_idx on public.trading_positions (trading_account_id);
create index trading_positions_opened_at_idx on public.trading_positions (opened_at desc);

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  description text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index activity_log_user_created_idx on public.activity_log (user_id, created_at desc);
create index activity_log_event_idx on public.activity_log (event_type);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  category text not null default 'account',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_created_idx on public.notifications (user_id, created_at desc);
create index notifications_unread_idx on public.notifications (user_id, read_at) where read_at is null;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function private.set_updated_at() from public, anon, authenticated;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger trading_accounts_set_updated_at
before update on public.trading_accounts
for each row execute function private.set_updated_at();

create trigger trading_account_metrics_set_updated_at
before update on public.trading_account_metrics
for each row execute function private.set_updated_at();

create or replace function private.protect_connection_fields()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not public.is_cashlab_admin() then
    new.connection_status = old.connection_status;
    new.last_connection_attempt_at = old.last_connection_attempt_at;
    new.last_sync_at = old.last_sync_at;
    new.last_error = old.last_error;
  end if;
  return new;
end;
$$;

revoke all on function private.protect_connection_fields() from public, anon, authenticated;

create trigger trading_accounts_protect_connection_fields
before update on public.trading_accounts
for each row execute function private.protect_connection_fields();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, country)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(trim(concat_ws(' ', new.raw_user_meta_data ->> 'first_name', new.raw_user_meta_data ->> 'last_name')), ''),
    new.raw_user_meta_data ->> 'country'
  )
  on conflict (id) do nothing;

  insert into public.activity_log (user_id, actor_user_id, event_type, description)
  values (new.id, new.id, 'account_created', 'CashLab account created.');
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

-- Backfill users created before this migration.
insert into public.profiles (id, email, full_name, country, created_at, updated_at)
select
  id,
  coalesce(email, ''),
  nullif(trim(concat_ws(' ', raw_user_meta_data ->> 'first_name', raw_user_meta_data ->> 'last_name')), ''),
  raw_user_meta_data ->> 'country',
  created_at,
  now()
from auth.users
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.trading_accounts enable row level security;
alter table public.trading_account_metrics enable row level security;
alter table public.trading_positions enable row level security;
alter table public.activity_log enable row level security;
alter table public.notifications enable row level security;

revoke all on public.profiles, public.trading_accounts, public.trading_account_metrics,
  public.trading_positions, public.activity_log, public.notifications from anon;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.trading_accounts to authenticated;
grant select on public.trading_account_metrics, public.trading_positions to authenticated;
grant select, insert on public.activity_log to authenticated;
grant select on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;

create policy profiles_select_own_or_admin on public.profiles
for select to authenticated
using ((select auth.uid()) = id or (select public.is_cashlab_admin()));

create policy profiles_insert_own on public.profiles
for insert to authenticated
with check ((select auth.uid()) = id);

create policy profiles_update_own_or_admin on public.profiles
for update to authenticated
using ((select auth.uid()) = id or (select public.is_cashlab_admin()))
with check ((select auth.uid()) = id or (select public.is_cashlab_admin()));

create policy trading_accounts_select_own_or_admin on public.trading_accounts
for select to authenticated
using ((select auth.uid()) = user_id or (select public.is_cashlab_admin()));

create policy trading_accounts_insert_own on public.trading_accounts
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy trading_accounts_update_own_or_admin on public.trading_accounts
for update to authenticated
using ((select auth.uid()) = user_id or (select public.is_cashlab_admin()))
with check ((select auth.uid()) = user_id or (select public.is_cashlab_admin()));

create policy trading_accounts_delete_own_or_admin on public.trading_accounts
for delete to authenticated
using ((select auth.uid()) = user_id or (select public.is_cashlab_admin()));

create policy metrics_select_owner_or_admin on public.trading_account_metrics
for select to authenticated
using (
  (select public.is_cashlab_admin()) or exists (
    select 1 from public.trading_accounts a
    where a.id = trading_account_id and a.user_id = (select auth.uid())
  )
);

create policy positions_select_owner_or_admin on public.trading_positions
for select to authenticated
using (
  (select public.is_cashlab_admin()) or exists (
    select 1 from public.trading_accounts a
    where a.id = trading_account_id and a.user_id = (select auth.uid())
  )
);

create policy activity_select_own_or_admin on public.activity_log
for select to authenticated
using ((select auth.uid()) = user_id or (select public.is_cashlab_admin()));

create policy activity_insert_own_or_admin on public.activity_log
for insert to authenticated
with check (
  ((select auth.uid()) = user_id and (select auth.uid()) = actor_user_id)
  or (select public.is_cashlab_admin())
);

create policy notifications_select_own on public.notifications
for select to authenticated
using ((select auth.uid()) = user_id);

create policy notifications_update_own on public.notifications
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', false, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy avatars_select_own on storage.objects
for select to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy avatars_insert_own on storage.objects
for insert to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and owner_id = (select auth.uid())::text
);

create policy avatars_update_own on storage.objects
for update to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and owner_id = (select auth.uid())::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and owner_id = (select auth.uid())::text
);

create policy avatars_delete_own on storage.objects
for delete to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and owner_id = (select auth.uid())::text
);

-- The project owner/test address becomes the initial admin only when that user
-- already exists. Admin authorization is stored in protected app_metadata.
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where lower(email) = 'cashlabinc.org@gmail.com';
