"use client";

import { categories } from "@/components/nav-items";
import { lobbyGames } from "@/features/lobby/catalog";
import { GameCard } from "@/features/lobby/game-card";
import { useUiStore } from "@/providers/ui-store-provider";

export function GameGrid() {
  const active = useUiStore((s) => s.activeCategory);
  const setActive = useUiStore((s) => s.setActiveCategory);

  const games = active === "all" ? lobbyGames : lobbyGames.filter((game) => game.categories.some((c) => c === active));
  const title = categories.find((c) => c.id === active)?.label ?? "Lobby";

  return (
    <section aria-labelledby="lobby-title" className="space-y-4">
      {/* Category chips for small screens; the rail covers desktop. */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setActive(category.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide ${
              active === category.id ? "bg-accent text-accent-fg" : "bg-surface-3 text-muted"
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="flex items-end justify-between">
        <h2 id="lobby-title" className="display text-xl">
          {title}
        </h2>
        <span className="text-xs font-semibold uppercase text-muted">{games.length} games</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </section>
  );
}
