import "server-only";

import { prisma } from "@/lib/db";

export type MyRequest = {
  id: string;
  mentorName: string;
  message: string;
  status: string;
  decidedAt: Date | null;
  skills: string[];
};

export async function getMyRequests(userId: string): Promise<MyRequest[]> {
  const requests = await prisma.mentorshipRequest.findMany({
    where: { requesterId: userId },
    select: {
      id: true,
      message: true,
      status: true,
      decidedAt: true,
      mentorProfile: { select: { user: { select: { name: true } } } },
      skills: {
        select: { skill: { select: { name: true } } },
        orderBy: { skill: { name: "asc" } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return requests.map((request) => ({
    id: request.id,
    mentorName: request.mentorProfile.user.name,
    message: request.message,
    status: request.status,
    decidedAt: request.decidedAt,
    skills: request.skills.map((row) => row.skill.name),
  }));
}
