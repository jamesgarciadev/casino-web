import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { expect, test as setup } from "@playwright/test";

import { BACKEND_DIR, backendEnv, CUSTOMER_STATE, SIM_TOKEN_FILE } from "./stack";
import { DEMO_CUSTOMER, signIn } from "./support";

setup.describe.configure({ mode: "serial" });

const artisan = (...args: string[]) =>
  execFileSync("php", ["artisan", ...args], {
    cwd: BACKEND_DIR,
    env: { ...process.env, ...backendEnv },
    stdio: "pipe",
  }).toString();

setup("reset the E2E database", () => {
  artisan("migrate", "--force"); // creates the database on first run
  artisan("migrate:fresh", "--seed", "--force");
  // Forget subscriptions from earlier runs; their users were just deleted (E2E's own Redis database, see stack.ts).
  artisan("tinker", "--execute", String.raw`Illuminate\Support\Facades\Redis::connection()->flushdb();`);
});

setup("issue a sim token", () => {
  // The command prints the token on its last line.
  const token = artisan("sim:token").trim().split(/\r?\n/).at(-1)!.trim();
  mkdirSync(path.dirname(SIM_TOKEN_FILE), { recursive: true });
  writeFileSync(SIM_TOKEN_FILE, token);
});

setup("sign in as the demo customer", async ({ page }) => {
  await signIn(page, DEMO_CUSTOMER);
  await expect(page).toHaveURL("/account");
  await page.context().storageState({ path: CUSTOMER_STATE });
});
