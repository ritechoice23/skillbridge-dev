import type { Metadata } from "next";
import { Placeholder } from "@/components/placeholder";

export const metadata: Metadata = {
  title: "Create an account",
};

export default function SignupPage() {
  return (
    <Placeholder
      title="Create your account"
      description="Join SkillBridge as a learner or a mentor."
      planned={["Email + password sign-up", "Choose your role"]}
    />
  );
}
