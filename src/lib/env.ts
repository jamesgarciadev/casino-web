import "server-only";

const apiUrl = process.env.CASINO_API_URL ?? "http://localhost:8000/graphql";

export const env = {
  apiUrl,
  /** be's origin, for routes outside /graphql such as subscription channel auth. */
  apiOrigin: new URL(apiUrl).origin,
  isProduction: process.env.NODE_ENV === "production",
};

/**
 * Where browsers open the Reverb websocket for live match updates. Read on the server and passed down by the root
 * layout, which is prerendered, so set these before `next build`. The key is public: Reverb only accepts
 * channels that be authorizes.
 */
export const reverbConfig = {
  key: process.env.REVERB_APP_KEY ?? "",
  host: process.env.REVERB_HOST ?? "localhost",
  port: Number(process.env.REVERB_PORT ?? 6001),
  scheme: process.env.REVERB_SCHEME ?? "http",
};

export type ReverbConfig = typeof reverbConfig;
