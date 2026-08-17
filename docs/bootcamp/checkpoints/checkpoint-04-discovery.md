# Checkpoint 04: Public Mentor Discovery, Search & Profile View

## Goal

Build the public mentor discovery experience: a `/mentors` directory page listing mentors in a responsive grid, a URL-driven search and skill filter bar using native HTML GET forms, a detailed public profile page (`/mentors/[id]`), and a session-aware request CTA box.

## Prompt

```text
Inspect the existing Next.js project before making any changes.

We want to build the public mentor discovery catalog, search and filter controls, and mentor profile page for SkillBridge.

Please follow these guidelines:
1. Inspect the existing Prisma models (MentorProfile, Skill, MentorSkill, User) and route structure first.
2. Build the Public Mentor Directory (app/mentors/page.tsx):
   - Query all mentors from PostgreSQL, eager-loading related user names and offered skills via Prisma include (avoiding N+1 queries).
   - Fetch the full skills catalog for the filter dropdown in parallel (Promise.all).
   - Parse search parameters: "q" (search term for name/bio) and "skill" (skill name filter).
   - Support case-insensitive search matching mentor name or bio text.
   - Support skill filtering by skill name joining through mentor_skills.
   - Render mentor cards in a responsive CSS grid (1 col mobile, 2 col tablet, 3 col desktop).
   - Render a dashed empty state ("No mentors found") with a "Clear filters" link when zero mentors match.
3. Build the Mentor Card Component (components/mentor-card.tsx):
   - Display mentor avatar fallback and full name.
   - Display years of experience badge (e.g. "9 yrs exp").
   - Display bio clamped to 3 lines (line-clamp-3).
   - Display skill badges using shadcn Badge.
   - Include a "View Profile" button linking to /mentors/[id].
4. Build the Search & Filter Controls (components/mentor-filters.tsx):
   - Implement as a native HTML GET form (<form action="/mentors" method="get">) for progressive enhancement without client state.
   - Include a text search input (name="q", default value from searchParams.q).
   - Include a skill select dropdown (name="skill") populated with available skills from the database.
   - Include a "Search" button and a "Clear" link that resets filters back to /mentors.
5. Build the Public Mentor Profile Page (app/mentors/[id]/page.tsx):
   - Validate that params.id is a valid UUID format using regex before querying the database; return notFound() immediately if malformed.
   - Query the mentor profile by UUID, eager-loading user name, bio, experience, and offered skills; return notFound() if missing.
   - Render header with name, experience, "About" section with full bio, and all skill badges.
   - Include a back link returning to /mentors.
6. Build the Request CTA Component (components/request-cta.tsx):
   - Render on the mentor profile page.
   - If user is anonymous (getSession() returns null), show "Sign in to request mentorship" linking to /login and a signup link.
   - If user is authenticated, show a placeholder button ("Request Mentorship") preparing for the request form in the next step.

Verify that all seeded mentors appear on /mentors, search and skill filtering work via URL parameters, and clicking "View Profile" opens /mentors/[id].
```

## Recovery and Alignment Prompt

```text
We are trying to align the project with Checkpoint 04 (Public Mentor Discovery & Directory).

Expected state:
- app/mentors/page.tsx queries mentors with eager-loaded relations and handles ?q= and ?skill= URL parameters.
- components/mentor-filters.tsx renders a GET form with search input and skill select.
- components/mentor-card.tsx displays mentor information in a responsive card.
- app/mentors/[id]/page.tsx validates UUIDs and renders the full profile.
- components/request-cta.tsx displays a login CTA for guests or an authenticated placeholder for signed-in users.

Inspect the project, fix any query errors, missing props, or styling issues, and verify by testing search, filtering, and profile navigation.
```

## Quick Verification

1. Navigate to `http://localhost:3000/mentors` — confirm all 4 demo mentors appear with bios and badges.
2. Search `priya` — confirm Priya Sharma is shown.
3. Filter by skill `Data Analysis` — confirm Amara Johnson is shown.
4. Click "View Profile" on a mentor — confirm the full profile loads at `/mentors/<uuid>`.
5. Visit an invalid profile URL `http://localhost:3000/mentors/invalid-id` — confirm the custom 404 page is shown.
