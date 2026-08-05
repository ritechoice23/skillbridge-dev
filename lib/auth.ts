import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    password: {
      hash: hashPassword,
      verify: verifyPassword,
    },
  },
  user: { modelName: "User" },
  session: { modelName: "Session" },
  account: { modelName: "Account" },
  verification: { modelName: "Verification" },
  advanced: {
    database: { generateId: "uuid" },
  },
  plugins: [nextCookies()],
});
