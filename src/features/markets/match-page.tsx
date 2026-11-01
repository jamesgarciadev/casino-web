"use client";

import { MatchHeader } from "./match-header";
import { MatchMarkets } from "./match-markets";
import { useMatchMarkets, type MatchWithMarkets } from "./use-match-markets";

/** The live match page: header and markets, both following this match's pushes. */
export function MatchPage({ initial }: { initial: MatchWithMarkets }) {
  const { match, markets } = useMatchMarkets(initial);

  return (
    <>
      <MatchHeader match={match} />
      <div className="mt-6">
        <MatchMarkets match={match} markets={markets} />
      </div>
    </>
  );
}
