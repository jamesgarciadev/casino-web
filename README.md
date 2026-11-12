# casino-web

**0dds.bet**, the customer app: live esports odds, bet slips and a play-money wallet. Next.js 16 (App Router,
Cache Components), Tailwind 4, Zustand, Zod, urql, pusher-js. Talks only to `casino-be` over GraphQL.
See [ARCHITECTURE.md](ARCHITECTURE.md).

The design comes from `../casino-design` (the "Crimson Heat" Lovable export): tokens and utilities live in
`src/app/globals.css`, button variants in `src/components/ui/button.tsx`.

## Run locally

Requires `casino-be` running on http://localhost:8000 with `php artisan reverb:start` for live updates, and the repos
cloned side by side. For matches that actually move, also run `casino-sim` (`php sim sim:run --speed=20`).

```sh
npm install
cp .env.example .env.local   # set REVERB_APP_KEY to casino-be's value
npm run codegen   # types + Zod base schemas from ../casino-be/graphql/schema.public.graphql
npm run dev       # http://localhost:3000
```

Sign in with `customer@casino.test` / `Password1!` (wallet starts at 1,000 CR).

## Pages

| Route | What it shows |
|---|---|
| `/` | Hero, odds ticker, live now, upcoming, games, mobile apps, sign-up band (signed out only) |
| `/matches?game=` | All live and upcoming matches with game filter chips |
| `/my-bets` | Wallet balance, +500 top-up, bet history (signed in) |
| `/login`, `/register`, `/account` | Server-action auth, restyled |

The bet slip floats over every page: bottom sheet on phones, card on desktop. A floating ticket button opens it at
any time (empty placeholder when nothing is picked) and shows how many picks are waiting. One pick is a **Single**;
odds from other matches turn it into a **Combo** with a match count and **Total odds** (the product, computed the same
way as be's `Bet::totalOdds`). Picking the other team of a match already on the slip swaps that pick, since a combo
can't back one match twice. Only the first pick opens the slip, so it doesn't cover the odds while a combo is built.

The slip's **My bets** tab shows Open and Settled bets, 10 at a time with more loaded on scroll. Open singles show their
live odds and a **Withdraw** (cash-out) button whose value follows them; the first tap asks to confirm. Caching:

- Pages come from urql's cache while the list's last load from be is current: the same `betsVersion` in the UI store
  and under a minute old. Otherwise they are loaded from be (`src/stores/ui-store.ts`, `betsAreFresh`).
- `betsVersion` moves when a bet is placed, cashed out, or one of its matches finishes (seen on the live feed), so the
  tab only waits on be when something changed. Live odds, scores and cash-out values come from the match feed, never
  from refetching.
- The first page of open bets is prefetched when the slip opens or its button is hovered or focused.

## How live updates work

- Server components render matches from be (`features/betting/queries.ts`) for the first paint.
- `LiveMatchesProvider` (root layout) subscribes to `matchUpdated` through `/api/graphql`, then joins the returned
  Reverb channel with pusher-js. Channels are authorized through the same-origin `/api/graphql/subscriptions/auth`.
- Pushed matches go into a client store; `useLiveMatches` overlays them on the server-rendered lists, so scores, odds
  and new or finished matches change in place. A finished match triggers `router.refresh()` because be has settled bets.
- If the socket can't connect, it polls `matches` every 10 seconds (the "Refreshing every 10s" status on `/matches`).
- Placing a bet and topping up are Server Actions; be takes the odds from the match at that moment, never from the slip.

Reverb settings (`REVERB_APP_KEY`, `REVERB_HOST`, `REVERB_PORT`, `REVERB_SCHEME`) are read on the server and passed to
the browser by the root layout, which is prerendered, so set them before `next build`.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on every pull request and on main:

- **Codegen, types and lint**: regenerates `src/gql` from casino-be's main schema and fails if it differs, then
  typecheck and lint. A web change that needs a new be field passes once that be change is merged.
- **Playwright**: the full E2E suite, with casino-be checked out next to this repo (the branch of the same name if it
  exists, otherwise main) and MySQL and Redis as services.

## End-to-end tests (Playwright)

```sh
npx playwright install chromium   # once
npm run test:e2e                  # headless
npm run test:e2e:ui               # interactive runner
npm run test:e2e:report           # open the last HTML report (traces + screenshots on failure)
```

Requires Docker MySQL and Redis from `casino-be` to be up. The suite starts its own isolated stack, separate from your
dev servers:

| Piece | Port | Notes |
|---|---|---|
| `casino-be` (`php artisan serve`) | 8100 | database `casino_e2e_web`, reset and seeded every run |
| Reverb (`php artisan reverb:start`) | 6101 | its own app key, so a dev simulator can't push into test browsers |
| this app (`next build` + `next start`) | 3100 | production build, so cookies behave like a real deploy |

The E2E backend uses an in-memory cache, which disables the per-IP throttles so repeated runs don't lock themselves
out (rate limiting is covered by `casino-be`'s PHPUnit suite). GraphQL subscriptions live in Redis database 3, emptied
at setup.

`global.setup.ts` resets the database, mints a `sim` token and signs in the demo customer once. Tests that bet register
their own player so wallets never collide; the live-update test creates its own match and drives it with the sim token
(`createLiveMatch`, `updateMatch` in `e2e/support.ts`).

| Spec | Covers |
|---|---|
| `auth.spec.ts` | log in, register, password policy, log out |
| `session.spec.ts` | header and account per session state, GraphQL proxy |
| `betting.spec.ts` | landing and filters, bet slip, singles and combos, total odds and payouts, placing bets, insufficient balance, top-up, live score and odds pushes, settlement |

## Layout

- `src/features/betting`: match cards, grid, ticker, bet slip, live provider, actions and queries
- `src/lib/graphql/server.ts`: server-side GraphQL client (forwards bearer token + client IP; never runs during prefetch)
- `src/app/api/graphql`: same-origin proxy for Client Components (adds the httpOnly token) and channel auth
- `src/lib/auth`: session cookie + Data Access Layer (`getCurrentUser`)
- `src/stores` + `src/providers`: per-request Zustand UI store (bet slip)
- `src/gql`: generated by codegen; do not edit
