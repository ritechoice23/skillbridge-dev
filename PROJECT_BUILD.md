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
