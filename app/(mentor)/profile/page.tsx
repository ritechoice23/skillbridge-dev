import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MentorProfileForm } from "@/components/mentor-profile-form";
import { requireUser } from "@/lib/auth/dal";
import { getProfileEditor } from "@/lib/actions/profiles";

export const metadata: Metadata = {
  title: "My Profile",
};

export default async function MentorProfilePage({
  searchParams,
}: PageProps<"/profile">) {
  const session = await requireUser();
  const { setup } = await searchParams;

  const { profile, skills } = await getProfileEditor(session.user.id);
  const isNew = profile === null;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>
            {isNew ? "Create your mentor profile" : "Edit your mentor profile"}
          </CardTitle>
          <CardDescription>
            {isNew
              ? setup === "1"
                ? "You need a public mentor profile to use the inbox. Creating one also makes you discoverable in the directory."
                : "Tell learners about your experience and the skills you can teach. Creating a profile makes you discoverable in the directory."
              : "Update your bio, experience, and skills — your public profile updates immediately."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MentorProfileForm
            skills={skills}
            initialBio={profile?.bio}
            initialYears={profile?.experienceYears ?? ""}
            initialSkillIds={profile?.skills.map((row) => row.skillId)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
