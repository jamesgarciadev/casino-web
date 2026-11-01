import { createStore } from "zustand/vanilla";

import type { Side } from "@/gql/graphql";

/** Client UI state only. Server data (matches, wallet, bets) comes from be, never from here. */

/**
 * One pick: a side of the match (its winner market, which the match cards offer) or an outcome of another market
 * (the match page). Market picks keep their label and the odds when picked, shown until live odds arrive.
 */
export type SlipSelection =
  | { matchId: string; side: Side; outcomeId?: undefined }
  | { matchId: string; outcomeId: string; label: string; odds: number; side?: undefined };

/** Two picks back the same thing when they name the same side or the same outcome. */
export function samePick(a: SlipSelection, b: SlipSelection): boolean {
  return a.matchId === b.matchId && a.side === b.side && a.outcomeId === b.outcomeId;
}

/** The slip panel's tabs: the picks being built, or a quick look at the player's bets. */
export type SlipTab = "slip" | "bets";

export type BetsFilter = "open" | "settled";

/** When a My bets list was last loaded from be, and at which `betsVersion`. */
export type BetsSync = { version: number; at: number };

/** Cached My bets pages older than this are refetched when shown, in case an update was missed. */
export const BETS_MAX_AGE_MS = 60_000;

export type UiState = {
  /**
   * The bet slip's picks, at most one per match, in the order they were picked. One pick is a single, two or more
   * a combo. Odds are read live from the matches, and be uses its own odds when the bet is placed.
   */
  selections: SlipSelection[];
  stake: number;
  /** Whether the slip panel is showing; the floating button opens it even when it is empty. */
  slipOpen: boolean;
  slipTab: SlipTab;
  /**
   * Bumped whenever the player's bets change (placed, cashed out, settled). My bets lists are served from urql's
   * cache while their sync matches the current version, and refetched from be once it moves on.
   */
  betsVersion: number;
  betsSynced: Partial<Record<BetsFilter, BetsSync>>;
};

export type UiActions = {
  /**
   * Picking the same odds again removes it, as in the design. Any other odds of a match already on the slip (the
   * other side, or another market) replace that pick, since a combo can't back one match twice. Any other pick is
   * added.
   */
  toggleSelection: (selection: SlipSelection) => void;
  removeSelection: (matchId: string) => void;
  clearSlip: () => void;
  setSlipOpen: (open: boolean) => void;
  setSlipTab: (tab: SlipTab) => void;
  bumpBets: () => void;
  markBetsSynced: (filter: BetsFilter, version: number, at: number) => void;
  setStake: (stake: number) => void;
};

export type UiStore = UiState & UiActions;

export const defaultUiState: UiState = {
  selections: [],
  stake: 100,
  slipOpen: false,
  slipTab: "slip",
  betsVersion: 0,
  betsSynced: {},
};

/** Whether a My bets list can be shown from cache, or must be loaded from be first. */
export function betsAreFresh(state: Pick<UiState, "betsVersion" | "betsSynced">, filter: BetsFilter, now: number): boolean {
  const sync = state.betsSynced[filter];

  return sync !== undefined && sync.version === state.betsVersion && now - sync.at < BETS_MAX_AGE_MS;
}

export function createUiStore(initialState: UiState = defaultUiState) {
  return createStore<UiStore>()((set) => ({
    ...initialState,
    toggleSelection: (selection) =>
      set((state) => {
        const existing = state.selections.find((s) => s.matchId === selection.matchId);

        if (existing && samePick(existing, selection)) {
          return { selections: state.selections.filter((s) => s !== existing) };
        }

        return {
          selections: existing
            ? state.selections.map((s) => (s === existing ? selection : s))
            : [...state.selections, selection],
          // Only the first pick pops the slip open; while building a combo it would cover the odds.
          slipOpen: state.slipOpen || state.selections.length === 0,
          slipTab: "slip",
        };
      }),
    removeSelection: (matchId) => set((state) => ({ selections: state.selections.filter((s) => s.matchId !== matchId) })),
    clearSlip: () => set({ selections: [] }),
    setSlipOpen: (slipOpen) => set({ slipOpen }),
    setSlipTab: (slipTab) => set({ slipTab }),
    bumpBets: () => set((state) => ({ betsVersion: state.betsVersion + 1 })),
    markBetsSynced: (filter, version, at) => set((state) => ({ betsSynced: { ...state.betsSynced, [filter]: { version, at } } })),
    setStake: (stake) => set({ stake: Number.isFinite(stake) ? Math.max(0, Math.round(stake)) : 0 }),
  }));
}
