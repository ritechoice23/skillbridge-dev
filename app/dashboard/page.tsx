import type { Metadata } from "next";
import { Placeholder } from "@/components/placeholder";

export const metadata: Metadata = {
  title: "My Requests",
};

export default function DashboardPage() {
  return (
    <Placeholder
      title="My Requests"
      description="Track the mentorship requests you have sent."
      planned={["Sent requests with status", "Pending, accepted and declined states"]}
    />
  );
}
