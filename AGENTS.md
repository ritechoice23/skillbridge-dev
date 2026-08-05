## Prompt Logging

```yaml
prompt_logging:
  enabled: false
```

When disabled, skip all prompt-logging behaviour (no `.agent/prompts/` logging).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project Build Documentation

Maintain `PROJECT_BUILD.md` at the repository root as the project's living build story.

- It is a step-by-step, chronological record of how the project was built — the features, the decisions, and the considerations drawn from every prompt interaction and work session.
- For each meaningful build step, record:
  - What was built or changed (feature, file, module).
  - Which prompt or interaction triggered it.
  - Key decisions and the reasoning behind them.
  - Alternatives considered and why they were rejected.
  - Constraints, trade-offs, risks, and how they were handled.
  - Anything worth copying or referencing for future work.
- Update it as work happens — append at the end of each meaningful session. Never rewrite history; amend and extend.
- Treat it as a reference system for the build process: something to consult, copy from, or resume from when continuing the project.
- Prompt logs (if enabled) live under `.agent/prompts/`; `PROJECT_BUILD.md` is separate — it tells the project story, not the prompt history.
