# Checkpoint 06: Mentor Profile Management & Request Inbox

## Goal

Build the mentor experience: a `/profile` page allowing any registered user to publish or edit their mentor biography and offered skills, a private `/inbox` for mentors to review incoming requests, and race-safe Accept/Decline decision buttons.

## Prompt

```text
Inspect the existing Next.js project before making any changes.

We want to build the mentor profile management page, mentor request inbox, and request accept/decline functionality for SkillBridge.

Please follow these guidelines:
1. Inspect the existing Prisma models (MentorProfile, Skill, MentorSkill, MentorshipRequest) and actions first.
2. Create Profile Validation Schema in lib/validation/profile.ts:
   - bio: String, trimmed, min 10, max 2000 characters.
   - experienceYears: Integer between 0 and 99 (parse strictly from string regex ^\d+$ to avoid empty strings coercing to 0).
   - skillIds: Array of UUID strings (min 1 skill).
3. Create Profile Management Actions in lib/actions/profiles.ts:
   - getProfileEditor(userId): Query user's mentor profile and full skills catalog in parallel.
   - upsertMentorProfile(prevState, formData):
     - Authenticate user via requireUser().
     - Validate bio, experienceYears, and skillIds with Zod.
     - Verify all submitted skillIds exist in the skills catalog table.
     - In an interactive transaction (prisma.$transaction):
       - Create or update the mentor_profiles record for session.user.id.
       - Delete existing mentor_skills records for this profile (deleteMany).
       - Insert new mentor_skills records linking the profile to selected skills (createMany).
     - Return { success: true, profileId: string } or { error: string }.
4. Build the Mentor Profile Editor Page:
   - Client form (components/mentor-profile-form.tsx) using useActionState with bio textarea, experience input, pre-checked skill chips, submit button, and success state linking to /mentors/[id].
   - Page (app/(mentor)/profile/page.tsx): Server Component calling requireUser() and getProfileEditor(session.user.id), switching title between "Create Mentor Profile" and "Edit Mentor Profile".
5. Build the Mentor Inbox Read Action & Page (app/(mentor)/inbox/page.tsx):
   - In lib/actions/inbox.ts, export getInbox(mentorProfileId) querying all requests for this mentor profile, sorted with pending requests first, then decided requests (newest first).
   - In app/(mentor)/inbox/page.tsx, enforce requireMentorProfile() from lib/auth/dal.ts (redirecting non-mentors to /profile?setup=1).
   - Display request cards with requester name, request date, message, and requested skill badges.
   - For pending requests, render the InboxRequestActions component. For decided requests, render a badge and note: "You accepted/declined this request on [Date]".
   - If empty, render an empty state card.
6. Create the Respond to Request Action (lib/actions/requests.ts):
   - Export respondToRequest(prevState, formData) accepting requestId and decision ("accept" | "decline").
   - Authenticate user via requireUser().
   - Load request and verify ownership: request.mentorProfile.userId === session.user.id. If not, return error: "Only the mentor this request was sent to can respond."
   - Execute a race-safe status update:
     prisma.mentorshipRequest.updateMany({
       where: { id: requestId, status: "pending" },
       data: { status: decision === "accept" ? "accepted" : "declined", decidedAt: new Date() }
     });
   - If count === 0, return error: "This request has already been responded to."
   - Build components/inbox-request-actions.tsx with "Accept" and "Decline" submit buttons using useActionState.
7. Update Navigation & DAL:
   - In lib/auth/dal.ts, export isMentor() checking if session user has a mentor_profiles record.
   - In components/layout/nav.tsx, add "Inbox" to the navigation links only when isMentor() returns true.
   - On the landing page (app/page.tsx), update "Become a mentor" button to link to /profile if signed in, or /signup if guest.

Verify that a user can create a mentor profile, receive a request in /inbox, accept it, and see the status update in real time on both inbox and dashboard.
```

## Recovery and Alignment Prompt

```text
We are trying to align the project with Checkpoint 06 (Mentor Profile Management & Inbox).

Expected state:
- app/(mentor)/profile/page.tsx renders MentorProfileForm and saves via upsertMentorProfile in a transaction.
- app/(mentor)/inbox/page.tsx guards against non-mentors and lists incoming requests.
- lib/actions/requests.ts exports respondToRequest with ownership verification and optimistic updateMany status checks.
- components/layout/nav.tsx displays "Inbox" only for users with mentor profiles.

Inspect the project, fix any profile transaction logic, inbox query issues, or respond action errors, and verify by creating a mentor profile and accepting a request.
```

## Quick Verification

1. Log in as `learner@test.com`, go to `/profile`, fill in bio & experience, select 2 skills, and click "Save Profile".
2. Confirm your profile now appears in `/mentors` and the "Inbox" tab appears in the navigation bar.
3. Log in as another user, send a request to `learner@test.com`.
4. Log back in as `learner@test.com`, open `/inbox`, and click "Accept".
5. Confirm the request updates to "You accepted this request on <date>" and the learner's `/dashboard` badge turns green (`Accepted`).
