import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getMatchWithMarkets } from "@/features/betting/queries";
import { MatchPage } from "@/features/markets/match-page";

export async function generateMetadata({ params }: PageProps<"/matches/[id]">): Promise<Metadata> {
  const { id } = await params;
  const match = /^\d+$/.test(id) ? await getMatchWithMarkets(id) : null;

  return match
    ? { title: `${match.teamA} vs ${match.teamB} odds`, description: `Every market for ${match.teamA} vs ${match.teamB}, ${match.tournament}.` }
    : { title: "Match not found" };
}

export default function MatchMarketsPage({ params }: PageProps<"/matches/[id]">) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 pb-28 sm:px-6">
      <Link href="/matches" className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" />
        All matches
      </Link>

      <Suspense fallback={<div className="h-72 animate-pulse rounded-2xl bg-card" />}>
        <Match params={params} />
      </Suspense>
    </main>
  );
}

async function Match({ params }: Pick<PageProps<"/matches/[id]">, "params">) {
  const { id } = await params;
  const match = /^\d+$/.test(id) ? await getMatchWithMarkets(id) : null;

  if (!match) {
    notFound();
  }

  return <MatchPage initial={match} />;
}
