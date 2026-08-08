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
| message | text | NOT NULL |
| status | varchar(20) | NOT NULL, default `'pending'`, CHECK in (`pending`,`accepted`,`declined`) |
| decided_at | timestamptz | NULL |
| created_at | timestamptz | NOT NULL, default now() |
| updated_at | timestamptz | NOT NULL, default now() |

Indexes: `mentor_profile_id` (inbox query), `requester_id` (requester
dashboard), `status`.

### Table: `mentorship_request_skills`

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK, default `gen_random_uuid()` |
| request_id | uuid | NOT NULL, FK → mentorship_requests(id) ON DELETE RESTRICT ON UPDATE NO ACTION |
| skill_id | uuid | NOT NULL, FK → skills(id) ON DELETE RESTRICT ON UPDATE NO ACTION |
| created_at | timestamptz | NOT NULL, default now() |

Indexes: unique on `(request_id, skill_id)`; index on `skill_id`.

> A request can target many skills via this join table (added in migration
> `20260807150000_add_mentorship_request_skills`, which also dropped the
> original single `skill_id` column after backfill).

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
    `/login`; static/API paths excluded via `config.matcher`. Auth routes
    are **not** proxied — signed-in redirects from `/login`/`/signup` live
    in the `(auth)` layout where the session is DB-validated (a cookie
    alone would loop `/dashboard` ↔ `/login` forever when its `sessions`
    row is gone).
  - `lib/auth/dal.ts`: `getSession()` (React cache), `requireUser()`
    (redirect `/login`), `requireMentorProfile()` (redirect
    `/profile?setup=1`).
  - Layout guards: `/dashboard` layout and `(mentor)` layout call
    `requireUser`; `/inbox` additionally `requireMentorProfile` — mentor
    status is derived from owning a `mentor_profiles` row, never a role flag;
    `(auth)` layout redirects valid sessions to `/dashboard`.
  - Ownership checks: profile editing and inbox actions verify
    `mentor_profile.user_id === user.id` (Phase 5).
  - Session-aware `components/layout/nav.tsx`: signed-in name + sign-out
    form vs Sign in / Get started links.
- **Files:** `proxy.ts`, `lib/auth/dal.ts`, `app/dashboard/layout.tsx`,
  `app/(mentor)/layout.tsx`, `app/(mentor)/inbox/page.tsx`,
  `app/(auth)/layout.tsx`, `components/layout/nav.tsx`.
- **Acceptance criteria:** unauthenticated `/dashboard` → `/login`
  (verified); signed-in `/login` → `/dashboard` (verified, DB-validated);
  a stale cookie terminates at the login form instead of looping (verified
  live after a regression — see below); a user without a mentor profile
  cannot open `/inbox` and is guided to `/profile?setup=1`; nobody can edit
  another user's profile; a mentor can still send requests as a learner
  (both roles, one account).
- **Decisions:** Server-side guards in layouts/server components — no
  client-only gating (security); proxy redirects are optimistic pre-checks,
  real enforcement lives in the DAL; **auth-route redirects must be
  DB-validated** (proxy cookie checks on `/login`/`/signup` caused an
  infinite `/dashboard` ↔ `/login` redirect loop for stale/revoked
  sessions — fixed by moving that redirect to the `(auth)` layout);
  "is a mentor" is derived from profile existence, never a role flag;
  mutating API endpoints enforce CSRF via the `Origin` header (Better
  Auth).

---

## Phase 3 — Mentor discovery

### Step 3.1 — Mentor directory

- **Objective:** Public `/mentors` listing all mentors with profiles.
- **Tasks:**
  - Server component query: mentors + user name + skills, eager-loaded via
    one `include` (no N+1); skill catalog fetched in parallel
    (`Promise.all`) for the filter options.
  - `MentorCard`: name, experience badge (singular/plural years), bio
    (3-line clamp), skill badges, "View profile" link button.
  - Grid layout (1/2/3 columns responsive); dashed empty state with a
    "Clear filters" action when filters are active.
- **Files:** `app/mentors/page.tsx`, `components/mentor-card.tsx`.
- **Acceptance criteria:** all seeded mentors listed; empty state when none
  (both verified live).
- **Decisions:** Server-rendered; pagination deferred (MVP scale); card
  props typed as `Prisma.MentorProfileGetPayload<…>` — one shared
  `MentorWithRelations` type, no hand-written data shapes.

### Step 3.2 — Search & filter

- **Objective:** Filter by skill; search by name/bio — all URL-driven.
- **Tasks:**
  - A **GET form** (`action="/mentors" method="get"`) with a search input
    (`q`) and a shadcn `select` (`skill`, base-ui popup select whose hidden
    form input carries the value via the `name` prop).
  - Queries: skill filter joins through `mentor_skills`
    (`skills: { some: { skill: { name: { equals, mode: "insensitive" } } } }`);
    search is `contains` (ILIKE) `OR` on user name and bio. Skill filtering
    matches the skill **name** (case-insensitive), not the UUID.
  - "Clear" link resets to `/mentors`; search params normalize
    `string | string[] | undefined` → trimmed string.
- **Files:** `app/mentors/page.tsx`, `components/mentor-filters.tsx`.
- **Acceptance criteria:** filtering by skill returns only matching mentors;
  search narrows results; state survives reload (URL-driven) — all verified
  live (`?skill=Data Analysis` → only Amara; `?q=priya` → only Priya;
  combined no-match → empty state).
- **Decisions:** URL query params over client state — zero client JS needed
  (progressive enhancement); debounce not needed for server rendering;
  select options come from the live skill catalog.

### Step 3.3 — Mentor profile page

- **Objective:** Public `/mentors/[id]` showing full profile + request CTA.
- **Tasks:**
  - UUID format pre-check before the Prisma query (malformed id → `notFound()`
    without touching the DB); `notFound()` for unknown ids.
  - Query profile by UUID with eager-loaded user name + skills; render name,
    experience (years), bio ("About"), skill badges, back link.
  - `RequestCta`: session-aware — anonymous users get "Sign in to request
    mentorship" (+ sign-up link); signed-in users get a disabled button with
    a note (wired in Phase 4).
- **Files:** `app/mentors/[id]/page.tsx`, `components/request-cta.tsx`.
- **Acceptance criteria:** profile renders (name, years, bio, skills —
  verified live); unknown/void id → 404 (verified: bad format and random
  UUID both 404).
- **Decisions:** UUID in URL; server-side 404 for unknown/void ids; the CTA
  is an honest placeholder (disabled button + note) until Phase 4 ships the
  request form — no dead-end "send" button that fails.

---

## Phase 4 — Requests

### Step 4.1 — Request form

- **Objective:** Any authenticated user can compose a mentorship request
  (mentors included — a mentor is also a learner to others), targeting one
  **or more** skills.
- **Tasks:**
  - Zod schema (`lib/validation/request.ts`): `message` (trimmed, 1–2000
    chars), `skillIds` (array of uuids, optional, deduped in the Action).
  - `RequestForm` (`components/request-form.tsx`, client, `useActionState`)
    on the mentor profile page inside the `RequestCta` card: message
    textarea (shadcn `textarea`), skill **checkbox chips** (`name="skillIds"`
    → `FormData.getAll`), pending state, single inline error; success
    replaces the form with a message + link to `/dashboard`.
  - `RequestCta` receives `mentorProfileId` + skills (with ids) from
    `app/mentors/[id]/page.tsx` (query includes `skill.id`); anonymous
    branch unchanged.
- **Files:** `components/request-form.tsx`, `components/request-cta.tsx`,
  `lib/validation/request.ts`, `components/ui/textarea.tsx`,
  `app/mentors/[id]/page.tsx`.
- **Acceptance criteria:** validation errors shown; mentor must be valid;
  self-requests blocked ("You can't request mentorship from yourself.");
  message > 2000 chars rejected; multiple skills selectable at once (labels
  show names, never ids).
- **Decisions:** Skill chips are native checkboxes (no client JS —
  progressive enhancement, consistent with the filters form) instead of a
  base-ui Select (whose `SelectValue` displays the raw value when it
  cannot resolve an item label — with UUID values that showed the id, not
  the name); skills validated server-side against `mentor_skills`, never
  client-trusted; message required; inline success state instead of a
  redirect.

### Step 4.2 — Persistence

- **Objective:** Requests stored in PostgreSQL; a request can target many
  skills.
- **Tasks:**
  - Join table `mentorship_request_skills` (migration
    `20260807150000_add_mentorship_request_skills`): UUID PK, RESTRICT/NO
    ACTION FKs to `mentorship_requests` and `skills`, unique
    `(request_id, skill_id)`, index on `skill_id`; `mentorship_requests.skill_id`
    dropped after backfill (forward-only; backfill was a no-op — no rows).
  - `createMentorshipRequest` Action (`lib/actions/requests.ts`):
    `requireUser()` → mentor profile lookup (missing → error state) →
    self-request block → skill-membership check (all submitted skills must
    be offered by this mentor) → duplicate-pending check (any submitted
    skill already in a pending request to this mentor) + insert request +
    `createMany` join rows inside one interactive `$transaction` →
    returns `{ error, success }` state.
  - Duplicate errors name the offending skill(s).
- **Files:** `lib/actions/requests.ts`,
  `prisma/migrations/20260807150000_add_mentorship_request_skills/migration.sql`.
- **Acceptance criteria:** row created with `pending`; join rows for each
  skill; per-skill duplicates rejected; writes go through one Action; empty
  skill list allowed (no join rows).
- **Decisions:** one request, many skills via a join table (no cascades —
  cleanup deletes join rows explicitly before the request); duplicate
  check + insert in one transaction; race between two concurrent identical
  inserts accepted for MVP (no partial unique index).

### Step 4.3 — Requester dashboard

- **Objective:** `/dashboard` lists the user's requests with status (any
  authenticated user, including mentors).
- **Tasks:**
  - `app/dashboard/page.tsx`: `findMany` by `requester_id`,
    `orderBy: createdAt desc`, eager-loading mentor name + skill name
    (no N+1); greeting (`getSession`); status badge (pending →
    `secondary`, accepted → `default`, declined → `destructive`);
    `decided_at` line for decided requests; empty state with "Find a
    mentor" CTA.
- **Files:** `app/dashboard/page.tsx`.
- **Acceptance criteria:** only own requests visible; status reflects
  mentor's decision; empty state for users with no requests.
- **Decisions:** Index on `requester_id` backs this query. Status is a
  string (`pending`/`accepted`/`declined`) rendered via a small
  `StatusBadge` mapping.

### Step 4.4 — Landing CTA fix

- **Objective:** "Become a mentor" on the landing page must not bounce
  signed-in users to `/signup` (which redirects to `/dashboard`).
- **Tasks:** `app/page.tsx` → `getSession()`; href is `/profile` when
  signed in, `/signup` otherwise.
- **Decision:** Session-aware CTA; nav "Get started" unchanged (signed-in
  users see Dashboard instead).

---

## Phase 5 — Mentor side

### Step 5.1 — Profile management

- **Objective:** Any user can create/edit their public mentor profile;
  creating one makes them discoverable as a mentor (no sign-up role
  required).
- **Tasks:**
  - `upsertMentorProfile` Action (`lib/actions/profiles.ts`):
    `requireUser()` → zod validation → catalog membership check for every
    submitted skill → one interactive `$transaction`:
    create-or-update the profile, `deleteMany` the old `mentor_skills`,
    `createMany` the new rows (explicit replace — no cascade).
  - `getProfileEditor(userId)` read action: profile (id, bio, years,
    skill ids) + full skill catalog in parallel — no DB access in the
    page.
  - `MentorProfileForm` (`components/mentor-profile-form.tsx`, client,
    `useActionState`): bio textarea, experience-years number input, skill
    checkbox chips (pre-checked when editing); success state links to the
    live profile (`/mentors/[id]`).
  - `app/(mentor)/profile/page.tsx`: `requireUser` →
    `getProfileEditor`; heading/description switch on create vs edit;
    `?setup=1` copy kept for the inbox guard.
- **Files:** `app/(mentor)/profile/page.tsx`,
  `components/mentor-profile-form.tsx`, `lib/actions/profiles.ts`,
  `lib/validation/profile.ts` (bio 10–2000 chars; years `^\d+$` → 0–99;
  skill ids uuids).
- **Acceptance criteria:** edits persist; only the owning user can save
  (profile is always keyed by `session.user.id` — never a client-supplied
  owner); skills list replaced atomically in a transaction; validation
  errors inline.
- **Decisions:** Replace-and-insert skill rows inside one transaction —
  forward-only safe, no cascades; `experienceYears` parsed from a
  `^\d+$` string (avoids `z.coerce.number()` treating missing/empty
  input as `0`).

### Step 5.2 — Inbox & respond

- **Objective:** Mentor sees requests and accepts/declines.
- **Tasks:**
  - `getInbox(mentorProfileId)` read action (`lib/actions/inbox.ts`,
    `server-only`): requests for the profile with requester name, sorted
    skill names, message, status, decided/created timestamps; pending
    first, then decided — newest first.
  - `respondToRequest` Action (`lib/actions/requests.ts`): parses
    `requestId` + `decision` (accept|decline), `requireUser()`, loads the
    request, verifies `request.mentorProfile.userId === session.user.id`
    (ownership), then `updateMany({ where: { id, status: "pending" } })`
    setting status + `decided_at` — a count of 0 means it was already
    responded to (race-safe).
  - `InboxRequestActions` (`components/inbox-request-actions.tsx`, client,
    one per pending row): Accept/Decline submit buttons named `decision`
    with hidden `requestId`; inline error text via `useActionState`.
  - `app/(mentor)/inbox/page.tsx`: `requireMentorProfile` → `getInbox`;
    request cards with StatusBadge; decided rows show "You accepted/
    declined this request on <date>" (no action buttons).
  - Nav: signed-in users get **My Requests** (`/dashboard`), **Mentor
    Profile** (`/profile`), and — only when they have a profile —
    **Inbox** (`/inbox`) in the header (desktop + mobile sheet), via
    `isMentor()` in `lib/auth/dal.ts`.
  - `/dashboard` moved to the actions layer (`lib/actions/dashboard.ts`
    `getMyRequests(userId)`) and hardened with `requireUser()` — the old
    `where: { requesterId: undefined }` silently dropped the filter and
    exposed every request to anonymous visitors.
- **Files:** `app/(mentor)/inbox/page.tsx`,
  `components/inbox-request-actions.tsx`, `lib/actions/inbox.ts`,
  `lib/actions/requests.ts` (+ `lib/validation/request.ts`
  `respondRequestSchema`), `components/layout/nav.tsx`, `lib/auth/dal.ts`,
  `lib/actions/dashboard.ts`, `app/dashboard/page.tsx`.
- **Acceptance criteria:** only that mentor's requests visible; decision
  saved once and reflected on the requester dashboard; non-owner mentors
  rejected server-side; re-responding blocked with a clear error.
- **Decisions:** Status transitions: `pending → accepted | declined` only;
  enforcement in Action (not just UI) with an optimistic
  `updateMany`-count guard against double-decide races; `$ACTION_KEY` is
  session-scoped (stable across re-renders); the accepted/decided note is
  split by React `<!-- -->` comment nodes in SSR HTML (comment-strip
  before text assertions in smoke tests).

---

## Phase 6 — Polish & ship

### Step 6.1 — Empty/error states

- **Objective:** No dead ends for users.
- **Tasks:** Empty states (no mentors, no requests, no skills), error
  boundaries, 404 page, form error handling review.
- **Files:** `app/error.tsx`, `app/not-found.tsx`, components.
- **Acceptance criteria:** every list/form has empty & error handling.
- **Status:** ✅ done.
- **Notes:** `/mentors` already had "No mentors found" (and invalid
  search filters render it too); dashboard / inbox / notifications /
  profile pages have per-page empty states; form errors are inline in
  the request + mentor-profile forms; `not-found.tsx` (Card + "Back
  home") existed. Added root `app/error.tsx` — a client boundary with a
  "Try again" button calling `reset()` (renders the same flex-centered
  Card as not-found). Invalid `/mentors/[id]` ids 404 via the UUID regex
  + `notFound()` guards; no segment-level boundary needed.

### Step 6.2 — SEO & meta

- **Objective:** Meaningful titles/descriptions.
- **Tasks:** `generateMetadata` per route; Open Graph basics; sitemap.
- **Files:** `app/**/layout.tsx`, `app/**/page.tsx`, `app/sitemap.ts`.
- **Acceptance criteria:** unique titles per page.
- **Status:** ✅ done.
- **Notes:** Root layout metadata extended with `applicationName` +
  `openGraph` (title, description, `type: "website"`, siteName); the
  description moved into a module-level const shared by the title
  default and openGraph. Every route already had a static title except
  `/mentors/[id]`, which now exports `generateMetadata` — mentor name
  flows through the `%s | SkillBridge` template and the description
  lists the mentor's skills (fallbacks: "Mentor Profile" for invalid/
  missing profiles, generic mentor line when no skills). Added
  `app/sitemap.ts` (`/`, `/mentors` weekly; `/login`, `/signup` yearly;
  priority 1/0.9/0.4) and `app/robots.ts` (allow all + sitemap URL) —
  both resolve `NEXT_PUBLIC_APP_URL` with a
  `https://skillbridge-dev.vercel.app` fallback.

### Step 6.3 — Build & deploy

- **Objective:** Production build passes; deployment ready.
- **Tasks:** `npm run build` + lint clean; production Postgres; deploy
  (Vercel or EnvKit prod serve); env vars documented.
- **Files:** `README.md` (deploy notes).
- **Acceptance criteria:** production build succeeds; app serves from
  production DB.
- **Status:** ✅ done (deploy env setup is user-side).
- **Notes:** README rewritten with the real stack, env-var table
  (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`,
  `NEXT_PUBLIC_APP_URL`), scripts, forward-only migration notes, and a
  Vercel section (env vars for Preview + Production, hosted Postgres
  required, `vercel.json` behavior). Added `db:migrate` script and
  `.env.example` (plus `!.env.example` in `.gitignore`, which otherwise
  swallows it via `.env*`). The `build` script is now
  `prisma generate && prisma migrate deploy && next build` — every build
  (local or Vercel) is self-contained. Verified from a clean state:
  lint clean, `rm -rf lib/generated` → build regenerates client, applies
  migrations, and produces a green production build with static
  `/icon.svg`, `/robots.txt`, `/sitemap.xml` routes.

### Step 6.4 — DB-driven notifications (added by user request)

- **Objective:** A notification page driven by the database, plus an
  unread-count bell — so requesters and mentors see outcomes and new
  requests without hunting through pages.
- **Tasks:**
  - Migration `20260807160000_add_notifications`: `notifications` table
    (UUID PK, `user_id` FK → `users` RESTRICT, `type` varchar(20) +
    CHECK `request_received | request_accepted | request_declined`,
    denormalized `title`/`body`/`link` snapshot, `read_at` nullable,
    index `(user_id, read_at)`).
  - Notifications are **created inside the same transaction** as the
    triggering mutation — no event system: `createMentorshipRequest`
    notifies the mentor (`request_received`, link `/inbox`); `respondToRequest`
    notifies the requester (`request_accepted`/`request_declined`, link
    `/dashboard`) — only after the conditional `updateMany` actually
    transitions the request (an interactive transaction, so a stale
    replay can't create a phantom notification).
  - `lib/actions/notifications.ts` ("use server"): `getNotifications(userId)`
    (list + unread count; unread first, then newest — `nulls: "first"`),
    `getUnreadNotificationCount(userId)` (nav), `markNotificationRead`
    (hidden `notificationId` + `link`, `requireUser`-scoped `updateMany`,
    then `redirect(link)` — a whole unread row is a submit button), and
    `markAllNotificationsRead` (plain form action).
  - `app/notifications/page.tsx`: `requireUser` → list; unread rows are
    tinted submit buttons with a dot, read rows are Links; type icons
    (inbox / check / x); "Mark all as read" only when unread > 0; empty
    state.
  - Header nav: bell with unread-count badge (desktop, next to the name)
    + "Notifications" link in the mobile sheet.
- **Files:** `prisma/migrations/20260807160000_add_notifications/`,
  `prisma/schema.prisma`, `lib/actions/notifications.ts`,
  `lib/actions/requests.ts` (notification writes), `app/notifications/page.tsx`,
  `components/layout/nav.tsx`.
- **Acceptance criteria:** every request/response produces exactly one
  notification for the right user; marking read is scoped to the session
  user; read/unread rendering correct; bell count matches unread rows.
- **Decisions:** denormalized snapshot text (frozen at creation, no
  joins); `link` is a validated relative path (starts with `/`) — the
  notification row is the navigation; unread-first ordering via Prisma
  `readAt: { sort: "asc", nulls: "first" }` (Postgres ASC would put NULLs
  last); `markNotificationRead` redirects to the notification target so
  "click row = read + go"; git-bash `curl -F 'link=/dashboard'` rewrites
  `/…` args into `C:/Program Files/Git/…` (MSYS path conversion) — use
  `MSYS_NO_PATHCONV=1` in smoke tests (the schema correctly rejected the
  mangled value).
