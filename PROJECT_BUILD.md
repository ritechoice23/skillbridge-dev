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
