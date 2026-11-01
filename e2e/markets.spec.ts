import { expect, test, type Page } from "@playwright/test";

import { createLiveMatch, registerNewPlayer, updateMatch } from "./support";

const slip = (page: Page) => page.getByRole("complementary", { name: "Bet slip" });

type Outcome = { key: string; odds: number; result?: "WON" | "LOST" };

function market(key: string, type: string, outcomes: Outcome[], extra: Record<string, unknown> = {}, status = "OPEN") {
  return { key, type, status, outcomes, ...extra };
}

const totalMaps = (over = 2.4, under = 1.55, status = "OPEN") =>
  market("maps.total.2.5", "TOTAL_MAPS", [{ key: "over", odds: over }, { key: "under", odds: under }], { line: 2.5, sort: 2 }, status);

const pistol = (status = "OPEN", result?: "a" | "b") =>
  market(
    "map1.round13.pistol",
    "PISTOL_ROUND",
    [
      { key: "a", odds: 1.9, ...(result && { result: result === "a" ? "WON" : "LOST" }) },
      { key: "b", odds: 1.85, ...(result && { result: result === "b" ? "WON" : "LOST" }) },
    ] as Outcome[],
    { map: 1, round: 13, sort: 12 },
    status,
  );

const half = market("map1.half1.1x2", "HALF_1X2", [{ key: "a", odds: 2.1 }, { key: "draw", odds: 6.5 }, { key: "b", odds: 2.2 }], { map: 1, half: 1, sort: 16 });

/** A live CS2 best of 3 on its first map, 3-1, with a few markets open. */
async function liveSeries(page: Page) {
  const match = await createLiveMatch(page.request, { bestOf: 3 });
  await updateMatch(page.request, match.id, {
    maps: [{ name: "Inferno", scoreA: 3, scoreB: 1 }],
    markets: [totalMaps(), pistol(), half],
  });

  return match;
}

test.describe("match page", () => {
  test("a card opens the match page, with the header and the design's tabs", async ({ page }) => {
    const { id, teamA, teamB } = await liveSeries(page);

    await page.goto("/matches?game=cs-go");
    await page.getByRole("link", { name: `All markets for ${teamA} vs ${teamB}` }).click();
    await expect(page).toHaveURL(`/matches/${id}`);

    const header = page.getByRole("region", { name: `${teamA} vs ${teamB}` });
    await expect(header).toContainText("BO3: Inferno R: 5/24");
    await expect(header.getByRole("table", { name: "Score per map" })).toContainText("Inf");

    const tabs = page.getByRole("tablist", { name: "Market groups" }).getByRole("tab");
    await expect(tabs).toHaveText(["Popular", "All", "Rounds", "Match", "Half 1"]);

    await expect(page.getByRole("region", { name: "Total maps" })).toBeVisible();
    await page.getByRole("tab", { name: "Half 1" }).click();
    await expect(page.getByRole("region", { name: "Map 1 - Half 1 - 1x2" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Total maps" })).toHaveCount(0);
  });

  test("another market of the same match replaces the pick on the slip", async ({ page }) => {
    const { id, teamA } = await liveSeries(page);
    await page.goto(`/matches/${id}`);

    await page.getByRole("button", { name: "Total maps · Over 2.5 at 2.40" }).click();
    await expect(slip(page)).toContainText("Total maps · Over 2.5");
    await expect(slip(page).getByTestId("potential-payout")).toHaveText("240 CR");
    await page.keyboard.press("Escape");

    await page.getByRole("button", { name: `${teamA} to win at 1.80` }).click();
    await page.getByRole("button", { name: /Open bet slip/ }).click();
    await expect(slip(page)).toContainText(`${teamA} to win`);
    await expect(slip(page)).not.toContainText("Total maps");
    await expect(slip(page).getByTestId("slip-match-count")).toHaveText("1");
    await expect(page.getByRole("button", { name: "Total maps · Over 2.5 at 2.40" })).toHaveAttribute("aria-pressed", "false");
  });

  test("odds move live and suspended markets can't be picked", async ({ page }) => {
    const { id } = await liveSeries(page);
    await page.goto(`/matches/${id}`);
    await expect(page.getByRole("button", { name: "Total maps · Over 2.5 at 2.40" })).toBeEnabled();

    await updateMatch(page.request, id, { markets: [totalMaps(2.9, 1.4)] });
    await expect(page.getByRole("button", { name: "Total maps · Over 2.5 at 2.90" })).toBeVisible();

    await updateMatch(page.request, id, { markets: [totalMaps(2.9, 1.4, "SUSPENDED")] });
    await expect(page.getByRole("button", { name: "Total maps · Over 2.5 at suspended" })).toBeDisabled();
  });

  test("a market single settles mid-match and pays", async ({ page }) => {
    await registerNewPlayer(page);
    const { id, teamA } = await liveSeries(page);
    await page.goto(`/matches/${id}`);

    const label = `Map 1 - Pistol round winner · ${teamA} 2nd`;
    await page.getByRole("button", { name: `${label} at 1.90` }).click();
    await slip(page).getByRole("button", { name: "Place bet" }).click();
    await expect(page).toHaveURL("/my-bets");
    await expect(page.getByRole("listitem", { name: `${label}, pending` })).toBeVisible();
    await expect(page.getByTestId("wallet-balance")).toContainText("900");

    // Round 13 is played while the match goes on: the pistol market settles, the match stays live.
    await updateMatch(page.request, id, { markets: [pistol("SETTLED", "a")] });
    await page.reload();

    await expect(page.getByRole("listitem", { name: `${label}, won` })).toBeVisible();
    await expect(page.getByTestId("wallet-balance")).toContainText("1,090");
  });

  test("a market single cashes out at its outcome's live odds", async ({ page }) => {
    await registerNewPlayer(page);
    const { id } = await liveSeries(page);
    await page.goto(`/matches/${id}`);

    await page.getByRole("button", { name: "Total maps · Over 2.5 at 2.40" }).click();
    await slip(page).getByRole("button", { name: "Place bet" }).click();
    await expect(page).toHaveURL("/my-bets");

    // Back on the match page, the market's pushes keep the cash-out value live: 100 x 2.40 / 1.60 = 150.
    await page.goto(`/matches/${id}`);
    await updateMatch(page.request, id, { markets: [totalMaps(1.6, 2.3)] });
    await expect(page.getByRole("button", { name: "Total maps · Over 2.5 at 1.60" })).toBeVisible();

    await page.getByRole("button", { name: /Open bet slip/ }).click();
    await slip(page).getByRole("tab", { name: "My bets" }).click();
    const bet = slip(page).getByRole("listitem", { name: "Total maps · Over 2.5, pending" });
    await bet.getByRole("button", { name: "Withdraw 150 CR" }).click();
    await bet.getByRole("button", { name: "Confirm withdraw 150 CR" }).click();

    await expect(page.getByText("Cashed out 150 CR.")).toBeVisible();
  });
});
