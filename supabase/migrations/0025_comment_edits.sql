-- Special Spoon — editing notes. Run after 0024_shelf_order.sql, in the
-- Supabase SQL Editor.
--
-- edited_at is stamped by the trigger below, never by the client, so the
-- "edited" mark can't be skipped or faked. The trigger also pins the
-- columns an edit has no business changing (which recipe/thread a note
-- belongs to, who wrote it, when), since the existing update policy only
-- checks authorship.

alter table public.comments add column if not exists edited_at timestamptz;

create or replace function public.comments_on_edit()
returns trigger
language plpgsql
as $$
begin
  new.id := old.id;
  new.recipe_id := old.recipe_id;
  new.author_id := old.author_id;
  new.parent_id := old.parent_id;
  new.cooked := old.cooked;
  new.created_at := old.created_at;
  if new.text is distinct from old.text or new.photo_url is distinct from old.photo_url then
    new.edited_at := now();
  else
    new.edited_at := old.edited_at;
  end if;
  return new;
end;
$$;

drop trigger if exists comments_on_edit on public.comments;
create trigger comments_on_edit
  before update on public.comments
  for each row execute function public.comments_on_edit();
