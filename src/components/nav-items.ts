export const categories = [
  { id: "all", label: "Lobby", icon: "◆" },
  { id: "slots", label: "Slots", icon: "7" },
  { id: "live", label: "Live casino", icon: "●" },
  { id: "table", label: "Table games", icon: "♠" },
  { id: "jackpots", label: "Jackpots", icon: "★" },
  { id: "new", label: "New", icon: "✦" },
] as const;

export type CategoryId = (typeof categories)[number]["id"];
