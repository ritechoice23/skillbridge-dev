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
