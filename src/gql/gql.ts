/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query Me {\n    me {\n      id\n      name\n      email\n      roles\n      createdAt\n    }\n  }\n": typeof types.MeDocument,
    "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      token\n    }\n  }\n": typeof types.LoginDocument,
    "\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      token\n    }\n  }\n": typeof types.RegisterDocument,
    "\n  mutation Logout {\n    logout\n  }\n": typeof types.LogoutDocument,
    "\n  fragment MatchFields on Match {\n    id\n    game\n    gameName\n    tournament\n    teamA\n    teamB\n    teamAAcronym\n    teamBAcronym\n    scoreA\n    scoreB\n    oddsA\n    oddsB\n    startsAt\n    state\n    winner\n    streamUrl\n  }\n": typeof types.MatchFieldsFragmentDoc,
    "\n  query Matches($state: MatchState, $game: String) {\n    matches(state: $state, game: $game) {\n      ...MatchFields\n    }\n  }\n": typeof types.MatchesDocument,
    "\n  subscription MatchUpdated {\n    matchUpdated {\n      ...MatchFields\n    }\n  }\n": typeof types.MatchUpdatedDocument,
    "\n  query Wallet {\n    wallet {\n      balance\n    }\n  }\n": typeof types.WalletDocument,
    "\n  fragment BetFields on Bet {\n    id\n    type\n    stake\n    odds\n    payout\n    status\n    placedAt\n    selections {\n      id\n      side\n      odds\n      status\n      match {\n        ...MatchFields\n      }\n    }\n  }\n": typeof types.BetFieldsFragmentDoc,
    "\n  query MyBets {\n    myBets {\n      ...BetFields\n    }\n  }\n": typeof types.MyBetsDocument,
    "\n  query SlipBets($open: Boolean!, $first: Int!, $before: ID) {\n    myBets(open: $open, first: $first, before: $before) {\n      ...BetFields\n    }\n  }\n": typeof types.SlipBetsDocument,
    "\n  mutation PlaceBet($input: PlaceBetInput!) {\n    placeBet(input: $input) {\n      bet {\n        id\n        payout\n      }\n      wallet {\n        balance\n      }\n    }\n  }\n": typeof types.PlaceBetDocument,
    "\n  mutation PlaceComboBet($input: PlaceComboBetInput!) {\n    placeComboBet(input: $input) {\n      bet {\n        id\n        payout\n      }\n      wallet {\n        balance\n      }\n    }\n  }\n": typeof types.PlaceComboBetDocument,
    "\n  mutation TopUpWallet {\n    topUpWallet {\n      balance\n    }\n  }\n": typeof types.TopUpWalletDocument,
};
const documents: Documents = {
    "\n  query Me {\n    me {\n      id\n      name\n      email\n      roles\n      createdAt\n    }\n  }\n": types.MeDocument,
    "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      token\n    }\n  }\n": types.LoginDocument,
    "\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      token\n    }\n  }\n": types.RegisterDocument,
    "\n  mutation Logout {\n    logout\n  }\n": types.LogoutDocument,
    "\n  fragment MatchFields on Match {\n    id\n    game\n    gameName\n    tournament\n    teamA\n    teamB\n    teamAAcronym\n    teamBAcronym\n    scoreA\n    scoreB\n    oddsA\n    oddsB\n    startsAt\n    state\n    winner\n    streamUrl\n  }\n": types.MatchFieldsFragmentDoc,
    "\n  query Matches($state: MatchState, $game: String) {\n    matches(state: $state, game: $game) {\n      ...MatchFields\n    }\n  }\n": types.MatchesDocument,
    "\n  subscription MatchUpdated {\n    matchUpdated {\n      ...MatchFields\n    }\n  }\n": types.MatchUpdatedDocument,
    "\n  query Wallet {\n    wallet {\n      balance\n    }\n  }\n": types.WalletDocument,
    "\n  fragment BetFields on Bet {\n    id\n    type\n    stake\n    odds\n    payout\n    status\n    placedAt\n    selections {\n      id\n      side\n      odds\n      status\n      match {\n        ...MatchFields\n      }\n    }\n  }\n": types.BetFieldsFragmentDoc,
    "\n  query MyBets {\n    myBets {\n      ...BetFields\n    }\n  }\n": types.MyBetsDocument,
    "\n  query SlipBets($open: Boolean!, $first: Int!, $before: ID) {\n    myBets(open: $open, first: $first, before: $before) {\n      ...BetFields\n    }\n  }\n": types.SlipBetsDocument,
    "\n  mutation PlaceBet($input: PlaceBetInput!) {\n    placeBet(input: $input) {\n      bet {\n        id\n        payout\n      }\n      wallet {\n        balance\n      }\n    }\n  }\n": types.PlaceBetDocument,
    "\n  mutation PlaceComboBet($input: PlaceComboBetInput!) {\n    placeComboBet(input: $input) {\n      bet {\n        id\n        payout\n      }\n      wallet {\n        balance\n      }\n    }\n  }\n": types.PlaceComboBetDocument,
    "\n  mutation TopUpWallet {\n    topUpWallet {\n      balance\n    }\n  }\n": types.TopUpWalletDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Me {\n    me {\n      id\n      name\n      email\n      roles\n      createdAt\n    }\n  }\n"): (typeof documents)["\n  query Me {\n    me {\n      id\n      name\n      email\n      roles\n      createdAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      token\n    }\n  }\n"): (typeof documents)["\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      token\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      token\n    }\n  }\n"): (typeof documents)["\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      token\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Logout {\n    logout\n  }\n"): (typeof documents)["\n  mutation Logout {\n    logout\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment MatchFields on Match {\n    id\n    game\n    gameName\n    tournament\n    teamA\n    teamB\n    teamAAcronym\n    teamBAcronym\n    scoreA\n    scoreB\n    oddsA\n    oddsB\n    startsAt\n    state\n    winner\n    streamUrl\n  }\n"): (typeof documents)["\n  fragment MatchFields on Match {\n    id\n    game\n    gameName\n    tournament\n    teamA\n    teamB\n    teamAAcronym\n    teamBAcronym\n    scoreA\n    scoreB\n    oddsA\n    oddsB\n    startsAt\n    state\n    winner\n    streamUrl\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Matches($state: MatchState, $game: String) {\n    matches(state: $state, game: $game) {\n      ...MatchFields\n    }\n  }\n"): (typeof documents)["\n  query Matches($state: MatchState, $game: String) {\n    matches(state: $state, game: $game) {\n      ...MatchFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  subscription MatchUpdated {\n    matchUpdated {\n      ...MatchFields\n    }\n  }\n"): (typeof documents)["\n  subscription MatchUpdated {\n    matchUpdated {\n      ...MatchFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Wallet {\n    wallet {\n      balance\n    }\n  }\n"): (typeof documents)["\n  query Wallet {\n    wallet {\n      balance\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment BetFields on Bet {\n    id\n    type\n    stake\n    odds\n    payout\n    status\n    placedAt\n    selections {\n      id\n      side\n      odds\n      status\n      match {\n        ...MatchFields\n      }\n    }\n  }\n"): (typeof documents)["\n  fragment BetFields on Bet {\n    id\n    type\n    stake\n    odds\n    payout\n    status\n    placedAt\n    selections {\n      id\n      side\n      odds\n      status\n      match {\n        ...MatchFields\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MyBets {\n    myBets {\n      ...BetFields\n    }\n  }\n"): (typeof documents)["\n  query MyBets {\n    myBets {\n      ...BetFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SlipBets($open: Boolean!, $first: Int!, $before: ID) {\n    myBets(open: $open, first: $first, before: $before) {\n      ...BetFields\n    }\n  }\n"): (typeof documents)["\n  query SlipBets($open: Boolean!, $first: Int!, $before: ID) {\n    myBets(open: $open, first: $first, before: $before) {\n      ...BetFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation PlaceBet($input: PlaceBetInput!) {\n    placeBet(input: $input) {\n      bet {\n        id\n        payout\n      }\n      wallet {\n        balance\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation PlaceBet($input: PlaceBetInput!) {\n    placeBet(input: $input) {\n      bet {\n        id\n        payout\n      }\n      wallet {\n        balance\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation PlaceComboBet($input: PlaceComboBetInput!) {\n    placeComboBet(input: $input) {\n      bet {\n        id\n        payout\n      }\n      wallet {\n        balance\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation PlaceComboBet($input: PlaceComboBetInput!) {\n    placeComboBet(input: $input) {\n      bet {\n        id\n        payout\n      }\n      wallet {\n        balance\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation TopUpWallet {\n    topUpWallet {\n      balance\n    }\n  }\n"): (typeof documents)["\n  mutation TopUpWallet {\n    topUpWallet {\n      balance\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;