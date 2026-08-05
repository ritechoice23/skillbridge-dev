import type { Metadata } from "next";
import { Placeholder } from "@/components/placeholder";

export const metadata: Metadata = {
  title: "Mentor Profile",
};

export default async function MentorProfilePage({
  params,
}: PageProps<"/mentors/[id]">) {
  const { id } = await params;

  return (
    <Placeholder
      title="Mentor Profile"
      description={`Profile for mentor ${id}.`}
      planned={["Bio and experience", "Offered skills", "Send a mentorship request"]}
    />
  );
}
