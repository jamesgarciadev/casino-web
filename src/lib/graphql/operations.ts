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

export const BetFieldsFragment = graphql(`
  fragment BetFields on Bet {
    id
    type
    stake
    odds
    payout
    cashOut
    status
    placedAt
    selections {
      id
      side
      odds
      status
      match {
        ...MatchFields
      }
    }
  }
`);

export const MyBetsQuery = graphql(`
  query MyBets {
    myBets {
      ...BetFields
    }
  }
`);

/** The bet slip's My bets tab: one page of open (pending) or settled bets, older than `before`. */
export const SlipBetsQuery = graphql(`
  query SlipBets($open: Boolean!, $first: Int!, $before: ID) {
    myBets(open: $open, first: $first, before: $before) {
      ...BetFields
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

export const PlaceComboBetMutation = graphql(`
  mutation PlaceComboBet($input: PlaceComboBetInput!) {
    placeComboBet(input: $input) {
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

export const CashOutBetMutation = graphql(`
  mutation CashOutBet($input: CashOutBetInput!) {
    cashOutBet(input: $input) {
      bet {
        id
        cashOut
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
