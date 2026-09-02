-- Harden user-managed fields and create durable, non-sensitive audit events.

create or replace function private.protect_profile_system_fields()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not public.is_cashlab_admin() then
    new.id = old.id;
    new.email = old.email;
    new.account_status = old.account_status;
    new.last_seen_at = old.last_seen_at;
    new.created_at = old.created_at;
  end if;
  return new;
end;
$$;

revoke all on function private.protect_profile_system_fields() from public, anon, authenticated;

create trigger profiles_protect_system_fields
before update on public.profiles
for each row execute function private.protect_profile_system_fields();

create or replace function private.protect_connection_fields()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not public.is_cashlab_admin() then
    if tg_op = 'INSERT' then
      new.connection_status = 'pending';
      new.last_connection_attempt_at = null;
      new.last_sync_at = null;
      new.last_error = null;
    else
      new.connection_status = old.connection_status;
      new.last_connection_attempt_at = old.last_connection_attempt_at;
      new.last_sync_at = old.last_sync_at;
      new.last_error = old.last_error;
      new.created_at = old.created_at;
    end if;
  end if;
  return new;
end;
$$;

create trigger trading_accounts_protect_connection_fields_insert
before insert on public.trading_accounts
for each row execute function private.protect_connection_fields();

create or replace function private.audit_profile_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.activity_log (user_id, actor_user_id, event_type, description)
  values (new.id, (select auth.uid()), 'profile_updated', 'Profile updated.');
  return new;
end;
$$;

create or replace function private.audit_trading_account_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_user uuid := coalesce(new.user_id, old.user_id);
begin
  if tg_op = 'INSERT' then
    insert into public.activity_log (user_id, actor_user_id, event_type, description, metadata)
    values (target_user, (select auth.uid()), 'trading_account_added', new.platform || ' account added.', jsonb_build_object('account_id', new.id));
    insert into public.notifications (user_id, title, message, category)
    values (target_user, 'Trading account added', 'Your ' || new.platform || ' connection is pending.', 'account');
    return new;
  elsif tg_op = 'DELETE' then
    insert into public.activity_log (user_id, actor_user_id, event_type, description)
    values (target_user, (select auth.uid()), 'trading_account_removed', old.platform || ' account removed.');
    return old;
  elsif new.connection_status is distinct from old.connection_status then
    insert into public.activity_log (user_id, actor_user_id, event_type, description, metadata)
    values (target_user, (select auth.uid()), 'connection_status_changed', 'Trading account connection status changed.', jsonb_build_object('account_id', new.id, 'status', new.connection_status));
    insert into public.notifications (user_id, title, message, category)
    values (target_user, 'Connection status updated', 'Your ' || new.platform || ' account is now ' || new.connection_status || '.', 'account');
  end if;
  return new;
end;
$$;

revoke all on function private.audit_profile_change() from public, anon, authenticated;
revoke all on function private.audit_trading_account_change() from public, anon, authenticated;

create trigger profiles_audit_update
after update on public.profiles
for each row
when (old.* is distinct from new.*)
execute function private.audit_profile_change();

create trigger trading_accounts_audit_change
after insert or update or delete on public.trading_accounts
for each row execute function private.audit_trading_account_change();
