# Transition Prompt: Checkpoint 03 → Checkpoint 04

| Transition | From Checkpoint 03 to Checkpoint 04 |
|---|---|
| **Goal** | Build the public mentor discovery experience: `/mentors` directory, eager-loaded queries without N+1, URL-driven search & filtering with progressive enhancement GET forms, and public mentor profile page `/mentors/[id]`. |
| **Reference Tag** | `checkpoint-04-mentor-discovery` |

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
Build the public mentor discovery system for SkillBridge, including the `/mentors` directory with search and filtering, reusable mentor cards, and the `/mentors/[id]` mentor profile page.

### Current State
- Checkpoint 03 completed with working Better Auth, route guards, and database seed.
- `/mentors` and `/mentors/[id]` currently render placeholder cards.

### Desired State
1. **Public Mentor Directory (`app/mentors/page.tsx`)**:
   - Query all mentors from PostgreSQL, eager-loading related user names and offered skills via Prisma `include` to avoid N+1 queries.
   - Fetch the full skills catalog for the filter dropdown in parallel (`Promise.all`).
   - Parse search parameters: `q` (search term for name/bio) and `skill` (skill name filter).
   - Support case-insensitive search matching mentor name or bio text.
   - Support skill filtering joining through `mentor_skills` by skill name.
   - Render mentor cards in a responsive CSS grid (1 column mobile, 2 tablet, 3 desktop).
   - Render a dashed empty state ("No mentors found") with a "Clear filters" link when no mentors match.

2. **Mentor Card Component (`components/mentor-card.tsx`)**:
   - Reusable Server Component accepting mentor profile with relations.
   - Display mentor avatar fallback and name.
   - Display years of experience badge (e.g. "9 yrs exp").
   - Display bio clamped to 3 lines (`line-clamp-3`).
   - Display skill badges using shadcn `Badge`.
   - Provide a "View Profile" button linking to `/mentors/[id]`.

3. **Search & Filter Controls (`components/mentor-filters.tsx`)**:
   - Implement as a native HTML GET form (`<form action="/mentors" method="get">`) for zero-client-JS progressive enhancement.
   - Include a search text input with `name="q"` and default value from `searchParams.q`.
   - Include a skill select dropdown with `name="skill"` populated with available skills.
   - Include a "Search" button and a "Clear" link that resets filters back to `/mentors`.

4. **Public Mentor Profile Page (`app/mentors/[id]/page.tsx`)**:
   - Validate that `params.id` is a valid UUID format using regex before querying the database; return `notFound()` immediately if malformed.
   - Query the mentor profile by UUID, eager-loading user name, bio, experience, and all offered skills; return `notFound()` if not found.
   - Render a detailed profile header with mentor name, years of experience, "About" section with full bio, and all skill badges.
   - Include a back link returning to `/mentors`.

5. **Request CTA Component (`components/request-cta.tsx`)**:
   - Render a call-to-action card on the mentor profile page.
   - If user is anonymous (`getSession()` returns null), display "Sign in to request mentorship" button linking to `/login` and a sign-up link.
   - If user is authenticated, display a disabled placeholder button ("Request Mentorship") with a helper note indicating request submission will be available soon (to be wired in Checkpoint 05).

### Acceptance Criteria
1. Navigating to `/mentors` displays all seeded mentors with their names, experience, bios, and skill badges.
2. Filtering by skill (e.g. `?skill=Data Analysis`) or searching by keyword (e.g. `?q=priya`) displays only matching mentors.
3. Submitting filters with no matches displays the styled empty state with a "Clear filters" button.
4. Clicking "View Profile" opens `/mentors/[id]` showing the mentor's full details.
5. Visiting `/mentors/non-existent-uuid` or an invalid UUID string renders the custom 404 page.
6. Anonymous visitors see the sign-in prompt on the mentor profile page, while logged-in users see the authenticated CTA state.
```

---

## 🛠️ Recovery / Diagnostic Prompt

```text
We are trying to reach Checkpoint 04 (Public Mentor Discovery & Directory).

Expected state:
- app/mentors/page.tsx queries mentors with eager-loaded relations and supports ?q= and ?skill= URL parameters.
- components/mentor-filters.tsx renders a GET form with search input and skill select.
- components/mentor-card.tsx displays mentor information in a responsive card.
- app/mentors/[id]/page.tsx validates the UUID parameter and displays the mentor profile.
- components/request-cta.tsx shows session-aware actions (login prompt for guests).

Inspect the current implementation:
1. Check app/mentors/page.tsx query logic to ensure skill filtering joins correctly and search handles undefined params.
2. Ensure URL search parameters are properly decoded and passed to the query.
3. Verify app/mentors/[id]/page.tsx validates UUIDs and handles missing profiles with notFound().
4. Fix any broken imports or missing component props.
5. Verify by opening /mentors, testing search and skill filtering, and viewing a mentor profile page.
```
