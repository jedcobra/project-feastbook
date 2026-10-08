-- Special Spoon — a real "default privacy for new recipes" setting.
-- Run after 0017_message_notifications.sql, in the Supabase SQL Editor.

-- Null means "ask each time" (the only behavior before this migration).
-- Publish still shows the three options and still lets you override them
-- per recipe — this only changes what's pre-selected when you land there.
alter table public.profiles
  add column default_visibility text check (default_visibility in ('public', 'followers', 'private'));
