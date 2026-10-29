import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { getSessionToken } from "@/lib/auth/session";
import { MeQuery } from "@/lib/graphql/operations";
import { gqlRequest } from "@/lib/graphql/server";

/**
 * Data Access Layer: the one place that resolves the signed-in customer.
 * Deduplicated per request. be remains the authority on whether the token is valid.
 */
export const getCurrentUser = cache(async () => {
  if (!(await getSessionToken())) {
    return null;
  }

  const { data } = await gqlRequest(MeQuery);

  return data?.me ?? null;
});

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
