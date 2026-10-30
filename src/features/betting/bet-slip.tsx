"use client";

import { Coins, Ticket, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { useUiStore } from "@/providers/ui-store-provider";
import type { SlipSelection } from "@/stores/ui-store";

import { placeBetAction } from "./actions";
import { useKnownMatch } from "./live-matches";
import { formatCredits, formatOdds, oddsFor, potentialPayout, teamName, type Match } from "./match";

const CHIPS = [50, 100, 250];

/**
 * Floating slip from the design: bottom sheet on phones, card on desktop. A floating ticket button opens it at any
 * time; with no pick it shows an empty placeholder. Shows the current price; be applies its own odds when the bet is placed.
 */
export function BetSlip({ signedIn }: { signedIn: boolean }) {
  const open = useUiStore((s) => s.slipOpen);
  const setOpen = useUiStore((s) => s.setSlipOpen);
  const selection = useUiStore((s) => s.selection);
  const match = useKnownMatch(selection?.matchId);
  const picks = selection && match ? 1 : 0;

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
        aria-label={picks ? `Open bet slip (${picks} selection)` : "Open bet slip"}
        className="fixed right-4 bottom-4 z-50 grid size-14 cursor-pointer place-items-center rounded-full border border-primary/50 bg-popover text-primary shadow-[0_0_30px_-6px_var(--primary)] transition hover:-translate-y-0.5 hover:scale-105 hover:shadow-[0_0_40px_-4px_var(--primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:right-6 md:bottom-6"
      >
        <Ticket className="size-6" />
        {picks > 0 && (
          <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-primary font-display text-[11px] font-extrabold text-primary-foreground">
            {picks}
          </span>
        )}
      </button>
    );
  }

  return (
    <aside
      aria-label="Bet slip"
      className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border border-primary/40 bg-popover p-4 shadow-[0_-10px_40px_-10px_var(--primary)] md:inset-x-auto md:right-6 md:bottom-6 md:w-96 md:rounded-2xl"
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

      {selection && match ? <SlipPick selection={selection} match={match} signedIn={signedIn} /> : <EmptySlip />}
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

function SlipPick({ selection, match, signedIn }: { selection: SlipSelection; match: Match; signedIn: boolean }) {
  const stake = useUiStore((s) => s.stake);
  const setStake = useUiStore((s) => s.setStake);
  const clearSlip = useUiStore((s) => s.clearSlip);
  const setOpen = useUiStore((s) => s.setSlipOpen);
  const router = useRouter();
  const [placing, startPlacing] = useTransition();

  const odds = oddsFor(match, selection.side);
  const team = teamName(match, selection.side);
  const closed = match.state === "FINISHED";
  const payout = potentialPayout(stake, odds);

  const place = () =>
    startPlacing(async () => {
      const result = await placeBetAction({ matchId: match.id, side: selection.side, stake });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(`Bet placed. Potential payout ${formatCredits(result.payout)}.`);
      clearSlip();
      setOpen(false);
      router.push("/my-bets");
    });

  return (
    <>
      <div className="flex items-start gap-2 rounded-lg border border-border bg-card/60 p-3">
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-bold">
            {match.teamA} vs {match.teamB}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {team} to win · <span className="font-display font-bold text-accent">@ {formatOdds(odds)}</span>
            {match.state === "LIVE" && <span className="ml-1 text-live">· in play</span>}
          </p>
        </div>
        <button
          type="button"
          onClick={clearSlip}
          aria-label="Remove selection"
          className="cursor-pointer rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

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

      <div className="mt-3 flex items-center justify-between rounded-lg bg-secondary/60 px-3 py-2 text-sm">
        <span className="text-muted-foreground">Potential payout</span>
        <span className="font-display font-extrabold tabular-nums text-accent" data-testid="potential-payout">
          {formatCredits(payout)}
        </span>
      </div>

      {closed ? (
        <p className="mt-3 rounded-md bg-secondary/60 py-3 text-center text-sm text-muted-foreground">Betting is closed for this match.</p>
      ) : signedIn ? (
        <Button className="mt-3 w-full" size="lg" disabled={placing || stake <= 0} onClick={place}>
          {placing ? "Placing bet…" : "Place bet"}
        </Button>
      ) : (
        <Link href="/login" className={buttonVariants({ size: "lg", className: "mt-3 w-full" })}>
          Log in to place this bet
        </Link>
      )}
    </>
  );
}
