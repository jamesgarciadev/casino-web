/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type BetSelectionInput = {
  matchId: string;
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

export type LoginInput = {
  email: string;
  password: string;
};

/** Where a match is in its lifecycle. Bets are accepted until FINISHED. */
export type MatchState =
  | 'FINISHED'
  | 'LIVE'
  | 'UPCOMING';

export type PlaceBetInput = {
  matchId: string;
  side: Side;
  stake: number;
};

export type PlaceComboBetInput = {
  /** At least two picks, each from a different match. */
  selections: Array<BetSelectionInput>;
  stake: number;
};

export type RegisterInput = {
  email: string;
  name: string;
  password: string;
  passwordConfirmation: string;
};

/** Team A or team B of a match. */
export type Side =
  | 'A'
  | 'B';

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { me: { id: string, name: string, email: string, roles: Array<string>, createdAt: string } | null };

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { login: { token: string } };

export type RegisterMutationVariables = Exact<{
  input: RegisterInput;
}>;


export type RegisterMutation = { register: { token: string } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { logout: boolean };

export type MatchFieldsFragment = { id: string, game: string, gameName: string, tournament: string, teamA: string, teamB: string, teamAAcronym: string | null, teamBAcronym: string | null, scoreA: number, scoreB: number, oddsA: number, oddsB: number, startsAt: string, state: MatchState, winner: Side | null, streamUrl: string | null };

export type MatchesQueryVariables = Exact<{
  state?: MatchState | null | undefined;
  game?: string | null | undefined;
}>;


export type MatchesQuery = { matches: Array<{ id: string, game: string, gameName: string, tournament: string, teamA: string, teamB: string, teamAAcronym: string | null, teamBAcronym: string | null, scoreA: number, scoreB: number, oddsA: number, oddsB: number, startsAt: string, state: MatchState, winner: Side | null, streamUrl: string | null }> };

export type MatchUpdatedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type MatchUpdatedSubscription = { matchUpdated: { id: string, game: string, gameName: string, tournament: string, teamA: string, teamB: string, teamAAcronym: string | null, teamBAcronym: string | null, scoreA: number, scoreB: number, oddsA: number, oddsB: number, startsAt: string, state: MatchState, winner: Side | null, streamUrl: string | null } | null };

export type WalletQueryVariables = Exact<{ [key: string]: never; }>;


export type WalletQuery = { wallet: { balance: number } };

export type MyBetsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyBetsQuery = { myBets: Array<{ id: string, type: BetType, stake: number, odds: number, payout: number, status: BetStatus, placedAt: string, selections: Array<{ id: string, side: Side, odds: number, status: BetStatus, match: { id: string, game: string, gameName: string, tournament: string, teamA: string, teamB: string, teamAAcronym: string | null, teamBAcronym: string | null, scoreA: number, scoreB: number, oddsA: number, oddsB: number, startsAt: string, state: MatchState, winner: Side | null, streamUrl: string | null } }> }> };

export type PlaceBetMutationVariables = Exact<{
  input: PlaceBetInput;
}>;


export type PlaceBetMutation = { placeBet: { bet: { id: string, payout: number }, wallet: { balance: number } } };

export type PlaceComboBetMutationVariables = Exact<{
  input: PlaceComboBetInput;
}>;


export type PlaceComboBetMutation = { placeComboBet: { bet: { id: string, payout: number }, wallet: { balance: number } } };

export type TopUpWalletMutationVariables = Exact<{ [key: string]: never; }>;


export type TopUpWalletMutation = { topUpWallet: { balance: number } };

export const MatchFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MatchFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Match"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"game"}},{"kind":"Field","name":{"kind":"Name","value":"gameName"}},{"kind":"Field","name":{"kind":"Name","value":"tournament"}},{"kind":"Field","name":{"kind":"Name","value":"teamA"}},{"kind":"Field","name":{"kind":"Name","value":"teamB"}},{"kind":"Field","name":{"kind":"Name","value":"teamAAcronym"}},{"kind":"Field","name":{"kind":"Name","value":"teamBAcronym"}},{"kind":"Field","name":{"kind":"Name","value":"scoreA"}},{"kind":"Field","name":{"kind":"Name","value":"scoreB"}},{"kind":"Field","name":{"kind":"Name","value":"oddsA"}},{"kind":"Field","name":{"kind":"Name","value":"oddsB"}},{"kind":"Field","name":{"kind":"Name","value":"startsAt"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"winner"}},{"kind":"Field","name":{"kind":"Name","value":"streamUrl"}}]}}]} as unknown as DocumentNode<MatchFieldsFragment, unknown>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"roles"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const RegisterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Register"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RegisterInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"register"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}}]}}]}}]} as unknown as DocumentNode<RegisterMutation, RegisterMutationVariables>;
export const LogoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Logout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logout"}}]}}]} as unknown as DocumentNode<LogoutMutation, LogoutMutationVariables>;
export const MatchesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Matches"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"state"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"MatchState"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"game"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"matches"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"state"},"value":{"kind":"Variable","name":{"kind":"Name","value":"state"}}},{"kind":"Argument","name":{"kind":"Name","value":"game"},"value":{"kind":"Variable","name":{"kind":"Name","value":"game"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MatchFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MatchFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Match"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"game"}},{"kind":"Field","name":{"kind":"Name","value":"gameName"}},{"kind":"Field","name":{"kind":"Name","value":"tournament"}},{"kind":"Field","name":{"kind":"Name","value":"teamA"}},{"kind":"Field","name":{"kind":"Name","value":"teamB"}},{"kind":"Field","name":{"kind":"Name","value":"teamAAcronym"}},{"kind":"Field","name":{"kind":"Name","value":"teamBAcronym"}},{"kind":"Field","name":{"kind":"Name","value":"scoreA"}},{"kind":"Field","name":{"kind":"Name","value":"scoreB"}},{"kind":"Field","name":{"kind":"Name","value":"oddsA"}},{"kind":"Field","name":{"kind":"Name","value":"oddsB"}},{"kind":"Field","name":{"kind":"Name","value":"startsAt"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"winner"}},{"kind":"Field","name":{"kind":"Name","value":"streamUrl"}}]}}]} as unknown as DocumentNode<MatchesQuery, MatchesQueryVariables>;
export const MatchUpdatedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"MatchUpdated"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"matchUpdated"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MatchFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MatchFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Match"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"game"}},{"kind":"Field","name":{"kind":"Name","value":"gameName"}},{"kind":"Field","name":{"kind":"Name","value":"tournament"}},{"kind":"Field","name":{"kind":"Name","value":"teamA"}},{"kind":"Field","name":{"kind":"Name","value":"teamB"}},{"kind":"Field","name":{"kind":"Name","value":"teamAAcronym"}},{"kind":"Field","name":{"kind":"Name","value":"teamBAcronym"}},{"kind":"Field","name":{"kind":"Name","value":"scoreA"}},{"kind":"Field","name":{"kind":"Name","value":"scoreB"}},{"kind":"Field","name":{"kind":"Name","value":"oddsA"}},{"kind":"Field","name":{"kind":"Name","value":"oddsB"}},{"kind":"Field","name":{"kind":"Name","value":"startsAt"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"winner"}},{"kind":"Field","name":{"kind":"Name","value":"streamUrl"}}]}}]} as unknown as DocumentNode<MatchUpdatedSubscription, MatchUpdatedSubscriptionVariables>;
export const WalletDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Wallet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"wallet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"balance"}}]}}]}}]} as unknown as DocumentNode<WalletQuery, WalletQueryVariables>;
export const MyBetsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyBets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myBets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"stake"}},{"kind":"Field","name":{"kind":"Name","value":"odds"}},{"kind":"Field","name":{"kind":"Name","value":"payout"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"placedAt"}},{"kind":"Field","name":{"kind":"Name","value":"selections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"side"}},{"kind":"Field","name":{"kind":"Name","value":"odds"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"match"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MatchFields"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MatchFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Match"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"game"}},{"kind":"Field","name":{"kind":"Name","value":"gameName"}},{"kind":"Field","name":{"kind":"Name","value":"tournament"}},{"kind":"Field","name":{"kind":"Name","value":"teamA"}},{"kind":"Field","name":{"kind":"Name","value":"teamB"}},{"kind":"Field","name":{"kind":"Name","value":"teamAAcronym"}},{"kind":"Field","name":{"kind":"Name","value":"teamBAcronym"}},{"kind":"Field","name":{"kind":"Name","value":"scoreA"}},{"kind":"Field","name":{"kind":"Name","value":"scoreB"}},{"kind":"Field","name":{"kind":"Name","value":"oddsA"}},{"kind":"Field","name":{"kind":"Name","value":"oddsB"}},{"kind":"Field","name":{"kind":"Name","value":"startsAt"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"winner"}},{"kind":"Field","name":{"kind":"Name","value":"streamUrl"}}]}}]} as unknown as DocumentNode<MyBetsQuery, MyBetsQueryVariables>;
export const PlaceBetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PlaceBet"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PlaceBetInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"placeBet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"payout"}}]}},{"kind":"Field","name":{"kind":"Name","value":"wallet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"balance"}}]}}]}}]}}]} as unknown as DocumentNode<PlaceBetMutation, PlaceBetMutationVariables>;
export const PlaceComboBetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PlaceComboBet"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PlaceComboBetInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"placeComboBet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"payout"}}]}},{"kind":"Field","name":{"kind":"Name","value":"wallet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"balance"}}]}}]}}]}}]} as unknown as DocumentNode<PlaceComboBetMutation, PlaceComboBetMutationVariables>;
export const TopUpWalletDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TopUpWallet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"topUpWallet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"balance"}}]}}]}}]} as unknown as DocumentNode<TopUpWalletMutation, TopUpWalletMutationVariables>;