import type { Metadata } from "next";
import { getMentorDirectory } from "@/lib/actions/mentors";
import { LinkButton } from "@/components/link-button";
import { MentorCard } from "@/components/mentor-card";
import { MentorFilters } from "@/components/mentor-filters";

export const metadata: Metadata = {
  title: "Find Mentors",
};

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return firstValue(value[0]);
  }
  return typeof value === "string" ? value.trim() : "";
}

export default async function MentorsPage({
  searchParams,
}: PageProps<"/mentors">) {
  const { q, skill } = await searchParams;
  const search = firstValue(q);
  const skillFilter = firstValue(skill);

  const { mentors, skills } = await getMentorDirectory({
    q: search || undefined,
    skill: skillFilter || undefined,
  });

  const hasFilters = Boolean(search || (skillFilter && skillFilter !== "all"));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Find Mentors
        </h1>
        <p className="text-muted-foreground">
          Browse mentors and filter by the skill you want to learn.
        </p>
      </div>

      <MentorFilters q={search} skill={skillFilter} skills={skills} />

      {mentors.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mentors.map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
          <p className="font-heading font-medium">No mentors found</p>
          <p className="text-sm text-muted-foreground">
            Try a different search or skill filter.
          </p>
          {hasFilters ? (
            <LinkButton variant="outline" href="/mentors">
              Clear filters
            </LinkButton>
          ) : null}
        </div>
      )}
    </div>
  );
}
