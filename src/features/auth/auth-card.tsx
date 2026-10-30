import { Coins, Zap } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

/** The design's auth panel: crimson-glow card over the arena grid. */
export function AuthCard({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string;
  subtitle: string;
  footer: { text: string; href: string; link: string };
  children: ReactNode;
}) {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-16">
      <div className="arena-grid pointer-events-none absolute inset-0 opacity-30" />
      <div className="glow-panel relative w-full max-w-md rounded-2xl border border-primary/30 bg-card p-6 sm:p-8">
        <div className="text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary shadow-[0_0_30px_-6px_var(--primary)]">
            <Zap className="size-6 text-primary-foreground" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-extrabold uppercase">{title}</h1>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
            <Coins className="size-4 text-accent" />
            {subtitle}
          </p>
        </div>
        <div className="mt-6">{children}</div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {footer.text}{" "}
          <Link href={footer.href} className="font-semibold text-primary hover:underline">
            {footer.link}
          </Link>
        </p>
      </div>
    </main>
  );
}
