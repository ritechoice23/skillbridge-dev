import "server-only";

import { prisma } from "@/lib/db";

export type InboxRequest = {
  id: string;
  requesterName: string;
  message: string;
  status: string;
  decidedAt: Date | null;
  createdAt: Date;
  skills: string[];
};

export async function getInbox(mentorProfileId: string): Promise<InboxRequest[]> {
  const requests = await prisma.mentorshipRequest.findMany({
    where: { mentorProfileId },
    select: {
      id: true,
      message: true,
      status: true,
      decidedAt: true,
      createdAt: true,
      requester: { select: { name: true } },
      skills: {
        select: { skill: { select: { name: true } } },
        orderBy: { skill: { name: "asc" } },
      },
    },
  });

  return requests
    .map((request) => ({
      id: request.id,
      requesterName: request.requester.name,
      message: request.message,
      status: request.status,
      decidedAt: request.decidedAt,
      createdAt: request.createdAt,
      skills: request.skills.map((row) => row.skill.name),
    }))
    .sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (a.status !== "pending" && b.status === "pending") return 1;
      const aTime = a.status === "pending" ? a.createdAt : a.decidedAt;
      const bTime = b.status === "pending" ? b.createdAt : b.decidedAt;
      return (bTime?.getTime() ?? 0) - (aTime?.getTime() ?? 0);
    });
}
