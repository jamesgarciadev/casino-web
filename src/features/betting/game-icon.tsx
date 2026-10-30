import { Crosshair, Crown, Flame, Gamepad2, Rocket, Shield, Swords, Target, type LucideIcon } from "lucide-react";
import { createElement } from "react";

/** PandaScore slug => icon, as in the design. */
const ICONS: Record<string, LucideIcon> = {
  "cs-go": Crosshair,
  valorant: Flame,
  "dota-2": Shield,
  "league-of-legends": Crown,
  rl: Rocket,
  ow: Target,
  "r6-siege": Swords,
};

export function GameIcon({ game, className }: { game: string; className?: string }) {
  return createElement(ICONS[game] ?? Gamepad2, { className, "aria-hidden": true });
}
