# SkillBridge Dev — Project Build Story

The living, step-by-step record of how this project was built: features,
decisions, considerations, and alternatives — drawn from every prompt
interaction and work session. Use this as a reference for the build process:
consult it, copy from it, or resume from it.

Rules for this file:

- Append at the end of each meaningful session, in chronological order.
- Never rewrite history; amend and extend.
- Each entry should cover: what was built or changed, the prompt or
  interaction that triggered it, key decisions and reasoning, alternatives
  considered and rejected, constraints/trade-offs/risks and how they were
  handled, and anything worth copying for future work.

---

## 1. Project initialization

**Trigger:** Fresh `create-next-app` bootstrap (`create-next-app` scaffolder,
Next.js 16.3.0, React 19.2.8, Tailwind v4 via `@tailwindcss/postcss`,
TypeScript, ESLint flat config).

**What was built:** Empty Next.js App Router project named `skillbridge-dev`
with the default landing page (`app/page.tsx`), `next.config.ts`,
`tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`.

**Decisions:** None made yet — stock scaffold, kept as-is.

**Alternatives:** None considered at this stage.

**Notes for future work:**

- `next dev` re-writes the `nextjs-agent-rules` block in `AGENTS.md`; commit
  it with your work to keep the tree clean.

## 2. Prompt logging + build documentation system

**Trigger:** User request to add the `prompt_logging` config to `AGENTS.md`
and to create a rule maintaining a project build story file.

**What was built:**

- `AGENTS.md`: added the `prompt_logging` config (`enabled: false`, per the
  global rule — when disabled, skip all prompt-logging behaviour) and a
  `Project Build Documentation` section requiring `PROJECT_BUILD.md` to be
  maintained at the repository root.
- `PROJECT_BUILD.md`: this file — the project's living build story.

**Decisions and reasoning:**

- Prompt logging is disabled (`enabled: false`) because the global rule
  requires the config to exist and defaults to disabled; no request to enable
  it was made.
- The build story is a separate file from `.agent/prompts/` logs: logs record
  prompt history, the build story records project history and decisions.
- `PROJECT_BUILD.md` lives at the repo root so it is discoverable and
  versioned with the code.

**Alternatives considered:** Placing the build story inside `docs/` — rejected
because there is no `docs/` directory yet and the root keeps it visible next
to `AGENTS.md` and `README.md`.

**Notes for future work:** Every future session that changes the project
should append an entry here.

## 3. PRD, build plan, and progress tracker

**Trigger:** User request to document the PRD in `docs/` and create a
step-by-step build plan plus a tracking file.

**What was built:**

- `docs/PRD.md` — full product requirements document for SkillBridge
  (learners discover mentors for practical skills and send mentorship
  requests; real mentor accounts; in-app inbox; PostgreSQL).
- `docs/BUILD_PLAN.md` — 6-phase, 17-step build plan with objective, tasks,
  files, acceptance criteria, and decisions per step, plus the complete
  database design.
- `docs/PROGRESS.md` — status tracker with step table and session log.
- `AGENTS.md` — new "Project Docs System" section (maintain PRD, build plan,
  tracker; docs follow global database principles).
- `.agent/prompts/logs/2026-08-05.md` — prompt log (logging enabled).

**Decisions and reasoning:**

- Product scope (via user Q&A): MVP = mentor discovery + mentorship
  requests; mentors have real accounts; requests stored in-app; PostgreSQL.
- Stack defaults approved: Prisma ORM, Auth.js, roles chosen at sign-up,
  Zod validation.
- Database follows the global principles: UUID PKs on all application-owned
  tables, restrictive FKs (`ON DELETE RESTRICT`, no cascades), CHECK-based
  enums (forward-only friendly), forward-only migrations, cleanup through
  explicit Actions.
- Mentor slug = UUID (no fragile URL slugs).

**Alternatives considered:** Mentor-seeded (no auth) MVP — rejected: user
wants real mentor accounts. Email delivery of requests — rejected: in-app
inbox chosen. Auto-increment IDs / cascade FKs — rejected per global rules.

**Constraints:** docs must stay in sync with the actual build; tracker
updated every session.

**Notes for future work:** Phase 0 (design system + routing) is next;
`.agent/prompts/logs/` now records prompts daily since logging is enabled.

## 4. Stage 0: Foundations (shadcn)

**Trigger:** User approved the Stage 0 plan, then directed: "we need to use
shadcn for all components, no need to re-invent the wheel."

**What was built:**

- shadcn initialized: `--base base --preset nova` (preset names changed —
  `base-nova` is no longer valid; style presets are nova/vega/… and the
  primitive base is a separate flag). `components.json`, `lib/utils.ts`,
  CSS token system in `app/globals.css`, deps `@base-ui/react`,
  `lucide-react`, cva/clsx/tailwind-merge/tw-animate-css.
- Components added: button, badge, card, separator, sheet, skeleton.
- Brand: deep "landmark green" `--primary` (#00875A light / #00d294 dark,
  oklch tokens, AA contrast), Geist fonts wired
  (`--font-sans` was self-referential after init — fixed), system dark mode
  via one inline `matchMedia` script toggling `.dark`.
- Shell: `Nav` (logo, ghost links, `Sheet` mobile menu with sr-only title),
  `Footer` (Separator + links), root layout with title template `%s |
  SkillBridge` + viewport theme colors, `Card`-based 404.
- Landing: hero (Badge, headline, CTA buttons with `data-icon` arrow) +
  three "How it works" cards.
- Routing: `/mentors`, `/mentors/[id]`, `(auth)/signup|login`,
  `/dashboard`, `(mentor)/profile|inbox` — placeholders via one reusable
  `Placeholder` component; `(auth)`/`(mentor)` layouts for centering/heading.

**Decisions and reasoning:**

- All UI is shadcn — no custom styled divs; semantic tokens only.
- `[id]` URL segment (UUID), `PageProps<'/mentors/[id]'>` typed route props.
- Route-group layouts can't use `LayoutProps` (no single URL path — tsc
  error confirmed it), typed manually with `{ children }`.
- The user's dev server on :3000 was reused for smoke tests instead of
  killing it (my :3999 attempt was refused by Next's single-server guard).

**Alternatives considered:** radix base — rejected by user (base chosen).
Custom palette — replaced by shadcn tokens + indigo primary.

**Validation:** lint clean; `tsc --noEmit` clean; `next build` succeeded (10
routes); dev smoke test: 200 on all routes, 404 on unknown, "SkillBridge"
renders, zero stock create-next-app content, mobile menu trigger present.

**Notes for future work:** Next phase — 1.1 database setup (Postgres 17.2 is
running in EnvKit; create `skillbridge` DB, Prisma 7 with `@prisma/adapter-pg`).

## 5. Role model pivot: no fixed roles

**Trigger:** User decision — the app was planned with learners OR mentors as
separate sign-up roles; that is now open: "an authenticated user can play any
of the roles. A learner to someone can also be a mentor to another, so they
can just be discovered as it is."

**What was built:** Documentation- and copy-level update of the role model:

- `docs/PRD.md`: new role-model section (5.3), reworded user stories
  (US-01/02), FR-AUTH-2/3, FR-REQUEST-1, FR-PROFILE-1, data-model overview,
  open questions (role switching resolved).
- `docs/BUILD_PLAN.md`: `users` table loses the `role` column + CHECK;
  new design decision "No fixed role — one account, both roles" (mentor
  status derived from `mentor_profiles` existence); step 2.2 renamed
  "Guards" (`requireUser` + `requireMentorProfile`); sign-up has no role
  picker; 4.1/4.3/5.1 reworded for any user; phase table + index note.
- `docs/PROGRESS.md`: step names + decisions + session entry.
- `app/(auth)/signup/page.tsx`: placeholder copy — no "Choose your role".

**Decisions and reasoning:**

- No `role` column in the database: role is derived state, not stored
  state. A user with a `mentor_profiles` row is a mentor; every
  authenticated user can send requests. Guards check profile existence,
  never a role flag.
- Request status CHECK constraint stays (a real state machine); the role
  CHECK is gone with the column.

**Alternatives considered:** Keeping a role column with a "both" option —
rejected: derived state avoids sync bugs (a user with no profile could still
claim mentor) and the schema stays minimal.

**Validation:** eslint + `tsc --noEmit` clean (code change was placeholder
copy only). Docs reviewed for stale "learner"/"role at sign-up" references —
remaining "learner" phrasing is persona-perspective and intentional.

**Notes for future work:** Prisma schema (Stage 1.2) must NOT include a
`role` field; the seed script creates demo mentors by adding
`mentor_profiles` rows, not by setting a role.

## 6. Stage 1: Data layer

**Trigger:** User: "lets work on stage 1" (build mode after the plan was
approved earlier).

**What was built:**

- DB: `skillbridge` created on EnvKit Postgres 17.2; `.env` with
  `DATABASE_URL` (gitignored).
- Prisma 7.9.1 stack: `@prisma/client`, `@prisma/adapter-pg`, `pg`,
  `bcryptjs`; dev `tsx`, `dotenv`. `prisma.config.ts` (dotenv + seed wiring).
- `prisma/schema.prisma`: 5 models — `User` (no role!), `MentorProfile`,
  `Skill`, `MentorSkill`, `MentorshipRequest` — UUID PKs via
  `gen_random_uuid()`, every FK `onDelete: Restrict, onUpdate: NoAction`,
  snake_case via `@map`, CHECKs added to the migration.
- Migration `20260805112321_init`: created with `--create-only`, then CHECKs
  appended, then applied (forward-only, immutable).
- `lib/db.ts` PrismaClient singleton with PrismaPg adapter; generated client
  output to `lib/generated/prisma` (gitignored), `postinstall: prisma
  generate`; `serverExternalPackages: ["pg"]`.
- Seed: 12 skills + 4 demo mentors (bcrypt `password123`), idempotent
  (verified twice), mentor_skills replaced explicitly inside one transaction.

**Decisions and reasoning:**

- **`onUpdate: NoAction` declared in the schema**: Prisma generates
  `ON UPDATE CASCADE` by default on every FK — the global no-cascades rule
  forbids cascading updates, so every relation explicitly sets
  `onUpdate: NoAction` (schema-declared, so no migration drift).
- CHECK constraints (status, experience_years) live in the initial
  migration SQL — Prisma has no CHECK support, and this keeps enums out of
  PG enum types (forward-only friendly).
- Generated client is gitignored + regenerated on install (Prisma 7
  `prisma-client` generator outputs TS source; committing was optional).

**Alternatives considered:** Hand-editing `ON UPDATE CASCADE` → NO ACTION in
the migration SQL — rejected: schema-declared `onUpdate: NoAction` is
drift-proof and self-documenting.

**Validation:** `migrate status` clean; live schema inspected via
information_schema — 6 FKs all `DELETE RESTRICT`/`UPDATE NO ACTION`, both
CHECKs, UUID defaults, all indexes; raw-SQL demos: DELETE of a referenced
skill → 23503 (RESTRICT works), invalid status → 23514 (CHECK works), valid
insert accepted; seed ran twice with identical counts; lint + tsc + build
clean.

**Notes for future work:** Phase 2 (Auth.js) — sign-up must NOT collect a
role; mentor guards check `mentor_profiles` existence. Demo credentials:
`priya@example.com` etc. / `password123`.

**Amendment (same day, post-build):** `headline` removed from
`mentor_profiles` at the user's request. Schema + seed updated; column
dropped via a new forward-only migration `20260805123000_drop_mentor_profile_headline`
(`migrate dev` refused to run non-interactively on the data-loss warning, so
the drop SQL was hand-written and applied with `migrate deploy`). PRD/BUILD_PLAN
synchronized. Mentor profile now = bio + experience_years + skills.

## 7. Stage 2: Authentication (Better Auth)

**Trigger:** "lets plan stage 1" (actually Stage 2 planning) — auth research
concluded Better Auth 1.6.26 over Auth.js v5 beta; user chose Better Auth +
database sessions. Then "work" + "lets continue stage 2" (build mode), and a
user request to drop the now-unused `users.password_hash` column.

**What was built:**

- Migration `20260805130000_add_better_auth`: `users` +`email_verified`
  (bool, default false) +`image` (text), −`password_hash` (user request);
  new `accounts` (account_id, provider_id, password), `sessions` (token UQ,
  user_id, ip_address, user_agent, expires_at), `verifications`
  (identifier, value, expires_at) — all UUID PKs, every FK
  `onDelete: Restrict, onUpdate: NoAction` (8 FKs total), snake_case,
  indexes on token/account_id/user_id. Applied forward-only.
- `lib/auth.ts`: `prismaAdapter(prisma, { provider: "postgresql" })`,
  explicit `user/session/account/verification` model mapping,
  `advanced.database.generateId: "uuid"`, custom bcryptjs
  `hash`/`verify`, `nextCookies()` plugin; `app/api/auth/[...all]/route.ts`
  (GET/POST).
- `lib/auth/password.ts` (bcryptjs) — one hasher shared by runtime auth and
  the seed.
- Server actions `signUp`/`signIn`/`signOut` (Zod v4 `z.email()`; password
  policy 8+, letter, number, symbol; 422 duplicate email, 401 bad
  credentials) + `useActionState` forms on `/signup`/`/login` (shadcn
  `input`/`label` added).
- `proxy.ts` (Next 16 middleware replacement): optimistic cookie redirects
  for protected + auth routes; `lib/auth/dal.ts`:
  `getSession`/`requireUser`/`requireMentorProfile`; layout guards
  (dashboard, mentor group, inbox); session-aware nav (fixed stale
  `/auth/login` → `/login` links).
- Seed: per-user credential `account` (delete + recreate in transaction).

**Decisions and reasoning:**

- **Better Auth over Auth.js v5**: v5 is still beta and the Auth.js project
  has been absorbed into Better Auth; Better Auth is stable with first-class
  Prisma adapter + Next.js cookie handling.
- **Database sessions over stateless JWT**: revocable, inspectable
  (`sessions` table), works with restrictive-FK rules.
- **Passwords in `accounts`** (`provider_id = 'credential'`), never on
  `users` — Better Auth's native model; `users.password_hash` dropped per
  explicit user request ("drop db column we may not need again").
- **Custom bcrypt hash/verify**: one hasher for runtime + seed, no
  dependency on Better Auth's internal default.
- **Proxy = optimistic pre-check, DAL = enforcement**: Next 16 proxy can't
  await DB per request efficiently for every page; real authorization lives
  in `requireUser`/`requireMentorProfile` in layouts.

**Alternatives considered:** Auth.js v5 beta (rejected: beta, absorbed);
hand-rolled credentials + JWT (rejected: revocability); storing the hash on
`users` (rejected: Better Auth account model is canonical).

**Validation:** lint + tsc + build clean — note tsc fails on stale
`.next/dev/types` after route changes until `next build` regenerates them.
`migrate status` up-to-date; seed idempotent twice (4/4/12/9/4). Live curl
flows on a throwaway `next start -p 3100` (dev server on :3000 untouched;
`BETTER_AUTH_URL` overridden per host): proxy redirects (307 → `/login`,
signed-in `/login` → `/dashboard`), sign-up 200 + HttpOnly cookie + row in
`sessions`, duplicate email 422, wrong password 401, demo mentor bcrypt
sign-in 200, sign-out 200 + row deleted, get-session null after; CSRF guard
rejects mutating calls without `Origin` (400); RESTRICT FK proven live —
deleting a user with a live session → 23503. All test artifacts cleaned up.

**Notes for future work:** Demo creds `priya@example.com` / `password123`.
`BETTER_AUTH_SECRET` + `BETTER_AUTH_URL` in `.env`. The user's dev server
must be restarted to pick up the new env vars. Mutating curl tests need
`Content-Type: application/json` **and** an `Origin` header.

**Amendment (same day, post-build):** user asked to "document it" — the auth
implementation is now captured as a technical reference in `docs/AUTH.md`
(architecture diagram, per-file walkthrough with file:line references,
cookie mechanics, verified flow table, configuration, testing recipes).
BUILD_PLAN step 2.1 points to it.

## 8. Stage 3: Mentor discovery

**Trigger:** "move to the next stage of building" — Phase 3 (directory,
search & filter, profile page).

**What was built:**

- `app/mentors/page.tsx`: eager-loaded query (profile + user name + skills
  in one `include`; skill catalog fetched in parallel via `Promise.all`),
  URL-driven filters from `searchParams` (normalized `string |
  string[] | undefined` → trimmed string), responsive card grid, dashed
  empty state with "Clear filters".
- `components/mentor-card.tsx`: `MentorWithRelations` payload type via
  `Prisma.MentorProfileGetPayload<…>`; card = name, experience badge
  (singular/plural), 3-line clamped bio, skill badges, view-profile link.
- `components/mentor-filters.tsx`: **GET form** (no client JS) — search
  input `q` + shadcn `select` `skill` (base-ui popup; the hidden form input
  is driven by the `name` prop; "All skills" sentinel value `all`).
- Query semantics: skill filter = `skills: { some: { skill: { name: {
  equals, mode: "insensitive" } } } }` (by **name**, not UUID); search =
  `contains` (ILIKE) OR on `user.name` and `bio`.
- `app/mentors/[id]/page.tsx`: UUID-format regex pre-check → `notFound()`
  without touching the DB; profile card (name, years, About, skill badges),
  back link; unknown id → `notFound()`.
- `components/request-cta.tsx`: session-aware CTA — anonymous → "Sign in to
  request mentorship" (+ sign-up link); signed-in → **disabled** button +
  note (honest placeholder until Phase 4).
- shadcn `select` component added (base-ui variant).
- Fixed a stale `/auth/signup` link on the landing page (`app/page.tsx`).

**Decisions and reasoning:**

- **URL params over client state**: GET form + server rendering = filters
  survive reload/share as links, zero JS required, no debounce.
- **Skill by name**: human-readable URLs (`?skill=Data%20Analysis`), names
  are unique; case-insensitive to forgive capitalization.
- **Shared payload type** instead of duplicating query shapes.
- **UUID pre-check before Prisma**: malformed ids 404 cleanly instead of
  throwing a DB cast error.
- **CTA as disabled placeholder**: better an honest "coming soon" than a
  button that fails; Phase 4 replaces it.

**Alternatives considered:** client-side filter state (rejected: lost on
reload, more JS); radix/native select (base-ui select is the shadcn-native
path with built-in form integration).

**Validation:** lint + build + tsc clean. Live smoke on throwaway `next
start -p 3100` (user's dev server on :3000 untouched): all 4 mentors
render; `?skill=Data Analysis` → only Amara; `?q=priya` → only Priya;
combined no-match → empty state; malformed + random UUID → 404; Priya's
profile renders name/9 years/bio/skills; anon CTA shows login/signup links
(note: first test used `user_id` instead of profile `id` — the directory
links to `mentor_profiles.id`, which is not the user's id); authed CTA
(priya sign-in) shows the disabled button. Test server killed, sessions
cleaned, artifacts removed.

**Notes for future work:** Phase 4 wires the request form onto the profile
page (replacing the disabled button); the request CTA currently has no
`returnTo` behavior — decide whether login should redirect back to the
mentor profile.

## 9. Regression fix: stale-session redirect loop

**Trigger:** User reported `/dashboard` causing an infinite operation that
crashed the browser ("its the authentication process or the check of it").

**Root cause:** A two-layer disagreement. The proxy redirected auth routes
(`/login`, `/signup`) to `/dashboard` based on cookie **presence**, while
the DAL's `requireUser` (DB-validated) redirected `/dashboard` to `/login`
when the `sessions` row was missing. With a stale cookie (session row
expired, revoked, or deleted) the result was an infinite
`/dashboard` ↔ `/login` 307 storm. Trigger in this case: the user's own
session row had been removed during earlier test cleanup (`DELETE FROM
sessions`) while the cookie stayed in the browser.

**Fix:**

- `proxy.ts`: removed the auth-route redirect entirely — the proxy now only
  does the optimistic no-cookie → `/login` pre-check on protected routes.
- `app/(auth)/layout.tsx`: now calls `getSession()` and redirects valid
  sessions to `/dashboard` — the signed-in behavior is preserved but
  DB-validated (one deduped query via React `cache()`).

**Why this is correct:** a stale cookie can no longer bounce between
layers — `/login` always renders when there is no valid DB session, letting
the user sign in again (which replaces the cookie). The proxy keeps its
fast path for logged-out users; it never grants access by itself.

**Validation:** live reproduction on a throwaway `next start -p 3100`:
stale cookie → `/dashboard` → 307 `/login` → form renders 200 (chain
terminates with `--max-redirs 5`); stale cookie on `/login` → 200 form;
valid session → `/login` and `/signup` → 307 `/dashboard`; `/dashboard`
→ 200. lint + tsc + build clean. Note: `next start` serves the **last
build** — proxy/layout changes require `npm run build` before testing
(missed once during verification; rebuilt and retested).

**Notes for future work:** any cookie-based redirect on auth routes must
stay DB-validated; if an edge-side check is ever needed, sign the session
claim or use a short-TTL cached validation — do not trust cookie presence
alone for redirect decisions.

## 10. Stage 4: Requests

**Trigger:** Plan approved by user ("lets plan phase 4" → plan → "work").
Also fixes the earlier dead-end: "Become a mentor" bounced signed-in users
through `/signup` (which redirects to `/dashboard`) onto the under-
construction placeholder.

**What was built:**

- `lib/validation/request.ts` — zod v4 schema: `mentorProfileId` uuid,
  `message` (trim, 1–2000), `skillId` union of `uuid | "" | null` →
  `undefined` (see bug below).
- `lib/actions/requests.ts` — `createMentorshipRequest` server action:
  `requireUser()` (redirects `/login`), mentor profile lookup (missing →
  error state), self-request block (a mentor can't request their own
  profile), skill-membership check against `mentor_skills` (never client-
  trusted), then duplicate-pending check + insert in **one interactive
  `$transaction`**; returns `{ error, success }` for `useActionState`.
- `components/request-form.tsx` — client form (pattern: `signup-form.tsx`):
  hidden `mentorProfileId`, message `Textarea` (shadcn `textarea` added),
  optional skill `Select` ("No specific skill" sentinel), inline error,
  success branch with link to `/dashboard`.
- `components/request-cta.tsx` — now receives `mentorProfileId` + skills
  (with ids) and renders the form for signed-in users; anonymous branch
  unchanged.
- `app/mentors/[id]/page.tsx` — skills query extended with `skill.id`.
- `app/dashboard/page.tsx` — real page replacing `Placeholder`: own
  requests (eager-loaded mentor name + skill name), `StatusBadge`
  (pending → secondary, accepted → default, declined → destructive),
  `decided_at` line, empty state with "Find a mentor" CTA.
- `app/page.tsx` — "Become a mentor" is session-aware: `/profile` when
  signed in, `/signup` otherwise.

**Key decisions:**

- Form inline on the mentor profile page (BUILD_PLAN default over a
  dedicated `/request/[mentorId]` route).
- Duplicate-pending protection = check + insert in one transaction; the
  concurrent double-submit race is accepted for MVP (no partial unique
  index).
- Inline success state instead of a redirect — stay on the mentor page,
  easy to send another request.
- Writes flow through exactly one Action; no cascade behavior involved
  (plain insert).
- Session-aware landing CTA: the `(auth)` layout redirect is correct for
  signed-in users, so the CTA must not point them at `/signup`.

**Bug found during live verification:** zod `z.string().uuid().optional()`
rejects a *missing* form field — `formData.get()` returns `null`, and
`.optional()` only accepts `undefined`. Browser submits always include the
named select (empty string), so the bug was invisible until curl omitted
the field; result was a generic "Invalid input" error. Fixed with
`union([z.string().uuid({...}), z.literal(""), z.null()])` →
`undefined`. Lesson: zod `.optional()` ≠ null-safe; use `.nullish()` or an
explicit `null` union member when reading from `FormData`.

**Validation:** lint + tsc + production build clean. Live smoke on a
throwaway `next start -p 3100` — server actions are POSTable from curl by
replaying the form's hidden fields (`$ACTION_ID_*`, `$ACTION_REF_*`,
`$ACTION_<n>:<k>`, `$ACTION_KEY`; note `$ACTION_KEY` differs **per page**,
not per action — use the target page's rendered key). Verified: request
created (`pending` row, right requester/skill); same-skill duplicate
rejected; different skill and no-skill allowed (3 rows total);
self-request blocked; fabricated skill rejected; unknown mentor id
rejected; 2001-char message rejected; empty message rejected; dashboard
shows exactly own requests with badges (priya: 3, tunde: empty state);
anon profile CTA unchanged; landing hrefs correct for anon and signed-in.
Cleanup: 3 test rows + 3 test sessions deleted (by id, preserving the
user's older session), server killed, temp files removed.

**Notes for future work:** Phase 5 needs `decided_at` writes (accept/
decline sets it) — the dashboard display is already in place; the
`status` strings `pending|accepted|declined` are the contract (CHECK
constraint from the initial migration).

## 11. Multi-skill requests (fix UUID-in-select + join table)

**Trigger:** User reported the request-form skill picker showing the skill
UUID instead of its name, and asked to be able to select more than one
skill at a time.

**What was built:**

- **Root cause of the UUID display:** base-ui's `SelectValue` falls back
  to the raw `value` when it can't resolve the selected item's label from
  its text content. In the request form the select's item values were
  UUIDs, so the fallback displayed the UUID. In `mentor-filters` the same
  component worked only because values were skill *names*. Rather than
  fight the fallback, the select was replaced with native checkbox chips
  (`name="skillIds"`, `has-[:checked]:` styling) — no client JS, matches
  the project's progressive-enhancement pattern, and supports multi-select
  natively via `FormData.getAll`.
- **Schema:** migration `20260807150000_add_mentorship_request_skills` —
  join table `mentorship_request_skills` (UUID PK, RESTRICT/NO ACTION FKs
  to requests and skills, unique `(request_id, skill_id)`, index on
  `skill_id`), backfill from `mentorship_requests.skill_id` (no-op — no
  rows existed), then drop the single `skill_id` column and its FK.
  `schema.prisma`: new `MentorshipRequestSkill` model, `MentorshipRequest.skills`
  relation replaces `skill`/`skillId`.
- **Action** (`lib/actions/requests.ts`): reads `skillIds` via
  `FormData.getAll` (deduped with `Set`), validates every skill is offered
  by the mentor (batch `mentorSkill.findMany`), duplicate check per skill
  against pending requests — errors name the offending skill(s) — then
  request + `createMany` join rows in one interactive transaction.
- **Validation:** `skillIds: z.array(z.string().uuid())` (optional; empty
  allowed).
- **Dashboard:** eager-loads `skills → skill.name`, displays sorted,
  comma-joined names ("Graphic Design, UI/UX Design") or "No specific
  skill".

**Key decisions:** many-to-many via a join table is the correct relational
shape (a request may target N skills); RESTRICT FKs everywhere — deleting a
request requires deleting its join rows first (explicit cleanup, no
cascades); checkbox chips over a multi-select component (zero JS, works
with the existing server-action form); per-skill duplicate semantics (a
request is a duplicate only for skills already pending).

**Validation:** lint + tsc + production build clean. Live smoke on
throwaway `next start -p 3100`: form renders checkbox chips (names in
labels, UUIDs only in values); multi-skill create → 1 request + 2 join
rows; same-skill re-submit → "already have a pending request for UI/UX
Design"; no-skill request allowed; fabricated skill rejected;
`information_schema` confirms `skill_id` column gone; dashboard shows both
labels correctly (SQL-verified 2 rows). Cleanup: join rows deleted before
requests (RESTRICT), test session deleted by id, server killed, temp files
removed.

**Notes for future work:** base-ui `SelectValue` displays the raw value as
a fallback — never use non-displayable values in item `value` props.
Better-auth writes `sessions.created_at` with a clock that lags the DB
(`now()`), so time-windowed cleanup misses fresh rows — clean test
sessions by id. Phase 5.2 (inbox) should eager-load request skills the same
way the dashboard does.

## 12. Action-based queries + Stage 5.1: mentor profile management

**Trigger:** Two user requests: (1) "on the mentors page, the database
interaction should be in the action not on the page"; (2) "i clicked on
the become a mentor button, its not creating a mentor profile for me
neither allow me to enter my mentorship details" — `/profile` was still a
placeholder (Phase 5.1 had not been built).

**What was built:**

- **Action layer for reads** (`lib/actions/mentors.ts`, `import
  "server-only"`, no `"use server"` — these are queries called from server
  components, not client-invocable actions):
  - `getMentorDirectory({ q, skill })` — the directory query + skill
    catalog in one `Promise.all`, including the where-clause builder that
    used to live in the page.
  - `getMentorProfile(id)` — profile-page query (user name, skills with
    ids).
  - Pages (`app/mentors/page.tsx`, `app/mentors/[id]/page.tsx`) now only
    parse `searchParams`/`params`, call the action, and render. UUID
    pre-check + `notFound()` stay in the page (presentation concern).
- **Profile create/edit (Step 5.1):**
  - `lib/validation/profile.ts` — `bio` (10–2000), `experienceYears`
    (string `^\d+$` → number, 0–99), `skillIds` (uuid array, optional).
  - `lib/actions/profiles.ts` — `getProfileEditor(userId)` (existing
    profile + catalog in parallel); `upsertMentorProfile` server action:
    `requireUser()` → parse → every submitted skill must exist in the
    catalog → one interactive `$transaction` (create or update the
    profile, `deleteMany` old `mentor_skills`, `createMany` new rows).
  - `components/mentor-profile-form.tsx` — `useActionState` form: bio
    textarea, years number input, skill checkbox chips (pre-checked when
    editing, `has-[:checked]:` styling), success state with links to the
    live profile and directory.
  - `app/(mentor)/profile/page.tsx` — create vs edit headings/copy,
    `?setup=1` message kept.

**Key decisions:**

- Queries belong in the actions layer; pages are thin (user directive +
  project convention). `server-only` import prevents client-bundle misuse;
  no `"use server"` on reads — they're not client-invoked.
- Ownership is never client-supplied: the profile is always looked up and
  keyed by `session.user.id` from the session.
- Skill replace-and-insert in one transaction (explicit delete then
  insert — no cascades; forward-only safe).
- `experienceYears` is validated as a digit string then transformed —
  `z.coerce.number()` would map a missing/empty field to `0` and silently
  pass (same class of bug as the earlier `z.optional()` vs `null` lesson:
  be explicit about what FormData can produce).

**Validation:** lint + tsc + production build clean. Live smoke on
throwaway `next start -p 3100`: fresh sign-up → `/profile` renders the
create form; create (2 skills) → profile row + 2 `mentor_skills` +
success UI; new mentor listed on `/mentors` and under `?skill=Data
Analysis` (both action-backed); edit pre-fills bio/years/checked chips
(verified `checked=""` on exactly the 2 owned skills); edit (1 skill)
replaces the skills atomically (SQL-verified); short bio, empty years,
years=100 all rejected inline. Cleanup: `mentor_skills` → profile →
session → account → user (RESTRICT FK order), server killed, temp files
removed. Note: a 10-char "Too short." passed `min(10)` — test string was
exactly 10 chars, not a bug.

**Notes for future work:** Step 5.2 (inbox) should follow the same
pattern: `getInbox(profileId)` read action + `respondToRequest` write
action with ownership enforcement; the dashboard's `StatusBadge` already
handles `accepted`/`declined` display once `decided_at` is written.

## 13. Stage 5.2: Inbox & respond + navigation fix

**Trigger:** "there is no way for users to go to the profile to see all
of the requests they have pending" — two real gaps behind the words: the
header nav (desktop) only ever showed *Find Mentors* (the dashboard,
profile, and inbox links existed only in the mobile sheet), and `/inbox`
was still a placeholder, so mentors had no way to see — let alone answer —
the requests sent to them.

**What was built:**

- **`lib/actions/inbox.ts`** (`server-only` read): `getInbox(mentorProfileId)`
  — requester name, sorted skill names, message, status, decided/created
  timestamps; pending first, then decided (newest first, via a JS sort —
  Postgres can't express "pending first" with a plain column order).
- **`respondToRequest`** (`lib/actions/requests.ts`): zod
  `respondRequestSchema` (`requestId` uuid, `decision` accept|decline) →
  `requireUser()` → load request → **ownership check**
  (`mentorProfile.userId === session.user.id`) → `updateMany({ where: {
  id, status: "pending" } }, { status, decidedAt })`. A returned count of
  `0` means someone already decided → "This request has already been
  responded to." — optimistic update, race-safe against double-clicks and
  two tabs.
- **`components/inbox-request-actions.tsx`**: one client component per
  pending row; Accept/Decline submit buttons named `decision` (one form,
  two buttons), hidden `requestId`, `useActionState` inline error; success
  simply re-renders the RSC tree (action ended → status now `accepted`, the
  row's actions disappear).
- **`app/(mentor)/inbox/page.tsx`**: `requireMentorProfile` → `getInbox`;
  cards with StatusBadge; decided rows show "You accepted/declined this
  request on <date>"; empty state.
- **Navigation** (`components/layout/nav.tsx` + `isMentor()` in
  `lib/auth/dal.ts`): signed-in users get **My Requests** (dashboard),
  **Mentor Profile** (profile), and **Inbox** — the latter only when they
  actually have a mentor profile (matches the `requireMentorProfile`
  redirect to `/profile?setup=1`).
- **Dashboard hardening** (found while moving it to the actions layer):
  the old page ran `findMany({ where: { requesterId: session?.user.id } })`
  — with an anonymous visit `requesterId` was `undefined`, Prisma drops
  undefined filters, and the page rendered **every** request in the
  database. Now `requireUser()` + `getMyRequests(userId)`.

**Key decisions:**

- Read actions (`getInbox`, `getMyRequests`) are `server-only` queries, not
  `"use server"` actions — same split as the mentors module.
- Decide-race protection via conditional `updateMany` count rather than
  read-then-write in a transaction: one statement, no lock, no retry.
- `$ACTION_KEY` (CSRF nonce) is **session-scoped** — the same value serves
  every form on every re-render of a session's pages; reusable in curl
  replays until the session changes. Ownership still re-verified in the
  action, because the key is not what protects per-row authorization.
- SSR text spanning JSX expressions arrives in the HTML split by `<!-- -->`
  comment nodes — smoke assertions must strip comments before matching
  ("You accepted this request on …").
- SQL smoke inserts need every NOT NULL column (users/requests `updated_at`
  have no default) — and direct multi-statement inserts should be wrapped
  in one transaction after the first run left half-inserted rows.

**Validation:** lint + tsc + production build clean. Live smoke on
throwaway :3100 (fresh build): Amara's inbox listed 3 pending requests
(Babatunde's real one + 2 SQL-seeded smoke rows) with skills, message,
status; **accept** → `accepted` + `decided_at` set (SQL-verified), page
re-rendered "You accepted this request on Aug 7, 2026", action buttons
gone from that row; **decline** → `declined` + `decided_at`; **re-accept**
→ "This request has already been responded to."; **cross-mentor attack**
(Priya's session replaying Amara's captured form) → "Only the mentor this
request was sent to can respond." with zero mutation; non-mentor `/inbox`
still redirects to `/profile?setup=1`. Cleanup: smoke request_skills →
requests → users, server killed, temp files removed; Babatunde's request
left exactly as found (`pending`, no `decided_at`).

**Notes for future work:** Phase 6 remains (empty/error states, SEO &
meta, build & deploy). When a mentor accepts, consider a visible
"accepted" list somewhere on the mentor side (currently only the
requester's dashboard shows the outcome; the inbox keeps the row with its
badge — acceptable for now).

## 14. Stage 6.4: DB-driven notifications (user-requested addition)

**Trigger:** "in addition to the phase 6, also add a db driven
notification page, we can have the lets me see your propsed db table" —
the user asked to see the proposed table first. Proposals: one
`notifications` table (UUID PK, RESTRICT FK to users, type CHECK, frozen
title/body/link snapshot, nullable `read_at`), rows created inside the
transactions of the triggering actions, page + header bell. User approved
"Build it (page + bell)".

**What was built:**

- **Migration `20260807160000_add_notifications`** — as proposed, plus the
  `(user_id, read_at)` composite index and the `notifications_type_check`
  CHECK constraint, matching the existing hand-written migration style.
- **Writes co-located with their mutations** (no event system):
  - `createMentorshipRequest` — inside its existing interactive
    transaction, after the request + skill joins: one `notification.create`
    for the mentor (`request_received`, title "New mentorship request",
    body with requester name + sorted skill names (or "…mentor them."),
    link `/inbox`).
  - `respondToRequest` — the update + notification were first written as
    a `$transaction([...])` array, but array transactions run statements
    in parallel: a stale replay would create a notification even when the
    update matched 0 rows. Switched to an interactive transaction that
    creates the notification only when the `updateMany` count is 1.
- **`lib/actions/notifications.ts`** ("use server" — reads + writes in one
  module, following `profiles.ts` precedent): `getNotifications(userId)`
  (list + `unreadCount` via `Promise.all`; unread first via Prisma
  `orderBy: [{ readAt: { sort: "asc", nulls: "first" } }, { createdAt:
  "desc" }]` — plain ASC would sort Postgres NULLs last), unread count for
  the nav, `markNotificationRead` (hidden `notificationId` + `link`;
  `updateMany` scoped by `userId` + `readAt: null`; `redirect(link)` — the
  whole unread row is a submit button, so "click = read + navigate"), and
  `markAllNotificationsRead` (plain form action — no state needed).
- **`app/notifications/page.tsx`** — `requireUser` → list; unread rows are
  tinted submit buttons with a dot + "Mark all as read" (only when
  unread > 0); read rows are Links; per-type icons; empty state.
- **Nav** — desktop bell with badge (9+ cap) + aria-label with the count;
  mobile sheet "Notifications (n)" link.

**Key decisions:**

- Denormalized snapshot (frozen at creation, no joins, survives renames).
- The row *is* the navigation: `link` is validated (`startsWith("/")`,
  ≤ 255) and used as the action's redirect target.
- No events/listeners anywhere — notification rows are written by the
  actions that own the state change, in the same transaction (atomicity).
- Interactive (not array) transaction for respond+notify, so a stale
  replay cannot fabricate a notification for a decision that never
  happened.

**Validation:** lint + tsc + production build clean. Live smoke on
throwaway :3100: fresh sign-up → real request-form POST to Amara (1
skill) → Amara's bell badge "1" + aria-label "Notifications (1 unread)"
+ page shows the unread `request_received` row (title, body with skill
name, dot, "1 unread", Mark all as read); mark-all → "You're all caught
up", button and dots gone; Amara accepts via inbox replay → requester's
page shows unread `request_accepted` row ("Amara Johnson accepted your
mentorship request."); row-click replay → 303 `Location: /dashboard`,
`read_at` set (SQL-verified), row re-renders as a read Link. Cleanup:
notifications → request_skills → request → sessions → accounts → user
(RESTRICT order; sessions FK bit on the first attempt), Babatunde's
request left `pending` untouched, server killed.

**Notes for future work:**

- git-bash `curl -F 'link=/dashboard'` silently rewrites the value to
  `C:/Program Files/Git/dashboard` (MSYS path conversion of args starting
  with `/`) — our schema correctly rejected it, but future replays of
  any `-F` value that starts with `/` need `MSYS_NO_PATHCONV=1` (and
  Windows-style paths for `-b`/`-D`/`-o`; the cookie jar also got
  mangled, which looked like a session loss).
- Steps 6.1–6.3 remain (empty/error states, SEO & meta, build & deploy).
## 15. Phase 6 finale: favicon, empty/error states, SEO, deploy prep

**Trigger:** "work on phase 6 also change the favicon". All 20 build-plan
steps are now done.

**What was built:**

- **Brand favicon** — removed the default `app/favicon.ico`; added
  `app/icon.svg` (indigo gradient rounded square + handshake emoji,
  echoing the nav logo). Next 16 auto-serves it as the favicon
  (`<link rel="icon" href="/icon.svg?…" sizes="any" type="image/svg+xml">`).
- **6.1 Empty/error states** — audit: every list/form already had empty
  states and inline errors; `not-found.tsx` existed; invalid mentor ids
  404 via UUID-regex + `notFound()`. Added root `app/error.tsx` (client
  boundary, "Try again" reset button, same visual language as not-found).
- **6.2 SEO & meta** — layout exports `applicationName` + `openGraph`
  (shared `APP_DESCRIPTION` const); `/mentors/[id]` `generateMetadata`
  (name → `%s | SkillBridge` template, skills in description);
  `app/sitemap.ts` + `app/robots.ts` using
  `NEXT_PUBLIC_APP_URL ?? https://skillbridge-dev.vercel.app`.
- **6.3 Build & deploy** — README rewritten (stack, env table, scripts,
  migrations, Vercel walkthrough); `db:migrate` script; `.env.example`
  + `!.env.example` gitignore exception; `build` script now
  `prisma generate && prisma migrate deploy && next build`.

**Key decisions:**

- Metadata is additive and static where possible — only the dynamic
  mentor route got `generateMetadata`; everything else keeps static
  titles (unique per page, template-suffixed).
- Sitemap/robots fall back to the default Vercel origin so the files are
  valid even before `NEXT_PUBLIC_APP_URL` is set; the env var overrides
  it in production.
- The build script owns migration application, so local builds, Vercel
  builds, and `vercel.json`'s `buildCommand` all converge on one
  idempotent `prisma migrate deploy`.

**Validation:** lint clean; clean build from zero (`rm -rf lib/generated`
→ generate + migrate deploy + next build, all green); prod smoke on
throwaway :3100: favicon link + og meta on `/`, `robots.txt` and
`sitemap.xml` served, `/mentors/9b5834a7-…` 200 with
<title>Amara Johnson | SkillBridge</title> and mentor-specific
description, non-UUID id 404s. Smoke server killed; `Babatunde`'s
request and data untouched.

**Notes for future work:**

- My smoke test initially "failed" because I used Amara's **user** id
  (`6f0e61b7…`) for the mentor-profile URL — the 404 was the app
  correctly rejecting a non-profile id. Mentor profile ids live in
  `mentor_profiles` (`9b5834a7…`).
- Deploy remaining is user-side: push to GitHub, add Vercel env vars,
  provision hosted Postgres (Neon/Supabase) for `DATABASE_URL`.
