import { ArrowRight, Coins, Flame, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import heroArena from "@/assets/hero-arena.jpg";
import { buttonVariants } from "@/components/ui/button";
import { MatchGrid } from "@/features/betting/match-grid";
import { GameIcon } from "@/features/betting/game-icon";
import { gameLabel } from "@/features/betting/match";
import { MobileShowcase } from "@/features/betting/mobile-showcase";
import { OddsTicker } from "@/features/betting/odds-ticker";
import { getMatches } from "@/features/betting/queries";
import { SectionHeading } from "@/features/betting/section-heading";
import { getCurrentUser } from "@/lib/auth/dal";

export default function LandingPage() {
  return (
    <main>
      <section className="relative overflow-hidden">
        <Image src={heroArena} alt="" priority placeholder="blur" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/75 via-background/55 to-background" />
        <div className="arena-grid absolute inset-0 opacity-30" />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 font-display text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
              <Flame className="size-3.5" />
              Live odds · Play money
            </p>
            <h1 className="text-glow mt-6 font-display text-4xl font-extrabold uppercase leading-[1.05] sm:text-6xl">
              Bet the arena.
              <br />
              <span className="text-primary">Win the clutch.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Live odds on CS2, Valorant, Dota 2 and League of Legends. Tap a price, confirm your slip, ride the series, all
              with play-money credits.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/matches" className={buttonVariants({ size: "xl" })}>
                Browse matches
                <ArrowRight className="size-5" />
              </Link>
              <Suspense fallback={null}>
                <HeroSignUp />
              </Suspense>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-live" />
                Virtual credits, no cash value
              </span>
              <span className="font-display font-bold">18+ PLAY RESPONSIBLY</span>
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={<MatchSectionsSkeleton />}>
        <MatchSections />
      </Suspense>

      <MobileShowcase />

      <Suspense fallback={null}>
        <SignUpBand />
      </Suspense>
    </main>
  );
}

/** Signed-in players already have credits, so the sign-up prompts only show to visitors. */
async function HeroSignUp() {
  if (await getCurrentUser()) {
    return null;
  }

  return (
    <Link href="/register" className={buttonVariants({ size: "xl", variant: "ember" })}>
      <Coins className="size-5" />
      Get 1,000 free CR
    </Link>
  );
}

async function MatchSections() {
  const matches = await getMatches();
  const games = new Map<string, { game: string; label: string; count: number }>();

  for (const match of matches) {
    const entry = games.get(match.game) ?? { game: match.game, label: gameLabel(match), count: 0 };
    games.set(match.game, { ...entry, count: entry.count + 1 });
  }

  return (
    <>
      <OddsTicker initial={matches} />

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="live-now">
        <SectionHeading
          kicker="In progress"
          title={
            <span id="live-now">
              Live <span className="text-primary">now</span>
            </span>
          }
          href="/matches"
        />
        <MatchGrid
          initial={matches}
          filter="live"
          empty={<p className="text-sm text-muted-foreground">Nothing live right now. Check the schedule below.</p>}
        />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6" aria-labelledby="upcoming">
        <SectionHeading kicker="On the schedule" title={<span id="upcoming">Upcoming series</span>} href="/matches" />
        <MatchGrid
          initial={matches}
          filter="upcoming"
          limit={6}
          empty={<p className="text-sm text-muted-foreground">No matches scheduled yet.</p>}
        />
      </section>

      {games.size > 0 && (
        <section className="border-t border-border/70 bg-card/30 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHeading kicker="Markets" title="Pick your game" href="/matches" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {[...games.values()].map(({ game, label, count }) => {

                return (
                  <Link
                    key={game}
                    href={`/matches?game=${game}`}
                    className="group rounded-xl border border-border bg-card p-5 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
                  >
                    <GameIcon game={game} className="mx-auto size-7 text-primary" />
                    <p className="mt-3 truncate font-display text-sm font-bold uppercase">{label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {count} {count === 1 ? "match" : "matches"}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function MatchSectionsSkeleton() {
  return (
    <div className="mx-auto grid max-w-7xl gap-5 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="h-52 animate-pulse rounded-xl border border-border bg-card" />
      ))}
    </div>
  );
}

async function SignUpBand() {
  if (await getCurrentUser()) {
    return null;
  }

  return (
    <section className="border-t border-border/70 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="glow-panel relative overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/20 via-card to-card p-10 text-center">
          <div className="arena-grid absolute inset-0 opacity-40" />
          <div className="relative">
            <h2 className="font-display text-2xl font-extrabold uppercase sm:text-3xl">
              Ready to <span className="text-primary">clutch</span>?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Create an account and your wallet is loaded with 1,000 play-money credits. Top up any time; it&apos;s all virtual.
            </p>
            <Link href="/register" className={buttonVariants({ size: "xl", className: "mt-6" })}>
              Create account
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
