import type { Metadata } from "next";
import { Placeholder } from "@/components/placeholder";
import { requireMentorProfile } from "@/lib/auth/dal";

export const metadata: Metadata = {
  title: "Inbox",
};

export default async function MentorInboxPage() {
  await requireMentorProfile();

  return (
    <Placeholder
      title="Inbox"
      description="Review mentorship requests from learners."
      planned={["Incoming requests with learner details", "Accept or decline"]}
    />
  );
}
