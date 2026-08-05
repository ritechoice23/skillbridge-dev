# SkillBridge — Authentication & Session Handling

Technical reference for how authentication and sessions work in SkillBridge.
Companion to `BUILD_PLAN.md` (step 2.1/2.2). Read this before touching auth
code.

**Stack:** Better Auth 1.6.26 (Prisma adapter, PostgreSQL), bcryptjs, Zod v4,
Next.js 16 (server actions + proxy).

**One sentence:** Better Auth handles the protocol (sign-up/sign-in/sign-out,
cookies, CSRF), stores sessions in PostgreSQL (`sessions` table) instead of
stateless JWTs, hashes passwords with bcryptjs into `accounts.password`
(never on `users`), and the app wraps it in typed server actions, a
server-side DAL for guards, and an edge proxy for optimistic redirects.

---

## Architecture overview

```
 Browser                             Next.js                                  PostgreSQL
─────────                         ───────────                               ──────────
<form> ──POST──▶ server action ──▶ auth.api.signUpEmail/signInEmail ──▶ users (+1 row)
            (useActionState)        │                                        accounts (bcrypt hash)
                                    │                                        sessions (+1 row)
                                    ▼
                             Set-Cookie: better-auth.session_token
                                    │
 /dashboard ──▶ proxy.ts ──▶ cookie present? ──no──▶ 307 /login
                     │            yes
                     ▼
              dashboard layout ──▶ requireUser() ──▶ getSession()
                                                        │
                                    better-auth.session_token ─▶ verify signature
                                                                  (BETTER_AUTH_SECRET)
                                                                  ▼
                                                              sessions lookup + expiresAt
                                                                  ▼
                                                              { session, user } | null
```

Two protection layers:

1. **Edge proxy (optimistic)** — `proxy.ts` checks only cookie *presence*
   (no DB). Fast, but not authoritative.
2. **Server-side DAL (authoritative)** — layouts/pages call
   `requireUser()` / `requireMentorProfile()`, which resolve the session
   against the database. The proxy can be bypassed; this cannot.

---

## 1. Core instance — `lib/auth.ts`

```ts
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),   // :8
  emailAndPassword: {
    enabled: true,
    password: { hash: hashPassword, verify: verifyPassword },    // :9-15
  },
  user: { modelName: "User" },                                   // :16-19
  session: { modelName: "Session" },
  account: { modelName: "Account" },
  verification: { modelName: "Verification" },
  advanced: { database: { generateId: "uuid" } },                // :20-22
  plugins: [nextCookies()],                                      // :23
});
```

| Config | Purpose |
|---|---|
| `:8` | Persistence through our Prisma client (`lib/db.ts`). |
| `:9-15` | Email+password enabled with **custom** bcrypt `hash`/`verify` — Better Auth never stores or compares plain text. |
| `:16-19` | Maps Better Auth concepts to our models/tables (`users`, `sessions`, `accounts`, `verifications`). |
| `:20-22` | IDs generated as UUIDs (database principle: UUID PKs everywhere). |
| `:23` | `nextCookies()` auto-applies `Set-Cookie` on API responses *and* server actions. |

Requires `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` in `.env` (see
[Configuration](#configuration)).

## 2. Password hashing — `lib/auth/password.ts`

```ts
export function hashPassword(password)  { return bcrypt.hash(password, 10); }  // :3-5
export function verifyPassword({ hash, password })                             // :7-12
  { return bcrypt.compare(password, hash); }
```

- bcrypt cost 10.
- **One hasher for everything**: the same functions run at login time and in
  `prisma/seed.ts:3` / `:79`, so seeded demo passwords are guaranteed
  compatible with real sign-ins.

## 3. Database storage — `prisma/schema.prisma`

Sessions are **database-backed** (revocable, inspectable) — chosen over
stateless JWTs.

| Model | Table | Role |
|---|---|---|
| `User` (`:10-24`) | `users` | identity; `emailVerified`, `image`; **no password column** |
| `Account` (`:41-59`) | `accounts` | `providerId: "credential"` + `password` (bcrypt hash); token columns reserved for future OAuth |
| `Session` (`:26-39`) | `sessions` | `token` (unique, raw token half of the cookie), `userId`, `expiresAt`, `ipAddress`, `userAgent` |
| `Verification` (`:61-71`) | `verifications` | email-verification tokens (reserved) |

Rules honored: UUID PKs (`gen_random_uuid()`), every FK
`onDelete: Restrict, onUpdate: NoAction` — **no cascades**, so deleting a
user with live sessions fails (23503) until application code cleans up
explicitly.

## 4. HTTP API — `app/api/auth/[...all]/route.ts`

```ts
export const { GET, POST } = toNextJsHandler(auth);   // :4
```

Exposes Better Auth's REST endpoints:
`POST /api/auth/sign-up/email`, `POST /api/auth/sign-in/email`,
`POST /api/auth/sign-out`, `GET /api/auth/get-session`, … These are what
curl/API clients hit; the app's own forms use server actions instead.

## 5. Server actions — `lib/actions/auth.ts`

Forms never call the REST API directly; they invoke typed server actions:

```ts
export async function signUp(_prevState, formData) {                    // :39-66
  const parsed = signUpSchema.safeParse({ name, email, password });     // :43
  if (!parsed.success) return { error: firstIssue(parsed.error) };      // :49
  try {
    await auth.api.signUpEmail({ body: parsed.data, headers: await headers() });
  } catch (error) {
    if (error instanceof APIError && error.status === 422)              // :59
      return { error: "An account with this email already exists." };
    return { error: "Something went wrong. Please try again." };
  }
  redirect("/dashboard");                                               // :65
}
```

- **Validation (Zod v4)**: `z.email()` with trim/lowercase (`:11-14`);
  password policy 8-128 chars + letter + number + symbol (`:16-22`).
- **`auth.api.signUpEmail` / `signInEmail`** (`:54` / `:82`) do the whole
  transaction: `users` row → `accounts` row (bcrypt) → `sessions` row →
  cookie emission (via `nextCookies`).
- **Error mapping**: duplicate email → 422 (Better Auth status) →
  "already exists"; login failures collapse to one generic message
  (`:86-88`, no user enumeration).
- **`redirect()` after success** (`:65` `:90` `:95`) — progressive
  enhancement: works without JS; with JS `useActionState` handles it.

## 6. Forms — `components/auth/signup-form.tsx` / `login-form.tsx`

```tsx
const [state, formAction, pending] = useActionState(signUp, initialState);  // signup-form.tsx:12
<form action={formAction}>…</form>
{state.error ? <p role="alert">{state.error}</p> : null}                    // :50-54
```

`useActionState` binds the action, tracks `pending` (button label switches),
and renders returned errors inline. No client-side auth logic.

## 7. Reading sessions — `lib/auth/dal.ts`

```ts
export const getSession = cache(async () =>                              // :9-11
  auth.api.getSession({ headers: await headers() }));

export async function requireUser() {                                    // :13-19
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireMentorProfile() {                           // :21-30
  const session = await requireUser();
  const profile = await prisma.mentorProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) redirect("/profile?setup=1");
  return { session, profile };
}
```

- `auth.api.getSession`: read cookie → verify signature (`BETTER_AUTH_SECRET`)
  → `sessions` lookup → `expiresAt` check → `{ session, user } | null`.
- `cache()` (React) dedupes within a request — Nav + layout + page share one
  DB hit.
- `requireMentorProfile` implements **no-fixed-roles**: "is a mentor" =
  owns a `mentor_profiles` row, never a role flag.

## 8. Route protection

**Edge proxy — `proxy.ts` (optimistic):**

```ts
const hasSession = Boolean(getSessionCookie(request));                   // :11
if (isProtected && !hasSession) → 307 /login                             // :13-15
if (isAuthRoute && hasSession)   → 307 /dashboard                        // :17-19
```

- `getSessionCookie` (from `better-auth/cookies`) only parses the cookie —
  no DB, edge-safe.
- Protected: `/dashboard`, `/inbox`, `/profile`. Auth routes: `/login`,
  `/signup`.
- `config.matcher` (`:24-26`) excludes `/api`, `_next/*`, and image/static
  files.

**Server-side guards (authoritative):**

| File | Guard |
|---|---|
| `app/dashboard/layout.tsx:6` | `requireUser()` |
| `app/(mentor)/layout.tsx` | `requireUser()` |
| `app/(mentor)/inbox/page.tsx:10` | `requireMentorProfile()` |
| `app/(mentor)/profile/page.tsx` | `requireUser()` (+ `setup` param) |

## 9. Session-aware UI — `components/layout/nav.tsx`

```tsx
const session = await getSession();       // :17 (deduped by cache())
{user ? user.name + <form action={signOut}>…  // :50-60
      : Sign in / Get started links}          // :62-68
```

`signOut` (`lib/actions/auth.ts:93-96`) calls `auth.api.signOut`, which
**deletes the `sessions` row** and clears the cookie, then redirects `/`.

## 10. Session cookie mechanics

Observed (live test):

```
set-cookie: better-auth.session_token=<token>.<signature>;
            Max-Age=604800; Path=/; HttpOnly; SameSite=Lax
```

- `HttpOnly` — invisible to JS (XSS-resistant).
- `SameSite=Lax` + Better Auth's `Origin` check on mutating endpoints
  (verified: 400 without `Origin`) — CSRF-resistant.
- 7-day lifetime (`Max-Age` mirrors `sessions.expires_at`, created at
  sign-in +7d).
- Value = `<token>.<signature>`; only the raw `token` half is stored in
  `sessions` (visible in `get-session` output); the signature is verified
  with `BETTER_AUTH_SECRET` before any DB lookup is trusted.

## 11. Seed & demo accounts — `prisma/seed.ts`

- `DEMO_PASSWORD = "password123"` (`:23`); per mentor, a credential account
  is created via `hashPassword` (`:79`) → `tx.account.deleteMany` +
  `tx.account.create` (`:81-89`) inside the seed transaction (idempotent:
  rerunning replaces the hash — reruns keep counts stable at 4 users /
  4 profiles / 12 skills / 9 mentor_skills / 4 accounts).
- Demo logins: `priya@example.com`, `james@example.com`,
  `amara@example.com`, `tunde@example.com` / `password123`.

## 12. End-to-end flows (verified live)

| Flow | Path | Expected |
|---|---|---|
| Sign-up | POST form → `signUp` → `signUpEmail` | 200, `Set-Cookie`, `sessions` row |
| Duplicate email | `signUp` again | 422 → "An account with this email already exists." |
| Wrong password | `signIn` | 401 → "Invalid email or password." |
| Demo mentor login | `signIn` (bcrypt verify) | 200, session row |
| Protected page, no cookie | `proxy.ts` | 307 → `/login` |
| Auth route, cookie present | `proxy.ts` | 307 → `/dashboard` |
| Sign-out | `signOut` | 200, `sessions` row deleted, `get-session` → null |
| CSRF | mutation without `Origin` | 400 `MISSING_OR_NULL_ORIGIN` |
| FK restrict | delete user with live session | 23503 (no cascade) |

## Configuration

`.env` (gitignored):

```
DATABASE_URL=postgresql://postgres@127.0.0.1:5432/skillbridge
BETTER_AUTH_SECRET=<openssl rand -base64 32>
BETTER_AUTH_URL=http://localhost:3000
```

`BETTER_AUTH_URL` must match the host serving the app (a test server on
another port needs its own override). Env changes require a dev-server
restart.

## Testing notes

- Use a throwaway production server for API tests:
  `BETTER_AUTH_URL=http://localhost:3100 npx next start -p 3100` — the
  user's `next dev` on :3000 stays untouched (Next only blocks a second
  *dev* server).
- curl mutations need **both** `Content-Type: application/json` and an
  `Origin` header matching the host.
- DB inspection one-liner: `node -r dotenv/config -e "…pg query…"` (plain
  `node -e` does not load `.env`).
- After adding routes/layouts, run `npm run build` before `tsc --noEmit` —
  `tsc` reads stale `.next/dev/types` otherwise.
