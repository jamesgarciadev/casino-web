import { Suspense } from "react";

import { CategoryNav } from "@/components/category-nav";
import { HeaderAccount } from "@/components/header-account";
import { Logo } from "@/components/logo";
import { MobileNavToggle } from "@/components/mobile-nav-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4">
        <MobileNavToggle />
        <Logo />

        <CategoryNav variant="header" />

        <div className="ml-auto flex items-center gap-2">
          {/* Reads the session cookie, so it streams in behind the static header shell. */}
          <Suspense fallback={<div className="h-10 w-40 animate-pulse rounded-lg bg-surface-3" />}>
            <HeaderAccount />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
