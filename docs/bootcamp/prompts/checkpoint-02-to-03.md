# Transition Prompt: Checkpoint 02 → Checkpoint 03

| Transition | From Checkpoint 02 to Checkpoint 03 |
|---|---|
| **Goal** | Implement email & password authentication and revocable database session management using Better Auth 1.6.26, Zod Server Actions, React 19 `useActionState` forms, and Data Access Layer route guards. |
| **Reference Tag** | `checkpoint-03-authentication` |

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
Integrate Better Auth (v1.6.26) for email + password authentication with database sessions, password hashing via bcryptjs, Zod-validated Server Actions, interactive signup/login forms, and server-side route guards.

### Current State
- Checkpoint 02 completed with PostgreSQL, Prisma 7 schema (User, MentorProfile, Skill, MentorSkill, MentorshipRequest), and seed data.
- `/login` and `/signup` render placeholder components.

### Desired State
1. **Install Dependencies & Components**:
   - Install `better-auth@1.6.26`, `zod`, `bcryptjs`.
   - Install dev types: `@types/bcryptjs`.
   - Add shadcn `input` and `label` components.

2. **Database Schema Update for Better Auth**:
   - Update `prisma/schema.prisma` with Better Auth core models:
     - `User`: add `emailVerified` (Boolean, default false), `image` (String optional). (Ensure passwords are NOT stored directly on User).
     - `Account`: mapped to `accounts` (id UUID PK, accountId text, providerId text, userId UUID FK -> users(id) RESTRICT/NO ACTION, password text optional, accessToken text optional, refreshToken text optional, idToken text optional, accessTokenExpiresAt optional, refreshTokenExpiresAt optional, scope optional, timestamps).
     - `Session`: mapped to `sessions` (id UUID PK, token text unique, userId UUID FK -> users(id) RESTRICT/NO ACTION, ipAddress optional, userAgent optional, expiresAt timestamptz, timestamps).
     - `Verification`: mapped to `verifications` (id UUID PK, identifier text, value text, expiresAt timestamptz, timestamps).
   - Generate and apply a forward-only migration.
   - Update `prisma/seed.ts` to create credential accounts (`provider_id: "credential"`) with bcrypt-hashed `password123` for the demo mentor users.

3. **Better Auth Instance (`lib/auth.ts`) & Password Utility (`lib/auth/password.ts`)**:
   - In `lib/auth/password.ts`, export `hashPassword(password)` and `verifyPassword(password, hash)` using `bcryptjs`.
   - In `lib/auth.ts`, configure `betterAuth` using `prismaAdapter(prisma, { provider: "postgresql" })` with model mappings:
     - user -> User, session -> Session, account -> Account, verification -> Verification.
     - `advanced: { database: { generateId: "uuid" } }`.
     - Custom credential password functions pointing to `lib/auth/password.ts`.
     - Plugin `nextCookies()` from `better-auth/next-js`.
   - In `app/api/auth/[...all]/route.ts`, export `{ GET, POST }` from `toNextJsHandler(auth)`.

4. **Server Actions (`lib/actions/auth.ts`)**:
   - Export `signUp`, `signIn`, and `signOut` actions.
   - Validate inputs with Zod (name min 2, email valid, password min 8 with letters, numbers, and symbols).
   - Return structured state `{ error?: string; success?: boolean }`.
   - On successful login/signup, redirect to `/dashboard`.

5. **Client Auth Forms**:
   - `components/auth/signup-form.tsx`: Form using React 19 `useActionState` with name, email, password fields, pending button state, and inline error banner.
   - `components/auth/login-form.tsx`: Form using `useActionState` with email and password fields, pending button state, and inline error banner.
   - Update `app/(auth)/signup/page.tsx` and `app/(auth)/login/page.tsx` to render the respective forms.

6. **Route Protection & Guards**:
   - `lib/auth/dal.ts`: Export React `cache`-wrapped `getSession()`, `requireUser()` (redirects to `/login`), and `requireMentorProfile()` (redirects to `/profile?setup=1`).
   - `proxy.ts`: Optimistic redirect for unauthenticated visitors trying to access `/dashboard`, `/profile`, or `/inbox` to `/login`.
   - `app/(auth)/layout.tsx`: DB-validated redirect: if `getSession()` returns a valid session, redirect the user to `/dashboard` (prevents infinite redirect loops).
   - `app/dashboard/layout.tsx` and `app/(mentor)/layout.tsx`: Enforce `requireUser()`.
   - Update `components/layout/nav.tsx` to display user name and sign-out form when authenticated vs sign-in/get-started links when anonymous.

### Acceptance Criteria
1. Submitting the signup form creates a new user, password account, session row in PostgreSQL, and redirects to `/dashboard`.
2. Existing seeded demo mentors (e.g. `priya@example.com` / `password123`) can log in.
3. Unauthenticated access to `/dashboard` redirects to `/login`.
4. Authenticated users visiting `/login` or `/signup` are redirected to `/dashboard`.
5. Signing out destroys the session row in PostgreSQL and updates navigation.
```

---

## 🛠️ Recovery / Diagnostic Prompt

```text
We are trying to reach Checkpoint 03 (Authentication & Route Protection with Better Auth).

Expected state:
- Better Auth is configured with database sessions and custom bcrypt password hasher.
- prisma/schema.prisma includes User, Account, Session, and Verification models with UUID PKs and RESTRICT FKs.
- lib/actions/auth.ts exports signUp, signIn, signOut.
- app/(auth)/signup/page.tsx and app/(auth)/login/page.tsx render interactive forms using useActionState.
- lib/auth/dal.ts provides getSession() and requireUser().
- Unauthenticated /dashboard redirects to /login; authenticated /login redirects to /dashboard without redirect loops.

Inspect the current implementation:
1. Check lib/auth.ts configuration for model mappings and UUID generation.
2. Check app/api/auth/[...all]/route.ts for correct GET/POST exports.
3. Check app/(auth)/layout.tsx to verify signed-in users are redirected based on getSession() rather than raw middleware cookies.
4. Verify why signup or login might be failing.
5. Fix only what is necessary to reach the expected state.
6. Verify by signing up a test user, logging in with priya@example.com, and testing protected route redirects.
```
