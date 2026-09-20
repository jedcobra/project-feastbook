# Merge notes — for Claude Code

Everything in `prototype/` is the design reference: React + inline styles, one file per area, tokens in `theme.jsx`. Port to Next.js + Tailwind; don't copy the inline styles.

## What's new since the first handoff

| Area | Reference file | Notes for the build |
|---|---|---|
| Notes thread | `ss-comments.jsx` | One level of replies only. `cooked it` and `author` badges. Filters: all / cooked / questions. Optimistic like + post. |
| Recipe ownership | `ss-edit.jsx` | Owner sheet → edit / revisions / privacy / copy link / print. Save enabled only when dirty. Delete needs a second tap and states consequences. |
| Revisions | `ss-edit.jsx` | Every save writes a version row; view + restore. Server-side diff summary is a stub in the prototype. |
| Onboarding | `ss-onboarding.jsx` | Four steps, all skippable. Runs once after signup; gate on a `user.onboardedAt` column. Taste tags seed Discover ranking. |
| Search | `ss-search.jsx` | One query across recipes (title, subtitle, tags, ingredient text), people, shelves. Scope counts computed client-side in the mock — do this server-side. |
| Shelves | `ss-shelves.jsx` | A recipe belongs to 0..n shelves. Bookmark always opens the add-to-shelf sheet, never a silent save. Per-shelf privacy. |
| Notifications | `ss-notify.jsx` | Grouped Today / This week / Earlier. Unread flag per row. Types: note, reply, follow, cooked, digest. Push copy in `SSPushPreview`. |
| Settings | `ss-settings.jsx` | Plain-language rows. Export is plain text + images. Account deletion enumerates what's lost and requires typing DELETE. |
| States | `ss-states.jsx` | Skeleton wears the feed's own shape — no spinners. Errors: offline / server / gone / private, each with a real next action. Import failure offers three ways forward. |
| Public share page | `ss-share.jsx` | Whole recipe, no wall. Account ask sits *after* the method, plus a sticky "open in app" bar. Needs SSR + OG tags. |

## Build order

1. Auth + onboarding (blocks everything else)
2. Recipe CRUD + revisions
3. Shelves + add-to-shelf sheet
4. Notes thread + notifications
5. Search
6. Settings / account / export
7. Public share page (SSR) + states pass

## Non-negotiables from the design

- No photography anywhere, including avatars — monograms only.
- Dashed rules, not borders-with-shadows. Outlined buttons, one filled primary per screen.
- Serif (Libre Caslon Text) for titles and step headings; mono (JetBrains Mono) for all metadata and body.
- `#232459` ink on `#F4EEDD` paper. One accent. Never introduce a new hue.
- Privacy is asked per recipe at publish time; there is no global default beyond "ask each time".
- Error and empty copy says what happened and what you can still do. No apologies without a next step.

## Still engineering, not design

- The link parser (the real unknown — spike before building the import UI)
- Real auth providers and session handling
- Offline cache for "recipes you've opened before"
