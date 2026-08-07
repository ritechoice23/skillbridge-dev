# SkillBridge — Progress Tracker

Tracks where we are in the build plan (`docs/BUILD_PLAN.md`). Update after
every meaningful session: flip step statuses, move the current-phase marker,
append a session log entry.

**Status legend:** ⬜ pending · 🔵 in progress · ✅ done

**Overall progress:** 17 / 20 build steps done (docs system complete).

**Current phase:** 6 — Polish & ship

---

## Step status

| Phase | Step | Status |
|---|---|---|
| 0 Foundations | 0.0 shadcn setup | ✅ |
| | 0.1 Design system & layout shell | ✅ |
| | 0.2 Routing structure | ✅ |
| 1 Data layer | 1.1 Database setup | ✅ |
| | 1.2 Schema & migrations | ✅ |
| | 1.3 Seed data | ✅ |
| 2 Authentication | 2.1 Better Auth setup | ✅ |
| | 2.2 Guards | ✅ |
| 3 Mentor discovery | 3.1 Mentor directory | ✅ |
| | 3.2 Search & filter | ✅ |
| | 3.3 Mentor profile page | ✅ |
| 4 Requests | 4.1 Request form | ✅ |
| | 4.2 Persistence | ✅ |
| | 4.3 Requester dashboard | ✅ |
| 5 Mentor side | 5.1 Profile management | ✅ |
| | 5.2 Inbox & respond | ✅ |
| 6 Polish & ship | 6.1 Empty/error states | ⬜ |
| | 6.2 SEO & meta | ⬜ |
| | 6.3 Build & deploy | ⬜ |
| | 6.4 Notifications (added) | ✅ |

---

## Session log

### 2026-08-05 — Planning & documentation system

- **Done:** Product defined (learner → mentor discovery + mentorship
  requests; real mentor accounts; in-app inbox; PostgreSQL). PRD written
  (`docs/PRD.md`). Build plan with full database design written
  (`docs/BUILD_PLAN.md`). Tracker created (this file). AGENTS.md extended
  with the Project Docs System rule. Prompt logging enabled in `.agent/`.
- **Decisions:** Prisma ORM, Auth.js, no fixed roles (one account, both
  roles — mentor status derived from having a public profile),
  CHECK-constraint enums, UUID PKs, RESTRICT FKs (no cascades), forward-only
  migrations.
- **Next:** Step 0.1 — design system & layout shell.

### 2026-08-05 — Stage 0: Foundations (shadcn)

- **Done:** shadcn initialized (`base` + `nova` style, `@base-ui/react`,
  lucide icons) with components button, badge, card, separator, sheet,
  skeleton. Brand: indigo primary token, Geist fonts, system dark mode via
  inline `matchMedia` script. Shell: Nav (Sheet mobile menu), Footer,
  metadata title template, styled 404. Landing page (hero + how-it-works
  cards). Routes: `/mentors`, `/mentors/[id]`, `/signup`, `/login`,
  `/dashboard`, `/profile`, `/inbox` — all placeholder pages via a shared
  `Placeholder` component; route groups `(auth)` / `(mentor)` with segment
  layouts. Verified: lint, tsc, production build (10 routes), dev smoke test
  (200s, 404 on unknown, no stock content). Theme tweak: `--primary` changed
  from indigo to deep "landmark green" (#00875A / oklch 0.551 0.122 161.179,
  AA 4.55:1; dark #00d294).
- **Decisions:** shadcn for all UI (user directive); `[id]` UUID route
  segment; typed `PageProps` per Next 16 convention; route-group layouts
  typed manually (no single URL path for `LayoutProps`).
- **Next:** Step 1.1 — database setup (Postgres via EnvKit).

### 2026-08-05 — Stage 1: Data layer

- **Done:** `skillbridge` DB created on Postgres 17.2 (EnvKit); `.env` with
  `DATABASE_URL`. Prisma 7.9.1 + `@prisma/adapter-pg` + `pg` + `bcryptjs`
  (+ dev: `tsx`, `dotenv`). `prisma.config.ts` (dotenv, seed command),
  `prisma/schema.prisma` — 5 models, UUID PKs (`gen_random_uuid()`),
  `onDelete: Restrict` + `onUpdate: NoAction` on all 6 FKs (no cascades),
  no role column. Migration `20260805112321_init` created with `--create-only`,
  CHECKs appended (request status, experience_years ≥ 0), applied forward-only.
  `lib/db.ts` singleton (PrismaPg adapter, dev hot-reload safe).
  `next.config.ts` → `serverExternalPackages: ["pg"]`; `.gitignore` excludes
  `lib/generated/`; `postinstall: prisma generate`. Seed: 12 skills, 4 demo
  mentors (bcrypt `password123`), idempotent (ran twice, identical counts),
  mentor_skills replaced explicitly in a transaction.
- **Verified:** `migrate status` up-to-date; live schema inspected — UUID
  defaults, DELETE RESTRICT + UPDATE NO ACTION on every FK, CHECKs present,
  all indexes; raw-SQL FK-restrict demo (23503) and status-CHECK demo (23514);
  lint, tsc, build clean.
- **Decisions:** Prisma's default `ON UPDATE CASCADE` overridden in the
  schema with `onUpdate: NoAction` (global no-cascades rule); enums as
  CHECKs appended to the initial migration (forward-only); generated client
  gitignored + regenerated via postinstall.
- **Next:** Step 2.1 — Auth.js setup.

*Follow-up same day: `mentor_profiles.headline` dropped (user request) via
migration `20260805123000_drop_mentor_profile_headline`; seed, PRD and
BUILD_PLAN synchronized; lint/tsc/build re-verified clean.*

### 2026-08-05 — Stage 2: Authentication (Better Auth)

- **Done:** Auth.js v5 replaced with **Better Auth 1.6.26** + zod 4.4.3
  (shadcn `input`/`label` added). Migration `20260805130000_add_better_auth`:
  `users` gains `email_verified`/`image`, loses `password_hash`; new
  `accounts`, `sessions`, `verifications` tables — UUID PKs, RESTRICT/NO
  ACTION FKs (8 total now), indexes on token/account_id/user_id.
  `lib/auth.ts` (prismaAdapter + model mapping + `generateId: "uuid"` +
  `nextCookies`), `lib/auth/password.ts` (bcryptjs), `/api/auth/[...all]`
  route, Zod-validated server actions, `useActionState` forms on `/signup`
  and `/login`, `proxy.ts`, `lib/auth/dal.ts`
  (`getSession`/`requireUser`/`requireMentorProfile`), layout guards
  (dashboard + mentor group), session-aware nav (also fixed stale
  `/auth/login` → `/login` links), seed now creates credential accounts
  (idempotent counts 4 users / 4 profiles / 12 skills / 9 mentor_skills /
  4 accounts).
- **Verified:** lint + tsc + build clean (build regenerates `.next` types —
  tsc after route changes fails until `next build` runs). Live curl flows
  against a throwaway `next start -p 3100` (user's dev server on :3000
  untouched, env `BETTER_AUTH_URL` overridden per test host): unauthenticated
  `/dashboard` `/profile` `/inbox` → 307 `/login` (proxy); `/mentors` public
  200; sign-up → 200 + HttpOnly session cookie + `sessions` row; duplicate
  email → 422; wrong password → 401; seeded demo mentor sign-in (bcrypt
  verify) → 200; signed-in `/login` → 307 `/dashboard`; sign-out → 200 and
  the `sessions` row deleted (get-session → null); CSRF: mutating endpoints
  reject requests without an `Origin` header (400). RESTRICT FK proven live:
  deleting a user with a live session fails with 23503.
- **Decisions:** Better Auth (stable, sessions revocable) over Auth.js v5
  beta; passwords stored in `accounts` (`provider_id = 'credential'`) with
  bcrypt via one shared hasher; database sessions over stateless JWT; proxy
  redirects are optimistic — enforcement is in the DAL; `users.password_hash`
  dropped at user request ("drop db column we may not need again").
- **Next:** Step 3.1 — mentor directory.

*Follow-up same day: auth implementation documented for reference —
`docs/AUTH.md` (step-by-step walkthrough with code + file:line references:
instance config, hashing, storage, API route, server actions, forms, DAL
guards, proxy, cookie mechanics, verified flows, configuration, testing
notes). BUILD_PLAN 2.1 links to it.*

### 2026-08-05 — Stage 3: Mentor discovery

- **Done:** `/mentors` directory — eager-loaded query (user name + skills,
  skill catalog in parallel `Promise.all`), `MentorCard` (name, experience
  badge, clamped bio, skill badges, view-profile link), responsive grid,
  dashed empty state. Search & filter — GET form (no client JS): `q` search
  (`contains` = ILIKE, OR on name/bio) + shadcn `select` for `?skill=`
  (base-ui popup with hidden form input; matches skill name
  case-insensitively through `mentor_skills`). Profile page
  `/mentors/[id]` — UUID-format pre-check, `notFound()` for unknown ids,
  name/years/bio/skills + `RequestCta` (anonymous → sign-in/up links;
  signed-in → disabled button until Phase 4). Also fixed a stale
  `/auth/signup` link on the landing page.
- **Verified:** lint + build + tsc clean. Live smoke on throwaway `next
  start -p 3100`: all 4 mentors listed; `?skill=Data Analysis` → only
  Amara; `?q=priya` → only Priya; combined no-match → empty state with
  Clear filters; malformed and random UUID → 404; profile renders
  (name/9 years/bio/skills); anon CTA links to `/login` + `/signup`;
  authed CTA renders disabled button. Test server killed, sessions cleaned,
  temp artifacts removed.
- **Decisions:** URL-driven filters over client state (progressive
  enhancement, no debounce needed); skill filter by name not UUID; shared
  `MentorWithRelations` payload type instead of hand-written shapes; the
  request CTA is an honest disabled placeholder until Phase 4.
- **Next:** Step 4.1 — request form.

*Follow-up same day (regression fix): `/dashboard` caused an infinite
redirect loop that crashed the browser — root cause: a stale
`better-auth.session_token` cookie (session row gone) made the proxy
redirect `/login` → `/dashboard` on cookie presence while `requireUser`
redirected back to `/login` (no DB session). Fixed by removing auth-route
handling from `proxy.ts` and moving the signed-in redirect into the
`(auth)` layout, where `getSession()` validates against the DB — a stale
cookie now lands on the login form instead of looping. Verified live on a
throwaway server: stale `/dashboard` → `/login` → 200 form (chain
terminates), valid session `/login`/`/signup` → `/dashboard`.*

### 2026-08-05 — Role model pivot: no fixed roles

- **Done:** Removed the fixed learner/mentor role model from the docs.
  Any authenticated user can send requests (learner behaviour) and create a
  public mentor profile to be discovered (mentor behaviour) — a learner to
  someone can be a mentor to another. PRD updated (role model section,
  user stories, FR-AUTH/FR-PROFILE/FR-REQUEST, data model overview, open
  questions). BUILD_PLAN updated (users table has no `role` column, no
  CHECK; guards derive mentor status from profile existence; sign-up has no
  role picker; steps 2.2/4.x/5.1 reworded; index note and phase table).
  Signup placeholder copy updated. `app/(auth)/signup/page.tsx` text only.
- **Next:** Step 1.1 — database setup (Postgres via EnvKit).

### 2026-08-07 — Stage 4: Requests

- **Done:** Request form (`components/request-form.tsx`,
  `lib/validation/request.ts`) rendered on `/mentors/[id]` inside
  `RequestCta` for signed-in users (anonymous keeps sign-in/up links).
  `createMentorshipRequest` Action (`lib/actions/requests.ts`):
  `requireUser` → mentor lookup → self-request block → skill-membership
  check → duplicate-pending check + insert in one interactive
  `$transaction`; `skillId` optional (nullable skill → `IS NULL` match).
  `/dashboard` is a real page now: own requests only (eager-loaded mentor
  name + skill), status badges, `decided_at`, empty state with "Find a
  mentor" CTA. Landing "Become a mentor" is session-aware (signed-in →
  `/profile`, anon → `/signup`) — kills the earlier dead-end.
- **Verified:** lint + tsc + build clean. Live smoke on throwaway `next
  start -p 3100` (server-action POSTs replicated via the form's hidden
  `$ACTION_*` fields): request created (row `pending`, correct requester +
  skill); duplicate same-skill rejected; second skill + no-skill requests
  allowed (3 rows); self-request blocked; crafted invalid skill rejected;
  unknown mentor id → "no longer exists"; 2001-char message rejected;
  missing `skillId` field (null) accepted after fixing the schema;
  dashboard as priya → 3 cards w/ badges, as tunde → empty state; anon CTA
  + landing hrefs correct (anon `/signup`, signed-in `/profile`). Cleanup:
  test rows + sessions deleted, server killed, temp files removed.
- **Bug found & fixed in verification:** `z.string().uuid().optional()`
  rejects a missing form field (`null`) with a generic "Invalid input" —
  schema now `union([uuid, literal(""), null])` → `undefined`.
- **Decisions:** form inline on the profile page (BUILD_PLAN default);
  duplicate protection = transaction check only (MVP race accepted);
  inline success state over redirect; `$ACTION_KEY` hidden fields are
  per-page — curl replays must use the target page's key.
- **Next:** Step 5.1 — profile management (mentor side).

### 2026-08-07 — Stage 5.1: Mentor profile management

- **Done:** `/profile` is a real create/edit page. `upsertMentorProfile`
  Action (`lib/actions/profiles.ts`): `requireUser` → zod validation
  (`lib/validation/profile.ts`: bio 10–2000, years `^\d+$` → 0–99, skill
  uuids) → catalog membership check → one transaction (create/update
  profile, `deleteMany` + `createMany` mentor_skills — explicit replace,
  no cascades). `getProfileEditor(userId)` + `getMentorDirectory`/
  `getMentorProfile` (`lib/actions/mentors.ts`) — **directory DB queries
  moved out of the page components into the actions layer** (user
  request). `MentorProfileForm` (client, `useActionState`): bio, years,
  skill chips pre-checked when editing; success links to the live
  `/mentors/[id]` page. `app/(mentor)/profile/page.tsx` switches
  create/edit copy, keeps `?setup=1` message.
- **Verified:** lint + tsc + build clean. Live smoke on throwaway :3100:
  fresh sign-up → `/profile` shows the create form; POST create (2 skills)
  → row + 2 mentor_skills + success UI; new mentor appears in `/mentors`
  and under `?skill=Data Analysis` (action-backed query); edit pre-fills
  bio/years/2 checked chips; POST edit (1 skill) → bio/years updated,
  mentor_skills replaced; short bio / empty years / years 100 rejected
  inline. Cleanup: mentor_skills → profile → session → account → user
  (RESTRICT order), server killed, temp files removed. One test-note: a
  valid-but-misleading "Too short." (10 chars) passed `min(10)` — expected.
- **Decisions:** profile ownership always derived from `session.user.id`
  (never client-supplied); years parsed via regex-transform instead of
  `z.coerce.number()` (coerce maps missing/empty → `0`, silently valid);
  queries live in `lib/actions/*` (server-only), pages stay thin.
- **Next:** Step 5.2 — inbox & respond.

*Follow-up same day (multi-skill requests): the skill picker showed UUIDs
instead of names — base-ui `SelectValue` falls back to the raw value when
it can't resolve an item label (invisible earlier only because the filters
select used skill *names* as values). Replaced the select with native
checkbox chips (`name="skillIds"` → `FormData.getAll`, no client JS).
Requests now support multiple skills: migration
`20260807150000_add_mentorship_request_skills` adds the
`mentorship_request_skills` join table (UUID PK, RESTRICT FKs, unique
`(request_id, skill_id)`) and drops `mentorship_requests.skill_id` after a
backfill (no-op — table empty). Action checks every submitted skill
against the mentor's offered skills and reports per-skill duplicates by
name; request + join rows created in one transaction. Dashboard renders
sorted skill names via the join. Verified live on throwaway :3100:
multi-skill create (1 request + 2 join rows), per-skill duplicate rejected
("already have a pending request for UI/UX Design"), no-skill and
invalid-skill cases correct, `skill_id` column gone; cleanup done
(join rows deleted before requests — RESTRICT FK, then test session by id,
server killed, temp files removed). Note: better-auth `sessions.created_at`
lags the DB clock — time-windowed session cleanup misses test rows; delete
by id instead.*

### 2026-08-07 — Stage 5.2: Inbox & respond

- **Done:** `/inbox` is real (was a placeholder). `getInbox(mentorProfileId)`
  read action (`lib/actions/inbox.ts`): requester name, sorted skill names,
  message, status, timestamps; pending first, then decided (newest first).
  `respondToRequest` Action (`lib/actions/requests.ts`): `requireUser` →
  ownership check (`mentorProfile.userId === session.user.id`, non-owner
  rejected server-side) → `updateMany({ id, status: "pending" })` setting
  status + `decided_at`; count 0 → "already been responded to" (race-safe).
  `InboxRequestActions` client component (per pending row, Accept/Decline
  submit buttons via `useActionState`). Nav fix (the actual complaint):
  signed-in users now see **My Requests**, **Mentor Profile**, and (when
  they have a profile) **Inbox** in the header — previously only the mobile
  sheet had them, desktop had no path to `/dashboard`, `/profile`, or
  `/inbox`. `/dashboard` also moved to the actions layer
  (`lib/actions/dashboard.ts`) and hardened with `requireUser()` — the old
  `where: { requesterId: undefined }` dropped the filter and leaked all
  requests to anonymous visitors.
- **Verified:** lint + tsc + build clean. Live smoke on throwaway :3100:
  Amara's inbox listed 3 pending requests (Babatunde + 2 smoke) with
  skills/message/status; Accept → `accepted` + `decided_at`, page
  re-rendered "You accepted this request on Aug 7, 2026" with actions gone;
  Decline → `declined` + `decided_at`; re-accept → "This request has
  already been responded to."; cross-mentor replay (Priya's session on
  Amara's captured form) → "Only the mentor this request was sent to can
  respond.", no mutation; non-mentor `/inbox` still redirects to
  `/profile?setup=1`. Smoke rows fully deleted, Babatunde's real request
  restored to untouched `pending`, server killed.
- **Decisions:** optimistic `updateMany`-count guard instead of
  read-then-write (double-click/race safe); `$ACTION_KEY` is
  session-scoped and stable across re-renders (reusable for replays); SSR
  text between JSX expressions is split by `<!-- -->` comment nodes — strip
  comments before asserting on rendered text.
- **Next:** Phase 6 — empty/error states, SEO & meta, build & deploy.

### 2026-08-07 — Stage 6.4: DB-driven notifications (user-requested addition)

- **Done:** `notifications` table (migration `20260807160000_add_notifications`:
  UUID PK, RESTRICT FK → `users`, type CHECK `request_received |
  request_accepted | request_declined`, denormalized title/body/link,
  `read_at` nullable, `(user_id, read_at)` index). Notifications are
  written **inside the same transaction** as the triggering action:
  `createMentorshipRequest` → mentor gets `request_received` (link
  `/inbox`); `respondToRequest` → requester gets `request_accepted` /
  `request_declined` (link `/dashboard`), created only when the
  conditional `updateMany` actually transitions the request (interactive
  transaction — a stale replay can't produce a phantom notification).
  `lib/actions/notifications.ts`: `getNotifications` (unread first via
  `readAt: { sort: "asc", nulls: "first" }`), unread count, scoped
  `markNotificationRead` (row submit → `redirect(link)`), plain-form
  `markAllNotificationsRead`. `/notifications` page: unread rows are
  tinted submit buttons with a dot, read rows are Links, type icons,
  "Mark all as read" when unread > 0, empty state. Header bell with
  unread badge (desktop) + "Notifications" link (mobile sheet).
- **Verified:** lint + tsc + build clean. Live smoke on throwaway :3100:
  real sign-up → real request form to Amara (1 skill) → Amara's bell
  badge "1", aria-label "Notifications (1 unread)", page shows "New
  mentorship request — Notif Smoker wants you to mentor them in Career
  Coaching." unread; mark-all → "You're all caught up", button + dots
  gone; Amara accepts → requester gets "Request accepted — Amara Johnson
  accepted your mentorship request." unread; row click → 303 to
  `/dashboard` + `read_at` set (SQL-verified); page then renders the row
  as a read Link. Cleanup: notifications → request_skills → request →
  sessions → accounts → user (RESTRICT order); Babatunde's request
  untouched (`pending`); :3100 killed.
- **Decisions:** snapshot text denormalized (frozen at creation); `link`
  validated as a relative path and used as the redirect target ("click
  row = mark read + navigate"); no event system — explicit notification
  writes in the same transactions. Test-infra lesson: git-bash curl
  rewrites `/dashboard`-style `-F` values into `C:/Program Files/Git/…`
  (MSYS path conversion) — the schema correctly rejected it; use
  `MSYS_NO_PATHCONV=1` (and Windows paths for `-b`/`-D`/`-o`) for such
  replays.
- **Next:** Steps 6.1, 6.2, 6.3 — empty/error states, SEO & meta,
  build & deploy.

### 2026-08-07 — Fix: stale dev-server Prisma client (repeat)

- **Issue:** User reported `Cannot read properties of undefined (reading
  'count')` at `lib/actions/notifications.ts:44` (`prisma.notification`)
  from `Nav`. Root cause: the long-running dev server on :3000 had been
  started **before** the notifications migration + `prisma generate`, so
  its in-memory client had no `notification` model (`prisma.notification`
  → undefined). Same class as the earlier multi-skill stale-client
  incident — the fresh :3100 production server always worked.
- **Fix:** killed the :3000 dev process (PID 33960), restarted via
  `nohup npm run dev > .dev-server.log 2>&1`, verified by signing in and
  loading `/` (nav runs the count query): 200, nav renders, no error.
- **Rule (repeat):** after any `prisma generate`, restart long-running
  dev servers — Turbopack serves the stale client until then.

### 2026-08-07 — Fix: Vercel build (Prisma generate timing)

- **Issue:** Vercel deploy failed at `npm install` — the `postinstall:
  prisma generate` script couldn't resolve `DATABASE_URL`
  (`PrismaConfigEnvError`). Vercel does not inject project env vars into
  the dependency-install step.
- **Fix:** removed `postinstall`; `build` is now
  `prisma generate && next build` (env vars ARE available during
  `vercel build`). Verified locally from a clean state: deleted
  `lib/generated`, ran `npm run build` — client regenerated + app built.
- **Next:** set `DATABASE_URL` in Vercel project settings; the app also
  needs a Postgres reachable from Vercel (local EnvKit Postgres won't be),
  with `prisma migrate deploy` run against it.
