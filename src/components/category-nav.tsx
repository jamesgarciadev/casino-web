"use client";

import { usePathname, useRouter } from "next/navigation";

import { categories } from "@/components/nav-items";
import { useUiStore } from "@/providers/ui-store-provider";

type Variant = "header" | "rail" | "drawer";

const styles: Record<Variant, { list: string; item: string; active: string }> = {
  header: {
    list: "ml-4 hidden items-center gap-1 lg:flex",
    item: "rounded-lg px-3 py-2 text-sm font-semibold uppercase tracking-wide text-muted transition-colors hover:bg-surface-3 hover:text-fg",
    active: "text-fg",
  },
  rail: {
    list: "flex flex-col gap-1",
    item: "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-surface-3 hover:text-fg",
    active: "bg-surface-3 text-fg shadow-[inset_3px_0_0_var(--accent)]",
  },
  drawer: {
    list: "flex flex-col",
    item: "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold uppercase tracking-wide text-muted hover:bg-surface-3 hover:text-fg",
    active: "text-accent",
  },
};

export function CategoryNav({ variant }: { variant: Variant }) {
  const router = useRouter();
  const pathname = usePathname();
  const active = useUiStore((s) => s.activeCategory);
  const setActive = useUiStore((s) => s.setActiveCategory);
  const closeMobileNav = useUiStore((s) => s.closeMobileNav);
  const style = styles[variant];

  function select(id: string) {
    setActive(id);
    closeMobileNav();
    if (pathname !== "/") {
      router.push("/");
    }
  }

  return (
    <nav className={style.list}>
      {categories.map((category) => {
        const isActive = pathname === "/" && active === category.id;

        return (
          <button
            key={category.id}
            type="button"
            onClick={() => select(category.id)}
            aria-current={isActive ? "page" : undefined}
            className={`${style.item} ${isActive ? style.active : ""}`}
          >
            {variant !== "header" && (
              <span className={`w-5 text-center ${isActive ? "text-accent" : ""}`} aria-hidden>
                {category.icon}
              </span>
            )}
            {category.label}
          </button>
        );
      })}
    </nav>
  );
}
