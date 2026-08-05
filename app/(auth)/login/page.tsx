import type { Metadata } from "next";
import { Placeholder } from "@/components/placeholder";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <Placeholder
      title="Welcome back"
      description="Sign in to send requests or manage your mentorship inbox."
      planned={["Email + password login", "Session handling"]}
    />
  );
}
