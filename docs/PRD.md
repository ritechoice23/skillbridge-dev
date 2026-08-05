# SkillBridge — Product Requirements Document (PRD)

| Field | Value |
|---|---|
| Product | SkillBridge |
| Version | 0.1 (MVP) |
| Status | Draft |
| Date | 2026-08-05 |
| Platform | Web |

---

## 1. Overview

SkillBridge is a simple web application that helps learners discover mentors
for practical skills and send a mentorship request. Mentors maintain real
profiles, and requests land in an in-app inbox that mentors respond to
(accept / decline).

## 2. Problem Statement

People who want to learn a practical skill often don't know who to learn from
or how to reach out. SkillBridge connects learners to mentors — real people
with verified profiles — and makes the first step (sending a mentorship
request) easy and structured.

## 3. Goals

- Let learners browse and search a directory of mentors by skill.
- Let learners view a mentor's profile (bio, skills, experience).
- Let learners send a mentorship request with a message to a mentor.
- Let mentors create and manage their own public profile.
- Let mentors see incoming requests in an inbox and accept or decline them.
- Let learners track the status of their sent requests.

## 4. Non-Goals (explicitly out of scope for MVP)

- Payments, subscriptions, or paid mentorship.
- Scheduling / calendar booking.
- Ratings and reviews.
- Messaging/chat beyond the initial request.
- Admin panel.
- Mobile apps (responsive web only).
- Email notifications.

## 5. Personas

### 5.1 Alex (learner)
Wants to learn a practical skill (e.g. web development, public speaking,
graphic design). Needs to find someone credible, see what they offer, and
reach out without friction.

### 5.2 Priya (mentor)
Has practical experience in one or more skills. Wants to help others, show
her expertise, and manage which requests she responds to.

### 5.3 Role model (both roles, one account)
There is no fixed role. Any authenticated user can send mentorship requests
(act as a learner) and, at the same time, create a public mentor profile to
be discovered and receive requests (act as a mentor). A learner to one
person can be a mentor to another. Being a mentor is derived from having a
public profile — not from a sign-up choice.

## 6. User Stories

| ID | As a… | I want to… | So that… |
|---|---|---|---|
| US-01 | user | create an account (email + password) and log in | my identity is recognised across both roles |
| US-02 | user | create and edit a public mentor profile (bio, years of experience, skills) | learners can find and evaluate me — without choosing a role at sign-up |
| US-03 | learner | browse the mentor directory | discover mentors |
| US-04 | learner | search and filter mentors by skill | find mentors for the skill I want to learn |
| US-05 | learner | view a mentor's public profile | decide whether to reach out |
| US-06 | learner | send a mentorship request with a message and a focus skill | start a mentorship conversation |
| US-07 | mentor | view incoming requests in an inbox | respond to learners |
| US-08 | mentor | accept or decline a request | control my time |
| US-09 | learner | see the status (pending / accepted / declined) of my requests | know where I stand |

## 7. Functional Requirements

### 7.1 Authentication (FR-AUTH)
- FR-AUTH-1: Email + password sign-up and login (sessions).
- FR-AUTH-2: No role at sign-up. Every authenticated user can send
  mentorship requests (learner behaviour) and can become a mentor at any
  time by creating a public mentor profile.
- FR-AUTH-3: Protected routes require login: dashboard, mentor profile
  editing, and mentor inbox. Mentor routes additionally require the user to
  have a mentor profile; a user without one is guided to create it.
- FR-AUTH-4: A user must not modify or access another user's requests or
  profile.

### 7.2 Mentor Discovery (FR-DISCOVERY)
- FR-DISCOVERY-1: Public mentor directory listing all mentors with profiles.
- FR-DISCOVERY-2: Search by free text (name/bio) and filter by skill.
- FR-DISCOVERY-3: Public mentor profile page: bio, years of
  experience, skills.

### 7.3 Mentorship Requests (FR-REQUEST)
- FR-REQUEST-1: A logged-in user can send a request to a mentor: message
  (required, max length enforced) and focus skill (optional).
- FR-REQUEST-2: A user cannot send a request to the same mentor twice for
  the same focus skill while a request is pending.
- FR-REQUEST-3: Requests are stored in the database and appear in the
  mentor's inbox with the requester's details.
- FR-REQUEST-4: Mentor can accept or decline; requester sees the updated
  status. Statuses: `pending`, `accepted`, `declined`.

### 7.4 Mentor Profile Management (FR-PROFILE)
- FR-PROFILE-1: Any user can create a mentor profile (bio, years
  of experience, and skills from the shared catalog), making them
  discoverable as a mentor.
- FR-PROFILE-2: Only the owning user can edit their profile.

## 8. Non-Functional Requirements

- **Responsiveness:** usable on mobile and desktop.
- **Accessibility:** semantic HTML, focus states, sufficient contrast.
- **Performance:** mentor directory pages render quickly; index the queries
  they rely on; no N+1 queries.
- **Security:** password hashing, authorization checks on every mutating
  action, no exposure of sensitive attributes, validation on all inputs.
- **Data integrity:** all writes that touch multiple records run in
  transactions; deletions are handled explicitly (no cascades).

## 9. Data Model Overview

PostgreSQL database with the following application-owned tables (full design
in `docs/BUILD_PLAN.md` — Database Design):

- `users` — accounts. No fixed role: any user can send requests and can
  create a mentor profile to be discovered.
- `mentor_profiles` — one per mentor user.
- `skills` — shared skill catalog.
- `mentor_skills` — which skills a mentor offers.
- `mentorship_requests` — learner → mentor requests with status.

## 10. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, TypeScript, Tailwind CSS v4 |
| Database | PostgreSQL (via local EnvKit stack) |
| ORM | Prisma |
| Auth | Auth.js (email + password) |
| Validation | Zod |

## 11. Success Metrics (MVP)

- A learner can go from sign-up to sending a request in under 5 minutes.
- No broken flows in the request lifecycle (send → pending → accept/decline).
- Mentor inbox shows the correct requests to the correct mentor only.

## 12. Open Questions

- Should requests auto-expire if unanswered for N days?
- Skill catalog: seeded fixed list for MVP; management later.
- Should the mentor profile creation flow be a guided onboarding wizard
  after sign-up, or a standalone "Become a mentor" page?
- Resolved: no fixed roles — one account plays both learner and mentor
  (see 5.3).
