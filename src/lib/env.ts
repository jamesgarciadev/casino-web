import "server-only";

export const env = {
  apiUrl: process.env.CASINO_API_URL ?? "http://localhost:8000/graphql",
  isProduction: process.env.NODE_ENV === "production",
};
