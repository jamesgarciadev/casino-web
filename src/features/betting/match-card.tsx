"use client";

import { ChevronRight, Radio, Trophy } from "lucide-react";
import Link from "next/link";

import { Flash } from "@/components/flash";
import { Button } from "@/components/ui/button";
import { currentRound } from "@/features/markets/markets";
import type { Side } from "@/gql/graphql";
import { cn } from "@/lib/cn";
import { useUiStore } from "@/providers/ui-store-provider";

import { GameIcon } from "./game-icon";
import { formatOdds, gameLabel, oddsFor, teamName, type Match } from "./match";

const startFormat = new Intl.DateTimeFormat("en-US", { weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false });

function OddsButton({ match, side }: { match: Match; side: Side }) {
  const selected = useUiStore((s) => s.selections.some((pick) => pick.matchId === match.id && pick.side === side));
  const toggle = useUiStore((s) => s.toggleSelection);
  const odds = oddsFor(match, side);
  const team = teamName(match, side);
  const closed = match.state === "FINISHED";

  return (
    <Button
      variant={selected ? "oddsActive" : "odds"}
      className="h-auto flex-col items-stretch gap-1 rounded-lg px-4 py-3 normal-case"
      aria-pressed={selected}
      aria-label={`${team} to win at ${formatOdds(odds)}`}
      disabled={closed}
      onClick={() => toggle({ matchId: match.id, side })}
    >
      <span className="truncate text-[11px] font-semibold opacity-80">{team}</span>
      <Flash value={odds} className="text-lg font-extrabold tabular-nums">
        {formatOdds(odds)}
      </Flash>
    </Button>
  );
}

function StateBadge({ match }: { match: Match }) {
  if (match.state === "LIVE") {
    return (
      <span className="flex items-center gap-1.5 rounded-full bg-live/15 px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-wider text-live">
        <span className="live-dot size-1.5 rounded-full bg-live" />
        Live
      </span>
    );
  }

  if (match.state === "FINISHED") {
    return (
      <span className="rounded-full border border-border px-2.5 py-1 font-display text-[10px] uppercase tracking-wider text-muted-foreground">
        Final
      </span>
    );
  }

  return (
    <time
      dateTime={match.startsAt}
      // Local time differs between the server and the browser.
      suppressHydrationWarning
      className="rounded-full border border-border px-2.5 py-1 font-display text-[10px] uppercase tracking-wider text-muted-foreground"
    >
      {startFormat.format(new Date(match.startsAt))}
    </time>
  );
}

function TeamName({ match, side }: { match: Match; side: Side }) {
  const won = match.winner === side;

  return (
    <span
      className={cn(
        "flex min-w-0 flex-1 items-center gap-1.5 font-display text-base font-extrabold uppercase",
        side === "A" ? "justify-end text-right" : "justify-start",
      )}
    >
      {won && side === "B" && <Trophy aria-label="Winner" className="size-4 shrink-0 text-accent" />}
      <span className="truncate">{teamName(match, side)}</span>
      {won && side === "A" && <Trophy aria-label="Winner" className="size-4 shrink-0 text-accent" />}
    </span>
  );
}

export function MatchCard({ match }: { match: Match }) {
  const live = match.state === "LIVE";
  const started = match.state !== "UPCOMING";
  // In a series the big score is maps won, so the map in play gets its own line.
  const now = match.bestOf > 1 ? currentRound(match) : null;

  return (
    <article
      aria-label={`${match.teamA} vs ${match.teamB}`}
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card p-5 transition-colors",
        live ? "glow-panel border-primary/45" : "border-border hover:border-primary/30",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 text-xs">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
            <GameIcon game={match.game} className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-xs font-bold">{gameLabel(match)}</p>
            <p className="truncate text-[11px] text-muted-foreground">{match.tournament}</p>
          </div>
        </div>
        <StateBadge match={match} />
      </div>

      <div className="mt-5 flex items-center justify-center gap-3">
        <TeamName match={match} side="A" />
        {started ? (
          <span className="font-display text-xl font-extrabold tabular-nums" aria-label={`Score ${match.scoreA} to ${match.scoreB}`}>
            <Flash value={`${match.scoreA}-${match.scoreB}`} className="px-1">
              {match.scoreA}
              <span className="px-1 text-muted-foreground">:</span>
              {match.scoreB}
            </Flash>
          </span>
        ) : (
          <span className="font-display text-xs font-bold text-muted-foreground">VS</span>
        )}
        <TeamName match={match} side="B" />
      </div>
      {now && (
        <p className="mt-1 text-center text-[11px] text-muted-foreground tabular-nums" data-testid="map-in-play">
          {now.map.name} · {now.map.scoreA}:{now.map.scoreB}
        </p>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3">
        <OddsButton match={match} side="A" />
        <OddsButton match={match} side="B" />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-xs">
        {live && match.streamUrl ? (
          <a
            href={match.streamUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-accent"
          >
            <Radio className="size-3.5" />
            Watch stream
          </a>
        ) : (
          <span />
        )}
        <Link
          href={`/matches/${match.id}`}
          aria-label={`All markets for ${match.teamA} vs ${match.teamB}`}
          className="flex items-center gap-0.5 font-display font-bold text-primary transition-colors hover:text-accent"
        >
          All markets
          <ChevronRight className="size-3.5" />
        </Link>
      </div>
    </article>
  );
}
