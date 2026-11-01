"use server";

import { refresh } from "next/cache";
import { z } from "zod";

import { getSessionToken } from "@/lib/auth/session";
import { isUnauthenticated } from "@/lib/graphql/errors";
import { CashOutBetMutation, PlaceBetMutation, PlaceComboBetMutation, TopUpWalletMutation } from "@/lib/graphql/operations";
import { gqlRequest } from "@/lib/graphql/server";

export type BetResult = { ok: true; payout: number; balance: number } | { ok: false; message: string };

const id = z.string().regex(/^\d+$/);

/** A side of the match (its winner market) or an outcome of one of its markets. */
const pickSchema = z.union([z.object({ matchId: id, side: z.enum(["A", "B"]) }).strict(), z.object({ matchId: id, outcomeId: id }).strict()]);

const placeBetSchema = z.object({
  selections: z
    .array(pickSchema)
    .min(1, "Pick some odds first.")
    .refine((picks) => new Set(picks.map((p) => p.matchId)).size === picks.length, "A combo can only include one pick per match."),
  stake: z.number().int("Stake must be whole credits.").min(1, "Enter a stake first.").max(1_000_000),
});

const SIGNED_OUT = "Your session has ended. Log in to place this bet.";

/** One pick is placed as a single, two or more as a combo. */
export async function placeBetAction(input: z.input<typeof placeBetSchema>): Promise<BetResult> {
  const parsed = placeBetSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  if (!(await getSessionToken())) {
    return { ok: false, message: SIGNED_OUT };
  }

  const { selections, stake } = parsed.data;
  const { data, errors } =
    selections.length === 1
      ? await gqlRequest(PlaceBetMutation, { input: { ...selections[0], stake } }).then((r) => ({ ...r, data: r.data?.placeBet }))
      : await gqlRequest(PlaceComboBetMutation, { input: { selections, stake } }).then((r) => ({ ...r, data: r.data?.placeComboBet }));

  if (!data) {
    return { ok: false, message: isUnauthenticated(errors) ? SIGNED_OUT : (errors[0]?.message ?? "The bet could not be placed.") };
  }

  // The header wallet lives in the shared layout, which client navigation would otherwise keep as-is.
  refresh();

  return { ok: true, payout: data.bet.payout, balance: data.wallet.balance };
}

const cashOutSchema = z.object({
  betId: z.string().regex(/^\d+$/),
  expected: z.number().int().min(0),
});

export type CashOutResult = { ok: true; cashOut: number; balance: number } | { ok: false; message: string };

/** Withdraw an open single. be refuses if the value has dropped below `expected`, the value the player was shown. */
export async function cashOutAction(input: z.input<typeof cashOutSchema>): Promise<CashOutResult> {
  const parsed = cashOutSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  const { data, errors } = await gqlRequest(CashOutBetMutation, { input: parsed.data });
  if (!data?.cashOutBet) {
    return { ok: false, message: isUnauthenticated(errors) ? SIGNED_OUT : (errors[0]?.message ?? "The bet could not be cashed out.") };
  }

  refresh();

  return { ok: true, cashOut: data.cashOutBet.bet.cashOut ?? 0, balance: data.cashOutBet.wallet.balance };
}

export async function topUpWalletAction(): Promise<{ balance: number } | { message: string }> {
  const { data, errors } = await gqlRequest(TopUpWalletMutation);

  if (!data?.topUpWallet) {
    return { message: errors[0]?.message ?? "Top-up failed." };
  }

  refresh();

  return data.topUpWallet;
}
