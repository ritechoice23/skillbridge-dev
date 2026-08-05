import type { Metadata } from "next";
import { Placeholder } from "@/components/placeholder";

export const metadata: Metadata = {
  title: "Create an account",
};

export default function SignupPage() {
  return (
    <Placeholder
      title="Create your account"
      description="One account for learning and mentoring. You can send requests today and become a discoverable mentor anytime."
      planned={["Email + password sign-up"]}
    />
  );
}
