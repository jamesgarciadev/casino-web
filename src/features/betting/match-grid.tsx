"use client";

import { Gamepad2 } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button";

import { useLiveMatches } from "./live-matches";
import type { Match } from "./match";
import { MatchCard } from "./match-card";

export type MatchFilter = "live" | "upcoming" | "active";

// Module-level so useLiveMatches can memoize on them.
const filters: Record<MatchFilter, (m: Match) => boolean> = {
  live: (m) => m.state === "LIVE",
  upcoming: (m) => m.state === "UPCOMING",
  active: (m) => m.state !== "FINISHED",
};

const byGame = new Map<string, (m: Match) => boolean>();

function filterFor(kind: MatchFilter, game?: string): (m: Match) => boolean {
  if (!game) {
    return filters[kind];
  }

  const key = `${kind}:${game}`;

  if (!byGame.has(key)) {
    byGame.set(key, (m) => m.game === game && filters[kind](m));
  }

  return byGame.get(key)!;
}

/** Server-rendered matches that keep updating live: scores, odds, new matches, finished ones dropping out. */
export function MatchGrid({
  initial,
  filter,
  game,
  limit,
  empty,
}: {
  initial: Match[];
  filter: MatchFilter;
  game?: string;
  limit?: number;
  empty?: ReactNode;
}) {
  const matches = useLiveMatches(initial, filterFor(filter, game), limit);

  if (matches.length === 0) {
    return (
      empty ?? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card/50 py-20 text-center">
          <Gamepad2 className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No matches in this game right now.</p>
          <Link href="/matches" className={buttonVariants({ variant: "outline" })}>
            Show all matches
          </Link>
        </div>
      )
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  );
}
