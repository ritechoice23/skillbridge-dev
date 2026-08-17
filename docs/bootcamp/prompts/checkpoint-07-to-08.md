# Transition Prompt: Checkpoint 07 → Checkpoint 08

| Transition | From Checkpoint 07 to Checkpoint 08 |
|---|---|
| **Goal** | Implement production polish, brand favicon/icon, root error boundaries, SEO metadata (`generateMetadata`, `sitemap.ts`, `robots.ts`), automated migration build scripts, and Vercel deployment configuration. |
| **Reference Tag** | `checkpoint-08-production-deploy` |

---

## 🤖 Primary AI Prompt

```text
Before making any changes:

1. Inspect the existing project.
2. Understand the current architecture and conventions.
3. Do not replace working implementations unnecessarily.
4. Preserve the existing project structure.
5. Make the minimum changes necessary to complete this task.
6. Do not modify unrelated files.
7. Reuse existing packages and utilities where appropriate.
8. Do not introduce unnecessary abstractions.

---

### Task Overview
Prepare SkillBridge for production release: add brand assets and custom favicon, implement a root error boundary, add SEO metadata, OpenGraph tags, sitemap, and robots configurations, and set up automated build scripts and environment documentation.

### Current State
- Checkpoint 07 completed with full functional features (discovery, requests, mentor inbox, and in-app notifications).
- Default favicon, missing dynamic metadata on profiles, missing sitemap/robots, and standard build scripts.

### Desired State
1. **Brand Favicon & Icon (`app/icon.svg`)**:
   - Create `app/icon.svg` with an SVG icon (e.g. rounded container with landmark green brand color and a handshake motif).
   - Delete default generic `app/favicon.ico` (Next.js 16 automatically generates favicon tags from `app/icon.svg`).

2. **Root Error Boundary (`app/error.tsx`)**:
   - Create client component `app/error.tsx` accepting `{ error, reset }`.
   - Render a centered card matching the 404 styling with an error explanation and a "Try again" button that invokes `reset()`.

3. **SEO, Metadata & OpenGraph**:
   - In `app/layout.tsx`, define a shared `APP_DESCRIPTION` constant and add `openGraph` configuration (title, description, `type: "website"`, siteName: "SkillBridge").
   - In `app/mentors/[id]/page.tsx`, export `generateMetadata({ params })` to dynamically generate page title (`${mentor.name} | SkillBridge`) and meta description listing their offered skills.
   - In `app/sitemap.ts`, export default function returning a Sitemap array indexing `/`, `/mentors`, `/login`, and `/signup` with appropriate `changeFrequency` and `priority` using `process.env.NEXT_PUBLIC_APP_URL || "https://skillbridge-dev.vercel.app"`.
   - In `app/robots.ts`, export default function returning a Robots configuration allowing all user agents and linking to the sitemap URL.

4. **Production Build & Deployment Configuration**:
   - In `package.json`:
     - Update `"build"` script to: `"prisma generate && prisma migrate deploy && next build"` (ensuring migrations automatically deploy during CI/CD or Vercel builds).
     - Add `"db:migrate"` script: `"prisma migrate deploy"`.
   - Create `.env.example` documenting required environment variables:
     - `DATABASE_URL`
     - `BETTER_AUTH_SECRET`
     - `BETTER_AUTH_URL`
     - `NEXT_PUBLIC_APP_URL`
   - In `.gitignore`, ensure `!.env.example` is explicitly allowed (preventing broad `.env*` rules from ignoring `.env.example`).
   - Create `vercel.json` with build settings if deploying to Vercel.

### Acceptance Criteria
1. The custom brand SVG favicon displays in the browser tab.
2. Visiting `http://localhost:3000/sitemap.xml` returns a valid XML sitemap.
3. Visiting `http://localhost:3000/robots.txt` returns valid robots directives.
4. Mentor profile pages render dynamic OpenGraph and title metadata matching the mentor's name and skills.
5. Running `npm run build` runs client generation, migration deployment, and successfully compiles static and server routes with 0 errors.
```

---

## 🛠️ Recovery / Diagnostic Prompt

```text
We are trying to reach Checkpoint 08 (Production Polish, SEO & Deployment).

Expected state:
- app/icon.svg exists as the brand icon.
- app/error.tsx exists as the root error boundary.
- app/sitemap.ts and app/robots.ts provide search engine discovery.
- app/mentors/[id]/page.tsx exports generateMetadata.
- package.json includes prisma generate && prisma migrate deploy && next build in the build script.
- .env.example is present and tracked by git.
- npm run build succeeds cleanly.

Inspect the current implementation:
1. Verify app/sitemap.ts and app/robots.ts syntax and route handlers.
2. Check package.json build script.
3. Check .gitignore to make sure .env.example is not excluded.
4. Run npm run build to check for any compilation, lint, or Prisma generate errors.
5. Fix any issues and verify by checking /sitemap.xml and running a clean build.
```
