import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { LiveStatus } from "@/features/betting/live-status";
import { MatchGrid } from "@/features/betting/match-grid";
import { gameLabel } from "@/features/betting/match";
import { getMatches } from "@/features/betting/queries";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Matches & live odds",
  description: "Live and upcoming CS2, Valorant, Dota 2 and LoL matches. Tap an odds button to build your bet slip.",
};

export default function MatchesPage({ searchParams }: PageProps<"/matches">) {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 pb-28 sm:px-6">
      <p className="font-display text-[11px] font-bold uppercase tracking-[0.3em] text-primary">Markets</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold uppercase">All matches</h1>
      <p className="mt-2 text-sm text-muted-foreground">Tap an odds button to add it to your bet slip.</p>

      <Suspense fallback={<div className="mt-8 h-64 animate-pulse rounded-xl bg-card" />}>
        <FilteredMatches searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function FilteredMatches({ searchParams }: Pick<PageProps<"/matches">, "searchParams">) {
  const { game } = await searchParams;
  const active = typeof game === "string" && game !== "" ? game : undefined;
  const matches = await getMatches();
  const games = [...new Map(matches.map((m) => [m.game, gameLabel(m)]))];

  const chip = (href: string, label: string, selected: boolean) => (
    <Link
      key={href}
      href={href}
      aria-current={selected ? "page" : undefined}
      className={cn(
        "rounded-lg border px-4 py-2 font-display text-xs font-bold uppercase tracking-wider transition-colors",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <nav aria-label="Games" className="flex flex-wrap gap-2">
          {chip("/matches", "All", active === undefined)}
          {games.map(([slug, label]) => chip(`/matches?game=${slug}`, label, slug === active))}
        </nav>
        {/* Client state from the live provider, so it renders with the streamed matches rather than the static shell. */}
        <LiveStatus />
      </div>

      <div className="mt-8">
        <MatchGrid initial={matches} filter="active" game={active} />
      </div>
    </>
  );
}
