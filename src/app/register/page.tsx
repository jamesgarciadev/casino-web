import type { Metadata } from "next";

import { AuthCard } from "@/features/auth/auth-card";
import { RegisterForm } from "@/features/auth/register-form";

export const metadata: Metadata = { title: "Sign up" };

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create account"
      subtitle="It takes less than a minute."
      footer={{ text: "Already have an account?", href: "/login", link: "Log in" }}
    >
      <RegisterForm />
    </AuthCard>
  );
}
