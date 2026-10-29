"use client";

import { CategoryNav } from "@/components/category-nav";
import { useUiStore } from "@/providers/ui-store-provider";

export function MobileNav() {
  const open = useUiStore((s) => s.mobileNavOpen);
  const close = useUiStore((s) => s.closeMobileNav);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 top-16 z-30 lg:hidden">
      <button type="button" aria-label="Close menu" onClick={close} className="absolute inset-0 bg-black/60" />
      <div className="relative h-full w-72 max-w-[85vw] border-r border-border bg-surface p-3">
        <CategoryNav variant="drawer" />
      </div>
    </div>
  );
}
