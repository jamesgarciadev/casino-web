"use client";

import { useRouter } from "next/navigation";
import Pusher from "pusher-js";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { stringifyDocument, useClient } from "urql";
import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

import { byLiveThenStart, type Match } from "@/features/betting/match";
import { MatchesQuery, MatchUpdatedSubscription } from "@/lib/graphql/operations";

/** Server-side Reverb settings, passed down from the root layout. */
export type ReverbSettings = { key: string; host: string; port: number; scheme: string };

export type LiveStatus = "connecting" | "live" | "offline";

type LiveState = {
  /** Newest known version of each match, from pushes or fallback polling. */
  matches: Record<string, Match>;
  status: LiveStatus;
  /** Add server-rendered matches the store hasn't seen; never overwrites a newer pushed version. */
  seed: (matches: Match[]) => void;
  apply: (match: Match) => void;
  replaceActive: (matches: Match[]) => void;
  setStatus: (status: LiveStatus) => void;
};

function createLiveStore() {
  return createStore<LiveState>()((set) => ({
    matches: {},
    status: "connecting",
    seed: (matches) =>
      set((state) => ({ matches: { ...Object.fromEntries(matches.map((m) => [m.id, m])), ...state.matches } })),
    apply: (match) => set((state) => ({ matches: { ...state.matches, [match.id]: match } })),
    // A poll returns every match that isn't finished, so anything else we hold as active has finished or gone.
    replaceActive: (active) =>
      set((state) => ({
        matches: {
          ...Object.fromEntries(Object.entries(state.matches).filter(([, m]) => m.state === "FINISHED")),
          ...Object.fromEntries(active.map((m) => [m.id, m])),
        },
      })),
    setStatus: (status) => set({ status }),
  }));
}

const LiveContext = createContext<ReturnType<typeof createLiveStore> | null>(null);

const POLL_MS = 10_000;

const RESUBSCRIBE_MS = 50 * 60_000;

/**
 * Keeps match scores, odds and states current. Subscribes to be's `matchUpdated` over Reverb; if the socket
 * can't connect, falls back to polling so the pages still move. Finished matches refresh the server components
 * (wallet chip, My Bets) because be has just settled bets.
 */
export function LiveMatchesProvider({ reverb, children }: { reverb: ReverbSettings; children: ReactNode }) {
  const [store] = useState(createLiveStore);
  const client = useClient();
  const router = useRouter();
  // Bumped before be forgets the subscription (LIGHTHOUSE_SUBSCRIPTION_STORAGE_TTL, 1 hour), which reconnects below.
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setGeneration((g) => g + 1), RESUBSCRIBE_MS);

    return () => clearTimeout(timer);
  }, [generation]);

  useEffect(() => {
    if (!reverb.key) {
      store.getState().setStatus("offline");
      return;
    }

    const pusher = new Pusher(reverb.key, {
      cluster: "",
      wsHost: reverb.host,
      wsPort: reverb.port,
      wssPort: reverb.port,
      forceTLS: reverb.scheme === "https",
      enabledTransports: ["ws", "wss"],
      channelAuthorization: { endpoint: "/api/graphql/subscriptions/auth", transport: "ajax" },
    });

    // "live" is set once the match channel is joined (below), not merely when the socket opens.
    pusher.connection.bind("state_change", ({ current }: { current: string }) => {
      if (current !== "connected") {
        store.getState().setStatus(current === "connecting" ? "connecting" : "offline");
      }
    });

    let cancelled = false;

    (async () => {
      const response = await fetch("/api/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: stringifyDocument(MatchUpdatedSubscription) }),
      }).catch(() => null);
      const body = (await response?.json().catch(() => null)) as {
        extensions?: { lighthouse_subscriptions?: { channel?: string } };
      } | null;
      const channel = body?.extensions?.lighthouse_subscriptions?.channel;

      if (cancelled) {
        return;
      }

      if (!channel) {
        store.getState().setStatus("offline");
        return;
      }

      pusher
        .subscribe(channel)
        // Fires again after every reconnect, when pusher-js re-joins the channel.
        .bind("pusher:subscription_succeeded", () => store.getState().setStatus("live"))
        .bind("lighthouse-subscription", (payload: { result?: { data?: { matchUpdated?: Match | null } } }) => {
          const match = payload.result?.data?.matchUpdated;

          if (match) {
            store.getState().apply(match);

            if (match.state === "FINISHED") {
              router.refresh();
            }
          }
        });
    })();

    return () => {
      cancelled = true;
      // Unbind first so this socket's "disconnected" can't overwrite the status of the one that replaces it.
      pusher.connection.unbind_all();
      pusher.disconnect();
    };
  }, [reverb.key, reverb.host, reverb.port, reverb.scheme, store, router, generation]);

  // Fallback: poll while the socket is down.
  const status = useStore(store, (s) => s.status);

  useEffect(() => {
    if (status !== "offline") {
      return;
    }

    const timer = setInterval(async () => {
      const result = await client.query(MatchesQuery, {}, { requestPolicy: "network-only" }).toPromise();

      if (result.data) {
        store.getState().replaceActive(result.data.matches);
      }
    }, POLL_MS);

    return () => clearInterval(timer);
  }, [status, client, store]);

  return <LiveContext value={store}>{children}</LiveContext>;
}

function useLiveStore<T>(selector: (state: LiveState) => T): T {
  const store = useContext(LiveContext);

  if (!store) {
    throw new Error("useLiveStore must be used within LiveMatchesProvider");
  }

  return useStore(store, selector);
}

export function useLiveStatus(): LiveStatus {
  return useLiveStore((s) => s.status);
}

/** The newest version of one match, falling back to the server-rendered one. */
export function useLiveMatch(initial: Match): Match {
  return useLiveStore((s) => s.matches[initial.id]) ?? initial;
}

/** The newest version of a match by id, if the client has seen it. */
export function useKnownMatch(id: string | undefined): Match | undefined {
  return useLiveStore((s) => (id ? s.matches[id] : undefined));
}

/**
 * Server-rendered matches overlaid with live versions, plus matches created since the page rendered.
 * Identical to `initial` until the first push, so server and client render the same markup.
 */
export function useLiveMatches(initial: Match[], include: (match: Match) => boolean, limit?: number): Match[] {
  const live = useLiveStore((s) => s.matches);
  const seed = useLiveStore((s) => s.seed);

  // So the bet slip and other lists can look these matches up by id.
  useEffect(() => seed(initial), [seed, initial]);

  return useMemo(() => {
    const merged = new Map(initial.map((m) => [m.id, live[m.id] ?? m]));

    for (const match of Object.values(live)) {
      merged.set(match.id, match);
    }

    const list = [...merged.values()].filter(include).sort(byLiveThenStart);

    return limit === undefined ? list : list.slice(0, limit);
  }, [initial, live, include, limit]);
}
