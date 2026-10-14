'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { ErrorScreen } from '@/components/error-screen';
import { FeedRow } from '@/components/feed/feed-row';
import { FeedShelfPost } from '@/components/feed/feed-shelf-post';
import { FeedSkeleton } from '@/components/feed/feed-skeleton';
import { RecentlyCooked } from '@/components/feed/recently-cooked';
import { fetchFeedPage, fetchRecentlyCooked } from '@/lib/supabase/queries';
import type { CookPhoto, FeedItem, RecentCook } from '@/lib/types';

// How far (after damping) the list has to be pulled down to refresh.
const PULL_TRIGGER = 64;
const PULL_MAX = 96;

export function FeedScreen() {
  const { loading: authLoading, profile } = useAuth();
  const viewerId = profile?.id ?? null;
  // undefined = loading, null = fetch failed, [] = genuinely empty.
  const [items, setItems] = useState<FeedItem[] | null | undefined>(undefined);
  // The Recently cooked row, loaded alongside each first page of the feed.
  const [cooks, setCooks] = useState<RecentCook[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pull, setPull] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadFirst = useCallback(async () => {
    const [page, recent] = await Promise.all([fetchFeedPage(), fetchRecentlyCooked(viewerId)]);
    setItems(page ? page.items : null);
    setCooks(recent);
    setCursor(page?.nextCursor ?? null);
  }, [viewerId]);

  useEffect(() => {
    if (authLoading) return;
    setItems(undefined);
    void loadFirst();
  }, [authLoading, loadFirst]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadFirst();
    setRefreshing(false);
  }, [loadFirst]);

  const loadMore = useCallback(async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    const page = await fetchFeedPage(cursor);
    setLoadingMore(false);
    if (!page) return;
    setItems((cur) => {
      const seen = new Set((cur ?? []).map((i) => i.key));
      return [...(cur ?? []), ...page.items.filter((i) => !seen.has(i.key))];
    });
    setCursor(page.nextCursor);
  }, [cursor, loadingMore]);

  // Load the next page as the end of the list scrolls into view.
  useEffect(() => {
    const root = scrollRef.current;
    const sentinel = sentinelRef.current;
    if (!root || !sentinel || !cursor) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) void loadMore();
      },
      { root, rootMargin: '600px 0px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [cursor, loadMore, items]);

  // Pull to refresh: dragging down while already at the top stretches a
  // gap above the list; letting go past the trigger reloads the feed.
  // Native, non-passive listeners so the pull can stop the page's own
  // rubber-band bounce.
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;
  const hasItems = Array.isArray(items);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let startY: number | null = null;
    let current = 0;
    const onStart = (e: TouchEvent) => {
      startY = el.scrollTop <= 0 && e.touches.length === 1 ? e.touches[0].clientY : null;
    };
    const onMove = (e: TouchEvent) => {
      if (startY === null) return;
      const dy = e.touches[0].clientY - startY;
      if (dy <= 0 || el.scrollTop > 0) {
        if (current) setPull((current = 0));
        return;
      }
      e.preventDefault();
      current = Math.min(PULL_MAX, dy * 0.5);
      setPull(current);
    };
    const onEnd = () => {
      if (startY !== null && current >= PULL_TRIGGER) void refreshRef.current();
      startY = null;
      current = 0;
      setPull(0);
    };
    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd, { passive: true });
    el.addEventListener('touchcancel', onEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('touchcancel', onEnd);
    };
  }, [hasItems]);

  const updatePhoto = (photo: CookPhoto) =>
    setCooks((cur) => cur.map((c) => (c.type === 'photo' && c.photo.id === photo.id ? { ...c, photo } : c)));
  const removePhoto = (photoId: string) =>
    setCooks((cur) => cur.filter((c) => !(c.type === 'photo' && c.photo.id === photoId)));

  if (items === undefined) {
    return <FeedSkeleton />;
  }

  if (items === null) {
    return (
      <ErrorScreen
        kind={typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'server'}
        onRetry={() => {
          setItems(undefined);
          void loadFirst();
        }}
      />
    );
  }

  const indicator = refreshing ? 40 : pull;

  return (
    <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-8">
      <div
        aria-live="polite"
        style={{ height: indicator, transition: pull ? 'none' : 'height 200ms ease-out' }}
        className="flex items-end justify-center overflow-hidden font-mono text-meta text-ink-mute"
      >
        <span className="pb-2.5">
          {refreshing ? 'Refreshing…' : pull >= PULL_TRIGGER ? 'Release to refresh' : 'Pull to refresh'}
        </span>
      </div>

      <RecentlyCooked cooks={cooks} onChange={updatePhoto} onDeleted={removePhoto} />

      {items.length === 0 ? (
        <div className="px-5 pt-8 text-center font-mono text-[14px] text-ink-mute">
          No activity yet — recipes people add or save will show up here.
        </div>
      ) : (
        items.map((item) =>
          item.type === 'shelf' ? (
            <FeedShelfPost key={item.key} shelf={item.shelf} />
          ) : (
            <FeedRow key={item.key} item={item.activity} recipe={item.recipe} author={item.author} />
          ),
        )
      )}

      <div ref={sentinelRef} className="py-5 text-center font-mono text-meta text-ink-mute">
        {loadingMore ? 'Loading more…' : items.length > 0 && !cursor ? 'You’re all caught up' : ''}
      </div>
    </div>
  );
}
