import type { Metadata } from "next";
import { requireMentorProfile } from "@/lib/auth/dal";
import { getInbox } from "@/lib/actions/inbox";
import { InboxRequestActions } from "@/components/inbox-request-actions";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Inbox",
};

export default async function MentorInboxPage() {
  const { profile } = await requireMentorProfile();
  const requests = await getInbox(profile.id);

  return (
    <div className="flex flex-col gap-4">
      {requests.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No requests yet</CardTitle>
            <CardDescription>
              When a learner asks you to mentor them, their request will
              show up here.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <CardTitle>{request.requesterName}</CardTitle>
                    <CardDescription>
                      {skillLabel(request.skills)}
                    </CardDescription>
                  </div>
                  <StatusBadge status={request.status} />
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  {request.message}
                </p>
                {request.status === "pending" ? (
                  <InboxRequestActions requestId={request.id} />
                ) : request.decidedAt ? (
                  <p className="text-xs text-muted-foreground">
                    You{" "}
                    {request.status === "accepted" ? "accepted" : "declined"}{" "}
                    this request on{" "}
                    {request.decidedAt.toLocaleDateString("en-US", {
                      dateStyle: "medium",
                    })}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const label =
    status === "accepted"
      ? "Accepted"
      : status === "declined"
        ? "Declined"
        : "Pending";

  const variant =
    status === "accepted"
      ? "default"
      : status === "declined"
        ? "destructive"
        : "secondary";

  return <Badge variant={variant}>{label}</Badge>;
}

function skillLabel(skills: string[]): string {
  if (skills.length === 0) {
    return "No specific skill";
  }
  return skills.join(", ");
}
