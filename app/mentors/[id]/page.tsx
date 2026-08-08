import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { getMentorProfile } from "@/lib/actions/mentors";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/link-button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { RequestCta } from "@/components/request-cta";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function generateMetadata({
  params,
}: PageProps<"/mentors/[id]">): Promise<Metadata> {
  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return { title: "Mentor Profile" };
  }

  const profile = await getMentorProfile(id);
  if (!profile) {
    return { title: "Mentor Profile" };
  }

  const skillNames = profile.skills
    .map(({ skill }) => skill.name)
    .join(", ");

  return {
    title: profile.user.name,
    description: skillNames
      ? `${profile.user.name} offers mentorship in ${skillNames}.`
      : `${profile.user.name} is available as a mentor on SkillBridge.`,
  };
}

export default async function MentorProfilePage({
  params,
}: PageProps<"/mentors/[id]">) {
  const { id } = await params;
  if (!UUID_RE.test(id)) {
    notFound();
  }

  const profile = await getMentorProfile(id);
  if (!profile) {
    notFound();
  }

  const years =
    profile.experienceYears === 1
      ? "1 year"
      : `${profile.experienceYears} years`;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-10">
      <LinkButton
        variant="ghost"
        size="sm"
        className="w-fit"
        href="/mentors"
      >
        <ArrowLeftIcon />
        All mentors
      </LinkButton>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              {profile.user.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {years} of experience
            </p>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <h2 className="font-heading text-sm font-medium">About</h2>
            <p className="text-muted-foreground">{profile.bio}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className="font-heading text-sm font-medium">
              Skills they can mentor you in
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map(({ skill }) => (
                <Badge key={skill.name} variant="outline">
                  {skill.name}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <RequestCta
        mentorProfileId={profile.id}
        skills={profile.skills.map(({ skill }) => ({
          id: skill.id,
          name: skill.name,
        }))}
      />
    </div>
  );
}
