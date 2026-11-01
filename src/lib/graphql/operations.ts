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
    bestOf
    scoreA
    scoreB
    maps {
      number
      name
      scoreA
      scoreB
      winner
    }
    oddsA
    oddsB
    startsAt
    state
    winner
    streamUrl
  }
`);

export const MarketFieldsFragment = graphql(`
  fragment MarketFields on Market {
    id
    key
    type
    map
    half
    round
    line
    side
    status
    outcomes {
      id
      key
      odds
    }
  }
`);

/** The match page: the match with every market still taking (or about to take) bets. */
export const MatchMarketsQuery = graphql(`
  query MatchMarkets($id: ID!) {
    match(id: $id) {
      ...MatchFields
      markets(status: [OPEN, SUSPENDED]) {
        ...MarketFields
      }
    }
  }
`);

export const MatchMarketsUpdatedSubscription = graphql(`
  subscription MatchMarketsUpdated($id: ID!) {
    matchUpdated(id: $id) {
      ...MatchFields
      markets(status: [OPEN, SUSPENDED]) {
        ...MarketFields
      }
    }
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
      market {
        id
        type
        map
        half
        round
        line
        side
        status
      }
      outcome {
        id
        key
        odds
      }
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
