# Checkpoint 05: Mentorship Request Flow & Learner Dashboard

## Goal

Build the learner mentorship request workflow: create the `mentorship_request_skills` join table in PostgreSQL, implement the interactive request form with multi-skill selection on `/mentors/[id]`, write the transaction-safe submission action with duplicate checks, and build the personalized requester `/dashboard`.

## Prompt

```text
Inspect the existing Next.js project before making any changes.

We want to build the mentorship request submission flow and personal learner dashboard for SkillBridge.

Please follow these guidelines:
1. Inspect the existing Prisma models (MentorshipRequest, Skill, MentorProfile, User) and request UI components first.
2. Update the Database Schema for Multi-Skill Requests (prisma/schema.prisma):
   - Add MentorshipRequestSkill model (mapped to "mentorship_request_skills"):
     - id: UUID PK default gen_random_uuid()
     - requestId: UUID FK -> mentorship_requests(id) with onDelete: Restrict, onUpdate: NoAction
     - skillId: UUID FK -> skills(id) with onDelete: Restrict, onUpdate: NoAction
     - createdAt: DateTime @default(now()) @db.Timestamptz(6)
     - @@unique([requestId, skillId])
     - @@index([skillId])
   - In MentorshipRequest, add relation skills MentorshipRequestSkill[]. (Remove single skillId from MentorshipRequest if present).
   - Generate and apply a forward-only migration.
3. Create Request Validation Schema in lib/validation/request.ts:
   - mentorProfileId: UUID string.
   - message: String, trimmed, min 1, max 2000 characters.
   - skillIds: Array of UUID strings (optional/empty allowed).
4. Create the Request Server Action (lib/actions/requests.ts):
   - Export createMentorshipRequest(prevState, formData).
   - Parse mentorProfileId, message, and skillIds (using formData.getAll("skillIds")).
   - Validate inputs with Zod.
   - Execute the following business logic inside an interactive transaction (prisma.$transaction):
     - Authenticate user via requireUser().
     - Verify mentorProfileId exists and retrieve mentor's userId and offered skills.
     - Block self-mentorship: if mentorProfile.userId === session.user.id, return error: "You cannot request mentorship from yourself."
     - Verify offered skills: ensure all submitted skillIds are currently offered by this mentor.
     - Check duplicate pending requests: query pending requests from this requester to this mentor. If any submitted skill is already in a pending request, return error: "You already have a pending request for [Skill Name] with this mentor."
     - Atomically insert the mentorship_requests row (status: "pending") and create join rows in mentorship_request_skills.
   - Return { success: true } or { error: string }.
5. Build the Client Request Form (components/request-form.tsx):
   - Client component using useActionState(createMentorshipRequest, null).
   - Message textarea (add shadcn textarea component if missing).
   - Multi-select skill chips using native checkboxes (name="skillIds", value={skill.id}) with clear skill name labels (never raw UUIDs).
   - Submit button with pending loading state and inline error banner.
   - On success, replace the form with a confirmation message and a button linking to /dashboard.
   - Update components/request-cta.tsx and app/mentors/[id]/page.tsx to render RequestForm for authenticated users.
6. Build the Learner Dashboard (app/dashboard/page.tsx):
   - Create query helper getMyRequests(userId) in lib/actions/dashboard.ts.
   - Enforce requireUser() and query requests where requesterId === session.user.id, sorted newest first.
   - Eager-load mentor user name and requested skills.
   - Display a greeting with user's name and list of request cards showing mentor name, submission date, message, and skill badges.
   - Render dynamic status badges: pending (gray), accepted (green), declined (red), and show decidedAt date for decided requests.
   - If empty, render an empty state card with a "Find a mentor" button linking to /mentors.

Verify that submitting a request creates records in PostgreSQL, duplicate pending requests are blocked, and sent requests display on /dashboard.
```

## Recovery and Alignment Prompt

```text
We are trying to align the project with Checkpoint 05 (Mentorship Requests & Requester Dashboard).

Expected state:
- prisma/schema.prisma includes MentorshipRequestSkill join table model.
- lib/actions/requests.ts exports createMentorshipRequest with self-request and duplicate pending checks in a transaction.
- components/request-form.tsx renders textarea and skill checkbox chips with name labels.
- app/mentors/[id]/page.tsx renders RequestForm for logged-in users.
- app/dashboard/page.tsx lists the user's sent requests with status badges.

Inspect the project, fix any transaction logic, FormData parsing, or dashboard query issues, and verify by sending a request and viewing it on /dashboard.
```

## Quick Verification

1. Log in as `learner@test.com`, open `/mentors`, and choose `Priya Sharma`.
2. Type a message, check 2 skills, and click "Send Request" — confirm success confirmation.
3. Open `http://localhost:3000/dashboard` — confirm the request appears with a `Pending` badge.
4. Try to submit another request to Priya with the same skill — confirm duplicate error: *"You already have a pending request for..."*.
5. Log in as `priya@example.com` and try to request mentorship from Priya's own profile — confirm self-request error.
