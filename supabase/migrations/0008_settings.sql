-- Special Spoon — Settings: profile link field, notification preferences,
-- and account deletion. Run after 0007_notes_and_notifications.sql, in the
-- Supabase SQL Editor.

alter table public.profiles
  add column link text not null default '',
  add column notification_prefs jsonb not null default '{"notes":true,"follows":true,"cooked":false,"digest":false}'::jsonb;

-- "Delete my account" removes the profile row directly (not the auth.users
-- row, which can't be deleted client-side anyway) — everything a person
-- owns cascades from profiles.id, so this one delete is what actually
-- erases their content.
create policy "users delete their own profile" on public.profiles for delete using (user_id = auth.uid());
