-- Keep the Cash Lab brand name consistently spaced in account activity.
update public.activity_log
set description = 'Cash Lab account created.'
where event_type = 'account_created'
  and description = 'CashLab account created.';

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
  values (new.id, new.id, 'account_created', 'Cash Lab account created.');
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;
