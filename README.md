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

The prototype implements **fourteen screens** across seven areas. The first six match the tab bar; the seventh is the add-recipe flow.

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

### 7. Add Recipe — **designed, 8 screens**

The center tab-bar button ("New"). Source: `prototype/ss-create.jsx` and `prototype/ss-create-2.jsx`. View all eight side by side via Tweaks → Showcase → "Add-recipe flow".

**Four entry methods. Link paste leads; the rest sit beneath a dashed `or` divider.**

#### 7a. Entry (`/new`)
- Top bar: "New recipe" + back, trailing `Drafts · N` outlined button
- **Primary block** (solid 1px indigo border, 16px padding): `IMPORT FROM A LINK` label, a link-icon + URL input on a dashed underline, a filled indigo **Fetch recipe** button, then small mono helper text: *"We pull the ingredients and method, then you confirm every field before it saves."*
- Dashed `or` divider (rule — "or" — rule)
- Three secondary rows, each with a 34px square bordered icon box, serif title, mono subtitle, chevron:
  - **Type it out** — "Blank page. Your words, your measurements."
  - **Photograph a card** — "Handwritten card or a page from a book."
  - **Fork a recipe** — "Start from someone else's and change it."

#### 7b. Import review — clean (`/new/import?src=link`)
Every import lands here before saving. Nothing auto-commits.
- Subtitle: "Everything parsed cleanly"
- Source chip (dashed border): link icon, `Link · smittenkitchen.com`, recipe name beneath
- Status banner bordered in `--accent-2` (forest) with a check icon: *"Ingredients and method came through cleanly. Read it over anyway — sites sometimes bury steps in prose."*
- Editable title + time fields
- `INGREDIENTS FOUND` — N lines, each an editable quantity + name pair on dotted rules
- `METHOD FOUND` — numbered `01`–`04`, serif step titles
- Footer: outlined **Discard** + filled **Looks right — continue**

#### 7c. Import review — uncertain (`/new/import?src=photo`)
Same screen, low-confidence state. **This is a deliberate design requirement, not an error case to hide.**
- Subtitle: "N fields to confirm"
- Source chip shows camera icon + filename
- Status banner bordered in `--accent` (vermilion) with a warn icon: *"The handwriting was hard to read in places. Fields marked **check** are our best guess — confirm or correct them before saving."*
- Unparsed/low-confidence fields get: a small `check` badge (vermilion 1px border, 9px mono), vermilion text, and a **solid vermilion underline** instead of the usual dashed rule
- A garbled step renders in vermilion with its own `check` badge (e.g. `Whisk in miso and s—[illegible]`)
- Editing a flagged field clears its flag
- Footer CTA reads **Open in editor** instead of "Looks right"
- The header has a dev toggle switching between clean/messy samples — remove in production

#### 7d. Composer — long page (`/new/edit`) — **default**
One scrolling page. This is what most users get.
- Top bar: "Write it out", subtitle `N% · draft saved`, trailing **Guide me** button (wand icon) which opts into the wizard
- 2px progress hairline, fills as title/first-ingredient/first-step are completed
- **Title** — serif 24px on a dashed underline
- **One-line description** — mono
- **Meta trio** in a 3-col grid: Time, Serves, and a Level segmented control (`E`/`M`/`H` boxes, filled indigo when active)
- **Intro — the story** — 4-row textarea, hint: *"Optional. This is what makes it yours rather than a spec sheet."*
- **Ingredients editor** — `+ section` link top-right. Each section: an uppercase mono section-name input, then rows of `drag handle · quantity (62px) · ingredient name` on dotted rules, then a `+ ingredient` row
- **Method editor** — numbered `01`, `02`…: serif title input, 2-row mono description textarea (placeholder: *"What to do, and what it should look like when it's right."*), and a timer-icon + `timer (min)` input. Then `+ step`
- **Your notes** — "Substitutions, warnings, the thing you always forget."
- **Tags** — selected tags as removable pills; suggestions as dashed `+ tag` chips
- Sticky footer: square outlined save-icon button + filled **Continue to publish**

#### 7e. Wizard — "guide me" (`/new/guided`) — opt-in only
Same fields, one question per screen. Reached only via the composer's **Guide me** button; never forced.
- Top bar: "Guide me", subtitle `Step N of 6`, trailing **Long page** escape hatch
- Segmented progress (6 thin bars)
- Large serif question + mono hint, then the field
- Six steps: title → one-liner → time/serves/level → ingredients (6-row textarea, "One per line. Quantity first.") → method (6-row textarea, "One step per line. We'll number them.") → intro (optional)
- Textarea steps use a bordered `--surface` box; single-line steps use a solid-underline input; the title step renders in 26px serif
- Footer: plain **Skip** text link + filled **Next** / **Review and publish**

#### 7f. Publish (`/new/publish`)
- Summary card (solid border): serif title + mono `25 min · serves 2 · Easy · 5 ingredients · 4 steps`
- **Who can see it** — radio rows, **no default selected**; label shows a vermilion `required` marker until chosen:
  - **Public** — "Anyone can find it. Appears in your followers' feeds."
  - **Followers** — "Only people who follow you."
  - **Just me** — "Saved to your cookbook. Nobody else sees it."
- **Add to shelves** — checkbox rows from the user's shelves with counts, plus `+ new shelf`
- **Tell my followers** — single checkbox row between dashed rules
- Footer CTA is **disabled at 50% opacity** reading *"Choose who can see it"* until visibility is picked; then becomes filled indigo *"Publish to my cookbook"*
- On publish, the prototype resets the nav stack to the user's cookbook

#### 7g. Drafts (`/new/drafts`)
- Top bar: "Drafts", subtitle `N unfinished`
- Rows: serif title (muted grey if `Untitled recipe`) + a source icon (pencil / link / camera) right-aligned, then a 2px progress bar with `N% · updated` beside it
- Mock drafts in `SS_DRAFTS` (`ss-create.jsx`) cover all three sources and a range of completion

#### 7h. Empty state — first recipe
Shown in place of the cookbook when the user has authored nothing.
- Bordered plate: `THE COOKBOOK OF` / **You** / "Nothing in it yet."
- **Four dashed rules at decreasing opacity** — a blank ruled page, the design's stand-in for emptiness
- Filled **Add your first recipe** button
- Below: `THREE WAYS TO START` — numbered `01`/`02`/`03` rows for paste-a-link, photograph-a-card, type-it-out, each with a one-line explanation

#### 7i. Edit an existing recipe
Reuses the composer. `SSComposerScreen` accepts a `seed` prop shaped exactly like a recipe object from `ss-data.jsx` and pre-fills every field from it. **The entry point from a recipe you own is not yet placed** — add an edit affordance to the recipe detail top bar when the viewer is the author.

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
5. **Add-recipe flow** — build in this order: composer (7d) → publish (7e) → entry screen (7a) → drafts (7g) → empty state (7h). Leave both import-review screens (7b/7c) until a parser exists; until then wire **Fetch recipe** and **Photograph a card** to open the composer directly.
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
| `prototype/ss-create.jsx` | Entry screen, long-page composer, wizard, `SSField` input primitive, `SS_DRAFTS` mock data |
| `prototype/ss-create-2.jsx` | Import review (both states), publish sheet, drafts list, empty state |
| `prototype/ios-frame.jsx` | Status bar mock (not needed in the real app) |

---

## Open Design Questions

These haven't been resolved yet — flag them with the user before building:

1. **Parsing backend.** The import-review screens are designed, but nothing decides *how* parsing happens. Link imports can use JSON-LD `Recipe` schema (most recipe sites publish it) with an HTML-scraping fallback. Photo imports need real OCR — the design's low-confidence state assumes the parser can report per-field confidence, so pick a service that returns it.
2. **Fork attribution.** Forking is offered on the entry screen but the attribution model isn't designed — does a forked recipe credit the original author on the detail page, link back, and notify them?
3. **"Made it" photo handling.** Once users post photos of dishes they made, how do those appear in the feed without overwhelming the typographic design?
4. **Onboarding.** Not designed. First-time user signup → follow some cooks → see a feed.
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
