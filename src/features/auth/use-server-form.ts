"use client";

import { useState, useTransition } from "react";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

import type { ActionResult } from "@/lib/graphql/errors";

/** Submits validated form values to a Server Action and maps be validation errors onto fields. */
export function useServerForm<T extends FieldValues>(
  form: UseFormReturn<T>,
  action: (values: T) => Promise<ActionResult>,
) {
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null);

    startTransition(async () => {
      const result = await action(values);
      if (!result) {
        return;
      }

      for (const [field, message] of Object.entries(result.fieldErrors ?? {})) {
        form.setError(field as Path<T>, { type: "server", message });
      }

      if (result.message) {
        setFormError(result.message);
      }
    });
  });

  return { onSubmit, pending, formError };
}
