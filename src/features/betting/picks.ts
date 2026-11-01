import type { Market } from "@/features/markets/markets";
import type { SlipSelection } from "@/stores/ui-store";

import { oddsFor, teamName, type Match } from "./match";

/** Why a pick can't be bet on right now. */
export type PickBlock = "closed" | "suspended" | null;

export type ResolvedPick = SlipSelection & { match: Match; label: string; odds: number; blocked: PickBlock };

/**
 * A slip pick with its newest odds. Side picks read the match itself. Market picks read the markets the live store
 * holds for the match (pushed while its page is open), and fall back to the odds when picked; a market that has
 * left the open list has settled, so the pick is closed.
 */
export function resolvePick(selection: SlipSelection, match: Match, markets: Market[] | undefined): ResolvedPick {
  if (selection.side !== undefined) {
    return {
      ...selection,
      match,
      label: `${teamName(match, selection.side)} to win`,
      odds: oddsFor(match, selection.side),
      blocked: match.state === "FINISHED" ? "closed" : null,
    };
  }

  const market = markets?.find((m) => m.outcomes.some((o) => o.id === selection.outcomeId));
  const outcome = market?.outcomes.find((o) => o.id === selection.outcomeId);
  const blocked: PickBlock =
    match.state === "FINISHED" || (markets !== undefined && market === undefined)
      ? "closed"
      : market?.status === "SUSPENDED"
        ? "suspended"
        : null;

  return { ...selection, match, odds: outcome?.odds ?? selection.odds, blocked };
}

/** What placeBetAction sends for a pick: its side, or its outcome. */
export function pickInput(pick: SlipSelection): { matchId: string; side: "A" | "B" } | { matchId: string; outcomeId: string } {
  return pick.side !== undefined ? { matchId: pick.matchId, side: pick.side } : { matchId: pick.matchId, outcomeId: pick.outcomeId };
}
