import { pickLabel, type Market } from "@/features/markets/markets";
import type { BetFieldsFragment, BetStatus } from "@/gql/graphql";

import type { Match } from "./match";

export type Bet = BetFieldsFragment;

export type BetPick = Bet["selections"][number];

export const BET_STATUS_STYLES: Record<BetStatus, string> = {
  PENDING: "border-accent/40 bg-accent/10 text-accent",
  WON: "border-live/40 bg-live/10 text-live",
  LOST: "border-destructive/40 bg-destructive/10 text-destructive",
  CASHED_OUT: "border-border bg-secondary text-foreground",
};

/** "cashed out" for CASHED_OUT: how statuses read in labels and badges. */
export function statusLabel(status: BetStatus): string {
  return status.toLowerCase().replace("_", " ");
}

/** "NAVI to win", or "Map 3 - Total rounds · Over 22.5" for other markets. */
export function pickName(pick: BetPick): string {
  return pickLabel(pick.market, pick.outcome.key, pick.match);
}

/** The pick's name for a single, "Combo of 3" for a combo: the name lists use for a bet. */
export function betLabel(bet: Bet): string {
  return bet.type === "COMBO" ? `Combo of ${bet.selections.length}` : pickName(bet.selections[0]);
}

/**
 * The pick's current odds from live data, or its odds when the bets were loaded; null once its market has stopped
 * taking bets (settled or suspended), or the match has finished.
 */
export function liveOdds(pick: BetPick, match: Match, markets: Market[] | undefined): number | null {
  if (match.state === "FINISHED") {
    return null;
  }

  if (pick.market.type === "WINNER") {
    return pick.outcome.key === "a" ? match.oddsA : match.oddsB;
  }

  if (markets === undefined) {
    return pick.market.status === "OPEN" ? pick.outcome.odds : null;
  }

  const market = markets.find((m) => m.id === pick.market.id);

  return market?.status === "OPEN" ? (market.outcomes.find((o) => o.id === pick.outcome.id)?.odds ?? null) : null;
}

/** Whether live data shows the pick's market has left the open list, i.e. be has settled it. */
export function marketSettled(pick: BetPick, markets: Market[] | undefined): boolean {
  return pick.market.type !== "WINNER" && markets !== undefined && !markets.some((m) => m.id === pick.market.id);
}
