import Link from "next/link";
import { HandshakeIcon, MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getSession } from "@/lib/auth/dal";
import { signOut } from "@/lib/actions/auth";

const primaryLinks = [{ href: "/mentors", label: "Find Mentors" }];

export async function Nav() {
  const session = await getSession();
  const user = session?.user;

  const authLinks = user
    ? [{ href: "/dashboard", label: "Dashboard" }]
    : [
        { href: "/login", label: "Sign in" },
        { href: "/signup", label: "Get started" },
      ];

  const mobileLinks = [...primaryLinks, ...authLinks];

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <nav className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <HandshakeIcon className="size-5 text-primary" />
          <span className="font-heading text-base font-semibold tracking-tight">
            SkillBridge
          </span>
        </Link>

        <div className="hidden items-center gap-1 sm:flex">
          {primaryLinks.map((link) => (
            <Button key={link.href} variant="ghost" render={<Link href={link.href} />}>
              {link.label}
            </Button>
          ))}
        </div>

        {user ? (
          <div className="hidden items-center gap-2 sm:flex">
            <span className="max-w-40 truncate text-sm text-muted-foreground">
              {user.name}
            </span>
            <form action={signOut}>
              <Button variant="ghost" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        ) : (
          <div className="hidden items-center gap-2 sm:flex">
            <Button variant="ghost" render={<Link href="/login" />}>
              Sign in
            </Button>
            <Button render={<Link href="/signup" />}>Get started</Button>
          </div>
        )}

        <div className="sm:hidden">
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Open menu" />
              }
            >
              <MenuIcon />
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="sr-only">Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 p-4">
                {mobileLinks.map((link) => (
                  <Button
                    key={link.href}
                    variant="ghost"
                    className="justify-start"
                    render={<Link href={link.href} />}
                  >
                    {link.label}
                  </Button>
                ))}
                {user ? (
                  <form action={signOut}>
                    <Button variant="ghost" type="submit" className="justify-start">
                      Sign out
                    </Button>
                  </form>
                ) : null}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
