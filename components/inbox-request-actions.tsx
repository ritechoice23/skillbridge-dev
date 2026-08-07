"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  respondToRequest,
  type RespondActionState,
} from "@/lib/actions/requests";

const initialState: RespondActionState = { error: null, success: false };

export function InboxRequestActions({ requestId }: { requestId: string }) {
  const [state, formAction, pending] = useActionState(
    respondToRequest,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col items-start gap-2">
      <input type="hidden" name="requestId" value={requestId} />
      <div className="flex gap-2">
        <Button type="submit" name="decision" value="accept" disabled={pending}>
          Accept
        </Button>
        <Button
          type="submit"
          name="decision"
          value="decline"
          variant="outline"
          disabled={pending}
        >
          Decline
        </Button>
      </div>
      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
