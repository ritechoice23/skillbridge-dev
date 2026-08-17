# Checkpoint 03: Authentication & Session Management (Better Auth)

## Goal

Implement email and password authentication with revocable database sessions using Better Auth 1.6.26, bcrypt password hashing, Zod-validated Server Actions, interactive signup/login forms with React 19 `useActionState`, server-side route guards, and dynamic navigation.

## Prompt

```text
Inspect the existing Next.js project before making any changes.

We want to integrate Better Auth (v1.6.26) for email and password authentication with database sessions, password hashing, interactive signup/login forms, and route protection.

Please follow these guidelines:
1. Inspect the existing Prisma schema, auth setup, and routes first.
2. Install dependencies: better-auth@1.6.26, zod, bcryptjs, and @types/bcryptjs.
3. Add shadcn/ui input and label components.
4. Update prisma/schema.prisma with Better Auth models:
   - User: add emailVerified (Boolean default false), image (String nullable). (Do not store password hashes on User).
   - Account (mapped to "accounts"): id (UUID PK), accountId (String), providerId (String), userId (UUID FK -> users(id) RESTRICT/NO ACTION), password (String nullable), timestamps.
   - Session (mapped to "sessions"): id (UUID PK), token (String unique), userId (UUID FK -> users(id) RESTRICT/NO ACTION), ipAddress (String nullable), userAgent (String nullable), expiresAt (DateTime), timestamps.
   - Verification (mapped to "verifications"): id (UUID PK), identifier (String), value (String), expiresAt (DateTime), timestamps.
   - Generate and apply a forward-only migration.
   - Update prisma/seed.ts to create credential accounts (password: bcrypt hash of "password123") for all 4 demo mentors.
5. Create password hashing utility in lib/auth/password.ts with hashPassword and verifyPassword using bcryptjs.
6. Configure the Better Auth instance in lib/auth.ts:
   - Use prismaAdapter(prisma, { provider: "postgresql" }) with model mappings (user: "User", session: "Session", account: "Account", verification: "Verification").
   - Set advanced: { database: { generateId: "uuid" } }.
   - Wire custom credential password hasher functions to lib/auth/password.ts.
   - Add nextCookies() plugin.
7. Mount the API route in app/api/auth/[...all]/route.ts using toNextJsHandler(auth).
8. Create Server Actions in lib/actions/auth.ts:
   - Export signUp, signIn, and signOut actions with Zod validation.
   - Return structured state { error?: string; success?: boolean }.
   - On successful signup or login, redirect to /dashboard.
9. Create interactive client forms using React 19 useActionState:
   - components/auth/signup-form.tsx (name, email, password, inline errors, submit button with pending state).
   - components/auth/login-form.tsx (email, password, inline errors, submit button with pending state).
   - Update app/(auth)/signup/page.tsx and app/(auth)/login/page.tsx to render the forms.
10. Build Route Protection and DAL guards:
    - Create lib/auth/dal.ts with getSession() (React cache), requireUser() (redirects to /login), and requireMentorProfile() (redirects to /profile?setup=1).
    - Create proxy.ts with optimistic redirect for unauthenticated users accessing /dashboard, /profile, /inbox to /login.
    - In app/(auth)/layout.tsx, check getSession() and redirect authenticated users to /dashboard (preventing infinite redirect loops).
    - Protect app/dashboard/layout.tsx and app/(mentor)/layout.tsx using requireUser().
11. Update components/layout/nav.tsx to show user name and a "Sign Out" button when logged in, or "Sign In" / "Get Started" links when logged out.

Verify that signing up creates a database session, demo mentors (priya@example.com / password123) can sign in, and unauthenticated visitors cannot access /dashboard.
```

## Recovery and Alignment Prompt

```text
We are trying to align the project with Checkpoint 03 (Authentication & Route Protection).

Expected state:
- Better Auth 1.6.26 configured with database sessions in lib/auth.ts.
- prisma/schema.prisma contains User, Account, Session, and Verification models.
- lib/actions/auth.ts exports signUp, signIn, and signOut actions.
- /signup and /login render interactive forms using useActionState.
- lib/auth/dal.ts provides getSession() and requireUser().
- Unauthenticated access to /dashboard redirects to /login. Authenticated visits to /login redirect to /dashboard without loops.

Inspect the project, fix any Better Auth config, route handler, or DAL guard issues, and verify by testing signup, login, and protected routes.
```

## Quick Verification

1. Go to `http://localhost:3000/signup` — create an account (`learner@test.com` / `Password123!`) and confirm redirect to `/dashboard`.
2. Check `npx prisma studio` — verify a new row in `users`, `accounts`, and `sessions`.
3. Open an Incognito window and visit `http://localhost:3000/dashboard` — confirm redirect to `/login`.
4. Log in as demo mentor `priya@example.com` / `password123` — confirm successful login.
5. Click "Sign Out" in the navigation bar — confirm session is destroyed.
