import { execFileSync } from "node:child_process";

import { expect, test as setup } from "@playwright/test";

import { BACKEND_DIR, backendEnv, CUSTOMER_STATE } from "./stack";
import { DEMO_CUSTOMER, signIn } from "./support";

setup.describe.configure({ mode: "serial" });

setup("reset the E2E database", () => {
  const artisan = (...args: string[]) =>
    execFileSync("php", ["artisan", ...args, "--force"], {
      cwd: BACKEND_DIR,
      env: { ...process.env, ...backendEnv },
      stdio: "pipe",
    });

  artisan("migrate"); // creates the database on first run
  artisan("migrate:fresh", "--seed");
});

setup("sign in as the demo customer", async ({ page }) => {
  await signIn(page, DEMO_CUSTOMER);
  await expect(page).toHaveURL("/account");
  await page.context().storageState({ path: CUSTOMER_STATE });
});
