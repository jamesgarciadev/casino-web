import type { BetFieldsFragment, BetStatus } from "@/gql/graphql";

export type Bet = BetFieldsFragment;

export type BetPick = Bet["selections"][number];

export const BET_STATUS_STYLES: Record<BetStatus, string> = {
  PENDING: "border-accent/40 bg-accent/10 text-accent",
  WON: "border-live/40 bg-live/10 text-live",
  LOST: "border-destructive/40 bg-destructive/10 text-destructive",
};

export function pickTeam(pick: BetPick): string {
  return pick.side === "A" ? pick.match.teamA : pick.match.teamB;
}

/** "NAVI to win" for a single, "Combo of 3" for a combo: the name lists use for a bet. */
export function betLabel(bet: Bet): string {
  return bet.type === "COMBO" ? `Combo of ${bet.selections.length}` : `${pickTeam(bet.selections[0])} to win`;
}
