import Link from "next/link";
import { BellIcon, HandshakeIcon, MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/link-button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getSession, isMentor } from "@/lib/auth/dal";
import { getUnreadNotificationCount } from "@/lib/actions/notifications";
import { signOut } from "@/lib/actions/auth";

const primaryLinks = [{ href: "/mentors", label: "Find Mentors" }];

export async function Nav() {
  const session = await getSession();
  const user = session?.user;
  const mentor = user ? await isMentor() : false;
  const unreadNotifications = user
    ? await getUnreadNotificationCount(user.id)
    : 0;

  const authLinks = user
    ? [
        { href: "/dashboard", label: "My Requests" },
        { href: "/profile", label: "Mentor Profile" },
        ...(mentor ? [{ href: "/inbox", label: "Inbox" }] : []),
      ]
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
          {(user ? [...primaryLinks, ...authLinks] : primaryLinks).map(
            (link) => (
              <LinkButton key={link.href} href={link.href} variant="ghost">
                {link.label}
              </LinkButton>
            ),
          )}
        </div>

        {user ? (
          <div className="hidden items-center gap-2 sm:flex">
            <Link
              href="/notifications"
              aria-label={`Notifications${unreadNotifications > 0 ? ` (${unreadNotifications} unread)` : ""}`}
              className="relative rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <BellIcon className="size-5" />
              {unreadNotifications > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-none font-semibold text-primary-foreground">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              ) : null}
            </Link>
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
            <LinkButton href="/login" variant="ghost">
              Sign in
            </LinkButton>
            <LinkButton href="/signup">Get started</LinkButton>
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
                  <LinkButton
                    key={link.href}
                    href={link.href}
                    variant="ghost"
                    className="justify-start"
                  >
                    {link.label}
                  </LinkButton>
                ))}
                {user ? (
                  <>
                    <LinkButton
                      href="/notifications"
                      variant="ghost"
                      className="justify-start"
                    >
                      Notifications
                      {unreadNotifications > 0
                        ? ` (${unreadNotifications})`
                        : ""}
                    </LinkButton>
                    <form action={signOut}>
                      <Button
                        variant="ghost"
                        type="submit"
                        className="justify-start"
                      >
                        Sign out
                      </Button>
                    </form>
                  </>
                ) : null}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
