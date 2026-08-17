# Checkpoint 07: Database-Driven Notifications & Unread Alerts

## Goal

Build an in-app database-driven notification system: create the `notifications` table, write automatic notification events inside request creation and decision transactions, build the `/notifications` page with click-to-read redirects, and add a navigation bell with a live unread badge count.

## Prompt

```text
Inspect the existing Next.js project before making any changes.

We want to build an in-app database-driven notification system so mentors are notified of new requests and learners are notified of accepted/declined requests.

Please follow these guidelines:
1. Inspect the existing Prisma models (MentorshipRequest, User) and request actions first.
2. Add Notification Model to prisma/schema.prisma:
   - Notification (mapped to "notifications"):
     - id: UUID PK default gen_random_uuid()
     - userId: UUID FK -> users(id) with onDelete: Restrict, onUpdate: NoAction
     - type: String (with CHECK constraint in migration: "request_received", "request_accepted", "request_declined")
     - title: String
     - body: String
     - link: String (relative route path, e.g. "/inbox" or "/dashboard")
     - readAt: DateTime nullable @db.Timestamptz(6)
     - createdAt: DateTime @default(now()) @db.Timestamptz(6)
     - @@index([userId, readAt])
   - Generate and apply a forward-only database migration.
   - Run npx prisma generate and restart long-running development servers.
3. Add Transactional Notification Triggers in lib/actions/requests.ts:
   - In createMentorshipRequest: inside the existing interactive transaction, insert a "request_received" notification for the mentor (title: "New mentorship request", body: "${requester.name} wants you to mentor them in ${skillNames}.", link: "/inbox").
   - In respondToRequest: inside the existing interactive transaction, after the status update, insert a "request_accepted" or "request_declined" notification for the requester (title: "Request accepted" / "Request declined", body: "${mentorName} ${decision} your mentorship request.", link: "/dashboard").
4. Create Notification Actions in lib/actions/notifications.ts ("use server"):
   - getNotifications(userId): Query user notifications sorted unread first (readAt: { sort: "asc", nulls: "first" }), then createdAt: "desc". Return { notifications, unreadCount }.
   - getUnreadNotificationCount(userId): Fast count query of unread rows where userId === userId and readAt === null.
   - markNotificationRead(formData): Require user, parse notificationId and link, verify link starts with "/", update readAt = new Date() scoped to session.user.id, and call redirect(link).
   - markAllNotificationsRead(): Update all unread notifications for session.user.id to readAt = new Date(), and revalidatePath("/notifications").
5. Build the Notifications Page (app/notifications/page.tsx):
   - Server Component requiring user and calling getNotifications(session.user.id).
   - Page header with "Notifications" and a "Mark all as read" button when unread count > 0.
   - Notification cards with type icons (Lucide Inbox for requests, CheckCircle for accepted, XCircle for declined).
   - Unread cards render as active form submit buttons with an unread dot that automatically mark as read and redirect on click. Read cards render as standard links.
   - If empty, render an empty state card ("You're all caught up!").
6. Update Header Navigation (components/layout/nav.tsx):
   - For signed-in users, render a Bell icon linking to /notifications with an accessible aria-label.
   - If unreadCount > 0, display a badge counter showing the unread number.
   - In the mobile menu drawer, include a "Notifications" link with badge count.

Verify that sending a request increments the mentor's bell badge, clicking the notification navigates to /inbox and marks it read, and accepting a request notifies the learner.
```

## Recovery and Alignment Prompt

```text
We are trying to align the project with Checkpoint 07 (Database-Driven Notifications System).

Expected state:
- prisma/schema.prisma contains Notification model and migration is applied.
- lib/actions/requests.ts creates notifications inside existing $transaction blocks.
- lib/actions/notifications.ts exports getNotifications, getUnreadNotificationCount, markNotificationRead, markAllNotificationsRead.
- app/notifications/page.tsx renders notifications with click-to-read interaction.
- components/layout/nav.tsx displays bell icon with live unread badge count.

Inspect the project, restart the dev server if Prisma client cache is stale, fix any notification action or query issues, and verify with a test request and bell badge check.
```

## Quick Verification

1. Log in as `learner@test.com` and send a request to `Priya Sharma`.
2. Log in as `priya@example.com` — confirm the Bell icon in the header displays badge `1`.
3. Open `/notifications` — confirm the unread notification appears with an indicator dot.
4. Click the notification — confirm redirect to `/inbox` and that the bell badge count drops to 0.
5. Accept the request, log back in as `learner@test.com` — confirm the learner receives a "Request accepted" notification.
