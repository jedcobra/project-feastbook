'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { BookIcon, CookIcon, HeartIcon, UserIcon } from '@/components/icons';
import { Avatar } from '@/components/avatar';
import { OutlineBox } from '@/components/outline-box';
import { TopBar } from '@/components/top-bar';
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from '@/lib/supabase/queries';
import type { AppNotification, NotificationKind } from '@/lib/types';

type FilterKey = 'all' | 'unread' | 'note' | 'follow';
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'note', label: 'Notes' },
  { key: 'follow', label: 'Follows' },
];

type Group = 'Today' | 'This week' | 'Earlier';

function groupFor(iso: string): Group {
  const then = new Date(iso);
  const now = new Date();
  const isToday = then.toDateString() === now.toDateString();
  if (isToday) return 'Today';
  const days = (now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24);
  return days < 7 ? 'This week' : 'Earlier';
}

function describe(n: AppNotification): string {
  switch (n.kind) {
    case 'note':
      return 'noted on';
    case 'reply':
      return 'replied to your note on';
    case 'cooked':
      return 'cooked';
    case 'follow':
      return 'started following you';
    case 'digest':
      return n.excerpt ?? 'Weekly digest';
    default:
      return '';
  }
}

const KIND_ICON: Record<NotificationKind, typeof HeartIcon> = {
  note: HeartIcon,
  reply: HeartIcon,
  follow: UserIcon,
  cooked: CookIcon,
  digest: BookIcon,
};

export function NotificationsScreen() {
  const { profile } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<AppNotification[] | null>(null);
  const [filter, setFilter] = useState<FilterKey>('all');

  useEffect(() => {
    if (profile) fetchNotifications(profile.id).then(setItems);
  }, [profile]);

  const handleMarkAllRead = async () => {
    if (!profile) return;
    setItems((is) => is?.map((n) => ({ ...n, read: true })) ?? is);
    await markAllNotificationsRead(profile.id);
  };

  const handleOpen = async (n: AppNotification) => {
    setItems((is) => is?.map((x) => (x.id === n.id ? { ...x, read: true } : x)) ?? is);
    if (!n.read) await markNotificationRead(n.id);
    if (n.recipeId) router.push(`/recipe/${n.recipeId}`);
    else if (n.actorHandle) router.push(`/${n.actorHandle}`);
  };

  const unreadCount = items?.filter((n) => !n.read).length ?? 0;
  const shown = (items ?? []).filter((n) =>
    filter === 'all' ? true : filter === 'unread' ? !n.read : n.kind === filter,
  );
  const groups: Record<Group, AppNotification[]> = { Today: [], 'This week': [], Earlier: [] };
  for (const n of shown) groups[groupFor(n.createdAt)].push(n);

  return (
    <>
      <TopBar
        title="Notifications"
        backHref="/feed"
        subtitle={items === null ? undefined : unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        trailing={
          unreadCount > 0 && (
            <OutlineBox compact onClick={handleMarkAllRead}>
              Mark read
            </OutlineBox>
          )
        }
      />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        <div className="mb-1 flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`rounded border border-ink px-2 py-[3px] font-mono text-[11px] ${
                filter === f.key ? 'bg-ink text-cream' : 'bg-transparent text-ink'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {items === null ? (
          <div className="py-8 text-center font-mono text-[12px] text-ink-mute">Loading…</div>
        ) : shown.length === 0 ? (
          <div className="mt-4 border border-dashed border-rule p-[22px] text-center">
            <div className="mb-1.5 font-display text-[18px] font-bold text-ink">Nothing here</div>
            <div className="font-mono text-[12px] leading-[1.55] text-ink-mute">
              When someone cooks or notes on one of yours, it lands here. Nothing else does.
            </div>
          </div>
        ) : (
          (['Today', 'This week', 'Earlier'] as Group[]).map(
            (g) =>
              groups[g].length > 0 && (
                <div key={g} className="mt-4">
                  <div className="mb-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-mute">{g}</div>
                  {groups[g].map((n) => {
                    const Icon = KIND_ICON[n.kind];
                    return (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => handleOpen(n)}
                        className="flex w-full items-start gap-2.5 border-t border-dashed border-rule py-3 text-left"
                      >
                        <div className="w-1.5 flex-shrink-0 pt-[7px]">
                          {!n.read && <div className="h-1.5 w-1.5 rounded-full bg-accent" />}
                        </div>
                        {n.actorName ? (
                          <Avatar name={n.actorName} size={26} />
                        ) : (
                          <span className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full border border-ink">
                            <Icon size={13} className="text-ink" />
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-mono text-[12px] leading-[1.45] text-ink">
                            {n.actorName && <span className="font-semibold">{n.actorName} </span>}
                            <span className="text-ink-mute">{describe(n)}</span>
                            {n.recipeTitle && <span> {n.recipeTitle}</span>}
                          </div>
                          {n.excerpt && n.kind !== 'digest' && (
                            <div className="mt-1 border-l border-dashed border-rule pl-2.5 font-mono text-[11px] leading-[1.5] text-ink-mute">
                              {n.excerpt}
                            </div>
                          )}
                        </div>
                        <span className="flex-shrink-0 font-mono text-[10px] text-ink-mute">
                          {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ),
          )
        )}
      </div>
    </>
  );
}
