"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/dal";
import {
  createRequestSchema,
  respondRequestSchema,
} from "@/lib/validation/request";

export type RequestActionState = {
  error: string | null;
  success: boolean;
};

export async function createMentorshipRequest(
  _prevState: RequestActionState,
  formData: FormData,
): Promise<RequestActionState> {
  const session = await requireUser();

  const skillIds = [
    ...new Set(
      formData
        .getAll("skillIds")
        .filter((value): value is string => typeof value === "string" && value.length > 0),
    ),
  ];

  const parsed = createRequestSchema.safeParse({
    mentorProfileId: formData.get("mentorProfileId"),
    message: formData.get("message"),
    skillIds,
  });
  if (!parsed.success) {
    return { error: firstIssue(parsed.error), success: false };
  }

  const { mentorProfileId, message } = parsed.data;

  const profile = await prisma.mentorProfile.findUnique({
    where: { id: mentorProfileId },
    select: { userId: true },
  });
  if (!profile) {
    return { error: "This mentor no longer exists.", success: false };
  }
  if (profile.userId === session.user.id) {
    return {
      error: "You can't request mentorship from yourself.",
      success: false,
    };
  }

  if (skillIds.length > 0) {
    const offered = await prisma.mentorSkill.findMany({
      where: {
        mentorProfileId,
        skillId: { in: skillIds },
      },
      select: { skillId: true },
    });
    const offeredIds = new Set(offered.map((row) => row.skillId));
    if (skillIds.some((skillId) => !offeredIds.has(skillId))) {
      return {
        error: "One of those skills isn't one this mentor offers.",
        success: false,
      };
    }
  }

  const existing = await prisma.$transaction(async (tx) => {
    const pending = await tx.mentorshipRequest.findMany({
      where: {
        requesterId: session.user.id,
        mentorProfileId,
        status: "pending",
      },
      select: {
        skills: { select: { skillId: true } },
      },
    });

    const pendingSkillIds = new Set(
      pending.flatMap((request) => request.skills.map((row) => row.skillId)),
    );
    const duplicates = skillIds.filter((skillId) => pendingSkillIds.has(skillId));
    if (duplicates.length > 0) {
      const names = await tx.skill.findMany({
        where: { id: { in: duplicates } },
        select: { name: true },
      });
      return {
        duplicate: true as const,
        message: `You already have a pending request for ${names
          .map((skill) => skill.name)
          .join(", ")}.`,
      };
    }

    const request = await tx.mentorshipRequest.create({
      data: {
        requesterId: session.user.id,
        mentorProfileId,
        message,
        status: "pending",
      },
      select: { id: true },
    });

    if (skillIds.length > 0) {
      await tx.mentorshipRequestSkill.createMany({
        data: skillIds.map((skillId) => ({
          requestId: request.id,
          skillId,
        })),
      });
    }

    return { duplicate: false as const };
  });

  if (existing.duplicate) {
    return { error: existing.message, success: false };
  }

  return { error: null, success: true };
}

function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Please fix the form and try again.";
}

export type RespondActionState = {
  error: string | null;
  success: boolean;
};

export async function respondToRequest(
  _prevState: RespondActionState,
  formData: FormData,
): Promise<RespondActionState> {
  const session = await requireUser();

  const parsed = respondRequestSchema.safeParse({
    requestId: formData.get("requestId"),
    decision: formData.get("decision"),
  });
  if (!parsed.success) {
    return { error: firstIssue(parsed.error), success: false };
  }

  const { requestId, decision } = parsed.data;

  const request = await prisma.mentorshipRequest.findUnique({
    where: { id: requestId },
    select: {
      status: true,
      mentorProfile: { select: { userId: true } },
    },
  });
  if (!request) {
    return { error: "This request no longer exists.", success: false };
  }
  if (request.mentorProfile.userId !== session.user.id) {
    return {
      error: "Only the mentor this request was sent to can respond.",
      success: false,
    };
  }

  const status = decision === "accept" ? "accepted" : "declined";
  const updated = await prisma.mentorshipRequest.updateMany({
    where: { id: requestId, status: "pending" },
    data: { status, decidedAt: new Date() },
  });
  if (updated.count === 0) {
    return {
      error: "This request has already been responded to.",
      success: false,
    };
  }

  return { error: null, success: true };
}
