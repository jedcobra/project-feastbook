import type { Visibility } from '@/lib/types';

export const VISIBILITY_OPTIONS: { id: Visibility; title: string; sub: string }[] = [
  { id: 'public', title: 'Public', sub: "Anyone can find it. Appears in your followers' feeds." },
  { id: 'followers', title: 'Followers', sub: 'Only people who follow you.' },
  { id: 'private', title: 'Just me', sub: 'Saved to your cookbook. Nobody else sees it.' },
];

export function visibilityLabel(v: Visibility): string {
  return VISIBILITY_OPTIONS.find((o) => o.id === v)?.title ?? v;
}
