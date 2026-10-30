import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/lib/env";

/**
 * Same-origin endpoint for pusher-js to authorize a Reverb channel. be signs the channel only if it belongs to
 * a subscription it issued (see Lighthouse's SubscriptionController), so this just forwards the form body.
 */
export async function POST(request: NextRequest) {
  const form = new URLSearchParams(await request.text());
  const socketId = form.get("socket_id");
  const channel = form.get("channel_name");

  if (!socketId || !channel?.startsWith("private-lighthouse-")) {
    return NextResponse.json({ message: "Invalid channel." }, { status: 400 });
  }

  const response = await fetch(`${env.apiOrigin}/graphql/subscriptions/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({ socket_id: socketId, channel_name: channel }),
    cache: "no-store",
  });

  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { "Content-Type": response.headers.get("Content-Type") ?? "application/json" },
  });
}
