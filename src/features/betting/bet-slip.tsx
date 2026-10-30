"use client";

import { Coins, Layers, Ticket, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useUiStore } from "@/providers/ui-store-provider";
import type { SlipSelection } from "@/stores/ui-store";

import { placeBetAction } from "./actions";
import { useKnownMatchMap } from "./live-matches";
import { formatCredits, formatOdds, oddsFor, potentialPayout, teamName, totalOdds, type Match } from "./match";

const CHIPS = [50, 100, 250];

type Pick = SlipSelection & { match: Match };

/** The slip's picks with their newest match data; picks for matches the client hasn't seen are left out. */
function usePicks(): Pick[] {
  const selections = useUiStore((s) => s.selections);
  const matches = useKnownMatchMap();

  return selections.flatMap((selection) => {
    const match = matches[selection.matchId];
    return match ? [{ ...selection, match }] : [];
  });
}

/**
 * Floating slip from the design: bottom sheet on phones, card on desktop. A floating ticket button opens it at any
 * time; with no pick it shows an empty placeholder. One pick is a single; picks from two or more matches make a
 * combo whose total odds are the product of the picks. Shows current prices; be applies its own odds when the
 * bet is placed.
 */
export function BetSlip({ signedIn }: { signedIn: boolean }) {
  const open = useUiStore((s) => s.slipOpen);
  const setOpen = useUiStore((s) => s.setSlipOpen);
  const picks = usePicks();

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={picks.length ? `Open bet slip (${picks.length} ${picks.length === 1 ? "selection" : "selections"})` : "Open bet slip"}
        className="fixed right-4 bottom-4 z-50 grid size-14 cursor-pointer place-items-center rounded-full border border-primary/50 bg-popover text-primary shadow-[0_0_30px_-6px_var(--primary)] transition hover:-translate-y-0.5 hover:scale-105 hover:shadow-[0_0_40px_-4px_var(--primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:right-6 md:bottom-6"
      >
        <Ticket className="size-6" />
        {picks.length > 0 && (
          <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 font-display text-[11px] font-extrabold text-primary-foreground">
            {picks.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <aside
      aria-label="Bet slip"
      className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col rounded-t-2xl border border-primary/40 bg-popover p-4 shadow-[0_-10px_40px_-10px_var(--primary)] md:inset-x-auto md:right-6 md:bottom-6 md:w-96 md:rounded-2xl"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-sm font-extrabold uppercase tracking-wider">
          <Ticket className="size-4 text-primary" />
          Bet slip
        </h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close bet slip"
          className="cursor-pointer rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      {picks.length > 0 ? <SlipPicks picks={picks} signedIn={signedIn} /> : <EmptySlip />}
    </aside>
  );
}

function EmptySlip() {
  const setOpen = useUiStore((s) => s.setSlipOpen);

  return (
    <div className="rounded-lg border border-dashed border-border bg-card/40 px-4 py-6 text-center">
      <Ticket className="mx-auto size-8 text-muted-foreground/60" />
      <p className="mt-2 font-display text-sm font-bold">Your bet slip is empty</p>
      <p className="mt-1 text-xs text-muted-foreground">Tap any odds on a match to add a selection.</p>
      <Link
        href="/matches"
        onClick={() => setOpen(false)}
        className={buttonVariants({ variant: "outline", size: "sm", className: "mt-4" })}
      >
        Browse matches
      </Link>
    </div>
  );
}

/** Single or Combo, worked out from the picks, plus the running count of matches on the slip. */
function SlipMode({ count }: { count: number }) {
  const combo = count > 1;

  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="flex rounded-md border border-border bg-background p-0.5 font-display text-[11px] font-bold uppercase tracking-wider">
        {(["Single", "Combo"] as const).map((mode) => {
          const active = (mode === "Combo") === combo;
          return (
            <span
              key={mode}
              aria-current={active ? "true" : undefined}
              className={cn("rounded px-3 py-1", active ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
            >
              {mode}
            </span>
          );
        })}
      </div>
      <p className="flex items-center gap-1.5 font-display text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        <Layers className="size-3.5" />
        Matches
        <span data-testid="slip-match-count" className="grid h-5 min-w-5 place-items-center rounded-full bg-primary/15 px-1.5 text-primary tabular-nums">
          {count}
        </span>
      </p>
    </div>
  );
}

function SlipPicks({ picks, signedIn }: { picks: Pick[]; signedIn: boolean }) {
  const stake = useUiStore((s) => s.stake);
  const setStake = useUiStore((s) => s.setStake);
  const removeSelection = useUiStore((s) => s.removeSelection);
  const clearSlip = useUiStore((s) => s.clearSlip);
  const setOpen = useUiStore((s) => s.setSlipOpen);
  const router = useRouter();
  const [placing, startPlacing] = useTransition();

  const combo = picks.length > 1;
  const odds = totalOdds(picks.map((pick) => oddsFor(pick.match, pick.side)));
  const payout = potentialPayout(stake, odds);
  const closed = picks.filter((pick) => pick.match.state === "FINISHED");

  const place = () =>
    startPlacing(async () => {
      const result = await placeBetAction({ selections: picks.map(({ matchId, side }) => ({ matchId, side })), stake });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(`${combo ? "Combo" : "Bet"} placed. Potential payout ${formatCredits(result.payout)}.`);
      clearSlip();
      setOpen(false);
      router.push("/my-bets");
    });

  return (
    <>
      <SlipMode count={picks.length} />

      <ul className="-mx-1 max-h-[28dvh] min-h-0 space-y-2 overflow-y-auto px-1 md:max-h-64">
        {picks.map(({ matchId, side, match }) => {
          const team = teamName(match, side);
          return (
            <li key={matchId} aria-label={`${team} to win`} className="flex items-start gap-2 rounded-lg border border-border bg-card/60 p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-bold">
                  {match.teamA} vs {match.teamB}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {team} to win · <span className="font-display font-bold text-accent">@ {formatOdds(oddsFor(match, side))}</span>
                  {match.state === "LIVE" && <span className="ml-1 text-live">· in play</span>}
                  {match.state === "FINISHED" && <span className="ml-1 text-destructive">· closed</span>}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeSelection(matchId)}
                aria-label={`Remove ${team} to win`}
                className="cursor-pointer rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          );
        })}
      </ul>

      {!combo && <p className="mt-2 text-[11px] text-muted-foreground">Add odds from another match to make it a combo.</p>}

      <div className="mt-3">
        <label htmlFor="stake" className="font-display text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Stake (CR)
        </label>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-md border border-input bg-background px-3">
            <Coins className="size-4 shrink-0 text-accent" />
            <input
              id="stake"
              type="number"
              inputMode="numeric"
              min={1}
              value={stake || ""}
              onChange={(e) => setStake(Number(e.target.value))}
              className="w-full bg-transparent font-display font-bold tabular-nums outline-none"
            />
          </div>
          {CHIPS.map((chip) => (
            <Button key={chip} variant="outline" size="sm" onClick={() => setStake(stake + chip)}>
              +{chip}
            </Button>
          ))}
        </div>
      </div>

      <dl className="mt-3 space-y-1 rounded-lg bg-secondary/60 px-3 py-2 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Total odds</dt>
          <dd className="font-display font-extrabold tabular-nums" data-testid="total-odds">
            @ {formatOdds(odds)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Potential payout</dt>
          <dd className="font-display font-extrabold tabular-nums text-accent" data-testid="potential-payout">
            {formatCredits(payout)}
          </dd>
        </div>
      </dl>

      {closed.length > 0 ? (
        <p className="mt-3 rounded-md bg-secondary/60 py-3 text-center text-sm text-muted-foreground">
          {combo ? "Remove finished matches to place this combo." : "Betting is closed for this match."}
        </p>
      ) : signedIn ? (
        <Button className="mt-3 w-full shrink-0" size="lg" disabled={placing || stake <= 0} onClick={place}>
          {placing ? "Placing bet…" : combo ? `Place combo bet (${picks.length})` : "Place bet"}
        </Button>
      ) : (
        <Link href="/login" className={buttonVariants({ size: "lg", className: "mt-3 w-full shrink-0" })}>
          Log in to place this bet
        </Link>
      )}
    </>
  );
}
