"use server";

import { refresh } from "next/cache";
import { z } from "zod";

import { getSessionToken } from "@/lib/auth/session";
import { isUnauthenticated } from "@/lib/graphql/errors";
import { PlaceBetMutation, TopUpWalletMutation } from "@/lib/graphql/operations";
import { gqlRequest } from "@/lib/graphql/server";

export type BetResult = { ok: true; payout: number; balance: number } | { ok: false; message: string };

const placeBetSchema = z.object({
  matchId: z.string().regex(/^\d+$/),
  side: z.enum(["A", "B"]),
  stake: z.number().int("Stake must be whole credits.").min(1, "Enter a stake first.").max(1_000_000),
});

const SIGNED_OUT = "Your session has ended. Log in to place this bet.";

export async function placeBetAction(input: z.input<typeof placeBetSchema>): Promise<BetResult> {
  const parsed = placeBetSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  if (!(await getSessionToken())) {
    return { ok: false, message: SIGNED_OUT };
  }

  const { data, errors } = await gqlRequest(PlaceBetMutation, { input: parsed.data });
  if (!data?.placeBet) {
    return { ok: false, message: isUnauthenticated(errors) ? SIGNED_OUT : (errors[0]?.message ?? "The bet could not be placed.") };
  }

  // The header wallet lives in the shared layout, which client navigation would otherwise keep as-is.
  refresh();

  return { ok: true, payout: data.placeBet.bet.payout, balance: data.placeBet.wallet.balance };
}

export async function topUpWalletAction(): Promise<{ balance: number } | { message: string }> {
  const { data, errors } = await gqlRequest(TopUpWalletMutation);

  if (!data?.topUpWallet) {
    return { message: errors[0]?.message ?? "Top-up failed." };
  }

  refresh();

  return data.topUpWallet;
}
