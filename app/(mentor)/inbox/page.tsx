import type { Metadata } from "next";
import { Placeholder } from "@/components/placeholder";

export const metadata: Metadata = {
  title: "Inbox",
};

export default function MentorInboxPage() {
  return (
    <Placeholder
      title="Inbox"
      description="Review mentorship requests from learners."
      planned={["Incoming requests with learner details", "Accept or decline"]}
    />
  );
}
