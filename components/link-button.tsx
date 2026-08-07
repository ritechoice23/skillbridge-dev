import type { ComponentProps } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type LinkButtonProps = { href: string } & Omit<
  ComponentProps<typeof Button>,
  "render"
>;

export function LinkButton({ href, children, ...props }: LinkButtonProps) {
  return (
    <Button nativeButton={false} {...props} render={<Link href={href} />}>
      {children}
    </Button>
  );
}
