# Checkpoint 08: Production Polish, SEO, Error Handling & Deployment

## Goal

Prepare the platform for production: create a custom brand SVG icon/favicon (`icon.svg`), implement a global root error boundary (`app/error.tsx`), configure SEO and OpenGraph metadata (`generateMetadata`, `sitemap.ts`, `robots.ts`), set up an automated migration deployment build script, and document environment variables.

## Prompt

```text
Inspect the existing Next.js project before making any changes.

We want to prepare SkillBridge for production release with brand assets, error boundaries, SEO metadata, and automated deployment configurations.

Please follow these guidelines:
1. Inspect the existing metadata, favicon, and build scripts first.
2. Create Brand Favicon & Icon (app/icon.svg):
   - Create an SVG icon with rounded corners, landmark green background, and a clean white handshake motif.
   - Delete default generic app/favicon.ico (Next.js 16 automatically uses app/icon.svg for browser tab and bookmark icons).
3. Create Root Error Boundary (app/error.tsx):
   - Client component accepting { error, reset }.
   - Render a centered card matching 404 styling with an error explanation and a "Try again" button calling reset().
4. Add SEO, Metadata & OpenGraph:
   - In app/layout.tsx, define APP_DESCRIPTION and add openGraph metadata (title, description, type: "website", siteName: "SkillBridge").
   - In app/mentors/[id]/page.tsx, export generateMetadata({ params }) to dynamically set page title ("${mentor.name} | SkillBridge") and description listing their offered skills.
   - Create app/sitemap.ts exporting default function returning a Sitemap indexing "/", "/mentors", "/login", "/signup" with change frequencies and priorities using process.env.NEXT_PUBLIC_APP_URL.
   - Create app/robots.ts exporting default function returning Robots configuration allowing all crawlers and referencing the sitemap URL.
5. Configure Production Build & Deployment:
   - In package.json:
     - Update "build" script to: "prisma generate && prisma migrate deploy && next build" (ensuring migrations automatically run during Vercel or CI/CD deployments).
     - Add "db:migrate": "prisma migrate deploy".
   - Create .env.example documenting required keys: DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, NEXT_PUBLIC_APP_URL.
   - In .gitignore, ensure !.env.example is explicitly included so the example template is tracked.
   - Create vercel.json with build settings.

Verify that app/icon.svg renders, /sitemap.xml and /robots.txt load cleanly, and npm run build succeeds with zero errors.
```

## Recovery and Alignment Prompt

```text
We are trying to align the project with Checkpoint 08 (Production Polish, SEO & Deployment).

Expected state:
- app/icon.svg exists as the brand icon.
- app/error.tsx exists as the root error boundary.
- app/sitemap.ts and app/robots.ts provide search engine discovery.
- app/mentors/[id]/page.tsx exports generateMetadata.
- package.json includes prisma generate && prisma migrate deploy && next build in the build script.
- .env.example is present and tracked by git.
- npm run build succeeds cleanly.

Inspect the project, fix any metadata, error boundary, or build script issues, and verify by checking /sitemap.xml and running a clean build.
```

## Quick Verification

1. Open any page in the browser — confirm the custom green handshake icon appears in the browser tab.
2. Open `/mentors/<uuid>` for Amara Johnson — inspect `<head>` to confirm `<title>Amara Johnson | SkillBridge</title>` and dynamic skill description.
3. Open `http://localhost:3000/sitemap.xml` — confirm valid XML sitemap.
4. Open `http://localhost:3000/robots.txt` — confirm valid robots crawler directives.
5. Run `npm run build` — confirm client generation, migration deployment, and static/server route compilation pass with 0 errors.
