"use client";

import { useLiveMatches } from "./live-matches";
import { formatOdds, gameLabel, type Match } from "./match";

const active = (m: Match) => m.state !== "FINISHED";

/** Marquee of headline prices that pauses on hover. The second copy makes the loop seamless. */
export function OddsTicker({ initial }: { initial: Match[] }) {
  const items = useLiveMatches(initial, active, 10);

  if (items.length === 0) {
    return null;
  }

  const row = (copy: "a" | "b") => (
    <div className="flex shrink-0 items-center gap-8 pr-8" aria-hidden={copy === "b"}>
      {items.map((m) => (
        <span key={`${copy}-${m.id}`} className="flex items-center gap-2.5 whitespace-nowrap font-display text-xs">
          <span className={m.state === "LIVE" ? "live-dot size-1.5 rounded-full bg-live" : "size-1.5 rounded-full bg-primary/60"} />
          <span className="font-bold text-primary">{gameLabel(m).toUpperCase()}</span>
          <span className="text-foreground/85">
            {m.teamA} <span className="text-muted-foreground">vs</span> {m.teamB}
          </span>
          <span className="tabular-nums text-accent">{formatOdds(m.oddsA)}</span>
          <span className="tabular-nums text-accent">{formatOdds(m.oddsB)}</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="overflow-hidden border-y border-border/70 bg-card/50 py-3" aria-label="Headline odds">
      <div className="ticker-track flex w-max">
        {row("a")}
        {row("b")}
      </div>
    </div>
  );
}
