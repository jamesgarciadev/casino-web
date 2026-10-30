"use client";

import { ArrowRight, Gamepad2, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { useClient, useQuery } from "urql";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { SlipBetsQuery } from "@/lib/graphql/operations";
import { useUiStore } from "@/providers/ui-store-provider";
import { betsAreFresh, type BetsFilter } from "@/stores/ui-store";

import { cashOutAction } from "./actions";
import { BET_STATUS_STYLES, betLabel, pickTeam, statusLabel, type Bet } from "./bet";
import { useKnownMatchMap } from "./live-matches";
import { cashOutValue, formatCredits, formatOdds, oddsFor } from "./match";

const PAGE_SIZE = 10;

/** Picks this tab has already reported as finished, so a settlement refetch is asked for once per pick. */
const finishedPicks = new Set<string>();

/**
 * The slip's My bets tab: a quick look at open or settled bets without leaving the page.
 *
 * Caching: pages come from urql's cache while the list's last load from be is current (same `betsVersion`, under a
 * minute old) and are refetched otherwise. `betsVersion` moves when a bet is placed, cashed out, or one of its
 * matches finishes, so the tab only waits on be when something changed. Live odds and scores come from the match
 * feed, never from refetching.
 */
export function SlipBets({ signedIn }: { signedIn: boolean }) {
  const [filter, setFilter] = useState<BetsFilter>("open");
  const betsVersion = useUiStore((s) => s.betsVersion);

  return (
    <>
      <div role="tablist" aria-label="Bet filter" className="mb-3 grid grid-cols-2 rounded-md border border-border bg-background p-0.5">
        {(["open", "settled"] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={filter === value}
            onClick={() => setFilter(value)}
            className={cn(
              "cursor-pointer rounded py-1.5 font-display text-xs font-bold uppercase tracking-wider transition-colors",
              filter === value ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {value}
          </button>
        ))}
      </div>

      {/* Keyed so each tab, and each change to the player's bets, starts again from the first page. */}
      {signedIn ? <BetList key={`${filter}:${betsVersion}`} filter={filter} /> : <SignedOut />}
    </>
  );
}

/**
 * Loads the first page of open bets into urql's cache ahead of time (the slip opening, or the pointer reaching its
 * button), so the My bets tab shows without a spinner. Does nothing while the cached page is still current.
 */
export function usePrefetchOpenBets(signedIn: boolean): () => void {
  const client = useClient();
  const betsVersion = useUiStore((s) => s.betsVersion);
  const betsSynced = useUiStore((s) => s.betsSynced);
  const markBetsSynced = useUiStore((s) => s.markBetsSynced);
  const inFlight = useRef(false);

  return useCallback(() => {
    if (!signedIn || inFlight.current || betsAreFresh({ betsVersion, betsSynced }, "open", Date.now())) {
      return;
    }

    inFlight.current = true;
    client
      .query(SlipBetsQuery, { open: true, first: PAGE_SIZE, before: null }, { requestPolicy: "network-only" })
      .toPromise()
      .then((result) => result.data && markBetsSynced("open", betsVersion, Date.now()))
      .finally(() => {
        inFlight.current = false;
      });
  }, [signedIn, client, betsVersion, betsSynced, markBetsSynced]);
}

function SignedOut() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card/40 px-4 py-6 text-center">
      <p className="text-sm text-muted-foreground">Log in to see your open and settled bets.</p>
      <Link href="/login" className={buttonVariants({ size: "sm", className: "mt-4" })}>
        Log in
      </Link>
    </div>
  );
}

/**
 * Pages of PAGE_SIZE bets, each its own query from a cursor (the last bet id of the page before). Scrolling near
 * the end of the last full page loads the next one.
 */
function BetList({ filter }: { filter: BetsFilter }) {
  const setSlipOpen = useUiStore((s) => s.setSlipOpen);
  const betsVersion = useUiStore((s) => s.betsVersion);
  const betsSynced = useUiStore((s) => s.betsSynced);
  // Decided once per list: every page of it then comes from the same source.
  const [fromCache] = useState(() => betsAreFresh({ betsVersion, betsSynced }, filter, Date.now()));
  const [cursors, setCursors] = useState<(string | null)[]>([null]);
  const loadAfter = useCallback(
    (lastId: string) => setCursors((current) => (current.includes(lastId) ? current : [...current, lastId])),
    [],
  );

  return (
    <>
      <ul
        aria-label={filter === "open" ? "Open bets" : "Settled bets"}
        className="-mx-1 max-h-[45dvh] min-h-0 space-y-2 overflow-y-auto px-1 md:max-h-96"
      >
        {cursors.map((before, index) => (
          <BetPage
            key={before ?? "first"}
            filter={filter}
            before={before}
            fromCache={fromCache}
            version={betsVersion}
            last={index === cursors.length - 1}
            onEnd={loadAfter}
          />
        ))}
      </ul>

      <Link
        href="/my-bets"
        onClick={() => setSlipOpen(false)}
        className="mt-3 flex shrink-0 items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-accent"
      >
        All bets & wallet <ArrowRight className="size-3.5" />
      </Link>
    </>
  );
}

function BetPage({
  filter,
  before,
  fromCache,
  version,
  last,
  onEnd,
}: {
  filter: BetsFilter;
  before: string | null;
  fromCache: boolean;
  version: number;
  last: boolean;
  onEnd: (lastId: string) => void;
}) {
  const matches = useKnownMatchMap();
  const bumpBets = useUiStore((s) => s.bumpBets);
  const markBetsSynced = useUiStore((s) => s.markBetsSynced);
  const [{ data, fetching, error }] = useQuery({
    query: SlipBetsQuery,
    variables: { open: filter === "open", first: PAGE_SIZE, before },
    requestPolicy: fromCache ? "cache-first" : "network-only",
  });
  const bets = data?.myBets;
  const sentinel = useRef<HTMLLIElement>(null);
  const lastId = bets?.length === PAGE_SIZE ? bets[PAGE_SIZE - 1].id : null;

  // The first page's fresh load is what makes the cache current for this version.
  useEffect(() => {
    if (bets && before === null && !fromCache) {
      markBetsSynced(filter, version, Date.now());
    }
  }, [bets, before, fromCache, filter, version, markBetsSynced]);

  // A pick still pending here whose match the live feed has since reported finished: be has just settled it.
  const finished = (bets ?? [])
    .flatMap((bet) => bet.selections)
    .filter((pick) => pick.status === "PENDING" && matches[pick.match.id]?.state === "FINISHED" && !finishedPicks.has(pick.id))
    .map((pick) => pick.id);

  useEffect(() => {
    if (finished.length > 0) {
      finished.forEach((id) => finishedPicks.add(id));
      bumpBets();
    }
    // `finished` is rebuilt each render; its contents are what matter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished.join(","), bumpBets]);

  // A full last page may have more behind it: load the next page as its end scrolls into view.
  useEffect(() => {
    const target = sentinel.current;
    if (!last || !lastId || !target) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && onEnd(lastId), { rootMargin: "120px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [last, lastId, onEnd]);

  if (!bets) {
    return fetching ? (
      <>
        {[0, 1].map((i) => (
          <li key={i} aria-label="Loading bets" className="h-20 animate-pulse rounded-lg bg-card" />
        ))}
      </>
    ) : (
      <li className="rounded-lg bg-secondary/60 py-4 text-center text-sm text-muted-foreground">
        {error?.graphQLErrors[0]?.message ?? "Your bets could not be loaded."}
      </li>
    );
  }

  if (bets.length === 0 && before === null) {
    return (
      <li className="rounded-lg border border-dashed border-border bg-card/40 px-4 py-6 text-center">
        <Gamepad2 className="mx-auto size-7 text-muted-foreground/60" />
        <p className="mt-2 text-sm text-muted-foreground">{filter === "open" ? "No open bets." : "No settled bets yet."}</p>
      </li>
    );
  }

  return (
    <>
      {bets.map((bet) => (
        <SlipBet key={bet.id} bet={bet} />
      ))}
      {last && lastId && <li ref={sentinel} aria-hidden className="h-px" />}
    </>
  );
}

function SlipBet({ bet }: { bet: Bet }) {
  const matches = useKnownMatchMap();
  const combo = bet.type === "COMBO";
  const cashable = !combo && bet.status === "PENDING";

  return (
    <li
      aria-label={`${betLabel(bet)}, ${statusLabel(bet.status)}`}
      className={cn(
        "rounded-lg border bg-card/60 p-3 transition-opacity",
        // Settled: wins keep full colour with a green edge, losses fade so the two read apart at a glance.
        bet.status === "WON" && "border-live/40 shadow-[inset_3px_0_0_var(--live)]",
        bet.status === "LOST" && "border-border/60 opacity-50 grayscale hover:opacity-80",
        (bet.status === "PENDING" || bet.status === "CASHED_OUT") && "border-border",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-display text-[11px] font-bold uppercase tracking-wider text-primary">
          {combo ? `Combo · ${bet.selections.length} matches` : "Single"}
          <span className="ml-1.5 text-muted-foreground">@ {formatOdds(bet.odds)}</span>
        </p>
        <span className={cn("rounded-full border px-2 py-0.5 font-display text-[9px] font-bold uppercase tracking-wider", BET_STATUS_STYLES[bet.status])}>
          {statusLabel(bet.status)}
        </span>
      </div>

      <div className={cn("mt-2 space-y-1.5", combo && "border-l-2 border-primary/30 pl-2.5")}>
        {bet.selections.map((pick) => {
          // The live version of the match, for the current score and odds.
          const match = matches[pick.match.id] ?? pick.match;
          const now = oddsFor(match, pick.side);
          return (
            <div key={pick.id} className="min-w-0 text-xs">
              <p className="flex items-center gap-2">
                <span className="truncate font-display font-bold">
                  {match.teamA} vs {match.teamB}
                </span>
                {match.state !== "UPCOMING" && (
                  <span className={cn("shrink-0 tabular-nums", match.state === "LIVE" ? "text-live" : "text-muted-foreground")}>
                    {match.scoreA}:{match.scoreB}
                  </span>
                )}
              </p>
              <p className="text-muted-foreground">
                {pickTeam(pick)} to win · @ {formatOdds(pick.odds)}
                {pick.status === "PENDING" && match.state !== "FINISHED" && now !== pick.odds && (
                  <span data-testid="current-odds" className={now < pick.odds ? "text-live" : "text-destructive"}>
                    {" "}
                    · now {formatOdds(now)}
                  </span>
                )}
                {combo && pick.status !== "PENDING" && (
                  <span className={pick.status === "WON" ? "text-live" : "text-destructive"}> · {statusLabel(pick.status)}</span>
                )}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-2 text-xs">
        <span className="text-muted-foreground">
          Stake <span className="font-display font-bold text-foreground tabular-nums">{formatCredits(bet.stake)}</span>
        </span>
        {bet.status === "CASHED_OUT" ? (
          <span className="text-muted-foreground">
            Cashed out <span className="font-display font-bold text-foreground tabular-nums">{formatCredits(bet.cashOut ?? 0)}</span>
          </span>
        ) : (
          <span className="text-muted-foreground">
            {bet.status === "WON" ? "Paid" : bet.status === "LOST" ? "Payout" : "To win"}{" "}
            <span className={cn("font-display font-bold tabular-nums", bet.status === "LOST" ? "text-muted-foreground line-through" : "text-accent")}>
              {formatCredits(bet.payout)}
            </span>
          </span>
        )}
      </div>

      {cashable && <CashOutButton bet={bet} />}
    </li>
  );
}

const CONFIRM_MS = 4000;

/**
 * Withdraw for an open single. The value follows the match's live odds; the first tap asks to confirm, the second
 * sends the value shown, which be pays (or better) or refuses if it has dropped since.
 */
function CashOutButton({ bet }: { bet: Bet }) {
  const matches = useKnownMatchMap();
  const bumpBets = useUiStore((s) => s.bumpBets);
  const [confirming, setConfirming] = useState(false);
  const [pending, startCashOut] = useTransition();

  const pick = bet.selections[0];
  const match = matches[pick.match.id] ?? pick.match;
  const value = cashOutValue(bet.stake, bet.odds, oddsFor(match, pick.side));
  const closed = match.state === "FINISHED";

  useEffect(() => {
    if (!confirming) {
      return;
    }

    const timer = setTimeout(() => setConfirming(false), CONFIRM_MS);
    return () => clearTimeout(timer);
  }, [confirming]);

  const withdraw = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    startCashOut(async () => {
      const result = await cashOutAction({ betId: bet.id, expected: value });
      setConfirming(false);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(`Cashed out ${formatCredits(result.cashOut)}.`);
      bumpBets();
    });
  };

  const Trend = value >= bet.stake ? TrendingUp : TrendingDown;
  const label = pending ? "Withdrawing…" : `${confirming ? "Confirm withdraw" : "Withdraw"} ${formatCredits(value)}`;

  return (
    <button
      type="button"
      onClick={withdraw}
      disabled={closed || pending}
      aria-label={label}
      className={cn(
        "mt-2 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border py-2 font-display text-xs font-bold uppercase tracking-wider transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        confirming
          ? "border-accent bg-accent text-accent-foreground"
          : "border-accent/50 bg-accent/10 text-accent hover:bg-accent/20",
      )}
    >
      <Trend className="size-3.5" />
      <span className="tabular-nums">{label}</span>
    </button>
  );
}
