import { z } from "zod";

export const upsertProfileSchema = z.object({
  bio: z
    .string()
    .trim()
    .min(10, { error: "Bio must be at least 10 characters." })
    .max(2000, { error: "Bio must be at most 2000 characters." }),
  experienceYears: z
    .string()
    .regex(/^\d+$/, { error: "Enter your years of experience." })
    .transform(Number)
    .pipe(
      z
        .number()
        .min(0, { error: "Years of experience can't be negative." })
        .max(99, { error: "Years of experience must be at most 99." }),
    ),
  skillIds: z.array(z.string().uuid({ error: "Invalid skill." })).optional(),
});
