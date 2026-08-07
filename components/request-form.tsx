"use client";

import { useActionState } from "react";
import { LinkButton } from "@/components/link-button";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createMentorshipRequest,
  type RequestActionState,
} from "@/lib/actions/requests";

const initialState: RequestActionState = { error: null, success: false };

export function RequestForm({
  mentorProfileId,
  skills,
}: {
  mentorProfileId: string;
  skills: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(
    createMentorshipRequest,
    initialState,
  );

  if (state.success) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-muted-foreground">
          Your request was sent. The mentor will get back to you soon.
        </p>
        <LinkButton href="/dashboard">
          Track it on your dashboard
        </LinkButton>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="mentorProfileId" value={mentorProfileId} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Tell them what you want to learn and why."
          rows={4}
          required
        />
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm leading-none font-medium select-none">
          Skills (optional)
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
                className="size-4 accent-primary"
              />
              {skill.name}
            </label>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Pick one or more skills, or leave empty for a general request.
        </p>
      </fieldset>
      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send request"}
      </Button>
    </form>
  );
}
