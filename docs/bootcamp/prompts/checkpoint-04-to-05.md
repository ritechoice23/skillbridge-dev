# Transition Prompt: Checkpoint 04 → Checkpoint 05

| Transition | From Checkpoint 04 to Checkpoint 05 |
|---|---|
| **Goal** | Implement the learner outreach lifecycle: multi-skill mentorship request submission on `/mentors/[id]`, database join table, transaction-safe validation rules, and the personalized requester `/dashboard`. |
| **Reference Tag** | Reconstructed (`c5a7c04` part 1) |

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
Build the mentorship request submission flow and requester dashboard. Learners should be able to select multiple skills, write a message, submit a request to a mentor with transactional business logic validation, and track their requests on `/dashboard`.

### Current State
- Checkpoint 04 completed with working public mentor directory and profile pages.
- `RequestCta` shows a placeholder for logged-in users, and `/dashboard` is a placeholder.

### Desired State
1. **Database Schema Update for Multi-Skill Requests**:
   - Add `MentorshipRequestSkill` model in `prisma/schema.prisma`:
     - Mapped to `mentorship_request_skills`
     - `id`: UUID PK default `gen_random_uuid()`
     - `requestId`: UUID FK -> mentorship_requests(id) with `onDelete: Restrict, onUpdate: NoAction`
     - `skillId`: UUID FK -> skills(id) with `onDelete: Restrict, onUpdate: NoAction`
     - `createdAt`: DateTime @default(now()) @db.Timestamptz(6)
     - `@@unique([requestId, skillId])`
     - `@@index([skillId])`
   - In `MentorshipRequest`, add relation `skills MentorshipRequestSkill[]`. (If an old single `skillId` column exists on MentorshipRequest, remove it).
   - Generate and apply a forward-only database migration.

2. **Validation Schema (`lib/validation/request.ts`)**:
   - Create Zod validation for mentorship requests:
     - `mentorProfileId`: UUID string.
     - `message`: String, trimmed, min 1, max 2000 characters.
     - `skillIds`: Array of UUID strings (allow empty/optional).

3. **Request Server Action (`lib/actions/requests.ts`)**:
   - Implement `createMentorshipRequest(prevState, formData)`.
   - Read `mentorProfileId`, `message`, and all `skillIds` (using `formData.getAll("skillIds")`).
   - Validate inputs with Zod.
   - Enforce the following business rules inside an interactive database transaction (`prisma.$transaction`):
     - **Auth**: User must be authenticated (`requireUser()`).
     - **Mentor Exists**: Verify `mentorProfileId` exists and load its `userId` and offered skills.
     - **Self-Mentorship Block**: If `mentorProfile.userId === session.user.id`, reject with: *"You cannot request mentorship from yourself."*
     - **Skill Offering Verification**: If `skillIds` are provided, verify every submitted skill ID is currently offered by this mentor.
     - **Duplicate Pending Prevention**: Query existing requests with `status: "pending"` from this requester to this mentor profile. If any submitted skill is already in a pending request, reject with: *"You already have a pending request for [Skill Name] with this mentor."*
     - **Atomic Insert**: Create the `mentorship_requests` row (`status: "pending"`) and insert rows into `mentorship_request_skills` for each selected skill.
   - Return `{ success: true }` or `{ error: string }`.

4. **Client Request Form Component (`components/request-form.tsx`)**:
   - Client component using `useActionState(createMentorshipRequest, null)`.
   - Message textarea (add shadcn `textarea` component if not present).
   - Multi-select skill chips using native checkboxes (`name="skillIds"`, `value={skill.id}`) with clear label text displaying the skill name (never raw UUIDs).
   - Submit button showing pending state during submission.
   - Display inline error banner on failure.
   - On success, replace the form with a success message and a link to `/dashboard`.
   - Update `components/request-cta.tsx` and `app/mentors/[id]/page.tsx` to render `RequestForm` for authenticated users.

5. **Requester Dashboard (`app/dashboard/page.tsx`)**:
   - Move dashboard query logic to `lib/actions/dashboard.ts` (e.g. `getMyRequests(userId)`).
   - Ensure the query enforces `requireUser()` and filters strictly by `requesterId: session.user.id`.
   - Eager-load mentor user name and requested skills.
   - Display a greeting with the user's name.
   - Render request cards showing mentor name, formatted date, message excerpt, skill badges, and dynamic status badges:
     - `pending`: Secondary muted badge.
     - `accepted`: Success green badge.
     - `declined`: Destructive red badge.
   - For decided requests, display the decision date (`decidedAt`).
   - If user has no requests, display an empty state with a "Find a mentor" button linking to `/mentors`.

### Acceptance Criteria
1. Submitting the request form on `/mentors/[id]` creates a `pending` request in PostgreSQL with associated skill join records.
2. Learners can select zero, one, or multiple skills.
3. Attempting to request mentorship from oneself is blocked.
4. Sending a duplicate pending request for the same skill returns a descriptive error naming the skill.
5. `/dashboard` displays only the authenticated user's requests with proper status badges and timestamps.
```

---

## 🛠️ Recovery / Diagnostic Prompt

```text
We are trying to reach Checkpoint 05 (Mentorship Requests & Requester Dashboard).

Expected state:
- prisma/schema.prisma contains the MentorshipRequestSkill model with unique pair constraint.
- lib/actions/requests.ts exports createMentorshipRequest with self-request and duplicate pending checks in a transaction.
- components/request-form.tsx renders message textarea and skill checkboxes with name labels.
- app/mentors/[id]/page.tsx renders RequestForm for authenticated users.
- app/dashboard/page.tsx lists the user's sent requests with status badges.

Inspect the current implementation:
1. Verify prisma/schema.prisma and run prisma generate if the new join table model was added.
2. Check lib/actions/requests.ts: ensure formData.getAll("skillIds") correctly collects multiple checkbox values.
3. Check duplicate validation: ensure pending duplicate checks query through mentorship_request_skills.
4. Verify components/request-form.tsx displays skill names as labels, not UUIDs.
5. Check app/dashboard/page.tsx to ensure requireUser() is called and requests are filtered by session user ID.
6. Fix any issues and verify by submitting a request as a learner and viewing it in /dashboard.
```
