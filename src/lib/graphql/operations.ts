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
