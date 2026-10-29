import type { BrowserContext, Page } from "@playwright/test";

import { SESSION_COOKIE } from "./stack";

type Account = { name: string; email: string; password: string };

// Seeded by casino-be's DatabaseSeeder when APP_ENV=local.
export const DEMO_CUSTOMER: Account = { name: "Customer Demo", email: "customer@casino.test", password: "password" };
export const DEMO_ADMIN: Account = { name: "Admin Demo", email: "admin@casino.test", password: "password" };

export function newAccount(): Account {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return { name: `E2E Player ${id}`, email: `e2e-${id}@example.com`, password: "e2e-password" };
}

export async function signIn(page: Page, account: Pick<Account, "email" | "password">) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(account.email);
  await page.getByLabel("Password").fill(account.password);
  await page.getByRole("button", { name: "Log in" }).click();
}

export async function sessionCookie(context: BrowserContext) {
  return (await context.cookies()).find((cookie) => cookie.name === SESSION_COOKIE);
}
