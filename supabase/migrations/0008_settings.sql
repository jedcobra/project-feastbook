-- Special Spoon — Settings: profile link field, notification preferences,
-- and account deletion. Run after 0007_notes_and_notifications.sql, in the
-- Supabase SQL Editor.

alter table public.profiles
  add column link text not null default '',
  add column notification_prefs jsonb not null default '{"notes":true,"follows":true,"cooked":false,"digest":false}'::jsonb;

-- "Delete my account" removes the profile row directly — everything a
-- person owns cascades from profiles.id, so this one delete is what
-- actually erases their content. The auth.users row itself (email
-- included) is removed separately, server-side, via /api/account/delete,
-- since that needs the service-role key and can't happen from the client.
create policy "users delete their own profile" on public.profiles for delete using (user_id = auth.uid());
