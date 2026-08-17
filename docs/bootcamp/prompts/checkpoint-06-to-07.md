# Transition Prompt: Checkpoint 06 → Checkpoint 07

| Transition | From Checkpoint 06 to Checkpoint 07 |
|---|---|
| **Goal** | Build an in-app database-driven notification system: `notifications` table, transactional event writes in request actions, `/notifications` page with read/unread states, and header navigation bell with unread count badge. |
| **Reference Tag** | `checkpoint-07-notifications` |

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
Build an in-app, database-driven notification system so that mentors are notified when receiving new mentorship requests, and learners are notified when mentors accept or decline their requests. Include an interactive `/notifications` page and a navigation bell icon with a live unread count badge.

### Current State
- Checkpoint 06 completed with working mentor profile management, request inbox, and accept/decline responses.
- No notifications table or notification UI exists yet.

### Desired State
1. **Database Schema for Notifications (`prisma/schema.prisma`)**:
   - Add `Notification` model:
     - Mapped to `notifications`
     - `id`: UUID PK default `gen_random_uuid()`
     - `userId`: UUID FK -> users(id) with `onDelete: Restrict, onUpdate: NoAction`
     - `type`: String (with CHECK constraint in migration: `'request_received'`, `'request_accepted'`, `'request_declined'`)
     - `title`: String
     - `body`: String (frozen snapshot text)
     - `link`: String (relative route path starting with `/`, e.g. `/inbox` or `/dashboard`)
     - `readAt`: DateTime nullable @db.Timestamptz(6)
     - `createdAt`: DateTime @default(now()) @db.Timestamptz(6)
     - `@@index([userId, readAt])`
   - Generate and apply a forward-only database migration.
   - Run `npx prisma generate` and **restart long-running development servers** so the new model is loaded in memory.

2. **Transactional Notification Creation (`lib/actions/requests.ts`)**:
   - In `createMentorshipRequest`: Inside the interactive transaction, insert a `request_received` notification for the mentor:
     - `userId`: mentor's `userId`
     - `type`: `"request_received"`
     - `title`: `"New mentorship request"`
     - `body`: `"${requester.name} wants you to mentor them in ${skillNames}."`
     - `link`: `"/inbox"`
   - In `respondToRequest`: Inside the interactive transaction, after the `updateMany` succeeds, insert a notification for the requester:
     - `userId`: `request.requesterId`
     - `type`: `decision === "accept" ? "request_accepted" : "request_declined"`
     - `title`: `decision === "accept" ? "Request accepted" : "Request declined"`
     - `body`: `"${mentorName} ${decision === "accept" ? "accepted" : "declined"} your mentorship request."`
     - `link`: `"/dashboard"`

3. **Notification Actions (`lib/actions/notifications.ts`)**:
   - Mark as `"use server"`.
   - `getNotifications(userId)`: Query notifications for `userId`, sorted unread first (`readAt: { sort: "asc", nulls: "first" }`), then `createdAt: "desc"`. Return `{ notifications, unreadCount }`.
   - `getUnreadNotificationCount(userId)`: Fast count query: `prisma.notification.count({ where: { userId, readAt: null } })`.
   - `markNotificationRead(formData)`:
     - Require user (`requireUser()`).
     - Parse `notificationId` and `link` from FormData.
     - Validate that `link` is a relative path starting with `/`.
     - Update record: `prisma.notification.updateMany({ where: { id: notificationId, userId: session.user.id, readAt: null }, data: { readAt: new Date() } })`.
     - Redirect to `link` (using `redirect(link)` from `next/navigation`).
   - `markAllNotificationsRead()`:
     - Update all unread notifications for the session user: `prisma.notification.updateMany({ where: { userId: session.user.id, readAt: null }, data: { readAt: new Date() } })`.
     - Revalidate path `/notifications`.

4. **Notifications Page (`app/notifications/page.tsx`)**:
   - Server Component enforcing `requireUser()`.
   - Call `getNotifications(session.user.id)`.
   - Render page header with "Notifications" and a "Mark all as read" button when unread count > 0.
   - For each notification:
     - Contextual type icon (Lucide `Inbox` for requests, `CheckCircle` for accepted, `XCircle` for declined).
     - Title, timestamp, and body text.
     - If unread: Render as a styled `<form action={markNotificationRead}>` submit button with a colored indicator dot. Clicking automatically marks as read and navigates to the target page.
     - If read: Render as a standard `<Link href={notification.link}>`.
   - If empty: Display an empty state card ("You're all caught up!").

5. **Header Bell & Navigation Integration**:
   - In `components/layout/nav.tsx`:
     - For signed-in users, render a Bell icon (`lucide-react`) linking to `/notifications` with an accessible label (`aria-label`).
     - If `unreadCount > 0`, display a badge displaying the unread count next to the bell.
     - In the mobile sheet menu, include a "Notifications" link with badge count.

### Acceptance Criteria
1. Submitting a request creates a `request_received` notification for the mentor, incrementing the mentor's navigation bell badge.
2. Mentors can view `/notifications`, see unread items with dots, and click an unread item to mark it read and jump to `/inbox`.
3. Accepting or declining a request creates a `request_accepted`/`request_declined` notification for the learner.
4. Clicking "Mark all as read" marks all notifications read simultaneously.
```

---

## 🛠️ Recovery / Diagnostic Prompt

```text
We are trying to reach Checkpoint 07 (Database-Driven Notifications System).

Expected state:
- prisma/schema.prisma includes the Notification model.
- lib/actions/requests.ts creates notifications inside transactions on createMentorshipRequest and respondToRequest.
- lib/actions/notifications.ts exports getNotifications, getUnreadNotificationCount, markNotificationRead, and markAllNotificationsRead.
- app/notifications/page.tsx renders the notifications list with mark-as-read click interactions.
- components/layout/nav.tsx displays the bell icon with live unread badge count.

Inspect the current implementation:
1. Did you run prisma generate and restart the Next.js dev server? (Avoid undefined prisma.notification errors).
2. Check lib/actions/notifications.ts: verify markNotificationRead safely scopes updates to session.user.id.
3. Check lib/actions/requests.ts: ensure notifications are created inside the existing $transaction blocks.
4. Verify components/layout/nav.tsx renders the unread badge accurately.
5. Fix any errors and verify by sending a request and verifying the bell badge and /notifications page.
```
