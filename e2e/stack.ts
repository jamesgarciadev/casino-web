import path from "node:path";

// E2E runs against its own backend, database and websocket server so it never touches dev data.
export const BACKEND_DIR = path.resolve(__dirname, "../../casino-be");
export const BACKEND_PORT = 8100;
export const REVERB_PORT = 6101;
export const APP_PORT = 3100;
export const API_URL = `http://127.0.0.1:${BACKEND_PORT}/graphql`;

// Separate Reverb app from dev, so a running dev simulator can't push into test browsers.
const reverb = { REVERB_APP_ID: "e2e-web", REVERB_APP_KEY: "e2e-web-key", REVERB_APP_SECRET: "e2e-web-secret" };

export const backendEnv = {
  APP_ENV: "local",
  DB_DATABASE: "casino_e2e_web",
  // In-memory cache resets every request, which turns off the per-IP @throttle (covered by PHPUnit)
  // and keeps spatie's permission cache from leaking between the dev and E2E databases.
  CACHE_STORE: "array",
  SESSION_DRIVER: "array",
  QUEUE_CONNECTION: "sync",
  // GraphQL subscriptions are stored on the default Redis connection: give E2E its own database, emptied in global setup.
  REDIS_DB: "3",
  ...reverb,
  REVERB_HOST: "127.0.0.1",
  REVERB_PORT: String(REVERB_PORT),
  REVERB_SERVER_PORT: String(REVERB_PORT),
  REVERB_SCHEME: "http",
};

/** What the Next.js app needs to reach the E2E backend and websocket. */
export const appEnv = {
  CASINO_API_URL: API_URL,
  REVERB_APP_KEY: reverb.REVERB_APP_KEY,
  REVERB_HOST: "127.0.0.1",
  REVERB_PORT: String(REVERB_PORT),
  REVERB_SCHEME: "http",
};

export const SESSION_COOKIE = "casino_web_token";
export const CUSTOMER_STATE = path.resolve(__dirname, ".auth/customer.json");
/** `sim` token minted in global setup, so tests can drive a match the way casino-sim does. */
export const SIM_TOKEN_FILE = path.resolve(__dirname, ".auth/sim-token.txt");
