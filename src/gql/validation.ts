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

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

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
  /** Create a customer account and return a customer-scoped token. */
  register: AuthPayload;
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


export type MutationRegisterArgs = {
  input: RegisterInput;
};

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

export type Query = {
  __typename?: 'Query';
  /** Staff: audit log of admin and auth events. Requires `activity.view`. */
  adminActivities: ActivityPaginator;
  /** Staff: list users. Requires `users.view`. */
  adminUsers: UserPaginator;
  /** The currently authenticated user (any token scope). */
  me?: Maybe<User>;
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

/** Directions for ordering a list of records. */
export type SortOrder =
  /** Sort records in ascending order. */
  | 'ASC'
  /** Sort records in descending order. */
  | 'DESC';

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


type Properties<T> = {
  [K in keyof T]: z.ZodType<T[K], T[K] | undefined>;
};

type definedNonNullAny = {};

export const isDefinedNonNullAny = (v: any): v is definedNonNullAny => v !== undefined && v !== null;

export const definedNonNullAnySchema = z.any().refine((v) => isDefinedNonNullAny(v));

export const OrderByRelationAggregateFunctionSchema: z.ZodType<"COUNT", "COUNT"> = z.enum(['COUNT']);

export const OrderByRelationWithColumnAggregateFunctionSchema: z.ZodType<"AVG" | "COUNT" | "MAX" | "MIN" | "SUM", "AVG" | "COUNT" | "MAX" | "MIN" | "SUM"> = z.enum(['AVG', 'COUNT', 'MAX', 'MIN', 'SUM']);

export const RoleSchema: z.ZodType<"ADMIN" | "CUSTOMER" | "MODERATOR" | "OWNER", "ADMIN" | "CUSTOMER" | "MODERATOR" | "OWNER"> = z.enum(['ADMIN', 'CUSTOMER', 'MODERATOR', 'OWNER']);

export const SortOrderSchema: z.ZodType<"ASC" | "DESC", "ASC" | "DESC"> = z.enum(['ASC', 'DESC']);

export const TrashedSchema: z.ZodType<"ONLY" | "WITH" | "WITHOUT", "ONLY" | "WITH" | "WITHOUT"> = z.enum(['ONLY', 'WITH', 'WITHOUT']);

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

export function RegisterInputSchema(): z.ZodObject<Properties<RegisterInput>> {
  return z.object({
    email: z.string(),
    name: z.string(),
    password: z.string(),
    passwordConfirmation: z.string()
  })
}
