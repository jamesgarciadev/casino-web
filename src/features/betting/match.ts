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

const MAX_TOTAL_ODDS = 1_000_000;

/**
 * A combo's total odds: the picks' odds multiplied in whole cents, rounding half up after each pick and capped,
 * the same integer maths as be's Bet::totalOdds.
 */
export function totalOdds(odds: number[]): number {
  let cents = 100;

  for (const pick of odds) {
    cents = Math.min(Math.floor((cents * Math.round(pick * 100) + 50) / 100), MAX_TOTAL_ODDS * 100);
  }

  return cents / 100;
}

/** stake × odds rounded half up to whole credits; the same integer maths as be's Bet::payoutFor. */
export function potentialPayout(stake: number, odds: number): number {
  return Math.floor((stake * Math.round(odds * 100) + 50) / 100);
}

/**
 * What an open single is worth now: stake × placed odds ÷ current odds, rounded half up to whole credits. The same
 * integer maths as be's Bet::cashOutValue.
 */
export function cashOutValue(stake: number, placedOdds: number, currentOdds: number): number {
  const placed = Math.round(placedOdds * 100);
  const current = Math.round(currentOdds * 100);

  return Math.floor((2 * stake * placed + current) / (2 * current));
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
