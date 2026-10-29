import type { LobbyGame } from "@/features/lobby/catalog";

const badgeStyles: Record<NonNullable<LobbyGame["badge"]>, string> = {
  hot: "bg-hot text-white",
  new: "bg-accent text-accent-fg",
  jackpot: "bg-[#ffc531] text-accent-fg",
};

export function GameCard({ game }: { game: LobbyGame }) {
  return (
    <article className="group relative overflow-hidden rounded-xl border border-border bg-surface-2">
      <div
        className="relative grid aspect-[4/5] place-items-center"
        style={{
          background: `radial-gradient(120% 90% at 30% 10%, hsl(${game.hue} 90% 60% / 0.55), transparent 60%), linear-gradient(160deg, hsl(${game.hue} 60% 22%), hsl(${(game.hue + 40) % 360} 55% 10%))`,
        }}
      >
        <span className="display px-3 text-center text-xl leading-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
          {game.name}
        </span>

        {game.badge && (
          <span className={`absolute left-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${badgeStyles[game.badge]}`}>
            {game.badge}
          </span>
        )}

        <div className="absolute inset-0 grid place-items-center bg-black/55 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <button type="button" className="btn btn-accent h-11 rounded-full px-6">
            Play
          </button>
        </div>
      </div>

      <div className="px-3 py-2">
        <p className="truncate text-sm font-semibold">{game.name}</p>
        <p className="truncate text-xs text-muted">{game.studio}</p>
      </div>
    </article>
  );
}
