# Handoff: Special Spoon

A social iOS app that lets people create and curate a personal online recipe book, and share it with friends and followers.

---

## About the Design Files

The files in this bundle are **design references created in HTML/React** — high-fidelity prototypes showing intended look, layout, and behavior. **They are not production code to copy directly.**

Your job is to **recreate these designs in the target environment.** The chosen target for this build is **Next.js (App Router) + Tailwind CSS**, shipping web-first. The prototype is framed in an iPhone bezel because the design originated as an iOS concept — ignore the bezel, but keep the mobile-first proportions: the layouts are designed for a ~400px column and should scale up gracefully on desktop (center the column, max-width ~560px; don't stretch list rows to full desktop width).

The prototype lives in `prototype/Special Spoon.html`. Open it in a browser to interact with it: tap a recipe to open it, tap a name to see their cookbook, use the tab bar to switch sections, tap "Start cooking" for full-screen cooking mode. Use the **Tweaks** toggle in the dev toolbar to switch palette, typography, and layout variants.

## Fidelity

**High-fidelity.** Final colors, typography, spacing, and interactions are decided. Recreate the visuals pixel-perfectly (within reason for the target platform's conventions — e.g., respect iOS safe areas, native font hinting, etc.). Where the target platform has stronger affordances (haptics, native swipe-to-back, system share sheets), use them instead of the web equivalents in the prototype.

The prototype intentionally has **no recipe photography** — the visual language is text-first, like a printed cookbook. This is a design decision, not a placeholder. If you eventually add user-uploaded photos, treat them as secondary to the typography, not the centerpiece.

---

## Design Direction

**Bookish · utilitarian · text-first.** The reference point is [noods.io](https://noods.io) — a digital cookbook tool with indigo ink on cream paper, monospace metadata, bold serif display headlines, dashed dividers, and square checkboxes.

What this design rejects:
- Photo-tile grids (Instagram-for-food)
- Pastel/warm-illustration food-app tropes
- Ornamental "cookbook" pastiche (handwritten fonts, masking tape, stamps, ruled paper)
- Emoji icons
- Aggressive gradients or rounded buttons

What this design embraces:
- Long-form serif titles next to mono metadata
- Generous vertical rhythm with dashed-rule separators
- Square outlined buttons (`border-radius: 6–8px` max)
- Functional indigo as the only accent color
- Information density over visual density

---

## Core Concept & User Model

| Entity | Description |
|---|---|
| **User** | Has a name, handle, bio, avatar (monogram, no photo upload required v1). Has a personal **cookbook** = the recipes they have authored. Maintains **shelves** (curated collections of recipes — can include their own or others'). Follows & is followed by other users. |
| **Recipe** | Title, subtitle, intro (long-form), ingredients (sectioned, each with quantity + name), steps (each with title + description + optional timer in minutes), notes (author's notes), tags. Metadata: time, serves, difficulty, rating, "made it" count, save count. |
| **Shelf** | A collection of recipes (possibly across multiple authors). Title + subtitle + ordered recipe list. |
| **Activity** | Feed entries: `new` (author shared a recipe), `madeit` (user cooked someone's recipe, optionally with caption + photo), `saved` (user saved a recipe). |
| **Comment** | Threaded notes on a recipe — author, text, like count, optional reply count. |

---

## Screens

The prototype implements **six core screens**. The order matches the tab bar.

### 1. Feed (`/feed`)
**Tab:** Feed (home)
**Purpose:** See what friends are cooking, sharing, and saving — chronological.

**Layout (default = "Index"):**
- Top bar: "Special Spoon" brand wordmark (serif bold), small search button on right
- Sub-header strip: `WED 22 APR · N updates` (monospace, dashed border below)
- Scrolling list of activity rows, each separated by a dashed rule:
  - Row top: avatar (22px monogram) · author name (mono, dashed-underline link) · verb (`added` / `cooked` / `saved`) · timestamp right-aligned
  - Recipe title: serif bold, 22px, indigo
  - Optional caption: mono italic-style quote (only on "madeit" entries)
  - Meta row: time · serves · cooked count · tags (right-aligned)

**Alternate layouts** (selectable):
- **Magazine** — looser, descriptive subtitle visible, blockquote-style caption
- **Compact** — one line per item, ultra-dense ledger

### 2. Recipe Detail (`/recipe/:id`)
**Purpose:** Read a recipe; eventually start cooking it.

**Layout (default = "Document"):**
- Top bar: back button (outlined box w/ chevron) · bookmark button · share button
- Tags row (small mono pills)
- Title: serif bold, 32px
- Subtitle: mono, muted
- Author chip: avatar · dashed-underline name · @handle
- Meta grid (4 cols, dashed borders): Time · Serves · Level · Rating
- Intro paragraph: mono, generous line-height
- Ingredients section:
  - `INGREDIENTS` label (mono small caps)
  - Optional subsection labels
  - Rows: square checkbox + quantity (mono, fixed width) + name. Tap to check off → strikethrough + 40% opacity.
- Method section:
  - `METHOD` label
  - Numbered rows (`01`, `02`...): step title (serif bold) + optional timer pill (e.g. "10m")
  - Tap a step to expand and show full description + a "Start timer" button (if it has a timer)
- Author's notes block: dashed-bordered box with muted body text
- Comments block: list of comment threads
- Sticky bottom: **"Start cooking"** button (indigo filled)

**Alternate layouts:** `Focus` (single-column, larger type), `Margin` (two-column: ingredients left-rail, method right-column).

### 3. My Cookbook / Profile (`/me`)
**Tab:** Cookbook
**Purpose:** The user's own profile and curation hub.

**Layout:**
- Top bar: "Special Spoon" wordmark + edit button (icon, outlined)
- Profile card (bordered indigo rectangle):
  - Name (serif bold, 26px)
  - `@handle` (mono, muted)
  - Bio (mono, line-height 1.55)
  - Stats grid (3 cols, dashed top rule): Recipes · Followers · Following — each with serif number + small mono label
- Tab strip: `Shelves` | `Recipes` | `Cooked` (mono, active tab has 2px indigo underline)
- **Shelves tab:** rows with a small bordered count badge on the left, serif shelf name, mono subtitle, recipe-title tag chips below, chevron right. Followed by a dashed "+ New shelf" button.
- **Recipes tab:** vertical list, serif recipe title + mono meta line + save count right-aligned
- **Cooked tab:** dashed-bordered empty state for v1 (in the future, displays user's "made it" photos)

### 4. Friend Profile (`/@handle`)
Same component as My Cookbook, but:
- Top bar has back button instead of brand
- No edit button → share button instead
- A `Follow` + `Message` action row appears below the profile card (Follow is filled indigo, Message is outlined)
- The "Cooked" tab is visible to the viewer (in v2 — for v1, same dashed empty state).

### 5. Cooking Mode (`/cook/:id`)
**Purpose:** Hands-free step-by-step cooking. Full screen, dark.

**Layout:**
- Background: indigo (`--ss-ink`), text: cream
- Top bar: `×` close button (outlined) · "NOW COOKING" tiny label + recipe title (truncating) · step counter `01/05`
- Thin progress bar
- Step counter label (mono small caps)
- Step title (serif bold, 36px)
- Step description (mono, generous line-height)
- Optional timer card: large mono countdown (e.g., `04:00`) + Start/Pause button
- First step only: "You'll need" mini ingredient list (dashed-bordered)
- Sticky bottom: back arrow (outlined box) + cream-filled "Next step / Done" button

**Timer behavior:** Tap Start → counts down in real time. Reaching 0 stops automatically (no notification logic in prototype — implement haptic + sound on iOS).

### 6. Discover (`/discover`)
**Tab:** Discover
**Purpose:** Find new recipes and cooks.

**Layout:**
- Top bar: title "Discover"
- Search input (mono placeholder, outlined, indigo border)
- Trending tags section: heading label + horizontal-wrap row of tag chips; the first is selected (filled indigo)
- Cooks to follow: vertical list, each row = avatar + name + meta (recipes / followers count) + Follow outlined button
- Editor's picks: vertical list of recipes — serif title, mono meta, tag chip right-aligned

### 7. Add Recipe (`/add`) — Not yet designed
The center tab bar button. Currently a placeholder ("not yet built"). Recipe-creation flow is the obvious next design task.

---

## Interactions & Navigation

| Trigger | Behavior |
|---|---|
| Tap recipe anywhere | Push recipe detail |
| Tap user name / avatar | Push their profile |
| Recipe detail → Start cooking | Push cooking mode |
| Cooking mode → × | Pop back to recipe |
| Tab bar tap | Reset stack and switch to that tab's root |
| Back button (top bar) | Pop one level |
| Tap ingredient row | Toggle check / strikethrough |
| Tap method step | Expand to show full description |
| Tap "Start timer" | Begin countdown for that step |

**Navigation model:** A simple per-tab stack works for v1. iOS native nav controllers (or React Router) handle this cleanly. In the prototype it's a single stack persisted to localStorage.

**Animations:** The prototype is mostly static (CSS transitions only on opacity for the checklist). On iOS, use standard push/pop transitions. Subtle 150–250ms ease for small state changes (ingredient strikethrough, step expand). Avoid bouncy/playful springs — the brand is restrained.

---

## Design Tokens

### Colors — Default palette ("Cream")

```
--bg:          #F4EEDD   /* warm cream paper — primary background */
--bg-deep:     #EDE4C9   /* slightly deeper, for cards / inset blocks */
--surface:     #FBF6E6   /* card surface white */
--ink:         #232459   /* indigo — primary text and accent */
--ink-soft:    #3A3C7A   /* secondary text */
--ink-mute:    #8B8AAF   /* meta text */
--rule:        #CFC49C   /* dashed rules */
--rule-soft:   #E0D7B4   /* lighter rules */
--accent:      #D13E3E   /* vermilion — destructive, "new" badge */
--accent-2:    #2E6E5A   /* forest — success / checked state */
--accent-3:    #B07A1F   /* mustard — tag highlights */
--highlight:   #F2E27A   /* yellow highlighter (rarely used) */
--tag-bg:      #EBE1BA   /* tag pill background */
--tag-ink:     #5A5534   /* tag pill text */
```

Alternate palettes (Ivory, Graph) exist in `prototype/theme.jsx` if the user wants seasonal/dark-mode variants — but ship Cream as the default.

### Typography

```
--display:  "Libre Caslon Text", Georgia, serif   /* headlines */
            700 weight, letter-spacing -0.005em
--body:     "JetBrains Mono", ui-monospace, monospace   /* all body text + meta */
            13px / 1.55 default
--mono:     same as body (the body IS mono)
```

Type scale:

| Use | Family | Size | Weight | Line height |
|---|---|---|---|---|
| Hero title (recipe detail) | display | 32px | 700 | 1.05 |
| Cooking step title | display | 36px | 700 | 1.02 |
| Profile name | display | 26px | 700 | 1.1 |
| Feed entry title | display | 22px | 700 | 1.1 |
| Section heading (h3) | display | 17–18px | 700 | 1.15 |
| Body / step description | body (mono) | 13–14px | 400 | 1.55 |
| Meta text | body (mono) | 11–12px | 400 | 1.45 |
| Small caps label | display | 11px | 700 | uppercase, letter-spacing 0.06em |
| Mono number / quantity | body (mono) | 11–12px | 400–500 | 1.4 |

Alternate type pairings in `theme.jsx`: `garamond` (EB Garamond + IBM Plex Mono), `grotesk` (Inter Tight + Mono). Bookish is the default.

### Spacing

- Screen edge padding: **20px** (16px on dense screens like the Margin recipe layout)
- Stack gap between sections: **18–24px**
- Card internal padding: **14–18px**
- Row padding (list rows): **10–14px vertical**
- Tap target minimum: **44px** (use generous vertical padding on rows)

### Radii

- Outlined buttons: **6–8px**
- Tags: **4px**
- Checkboxes: **2px**
- Profile / card borders: **0** (sharp corners — the design is rectilinear)

### Borders & Rules

- **Dashed `1px var(--rule)`** between content sections — this is the signature divider
- **Dotted `1px var(--rule)`** between items within a tightly-coupled list
- **Solid `1px var(--ink)`** for buttons, profile card, the active tab underline

### Shadows

Almost none. The design avoids depth/elevation. Only the device bezel itself has a shadow. Cards sit on the page with borders, not shadows.

---

## State Management Requirements (for the real app)

### Per-user state (auth scope)
- Auth user profile (name, handle, bio, avatar)
- Followed users
- Saved recipes
- "Made it" entries (recipe ID + optional photo + caption + timestamp)
- Ingredient checklist state per recipe (ephemeral — clear when leaving recipe, or persist if "currently cooking")
- Cooking session: active recipe + step index + timer state

### Global / shared state
- Recipes (CRUD by author)
- Comments on recipes
- Activity feed (derived: union of `new` from followed authors, plus their `madeit` and `saved` actions)

### Navigation state
- Per-tab navigation stack (iOS: handled by `NavigationStack`; React Native: by Stack.Navigator; web: by router history)

---

## Tech Stack (decided)

**Next.js 14+ (App Router) + Tailwind CSS**, web-first.

- **Styling:** Tailwind with the design tokens below wired into `tailwind.config.ts` as custom theme values — not arbitrary values scattered through JSX. Add `colors.ink`, `colors.cream`, `fontFamily.display`, `fontFamily.mono`, and a `borderColor.rule` entry.
- **Fonts:** `next/font/google` for Libre Caslon Text (700) and JetBrains Mono (400, 500, 600). Both are on Google Fonts.
- **Dashed rules:** Tailwind's `border-dashed` + the `rule` color. This is the signature divider — define a `.rule-y` utility or a small `<Rule />` component rather than repeating classes.
- **Data layer:** Start with the mock data in `prototype/ss-data.jsx` as typed TS fixtures in `lib/fixtures.ts`. Swap to **Supabase** (Postgres + auth + storage) when moving past static screens.
- **Auth:** NextAuth with Google + Apple providers, or Supabase Auth if using Supabase.
- **Routing:** File-based routes mirroring the paths in the Screens section (`/feed`, `/recipe/[id]`, `/me`, `/[handle]`, `/cook/[id]`, `/discover`).
- **PWA later:** the design suits an installable mobile web app; add a manifest once the screens are stable.

Don't ship photo uploads in v1. The design works without them, and adding them later forces you to confront the question of how to keep the typographic vibe intact when photos arrive (e.g., constrain photos to a fixed aspect, treat them as inset thumbnails next to the title, never make them dominate).

---

## Build Order (Suggested)

1. **Project scaffold + design tokens** — `create-next-app` with TypeScript + Tailwind, then wire colors, typography, and spacing into `tailwind.config.ts`
2. **Static screens with mock data** — port the six screens from `prototype/`
3. **Navigation** — tab bar + per-tab stack + back buttons
4. **Authentication** — sign up / sign in
5. **Recipe creation flow** — this isn't designed yet; the user will need to design it (or you do it from the existing language)
6. **Real data layer** — replace mock data with backend reads
7. **Following / saving / comments** — write actions
8. **Cooking mode timer + persistence** — make the timer survive backgrounding (on iOS, use `BGProcessingTask` or simple state restoration)
9. **"Made it" flow** — including optional photo upload (be careful here — see design direction note above)
10. **Discover algorithm** — start with simple trending-by-saves, evolve from there

---

## Files in This Bundle

| File | Purpose |
|---|---|
| `prototype/Special Spoon.html` | The runnable prototype. Open in a browser. |
| `prototype/theme.jsx` | All design tokens — palettes, type pairings, layout variants |
| `prototype/ss-primitives.jsx` | Shared atomic components: checkbox, tag, button, avatar, heading, icons, etc. |
| `prototype/ss-chrome.jsx` | iOS device frame, top bar, tab bar |
| `prototype/ss-data.jsx` | Mock data: people, recipes, feed activity, shelves. Use this as a content model reference. |
| `prototype/ss-feed.jsx` | Feed screen + three layout variants |
| `prototype/ss-recipe.jsx` | Recipe detail screen + three layout variants + shared blocks (ingredients, method, comments) |
| `prototype/ss-profile.jsx` | Profile / cookbook screen (handles both own + friend variants) |
| `prototype/ss-discover.jsx` | Discover screen |
| `prototype/ss-cooking.jsx` | Cooking mode screen |
| `prototype/ios-frame.jsx` | Status bar mock (not needed in the real app) |

---

## Open Design Questions

These haven't been resolved yet — flag them with the user before building:

1. **Recipe creation flow.** Not designed. How does someone add a recipe? Photo-of-recipe-card OCR? Paste-a-URL? Manual form?
2. **"Made it" photo handling.** Once users post photos of dishes they made, how do those appear in the feed without overwhelming the typographic design?
3. **Onboarding.** Not designed. First-time user signup → follow some cooks → see a feed.
4. **Notifications.** What does someone get notified about (new recipe from someone followed, comment on their recipe, etc.)?
5. **Search.** The Discover screen has a search input but no results state designed.
6. **Edit / delete recipe.** No design for the author's own recipe management.
7. **Privacy.** Are profiles public by default? Can recipes be private/draft?

---

## Notes for Claude Code

- This is an original concept — no existing brand assets, no design system to inherit beyond what's in this bundle
- The prototype uses React + Babel-in-browser purely for design iteration speed. **Do not ship it as-is.** Recreate cleanly as Next.js server/client components with Tailwind classes.
- The prototype's inline `style={{}}` objects and CSS custom properties are there so the design could be re-themed live. In production, collapse them into Tailwind theme tokens — don't port the CSS-variable indirection.
- The mock data in `ss-data.jsx` is reasonable as initial seed data for a development database.
- The user's design intent is restrained and confident — when in doubt, choose less ornament, more typography, more whitespace.
