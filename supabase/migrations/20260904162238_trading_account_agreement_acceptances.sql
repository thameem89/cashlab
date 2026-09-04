-- Record the exact agreement accepted with a trading-account configuration.
-- Credentials remain deliberately excluded from browser-readable schemas.

create table public.trading_account_agreement_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trading_account_id uuid not null references public.trading_accounts(id) on delete cascade,
  agreement_version text not null,
  document_hash text not null check (document_hash ~ '^[a-f0-9]{64}$'),
  section_19_variant text not null check (section_19_variant = 'termination_and_survival'),
  accepted_at timestamptz not null default now(),
  client_full_name text,
  client_email text not null,
  trading_account_number text not null,
  broker_name text not null,
  unique (trading_account_id, agreement_version)
);

create index trading_account_acceptances_user_id_idx
  on public.trading_account_agreement_acceptances (user_id, accepted_at desc);

alter table public.trading_account_agreement_acceptances enable row level security;

create policy "Users can read their own agreement acceptances"
on public.trading_account_agreement_acceptances for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Admins can read agreement acceptance metadata"
on public.trading_account_agreement_acceptances for select
to authenticated
using ((select public.is_cashlab_admin()));

revoke insert, update, delete on public.trading_account_agreement_acceptances
  from anon, authenticated;
grant select on public.trading_account_agreement_acceptances to authenticated;

create or replace function public.submit_trading_account_configuration(
  p_platform text,
  p_account_label text,
  p_account_number text,
  p_broker_name text,
  p_broker_server text,
  p_account_type text,
  p_agreement_version text,
  p_document_hash text,
  p_client_full_name text,
  p_client_email text
)
returns public.trading_accounts
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  created_account public.trading_accounts;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;
  if p_agreement_version <> '1.0'
    or p_document_hash <> '8047d863120a3f8bb41df44e179ed9067180fea3b044b47905aa8e6594c1a9a5'
  then
    raise exception 'Agreement acceptance is invalid';
  end if;

  insert into public.trading_accounts (
    user_id, platform, account_label, broker_name, account_number,
    broker_server, account_type, currency, connection_type, connection_status
  ) values (
    current_user_id, p_platform, trim(p_account_label), trim(p_broker_name),
    trim(p_account_number), trim(p_broker_server), p_account_type,
    'USD', 'trading_enabled', 'pending'
  ) returning * into created_account;

  insert into public.trading_account_agreement_acceptances (
    user_id, trading_account_id, agreement_version, document_hash,
    section_19_variant, client_full_name, client_email,
    trading_account_number, broker_name
  ) values (
    current_user_id, created_account.id, p_agreement_version, p_document_hash,
    'termination_and_survival', nullif(trim(p_client_full_name), ''),
    trim(p_client_email), trim(p_account_number), trim(p_broker_name)
  );

  return created_account;
end;
$$;

revoke all on function public.submit_trading_account_configuration(
  text, text, text, text, text, text, text, text, text, text
) from public, anon;
grant execute on function public.submit_trading_account_configuration(
  text, text, text, text, text, text, text, text, text, text
) to authenticated;
