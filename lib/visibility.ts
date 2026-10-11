import type { ShelfVisibility, Visibility } from '@/lib/types';

export const VISIBILITY_OPTIONS: { id: Visibility; title: string; sub: string }[] = [
  { id: 'public', title: 'Public', sub: "Anyone can find it. Appears in your followers' feeds." },
  { id: 'followers', title: 'Followers', sub: 'Only people who follow you.' },
  { id: 'private', title: 'Just me', sub: 'Saved to your profile. Nobody else sees it.' },
];

export function visibilityLabel(v: Visibility): string {
  return VISIBILITY_OPTIONS.find((o) => o.id === v)?.title ?? v;
}

export const SHELF_VISIBILITY_OPTIONS: { id: ShelfVisibility; title: string }[] = [
  { id: 'private', title: 'Just me' },
  // Only people the owner follows (see 0030_shelf_audience.sql).
  { id: 'followers', title: 'People I follow' },
  { id: 'link', title: 'Everyone' },
];

export function shelfVisibilityLabel(v: ShelfVisibility): string {
  return SHELF_VISIBILITY_OPTIONS.find((o) => o.id === v)?.title ?? v;
}
