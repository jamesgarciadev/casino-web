"use server";

import { redirect } from "next/navigation";
import type { z } from "zod";

import { loginSchema, registerSchema, type LoginValues, type RegisterValues } from "@/features/auth/schemas";
import { clearSessionToken, setSessionToken } from "@/lib/auth/session";
import { toActionResult, type ActionResult } from "@/lib/graphql/errors";
import { LoginMutation, LogoutMutation, RegisterMutation } from "@/lib/graphql/operations";
import { gqlRequest } from "@/lib/graphql/server";

function zodFieldErrors(error: z.ZodError): ActionResult {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "form");
    fieldErrors[field] ??= issue.message;
  }

  return { fieldErrors };
}

export async function loginAction(values: LoginValues): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return zodFieldErrors(parsed.error);
  }

  const { data, errors } = await gqlRequest(LoginMutation, { input: parsed.data }, { token: null });
  if (!data?.login) {
    return toActionResult(errors);
  }

  await setSessionToken(data.login.token);
  redirect("/account");
}

export async function registerAction(values: RegisterValues): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(values);
  if (!parsed.success) {
    return zodFieldErrors(parsed.error);
  }

  const { data, errors } = await gqlRequest(RegisterMutation, { input: parsed.data }, { token: null });
  if (!data?.register) {
    return toActionResult(errors);
  }

  await setSessionToken(data.register.token);
  redirect("/account");
}

export async function logoutAction(): Promise<void> {
  // Revoke server-side first; clear the cookie regardless so the user is never stuck signed in.
  await gqlRequest(LogoutMutation).catch(() => null);
  await clearSessionToken();
  redirect("/");
}
