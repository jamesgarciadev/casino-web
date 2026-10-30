"use client";

import type { ReactNode } from "react";

import { LiveMatchesProvider, type ReverbSettings } from "@/features/betting/live-matches";
import { UiStoreProvider } from "@/providers/ui-store-provider";
import { UrqlProvider } from "@/providers/urql-provider";

export function AppProviders({ reverb, children }: { reverb: ReverbSettings; children: ReactNode }) {
  return (
    <UrqlProvider>
      <LiveMatchesProvider reverb={reverb}>
        <UiStoreProvider>{children}</UiStoreProvider>
      </LiveMatchesProvider>
    </UrqlProvider>
  );
}
