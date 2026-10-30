import { NextResponse, type NextRequest } from "next/server";

// Optimistic check only: skips rendering protected pages for visitors with no session cookie.
// be is still the authority; an invalid or expired token is rejected there.
const SESSION_COOKIE = "casino_web_token";

export function proxy(request: NextRequest) {
  if (!request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/my-bets/:path*"],
};
