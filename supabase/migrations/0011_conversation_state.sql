-- Special Spoon — per-person archive/delete state for a conversation.
-- Run after 0010_blocking.sql, in the Supabase SQL Editor.

-- A conversation row is shared by both people, so "delete" and "archive"
-- can't just remove or flag that row without doing it to the other person
-- too. This tracks each side's own view of it instead — deleting or
-- archiving only ever changes what you see.
create table public.conversation_participant_state (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  archived boolean not null default false,
  deleted_at timestamptz,
  primary key (conversation_id, profile_id)
);

alter table public.conversation_participant_state enable row level security;

create policy "participants manage their own conversation state" on public.conversation_participant_state for all using (
  profile_id in (select id from public.profiles where user_id = auth.uid())
) with check (
  profile_id in (select id from public.profiles where user_id = auth.uid())
);

-- A new message is real new activity, so it brings the thread back for
-- whoever archived or deleted it — same as most messaging apps. This has
-- to run as a trigger rather than from the client: RLS on the table above
-- only lets you touch your own state row, but a new message needs to
-- clear it for *both* people, including whichever one didn't send it.
create function public.handle_new_message()
returns trigger as $$
begin
  delete from public.conversation_participant_state where conversation_id = new.conversation_id;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_message_created
  after insert on public.messages
  for each row execute function public.handle_new_message();
