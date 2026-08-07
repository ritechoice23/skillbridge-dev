import "server-only";

import { prisma } from "@/lib/db";

export async function getMentorDirectory({
  q,
  skill,
}: {
  q?: string;
  skill?: string;
}) {
  const [mentors, skills] = await Promise.all([
    prisma.mentorProfile.findMany({
      where: buildWhere({ q, skill }),
      include: {
        user: { select: { name: true } },
        skills: { include: { skill: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.skill.findMany({ orderBy: { name: "asc" } }),
  ]);

  return { mentors, skills };
}

export async function getMentorProfile(id: string) {
  return prisma.mentorProfile.findUnique({
    where: { id },
    include: {
      user: { select: { name: true } },
      skills: { include: { skill: { select: { id: true, name: true } } } },
    },
  });
}

type FilterConditions = {
  skills?: { some: { skill: { name: { equals: string; mode: "insensitive" } } } };
  OR?: (
    | { user: { name: { contains: string; mode: "insensitive" } } }
    | { bio: { contains: string; mode: "insensitive" } }
  )[];
};

function buildWhere({
  q,
  skill,
}: {
  q?: string;
  skill?: string;
}): FilterConditions {
  const conditions: FilterConditions = {};
  if (skill && skill !== "all") {
    conditions.skills = {
      some: { skill: { name: { equals: skill, mode: "insensitive" } } },
    };
  }
  if (q) {
    conditions.OR = [
      { user: { name: { contains: q, mode: "insensitive" } } },
      { bio: { contains: q, mode: "insensitive" } },
    ];
  }
  return conditions;
}
