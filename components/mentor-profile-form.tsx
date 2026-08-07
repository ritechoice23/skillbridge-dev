"use client";

import { useActionState } from "react";
import { LinkButton } from "@/components/link-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  upsertMentorProfile,
  type ProfileActionState,
} from "@/lib/actions/profiles";

const initialState: ProfileActionState = {
  error: null,
  success: false,
  profileId: null,
};

export function MentorProfileForm({
  skills,
  initialBio = "",
  initialYears = "",
  initialSkillIds = [],
}: {
  skills: { id: string; name: string }[];
  initialBio?: string;
  initialYears?: number | "";
  initialSkillIds?: string[];
}) {
  const [state, formAction, pending] = useActionState(
    upsertMentorProfile,
    initialState,
  );

  if (state.success && state.profileId) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-muted-foreground">
          Your mentor profile is live — learners can now find you in the
          directory.
        </p>
        <div className="flex flex-wrap gap-2">
          <LinkButton href={`/mentors/${state.profileId}`}>
            View your public profile
          </LinkButton>
          <LinkButton variant="outline" href="/mentors">
            Browse the directory
          </LinkButton>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          placeholder="Tell learners about your background and what you can help with."
          rows={4}
          defaultValue={initialBio}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="experienceYears">Years of experience</Label>
        <Input
          id="experienceYears"
          name="experienceYears"
          type="number"
          min={0}
          max={99}
          placeholder="e.g. 5"
          defaultValue={initialYears === "" ? "" : String(initialYears)}
          required
          className="max-w-40"
        />
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm leading-none font-medium select-none">
          Skills you can teach
        </legend>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <label
              key={skill.id}
              className="flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10"
            >
              <input
                type="checkbox"
                name="skillIds"
                value={skill.id}
                defaultChecked={initialSkillIds.includes(skill.id)}
                className="size-4 accent-primary"
              />
              {skill.name}
            </label>
          ))}
        </div>
      </fieldset>
      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
