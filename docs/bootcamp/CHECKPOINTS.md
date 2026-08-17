# SkillBridge — Checkpoints Roadmap

This document provides a birds-eye overview of the 8 development checkpoints that take students from an initial Next.js application to the complete production-grade **SkillBridge** platform.

---

## 🗺️ Roadmap at a Glance

```text
01. Project Foundation & Layout Shell
        ↓  (Prompt: prompts/checkpoint-01-to-02.md)
02. PostgreSQL Database & Prisma ORM
        ↓  (Prompt: prompts/checkpoint-02-to-03.md)
03. Authentication & Route Protection (Better Auth)
        ↓  (Prompt: prompts/checkpoint-03-to-04.md)
04. Public Mentor Discovery & Directory
        ↓  (Prompt: prompts/checkpoint-04-to-05.md)
05. Mentorship Requests & Requester Dashboard
        ↓  (Prompt: prompts/checkpoint-05-to-06.md)
06. Mentor Profile Management & Inbox
        ↓  (Prompt: prompts/checkpoint-06-to-07.md)
07. Database-Driven Notifications System
        ↓  (Prompt: prompts/checkpoint-07-to-08.md)
08. Production Polish, SEO & Deployment
```

---

## 📋 Checkpoint Summary Table

| Checkpoint | Goal / Core Outcome | Important Concepts | Git Tag / Commit | Documentation & Prompt |
|---|---|---|---|---|
| **01. Project Foundation** | Global navigation bar with mobile drawer, landing page hero and feature cards, landmark green theme tokens, 404 page, and 7 placeholder route screens. | App Router structure, Server vs Client components, design tokens, UI primitives. | `checkpoint-01-project-foundation`<br>(`d213808`) | [checkpoint-01-foundation.md](checkpoints/checkpoint-01-foundation.md)<br>*(Starting State)* |
| **02. Database & Prisma** | PostgreSQL schema with 5 relational models, UUID primary keys, cascade-safe foreign keys, singleton Prisma client, and seed script loading 12 skills and 4 demo mentors. | Relational modeling, UUID primary keys, cascade-free data integrity, database seeding. | `checkpoint-02-postgresql-prisma`<br>(`754ff5f`) | [checkpoint-02-database.md](checkpoints/checkpoint-02-database.md)<br>[prompt-01-to-02](prompts/checkpoint-01-to-02.md) |
| **03. Authentication** | Complete email & password sign-up and login forms, revocable database session engine, custom bcrypt password hasher, server-side route guards, and dynamic navigation. | Session-based auth vs stateless JWT, password hashing, Server Actions, React 19 action states, route protection. | `checkpoint-03-authentication`<br>(`8390f00`) | [checkpoint-03-auth.md](checkpoints/checkpoint-03-auth.md)<br>[prompt-02-to-03](prompts/checkpoint-02-to-03.md) |
| **04. Mentor Discovery** | Public mentor directory grid, mentor cards with experience and skill badges, URL-driven keyword and skill filter form, empty state screen, and detailed mentor profile page. | Eager loading, URL query state as single source of truth, progressive enhancement, dynamic routes. | `checkpoint-04-mentor-discovery`<br>(`c6c2729`) | [checkpoint-04-discovery.md](checkpoints/checkpoint-04-discovery.md)<br>[prompt-03-to-04](prompts/checkpoint-03-to-04.md) |
| **05. Mentorship Requests** | Multi-skill request form on mentor profile, multi-skill join table, transaction-safe validation rules (self-request and duplicate prevention), and personal requester dashboard with status badges. | M:N join tables, database transactions (`$transaction`), form validation, status state machines. | Reconstructed<br>(`c5a7c04`) | [checkpoint-05-requests.md](checkpoints/checkpoint-05-requests.md)<br>[prompt-04-to-05](prompts/checkpoint-04-to-05.md) |
| **06. Mentor Profile & Inbox** | Mentor profile creation and editing form, mentor request review inbox, race-safe Accept/Decline action buttons, and dynamic navigation showing the Inbox tab for active mentors. | Derived role authorization, optimistic concurrency guards (`updateMany` count check), atomic replacement of relations. | `checkpoint-06-mentor-profile-inbox`<br>(`c5a7c04`) | [checkpoint-06-mentor-side.md](checkpoints/checkpoint-06-mentor-side.md)<br>[prompt-05-to-06](prompts/checkpoint-05-to-06.md) |
| **07. In-App Notifications** | Database notifications table, automatic transactional notification triggers on request creation/decisions, dedicated notifications screen with mark-as-read row clicks, and navigation bell with unread badge counter. | In-app notification architecture, atomic event writes inside mutations, unread badge counters. | `checkpoint-07-notifications`<br>(`d7fe192`) | [checkpoint-07-notifications.md](checkpoints/checkpoint-07-notifications.md)<br>[prompt-06-to-07](prompts/checkpoint-06-to-07.md) |
| **08. Production & Deployment** | Custom brand SVG icon/favicon, global runtime error boundary, OpenGraph and SEO metadata (sitemap and robots), automated deployment migrations script, and `.env.example`. | Error boundaries, SEO & metadata generation, production build pipelines, environment configurations. | `checkpoint-08-production-deploy`<br>(`3ac21ea`) | [checkpoint-08-production.md](checkpoints/checkpoint-08-production.md)<br>[prompt-07-to-08](prompts/checkpoint-07-to-08.md) |
