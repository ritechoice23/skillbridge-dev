## Prompt Logging

```yaml
prompt_logging:
  enabled: true
```

When disabled, skip all prompt-logging behaviour (no `.agent/prompts/` logging).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project Docs System

Maintain the following files in `docs/`:

- `docs/PRD.md` — the product requirements document. Update it when product decisions change.
- `docs/BUILD_PLAN.md` — the step-by-step build plan. Each build step is broken down with objectives, tasks, files, acceptance criteria, and decisions. Keep it in sync with what the project actually does.
- `docs/PROGRESS.md` — the tracking file. After every meaningful session, update step statuses (pending / in progress / done), the current phase marker, and append a short session log entry.

All project documentation must follow the database principles in the global rule: UUID primary keys on every application-owned table, restrictive foreign keys (no cascades), forward-only migrations, and explicit cleanup through application code.
