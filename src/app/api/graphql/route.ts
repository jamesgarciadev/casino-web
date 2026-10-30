import { Kind, parse, type DocumentNode } from "graphql";
import { NextResponse, type NextRequest } from "next/server";

import { getSessionToken } from "@/lib/auth/session";
import { executeRaw } from "@/lib/graphql/server";

/**
 * Same-origin GraphQL endpoint for Client Components. The browser cannot read the httpOnly
 * session cookie, so this handler attaches it as a bearer token and forwards to be.
 */

// Token-issuing operations go through Server Actions so the token never reaches browser JS.
const BLOCKED_ROOT_FIELDS = new Set(["login", "register", "adminLogin"]);

function selectsBlockedField(document: DocumentNode): boolean {
  return document.definitions.some(
    (definition) =>
      definition.kind === Kind.OPERATION_DEFINITION &&
      definition.selectionSet.selections.some(
        (selection) => selection.kind === Kind.FIELD && BLOCKED_ROOT_FIELDS.has(selection.name.value),
      ),
  );
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    query?: unknown;
    variables?: unknown;
    operationName?: string | null;
  } | null;

  if (!body || typeof body.query !== "string") {
    return NextResponse.json({ errors: [{ message: "Missing query." }] }, { status: 400 });
  }

  let document: DocumentNode;
  try {
    document = parse(body.query);
  } catch {
    return NextResponse.json({ errors: [{ message: "Invalid query." }] }, { status: 400 });
  }

  if (selectsBlockedField(document)) {
    return NextResponse.json({ errors: [{ message: "Use the sign-in form for this operation." }] }, { status: 403 });
  }

  const result = await executeRaw(
    { query: body.query, variables: body.variables, operationName: body.operationName },
    await getSessionToken(),
  );

  return NextResponse.json({
    data: result.data,
    ...(result.errors.length ? { errors: result.errors } : {}),
    // Subscriptions return the Reverb channel to listen on here.
    ...(result.extensions ? { extensions: result.extensions } : {}),
  });
}
