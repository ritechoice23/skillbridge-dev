# Amendment Prompts

This file contains utility prompts that bootcamp participants can copy and use whenever they need to align, migrate, or repair their local project setup without rewriting unrelated code.

---

## 1. Database & Prisma Alignment Prompt

Use this prompt if you need to align your local database configuration, migrate from SQLite to PostgreSQL (e.g. running via DBngin or local Postgres), or ensure Prisma connects properly to PostgreSQL.

```text
Inspect the existing Next.js project before making any changes.

We want this project to use Prisma with PostgreSQL. PostgreSQL is running locally using DBngin.

Please:

1. Inspect the existing Prisma and database setup first.
2. If Prisma is already using PostgreSQL correctly, keep it.
3. If PostgreSQL is configured differently, align it with the existing/reference project structure.
4. If the project is using SQLite, migrate it to PostgreSQL.
5. Preserve all existing Prisma models and relationships.
6. Configure Prisma to use DATABASE_URL from the environment.
7. Do not create duplicate Prisma clients or database configurations.
8. Keep the existing project structure and do not change unrelated code.
9. Generate the Prisma client and create/apply the required migration.
10. Verify that the application can connect to PostgreSQL.

If anything already exists, remove it and align it with what we have on the online git repository.

Tell me only the environment values I need to provide manually.
```

---

## 2. Better Auth & Prisma Alignment Prompt

Use this prompt if you need to align or install Better Auth with your existing Prisma and PostgreSQL database, preserving your existing user fields and routes without touching UI components.

```text
Inspect the existing Next.js project before making any changes.

We want this project to use Better Auth with the existing Prisma and PostgreSQL setup.

Please:

1. Check whether Better Auth or another authentication setup already exists.
2. If Better Auth already exists, reuse it and align it with the reference/existing project structure instead of creating another implementation.
3. If Better Auth is missing, add it.
4. Configure Better Auth using the Prisma adapter and PostgreSQL.
5. Support email and password authentication.
6. Align the auth configuration, auth client, Next.js auth API route, Prisma auth models, and environment variables.
7. Do not create duplicate auth clients, routes, Prisma clients, or authentication systems.
8. Preserve existing application-specific User fields and relationships where possible.
9. Keep the existing project structure and do not change unrelated code.
10. Verify that Better Auth, Prisma, and PostgreSQL work together correctly.

Do not build or redesign the login/signup UI yet.

If anything already exists, remove it and align it with what we have on the online git repository.

Tell me only the environment values I need to provide manually.
```
