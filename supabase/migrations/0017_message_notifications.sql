-- Special Spoon — notifications (in-app + push) for new messages.
-- Run after 0016_push_notifications.sql, in the Supabase SQL Editor.

alter table public.notifications
  add column conversation_id uuid references public.conversations(id) on delete cascade;

alter table public.notifications drop constraint notifications_kind_check;
alter table public.notifications add constraint notifications_kind_check
  check (kind in ('note', 'reply', 'follow', 'cooked', 'digest', 'message'));

-- New signups get the "messages" preference by default; existing profiles
-- are backfilled below rather than silently defaulting to off (a missing
-- key would otherwise read as "false" wherever the app checks
-- prefs[kind], per notify()'s own comment about never guessing).
alter table public.profiles alter column notification_prefs
  set default '{"notes":true,"follows":true,"cooked":false,"digest":false,"messages":true}'::jsonb;

update public.profiles
set notification_prefs = notification_prefs || '{"messages": true}'::jsonb
where not (notification_prefs ? 'messages');
