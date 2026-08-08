# SkillBridge

Connect with mentors for practical, hands-on skills. Browse the mentor
directory, read profiles, and send a mentorship request — mentors accept,
decline, and manage requests from their inbox.

## Stack

- [Next.js](https://nextjs.org) (App Router, Server Actions)
- [Prisma](https://prisma.io) + PostgreSQL
- [Better Auth](https://better-auth.com) for authentication

## Getting started

Requirements: Node.js, a PostgreSQL server (the local dev stack in EnvKit
works fine).

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure the environment — copy `.env.example` to `.env` and set:

   | Variable            | Description                                          |
   | ------------------- | ---------------------------------------------------- |
   | `DATABASE_URL`      | PostgreSQL connection string, e.g. `postgresql://postgres@127.0.0.1:5432/skillbridge` |
   | `BETTER_AUTH_SECRET`| Long random string used to sign sessions             |
   | `BETTER_AUTH_URL`   | Base URL of the app, e.g. `http://localhost:3000`    |
   | `NEXT_PUBLIC_APP_URL` | Public origin used for sitemap/robots (optional)   |

3. Create the schema and seed demo data:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script            | Description                                        |
| ----------------- | -------------------------------------------------- |
| `npm run dev`     | Start the dev server                               |
| `npm run build`   | Type-check, generate Prisma client, build for production |
| `npm run lint`    | Run ESLint                                         |
| `npm run db:migrate` | Apply pending Prisma migrations                |
| `npm run db:seed` | Seed skills, demo users, and mentor profiles       |

## Database migrations

Migrations are forward-only, hand-written SQL files in
`prisma/migrations/`. Apply them with `npm run db:migrate`
(`prisma migrate deploy`) — never use `prisma migrate dev` in this repo.

## Deploying to Vercel

1. Push the repository to GitHub and import it into Vercel. The project
   is configured to work out of the box: the `build` script generates
   the Prisma client before `next build`, and `vercel.json` runs
   `prisma migrate deploy` at the start of every build so pending
   migrations are applied automatically.

2. Add environment variables in Vercel (Settings → Environment
   Variables) for **Preview and Production**:

   - `DATABASE_URL` — point this at a **hosted** PostgreSQL (e.g. Neon,
     Supabase). Vercel's build machines cannot reach a local database.
   - `BETTER_AUTH_SECRET` — a long random string.
   - `BETTER_AUTH_URL` — your production URL, e.g.
     `https://skillbridge-dev.vercel.app`.
   - `NEXT_PUBLIC_APP_URL` — same production URL (optional; used for
     sitemap/robots).

3. Deploy. The build runs `prisma migrate deploy && npm run build`
   automatically; subsequent deploys only apply new migrations.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
