import type { Metadata } from "next";
import { Placeholder } from "@/components/placeholder";

export const metadata: Metadata = {
  title: "Find Mentors",
};

export default function MentorsPage() {
  return (
    <Placeholder
      title="Find Mentors"
      description="Browse the mentor directory and filter by the skill you want to learn."
      planned={["Mentor directory listing", "Search and filter by skill", "Public mentor profiles"]}
    />
  );
}
