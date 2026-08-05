import type { Metadata } from "next";
import { Placeholder } from "@/components/placeholder";
import { getSession } from "@/lib/auth/dal";

export const metadata: Metadata = {
  title: "My Requests",
};

export default async function DashboardPage() {
  const session = await getSession();

  return (
    <Placeholder
      title={`Welcome, ${session?.user.name ?? "there"}`}
      description="Track the mentorship requests you have sent."
      planned={["Sent requests with status", "Pending, accepted and declined states"]}
    />
  );
}
