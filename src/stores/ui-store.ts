import { createStore } from "zustand/vanilla";

import type { Side } from "@/gql/graphql";

/** Client UI state only. Server data (matches, wallet, bets) comes from be, never from here. */
export type SlipSelection = { matchId: string; side: Side };

export type UiState = {
  /** The bet slip's pick. Odds are read live from the match, and be uses its own odds when the bet is placed. */
  selection: SlipSelection | null;
  stake: number;
  /** Whether the slip panel is showing; the floating button opens it even when it is empty. */
  slipOpen: boolean;
};

export type UiActions = {
  /** Picking the same odds again removes it, as in the design. Picking new odds opens the slip. */
  toggleSelection: (selection: SlipSelection) => void;
  clearSlip: () => void;
  setSlipOpen: (open: boolean) => void;
  setStake: (stake: number) => void;
};

export type UiStore = UiState & UiActions;

export const defaultUiState: UiState = {
  selection: null,
  stake: 100,
  slipOpen: false,
};

export function createUiStore(initialState: UiState = defaultUiState) {
  return createStore<UiStore>()((set) => ({
    ...initialState,
    toggleSelection: (selection) =>
      set((state) =>
        state.selection?.matchId === selection.matchId && state.selection.side === selection.side
          ? { selection: null }
          : { selection, slipOpen: true },
      ),
    clearSlip: () => set({ selection: null }),
    setSlipOpen: (slipOpen) => set({ slipOpen }),
    setStake: (stake) => set({ stake: Number.isFinite(stake) ? Math.max(0, Math.round(stake)) : 0 }),
  }));
}
