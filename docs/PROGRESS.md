# SkillBridge — Progress Tracker

Tracks where we are in the build plan (`docs/BUILD_PLAN.md`). Update after
every meaningful session: flip step statuses, move the current-phase marker,
append a session log entry.

**Status legend:** ⬜ pending · 🔵 in progress · ✅ done

**Overall progress:** 3 / 18 build steps done (docs system complete).

**Current phase:** 1 — Data layer

---

## Step status

| Phase | Step | Status |
|---|---|---|
| 0 Foundations | 0.0 shadcn setup | ✅ |
| | 0.1 Design system & layout shell | ✅ |
| | 0.2 Routing structure | ✅ |
| 1 Data layer | 1.1 Database setup | ⬜ |
| | 1.2 Schema & migrations | ⬜ |
| | 1.3 Seed data | ⬜ |
| 2 Authentication | 2.1 Auth.js setup | ⬜ |
| | 2.2 Roles & guards | ⬜ |
| 3 Mentor discovery | 3.1 Mentor directory | ⬜ |
| | 3.2 Search & filter | ⬜ |
| | 3.3 Mentor profile page | ⬜ |
| 4 Requests | 4.1 Request form | ⬜ |
| | 4.2 Persistence | ⬜ |
| | 4.3 Learner dashboard | ⬜ |
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
- **Decisions:** Prisma ORM, Auth.js, roles at sign-up, CHECK-constraint
  enums, UUID PKs, RESTRICT FKs (no cascades), forward-only migrations.
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
