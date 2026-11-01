"use client";

import { Bookmark, ChevronDown } from "lucide-react";
import { useState } from "react";

import { Flash } from "@/components/flash";
import { Button } from "@/components/ui/button";
import { formatOdds, type Match } from "@/features/betting/match";
import type { Side } from "@/gql/graphql";
import { cn } from "@/lib/cn";
import { useUiStore } from "@/providers/ui-store-provider";
import { samePick, type SlipSelection } from "@/stores/ui-store";

import { inTab, marketTitle, outcomeLabel, pickLabel, TAB_ORDER, tabLabel, type Market, type Outcome, type TabId } from "./markets";

/** Markets that share a title (lines of one total, the next few round winners) form one section, one row each. */
function sections(markets: Market[], match: Match): { title: string; markets: Market[] }[] {
  const byTitle = new Map<string, Market[]>();

  for (const market of markets) {
    const title = marketTitle(market, match);
    byTitle.set(title, [...(byTitle.get(title) ?? []), market]);
  }

  return [...byTitle].map(([title, list]) => ({ title, markets: list }));
}

/** The slip pick an outcome makes: winner outcomes are a side, so they match the odds on the match cards. */
function selectionFor(match: Match, market: Market, outcome: Outcome): SlipSelection {
  return market.type === "WINNER"
    ? { matchId: match.id, side: outcome.key.toUpperCase() as Side }
    : { matchId: match.id, outcomeId: outcome.id, label: pickLabel(market, outcome.key, match), odds: outcome.odds };
}

function OutcomeButton({ match, market, outcome }: { match: Match; market: Market; outcome: Outcome }) {
  const selection = selectionFor(match, market, outcome);
  const selected = useUiStore((s) => s.selections.some((pick) => samePick(pick, selection)));
  const toggle = useUiStore((s) => s.toggleSelection);
  const label = outcomeLabel(market, outcome.key, match);
  const suspended = market.status === "SUSPENDED";

  return (
    <Button
      variant={selected ? "oddsActive" : "odds"}
      className="h-auto min-w-0 justify-between gap-2 rounded-md px-3 py-2.5 text-left normal-case"
      aria-pressed={selected}
      aria-label={`${pickLabel(market, outcome.key, match)} at ${suspended ? "suspended" : formatOdds(outcome.odds)}`}
      disabled={suspended || match.state === "FINISHED"}
      onClick={() => toggle(selection)}
    >
      <span className="truncate text-xs font-semibold">{label}</span>
      <Flash value={outcome.odds} className={cn("shrink-0 font-display text-sm font-extrabold tabular-nums", !selected && "text-accent")}>
        {suspended ? "–" : formatOdds(outcome.odds)}
      </Flash>
    </Button>
  );
}

function Section({ title, markets, match }: { title: string; markets: Market[]; match: Match }) {
  const [open, setOpen] = useState(true);
  const id = `market-${markets[0].id}`;

  return (
    <section aria-label={title} className="mb-3 break-inside-avoid rounded-lg border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={id}
        className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-3 text-left"
      >
        <Bookmark className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="flex-1 font-display text-sm font-bold">{title}</span>
        <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div id={id} className="space-y-2 px-3 pb-3">
          {markets.map((market) => {
            // A correct-score grid reads down each team's column: team A's wins left, team B's right.
            const many = market.outcomes.length > 3;
            return (
              <div
                key={market.id}
                className={cn("grid gap-2", many ? "grid-flow-col grid-cols-2" : market.outcomes.length === 3 ? "grid-cols-3" : "grid-cols-2")}
                style={many ? { gridTemplateRows: `repeat(${Math.ceil(market.outcomes.length / 2)}, auto)` } : undefined}
              >
                {market.outcomes.map((outcome) => (
                  <OutcomeButton key={outcome.id} match={match} market={market} outcome={outcome} />
                ))}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

/**
 * The match page's markets, in the design's tabs: Popular, All, Rounds, Match, the map in play and the half in play.
 * Tabs with nothing to show are left out. Picking odds adds them to the slip; one pick per match, so picking another
 * market of the same match replaces it.
 */
export function MatchMarkets({ match, markets }: { match: Match; markets: Market[] }) {
  const tabs = TAB_ORDER.filter((tab) => markets.some((m) => inTab(tab, m.type)));
  const [chosen, setChosen] = useState<TabId>("popular");
  const tab = tabs.includes(chosen) ? chosen : (tabs[0] ?? "all");
  const shown = sections(
    markets.filter((m) => inTab(tab, m.type)),
    match,
  );

  if (markets.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-card/40 py-10 text-center text-sm text-muted-foreground">
        {match.state === "FINISHED" ? "This match is over. Every market has been settled." : "No markets are open right now."}
      </p>
    );
  }

  return (
    <>
      <div role="tablist" aria-label="Market groups" className="mb-4 flex flex-wrap gap-2">
        {tabs.map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => setChosen(value)}
            className={cn(
              "cursor-pointer rounded-full px-4 py-2 font-display text-xs font-bold transition-colors",
              tab === value ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            {tabLabel(value, markets)}
          </button>
        ))}
      </div>

      <div role="tabpanel" aria-label={tabLabel(tab, markets)} className="gap-3 md:columns-2">
        {shown.map((section) => (
          <Section key={section.title} title={section.title} markets={section.markets} match={match} />
        ))}
      </div>
    </>
  );
}
