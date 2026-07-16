# What to Wear

A personal styling workspace — not a shopping platform. What to Wear helps you
rediscover and maximize the clothes you already own: organize your digital
closet, then compose outfits on an interactive canvas.

Built with **Next.js (App Router) · TypeScript · Tailwind CSS · Supabase ·
Vercel**.

---

## Features (MVP)

- **Digital closet** — upload garments; organize by category, color, season,
  and occasion; grid layout with search and filters.
- **Outfit builder** — a free-form drag / resize / layer / remove canvas for
  combining pieces into looks, saved with a name and occasion.
- **Home dashboard** — personalized greeting, quick actions, and recent looks.
- **Saved outfits** — browse and edit looks, organized by occasion.
- **Recreate This Look** — save outfit inspiration from anywhere, then rebuild
  the look with pieces you already own; the recreation saves back into your
  wardrobe.
- **Scan My Closet** — capture several pieces at once, review/confirm details,
  and bulk-add them to your closet (architected so AI auto-tagging can slot in).
- **Event Planning** — plan an occasion with dates + location, pin a moodboard
  from your inspiration library, and assign a saved look to each itinerary day.
- **Auth** — Google, Apple, or passwordless email via Supabase Auth.

---

## Getting started

### 1. Install

```bash
npm install
```

### 2. Create a Supabase project

At [supabase.com](https://supabase.com), create a project. Then in the
**SQL Editor**, paste and run [`supabase/schema.sql`](supabase/schema.sql).
It creates the tables, row-level-security policies, triggers, and the private
`closet` and `inspiration` storage buckets.

> Already ran an earlier `schema.sql`? Apply the migrations in
> [`supabase/migrations/`](supabase/migrations/) in order —
> `0001_recreate_this_look.sql` (inspiration library + `inspiration` bucket)
> and `0002_event_planning.sql` (events, itinerary, moodboard). Each is
> additive and safe to re-run.

### 3. Configure auth providers

In **Authentication → Providers**:

- **Email** — enabled by default (this app uses magic links).
- **Google** — add your OAuth client ID/secret.
- **Apple** — add your Apple service credentials.

In **Authentication → URL Configuration**, add the redirect URL:

```
http://localhost:3000/auth/callback
https://your-app.vercel.app/auth/callback   # once deployed
```

### 4. Environment variables

Copy the example and fill in values from **Project Settings → API**:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploying to Vercel

1. Push this repo to GitHub and import it in Vercel.
2. Add the same environment variables in the Vercel project settings, setting
   `NEXT_PUBLIC_SITE_URL` to your production URL.
3. Add the production `/auth/callback` URL to Supabase's redirect allow-list.

---

## Architecture

The codebase is layered so features can be added without reshaping it.

```
src/
├─ app/                     # Next.js App Router
│  ├─ login/                # auth screen (Google / Apple / email)
│  ├─ auth/callback/        # OAuth + magic-link code exchange
│  └─ (app)/                # authenticated area (header + bottom nav)
│     ├─ dashboard/         # home
│     ├─ closet/            # grid + upload
│     ├─ build/             # the outfit-builder canvas
│     ├─ inspiration/       # inspiration library + upload
│     ├─ recreate/          # Recreate This Look workspace
│     └─ outfits/           # saved looks by occasion
├─ components/
│  ├─ ui/                   # design-system primitives (Button, Card, …)
│  ├─ layout/               # AppHeader, BottomNav
│  ├─ closet/               # ClosetGrid, ClothingCard, filters, upload form
│  ├─ inspiration/          # InspirationCard, InspirationUploadForm
│  ├─ outfits/              # OutfitStudio, OutfitCanvas, CanvasItem, cards
│  └─ dashboard/            # WelcomeHero, QuickActions, RecreateBanner
├─ hooks/                   # useUser, useCloset, useOutfits, useInspiration
├─ services/                # data-access layer (closet, outfits, inspiration, storage)
├─ lib/
│  ├─ supabase/             # browser / server / middleware clients
│  ├─ constants.ts          # taxonomy: categories, seasons, occasions, colors
│  └─ utils.ts
└─ types/                   # domain + Database types
```

**Key idea — the `services/` layer.** Every function takes a typed Supabase
client, so the exact same code runs in Server Components (SSR) and in client
hooks. UI never talks to Supabase directly; it goes through services. This
keeps data logic in one place and testable.

**Geometry as fractions.** Canvas placements store `x`/`y` as `0..1` fractions
of the canvas plus a `scale`, so a saved look renders correctly at any screen
size and can be re-opened for editing.

**Taxonomy is data, not enums.** Categories, seasons, occasions, and colors
live in `lib/constants.ts` and are stored as `text` with check constraints —
adding a new occasion is a one-line change, no migration.

**Recreate This Look reuses the outfit engine.** Rather than a parallel
"recreated outfits" table, a recreation is just an `outfit` with an
`inspiration_id` (and `notes`). It flows through the same `saveOutfit` service,
`outfit_items` geometry, `OutfitStudio` component, and Saved Collections — so
the feature added one table (`inspiration_images`), two columns, and a storage
bucket, and nothing about the existing wardrobe had to change. The builder
(`/build`) and the recreate workspace (`/recreate`) render the *same*
`OutfitStudio`; the only difference is whether an inspiration reference is
passed in.

**Scan is a pluggable pipeline.** `services/vision.ts` exposes
`analyzeGarments(files)` which today returns empty guesses, so Scan is a fast
manual review that bulk-inserts via `createManyClothing`. Swapping the stub for
a real detection call (an API route running a model) is the only change needed
to make it auto-tag — the review UI already consumes the guess shape.

**Event Planning reuses inspiration + outfits.** An event's moodboard is a join
(`event_moodboard`) onto the existing inspiration library rather than new
uploads, and each itinerary day links to a saved `outfit` via `outfit_id`. The
social "Shared Styling Space" (invites, voting, comments) is intentionally a
later phase: it needs a members/votes/comments model and multiple real users,
so it isn't shipped here — the personal planner is complete and testable on its
own, and the social layer slots on top without touching these tables.

---

## Design direction

Editorial, minimal, premium, mobile-first — the clothing is always the hero.
Near-monochrome palette on warm paper (`#F7F6F3`), a serif display face
(Playfair Display) paired with Inter, generous whitespace, and restrained motion.
The one bold move is the outfit-builder canvas. Tokens live in
`tailwind.config.ts`.

---

## Designed for what's next

The structure anticipates the roadmap without over-building:

- **AI for Recreate This Look** — the manual flow is built to accept an AI
  step that analyzes an `inspiration_images` row and suggests closet matches;
  it would feed `OutfitStudio` as pre-filled placements. No schema change needed.
- **Weather-based suggestions** — the `season` field and a weather service can
  feed the dashboard's quick actions.
- **Packing lists / calendar** — outfits already carry an `occasion`; add an
  `events` table that references `outfits`.
- **Social / community** — RLS is per-owner today; sharing becomes a new
  policy + a `shares` table, no rewrite of existing tables.
- **Generated types** — swap the hand-written `Database` type for
  `supabase gen types typescript` output when you adopt the CLI.

---

## Scripts

| Command             | Description                    |
| ------------------- | ------------------------------ |
| `npm run dev`       | Start the dev server           |
| `npm run build`     | Production build               |
| `npm run start`     | Serve the production build     |
| `npm run lint`      | ESLint                         |
| `npm run typecheck` | TypeScript, no emit            |
