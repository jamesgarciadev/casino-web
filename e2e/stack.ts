import path from "node:path";

// E2E runs against its own backend + database so it never touches dev data.
export const BACKEND_DIR = path.resolve(__dirname, "../../casino-be");
export const BACKEND_PORT = 8100;
export const APP_PORT = 3100;
export const API_URL = `http://127.0.0.1:${BACKEND_PORT}/graphql`;

export const backendEnv = {
  APP_ENV: "local",
  DB_DATABASE: "casino_e2e_web",
  // In-memory cache resets every request, which turns off the per-IP @throttle (covered by PHPUnit)
  // and keeps spatie's permission cache from leaking between the dev and E2E databases.
  CACHE_STORE: "array",
  SESSION_DRIVER: "array",
  QUEUE_CONNECTION: "sync",
};

export const SESSION_COOKIE = "casino_web_token";
export const CUSTOMER_STATE = path.resolve(__dirname, ".auth/customer.json");
