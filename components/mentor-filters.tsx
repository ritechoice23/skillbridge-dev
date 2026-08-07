import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LinkButton } from "@/components/link-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function MentorFilters({
  q,
  skill,
  skills,
}: {
  q: string;
  skill: string;
  skills: { id: string; name: string }[];
}) {
  const hasFilters = Boolean(q || (skill && skill !== "all"));

  return (
    <form action="/mentors" method="get" className="flex flex-col gap-2 sm:flex-row">
      <div className="relative flex-1">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by name or bio"
          aria-label="Search mentors"
          className="pl-8"
        />
      </div>
      <Select name="skill" defaultValue={skill || "all"}>
        <SelectTrigger className="w-full sm:w-56" aria-label="Filter by skill">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All skills</SelectItem>
          {skills.map((s) => (
            <SelectItem key={s.id} value={s.name}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex gap-2">
        <Button type="submit">Search</Button>
        {hasFilters ? (
          <LinkButton variant="ghost" href="/mentors">
            Clear
          </LinkButton>
        ) : null}
      </div>
    </form>
  );
}
