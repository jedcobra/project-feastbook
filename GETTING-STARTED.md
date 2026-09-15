# Getting started — GitHub + Claude Code

Target stack: **Next.js (App Router) + Tailwind CSS**, web-first.
Target repo: **`jedcobra/project-feastbook`** (currently empty — greenfield).

---

## 1. Clone your repo

```bash
git clone https://github.com/jedcobra/project-feastbook.git
cd project-feastbook
```

---

## 2. Drop in the handoff

Unzip this handoff bundle and move it into the repo so you have:

```
project-feastbook/
  design_handoff_special_spoon/
    README.md
    GETTING-STARTED.md
    prototype/
```

Commit it:

```bash
git add .
git commit -m "Add Special Spoon design handoff"
git push -u origin main
```

Now the design spec lives alongside the code, and Claude Code can read it. It also means I can read it back from GitHub on future turns if you want me to revise the design against what actually got built.

---

## 3. Install Claude Code (if you haven't)

```bash
npm install -g @anthropic-ai/claude-code
```

---

## 4. Start building

From inside the repo:

```bash
claude
```

Then paste this as your first message:

```
Read design_handoff_special_spoon/README.md in full, then look at the
files in design_handoff_special_spoon/prototype/ — especially
theme.jsx (design tokens), ss-data.jsx (content model), and the
six screen files.

Scaffold a Next.js 14 App Router project with TypeScript and Tailwind
in this repo. First task: wire the design tokens from the README into
tailwind.config.ts, set up Libre Caslon Text + JetBrains Mono via
next/font, and build the Feed screen (index layout) using the mock
data as typed fixtures. Mobile-first, centered column, max-width 560px.

Stop after the Feed screen so I can review before you continue.
```

That "stop after X so I can review" pattern is worth keeping — it's much easier to course-correct one screen at a time than to review six at once.

---

## 5. Suggested sequence after that

Once the Feed looks right, work through these one at a time:

1. Recipe detail (`/recipe/[id]`) — ingredient checklist + numbered method
2. Navigation — tab bar + routing between screens
3. Profile / cookbook (`/me` and `/[handle]`)
4. Discover (`/discover`)
5. Cooking mode (`/cook/[id]`) — including the working timer
6. Supabase + auth, replacing fixtures with real reads
7. Write actions — follow, save, comment

The README's "Build Order" section covers this in more detail, plus the open design questions you'll hit around step 5 (recipe creation isn't designed yet).

---

## Tips

- **Ask it to run the dev server** and check its own work: "run `npm run dev` and screenshot the feed at 400px wide."
- **Keep a CLAUDE.md** at the repo root with project conventions once patterns settle — Claude Code reads it automatically every session.
- **Commit often.** Ask it to commit after each screen so you can roll back cleanly.
- When something looks off, point at the prototype: "open design_handoff_special_spoon/prototype/Special Spoon.html and compare the feed row spacing to what you built."
