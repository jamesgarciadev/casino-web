import type { MarketFieldsFragment, MarketType, Side } from "@/gql/graphql";

import type { Match } from "@/features/betting/match";

export type Market = MarketFieldsFragment;

export type Outcome = Market["outcomes"][number];

/** What a market says about itself; a bet's pick carries the same fields. */
export type MarketInfo = Pick<Market, "type" | "map" | "half" | "round" | "line" | "side">;

type Teams = Pick<Match, "teamA" | "teamB" | "game">;

export type TabId = "popular" | "all" | "rounds" | "match" | "map" | "half";

/** The tabs from the design, in order, and which market types each shows. "all" shows everything. */
const TAB_TYPES: Record<Exclude<TabId, "all">, MarketType[]> = {
  popular: ["WINNER", "MAP_HANDICAP", "TOTAL_MAPS", "MAP_WINNER", "MAP_1X2", "MAP_TOTAL_ROUNDS", "ROUND_WINNER", "PISTOL_ROUND"],
  rounds: ["ROUND_WINNER", "PISTOL_ROUND", "RACE_TO_ROUNDS", "BOMB_PLANTED", "ACE"],
  match: ["WINNER", "MAP_HANDICAP", "CORRECT_MAP_SCORE", "TOTAL_MAPS", "ODD_EVEN_MAPS", "ROUNDS_HANDICAP", "TOTAL_ROUNDS", "TEAM_TOTAL_ROUNDS"],
  map: ["MAP_WINNER", "MAP_1X2", "MAP_ROUNDS_HANDICAP", "MAP_TOTAL_ROUNDS", "RACE_TO_ROUNDS"],
  half: ["HALF_1X2", "HALF_HANDICAP"],
};

export const TAB_ORDER: TabId[] = ["popular", "all", "rounds", "match", "map", "half"];

export function inTab(tab: TabId, type: MarketType): boolean {
  return tab === "all" || TAB_TYPES[tab].includes(type);
}

/** "Map 3" and "Half 2" tabs are named after the map and half in play. */
export function tabLabel(tab: TabId, markets: Market[]): string {
  if (tab === "map" || tab === "half") {
    const market = markets.find((m) => inTab(tab, m.type) && (tab === "map" ? m.map : m.half));
    return tab === "map" ? `Map ${market?.map ?? ""}`.trim() : `Half ${market?.half ?? ""}`.trim();
  }

  return { popular: "Popular", all: "All", rounds: "Rounds", match: "Match" }[tab];
}

function team(match: Teams, side: Side | "a" | "b"): string {
  return side.toUpperCase() === "A" ? match.teamA : match.teamB;
}

/** A line with its sign, e.g. "+2.5" or "-1.5". */
function signed(line: number): string {
  return line > 0 ? `+${line}` : `${line}`;
}

/**
 * The section title a market sits under. Markets that differ only by line or round (several total-rounds lines, the
 * next few round winners) share a title and so a section, one row each.
 */
export function marketTitle(market: MarketInfo, match: Teams): string {
  const map = `Map ${market.map}`;
  const plant = match.game === "valorant" ? "Spike planted" : "Bomb planted";

  switch (market.type) {
    case "WINNER":
      return "Winner";
    case "MAP_HANDICAP":
      return "Map handicap";
    case "CORRECT_MAP_SCORE":
      return "Correct map score";
    case "TOTAL_MAPS":
      return "Total maps";
    case "ODD_EVEN_MAPS":
      return "Odd/Even maps";
    case "ROUNDS_HANDICAP":
      return "Rounds handicap (incl. overtime)";
    case "TOTAL_ROUNDS":
      return "Total rounds (incl. overtime)";
    case "TEAM_TOTAL_ROUNDS":
      return `${team(match, market.side ?? "A")} total rounds (incl. overtime)`;
    case "MAP_WINNER":
      return `${map} - Winner (incl. overtime)`;
    case "MAP_1X2":
      return `${map} - 1x2 (overtime not included)`;
    case "MAP_ROUNDS_HANDICAP":
      return `${map} - Round handicap`;
    case "MAP_TOTAL_ROUNDS":
      return `${map} - Total rounds`;
    case "RACE_TO_ROUNDS":
      return `${map} - Race to rounds`;
    case "ROUND_WINNER":
      return `${map} - Round winner`;
    case "PISTOL_ROUND":
      return `${map} - Pistol round winner`;
    case "BOMB_PLANTED":
      return `${map} round ${market.round} - ${plant}`;
    case "ACE":
      return `${map} - Round ${market.round} - Will an ACE happen?`;
    case "HALF_1X2":
      return `${map} - Half ${market.half} - 1x2`;
    case "HALF_HANDICAP":
      return `${map} - Half ${market.half} round handicap`;
  }
}

/** How an outcome reads on its button, e.g. "FlyQuest", "Over 22.5", "-1.5", "Alter Ego 14", "3:1". */
export function outcomeLabel(market: MarketInfo, key: string, match: Teams): string {
  const line = market.line ?? 0;

  switch (key) {
    case "a":
    case "b": {
      const name = team(match, key);

      if (market.type.endsWith("HANDICAP")) {
        return `${name} ${signed(key === "a" ? line : -line)}`;
      }

      if (market.type === "ROUND_WINNER" || market.type === "RACE_TO_ROUNDS") {
        return `${name} ${market.round}`;
      }

      if (market.type === "PISTOL_ROUND") {
        return `${name} ${market.round === 1 ? "1st" : "2nd"}`;
      }

      return name;
    }
    case "over":
      return `Over ${line}`;
    case "under":
      return `Under ${line}`;
    case "draw":
      return "Draw";
    case "odd":
      return "Odd";
    case "even":
      return "Even";
    case "yes":
      return "Yes";
    case "no":
      return "No";
    default:
      return key;
  }
}

/** The whole pick in one line, for the slip and My bets: "Map 3 - Total rounds · Over 22.5". */
export function pickLabel(market: MarketInfo, key: string, match: Teams): string {
  return market.type === "WINNER" ? `${team(match, key as "a" | "b")} to win` : `${marketTitle(market, match)} · ${outcomeLabel(market, key, match)}`;
}

/** Rounds played on the map in play, for the header's "R: 14/24". */
export function currentRound(match: Pick<Match, "maps" | "state">): { map: Match["maps"][number]; played: number } | null {
  const map = match.maps.at(-1);

  return map && match.state === "LIVE" ? { map, played: map.scoreA + map.scoreB } : null;
}
