import { graphql } from "@/gql";

export const MeQuery = graphql(`
  query Me {
    me {
      id
      name
      email
      roles
      createdAt
    }
  }
`);

export const LoginMutation = graphql(`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
    }
  }
`);

export const RegisterMutation = graphql(`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
    }
  }
`);

export const LogoutMutation = graphql(`
  mutation Logout {
    logout
  }
`);

export const MatchFieldsFragment = graphql(`
  fragment MatchFields on Match {
    id
    game
    gameName
    tournament
    teamA
    teamB
    teamAAcronym
    teamBAcronym
    scoreA
    scoreB
    oddsA
    oddsB
    startsAt
    state
    winner
    streamUrl
  }
`);

export const MatchesQuery = graphql(`
  query Matches($state: MatchState, $game: String) {
    matches(state: $state, game: $game) {
      ...MatchFields
    }
  }
`);

export const MatchUpdatedSubscription = graphql(`
  subscription MatchUpdated {
    matchUpdated {
      ...MatchFields
    }
  }
`);

export const WalletQuery = graphql(`
  query Wallet {
    wallet {
      balance
    }
  }
`);

export const MyBetsQuery = graphql(`
  query MyBets {
    myBets {
      id
      side
      stake
      odds
      payout
      status
      placedAt
      match {
        ...MatchFields
      }
    }
  }
`);

export const PlaceBetMutation = graphql(`
  mutation PlaceBet($input: PlaceBetInput!) {
    placeBet(input: $input) {
      bet {
        id
        payout
      }
      wallet {
        balance
      }
    }
  }
`);

export const TopUpWalletMutation = graphql(`
  mutation TopUpWallet {
    topUpWallet {
      balance
    }
  }
`);
