"use client";

import type { ReactNode } from "react";

import { UiStoreProvider } from "@/providers/ui-store-provider";
import { UrqlProvider } from "@/providers/urql-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <UrqlProvider>
      <UiStoreProvider>{children}</UiStoreProvider>
    </UrqlProvider>
  );
}
