import { ArrowRight, Coins, Gamepad2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { buttonVariants } from "@/components/ui/button";
import type { BetStatus } from "@/gql/graphql";
import { formatCredits, formatOdds, gameLabel } from "@/features/betting/match";
import { getMyBets, getWalletBalance } from "@/features/betting/queries";
import { TopUpButton } from "@/features/betting/top-up-button";
import { requireUser } from "@/lib/auth/dal";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "My bets & wallet" };

const STATUS_STYLES: Record<BetStatus, string> = {
  PENDING: "border-accent/40 bg-accent/10 text-accent",
  WON: "border-live/40 bg-live/10 text-live",
  LOST: "border-destructive/40 bg-destructive/10 text-destructive",
};

const placedFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

export default function MyBetsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 pb-28 sm:px-6">
      <p className="font-display text-[11px] font-bold uppercase tracking-[0.3em] text-primary">Wallet & history</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold uppercase">My bets</h1>

      <Suspense fallback={<div className="mt-8 h-40 animate-pulse rounded-2xl bg-card" />}>
        <WalletAndBets />
      </Suspense>
    </main>
  );
}

async function WalletAndBets() {
  await requireUser();
  const [balance, bets] = await Promise.all([getWalletBalance(), getMyBets()]);

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 via-card to-card p-6">
        <div>
          <p className="font-display text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Play-money balance</p>
          <p className="mt-1 flex items-center gap-2 font-display text-4xl font-extrabold tabular-nums text-accent" data-testid="wallet-balance">
            <Coins className="size-7" />
            {(balance ?? 0).toLocaleString("en-US")}
            <span className="text-lg text-muted-foreground">CR</span>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">Virtual credits, no cash value.</p>
        </div>
        <TopUpButton />
      </div>

      <h2 className="mt-12 font-display text-xl font-extrabold uppercase">Bet history</h2>

      {bets.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-4 rounded-xl border border-border bg-card/50 py-16 text-center">
          <Gamepad2 className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No bets yet. Your first clutch awaits.</p>
          <Link href="/matches" className={buttonVariants()}>
            Browse matches <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {bets.map((bet) => {
            const team = bet.side === "A" ? bet.match.teamA : bet.match.teamB;

            return (
              <li
                key={bet.id}
                aria-label={`${team} to win, ${bet.status.toLowerCase()}`}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="font-display text-xs font-bold uppercase text-primary">{gameLabel(bet.match)}</p>
                  <p className="mt-0.5 truncate font-display text-sm font-bold">
                    {bet.match.teamA} vs {bet.match.teamB}
                    {bet.match.state !== "UPCOMING" && (
                      <span className="ml-2 text-muted-foreground tabular-nums">
                        {bet.match.scoreA}:{bet.match.scoreB}
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {team} to win · @ {formatOdds(bet.odds)} ·{" "}
                    <time dateTime={bet.placedAt} suppressHydrationWarning>
                      {placedFormat.format(new Date(bet.placedAt))}
                    </time>
                  </p>
                </div>
                <div className="flex items-center gap-5">
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Stake</p>
                    <p className="font-display font-bold tabular-nums">{formatCredits(bet.stake)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{bet.status === "WON" ? "Paid" : "Payout"}</p>
                    <p className={cn("font-display font-bold tabular-nums", bet.status === "LOST" ? "text-muted-foreground line-through" : "text-accent")}>
                      {formatCredits(bet.payout)}
                    </p>
                  </div>
                  <span className={cn("rounded-full border px-3 py-1 font-display text-[10px] font-bold uppercase tracking-wider", STATUS_STYLES[bet.status])}>
                    {bet.status}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
