import "server-only";

import { cookies } from "next/headers";

import { env } from "@/lib/env";

export const SESSION_COOKIE = "casino_web_token";

// Matches the customer token TTL issued by be.
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export async function getSessionToken(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

/** Only callable from Server Actions and Route Handlers. */
export async function setSessionToken(token: string): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

/** Only callable from Server Actions and Route Handlers. */
export async function clearSessionToken(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
