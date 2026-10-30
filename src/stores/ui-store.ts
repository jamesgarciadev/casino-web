import { createStore } from "zustand/vanilla";

import type { Side } from "@/gql/graphql";

/** Client UI state only. Server data (matches, wallet, bets) comes from be, never from here. */
export type SlipSelection = { matchId: string; side: Side };

/** The slip panel's tabs: the picks being built, or a quick look at the player's bets. */
export type SlipTab = "slip" | "bets";

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
};

export type UiActions = {
  /**
   * Picking the same odds again removes it, as in the design. The other side of a match already on the slip
   * replaces that pick, since a combo can't back one match twice. Any other pick is added.
   */
  toggleSelection: (selection: SlipSelection) => void;
  removeSelection: (matchId: string) => void;
  clearSlip: () => void;
  setSlipOpen: (open: boolean) => void;
  setSlipTab: (tab: SlipTab) => void;
  setStake: (stake: number) => void;
};

export type UiStore = UiState & UiActions;

export const defaultUiState: UiState = {
  selections: [],
  stake: 100,
  slipOpen: false,
  slipTab: "slip",
};

export function createUiStore(initialState: UiState = defaultUiState) {
  return createStore<UiStore>()((set) => ({
    ...initialState,
    toggleSelection: (selection) =>
      set((state) => {
        const existing = state.selections.find((s) => s.matchId === selection.matchId);

        if (existing?.side === selection.side) {
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
    setStake: (stake) => set({ stake: Number.isFinite(stake) ? Math.max(0, Math.round(stake)) : 0 }),
  }));
}
