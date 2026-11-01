"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import { cn } from "@/lib/cn";

type Props = { href: string; children: ReactNode };

function StyledLink({ href, children, active }: Props & { active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-md px-2 py-2 transition-colors hover:bg-secondary/60 hover:text-foreground sm:px-3",
        active ? "bg-secondary/60 text-foreground" : "text-muted-foreground",
      )}
    >
      {children}
    </Link>
  );
}

function ActiveLink(props: Props) {
  return <StyledLink {...props} active={usePathname().startsWith(props.href)} />;
}

/**
 * A header link highlighted on its section. Dynamic routes (/matches/[id]) only know the path at request time, so the
 * highlight streams in; until then the link renders unhighlighted.
 */
export function NavLink(props: Props) {
  return (
    <Suspense fallback={<StyledLink {...props} active={false} />}>
      <ActiveLink {...props} />
    </Suspense>
  );
}
