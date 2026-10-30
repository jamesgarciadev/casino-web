import { expect, test, type Page } from "@playwright/test";

import { createLiveMatch, registerNewPlayer, updateMatch } from "./support";

// Seeded by casino-be's FixtureSeeder (the design's demo matches): two live, the rest upcoming.
const card = (page: Page, teams: string) => page.getByRole("article", { name: teams });
const slip = (page: Page) => page.getByRole("complementary", { name: "Bet slip" });

test.describe("browsing", () => {
  test("landing page shows live and upcoming matches with odds", async ({ page }) => {
    await page.goto("/");

    const live = page.getByRole("region", { name: "Live now" });
    await expect(live.getByRole("article", { name: "Vitality vs MOUZ" })).toContainText("Live");
    await expect(live.getByRole("button", { name: "Vitality to win at 1.55" })).toBeVisible();

    const upcoming = page.getByRole("region", { name: "Upcoming series" });
    await expect(upcoming.getByRole("article", { name: "NAVI vs FaZe Clan" })).toBeVisible();
    await expect(upcoming.getByRole("article", { name: "Vitality vs MOUZ" })).toHaveCount(0);

    await expect(page.getByLabel("Headline odds")).toContainText("NAVI");
  });

  test("picking a game filters the match list", async ({ page }) => {
    await page.goto("/matches");
    await page.getByRole("navigation", { name: "Games" }).getByRole("link", { name: "Valorant" }).click();

    await expect(page).toHaveURL("/matches?game=valorant");
    await expect(card(page, "Sentinels vs Fnatic")).toBeVisible();
    await expect(card(page, "DRX vs Paper Rex")).toBeVisible();
    await expect(card(page, "NAVI vs FaZe Clan")).toHaveCount(0);

    await page.getByRole("navigation", { name: "Games" }).getByRole("link", { name: "All" }).click();
    await expect(card(page, "NAVI vs FaZe Clan")).toBeVisible();
  });

  test("landing page game tiles open the filtered list", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /^Dota 2/ }).click();

    await expect(page).toHaveURL("/matches?game=dota-2");
    await expect(card(page, "Team Spirit vs Gaimin Gladiators")).toBeVisible();
  });
});

test.describe("bet slip", () => {
  test("odds open the slip, stake chips update the payout, and signed-out players are asked to log in", async ({ page }) => {
    await page.goto("/matches");
    await page.getByRole("button", { name: "Sentinels to win at 2.10" }).click();

    await expect(slip(page)).toContainText("Sentinels to win");
    await expect(slip(page).getByTestId("potential-payout")).toHaveText("210 CR");

    await slip(page).getByRole("button", { name: "+50" }).click();
    await expect(slip(page).getByLabel("Stake (CR)")).toHaveValue("150");
    await expect(slip(page).getByTestId("potential-payout")).toHaveText("315 CR");

    await expect(slip(page).getByRole("link", { name: "Log in to place this bet" })).toHaveAttribute("href", "/login");

    // Tapping the same price again removes it.
    await page.getByRole("button", { name: "Sentinels to win at 2.10" }).click();
    await expect(slip(page)).toHaveCount(0);
  });

  test("placing a bet debits the wallet and lists it under My bets", async ({ page }) => {
    await registerNewPlayer(page);
    await page.goto("/matches");
    await page.getByRole("button", { name: "NAVI to win at 1.85" }).click();
    await slip(page).getByLabel("Stake (CR)").fill("250");
    await expect(slip(page).getByTestId("potential-payout")).toHaveText("463 CR");

    await slip(page).getByRole("button", { name: "Place bet" }).click();

    await expect(page).toHaveURL("/my-bets");
    await expect(page.getByText("Bet placed. Potential payout 463 CR.")).toBeVisible();
    await expect(page.getByTestId("wallet-balance")).toContainText("750");
    await expect(page.getByRole("banner").getByRole("link", { name: "Wallet: 750 CR" })).toBeVisible();
    const bet = page.getByRole("listitem", { name: "NAVI to win, pending" });
    await expect(bet).toContainText("250 CR");
    await expect(bet).toContainText("@ 1.85");
  });

  test("a stake above the balance is refused", async ({ page }) => {
    await registerNewPlayer(page);
    await page.goto("/matches");
    await page.getByRole("button", { name: "T1 to win at 2.40" }).click();
    await slip(page).getByLabel("Stake (CR)").fill("5000");
    await slip(page).getByRole("button", { name: "Place bet" }).click();

    await expect(page.getByText("Insufficient balance.")).toBeVisible();
    await expect(page).toHaveURL("/matches");
  });

  test("top-up adds 500 credits", async ({ page }) => {
    await registerNewPlayer(page);
    await page.goto("/my-bets");
    await expect(page.getByText("No bets yet. Your first clutch awaits.")).toBeVisible();

    await page.getByRole("button", { name: "Top up +500 CR" }).click();

    await expect(page.getByTestId("wallet-balance")).toContainText("1,500");
  });

  test("My bets requires signing in", async ({ page }) => {
    await page.goto("/my-bets");
    await expect(page).toHaveURL("/login");
  });
});

test.describe("live updates", () => {
  test("scores and odds update without reloading, and a finished match settles the bet", async ({ page, request }) => {
    const match = await createLiveMatch(request);
    const teams = `${match.teamA} vs ${match.teamB}`;

    await registerNewPlayer(page);
    await page.goto("/matches");
    await page.getByRole("button", { name: `${match.teamA} to win at 1.80` }).click();
    await slip(page).getByRole("button", { name: "Place bet" }).click();
    await expect(page).toHaveURL("/my-bets");

    await page.goto("/matches");
    await expect(page.getByRole("status")).toHaveText("Live updates on");

    // casino-sim's next round: score and price move on screen.
    await updateMatch(request, match.id, { scoreA: 5, scoreB: 3, oddsA: 1.25, oddsB: 3.6 });
    await expect(card(page, teams).getByLabel("Score 5 to 3")).toBeVisible();
    await expect(card(page, teams).getByRole("button", { name: `${match.teamA} to win at 1.25` })).toBeVisible();

    // The match ends: it leaves the live list and the winnings (100 × 1.80) reach the header wallet.
    await updateMatch(request, match.id, { scoreA: 13, state: "FINISHED", winner: "A" });
    await expect(card(page, teams)).toHaveCount(0);
    await expect(page.getByRole("banner").getByRole("link", { name: "Wallet: 1,080 CR" })).toBeVisible();

    await page.goto("/my-bets");
    await expect(page.getByRole("listitem", { name: `${match.teamA} to win, won` })).toContainText("180 CR");
  });
});
