"use server";

import { z } from "zod";
import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export type AuthActionState = { error: string | null };

const emailSchema = z
  .email({ error: "Enter a valid email address." })
  .trim()
  .toLowerCase();

const passwordPolicy = z
  .string()
  .min(8, { error: "Password must be at least 8 characters." })
  .max(128, { error: "Password must be at most 128 characters." })
  .regex(/[a-zA-Z]/, { error: "Password must contain a letter." })
  .regex(/[0-9]/, { error: "Password must contain a number." })
  .regex(/[^a-zA-Z0-9]/, { error: "Password must contain a symbol." });

const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: "Name must be at least 2 characters." })
    .max(100, { error: "Name must be at most 100 characters." }),
  email: emailSchema,
  password: passwordPolicy,
});

const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { error: "Enter your password." }),
});

export async function signUp(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  try {
    await auth.api.signUpEmail({
      body: parsed.data,
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError && error.status === 422) {
      return { error: "An account with this email already exists." };
    }
    return { error: "Something went wrong. Please try again." };
  }

  redirect("/dashboard");
}

export async function signIn(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  try {
    await auth.api.signInEmail({
      body: parsed.data,
      headers: await headers(),
    });
  } catch {
    return { error: "Invalid email or password." };
  }

  redirect("/dashboard");
}

export async function signOut(): Promise<void> {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}

function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Please fix the form and try again.";
}
