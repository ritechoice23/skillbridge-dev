import Link from "next/link";
import { SendIcon } from "lucide-react";
import { getSession } from "@/lib/auth/dal";
import { LinkButton } from "@/components/link-button";
import { RequestForm } from "@/components/request-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export async function RequestCta({
  mentorProfileId,
  skills,
}: {
  mentorProfileId: string;
  skills: { id: string; name: string }[];
}) {
  const session = await getSession();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request mentorship</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-start gap-3">
        {session ? (
          <RequestForm mentorProfileId={mentorProfileId} skills={skills} />
        ) : (
          <>
            <LinkButton href="/login">
              <SendIcon />
              Sign in to request mentorship
            </LinkButton>
            <p className="text-xs text-muted-foreground">
              New to SkillBridge?{" "}
              <Link
                href="/signup"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Create an account
              </Link>
              .
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
