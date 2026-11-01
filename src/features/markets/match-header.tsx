import { Radio, Trophy } from "lucide-react";

import { Flash } from "@/components/flash";
import { GameIcon } from "@/features/betting/game-icon";
import { gameLabel, teamName, type Match } from "@/features/betting/match";
import type { Side } from "@/gql/graphql";
import { cn } from "@/lib/cn";

import { currentRound } from "./markets";

/** Regulation length of a map in rounds, for "R: 14/24"; overtime simply runs past it. */
const REGULATION_ROUNDS: Record<string, number> = { "cs-go": 24, valorant: 24 };

function MapDots({ match, side }: { match: Match; side: Side }) {
  const toWin = Math.floor(match.bestOf / 2) + 1;
  const won = side === "A" ? match.scoreA : match.scoreB;

  if (match.bestOf < 3) {
    return null;
  }

  return (
    <span className="flex gap-1" aria-label={`${won} of ${toWin} maps won`}>
      {Array.from({ length: toWin }, (_, i) => (
        <span key={i} className={cn("size-1.5 rounded-full", i < won ? "bg-primary" : "border border-muted-foreground/50")} />
      ))}
    </span>
  );
}

/**
 * The match page header from the design: series length, the map in play and its round, the series score, and a
 * table of every map's score.
 */
export function MatchHeader({ match }: { match: Match }) {
  const now = currentRound(match);
  const regulation = REGULATION_ROUNDS[match.game];
  const started = match.state !== "UPCOMING";

  return (
    <section
      aria-label={`${match.teamA} vs ${match.teamB}`}
      className={cn("overflow-hidden rounded-2xl border bg-card", match.state === "LIVE" ? "glow-panel border-primary/45" : "border-border")}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-3 text-xs">
        {/* The series line stays whole; the tournament name gives way on narrow screens. */}
        <p className="flex shrink-0 items-center gap-2 font-display font-bold">
          <GameIcon game={match.game} className="size-4 shrink-0 text-primary" />
          <span className="whitespace-nowrap">
            BO{match.bestOf}
            {now && `: ${now.map.name}`}
            {now && regulation && ` R: ${now.played + 1 > regulation ? `OT ${now.played + 1}` : `${now.played + 1}/${regulation}`}`}
          </span>
        </p>
        <p className="truncate text-muted-foreground">
          {gameLabel(match)} · {match.tournament}
        </p>
      </div>

      <div className="flex items-center justify-center gap-4 px-5 py-8">
        {(["A", "B"] as const).map((side) => (
          <div key={side} className={cn("flex min-w-0 flex-1 flex-col items-center gap-2", side === "A" ? "order-1" : "order-3")}>
            <span className="flex items-center gap-1.5 truncate text-center font-display text-lg font-extrabold uppercase">
              {match.winner === side && <Trophy aria-label="Winner" className="size-4 text-accent" />}
              {teamName(match, side)}
            </span>
            <MapDots match={match} side={side} />
          </div>
        ))}
        <div className="order-2 shrink-0 text-center">
          {started ? (
            <Flash value={`${match.scoreA}-${match.scoreB}`} className="font-display text-4xl font-extrabold tabular-nums">
              {match.scoreA}
              <span className="px-2 text-muted-foreground">:</span>
              {match.scoreB}
            </Flash>
          ) : (
            <span className="font-display text-sm font-bold text-muted-foreground">VS</span>
          )}
          {match.state === "LIVE" && (
            <p className="mt-1 flex items-center justify-center gap-1.5 font-display text-[10px] font-bold uppercase tracking-wider text-live">
              <span className="live-dot size-1.5 rounded-full bg-live" />
              Live
            </p>
          )}
        </div>
      </div>

      {match.maps.length > 0 && (
        <div className="overflow-x-auto border-t border-border/60 px-5 py-3">
          <table className="w-full text-xs">
            <caption className="sr-only">Score per map</caption>
            <thead>
              <tr className="text-muted-foreground">
                <th scope="col" className="py-1 text-left font-normal">
                  Team
                </th>
                {match.maps.map((map) => (
                  <th key={map.number} scope="col" className="w-12 py-1 text-right font-normal" title={map.name}>
                    {map.name.slice(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(["A", "B"] as const).map((side) => (
                <tr key={side}>
                  <th scope="row" className="truncate py-1 text-left font-display font-bold">
                    {teamName(match, side)}
                  </th>
                  {match.maps.map((map) => (
                    <td
                      key={map.number}
                      className={cn("py-1 text-right tabular-nums", map.winner === side ? "font-bold text-foreground" : "text-muted-foreground")}
                    >
                      {side === "A" ? map.scoreA : map.scoreB}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {match.state === "LIVE" && match.streamUrl && (
        <a
          href={match.streamUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-1.5 border-t border-border/60 py-3 text-xs text-muted-foreground transition-colors hover:text-accent"
        >
          <Radio className="size-3.5" />
          Watch stream
        </a>
      )}
    </section>
  );
}
