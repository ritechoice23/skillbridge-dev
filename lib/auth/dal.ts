import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

export async function requireUser() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireMentorProfile() {
  const session = await requireUser();
  const profile = await prisma.mentorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) {
    redirect("/profile?setup=1");
  }
  return { session, profile };
}
