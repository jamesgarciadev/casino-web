import { Zap } from "lucide-react";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="0dds.bet home">
      <span className="flex size-8 items-center justify-center rounded-md bg-primary shadow-[0_0_20px_-4px_var(--primary)]">
        <Zap className="size-5 text-primary-foreground" />
      </span>
      {/* Mark only on phones, so the nav and account buttons fit in one row. */}
      <span className="hidden font-display text-lg font-extrabold tracking-tight sm:inline">
        0DDS<span className="text-primary">.BET</span>
      </span>
      <span className="ml-1 hidden rounded border border-border px-1.5 py-0.5 font-display text-[10px] text-muted-foreground sm:inline">
        18+
      </span>
    </Link>
  );
}
