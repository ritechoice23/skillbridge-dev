# SkillBridge AI-Assisted Development Bootcamp — Teaching System

Welcome to the **SkillBridge** teaching system. This folder contains the complete curriculum, development checkpoints, and AI prompts designed for a hands-on, AI-assisted full-stack development bootcamp.

---

## 🎯 Purpose & Methodology

The goal of this bootcamp is to guide beginner-to-intermediate developers through building a complete, production-ready web application (**SkillBridge**) using modern tools (Next.js 16 App Router, React 19, TypeScript, PostgreSQL, Prisma 7, Better Auth, and shadcn/ui) with AI coding assistants (such as Claude Code, Cursor, Copilot Workspace, Antigravity, or OpenCode).

### The Checkpoint Synchronization Model

When students build with AI, variations naturally occur between different AI coding models or runs. To prevent compounding errors and keep the classroom aligned, the curriculum is structured around **synchronization checkpoints**:

```text
[ Checkpoint N ] ──( Student uses AI Prompt N+1 )──> [ Student Implementation ]
                                                              │
                                                ( If divergence or issues )
                                                              │
                                                              ▼
                                                 [ Sync to Instructor Git Tag ]
                                                              │
                                                              ▼
                                                      [ Checkpoint N+1 ]
```

1. **Working Milestone**: Each checkpoint represents a verified, working state of the application.
2. **AI-Driven Transition**: Students use carefully crafted **Teaching Prompts** to direct their AI coding agent to implement the next milestone.
3. **Deterministic Constraints**: Prompts are engineered with strict constraints, architectural guardrails, and non-destructive inspection rules to minimize AI variation.
4. **Recovery Prompts**: If an agent produces broken or divergent code, students can use the accompanying **Recovery Prompt** to diagnose and repair the issue without starting over.
5. **Git Synchronization**: If a student is completely stuck, they can check out the instructor's verified Git checkpoint tag for that milestone and continue smoothly with the class.

---

## 📂 Folder Structure

```text
docs/bootcamp/
├── README.md                          # This guide
├── CHECKPOINTS.md                     # Roadmap of all 8 checkpoints at a glance
├── checkpoints/
│   ├── checkpoint-01-foundation.md    # Checkpoint 1: Project Foundation & Layout Shell
│   ├── checkpoint-02-database.md      # Checkpoint 2: PostgreSQL Database & Prisma ORM
│   ├── checkpoint-03-auth.md          # Checkpoint 3: Authentication & Route Protection
│   ├── checkpoint-04-discovery.md     # Checkpoint 4: Public Mentor Discovery & Directory
│   ├── checkpoint-05-requests.md      # Checkpoint 5: Mentorship Requests & Requester Dashboard
│   ├── checkpoint-06-mentor-side.md   # Checkpoint 6: Mentor Profile Management & Inbox
│   ├── checkpoint-07-notifications.md # Checkpoint 7: Database-Driven Notifications System
│   └── checkpoint-08-production.md    # Checkpoint 8: Production Polish, SEO & Deployment
└── prompts/
    ├── checkpoint-01-to-02.md         # Prompt: Database & Prisma ORM
    ├── checkpoint-02-to-03.md         # Prompt: Better Auth & Route Protection
    ├── checkpoint-03-to-04.md         # Prompt: Mentor Discovery Directory & Profile
    ├── checkpoint-04-to-05.md         # Prompt: Mentorship Requests & Dashboard
    ├── checkpoint-05-to-06.md         # Prompt: Mentor Profile & Inbox Management
    ├── checkpoint-06-to-07.md         # Prompt: In-App Notifications
    ├── checkpoint-07-to-08.md         # Prompt: Production Polish, SEO & Deployment
    └── amendment.md                   # Utility alignment prompts (Database/DBngin, Better Auth)
```

---

## 🚀 Instructor Workflow During Class

1. **Concept Introduction (5–10 mins)**: Give a brief conceptual walkthrough of the upcoming milestone (e.g., explaining why database sessions were chosen over stateless JWTs, or how join tables model M:N relationships).
2. **Issue the Primary AI Prompt**: Have students copy the exact transition prompt from `docs/bootcamp/prompts/` and submit it to their coding agent.
3. **Inspection & Code Review**: Guide students to inspect the changes made by the AI agent rather than blindly accepting them.
4. **Run Verification Steps**: Students run the verification checklist provided in the checkpoint document.
5. **Handle Divergence**:
   - Minor errors: Provide the **Recovery Prompt** to the AI agent.
   - Irrecoverable divergence / time limit reached: Have the student run `git stash` and `git checkout checkpoint-XX-<name>` to synchronize with the instructor reference tag.

---

## 🛡️ Core Architectural Rules Enforced Throughout

- **Next.js 16 App Router**: Server Components by default; `"use client"` only at interactivity boundaries.
- **Database Principles**: PostgreSQL with UUID primary keys (`gen_random_uuid()`), restrictive foreign keys (`onDelete: Restrict`, `onUpdate: NoAction`), no cascade deletes, and forward-only immutable migrations.
- **Open Role Model**: No rigid `role` column on the user table. Every user can send mentorship requests (learner behavior), and any user who creates a mentor profile becomes discoverable and receives requests (mentor behavior).
- **Separation of Concerns**: Database queries and mutations live in `lib/actions/` modules; page components remain lean; authentication helpers reside in `lib/auth/dal.ts`.
