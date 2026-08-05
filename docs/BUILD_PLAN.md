# SkillBridge — Build Plan

Step-by-step documentation of how SkillBridge is built. Each step has an
objective, concrete tasks, files touched, acceptance criteria, and recorded
decisions. Status is tracked in `docs/PROGRESS.md`.

## Phases at a glance

| # | Phase | Steps |
|---|---|---|
| 0 | Foundations | 0.0 shadcn setup, 0.1 Design system & layout, 0.2 Routing structure |
| 1 | Data layer | 1.1 Database setup, 1.2 Schema & migrations, 1.3 Seed data |
| 2 | Authentication | 2.1 Better Auth setup, 2.2 Guards |
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
users (id PK, email UQ, email_verified, image)
  │
  ├─ 1:N ── accounts (id PK, account_id → users.id, provider_id, password)
  ├─ 1:N ── sessions (id PK, token UQ, user_id FK → users, expires_at)
  ├─ 1:N ── verifications (id PK, identifier, value, expires_at)
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
| email_verified | boolean | NOT NULL, default `false` |
| image | text | NULL |
| name | varchar(100) | NOT NULL |
| created_at | timestamptz | NOT NULL, default now() |
| updated_at | timestamptz | NOT NULL, default now() |

Indexes: unique on `email`. Passwords are **not** stored on `users` — see
`accounts`.

### Table: `accounts`

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK, default `gen_random_uuid()` |
| account_id | varchar | NOT NULL — logical id (equals users.id for the credential provider) |
| provider_id | varchar | NOT NULL — `'credential'` for email+password |
| user_id | uuid | NOT NULL, FK → users(id) ON DELETE RESTRICT ON UPDATE NO ACTION |
| access_token | text | NULL (reserved for OAuth providers) |
| refresh_token | text | NULL (reserved for OAuth providers) |
| id_token | text | NULL (reserved for OAuth providers) |
| access_token_expires_at | timestamptz | NULL |
| refresh_token_expires_at | timestamptz | NULL |
| scope | text | NULL |
| password | text | NULL — bcrypt hash for the credential provider |
| created_at | timestamptz | NOT NULL, default now() |
| updated_at | timestamptz | NOT NULL, default now() |

Indexes: `user_id`.

### Table: `sessions`

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK, default `gen_random_uuid()` |
| token | text | NOT NULL, UNIQUE |
| user_id | uuid | NOT NULL, FK → users(id) ON DELETE RESTRICT ON UPDATE NO ACTION |
| ip_address | text | NULL |
| user_agent | text | NULL |
| expires_at | timestamptz | NOT NULL |
| created_at | timestamptz | NOT NULL, default now() |
| updated_at | timestamptz | NOT NULL, default now() |

Indexes: unique on `token`; `user_id` (active sessions per user).

### Table: `verifications`

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK, default `gen_random_uuid()` |
| identifier | text | NOT NULL |
| value | text | NOT NULL |
| expires_at | timestamptz | NOT NULL |
| created_at | timestamptz | NOT NULL, default now() |
| updated_at | timestamptz | NOT NULL, default now() |

Indexes: `identifier`.

### Table: `mentor_profiles`

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK, default `gen_random_uuid()` |
| user_id | uuid | NOT NULL, UNIQUE, FK → users(id) ON DELETE RESTRICT ON UPDATE NO ACTION |
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
| mentor_profile_id | uuid | NOT NULL, FK → mentor_profiles(id) ON DELETE RESTRICT ON UPDATE NO ACTION |
| skill_id | uuid | NOT NULL, FK → skills(id) ON DELETE RESTRICT ON UPDATE NO ACTION |
| created_at | timestamptz | NOT NULL, default now() |

Indexes: unique on `(mentor_profile_id, skill_id)`; index on `skill_id`
(directory filtering by skill).

### Table: `mentorship_requests`

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK, default `gen_random_uuid()` |
| requester_id | uuid | NOT NULL, FK → users(id) ON DELETE RESTRICT ON UPDATE NO ACTION |
| mentor_profile_id | uuid | NOT NULL, FK → mentor_profiles(id) ON DELETE RESTRICT ON UPDATE NO ACTION |
| skill_id | uuid | NULL, FK → skills(id) ON DELETE RESTRICT ON UPDATE NO ACTION |
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
- **Passwords live in `accounts`, not `users`** — the Better Auth credential
  provider stores the bcrypt hash in `accounts.password`
  (`provider_id = 'credential'`); `users` carries no password column.
- **Better Auth core tables mapped into the schema** — `user`, `session`,
  `account`, `verification` models map to the tables above (model names via
  the adapter options), UUIDs generated by Better Auth
  (`advanced.database.generateId: "uuid"`), and bcryptjs `hash`/`verify`
  wired as the custom password hasher so the seed shares one code path.
- **No cascade, so no silent data loss** — any future deletion/cleanup of a
  mentor or user is a deliberate transaction in application code (e.g.
  removing `sessions`/`accounts` rows before deleting a user — deleting a
  user with live sessions fails with 23503, verified live).

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
    (profile), `/signup`, `/login` (route group `(auth)`, no URL prefix).
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
  - Created the `skillbridge` database on the EnvKit Postgres 17.2 instance
    (127.0.0.1:5432, user `postgres`).
  - Added `DATABASE_URL=postgresql://postgres@127.0.0.1:5432/skillbridge` to
    `.env` (gitignored; loaded by Next and by Prisma CLI via
    `prisma.config.ts` + dotenv).
- **Files:** `.env` (never committed).
- **Acceptance criteria:** DB visible in EnvKit overview; Prisma connects.
- **Decisions:** Local dev DB only for MVP; no cascade/production topology yet.

### Step 1.2 — Schema & migrations

- **Objective:** Tables from the Database Design above, created through
  forward-only migrations.
- **Tasks:**
  - Installed Prisma 7.9.1 (`prisma` + `@prisma/client`) with the required
    driver adapter `@prisma/adapter-pg` + `pg`; dev deps `tsx`, `dotenv`.
  - `prisma.config.ts`: `defineConfig` with `datasource.url` from
    `env("DATABASE_URL")` and `migrations.seed` (`tsx prisma/seed.ts`).
  - `prisma/schema.prisma`: `prisma-client` generator, output
    `lib/generated/prisma`; 5 models matching the design exactly — UUID PKs
    via `dbgenerated("gen_random_uuid()")`, `@db.Uuid` FKs,
    `onDelete: Restrict` **and `onUpdate: NoAction`** on every relation,
    `@db.Timestamptz(6)` timestamps, `@map`/`@@map` snake_case columns.
    No `role` field (see role-model decision).
  - Migration created with `migrate dev --create-only --name init`, CHECK
    constraints appended to the SQL (`status IN (...)` on requests,
    `experience_years >= 0` on profiles), then applied. Migration is
    immutable going forward.
  - `lib/db.ts`: singleton `PrismaClient` with `PrismaPg` adapter
    (`globalThis` caching in dev).
  - `next.config.ts`: `serverExternalPackages: ["pg"]`; `.gitignore` excludes
    `lib/generated/`; `postinstall: prisma generate`.
- **Files:** `prisma.config.ts`, `prisma/schema.prisma`,
  `prisma/migrations/20260805112321_init/migration.sql`, `lib/db.ts`,
  `lib/generated/prisma` (gitignored), `next.config.ts`, `.gitignore`.
- **Acceptance criteria:** `migrate status` up-to-date; live schema verified
  via information_schema — UUID defaults, `ON DELETE RESTRICT ON UPDATE NO ACTION` + `ON UPDATE
  NO ACTION` on all 6 FKs, both CHECKs, all indexes present; raw-SQL tests:
  deleting a referenced skill fails (23503), invalid status fails (23514).
- **Decisions:** Prisma 7 (driver adapter mandatory, generated TS client);
  Prisma's default `ON UPDATE CASCADE` is overridden with
  `onUpdate: NoAction` in the schema to honor the no-cascades rule; enums as
  CHECKs in the initial migration (no PG enum types); generated client
  gitignored, regenerated on `postinstall`.

### Step 1.3 — Seed data

- **Objective:** A skill catalog and a few demo mentors.
- **Tasks:**
  - `prisma/seed.ts`: 12 practical skills; 4 demo mentor users (bcrypt-hashed
    `password123`, email `*.example.com`) with profiles, `mentor_skills`, and
    a Better Auth credential `account` per user.
  - Idempotent and transactional: upserts by email/name; `mentor_skills`
    replaced via explicit `deleteMany` + `createMany` inside one
    `$transaction` (no cascades); accounts deleted then recreated for the
    same user inside the transaction.
  - `npm run db:seed` → `prisma db seed` (wired via `prisma.config.ts`).
- **Files:** `prisma/seed.ts`, `package.json` (`db:seed`, `postinstall`).
- **Acceptance criteria:** Seeding is idempotent (ran twice — identical
  counts: 4 users, 4 profiles, 12 skills, 9 mentor_skills, 4 accounts); demo
  mentors queryable; demo login works (bcrypt verify, verified live).
- **Decisions:** Seed only dev/test; no production seeding; `bcryptjs` hash
  via the shared `lib/auth/password.ts` (same hasher as runtime auth);
  `tsx` runs the seed.

---

## Phase 2 — Authentication

### Step 2.1 — Better Auth setup

- **Objective:** Email + password sign-up/login with hashed passwords and
  revocable database sessions.
- **Tasks:**
  - Installed `better-auth` (1.6.26) + `zod` (v4) + `bcryptjs`; shadcn
    `input` + `label` components added.
  - `lib/auth.ts`: `prismaAdapter(prisma, { provider: "postgresql" })` with
    explicit `user`/`session`/`account`/`verification` model mapping and
    `advanced.database.generateId: "uuid"`; custom bcrypt
    `hash`/`verify` password functions; `nextCookies()` plugin.
  - `app/api/auth/[...all]/route.ts` (GET/POST) via `toNextJsHandler`.
  - Migration `20260805130000_add_better_auth`: `users` gains
    `email_verified` + `image` and loses `password_hash`; new `accounts`,
    `sessions`, `verifications` tables (UUID PKs, RESTRICT / NO ACTION FKs).
  - Server actions `signUp`/`signIn`/`signOut` (`lib/actions/auth.ts`):
    Zod v4 validation + password policy (8+, letter, number, symbol);
    duplicate-email (422) and wrong-credential (401) errors.
  - Forms on `/signup` and `/login` via `useActionState` with inline errors;
    no role picker at sign-up.
- **Files:** `lib/auth.ts`, `lib/auth/password.ts`, `lib/actions/auth.ts`,
  `app/api/auth/[...all]/route.ts`, `app/(auth)/signup/page.tsx`,
  `app/(auth)/login/page.tsx`, `components/auth/signup-form.tsx`,
  `components/auth/login-form.tsx`,
  `prisma/migrations/20260805130000_add_better_auth/migration.sql`,
  `prisma/seed.ts`.
- **Acceptance criteria:** sign-up → session cookie + `sessions` row;
  duplicate email rejected (422); wrong password rejected (401); session
  persists across refresh; seeded demo mentor signs in (bcrypt verify);
  sign-out deletes the session row (all verified live via curl).
- **Reference:** full technical walkthrough (code + file:line) in
  `docs/AUTH.md`.
- **Decisions:** Better Auth 1.6.26 over Auth.js v5 (still beta; the Auth.js
  project was absorbed into Better Auth) and over hand-rolled JWT sessions;
  **database sessions** (revocable, inspectable) rather than stateless JWT;
  passwords stored in `accounts` (`provider_id = 'credential'`), never on
  `users`; custom bcryptjs hasher shared with the seed; Zod v4
  (`z.email()`) in server actions.

### Step 2.2 — Guards

- **Objective:** Route protection with no fixed roles.
- **Tasks:**
  - `proxy.ts` (Next 16 middleware replacement): optimistic cookie pre-check
    — protected routes (`/dashboard`, `/inbox`, `/profile`) redirect to
    `/login`; auth routes (`/login`, `/signup`) redirect signed-in users to
    `/dashboard`; static/API paths excluded via `config.matcher`.
  - `lib/auth/dal.ts`: `getSession()` (React cache), `requireUser()`
    (redirect `/login`), `requireMentorProfile()` (redirect
    `/profile?setup=1`).
  - Layout guards: `/dashboard` layout and `(mentor)` layout call
    `requireUser`; `/inbox` additionally `requireMentorProfile` — mentor
    status is derived from owning a `mentor_profiles` row, never a role flag.
  - Ownership checks: profile editing and inbox actions verify
    `mentor_profile.user_id === user.id` (Phase 5).
  - Session-aware `components/layout/nav.tsx`: signed-in name + sign-out
    form vs Sign in / Get started links.
- **Files:** `proxy.ts`, `lib/auth/dal.ts`, `app/dashboard/layout.tsx`,
  `app/(mentor)/layout.tsx`, `app/(mentor)/inbox/page.tsx`,
  `components/layout/nav.tsx`.
- **Acceptance criteria:** unauthenticated `/dashboard` → `/login`
  (verified); signed-in `/login` → `/dashboard` (verified); a user without a
  mentor profile cannot open `/inbox` and is guided to
  `/profile?setup=1`; nobody can edit another user's profile; a mentor can
  still send requests as a learner (both roles, one account).
- **Decisions:** Server-side guards in layouts/server components — no
  client-only gating (security); proxy redirects are optimistic pre-checks,
  real enforcement lives in the DAL; "is a mentor" is derived from profile
  existence, never a role flag; mutating API endpoints enforce CSRF via the
  `Origin` header (Better Auth).

---

## Phase 3 — Mentor discovery

### Step 3.1 — Mentor directory

- **Objective:** Public `/mentors` listing all mentors with profiles.
- **Tasks:**
  - Server component query: mentors + profile + skills (eager loading, no
    N+1).
  - Mentor cards: name, bio, experience, skills.
- **Files:** `app/mentors/page.tsx`, `components/mentor-card.tsx`.
- **Acceptance criteria:** all seeded mentors listed; empty state when none.
- **Decisions:** Server-rendered; pagination deferred (MVP scale).

### Step 3.2 — Search & filter

- **Objective:** Filter by skill; search by name/bio.
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
  - Query profile by UUID; show bio, experience, skills.
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
  - Profile form: bio, experience years, multi-select skills
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
