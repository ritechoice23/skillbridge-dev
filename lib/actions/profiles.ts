"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/dal";
import { upsertProfileSchema } from "@/lib/validation/profile";

export type ProfileActionState = {
  error: string | null;
  success: boolean;
  profileId: string | null;
};

export async function getProfileEditor(userId: string) {
  const [profile, skills] = await Promise.all([
    prisma.mentorProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        bio: true,
        experienceYears: true,
        skills: { select: { skillId: true } },
      },
    }),
    prisma.skill.findMany({ orderBy: { name: "asc" } }),
  ]);

  return { profile, skills };
}

export async function upsertMentorProfile(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await requireUser();

  const skillIds = [
    ...new Set(
      formData
        .getAll("skillIds")
        .filter(
          (value): value is string => typeof value === "string" && value.length > 0,
        ),
    ),
  ];

  const parsed = upsertProfileSchema.safeParse({
    bio: formData.get("bio"),
    experienceYears: formData.get("experienceYears"),
    skillIds,
  });
  if (!parsed.success) {
    return { error: firstIssue(parsed.error), success: false, profileId: null };
  }

  const { bio, experienceYears } = parsed.data;

  if (skillIds.length > 0) {
    const known = await prisma.skill.count({
      where: { id: { in: skillIds } },
    });
    if (known !== skillIds.length) {
      return {
        error: "One of those skills doesn't exist.",
        success: false,
        profileId: null,
      };
    }
  }

  const profileId = await prisma.$transaction(async (tx) => {
    const existing = await tx.mentorProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (existing) {
      await tx.mentorProfile.update({
        where: { id: existing.id },
        data: { bio, experienceYears },
      });
      await tx.mentorSkill.deleteMany({
        where: { mentorProfileId: existing.id },
      });
      if (skillIds.length > 0) {
        await tx.mentorSkill.createMany({
          data: skillIds.map((skillId) => ({
            mentorProfileId: existing.id,
            skillId,
          })),
        });
      }
      return existing.id;
    }

    const created = await tx.mentorProfile.create({
      data: {
        userId: session.user.id,
        bio,
        experienceYears,
      },
      select: { id: true },
    });
    if (skillIds.length > 0) {
      await tx.mentorSkill.createMany({
        data: skillIds.map((skillId) => ({
          mentorProfileId: created.id,
          skillId,
        })),
      });
    }
    return created.id;
  });

  return { error: null, success: true, profileId };
}

function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Please fix the form and try again.";
}
