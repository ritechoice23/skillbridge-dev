import { z } from "zod";

export const createRequestSchema = z.object({
  mentorProfileId: z.string().uuid({ error: "Invalid mentor." }),
  message: z
    .string()
    .trim()
    .min(1, { error: "Write a short message to the mentor." })
    .max(2000, { error: "Message must be at most 2000 characters." }),
  skillIds: z.array(z.string().uuid({ error: "Invalid skill." })).optional(),
});

export const respondRequestSchema = z.object({
  requestId: z.string().uuid({ error: "Invalid request." }),
  decision: z.enum(["accept", "decline"], {
    error: "Invalid decision.",
  }),
});
