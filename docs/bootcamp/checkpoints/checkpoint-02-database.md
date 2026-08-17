# Checkpoint 02: PostgreSQL Database Setup & Prisma ORM

## Goal

Connect PostgreSQL, configure Prisma 7 with the `@prisma/adapter-pg` driver adapter, define the core domain schema (`users`, `mentor_profiles`, `skills`, `mentor_skills`, `mentorship_requests`) with UUID primary keys and cascade-free foreign keys, apply the initial migration, and create an idempotent seed script.

## Prompt

```text
Inspect the existing Next.js project before making any changes.

We want to configure Prisma 7 with PostgreSQL and set up the database models and seed script for SkillBridge. PostgreSQL is running locally.

Please follow these guidelines:
1. Inspect the existing Prisma configuration and schema if present.
2. Install Prisma dependencies: prisma, @prisma/client, @prisma/adapter-pg, pg, tsx, dotenv, and @types/pg.
3. Configure prisma.config.ts to load DATABASE_URL from the environment and set the seed command to "tsx prisma/seed.ts".
4. In next.config.ts, add serverExternalPackages: ["pg"].
5. In prisma/schema.prisma, configure datasource db with provider = "postgresql" and generator client with provider = "prisma-client" and output = "lib/generated/prisma".
6. Define the 5 core application models:
   - User (mapped to "users"): id (UUID PK default gen_random_uuid()), email (String unique), name (String), createdAt, updatedAt. (Do NOT add a password column here; auth tables will handle passwords in the next step).
   - MentorProfile (mapped to "mentor_profiles"): id (UUID PK), userId (UUID unique FK -> users(id)), bio (String), experienceYears (Int), createdAt, updatedAt.
   - Skill (mapped to "skills"): id (UUID PK), name (String unique), createdAt.
   - MentorSkill (mapped to "mentor_skills"): id (UUID PK), mentorProfileId (UUID FK -> mentor_profiles(id)), skillId (UUID FK -> skills(id)), createdAt, @@unique([mentorProfileId, skillId]), @@index([skillId]).
   - MentorshipRequest (mapped to "mentorship_requests"): id (UUID PK), requesterId (UUID FK -> users(id)), mentorProfileId (UUID FK -> mentor_profiles(id)), message (String), status (String default "pending"), decidedAt (DateTime nullable), createdAt, updatedAt.
7. Crucial Database Rules:
   - All primary keys MUST use @default(dbgenerated("gen_random_uuid()")) @db.Uuid.
   - All foreign keys MUST explicitly declare onDelete: Restrict, onUpdate: NoAction (no cascade deletions or updates).
   - All column names mapped to snake_case using @map and tables using @@map.
8. Create a forward-only migration and append database CHECK constraints:
   - experience_years >= 0 on mentor_profiles
   - status IN ('pending', 'accepted', 'declined') on mentorship_requests
9. Create the Prisma client singleton in lib/db.ts using PrismaPg adapter and global caching for development hot-reloads.
10. Create an idempotent, transactional seed script in prisma/seed.ts:
   - Seed 12 skills: Web Development, Mobile Development, UI/UX Design, Data Analysis, Machine Learning, DevOps & Cloud, Product Management, System Architecture, Cybersecurity, Technical Writing, Public Speaking, Career Coaching.
   - Seed 4 demo mentors with profiles and skills: Alex Chen (6 yrs), Priya Sharma (9 yrs), Marcus Vance (12 yrs), Amara Johnson (7 yrs).
   - Add "db:seed": "prisma db seed" to package.json.

Verify that npx prisma migrate status is up to date and npm run db:seed runs cleanly twice without errors.
```

## Recovery and Alignment Prompt

```text
We are trying to align the project with Checkpoint 02 (PostgreSQL Database & Prisma ORM).

Expected state:
- Prisma 7 configured with @prisma/adapter-pg and PostgreSQL.
- prisma/schema.prisma defines User, MentorProfile, Skill, MentorSkill, and MentorshipRequest with UUID PKs and onDelete: Restrict / onUpdate: NoAction on all relations.
- lib/db.ts exports the PrismaClient singleton.
- prisma/seed.ts seeds 12 skills and 4 demo mentors idempotently.
- npx prisma migrate status is up to date and npm run db:seed succeeds.

Inspect the project, fix any schema mismatches, driver adapter issues, or seed script errors, and verify with:
npx prisma migrate status && npm run db:seed && npm run build
```

## Quick Verification

1. Run `npx prisma migrate status` — confirm database schema is up to date.
2. Run `npm run db:seed` twice — confirm zero duplicate errors.
3. Open `npx prisma studio` — verify 4 users, 4 mentor profiles, 12 skills, and 9 mentor skills exist.
