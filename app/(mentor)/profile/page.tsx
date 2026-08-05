import type { Metadata } from "next";
import { Placeholder } from "@/components/placeholder";

export const metadata: Metadata = {
  title: "My Profile",
};

export default function MentorProfilePage() {
  return (
    <Placeholder
      title="My Profile"
      description="Create and edit your public mentor profile."
      planned={["Headline, bio and experience", "Select skills from the catalog"]}
    />
  );
}
