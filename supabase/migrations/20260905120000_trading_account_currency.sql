-- Add the selected trading-account denomination to atomic account submission.
-- The currency column already exists; existing account values are not changed.

alter table public.trading_account_agreement_acceptances
  add column if not exists account_currency text
  check (account_currency is null or account_currency ~ '^[A-Z]{3}$');

drop function if exists public.submit_trading_account_configuration(
  text, text, text, text, text, text, text, text, text, text
);

create function public.submit_trading_account_configuration(
  p_platform text,
  p_account_label text,
  p_account_number text,
  p_broker_name text,
  p_broker_server text,
  p_account_type text,
  p_currency text,
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
  normalized_currency text := upper(trim(p_currency));
  created_account public.trading_accounts;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;
  if normalized_currency is null or normalized_currency !~ '^[A-Z]{3}$' then
    raise exception 'A valid account currency is required';
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
    normalized_currency, 'trading_enabled', 'pending'
  ) returning * into created_account;

  insert into public.trading_account_agreement_acceptances (
    user_id, trading_account_id, agreement_version, document_hash,
    section_19_variant, client_full_name, client_email,
    trading_account_number, broker_name, account_currency
  ) values (
    current_user_id, created_account.id, p_agreement_version, p_document_hash,
    'termination_and_survival', nullif(trim(p_client_full_name), ''),
    trim(p_client_email), trim(p_account_number), trim(p_broker_name),
    normalized_currency
  );

  return created_account;
end;
$$;

revoke all on function public.submit_trading_account_configuration(
  text, text, text, text, text, text, text, text, text, text, text
) from public, anon;
grant execute on function public.submit_trading_account_configuration(
  text, text, text, text, text, text, text, text, text, text, text
) to authenticated;
