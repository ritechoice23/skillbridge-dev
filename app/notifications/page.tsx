import type { Metadata } from "next";
import Link from "next/link";
import {
  BellIcon,
  CheckCircle2Icon,
  InboxIcon,
  XCircleIcon,
} from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/actions/notifications";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Notifications",
};

const typeIcons: Record<string, LucideIcon> = {
  request_received: InboxIcon,
  request_accepted: CheckCircle2Icon,
  request_declined: XCircleIcon,
};

export default async function NotificationsPage() {
  const session = await requireUser();
  const { notifications, unreadCount } = await getNotifications(session.user.id);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-10">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Notifications
          </h1>
          <p className="text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} unread`
              : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 ? (
          <form action={markAllNotificationsRead}>
            <Button type="submit" variant="outline">
              Mark all as read
            </Button>
          </form>
        ) : null}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No notifications yet</CardTitle>
            <CardDescription>
              When a mentor responds to your request, or a learner asks
              you to mentor them, it will show up here.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((notification) => {
            const Icon = typeIcons[notification.type] ?? BellIcon;
            const unread = notification.readAt === null;
            const row = (
              <>
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                    unread
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="size-5" />
                </span>
                <span className="flex min-w-0 flex-col gap-0.5 text-left">
                  <span
                    className={`text-sm ${unread ? "font-semibold" : "font-medium text-muted-foreground"}`}
                  >
                    {notification.title}
                  </span>
                  <span className="truncate text-sm text-muted-foreground">
                    {notification.body}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {notification.createdAt.toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </span>
                {unread ? (
                  <span className="ml-auto size-2 shrink-0 rounded-full bg-primary" />
                ) : null}
              </>
            );

            if (unread) {
              return (
                <form key={notification.id} action={markNotificationRead}>
                  <input
                    type="hidden"
                    name="notificationId"
                    value={notification.id}
                  />
                  <input type="hidden" name="link" value={notification.link} />
                  <button
                    type="submit"
                    className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-input bg-card p-3 transition-colors hover:bg-primary/5 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    {row}
                  </button>
                </form>
              );
            }

            return (
              <Link
                key={notification.id}
                href={notification.link}
                className="flex items-center gap-3 rounded-lg border border-input p-3 transition-colors hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                {row}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
