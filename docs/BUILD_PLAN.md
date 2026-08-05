# SkillBridge — Build Plan

Step-by-step documentation of how SkillBridge is built. Each step has an
objective, concrete tasks, files touched, acceptance criteria, and recorded
decisions. Status is tracked in `docs/PROGRESS.md`.

## Phases at a glance

| # | Phase | Steps |
|---|---|---|
| 0 | Foundations | 0.0 shadcn setup, 0.1 Design system & layout, 0.2 Routing structure |
| 1 | Data layer | 1.1 Database setup, 1.2 Schema & migrations, 1.3 Seed data |
| 2 | Authentication | 2.1 Auth.js setup, 2.2 Guards |
| 3 | Mentor discovery | 3.1 Directory, 3.2 Search & filter, 3.3 Mentor profile page |
| 4 | Requests | 4.1 Request form, 4.2 Persistence, 4.3 Requester dashboard |
| 5 | Mentor side | 5.1 Profile management, 5.2 Inbox & respond |
| 6 | Polish & ship | 6.1 Empty/error states, 6.2 SEO & meta, 6.3 Build & deploy |

---

## Database Design

PostgreSQL. Every application-owned table uses a **UUID primary key**
(`id`), related foreign keys use the matching UUID type. **No cascading
deletes or updates** — all foreign keys are restrictive (`RESTRICT`); related
data is only removed through explicit application code (Actions/Jobs).
Migrations are **forward-only** and immutable once executed.

### Entity relationship (logical)

```
users (id PK, email UQ, password_hash)
  │
  └─ 1:1 ── mentor_profiles (id PK, user_id FK UNIQUE → users)
                  │
                  └─ 1:N ── mentor_skills (id PK, mentor_profile_id FK → mentor_profiles,
                  │                          skill_id FK → skills, UQ(mentor_profile_id, skill_id))
                  │
                  └─ 1:N ── mentorship_requests (id PK, mentor_profile_id FK → mentor_profiles,
                                                  requester_id FK → users)
skills (id PK, name UQ)
```

### Table: `users`

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK, default `gen_random_uuid()` |
| email | varchar(255) | NOT NULL, UNIQUE |
| password_hash | varchar(255) | NOT NULL |
| name | varchar(100) | NOT NULL |
| created_at | timestamptz | NOT NULL, default now() |
| updated_at | timestamptz | NOT NULL, default now() |

Indexes: unique on `email`.

### Table: `mentor_profiles`

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK, default `gen_random_uuid()` |
| user_id | uuid | NOT NULL, UNIQUE, FK → users(id) ON DELETE RESTRICT |
| headline | varchar(120) | NOT NULL |
| bio | text | NOT NULL |
| experience_years | int | NOT NULL, CHECK (>= 0) |
| created_at | timestamptz | NOT NULL, default now() |
| updated_at | timestamptz | NOT NULL, default now() |

Indexes: unique on `user_id`.

### Table: `skills`

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK, default `gen_random_uuid()` |
| name | varchar(80) | NOT NULL, UNIQUE |
| created_at | timestamptz | NOT NULL, default now() |

Indexes: unique on `name`.

### Table: `mentor_skills`

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK, default `gen_random_uuid()` |
| mentor_profile_id | uuid | NOT NULL, FK → mentor_profiles(id) ON DELETE RESTRICT |
| skill_id | uuid | NOT NULL, FK → skills(id) ON DELETE RESTRICT |
| created_at | timestamptz | NOT NULL, default now() |

Indexes: unique on `(mentor_profile_id, skill_id)`; index on `skill_id`
(directory filtering by skill).

### Table: `mentorship_requests`

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK, default `gen_random_uuid()` |
| requester_id | uuid | NOT NULL, FK → users(id) ON DELETE RESTRICT |
| mentor_profile_id | uuid | NOT NULL, FK → mentor_profiles(id) ON DELETE RESTRICT |
| skill_id | uuid | NULL, FK → skills(id) ON DELETE RESTRICT |
| message | text | NOT NULL |
| status | varchar(20) | NOT NULL, default `'pending'`, CHECK in (`pending`,`accepted`,`declined`) |
| decided_at | timestamptz | NULL |
| created_at | timestamptz | NOT NULL, default now() |
| updated_at | timestamptz | NOT NULL, default now() |

Indexes: `mentor_profile_id` (inbox query), `requester_id` (requester
dashboard), `status`.

### Design decisions

- **No fixed role — one account, both roles.** `users` has no `role`
  column. Any authenticated user can send mentorship requests (learner
  behaviour); a user *is* a mentor when a `mentor_profiles` row exists
  (created through profile management). A learner to someone can be a mentor
  to another; guarding "mentor" routes means checking for a mentor profile,
  not a role flag.
- **UUID PKs everywhere** — per project/global database principles; no
  auto-increment integers.
- **Restrictive FKs, no cascades** — deleting a user, profile, or skill with
  dependants fails at the database level; removal flows go through explicit
  application Actions (e.g. `DeactivateUser` before account deletion, skill
  removal from a profile removes the `mentor_skills` row explicitly).
- **`gen_random_uuid()`** — PostgreSQL 13+ built-in; no extension beyond
  `pgcrypto` (built into `gen_random_uuid` since PG13).
- **Enum as CHECK constraint** (only where a real state machine exists:
  request `status`) — avoids Postgres enum migration pain; forward-only
  friendly (CHECK can be widened via new migration if needed).
- **Single canonical `mentorship_requests` table** — inbox and requester
  dashboard are both read from it (mentor side via `mentor_profile_id`,
  requester side via `requester_id`).
- **Skill catalog shared** — `skills` is a shared table; `mentor_skills`
  links mentors to it. Filtering by skill joins through the pivot, which the
  unique pair index backs.
- **No cascade, so no silent data loss** — any future deletion/cleanup of a
  mentor or user is a deliberate transaction in application code.

---

## Phase 0 — Foundations

### Step 0.0 — shadcn setup

- **Objective:** shadcn/ui initialized as the single UI source for the whole app.
- **Tasks:**
  - `npx shadcn@latest init --base base --preset nova` → `components.json`,
    `lib/utils.ts` (`cn()`), design tokens in `app/globals.css`
    (`@theme inline` CSS variables), `@base-ui/react` + `lucide-react` deps.
  - Add components: `button`, `badge`, `card`, `separator`, `sheet`,
    `skeleton` (`npx shadcn@latest add`).
  - Brand: `--primary` set to a deep landmark-style green (`#00875A`
    oklch(0.551 0.122 161.179), AA 4.55:1 on white; dark mode
    oklch(0.765 0.177 163.223)); Geist fonts wired (`--font-sans: var(--font-geist-sans)`); system dark mode via an
    inline `matchMedia` script toggling `.dark` (no FOUC, no extra deps).
- **Files:** `components.json`, `lib/utils.ts`, `app/globals.css`,
  `components/ui/*`.
- **Acceptance criteria:** `npx shadcn@latest info` lists installed
  components; app builds with the new tokens.
- **Decisions:** base (not radix) primitives; nova style; semantic tokens
  only (no raw color classes); icons as lucide objects with `data-icon` slots.

### Step 0.1 — Design system & layout shell

- **Objective:** Theme tokens (colors, typography via Geist), global layout
  with navigation (logo, links, auth state) and footer — built entirely from
  shadcn components.
- **Tasks:**
  - `app/globals.css` holds the shadcn token system (from step 0.0); no
    further custom palette.
  - `components/layout/nav.tsx`: logo link, `Button` ghost links, `Sheet`
    mobile menu (server component; Sheet is the client boundary).
  - `components/layout/footer.tsx`: `Separator` + links.
  - `app/layout.tsx`: metadata title template `%s | SkillBridge`, viewport
    theme colors, dark-mode script, `<Nav>`/`<Footer>` around `<main>`.
  - `app/page.tsx`: hero + "How it works" via `Card` composition, `Badge`
    accents, `Button` CTAs.
  - `app/not-found.tsx`: `Card`-based 404.
- **Files:** `app/globals.css`, `app/layout.tsx`, `app/page.tsx`,
  `app/not-found.tsx`, `components/layout/nav.tsx`,
  `components/layout/footer.tsx`.
- **Acceptance criteria:** Landing renders with nav/footer on all viewports;
  no stock create-next-app content remains.
- **Decisions:** All UI is shadcn (no custom styled divs); system dark mode
  via `.dark` class toggled by an inline script; brand = deep green
  `--primary` (#00875A, "landmark green").

### Step 0.2 — Routing structure

- **Objective:** App Router routes defined for the product surface.
- **Tasks:**
  - Public: `/` (landing), `/mentors` (directory), `/mentors/[slug]`
    (profile), `/auth/signup`, `/auth/login`.
  - Protected: `/dashboard` (my requests).
  - Protected (mentor): `/mentor/profile` (manage profile), `/mentor/inbox`.
  - Placeholder pages returning "under construction" until later steps.
- **Files:** `app/mentors/page.tsx`, `app/mentors/[id]/page.tsx`,
  `app/(auth)/signup/page.tsx`, `app/(auth)/login/page.tsx`,
  `app/dashboard/page.tsx`, `app/(mentor)/profile/page.tsx`,
  `app/(mentor)/inbox/page.tsx`, `app/(auth)/layout.tsx`,
  `app/(mentor)/layout.tsx`, `components/placeholder.tsx`.
- **Acceptance criteria:** All routes resolve (verified: 200 on each, 404 on
  unknown); placeholders render via the shared component.
- **Decisions:** Mentor id = UUID in the URL (`[id]`, no fragile slugs);
  `PageProps<'/mentors/[id]'>` typed route props (Next 16 convention);
  route-group layouts typed manually with `{ children }` (`LayoutProps`
  only supports real URL paths); placeholders reuse one `Placeholder`
  component (Card + Badge + Button) instead of copy-paste pages.

---

## Phase 1 — Data layer

### Step 1.1 — Database setup

- **Objective:** Local PostgreSQL running and reachable from the app.
- **Tasks:**
  - Start Postgres via EnvKit and create the `skillbridge` database.
  - Add `DATABASE_URL` to `.env` / `.env.local`.
- **Files:** `.env.local` (never committed).
- **Acceptance criteria:** `psql` connection works; app can connect.
- **Decisions:** Local dev DB only for MVP; no cascade/production topology yet.

### Step 1.2 — Schema & migrations

- **Objective:** Tables from the Database Design above, created through
  forward-only migrations.
- **Tasks:**
  - Install Prisma (`prisma` + `@prisma/client`); configure for PostgreSQL
    and UUIDs (`@db.Uuid` / `dbgenerated("gen_random_uuid()")`).
  - Define models: `User`, `MentorProfile`, `Skill`, `MentorSkill`,
    `MentorshipRequest` — matching the design exactly (UUID PKs, RESTRICT
    FKs, CHECKs, indexes).
  - Generate and run the initial migration (forward-only; never re-edit it).
  - Create `lib/prisma.ts` singleton client.
- **Files:** `prisma/schema.prisma`,
  `prisma/migrations/0000_init/migration.sql`, `lib/prisma.ts`.
- **Acceptance criteria:** `migrate dev` applies cleanly; tables/constraints
  match the design (verified via `psql \d`).
- **Decisions:** Prisma; UUID via `gen_random_uuid()`; CHECK constraints for
  enums; `RESTRICT` on all FKs — no cascades.

### Step 1.3 — Seed data

- **Objective:** A skill catalog and a few demo mentors.
- **Tasks:**
  - `prisma/seed.ts`: ~12 practical skills; 3–5 demo mentor users with
    profiles and mentor_skills (dev only).
  - NPM script `db:seed`.
- **Files:** `prisma/seed.ts`, `package.json`.
- **Acceptance criteria:** Seeding is idempotent (re-runnable); demo mentors
  visible after seed.
- **Decisions:** Seed only dev/test; no production seeding.

---

## Phase 2 — Authentication

### Step 2.1 — Auth.js setup

- **Objective:** Email + password sign-up/login with hashed passwords.
- **Tasks:**
  - Install Auth.js (NextAuth v5 / `next-auth`) + `bcryptjs`; credentials
    provider.
  - Prisma adapter wiring; session strategy; `auth()` helper + middleware
    for route protection.
  - Sign-up Action: validate (Zod), hash password, create `User` (no role —
    one account serves both learner and mentor behaviour), return session;
    login Action.
  - Forms on `/auth/signup` and `/auth/login` with error display; no role
    picker at sign-up.
- **Files:** `auth.ts`, `app/api/auth/[...nextauth]/route.ts` (if needed),
  `app/(auth)/signup/page.tsx`, `app/(auth)/login/page.tsx`,
  `lib/actions/auth.ts`, `lib/validation/auth.ts`.
- **Acceptance criteria:** sign-up → logged in; wrong password rejected;
  passwords never stored in plain text; sessions persist across refresh.
- **Decisions:** Auth.js v5; email+password only (no OAuth in MVP); password
  hashing with bcrypt; no role at sign-up — mentoring is opt-in via profile.

### Step 2.2 — Guards

- **Objective:** Route protection with no fixed roles.
- **Tasks:**
  - `requireUser()` helper; protected routes redirect unauthenticated users
    to `/auth/login`.
  - `requireMentorProfile()` helper: `/mentor/*` routes require the
    authenticated user to own a `mentor_profiles` row; a user without one is
    guided to create a profile (linking to the profile page).
  - Ownership checks: profile editing and inbox actions verify
    `mentor_profile.user_id === user.id`.
- **Files:** `lib/auth/guards.ts`, route layout/server components.
- **Acceptance criteria:** unauthenticated users are redirected; a user
  without a mentor profile cannot open `/mentor/*` and is guided to create
  one; nobody can edit another user's profile; a mentor can still send
  requests as a learner (both roles, one account).
- **Decisions:** Server-side guards in layouts/server components; no
  client-only gating (security); "is a mentor" is derived from profile
  existence, never a role flag.

---

## Phase 3 — Mentor discovery

### Step 3.1 — Mentor directory

- **Objective:** Public `/mentors` listing all mentors with profiles.
- **Tasks:**
  - Server component query: mentors + profile + skills (eager loading, no
    N+1).
  - Mentor cards: name, headline, experience, skills.
- **Files:** `app/mentors/page.tsx`, `components/mentor-card.tsx`.
- **Acceptance criteria:** all seeded mentors listed; empty state when none.
- **Decisions:** Server-rendered; pagination deferred (MVP scale).

### Step 3.2 — Search & filter

- **Objective:** Filter by skill; search by name/headline.
- **Tasks:**
  - URL-driven filters (`?skill=` query param); search input.
  - Queries use `mentor_skills` join + index; ILIKE for search.
- **Files:** `app/mentors/page.tsx`, `components/mentor-filters.tsx`.
- **Acceptance criteria:** filtering by skill returns only matching mentors;
  search narrows results; state survives reload (URL-driven).
- **Decisions:** URL query params over client state; debounce not needed for
  server rendering.

### Step 3.3 — Mentor profile page

- **Objective:** Public `/mentors/[id]` showing full profile + request CTA.
- **Tasks:**
  - Query profile by UUID; show headline, bio, experience, skills.
  - CTA button → request form (Phase 4) if logged in, else login prompt.
- **Files:** `app/mentors/[slug]/page.tsx` (rename to `[id]`),
  `components/request-cta.tsx`.
- **Acceptance criteria:** profile renders; unknown id → 404.
- **Decisions:** UUID in URL; server-side 404 for unknown/void ids.

---

## Phase 4 — Requests

### Step 4.1 — Request form

- **Objective:** Any authenticated user can compose a mentorship request
  (mentors included — a mentor is also a learner to others).
- **Tasks:**
  - Zod schema: message (required, ≤ 2000 chars), optional skill (must be
    one the mentor offers).
  - Form on mentor profile page (or `/request/[mentorId]`); inline errors.
- **Files:** `components/request-form.tsx`, `lib/validation/request.ts`.
- **Acceptance criteria:** validation errors shown; mentor must be valid.
- **Decisions:** Skill limited to the mentor's offered skills; message
  required.

### Step 4.2 — Persistence

- **Objective:** Requests stored in PostgreSQL.
- **Tasks:**
  - `CreateMentorshipRequest` Action: auth check, duplicate-pending check,
  - insert in a transaction, return result.
  - Prevent double-pending (same requester + mentor + skill).
- **Files:** `lib/actions/requests.ts`.
- **Acceptance criteria:** row created with `pending`; duplicates rejected;
  writes go through one Action.
- **Decisions:** Duplicate check + insert in one transaction; no cascade
  behaviour — only deliberate inserts.

### Step 4.3 — Requester dashboard

- **Objective:** `/dashboard` lists the user's requests with status (any
  authenticated user, including mentors).
- **Tasks:**
  - Query by `requester_id`; show mentor name, skill, message snippet,
    status badge; empty state.
- **Files:** `app/dashboard/page.tsx`.
- **Acceptance criteria:** only own requests visible; status reflects
  mentor's decision.
- **Decisions:** Index on `requester_id` backs this query.

---

## Phase 5 — Mentor side

### Step 5.1 — Profile management

- **Objective:** Any user can create/edit their public mentor profile;
  creating one makes them discoverable as a mentor (no sign-up role
  required).
- **Tasks:**
  - `UpsertMentorProfile` Action: transaction creating/updating profile and
    replacing `mentor_skills` (explicit delete of old rows, then insert —
    no cascade).
  - Profile form: headline, bio, experience years, multi-select skills
    (from catalog); ownership enforced.
- **Files:** `app/mentor/profile/page.tsx`, `components/mentor-profile-form.tsx`,
  `lib/actions/profiles.ts`.
- **Acceptance criteria:** edits persist; only the owning mentor can save;
  skills list replaced atomically in a transaction.
- **Decisions:** Replace-and-insert skill rows inside one transaction —
  forward-only safe, no cascades.

### Step 5.2 — Inbox & respond

- **Objective:** Mentor sees requests and accepts/declines.
- **Tasks:**
  - `/mentor/inbox`: list requests (by `mentor_profile_id`), newest first;
    requester name, message, skill, status.
  - `RespondToRequest` Action: only the owning mentor; sets status +
    `decided_at` in a transaction; re-responding is blocked.
- **Files:** `app/mentor/inbox/page.tsx`, `lib/actions/requests.ts`.
- **Acceptance criteria:** only that mentor's requests visible; decision
  saved once and reflected on the requester dashboard.
- **Decisions:** Status transitions: `pending → accepted | declined` only;
  enforcement in Action (not just UI).

---

## Phase 6 — Polish & ship

### Step 6.1 — Empty/error states

- **Objective:** No dead ends for users.
- **Tasks:** Empty states (no mentors, no requests, no skills), error
  boundaries, 404 page, form error handling review.
- **Files:** `app/error.tsx`, `app/not-found.tsx`, components.
- **Acceptance criteria:** every list/form has empty & error handling.

### Step 6.2 — SEO & meta

- **Objective:** Meaningful titles/descriptions.
- **Tasks:** `generateMetadata` per route; Open Graph basics; sitemap.
- **Files:** `app/**/layout.tsx`, `app/**/page.tsx`, `app/sitemap.ts`.
- **Acceptance criteria:** unique titles per page.

### Step 6.3 — Build & deploy

- **Objective:** Production build passes; deployment ready.
- **Tasks:** `npm run build` + lint clean; production Postgres; deploy
  (Vercel or EnvKit prod serve); env vars documented.
- **Files:** `README.md` (deploy notes).
- **Acceptance criteria:** production build succeeds; app serves from
  production DB.
