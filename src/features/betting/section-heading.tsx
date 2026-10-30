import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export function SectionHeading({ kicker, title, href }: { kicker: string; title: ReactNode; href?: string }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <p className="font-display text-[11px] font-bold uppercase tracking-[0.3em] text-primary">{kicker}</p>
        <h2 className="mt-2 font-display text-2xl font-extrabold uppercase sm:text-3xl">{title}</h2>
      </div>
      {href && (
        <Link
          href={href}
          className="flex shrink-0 items-center gap-1 font-display text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
        >
          View all <ArrowRight className="size-3.5" />
        </Link>
      )}
    </div>
  );
}
