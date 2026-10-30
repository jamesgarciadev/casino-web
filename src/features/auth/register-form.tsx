"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormField } from "@/components/form-field";
import { buttonVariants } from "@/components/ui/button";
import { registerAction } from "@/features/auth/actions";
import { registerSchema, type RegisterValues } from "@/features/auth/schemas";
import { useServerForm } from "@/features/auth/use-server-form";

export function RegisterForm() {
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", passwordConfirmation: "" },
  });
  const { onSubmit, pending, formError } = useServerForm(form, registerAction);
  const { errors } = form.formState;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <FormField label="Name" autoComplete="name" error={errors.name?.message} {...form.register("name")} />
      <FormField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...form.register("email")} />
      <FormField
        label="Password"
        type="password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...form.register("password")}
      />
      <p className="-mt-2 text-xs text-muted-foreground">
        8–64 characters with an uppercase letter, a lowercase letter, a number and a special character. No spaces.
      </p>
      <FormField
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        error={errors.passwordConfirmation?.message}
        {...form.register("passwordConfirmation")}
      />
      {formError && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p>}
      <button type="submit" disabled={pending} className={buttonVariants({ size: "lg", className: "w-full" })}>
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
