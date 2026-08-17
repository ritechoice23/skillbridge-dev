# Transition Prompt: Checkpoint 05 → Checkpoint 06

| Transition | From Checkpoint 05 to Checkpoint 06 |
|---|---|
| **Goal** | Implement the mentor side of the application: `/profile` management to create/edit public mentor profiles and skills, `/inbox` for mentors to review incoming requests, and race-safe Accept/Decline action handlers. |
| **Reference Tag** | `checkpoint-06-mentor-profile-inbox` |

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
Build the mentor experience: allow any authenticated user to create and edit their public mentor profile (`/profile`), and allow mentors to review incoming mentorship requests in their inbox (`/inbox`) and accept or decline them safely.

### Current State
- Checkpoint 05 completed with working mentorship request submission and requester dashboard.
- `/profile` and `/inbox` render placeholder components.

### Desired State
1. **Validation Schema for Mentor Profiles (`lib/validation/profile.ts`)**:
   - `bio`: String, trimmed, min 10, max 2000 characters.
   - `experienceYears`: Integer between 0 and 99. (Parse strictly from string regex `^\d+$` to prevent empty inputs silently coercing to 0).
   - `skillIds`: Array of UUID strings (min 1 skill).

2. **Profile Management Action (`lib/actions/profiles.ts`)**:
   - `getProfileEditor(userId)`: Query current user's profile and the full skill catalog in parallel.
   - `upsertMentorProfile(prevState, formData)`:
     - Verify authentication (`requireUser()`).
     - Parse and validate bio, experienceYears, and skillIds with Zod.
     - Verify that all submitted skill IDs exist in the `skills` catalog table.
     - Execute an interactive transaction (`prisma.$transaction`):
       - Create or update the `mentor_profiles` record for `session.user.id`.
       - Explicitly delete existing `mentor_skills` records for this profile (`deleteMany`).
       - Insert new `mentor_skills` records (`createMany`) linking the profile to selected skills.
     - Return `{ success: true, profileId: string }` or `{ error: string }`.

3. **Mentor Profile Editor UI**:
   - `components/mentor-profile-form.tsx`: Client form using `useActionState`.
     - Bio textarea (10–2000 characters).
     - Years of Experience number input.
     - Skill selection chips (checkboxes with skill names, pre-checked if editing an existing profile).
     - Submit button with pending state.
     - Inline error display.
     - On success, display a confirmation message with a link to view the public profile (`/mentors/[id]`).
   - `app/(mentor)/profile/page.tsx`:
     - Server Component calling `requireUser()` and `getProfileEditor(session.user.id)`.
     - Dynamic header copy: "Create Mentor Profile" if first time, or "Edit Mentor Profile" if existing.

4. **Mentor Inbox Read Action & Page (`app/(mentor)/inbox/page.tsx`)**:
   - `lib/actions/inbox.ts`: Export `getInbox(mentorProfileId)` querying all requests sent to this mentor profile, sorted with `pending` requests first, then decided requests (newest first).
   - `app/(mentor)/inbox/page.tsx`:
     - Protected with `requireMentorProfile()` from `lib/auth/dal.ts` (redirecting non-mentors to `/profile?setup=1`).
     - Render request cards displaying requester name, request date, message, and requested skill chips.
     - For pending requests, render the `InboxRequestActions` component.
     - For decided requests, render a status badge and a note: *"You accepted/declined this request on [Date]"*.
     - If no requests exist, display an empty state.

5. **Respond to Request Action (`lib/actions/requests.ts`)**:
   - Implement `respondToRequest(prevState, formData)` accepting `requestId` and `decision` (`accept` | `decline`).
   - Authenticate user (`requireUser()`).
   - Load the request and verify ownership: `request.mentorProfile.userId === session.user.id`. If not, reject with: *"Only the mentor this request was sent to can respond."*
   - Execute a race-condition-safe update:
     ```ts
     const updated = await prisma.mentorshipRequest.updateMany({
       where: { id: requestId, status: "pending" },
       data: {
         status: decision === "accept" ? "accepted" : "declined",
         decidedAt: new Date(),
       },
     });
     ```
   - If `updated.count === 0`, reject with: *"This request has already been responded to."*
   - `components/inbox-request-actions.tsx`: Client component rendering "Accept" and "Decline" submit buttons with `useActionState` and inline error feedback.

6. **Navigation & DAL Updates**:
   - In `lib/auth/dal.ts`, export `isMentor()` checking if the logged-in user has a `mentor_profiles` record.
   - Update `components/layout/nav.tsx` for signed-in users to display:
     - "My Requests" (`/dashboard`)
     - "Mentor Profile" (`/profile`)
     - "Inbox" (`/inbox`) — visible **only** when `isMentor()` is true.
   - On the landing page (`app/page.tsx`), update the "Become a mentor" CTA button: link to `/profile` if signed in, or `/signup` if anonymous.

### Acceptance Criteria
1. Any authenticated user can create a mentor profile on `/profile`. Once saved, they immediately appear on the `/mentors` directory and search filters.
2. Editing an existing profile pre-fills existing bio, experience, and checked skills, and replaces skills atomically.
3. Accessing `/inbox` without a mentor profile redirects to `/profile?setup=1`.
4. Mentors can view pending requests and click "Accept" or "Decline".
5. Responding updates the request in the inbox and reflects immediately on the learner's `/dashboard`.
6. Attempting to respond twice or responding to another mentor's request is rejected securely.
```

---

## 🛠️ Recovery / Diagnostic Prompt

```text
We are trying to reach Checkpoint 06 (Mentor Profile Management & Inbox).

Expected state:
- app/(mentor)/profile/page.tsx renders MentorProfileForm and saves via upsertMentorProfile in a transaction.
- app/(mentor)/inbox/page.tsx guards against non-mentors and lists incoming requests.
- lib/actions/requests.ts exports respondToRequest with ownership verification and optimistic updateMany status checks.
- components/layout/nav.tsx displays "Inbox" only for users with mentor profiles.

Inspect the current implementation:
1. Verify lib/actions/profiles.ts replaces mentor_skills atomically inside a transaction (deleteMany + createMany).
2. Verify lib/actions/requests.ts respondToRequest checks mentorProfile.userId === session.user.id and guards with updateMany count check.
3. Check components/inbox-request-actions.tsx for proper Accept/Decline button actions.
4. Verify components/layout/nav.tsx displays the Inbox link when isMentor() returns true.
5. Fix any errors and verify by creating a mentor profile, receiving a request, and accepting it in /inbox.
```
