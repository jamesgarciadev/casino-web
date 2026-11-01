import "server-only";

import type { MatchState } from "@/gql/graphql";
import { MatchesQuery, MatchMarketsQuery, MyBetsQuery, WalletQuery } from "@/lib/graphql/operations";
import { gqlRequest } from "@/lib/graphql/server";

import type { Match } from "./match";

/** Public: live and upcoming matches unless a state is given. */
export async function getMatches(variables: { state?: MatchState; game?: string } = {}): Promise<Match[]> {
  const { data } = await gqlRequest(MatchesQuery, variables, { token: null });

  return data?.matches ?? [];
}

/** Public: one match with its open and suspended markets, or null if there is no such match. */
export async function getMatchWithMarkets(id: string) {
  const { data } = await gqlRequest(MatchMarketsQuery, { id }, { token: null });

  return data?.match ?? null;
}

/** The signed-in player's balance, or null when signed out or the session has expired. */
export async function getWalletBalance(): Promise<number | null> {
  const { data } = await gqlRequest(WalletQuery);

  return data?.wallet.balance ?? null;
}

export async function getMyBets() {
  const { data } = await gqlRequest(MyBetsQuery);

  return data?.myBets ?? [];
}
