import type { CodegenConfig } from "@graphql-codegen/cli";

try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local (e.g. CI): fall back to the process environment.
}

// The be schema is the contract. be commits it as graphql/schema.public.graphql (composer schema:print).
// In CI, set CODEGEN_SCHEMA to that file (or its raw URL) so breaking changes fail the build.
const schema = process.env.CODEGEN_SCHEMA ?? "../casino-be/graphql/schema.public.graphql";

const scalars = {
  ID: { input: "string", output: "string" },
  DateTime: { input: "string", output: "string" },
};

const config: CodegenConfig = {
  schema,
  documents: ["src/**/*.{ts,tsx}", "!src/gql/**"],
  ignoreNoDocuments: true,
  generates: {
    "./src/gql/": {
      preset: "client",
      config: { scalars, enumsAsTypes: true, useTypeImports: true },
      presetConfig: { fragmentMasking: false },
    },
    "./src/gql/validation.ts": {
      plugins: [
        "typescript",
        {
          "typescript-validation-schema": {
            schema: "zodv4",
            scalarSchemas: { DateTime: "z.string()" },
          },
        },
      ],
      config: { scalars, enumsAsTypes: true },
      hooks: {
        // The zodv4 generator types every field's input as `T[K] | undefined`, which makes nested input lists
        // (PlaceComboBetInput.selections) fail to typecheck. Inputs are only checked as unknown anyway.
        beforeOneFileWrite: [
          (_path: string, content: string) =>
            content.replace("z.ZodType<T[K], T[K] | undefined>", "z.ZodType<T[K], unknown>"),
        ],
      },
    },
  },
};

export default config;
