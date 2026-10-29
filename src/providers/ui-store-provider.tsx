"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useStore } from "zustand";

import { createUiStore, type UiStore } from "@/stores/ui-store";

type UiStoreApi = ReturnType<typeof createUiStore>;

const UiStoreContext = createContext<UiStoreApi | null>(null);

/** One store per provider mount, so state is never shared between users during SSR. */
export function UiStoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => createUiStore());

  return <UiStoreContext value={store}>{children}</UiStoreContext>;
}

export function useUiStore<T>(selector: (store: UiStore) => T): T {
  const store = useContext(UiStoreContext);

  if (!store) {
    throw new Error("useUiStore must be used within UiStoreProvider");
  }

  return useStore(store, selector);
}
