import { z } from "zod";

import { LoginInputSchema, RegisterInputSchema } from "@/gql/validation";

// UX-layer validation, mirroring the @rules on LoginInput / RegisterInput in be's schema.graphql.
// be re-validates everything; keep these in sync when those rules change.

export const loginSchema = LoginInputSchema().extend({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export const registerSchema = RegisterInputSchema()
  .extend({
    name: z.string().trim().min(2, "Name must be at least 2 characters.").max(255),
    email: z.email("Enter a valid email address.").max(255),
    password: z.string().min(8, "Password must be at least 8 characters.").max(255),
    passwordConfirmation: z.string().min(1, "Confirm your password."),
  })
  .refine((values) => values.password === values.passwordConfirmation, {
    path: ["passwordConfirmation"],
    message: "Passwords do not match.",
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
