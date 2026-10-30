import { defineConfig, devices } from "@playwright/test";

import { APP_PORT, appEnv, BACKEND_DIR, BACKEND_PORT, backendEnv, REVERB_PORT } from "./e2e/stack";

const baseURL = `http://localhost:${APP_PORT}`;
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  // `php artisan serve` handles one request at a time on Windows, so keep parallelism modest.
  workers: 2,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "setup", testMatch: /global\.setup\.ts/ },
    { name: "chromium", use: { ...devices["Desktop Chrome"] }, dependencies: ["setup"] },
  ],
  webServer: [
    {
      command: `php artisan serve --host=127.0.0.1 --port=${BACKEND_PORT} --no-reload`,
      cwd: BACKEND_DIR,
      url: `http://127.0.0.1:${BACKEND_PORT}/up`,
      env: backendEnv,
      reuseExistingServer: !isCI,
      timeout: 60_000,
    },
    {
      // Websockets for live match updates, with the E2E app key.
      command: "php artisan reverb:start",
      cwd: BACKEND_DIR,
      port: REVERB_PORT,
      env: backendEnv,
      reuseExistingServer: !isCI,
      timeout: 60_000,
    },
    {
      // Production build: same cookies, caching and rendering as a real deploy.
      command: `npm run build && npx next start --port ${APP_PORT}`,
      url: baseURL,
      env: appEnv,
      reuseExistingServer: !isCI,
      timeout: 300_000,
    },
  ],
});
