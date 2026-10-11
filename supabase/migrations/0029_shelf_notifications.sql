-- Special Spoon — tell followers when someone makes a new shelf.
-- Run after 0028_shelf_cover.sql, in the Supabase SQL Editor.

-- Notifications that point at a shelf. Deleting the shelf removes them.
alter table public.notifications
  add column shelf_id uuid references public.shelves(id) on delete cascade;

alter table public.notifications drop constraint notifications_kind_check;
alter table public.notifications add constraint notifications_kind_check
  check (kind in ('note', 'reply', 'follow', 'cooked', 'digest', 'message', 'kiss', 'photo_comment', 'shelf'));

-- When followers were told about the shelf. Set once, the first time the
-- shelf is visible to them (on creation, or later when it stops being
-- "only me"), so switching it back and forth never notifies twice.
alter table public.shelves add column announced_at timestamptz;

-- Existing shelves count as already announced: only shelves made (or
-- shared) from now on send a notification.
update public.shelves set announced_at = created_at where announced_at is null;

-- On by default for new signups and existing profiles alike (a missing key
-- would otherwise read as off).
alter table public.profiles alter column notification_prefs
  set default '{"notes":true,"follows":true,"cooked":false,"digest":false,"messages":true,"shelves":true}'::jsonb;

update public.profiles
set notification_prefs = notification_prefs || '{"shelves": true}'::jsonb
where not (notification_prefs ? 'shelves');
