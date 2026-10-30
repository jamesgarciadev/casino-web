import { expect, test, type Page } from "@playwright/test";

import { api, createLiveMatch, newAccount, registerNewPlayer, signIn, updateMatch } from "./support";

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

    // Tapping the same price again removes it and leaves the empty slip.
    await page.getByRole("button", { name: "Sentinels to win at 2.10" }).click();
    await expect(slip(page)).toContainText("Your bet slip is empty");
  });

  test("the floating button opens and closes the slip, empty or not", async ({ page }) => {
    await page.goto("/matches");
    await expect(slip(page)).toHaveCount(0);

    await page.getByRole("button", { name: "Open bet slip" }).click();
    await expect(slip(page)).toContainText("Your bet slip is empty");

    await slip(page).getByRole("button", { name: "Close bet slip" }).click();
    await expect(slip(page)).toHaveCount(0);

    // A pick opens the slip; closing it keeps the pick, and the button shows the count.
    await page.getByRole("button", { name: "Sentinels to win at 2.10" }).click();
    await page.keyboard.press("Escape");
    await expect(slip(page)).toHaveCount(0);

    // Further picks don't pop the slip back over the odds; the badge counts them.
    await page.getByRole("button", { name: "NAVI to win at 1.85" }).click();
    await expect(slip(page)).toHaveCount(0);
    await page.getByRole("button", { name: "NAVI to win at 1.85" }).click();

    await page.getByRole("button", { name: "Open bet slip (1 selection)" }).click();
    await expect(slip(page)).toContainText("Sentinels to win");

    await slip(page).getByRole("button", { name: "Remove Sentinels to win" }).click();
    await expect(slip(page)).toContainText("Your bet slip is empty");
  });

  test("picks from different matches make a combo with total odds; the same match swaps its pick", async ({ page }) => {
    const mode = page.getByRole("complementary", { name: "Bet slip" }).locator('[aria-current="true"]');

    await page.goto("/matches");
    await page.getByRole("button", { name: "NAVI to win at 1.85" }).click();
    await expect(mode).toHaveText("Single");
    await expect(slip(page).getByTestId("slip-match-count")).toHaveText("1");
    await expect(slip(page).getByTestId("total-odds")).toHaveText("@ 1.85");

    // 1.85 × 2.10 = 3.885, rounded to 3.89.
    await page.getByRole("button", { name: "Sentinels to win at 2.10" }).click();
    await expect(mode).toHaveText("Combo");
    await expect(slip(page).getByTestId("slip-match-count")).toHaveText("2");
    await expect(slip(page).getByTestId("total-odds")).toHaveText("@ 3.89");
    await expect(slip(page).getByTestId("potential-payout")).toHaveText("389 CR");
    await expect(slip(page).getByRole("link", { name: "Log in to place this bet" })).toBeVisible();

    // The other team of a match already on the slip replaces that pick: one match can't be in a combo twice.
    await page.getByRole("button", { name: "FaZe Clan to win at 1.95" }).click();
    await expect(slip(page).getByTestId("slip-match-count")).toHaveText("2");
    await expect(slip(page).getByTestId("total-odds")).toHaveText("@ 4.10");
    await expect(page.getByRole("button", { name: "NAVI to win at 1.85" })).toHaveAttribute("aria-pressed", "false");

    await slip(page).getByRole("button", { name: "Remove Sentinels to win" }).click();
    await expect(mode).toHaveText("Single");
    await expect(slip(page).getByTestId("total-odds")).toHaveText("@ 1.95");
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

  test("the slip's My bets tab asks signed-out players to log in", async ({ page }) => {
    await page.goto("/matches");
    await page.getByRole("button", { name: "Open bet slip" }).click();
    await slip(page).getByRole("tab", { name: "My bets" }).click();

    await expect(slip(page)).toContainText("Log in to see your open and settled bets.");
    await expect(slip(page).getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");

    // A new pick brings the slip back to its picks.
    await page.getByRole("button", { name: "NAVI to win at 1.85" }).click();
    await expect(slip(page).getByRole("tab", { name: /Bet slip/ })).toHaveAttribute("aria-selected", "true");
    await expect(slip(page)).toContainText("NAVI to win");
  });

  test("the slip's My bets tab loads 10 bets at a time as it scrolls", async ({ page, request }) => {
    // Twelve 1 CR bets placed straight through be's API, then the same player signs in.
    const account = newAccount();
    const { register } = await api<{ register: { token: string } }>(
      request,
      "mutation ($input: RegisterInput!) { register(input: $input) { token } }",
      { input: { name: account.name, email: account.email, password: account.password, passwordConfirmation: account.password } },
    );
    const { matches } = await api<{ matches: { id: string; teamA: string }[] }>(request, "{ matches { id teamA } }");
    const navi = matches.find((m) => m.teamA === "NAVI")!;
    for (let i = 0; i < 12; i++) {
      await api(
        request,
        "mutation ($input: PlaceBetInput!) { placeBet(input: $input) { bet { id } } }",
        { input: { matchId: navi.id, side: "A", stake: 1 } },
        register.token,
      );
    }

    await signIn(page, account);
    await page.waitForURL("/account");
    await page.goto("/matches");
    await page.getByRole("button", { name: "Open bet slip" }).click();
    await slip(page).getByRole("tab", { name: "My bets" }).click();

    const bets = slip(page).getByRole("list", { name: "Open bets" }).getByRole("listitem", { name: "NAVI to win, pending" });
    await expect(bets).toHaveCount(10);

    await bets.nth(9).scrollIntoViewIfNeeded();
    await expect(bets).toHaveCount(12);
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

  test("the slip's My bets tab lists open bets and moves them to Settled when the match ends", async ({ page, request }) => {
    const match = await createLiveMatch(request);

    await registerNewPlayer(page);
    await page.goto("/matches");
    await page.getByRole("button", { name: `${match.teamA} to win at 1.80` }).click();
    await slip(page).getByRole("button", { name: "Place bet" }).click();
    await expect(page).toHaveURL("/my-bets");

    await page.goto("/matches");
    await expect(page.getByRole("status")).toHaveText("Live updates on");
    await page.getByRole("button", { name: "Open bet slip" }).click();
    await slip(page).getByRole("tab", { name: "My bets" }).click();
    await expect(slip(page).getByRole("tab", { name: "Open" })).toHaveAttribute("aria-selected", "true");
    await expect(slip(page).getByRole("listitem", { name: `${match.teamA} to win, pending` })).toContainText("180 CR");

    await slip(page).getByRole("tab", { name: "Settled" }).click();
    await expect(slip(page)).toContainText("No settled bets yet.");
    await slip(page).getByRole("tab", { name: "Open" }).click();

    // The match ends while the tab is showing: the open list reloads without the settled bet.
    await updateMatch(request, match.id, { scoreA: 13, state: "FINISHED", winner: "A" });
    await expect(slip(page)).toContainText("No open bets.");

    await slip(page).getByRole("tab", { name: "Settled" }).click();
    await expect(slip(page).getByRole("listitem", { name: `${match.teamA} to win, won` })).toContainText("Paid 180 CR");
  });

  test("a combo stays pending until every pick has won, then pays the total odds", async ({ page, request }) => {
    const first = await createLiveMatch(request);
    const second = await createLiveMatch(request);

    await registerNewPlayer(page);
    await page.goto("/matches");
    await page.getByRole("button", { name: `${first.teamA} to win at 1.80` }).click();
    await page.getByRole("button", { name: `${second.teamA} to win at 1.80` }).click();
    await expect(slip(page).getByTestId("total-odds")).toHaveText("@ 3.24");
    await slip(page).getByRole("button", { name: "Place combo bet (2)" }).click();

    await expect(page).toHaveURL("/my-bets");
    await expect(page.getByText("Combo placed. Potential payout 324 CR.")).toBeVisible();
    await expect(page.getByTestId("wallet-balance")).toContainText("900");

    await updateMatch(request, first.id, { scoreA: 13, state: "FINISHED", winner: "A" });
    await page.reload();
    await expect(page.getByRole("listitem", { name: "Combo of 2, pending" })).toContainText("@ 3.24");

    await updateMatch(request, second.id, { scoreA: 13, state: "FINISHED", winner: "A" });
    await page.reload();
    await expect(page.getByRole("listitem", { name: "Combo of 2, won" })).toContainText("324 CR");
    await expect(page.getByTestId("wallet-balance")).toContainText("1,224");
  });
});
