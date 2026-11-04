import { expect, test } from "@playwright/test";

import { CUSTOMER_STATE, SESSION_COOKIE } from "./stack";
import { DEMO_CUSTOMER } from "./support";

test.describe("signed out", () => {
  test("landing page shows log in and sign up", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("banner").getByRole("link", { name: "Log in" })).toBeVisible();
    await expect(page.getByRole("banner").getByRole("link", { name: "Sign up" })).toBeVisible();
  });

  test("account page redirects to log in", async ({ page }) => {
    await page.goto("/account");
    await expect(page).toHaveURL("/login");
  });

  test("a forged or expired cookie is treated as signed out", async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: SESSION_COOKIE, value: "1|forged-token", url: baseURL! }]);

    await page.goto("/account");

    await expect(page).toHaveURL("/login");
  });
});

test.describe("signed in", () => {
  test.use({ storageState: CUSTOMER_STATE });

  test("account page shows the player's details", async ({ page }) => {
    await page.goto("/account");

    await expect(page.getByRole("heading", { name: "My account" })).toBeVisible();
    await expect(page.getByRole("main").getByText(DEMO_CUSTOMER.name, { exact: true })).toBeVisible();
    await expect(page.getByRole("main").getByText(DEMO_CUSTOMER.email)).toBeVisible();
    await expect(page.getByText("Member since")).toBeVisible();
  });

  test("header shows the account link instead of log in", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("banner").getByRole("link", { name: new RegExp(DEMO_CUSTOMER.name) })).toBeVisible();
    await expect(page.getByRole("banner").getByRole("link", { name: "Log in" })).toHaveCount(0);
  });

  test("client-side GraphQL proxy forwards the session", async ({ page }) => {
    await page.goto("/");

    const response = await page.request.post("/api/graphql", { data: { query: "{ me { email roles } }" } });

    expect(await response.json()).toMatchObject({ data: { me: { email: DEMO_CUSTOMER.email, roles: ["customer"] } } });
  });

  test("client-side GraphQL proxy refuses token-issuing mutations", async ({ page }) => {
    await page.goto("/");

    const response = await page.request.post("/api/graphql", {
      data: { query: `mutation { login(input: { email: "${DEMO_CUSTOMER.email}", password: "Password1!" }) { token } }` },
    });

    expect(response.status()).toBe(403);
  });
});
