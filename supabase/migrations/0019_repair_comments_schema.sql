-- Special Spoon — repairs comments.parent_id/cooked/photo_url if an earlier
-- migration (0007 or 0014) didn't fully apply, which is what causes every
-- note/reply post to fail with "Couldn't post that" (the insert names a
-- column that doesn't exist). Safe to run even if nothing is missing.

alter table public.comments add column if not exists parent_id uuid references public.comments(id) on delete cascade;
alter table public.comments add column if not exists cooked boolean not null default false;
alter table public.comments add column if not exists photo_url text;
