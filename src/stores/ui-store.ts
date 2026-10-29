import { createStore } from "zustand/vanilla";

/** Client UI state only. Server data lives in the GraphQL client cache, never here. */
export type UiState = {
  mobileNavOpen: boolean;
  activeCategory: string;
};

export type UiActions = {
  toggleMobileNav: () => void;
  closeMobileNav: () => void;
  setActiveCategory: (category: string) => void;
};

export type UiStore = UiState & UiActions;

export const defaultUiState: UiState = {
  mobileNavOpen: false,
  activeCategory: "all",
};

export function createUiStore(initialState: UiState = defaultUiState) {
  return createStore<UiStore>()((set) => ({
    ...initialState,
    toggleMobileNav: () => set((state) => ({ mobileNavOpen: !state.mobileNavOpen })),
    closeMobileNav: () => set({ mobileNavOpen: false }),
    setActiveCategory: (activeCategory) => set({ activeCategory }),
  }));
}
