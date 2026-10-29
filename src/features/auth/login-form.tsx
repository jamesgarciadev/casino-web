"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormField } from "@/components/form-field";
import { loginAction } from "@/features/auth/actions";
import { loginSchema, type LoginValues } from "@/features/auth/schemas";
import { useServerForm } from "@/features/auth/use-server-form";

export function LoginForm() {
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const { onSubmit, pending, formError } = useServerForm(form, loginAction);
  const { errors } = form.formState;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <FormField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...form.register("email")} />
      <FormField
        label="Password"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...form.register("password")}
      />
      {formError && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{formError}</p>}
      <button type="submit" disabled={pending} className="btn btn-accent h-12 w-full">
        {pending ? "Signing in…" : "Log in"}
      </button>
    </form>
  );
}
