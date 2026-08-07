import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/dal";
import { getMyRequests } from "@/lib/actions/dashboard";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/link-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "My Requests",
};

export default async function DashboardPage() {
  const session = await requireUser();
  const requests = await getMyRequests(session.user.id);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-10">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Welcome, {session.user.name}
      </h1>

      {requests.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No requests yet</CardTitle>
            <CardDescription>
              Find a mentor and send your first mentorship request.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LinkButton href="/mentors">Find a mentor</LinkButton>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <CardTitle>{request.mentorName}</CardTitle>
                    <CardDescription>{skillLabel(request.skills)}</CardDescription>
                  </div>
                  <StatusBadge status={request.status} />
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">{request.message}</p>
                {request.decidedAt ? (
                  <p className="text-xs text-muted-foreground">
                    {request.status === "accepted" ? "Accepted" : "Declined"} on{" "}
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
