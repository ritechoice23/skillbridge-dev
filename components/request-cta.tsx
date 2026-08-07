import Link from "next/link";
import { SendIcon } from "lucide-react";
import { getSession } from "@/lib/auth/dal";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/link-button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export async function RequestCta() {
  const session = await getSession();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request mentorship</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-start gap-3">
        {session ? (
          <>
            <Button disabled>
              <SendIcon />
              Request mentorship
            </Button>
            <p className="text-xs text-muted-foreground">
              Sending requests arrives with the next stage of the build — the
              form will live here.
            </p>
          </>
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
