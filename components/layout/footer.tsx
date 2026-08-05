import Link from "next/link";
import { HandshakeIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <HandshakeIcon className="size-4 text-primary" />
            <span className="font-heading text-sm font-semibold">
              SkillBridge
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Connecting learners with mentors for practical skills.
          </p>
        </div>
        <Separator />
        <div className="flex flex-col justify-between gap-2 text-sm text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} SkillBridge</span>
          <nav className="flex gap-4">
            <Link href="/mentors" className="hover:text-foreground">
              Find Mentors
            </Link>
            <Link href="/auth/signup" className="hover:text-foreground">
              Become a mentor
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
