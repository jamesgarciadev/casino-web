import type { CategoryId } from "@/components/nav-items";

/**
 * Placeholder lineup for the lobby layout. Replace with a `games` query once be exposes
 * the catalog; this is presentation scaffolding, not a source of truth.
 */
export type LobbyGame = {
  id: string;
  name: string;
  studio: string;
  categories: CategoryId[];
  badge?: "hot" | "new" | "jackpot";
  hue: number;
};

export const lobbyGames: LobbyGame[] = [
  { id: "1", name: "Neon Reels", studio: "Arcadia", categories: ["slots"], badge: "hot", hue: 285 },
  { id: "2", name: "Lightning Roulette", studio: "Studio Live", categories: ["live", "table"], badge: "hot", hue: 210 },
  { id: "3", name: "Dragon Vault", studio: "Emberforge", categories: ["slots", "jackpots"], badge: "jackpot", hue: 12 },
  { id: "4", name: "Blackjack VIP", studio: "Studio Live", categories: ["live", "table"], hue: 160 },
  { id: "5", name: "Cosmic Fruits", studio: "Arcadia", categories: ["slots", "new"], badge: "new", hue: 95 },
  { id: "6", name: "Baccarat Squeeze", studio: "Studio Live", categories: ["live", "table"], hue: 340 },
  { id: "7", name: "Mega Fortune Wheel", studio: "Emberforge", categories: ["jackpots", "live"], badge: "jackpot", hue: 45 },
  { id: "8", name: "Pharaoh Gold", studio: "Sandstone", categories: ["slots"], hue: 35 },
  { id: "9", name: "Crash Rocket", studio: "Orbit", categories: ["new"], badge: "new", hue: 190 },
  { id: "10", name: "European Roulette", studio: "Classic Tables", categories: ["table"], hue: 0 },
  { id: "11", name: "Sweet Cascade", studio: "Arcadia", categories: ["slots", "new"], badge: "new", hue: 320 },
  { id: "12", name: "Poker Hold'em", studio: "Classic Tables", categories: ["table"], hue: 135 },
];
