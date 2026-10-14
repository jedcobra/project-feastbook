// Product analytics — a thin wrapper over PostHog so the rest of the app
// calls track('recipe_saved') without caring whether analytics is set up.
// With no NEXT_PUBLIC_POSTHOG_KEY (local dev, previews) every call here is a
// no-op, and it's safe to import from code that also runs on the server
// (lib/supabase/queries.ts does) since nothing touches PostHog off the client.
//
// PostHog itself is loaded lazily after the page is up, so it adds nothing
// to first load; anything tracked before then waits in a short queue.
//
// Event names are snake_case, past tense, object first ("recipe_saved"),
// and they line up with the funnel in the growth plan: sign-up, activation
// (create/import/save/follow), habit (cooking), and sharing.

import type { PostHog } from 'posthog-js';

export type AnalyticsEvent =
  | 'signup_completed'
  | 'onboarding_completed'
  | 'recipe_import_succeeded'
  | 'recipe_import_failed'
  | 'recipe_published'
  | 'recipe_saved'
  | 'recipe_cooked'
  | 'recipe_rated'
  | 'recipe_shared'
  | 'profile_shared'
  | 'cooking_started'
  | 'cook_photo_added'
  | 'comment_posted'
  | 'follow_created'
  | 'shelf_created'
  | 'message_sent';

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

let client: PostHog | null = null;
let loading = false;
// Calls made before PostHog finishes loading, replayed in order once it has.
const pending: ((ph: PostHog) => void)[] = [];

function withClient(fn: (ph: PostHog) => void) {
  if (!KEY || typeof window === 'undefined') return;
  if (client) fn(client);
  else if (pending.length < 100) pending.push(fn);
}

export async function initAnalytics() {
  if (!KEY || typeof window === 'undefined' || client || loading) return;
  loading = true;
  const { default: posthog } = await import('posthog-js');
  posthog.init(KEY, {
    // Sent through our own domain (see the rewrites in next.config.mjs) so
    // ad blockers don't silently drop a chunk of the funnel.
    api_host: '/ingest',
    ui_host: process.env.NEXT_PUBLIC_POSTHOG_UI_HOST || 'https://us.posthog.com',
    // App Router navigations are client-side, so page views come from
    // history changes rather than full page loads.
    capture_pageview: 'history_change',
    capture_pageleave: true,
    // Anonymous visitors (people reading a shared /r/ link) are counted
    // without creating a person profile until they sign up.
    person_profiles: 'identified_only',
    // No screen recording — recipes, notes and messages are personal.
    disable_session_recording: true,
  });
  client = posthog;
  pending.splice(0).forEach((fn) => fn(posthog));
}

export function track(event: AnalyticsEvent, properties?: Record<string, unknown>) {
  withClient((ph) => ph.capture(event, properties));
}

// Ties events to a profile, so retention can be counted per person rather
// than per browser. Only the profile id and handle — never the email.
export function identify(profileId: string, properties: { handle: string; name?: string }) {
  withClient((ph) => {
    if (ph.get_distinct_id() !== profileId) ph.identify(profileId, properties);
  });
}

export function resetIdentity() {
  withClient((ph) => ph.reset());
}
