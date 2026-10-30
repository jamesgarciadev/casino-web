"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const active = usePathname().startsWith(href);

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
