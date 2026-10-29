import { expect, test } from "@playwright/test";

import { API_URL } from "./stack";
import { DEMO_ADMIN, DEMO_CUSTOMER, newAccount, sessionCookie, signIn } from "./support";

test.describe("log in", () => {
  test("customer signs in and lands on their account", async ({ page, context }) => {
    await signIn(page, DEMO_CUSTOMER);

    await expect(page).toHaveURL("/account");
    await expect(page.getByText(DEMO_CUSTOMER.email)).toBeVisible();

    const cookie = await sessionCookie(context);
    expect(cookie).toMatchObject({ httpOnly: true, sameSite: "Lax", path: "/" });
  });

  test("session token is never exposed to page JavaScript", async ({ page, context }) => {
    await signIn(page, DEMO_CUSTOMER);
    await expect(page).toHaveURL("/account");

    const token = (await sessionCookie(context))!.value;
    const exposed = await page.evaluate(
      (value) => document.cookie.includes(value) || JSON.stringify({ ...localStorage, ...sessionStorage }).includes(value),
      token,
    );

    expect(exposed).toBe(false);
  });

  test("wrong password shows an error and stays on the login page", async ({ page, context }) => {
    await signIn(page, { email: DEMO_CUSTOMER.email, password: "not-the-password" });

    await expect(page.getByText("These credentials do not match our records.")).toBeVisible();
    await expect(page).toHaveURL("/login");
    expect(await sessionCookie(context)).toBeUndefined();
  });

  test("staff accounts cannot sign in to the customer app", async ({ page }) => {
    await signIn(page, DEMO_ADMIN);

    await expect(page.getByText("These credentials do not match our records.")).toBeVisible();
    await expect(page).toHaveURL("/login");
  });

  test("invalid input is caught in the browser before anything is sent", async ({ page }) => {
    await page.goto("/login");
    const posts: string[] = [];
    page.on("request", (request) => request.method() === "POST" && posts.push(request.url()));

    await page.getByLabel("Email").fill("not-an-email");
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page.getByText("Enter a valid email address.")).toBeVisible();
    await expect(page.getByText("Enter your password.")).toBeVisible();
    expect(posts).toEqual([]);
  });
});

test.describe("register", () => {
  test("new player creates an account and is signed in", async ({ page, context }) => {
    const account = newAccount();

    await page.goto("/register");
    await page.getByLabel("Name").fill(account.name);
    await page.getByLabel("Email").fill(account.email);
    await page.getByLabel("Password", { exact: true }).fill(account.password);
    await page.getByLabel("Confirm password").fill(account.password);
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page).toHaveURL("/account");
    await expect(page.getByText(account.email)).toBeVisible();
    expect(await sessionCookie(context)).toBeDefined();
  });

  test("an email that is already registered is flagged on the email field", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Name").fill("Someone Else");
    await page.getByLabel("Email").fill(DEMO_CUSTOMER.email);
    await page.getByLabel("Password", { exact: true }).fill("e2e-password");
    await page.getByLabel("Confirm password").fill("e2e-password");
    await page.getByRole("button", { name: "Create account" }).click();

    // This rule only exists in be, so the error proves server errors map back onto form fields.
    await expect(page.locator("#email-error")).toContainText(/taken/i);
    await expect(page.getByLabel("Email")).toHaveAttribute("aria-invalid", "true");
    await expect(page).toHaveURL("/register");
  });

  test("mismatched and short passwords are rejected in the browser", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Name").fill("Jane");
    await page.getByLabel("Email").fill(newAccount().email);
    await page.getByLabel("Password", { exact: true }).fill("short");
    await page.getByLabel("Confirm password").fill("different");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Password must be at least 8 characters.")).toBeVisible();
    await expect(page.getByText("Passwords do not match.")).toBeVisible();
  });
});

test.describe("log out", () => {
  test("clears the cookie, revokes the token and protects the account page again", async ({ page, context, request }) => {
    // Own session, so the shared customer session used by other specs stays valid.
    await signIn(page, DEMO_CUSTOMER);
    await expect(page).toHaveURL("/account");
    const token = (await sessionCookie(context))!.value;

    await page.getByRole("button", { name: "Log out" }).click();

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("banner").getByRole("link", { name: "Log in" })).toBeVisible();
    expect(await sessionCookie(context)).toBeUndefined();

    const me = await request.post(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
      data: { query: "{ me { id } }" },
    });
    expect((await me.json()).errors?.[0]?.message).toBe("Unauthenticated.");

    await page.goto("/account");
    await expect(page).toHaveURL("/login");
  });
});
