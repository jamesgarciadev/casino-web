import { createStore } from "zustand/vanilla";

import type { Side } from "@/gql/graphql";

/** Client UI state only. Server data (matches, wallet, bets) comes from be, never from here. */
export type SlipSelection = { matchId: string; side: Side };

export type UiState = {
  /** The bet slip's pick. Odds are read live from the match, and be uses its own odds when the bet is placed. */
  selection: SlipSelection | null;
  stake: number;
};

export type UiActions = {
  /** Picking the same odds again removes it, as in the design. */
  toggleSelection: (selection: SlipSelection) => void;
  clearSlip: () => void;
  setStake: (stake: number) => void;
};

export type UiStore = UiState & UiActions;

export const defaultUiState: UiState = {
  selection: null,
  stake: 100,
};

export function createUiStore(initialState: UiState = defaultUiState) {
  return createStore<UiStore>()((set) => ({
    ...initialState,
    toggleSelection: (selection) =>
      set((state) => ({
        selection:
          state.selection?.matchId === selection.matchId && state.selection.side === selection.side ? null : selection,
      })),
    clearSlip: () => set({ selection: null }),
    setStake: (stake) => set({ stake: Number.isFinite(stake) ? Math.max(0, Math.round(stake)) : 0 }),
  }));
}
