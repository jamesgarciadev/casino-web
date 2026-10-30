import type { MatchFieldsFragment, Side } from "@/gql/graphql";

export type Match = MatchFieldsFragment;

/** PandaScore slug => short label from the design. Unknown games fall back to be's name. */
const GAME_LABELS: Record<string, string> = {
  "cs-go": "CS2",
  "league-of-legends": "LoL",
  "r6-siege": "Rainbow Six",
};

export function gameLabel(match: Pick<Match, "game" | "gameName">): string {
  return GAME_LABELS[match.game] ?? match.gameName;
}

export function teamName(match: Match, side: Side): string {
  return side === "A" ? match.teamA : match.teamB;
}

export function oddsFor(match: Match, side: Side): number {
  return side === "A" ? match.oddsA : match.oddsB;
}

/** stake × odds rounded half up to whole credits; the same integer maths as be's Bet::payoutFor. */
export function potentialPayout(stake: number, odds: number): number {
  return Math.floor((stake * Math.round(odds * 100) + 50) / 100);
}

export function formatCredits(credits: number): string {
  return `${credits.toLocaleString("en-US")} CR`;
}

export function formatOdds(odds: number): string {
  return odds.toFixed(2);
}

/** Live first, then soonest start: the order be and the design use. */
export function byLiveThenStart(a: Match, b: Match): number {
  if (a.state === "LIVE" && b.state !== "LIVE") return -1;
  if (b.state === "LIVE" && a.state !== "LIVE") return 1;

  return a.startsAt.localeCompare(b.startsAt);
}
