"use client";

import { useState, type ReactNode } from "react";
import { Client, Provider, cacheExchange, fetchExchange } from "urql";

/**
 * GraphQL client for Client Components. Requests go to the same-origin /api/graphql proxy,
 * which attaches the httpOnly session token server-side.
 */
export function UrqlProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new Client({
        url: "/api/graphql",
        exchanges: [cacheExchange, fetchExchange],
        fetchOptions: { credentials: "same-origin" },
        // urql sends short queries as GET by default; the proxy only accepts POST.
        preferGetMethod: false,
      }),
  );

  return <Provider value={client}>{children}</Provider>;
}
