import * as z from 'zod'
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** An ISO 8601 datetime string with timezone, e.g. `2026-10-29T13:43:32+00:00`. */
  DateTime: { input: string; output: string; }
};

export type Activity = {
  __typename?: 'Activity';
  causer?: Maybe<User>;
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  event?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  logName?: Maybe<Scalars['String']['output']>;
  /** JSON-encoded properties, including before/after state for admin changes. */
  properties?: Maybe<Scalars['String']['output']>;
  subjectId?: Maybe<Scalars['ID']['output']>;
  subjectType?: Maybe<Scalars['String']['output']>;
};

/** A paginated list of Activity items. */
export type ActivityPaginator = {
  __typename?: 'ActivityPaginator';
  /** A list of Activity items. */
  data: Array<Activity>;
  /** Pagination information about the list of items. */
  paginatorInfo: PaginatorInfo;
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  token: Scalars['String']['output'];
  user: User;
};

export type Bet = {
  __typename?: 'Bet';
  id: Scalars['ID']['output'];
  /** Total odds when the bet was placed: the product of the selections' odds, rounded to cents after each pick. */
  odds: Scalars['Float']['output'];
  /** stake × odds, rounded. Credited only if the bet is WON. */
  payout: Scalars['Int']['output'];
  placedAt: Scalars['DateTime']['output'];
  /** One pick for a SINGLE, one per match for a COMBO, in the order they were picked. */
  selections: Array<BetSelection>;
  settledAt?: Maybe<Scalars['DateTime']['output']>;
  stake: Scalars['Int']['output'];
  /** WON once every selection has won; LOST as soon as one selection loses. */
  status: BetStatus;
  type: BetType;
};

/** One pick of a bet. */
export type BetSelection = {
  __typename?: 'BetSelection';
  id: Scalars['ID']['output'];
  match: Match;
  /** Odds for this pick when the bet was placed. */
  odds: Scalars['Float']['output'];
  side: Side;
  /** PENDING until its match finishes. */
  status: BetStatus;
};

export type BetSelectionInput = {
  matchId: Scalars['ID']['input'];
  side: Side;
};

/** PENDING until the match finishes, then WON or LOST. */
export type BetStatus =
  | 'LOST'
  | 'PENDING'
  | 'WON';

/** SINGLE backs one match; COMBO backs several different matches and wins only if every pick wins. */
export type BetType =
  | 'COMBO'
  | 'SINGLE';

export type EsportsLeague = {
  __typename?: 'EsportsLeague';
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

export type EsportsMatch = {
  __typename?: 'EsportsMatch';
  beginAt?: Maybe<Scalars['DateTime']['output']>;
  endAt?: Maybe<Scalars['DateTime']['output']>;
  game: Videogame;
  id: Scalars['ID']['output'];
  league?: Maybe<EsportsLeague>;
  /** e.g. `best_of`. */
  matchType?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  numberOfGames?: Maybe<Scalars['Int']['output']>;
  opponents: Array<EsportsOpponent>;
  scheduledAt?: Maybe<Scalars['DateTime']['output']>;
  scores: Array<EsportsScore>;
  serie?: Maybe<Scalars['String']['output']>;
  status: MatchStatus;
  streams: Array<EsportsStream>;
  tournament?: Maybe<Scalars['String']['output']>;
  winnerId?: Maybe<Scalars['ID']['output']>;
};

export type EsportsMatchPage = {
  __typename?: 'EsportsMatchPage';
  data: Array<EsportsMatch>;
  pageInfo: EsportsPageInfo;
};

export type EsportsOpponent = {
  __typename?: 'EsportsOpponent';
  acronym?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  type: OpponentType;
};

export type EsportsPageInfo = {
  __typename?: 'EsportsPageInfo';
  currentPage: Scalars['Int']['output'];
  hasMorePages: Scalars['Boolean']['output'];
  perPage: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type EsportsScore = {
  __typename?: 'EsportsScore';
  opponentId: Scalars['ID']['output'];
  score: Scalars['Int']['output'];
};

export type EsportsStream = {
  __typename?: 'EsportsStream';
  embedUrl?: Maybe<Scalars['String']['output']>;
  language?: Maybe<Scalars['String']['output']>;
  main: Scalars['Boolean']['output'];
  official: Scalars['Boolean']['output'];
  url: Scalars['String']['output'];
};

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Match = {
  __typename?: 'Match';
  /** PandaScore videogame slug, e.g. `cs-go`. */
  game: Scalars['String']['output'];
  gameName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  /** Decimal odds for team A. Simulated, not market odds. */
  oddsA: Scalars['Float']['output'];
  oddsB: Scalars['Float']['output'];
  scoreA: Scalars['Int']['output'];
  scoreB: Scalars['Int']['output'];
  startsAt: Scalars['DateTime']['output'];
  state: MatchState;
  streamUrl?: Maybe<Scalars['String']['output']>;
  teamA: Scalars['String']['output'];
  teamAAcronym?: Maybe<Scalars['String']['output']>;
  teamB: Scalars['String']['output'];
  teamBAcronym?: Maybe<Scalars['String']['output']>;
  tournament: Scalars['String']['output'];
  winner?: Maybe<Side>;
};

/** Where a match is in its lifecycle. Bets are accepted until FINISHED. */
export type MatchState =
  | 'FINISHED'
  | 'LIVE'
  | 'UPCOMING';

export type MatchStatus =
  | 'CANCELED'
  | 'FINISHED'
  | 'NOT_STARTED'
  | 'POSTPONED'
  | 'RUNNING';

export type MatchWindow =
  | 'PAST'
  | 'RUNNING'
  | 'UPCOMING';

export type Mutation = {
  __typename?: 'Mutation';
  /** Owner: replace a user's role. Audit-logged. */
  adminAssignRole: User;
  /** Staff sign-in for the admin console. Returns an admin-scoped token. */
  adminLogin: AuthPayload;
  /** Customer sign-in for the web app. Returns a customer-scoped token. */
  login: AuthPayload;
  /** Revoke the token used for this request. */
  logout: Scalars['Boolean']['output'];
  /** Bet play-money credits on one side of a match. Odds are taken from the match at this moment. */
  placeBet: PlaceBetPayload;
  /** Bet on two or more picks from different matches (a parlay). Total odds are the product of the picks' odds at this moment; it wins only if every pick wins. */
  placeComboBet: PlaceBetPayload;
  /** Create a customer account and return a customer-scoped token. */
  register: AuthPayload;
  /** casino-sim: create a simulated match. */
  simCreateMatch: Match;
  /** casino-sim: update score, odds or state. Finishing a match (with a winner) settles its bets. */
  simUpdateMatch: Match;
  /** Add 500 play-money credits. */
  topUpWallet: Wallet;
};


export type MutationAdminAssignRoleArgs = {
  role: Role;
  userId: Scalars['ID']['input'];
};


export type MutationAdminLoginArgs = {
  input: LoginInput;
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationPlaceBetArgs = {
  input: PlaceBetInput;
};


export type MutationPlaceComboBetArgs = {
  input: PlaceComboBetInput;
};


export type MutationRegisterArgs = {
  input: RegisterInput;
};


export type MutationSimCreateMatchArgs = {
  input: SimCreateMatchInput;
};


export type MutationSimUpdateMatchArgs = {
  id: Scalars['ID']['input'];
  input: SimUpdateMatchInput;
};

export type OpponentType =
  | 'PLAYER'
  | 'TEAM';

/** Allows ordering a list of records. */
export type OrderByClause = {
  /** The column that is used for ordering. */
  column: Scalars['String']['input'];
  /** The direction that is used for ordering. */
  order: SortOrder;
};

/** Aggregate functions when ordering by a relation without specifying a column. */
export type OrderByRelationAggregateFunction =
  /** Amount of items. */
  | 'COUNT';

/** Aggregate functions when ordering by a relation that may specify a column. */
export type OrderByRelationWithColumnAggregateFunction =
  /** Average. */
  | 'AVG'
  /** Amount of items. */
  | 'COUNT'
  /** Maximum. */
  | 'MAX'
  /** Minimum. */
  | 'MIN'
  /** Sum. */
  | 'SUM';

/** Information about pagination using a fully featured paginator. */
export type PaginatorInfo = {
  __typename?: 'PaginatorInfo';
  /** Number of items in the current page. */
  count: Scalars['Int']['output'];
  /** Index of the current page. */
  currentPage: Scalars['Int']['output'];
  /** Index of the first item in the current page. */
  firstItem?: Maybe<Scalars['Int']['output']>;
  /** Are there more pages after this one? */
  hasMorePages: Scalars['Boolean']['output'];
  /** Index of the last item in the current page. */
  lastItem?: Maybe<Scalars['Int']['output']>;
  /** Index of the last available page. */
  lastPage: Scalars['Int']['output'];
  /** Number of items per page. */
  perPage: Scalars['Int']['output'];
  /** Number of total available items. */
  total: Scalars['Int']['output'];
};

export type PlaceBetInput = {
  matchId: Scalars['ID']['input'];
  side: Side;
  stake: Scalars['Int']['input'];
};

export type PlaceBetPayload = {
  __typename?: 'PlaceBetPayload';
  bet: Bet;
  wallet: Wallet;
};

export type PlaceComboBetInput = {
  /** At least two picks, each from a different match. */
  selections: Array<BetSelectionInput>;
  stake: Scalars['Int']['input'];
};

export type Query = {
  __typename?: 'Query';
  /** Staff: audit log of admin and auth events. Requires `activity.view`. */
  adminActivities: ActivityPaginator;
  /** Staff: list users. Requires `users.view`. */
  adminUsers: UserPaginator;
  /** A single esports match by PandaScore id. Public. */
  esportsMatch?: Maybe<EsportsMatch>;
  /** Esports matches from PandaScore. Cached for 15s (running), 1 min (upcoming) or 10 min (past). Public. */
  esportsMatches: EsportsMatchPage;
  /** A bettable match. Public. */
  match?: Maybe<Match>;
  /** Bettable matches, live first, then by start time. Without `state`, finished matches are left out. Public. */
  matches: Array<Match>;
  /** The currently authenticated user (any token scope). */
  me?: Maybe<User>;
  /** The signed-in customer's bets, newest first (latest 100). */
  myBets: Array<Bet>;
  /** Esports titles PandaScore covers. Public. */
  videogames: Array<Videogame>;
  /** The signed-in customer's play-money wallet (opened with 1,000 CR on first use). */
  wallet: Wallet;
};


export type QueryAdminActivitiesArgs = {
  first?: Scalars['Int']['input'];
  logName?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryAdminUsersArgs = {
  first?: Scalars['Int']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryEsportsMatchArgs = {
  id: Scalars['ID']['input'];
};


export type QueryEsportsMatchesArgs = {
  game?: InputMaybe<Scalars['String']['input']>;
  page?: Scalars['Int']['input'];
  perPage?: Scalars['Int']['input'];
  window?: MatchWindow;
};


export type QueryMatchArgs = {
  id: Scalars['ID']['input'];
};


export type QueryMatchesArgs = {
  game?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<MatchState>;
};

export type RegisterInput = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
  passwordConfirmation: Scalars['String']['input'];
};

export type Role =
  | 'ADMIN'
  | 'CUSTOMER'
  | 'MODERATOR'
  | 'OWNER';

/** Team A or team B of a match. */
export type Side =
  | 'A'
  | 'B';

export type SimCreateMatchInput = {
  /** PandaScore match id the matchup was taken from. */
  externalId?: InputMaybe<Scalars['ID']['input']>;
  game: Scalars['String']['input'];
  gameName: Scalars['String']['input'];
  oddsA: Scalars['Float']['input'];
  oddsB: Scalars['Float']['input'];
  startsAt: Scalars['DateTime']['input'];
  state?: InputMaybe<MatchState>;
  streamUrl?: InputMaybe<Scalars['String']['input']>;
  teamA: Scalars['String']['input'];
  teamAAcronym?: InputMaybe<Scalars['String']['input']>;
  teamB: Scalars['String']['input'];
  teamBAcronym?: InputMaybe<Scalars['String']['input']>;
  tournament: Scalars['String']['input'];
};

export type SimUpdateMatchInput = {
  oddsA?: InputMaybe<Scalars['Float']['input']>;
  oddsB?: InputMaybe<Scalars['Float']['input']>;
  scoreA?: InputMaybe<Scalars['Int']['input']>;
  scoreB?: InputMaybe<Scalars['Int']['input']>;
  state?: InputMaybe<MatchState>;
  winner?: InputMaybe<Side>;
};

/** Directions for ordering a list of records. */
export type SortOrder =
  /** Sort records in ascending order. */
  | 'ASC'
  /** Sort records in descending order. */
  | 'DESC';

export type Subscription = {
  __typename?: 'Subscription';
  /** Pushed whenever casino-sim creates or updates a match (score, odds, state). Public; delivered through Reverb. */
  matchUpdated?: Maybe<Match>;
};


export type SubscriptionMatchUpdatedArgs = {
  game?: InputMaybe<Scalars['String']['input']>;
};

/** Specify if you want to include or exclude trashed results from a query. */
export type Trashed =
  /** Only return trashed results. */
  | 'ONLY'
  /** Return both trashed and non-trashed results. */
  | 'WITH'
  /** Only return non-trashed results. */
  | 'WITHOUT';

export type User = {
  __typename?: 'User';
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  emailVerifiedAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  permissions: Array<Scalars['String']['output']>;
  roles: Array<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

/** A paginated list of User items. */
export type UserPaginator = {
  __typename?: 'UserPaginator';
  /** A list of User items. */
  data: Array<User>;
  /** Pagination information about the list of items. */
  paginatorInfo: PaginatorInfo;
};

export type Videogame = {
  __typename?: 'Videogame';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
};

export type Wallet = {
  __typename?: 'Wallet';
  /** Whole play-money credits (CR). No cash value. */
  balance: Scalars['Int']['output'];
};


type Properties<T> = {
  [K in keyof T]: z.ZodType<T[K], unknown>;
};

type definedNonNullAny = {};

export const isDefinedNonNullAny = (v: any): v is definedNonNullAny => v !== undefined && v !== null;

export const definedNonNullAnySchema = z.any().refine((v) => isDefinedNonNullAny(v));

export const BetStatusSchema: z.ZodType<"LOST" | "PENDING" | "WON", "LOST" | "PENDING" | "WON"> = z.enum(['LOST', 'PENDING', 'WON']);

export const BetTypeSchema: z.ZodType<"COMBO" | "SINGLE", "COMBO" | "SINGLE"> = z.enum(['COMBO', 'SINGLE']);

export const MatchStateSchema: z.ZodType<"FINISHED" | "LIVE" | "UPCOMING", "FINISHED" | "LIVE" | "UPCOMING"> = z.enum(['FINISHED', 'LIVE', 'UPCOMING']);

export const MatchStatusSchema: z.ZodType<"CANCELED" | "FINISHED" | "NOT_STARTED" | "POSTPONED" | "RUNNING", "CANCELED" | "FINISHED" | "NOT_STARTED" | "POSTPONED" | "RUNNING"> = z.enum(['CANCELED', 'FINISHED', 'NOT_STARTED', 'POSTPONED', 'RUNNING']);

export const MatchWindowSchema: z.ZodType<"PAST" | "RUNNING" | "UPCOMING", "PAST" | "RUNNING" | "UPCOMING"> = z.enum(['PAST', 'RUNNING', 'UPCOMING']);

export const OpponentTypeSchema: z.ZodType<"PLAYER" | "TEAM", "PLAYER" | "TEAM"> = z.enum(['PLAYER', 'TEAM']);

export const OrderByRelationAggregateFunctionSchema: z.ZodType<"COUNT", "COUNT"> = z.enum(['COUNT']);

export const OrderByRelationWithColumnAggregateFunctionSchema: z.ZodType<"AVG" | "COUNT" | "MAX" | "MIN" | "SUM", "AVG" | "COUNT" | "MAX" | "MIN" | "SUM"> = z.enum(['AVG', 'COUNT', 'MAX', 'MIN', 'SUM']);

export const RoleSchema: z.ZodType<"ADMIN" | "CUSTOMER" | "MODERATOR" | "OWNER", "ADMIN" | "CUSTOMER" | "MODERATOR" | "OWNER"> = z.enum(['ADMIN', 'CUSTOMER', 'MODERATOR', 'OWNER']);

export const SideSchema: z.ZodType<"A" | "B", "A" | "B"> = z.enum(['A', 'B']);

export const SortOrderSchema: z.ZodType<"ASC" | "DESC", "ASC" | "DESC"> = z.enum(['ASC', 'DESC']);

export const TrashedSchema: z.ZodType<"ONLY" | "WITH" | "WITHOUT", "ONLY" | "WITH" | "WITHOUT"> = z.enum(['ONLY', 'WITH', 'WITHOUT']);

export function BetSelectionInputSchema(): z.ZodObject<Properties<BetSelectionInput>> {
  return z.object({
    matchId: z.string(),
    side: SideSchema
  })
}

export function LoginInputSchema(): z.ZodObject<Properties<LoginInput>> {
  return z.object({
    email: z.string(),
    password: z.string()
  })
}

export function OrderByClauseSchema(): z.ZodObject<Properties<OrderByClause>> {
  return z.object({
    column: z.string(),
    order: SortOrderSchema
  })
}

export function PlaceBetInputSchema(): z.ZodObject<Properties<PlaceBetInput>> {
  return z.object({
    matchId: z.string(),
    side: SideSchema,
    stake: z.number()
  })
}

export function PlaceComboBetInputSchema(): z.ZodObject<Properties<PlaceComboBetInput>> {
  return z.object({
    selections: z.array(z.lazy(() => BetSelectionInputSchema())),
    stake: z.number()
  })
}

export function RegisterInputSchema(): z.ZodObject<Properties<RegisterInput>> {
  return z.object({
    email: z.string(),
    name: z.string(),
    password: z.string(),
    passwordConfirmation: z.string()
  })
}

export function SimCreateMatchInputSchema(): z.ZodObject<Properties<SimCreateMatchInput>> {
  return z.object({
    externalId: z.string().nullish(),
    game: z.string(),
    gameName: z.string(),
    oddsA: z.number(),
    oddsB: z.number(),
    startsAt: z.string(),
    state: MatchStateSchema.nullish(),
    streamUrl: z.string().nullish(),
    teamA: z.string(),
    teamAAcronym: z.string().nullish(),
    teamB: z.string(),
    teamBAcronym: z.string().nullish(),
    tournament: z.string()
  })
}

export function SimUpdateMatchInputSchema(): z.ZodObject<Properties<SimUpdateMatchInput>> {
  return z.object({
    oddsA: z.number().nullish(),
    oddsB: z.number().nullish(),
    scoreA: z.number().nullish(),
    scoreB: z.number().nullish(),
    state: MatchStateSchema.nullish(),
    winner: SideSchema.nullish()
  })
}
