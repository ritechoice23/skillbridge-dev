import type { Prisma } from "@/lib/generated/prisma/client";
import { ArrowRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/link-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type MentorWithRelations = Prisma.MentorProfileGetPayload<{
  include: {
    user: { select: { name: true } };
    skills: { include: { skill: { select: { name: true } } } };
  };
}>;

function formatExperience(years: number): string {
  return `${years} ${years === 1 ? "year" : "years"}`;
}

export function MentorCard({ mentor }: { mentor: MentorWithRelations }) {
  return (
    <Card size="sm" className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle>{mentor.user.name}</CardTitle>
          <Badge variant="secondary">{formatExperience(mentor.experienceYears)}</Badge>
        </div>
        <CardDescription className="line-clamp-3">{mentor.bio}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-start">
        <div className="flex flex-wrap gap-1.5">
          {mentor.skills.map(({ skill }) => (
            <Badge key={skill.name} variant="outline">
              {skill.name}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <LinkButton size="sm" className="w-full" href={`/mentors/${mentor.id}`}>
          View profile
          <ArrowRightIcon data-icon="inline-end" />
        </LinkButton>
      </CardFooter>
    </Card>
  );
}
