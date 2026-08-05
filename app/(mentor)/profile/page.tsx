import type { Metadata } from "next";
import { Placeholder } from "@/components/placeholder";
import { requireUser } from "@/lib/auth/dal";

export const metadata: Metadata = {
  title: "My Profile",
};

export default async function MentorProfilePage({
  searchParams,
}: PageProps<"/profile">) {
  await requireUser();
  const { setup } = await searchParams;

  return (
    <Placeholder
      title="My Profile"
      description={
        setup === "1"
          ? "You need a public mentor profile to use the inbox. Create one here to start answering requests."
          : "Create and edit your public mentor profile."
      }
      planned={["Bio and experience", "Select skills from the catalog"]}
    />
  );
}
