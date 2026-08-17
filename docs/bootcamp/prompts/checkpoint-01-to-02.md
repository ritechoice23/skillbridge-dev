# Transition Prompt: Checkpoint 01 → Checkpoint 02

| Transition | From Checkpoint 01 to Checkpoint 02 |
|---|---|
| **Goal** | Connect PostgreSQL, set up Prisma 7 ORM with custom driver adapter, create database schema with UUID PKs & restrictive foreign keys, create forward-only migration, and implement idempotent seed data. |
| **Reference Tag** | `checkpoint-02-postgresql-prisma` |

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
We need to set up the data layer for SkillBridge using PostgreSQL and Prisma 7 ORM.

### Current State
- Next.js 16 App Router application with shadcn/ui components and placeholder routes (Checkpoint 01).
- No database connection or Prisma setup exists yet.

### Desired State
1. **Prisma 7 Configuration**:
   - Install `prisma`, `@prisma/client`, `@prisma/adapter-pg`, `pg`, `tsx`, and `dotenv`.
   - Install types: `@types/pg`.
   - Create `prisma.config.ts` configuring the database URL from `process.env.DATABASE_URL` and pointing seed command to `tsx prisma/seed.ts`.
   - In `next.config.ts`, add `serverExternalPackages: ["pg"]`.
   - In `.gitignore`, ensure `lib/generated/` is ignored.
   - In `package.json`, add `"db:seed": "prisma db seed"`.

2. **Database Schema (`prisma/schema.prisma`)**:
   - Datasource: `postgresql`.
   - Generator: `prisma-client` with output path to `lib/generated/prisma`.
   - Define the following 5 models:
     - `User`: mapped to `users` (id UUID PK default gen_random_uuid(), email unique, name, created_at, updated_at). Passwords will be handled via Better Auth in the next step, so do NOT add a password column on `users`.
     - `MentorProfile`: mapped to `mentor_profiles` (id UUID PK, userId unique FK -> users(id), bio text, experienceYears integer, created_at, updated_at). Note: do NOT add a headline field.
     - `Skill`: mapped to `skills` (id UUID PK, name unique, created_at).
     - `MentorSkill`: mapped to `mentor_skills` (id UUID PK, mentorProfileId FK -> mentor_profiles(id), skillId FK -> skills(id), created_at, unique pair [mentorProfileId, skillId]).
     - `MentorshipRequest`: mapped to `mentorship_requests` (id UUID PK, requesterId FK -> users(id), mentorProfileId FK -> mentor_profiles(id), message text, status string default "pending", decidedAt nullable, created_at, updated_at).
   - **Crucial Database Rules**:
     - All primary keys MUST use `@default(dbgenerated("gen_random_uuid()")) @db.Uuid`.
     - All foreign key relations MUST explicitly declare `onDelete: Restrict, onUpdate: NoAction` (no cascading deletes or updates).
     - All column names mapped to snake_case in PostgreSQL using `@map` and table names using `@@map`.

3. **Database Migration**:
   - Generate and apply a forward-only initial migration (e.g. `init`).
   - Append CHECK constraints to the migration SQL for:
     - `experience_years >= 0` on `mentor_profiles`
     - `status IN ('pending', 'accepted', 'declined')` on `mentorship_requests`

4. **Prisma Client Singleton (`lib/db.ts`)**:
   - Create a singleton `PrismaClient` using `@prisma/adapter-pg` driver adapter (`PrismaPg`) with global caching in development.

5. **Idempotent Seed Script (`prisma/seed.ts`)**:
   - Seed 12 practical skills: `Web Development`, `Mobile Development`, `UI/UX Design`, `Data Analysis`, `Machine Learning`, `DevOps & Cloud`, `Product Management`, `System Architecture`, `Cybersecurity`, `Technical Writing`, `Public Speaking`, `Career Coaching`.
   - Seed 4 demo mentor users with profiles and associated skills:
     - Alex Chen (`alex@example.com`, 6 yrs exp)
     - Priya Sharma (`priya@example.com`, 9 yrs exp)
     - Marcus Vance (`marcus@example.com`, 12 yrs exp)
     - Amara Johnson (`amara@example.com`, 7 yrs exp)
   - Ensure the seed script is transactional and idempotent (safe to run multiple times without duplicate errors).

### Acceptance Criteria
1. `npx prisma migrate status` reports database schema is up to date.
2. `npm run db:seed` runs successfully and repeatedly without throwing constraint errors.
3. Deleting a referenced skill or user in PostgreSQL fails with foreign key violation (23503).
4. `npm run build` succeeds without TypeScript or build errors.
```

---

## 🛠️ Recovery / Diagnostic Prompt

```text
We are trying to reach Checkpoint 02 (PostgreSQL Database & Prisma ORM).

Expected state:
- Prisma 7 configured with @prisma/adapter-pg driver adapter.
- prisma/schema.prisma contains User, MentorProfile, Skill, MentorSkill, and MentorshipRequest with UUID PKs (gen_random_uuid) and onDelete: Restrict / onUpdate: NoAction on all relations.
- lib/db.ts exports the PrismaClient singleton.
- prisma/seed.ts idempotently seeds 12 skills and 4 demo mentors.
- npx prisma migrate status is up to date and npm run db:seed passes cleanly.

Inspect the current implementation:
1. Check prisma/schema.prisma for missing models, incorrect cascade rules, or missing UUID / snake_case mappings.
2. Verify prisma.config.ts and lib/db.ts connection configuration.
3. Check why npm run db:seed or migrations may be failing.
4. Fix only what is necessary to match the expected state while preserving existing UI components.
5. Verify with: npx prisma migrate status && npm run db:seed && npm run build.
```
