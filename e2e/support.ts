import { readFileSync } from "node:fs";

import type { APIRequestContext, BrowserContext, Page } from "@playwright/test";

import { API_URL, SESSION_COOKIE, SIM_TOKEN_FILE } from "./stack";

type Account = { name: string; email: string; password: string };

// Seeded by casino-be's DatabaseSeeder when APP_ENV=local.
export const DEMO_CUSTOMER: Account = { name: "Customer Demo", email: "customer@casino.test", password: "Password1!" };
export const DEMO_ADMIN: Account = { name: "Admin Demo", email: "admin@casino.test", password: "Password1!" };

export function newAccount(): Account {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return { name: `E2E Player ${id}`, email: `e2e-${id}@example.com`, password: "E2e-Password1!" };
}

export async function signIn(page: Page, account: Pick<Account, "email" | "password">) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(account.email);
  await page.getByLabel("Password").fill(account.password);
  await page.getByRole("button", { name: "Log in" }).click();
}

/** Registers through the UI, so the player is signed in with a fresh 1,000 CR wallet. */
export async function registerNewPlayer(page: Page): Promise<Account> {
  const account = newAccount();

  await page.goto("/register");
  await page.getByLabel("Name").fill(account.name);
  await page.getByLabel("Email").fill(account.email);
  await page.getByLabel("Password", { exact: true }).fill(account.password);
  await page.getByLabel("Confirm password").fill(account.password);
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL("/account");

  return account;
}

export async function sessionCookie(context: BrowserContext) {
  return (await context.cookies()).find((cookie) => cookie.name === SESSION_COOKIE);
}

/** Call be's GraphQL API directly, e.g. to drive a match like casino-sim does. */
export async function api<T = Record<string, unknown>>(
  request: APIRequestContext,
  query: string,
  variables: Record<string, unknown> = {},
  token?: string,
): Promise<T> {
  const response = await request.post(API_URL, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    data: { query, variables },
  });
  const body = await response.json();

  if (body.errors) {
    throw new Error(`be rejected the request: ${body.errors[0].message}`);
  }

  return body.data as T;
}

const simToken = () => readFileSync(SIM_TOKEN_FILE, "utf8").trim();

/** A live match only this test touches, so parallel tests never see each other's score changes. */
export async function createLiveMatch(request: APIRequestContext, overrides: Record<string, unknown> = {}) {
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  const input = {
    game: "cs-go",
    gameName: "Counter-Strike",
    tournament: "E2E Invitational",
    teamA: `Alpha ${suffix}`,
    teamB: `Bravo ${suffix}`,
    oddsA: 1.8,
    oddsB: 2.0,
    startsAt: new Date().toISOString().replace(/\.\d{3}Z$/, "+00:00"),
    state: "LIVE",
    ...overrides,
  };
  const data = await api<{ simCreateMatch: { id: string } }>(
    request,
    "mutation ($input: SimCreateMatchInput!) { simCreateMatch(input: $input) { id } }",
    { input },
    simToken(),
  );

  return { id: data.simCreateMatch.id, teamA: input.teamA as string, teamB: input.teamB as string };
}

export async function updateMatch(request: APIRequestContext, id: string, input: Record<string, unknown>) {
  await api(request, "mutation ($id: ID!, $input: SimUpdateMatchInput!) { simUpdateMatch(id: $id, input: $input) { id } }", { id, input }, simToken());
}
