"use client";

import { useRouter } from "next/navigation";
import Pusher from "pusher-js";
import { createContext, useContext, useEffect, useEffectEvent, useMemo, useState, type ReactNode } from "react";
import { stringifyDocument, useClient, type TypedDocumentNode } from "urql";
import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

import { byLiveThenStart, type Match } from "@/features/betting/match";
import type { Market } from "@/features/markets/markets";
import { MatchesQuery, MatchUpdatedSubscription } from "@/lib/graphql/operations";

/** Server-side Reverb settings, passed down from the root layout. */
export type ReverbSettings = { key: string; host: string; port: number; scheme: string };

export type LiveStatus = "connecting" | "live" | "offline";

type LiveState = {
  /** Newest known version of each match, from pushes or fallback polling. */
  matches: Record<string, Match>;
  /** Open and suspended markets per match, for matches whose page is (or was) open. */
  markets: Record<string, Market[]>;
  status: LiveStatus;
  /** Add server-rendered matches the store hasn't seen; never overwrites a newer pushed version. */
  seed: (matches: Match[]) => void;
  apply: (match: Match) => void;
  applyMarkets: (matchId: string, markets: Market[]) => void;
  replaceActive: (matches: Match[]) => void;
  setStatus: (status: LiveStatus) => void;
};

function createLiveStore() {
  return createStore<LiveState>()((set) => ({
    matches: {},
    markets: {},
    status: "connecting",
    seed: (matches) =>
      set((state) => ({ matches: { ...Object.fromEntries(matches.map((m) => [m.id, m])), ...state.matches } })),
    apply: (match) => set((state) => ({ matches: { ...state.matches, [match.id]: match } })),
    applyMarkets: (matchId, markets) => set((state) => ({ markets: { ...state.markets, [matchId]: markets } })),
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

/** The open Reverb socket, shared by every subscription on the page; null while connecting or offline. */
const SocketContext = createContext<Pusher | null>(null);

/**
 * Register a GraphQL subscription with be (through the same-origin proxy) and listen on the channel it returns.
 * Returns a function that stops listening.
 */
function joinSubscription<T>(
  pusher: Pusher,
  query: string,
  variables: Record<string, unknown>,
  onData: (data: T) => void,
  onJoined?: () => void,
  onFailed?: () => void,
): () => void {
  let cancelled = false;
  let channel: string | undefined;

  (async () => {
    const response = await fetch("/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
    }).catch(() => null);
    const body = (await response?.json().catch(() => null)) as {
      extensions?: { lighthouse_subscriptions?: { channel?: string } };
    } | null;
    channel = body?.extensions?.lighthouse_subscriptions?.channel;

    if (cancelled) {
      return;
    }

    if (!channel) {
      onFailed?.();
      return;
    }

    pusher
      .subscribe(channel)
      // Fires again after every reconnect, when pusher-js re-joins the channel.
      .bind("pusher:subscription_succeeded", () => onJoined?.())
      .bind("lighthouse-subscription", (payload: { result?: { data?: T | null } }) => {
        if (payload.result?.data) {
          onData(payload.result.data);
        }
      });
  })();

  return () => {
    cancelled = true;

    if (channel) {
      pusher.unsubscribe(channel);
    }
  };
}

const POLL_MS = 10_000;

const RESUBSCRIBE_MS = 50 * 60_000;

/**
 * Keeps match scores, odds and states current. Subscribes to be's `matchUpdated` over Reverb; if the socket
 * can't connect, falls back to polling so the pages still move. Finished matches refresh the server components
 * (wallet chip, My Bets) because be has just settled bets.
 */
export function LiveMatchesProvider({ reverb, children }: { reverb: ReverbSettings; children: ReactNode }) {
  const [store] = useState(createLiveStore);
  const [socket, setSocket] = useState<Pusher | null>(null);
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

    pusher.connection.bind("state_change", ({ current }: { current: string }) => {
      if (current !== "connected") {
        store.getState().setStatus(current === "connecting" ? "connecting" : "offline");
      }
    });

    // Shared once it connects, so page-level subscriptions (the match page) ride the same socket.
    pusher.connection.bind("connected", () => setSocket(pusher));
    const leave = joinSubscription<{ matchUpdated?: Match | null }>(
      pusher,
      stringifyDocument(MatchUpdatedSubscription),
      {},
      ({ matchUpdated: match }) => {
        if (match) {
          store.getState().apply(match);

          if (match.state === "FINISHED") {
            router.refresh();
          }
        }
      },
      // "live" is set once the match channel is joined, not merely when the socket opens.
      () => store.getState().setStatus("live"),
      () => store.getState().setStatus("offline"),
    );

    return () => {
      leave();
      setSocket(null);
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

  return (
    <LiveContext value={store}>
      <SocketContext value={socket}>{children}</SocketContext>
    </LiveContext>
  );
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

/** All matches the client has seen, by id, for looking up several at once (the bet slip). */
export function useKnownMatchMap(): Record<string, Match> {
  return useLiveStore((s) => s.matches);
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

/** Put server-rendered matches in the store (never over a newer pushed version), so the bet slip can find them. */
export function useSeedMatches(matches: Match[]): void {
  const seed = useLiveStore((s) => s.seed);

  useEffect(() => seed(matches), [seed, matches]);
}

export function useApplyMatch(): (match: Match) => void {
  return useLiveStore((s) => s.apply);
}

/** The markets last pushed for a match, or undefined until its page has loaded them. */
export function useKnownMarkets(matchId: string): Market[] | undefined {
  return useLiveStore((s) => s.markets[matchId]);
}

/** Every match's known markets, for looking up several picks at once (the bet slip, My bets). */
export function useKnownMarketMap(): Record<string, Market[]> {
  return useLiveStore((s) => s.markets);
}

export function useApplyMarkets(): (matchId: string, markets: Market[]) => void {
  return useLiveStore((s) => s.applyMarkets);
}

/**
 * Listen to a subscription over the shared socket while the component is mounted. `onData` always sees the latest
 * props. `onJoined` runs each time the channel is joined (again after a reconnect): anything pushed before that was
 * missed, so it is the moment to refetch. Returns whether this channel is joined and the socket is up, so callers can
 * poll instead while it isn't.
 */
export function useLiveSubscription<T, V extends Record<string, unknown>>(
  document: TypedDocumentNode<T, V>,
  variables: V,
  onData: (data: T) => void,
  onJoined?: () => void,
): boolean {
  const socket = useContext(SocketContext);
  const handle = useEffectEvent(onData);
  const joined = useEffectEvent(() => onJoined?.());
  const key = JSON.stringify(variables);
  // The channel last joined, so a new socket or new variables count as not joined without resetting anything.
  const [joinedChannel, setJoinedChannel] = useState<{ socket: Pusher; key: string } | null>(null);

  useEffect(() => {
    if (!socket) {
      return;
    }

    return joinSubscription<T>(
      socket,
      stringifyDocument(document),
      JSON.parse(key) as V,
      (data) => handle(data),
      () => {
        setJoinedChannel({ socket, key });
        joined();
      },
      () => setJoinedChannel(null),
    );
  }, [socket, document, key]);

  const status = useLiveStatus();

  return socket !== null && status === "live" && joinedChannel?.socket === socket && joinedChannel.key === key;
}
