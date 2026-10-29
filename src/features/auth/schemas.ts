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
    // Mirrors casino-be's App\Rules\StrongPassword.
    password: z
      .string()
      .min(8, "Password must be between 8 and 64 characters.")
      .max(64, "Password must be between 8 and 64 characters.")
      .regex(/^\S*$/, "Password must not contain spaces.")
      .regex(/\p{Lu}/u, "Password must contain at least one uppercase letter.")
      .regex(/\p{Ll}/u, "Password must contain at least one lowercase letter.")
      .regex(/\d/, "Password must contain at least one number.")
      .regex(/[^\p{L}\d\s]/u, "Password must contain at least one special character."),
    passwordConfirmation: z.string().min(1, "Confirm your password."),
  })
  .refine((values) => values.password === values.passwordConfirmation, {
    path: ["passwordConfirmation"],
    message: "Passwords do not match.",
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
