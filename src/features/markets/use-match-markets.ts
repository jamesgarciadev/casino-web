"use client";

import { useEffect, useMemo } from "react";
import { useClient } from "urql";

import {
  useApplyMarkets,
  useApplyMatch,
  useKnownMarkets,
  useLiveMatch,
  useLiveSubscription,
  useSeedMatches,
} from "@/features/betting/live-matches";
import type { Match } from "@/features/betting/match";
import type { MatchMarketsQuery as MatchMarketsResult } from "@/gql/graphql";
import { MatchMarketsQuery, MatchMarketsUpdatedSubscription } from "@/lib/graphql/operations";

import type { Market } from "./markets";

export type MatchWithMarkets = NonNullable<MatchMarketsResult["match"]>;

const POLL_MS = 10_000;

/** Split a pushed or polled match into the match itself and its markets, then store both. */
function useStoreMatch(): (match: MatchWithMarkets) => void {
  const applyMatch = useApplyMatch();
  const applyMarkets = useApplyMarkets();

  return ({ markets, ...match }: MatchWithMarkets) => {
    applyMatch(match as Match);
    applyMarkets(match.id, markets);
  };
}

/**
 * The match page's live data: the match and its open and suspended markets. Subscribes to this match's updates
 * over the shared socket, and polls while the socket is down. The markets go into the live store, so the bet slip
 * shows their current odds wherever the player goes next.
 */
export function useMatchMarkets(initial: MatchWithMarkets): { match: Match; markets: Market[] } {
  const { markets: initialMarkets, ...initialMatch } = initial;
  const seedMatch = useMemo(() => [initialMatch as Match], [initial]); // eslint-disable-line react-hooks/exhaustive-deps
  const applyMarkets = useApplyMarkets();
  const store = useStoreMatch();
  const client = useClient();
  const id = initial.id;

  useSeedMatches(seedMatch);
  useEffect(() => applyMarkets(id, initialMarkets), [applyMarkets, id, initialMarkets]);

  const refetch = async () => {
    const result = await client.query(MatchMarketsQuery, { id }, { requestPolicy: "network-only" }).toPromise();

    if (result.data?.match) {
      store(result.data.match);
    }
  };

  const live = useLiveSubscription(
    MatchMarketsUpdatedSubscription,
    { id },
    (data) => {
      if (data.matchUpdated) {
        store(data.matchUpdated);
      }
    },
    // Updates between the server render and joining the channel were never pushed to us.
    refetch,
  );

  useEffect(() => {
    if (live) {
      return;
    }

    const timer = setInterval(refetch, POLL_MS);

    return () => clearInterval(timer);
    // `refetch` is rebuilt each render; it only closes over the client, the id and stable store actions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, client, id]);

  return { match: useLiveMatch(initialMatch as Match), markets: useKnownMarkets(id) ?? initialMarkets };
}
