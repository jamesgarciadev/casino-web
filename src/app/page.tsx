import { CategoryNav } from "@/components/category-nav";
import { GameGrid } from "@/features/lobby/game-grid";
import { HeroBanner } from "@/features/lobby/hero-banner";

export default function LobbyPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1440px] gap-6 px-4 py-6">
      <aside className="sticky top-22 hidden h-fit w-56 shrink-0 lg:block">
        <div className="panel p-2">
          <CategoryNav variant="rail" />
        </div>
      </aside>

      <main className="min-w-0 flex-1 space-y-8">
        <HeroBanner />
        <GameGrid />
      </main>
    </div>
  );
}
