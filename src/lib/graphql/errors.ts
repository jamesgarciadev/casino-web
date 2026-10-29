export type GraphQLErrorShape = {
  message: string;
  path?: ReadonlyArray<string | number>;
  extensions?: {
    validation?: Record<string, string[]>;
    [key: string]: unknown;
  };
};

export type ActionResult = {
  message?: string;
  fieldErrors?: Record<string, string>;
} | null;

/**
 * Lighthouse reports validation errors under `extensions.validation`, keyed by argument path
 * (e.g. `input.email`). Strip the wrapper so keys line up with form field names.
 */
export function toFieldErrors(errors: readonly GraphQLErrorShape[]): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  for (const error of errors) {
    for (const [path, messages] of Object.entries(error.extensions?.validation ?? {})) {
      const field = path.replace(/^input\./, "");
      fieldErrors[field] ??= messages[0];
    }
  }

  return fieldErrors;
}

export function toActionResult(errors: readonly GraphQLErrorShape[]): ActionResult {
  const fieldErrors = toFieldErrors(errors);

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  return { message: errors[0]?.message ?? "Something went wrong. Please try again." };
}

export function isUnauthenticated(errors: readonly GraphQLErrorShape[]): boolean {
  return errors.some((error) => error.message === "Unauthenticated.");
}
