"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/dal";

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string;
  readAt: Date | null;
  createdAt: Date;
};

export async function getNotifications(userId: string) {
  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      select: {
        id: true,
        type: true,
        title: true,
        body: true,
        link: true,
        readAt: true,
        createdAt: true,
      },
      orderBy: [
        { readAt: { sort: "asc", nulls: "first" } },
        { createdAt: "desc" },
      ],
    }),
    prisma.notification.count({
      where: { userId, readAt: null },
    }),
  ]);
  return { notifications, unreadCount };
}

export async function getUnreadNotificationCount(userId: string) {
  return prisma.notification.count({
    where: { userId, readAt: null },
  });
}

const markReadSchema = z.object({
  notificationId: z.string().uuid({ error: "Invalid notification." }),
  link: z
    .string()
    .startsWith("/", { error: "Invalid link." })
    .max(255, { error: "Invalid link." }),
});

export async function markNotificationRead(formData: FormData): Promise<void> {
  const session = await requireUser();

  const parsed = markReadSchema.safeParse({
    notificationId: formData.get("notificationId"),
    link: formData.get("link"),
  });
  if (!parsed.success) {
    redirect("/notifications");
  }

  const { notificationId, link } = parsed.data;

  await prisma.notification.updateMany({
    where: { id: notificationId, userId: session.user.id, readAt: null },
    data: { readAt: new Date() },
  });

  redirect(link);
}

export async function markAllNotificationsRead(): Promise<void> {
  const session = await requireUser();

  await prisma.notification.updateMany({
    where: { userId: session.user.id, readAt: null },
    data: { readAt: new Date() },
  });
}
