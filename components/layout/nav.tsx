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

const primaryLinks = [
  { href: "/mentors", label: "Find Mentors" },
];

const mobileLinks = [
  ...primaryLinks,
  { href: "/auth/login", label: "Sign in" },
  { href: "/auth/signup", label: "Get started" },
];

export function Nav() {
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

        <div className="hidden items-center gap-2 sm:flex">
          <Button variant="ghost" render={<Link href="/auth/login" />}>
            Sign in
          </Button>
          <Button render={<Link href="/auth/signup" />}>Get started</Button>
        </div>

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
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
