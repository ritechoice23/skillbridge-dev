# SkillBridge — Progress Tracker

Tracks where we are in the build plan (`docs/BUILD_PLAN.md`). Update after
every meaningful session: flip step statuses, move the current-phase marker,
append a session log entry.

**Status legend:** ⬜ pending · 🔵 in progress · ✅ done

**Overall progress:** 8 / 18 build steps done (docs system complete).

**Current phase:** 3 — Mentor discovery

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
| 3 Mentor discovery | 3.1 Mentor directory | ⬜ |
| | 3.2 Search & filter | ⬜ |
| | 3.3 Mentor profile page | ⬜ |
| 4 Requests | 4.1 Request form | ⬜ |
| | 4.2 Persistence | ⬜ |
| | 4.3 Requester dashboard | ⬜ |
| 5 Mentor side | 5.1 Profile management | ⬜ |
| | 5.2 Inbox & respond | ⬜ |
| 6 Polish & ship | 6.1 Empty/error states | ⬜ |
| | 6.2 SEO & meta | ⬜ |
| | 6.3 Build & deploy | ⬜ |

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
