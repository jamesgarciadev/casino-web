import "server-only";

import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { print } from "graphql";
import { headers } from "next/headers";
import { connection } from "next/server";

import { getSessionToken } from "@/lib/auth/session";
import { env } from "@/lib/env";
import type { GraphQLErrorShape } from "@/lib/graphql/errors";

export type GraphQLResult<TData> = {
  data: TData | null;
  errors: GraphQLErrorShape[];
  /** Carries `lighthouse_subscriptions.channel` for subscription operations. */
  extensions?: Record<string, unknown>;
};

type RequestOptions = {
  /** Override the session token, e.g. `null` for sign-in mutations. Defaults to the cookie. */
  token?: string | null;
};

/**
 * Execute a GraphQL operation against be from the Next.js server.
 * Forwards the user's bearer token and client IP so be can authorize and rate limit correctly.
 */
export async function gqlRequest<TData, TVariables>(
  document: TypedDocumentNode<TData, TVariables>,
  variables?: TVariables,
  options: RequestOptions = {},
): Promise<GraphQLResult<TData>> {
  const token = options.token === undefined ? await getSessionToken() : options.token;

  return executeRaw<TData>({ query: print(document), variables }, token);
}

/** Lower-level entry used by the /api/graphql proxy. */
export async function executeRaw<TData = unknown>(
  body: { query: string; variables?: unknown; operationName?: string | null },
  token: string | null,
): Promise<GraphQLResult<TData>> {
  // be data is always live (scores, odds, balances), so never render it ahead of a request, e.g. while prefetching.
  await connection();
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for");

  const response = await fetch(env.apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(forwardedFor ? { "X-Forwarded-For": forwardedFor } : {}),
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  // Lighthouse returns GraphQL errors (validation, auth) with 200; anything else is a transport failure.
  if (!response.ok) {
    return { data: null, errors: [{ message: `API request failed with status ${response.status}.` }] };
  }

  const json = (await response.json()) as {
    data?: TData | null;
    errors?: GraphQLErrorShape[];
    extensions?: Record<string, unknown>;
  };

  return { data: json.data ?? null, errors: json.errors ?? [], ...(json.extensions ? { extensions: json.extensions } : {}) };
}
