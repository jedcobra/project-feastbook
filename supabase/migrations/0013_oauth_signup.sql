-- Special Spoon — safe profile creation for OAuth sign-ups (Google,
-- Facebook). Run after 0012_shelf_archive.sql, in the Supabase SQL Editor.

-- Email/password sign-up always supplies an explicit, pre-checked-unique
-- handle (see checkHandleAvailable() client-side before signUp() is ever
-- called). OAuth sign-up has no such step — there's no form to fill in
-- before the redirect — so the old fallback (the email's username part,
-- unmodified) could easily collide between two different people and,
-- since handle is unique, take the whole signup down with a constraint
-- violation. This makes that fallback collision-safe: strip anything
-- that isn't a letter or digit, then try suffixing 2, 3, 4... until a
-- free handle turns up. Also reads a couple of the metadata keys OAuth
-- providers actually populate (name/full_name) instead of only the
-- app-supplied one.
create or replace function public.handle_new_user()
returns trigger as $$
declare
  base_handle text;
  candidate_handle text;
  suffix int := 1;
begin
  base_handle := new.raw_user_meta_data ->> 'handle';
  if base_handle is null or base_handle = '' then
    base_handle := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-zA-Z0-9]', '', 'g'));
  end if;
  if base_handle is null or base_handle = '' then
    base_handle := 'cook';
  end if;

  candidate_handle := base_handle;
  while exists (select 1 from public.profiles where handle = candidate_handle) loop
    suffix := suffix + 1;
    candidate_handle := base_handle || suffix::text;
  end loop;

  insert into public.profiles (user_id, name, handle, bio)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'name',
      new.raw_user_meta_data ->> 'full_name',
      split_part(new.email, '@', 1)
    ),
    candidate_handle,
    ''
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;
