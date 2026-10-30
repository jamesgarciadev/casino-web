"use client";

import { ArrowRight, Gamepad2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "urql";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { SlipBetsQuery } from "@/lib/graphql/operations";
import { useUiStore } from "@/providers/ui-store-provider";

import { BET_STATUS_STYLES, betLabel, pickTeam, type Bet } from "./bet";
import { useKnownMatchMap } from "./live-matches";
import { formatCredits, formatOdds } from "./match";

type Filter = "open" | "settled";

/**
 * The slip's My bets tab: a quick look at open or settled bets without leaving the page. Scores come from the
 * live store, and the list reloads when one of its matches finishes (be has just settled those bets).
 */
export function SlipBets({ signedIn }: { signedIn: boolean }) {
  const [filter, setFilter] = useState<Filter>("open");

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

      {/* Keyed so each tab starts from its own first page. */}
      {signedIn ? <BetList key={filter} open={filter === "open"} /> : <SignedOut />}
    </>
  );
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

const PAGE_SIZE = 10;

/**
 * Pages of PAGE_SIZE bets, each its own query from a cursor (the last bet id of the page before). Scrolling near
 * the end of the last full page loads the next one.
 */
function BetList({ open }: { open: boolean }) {
  const setSlipOpen = useUiStore((s) => s.setSlipOpen);
  const [cursors, setCursors] = useState<(string | null)[]>([null]);
  const loadAfter = useCallback(
    (lastId: string) => setCursors((current) => (current.includes(lastId) ? current : [...current, lastId])),
    [],
  );

  return (
    <>
      <ul aria-label={open ? "Open bets" : "Settled bets"} className="-mx-1 max-h-[45dvh] min-h-0 space-y-2 overflow-y-auto px-1 md:max-h-96">
        {cursors.map((before, index) => (
          <BetPage key={before ?? "first"} open={open} before={before} last={index === cursors.length - 1} onEnd={loadAfter} />
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
  open,
  before,
  last,
  onEnd,
}: {
  open: boolean;
  before: string | null;
  last: boolean;
  onEnd: (lastId: string) => void;
}) {
  const matches = useKnownMatchMap();
  const [{ data, fetching, error }, reload] = useQuery({
    query: SlipBetsQuery,
    variables: { open, first: PAGE_SIZE, before },
    // Bets are placed through server actions, outside urql's cache, so always check be when the tab shows.
    requestPolicy: "cache-and-network",
  });
  const bets = data?.myBets;
  const sentinel = useRef<HTMLLIElement>(null);
  const lastId = bets?.length === PAGE_SIZE ? bets[PAGE_SIZE - 1].id : null;

  // Picks still pending here whose match the live feed has since reported finished.
  const settledNow = (bets ?? [])
    .flatMap((bet) => bet.selections)
    .filter((pick) => pick.status === "PENDING" && matches[pick.match.id]?.state === "FINISHED")
    .map((pick) => pick.id)
    .join(",");

  useEffect(() => {
    if (settledNow) {
      reload({ requestPolicy: "network-only" });
    }
  }, [settledNow, reload]);

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
        <p className="mt-2 text-sm text-muted-foreground">{open ? "No open bets." : "No settled bets yet."}</p>
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

  return (
    <li
      aria-label={`${betLabel(bet)}, ${bet.status.toLowerCase()}`}
      className={cn(
        "rounded-lg border bg-card/60 p-3 transition-opacity",
        // Settled: wins keep full colour with a green edge, losses fade so the two read apart at a glance.
        bet.status === "WON" && "border-live/40 shadow-[inset_3px_0_0_var(--live)]",
        bet.status === "LOST" && "border-border/60 opacity-50 grayscale hover:opacity-80",
        bet.status === "PENDING" && "border-border",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-display text-[11px] font-bold uppercase tracking-wider text-primary">
          {combo ? `Combo · ${bet.selections.length} matches` : "Single"}
          <span className="ml-1.5 text-muted-foreground">@ {formatOdds(bet.odds)}</span>
        </p>
        <span className={cn("rounded-full border px-2 py-0.5 font-display text-[9px] font-bold uppercase tracking-wider", BET_STATUS_STYLES[bet.status])}>
          {bet.status}
        </span>
      </div>

      <div className={cn("mt-2 space-y-1.5", combo && "border-l-2 border-primary/30 pl-2.5")}>
        {bet.selections.map((pick) => {
          // The live version of the match, for the current score.
          const match = matches[pick.match.id] ?? pick.match;
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
                {combo && pick.status !== "PENDING" && (
                  <span className={pick.status === "WON" ? "text-live" : "text-destructive"}> · {pick.status.toLowerCase()}</span>
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
        <span className="text-muted-foreground">
          {bet.status === "WON" ? "Paid" : bet.status === "LOST" ? "Payout" : "To win"}{" "}
          <span
            className={cn(
              "font-display font-bold tabular-nums",
              bet.status === "LOST" ? "text-muted-foreground line-through" : "text-accent",
            )}
          >
            {formatCredits(bet.payout)}
          </span>
        </span>
      </div>
    </li>
  );
}
