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
