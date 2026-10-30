"use client";

import { Coins, Ticket, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { useUiStore } from "@/providers/ui-store-provider";

import { placeBetAction } from "./actions";
import { useKnownMatch } from "./live-matches";
import { formatCredits, formatOdds, oddsFor, potentialPayout, teamName } from "./match";

const CHIPS = [50, 100, 250];

/**
 * Floating slip from the design: bottom sheet on phones, card on desktop. Shows the current price; be applies
 * its own odds at the moment the bet is placed.
 */
export function BetSlip({ signedIn }: { signedIn: boolean }) {
  const selection = useUiStore((s) => s.selection);
  const stake = useUiStore((s) => s.stake);
  const setStake = useUiStore((s) => s.setStake);
  const clearSlip = useUiStore((s) => s.clearSlip);
  const match = useKnownMatch(selection?.matchId);
  const router = useRouter();
  const [placing, startPlacing] = useTransition();

  if (!selection || !match) {
    return null;
  }

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
      router.push("/my-bets");
    });

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
          onClick={clearSlip}
          aria-label="Clear bet slip"
          className="cursor-pointer rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="rounded-lg border border-border bg-card/60 p-3">
        <p className="font-display text-sm font-bold">
          {match.teamA} vs {match.teamB}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {team} to win · <span className="font-display font-bold text-accent">@ {formatOdds(odds)}</span>
          {match.state === "LIVE" && <span className="ml-1 text-live">· in play</span>}
        </p>
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
    </aside>
  );
}
