import { Suspense } from "react";

import { HeaderAccount } from "@/components/header-account";
import { Logo } from "@/components/logo";
import { NavLink } from "@/components/nav-link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
        <Logo />

        <nav aria-label="Main" className="flex items-center gap-1 font-display text-xs font-bold uppercase tracking-wider sm:gap-2 sm:text-sm">
          <NavLink href="/matches">Matches</NavLink>
          <NavLink href="/my-bets">My bets</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          {/* Reads the session cookie, so it streams in behind the static header shell. */}
          <Suspense fallback={<span className="h-8 w-24 animate-pulse rounded-md bg-secondary" />}>
            <HeaderAccount />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
