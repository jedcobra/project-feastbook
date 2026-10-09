-- Special Spoon — handles become case-insensitive.
-- Run after 0020_shared_recipe_messages.sql, in the Supabase SQL Editor.
--
-- `handle` already has a UNIQUE constraint, but it's case-sensitive, so
-- "Maya" and "maya" could both exist as separate rows. This normalizes
-- every existing handle to lowercase (renaming any case-insensitive
-- collision found along the way) and adds a CHECK constraint so a
-- mixed-case handle can never be written again.

-- Rename the newer half of any case-insensitive collision before
-- lowercasing, so the later lowercase update can't violate the unique
-- constraint. Picks a free `<handle><n>` suffix per collision.
with dupes as (
  select id, lower(handle) as lh,
         row_number() over (partition by lower(handle) order by created_at) as rn
  from public.profiles
)
update public.profiles p
set handle = dupes.lh || (dupes.rn - 1)::text
from dupes
where p.id = dupes.id and dupes.rn > 1;

update public.profiles set handle = lower(handle) where handle <> lower(handle);

alter table public.profiles
  add constraint profiles_handle_lowercase check (handle = lower(handle));

-- Defense in depth: lowercase whatever signup passes in too, not just the
-- email-derived fallback.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, name, handle, bio)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    lower(coalesce(new.raw_user_meta_data ->> 'handle', split_part(new.email, '@', 1))),
    ''
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;
