import type { Metadata } from "next";

import { AuthCard } from "@/features/auth/auth-card";
import { RegisterForm } from "@/features/auth/register-form";

export const metadata: Metadata = { title: "Sign up" };

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create account"
      subtitle="Your wallet starts with 1,000 play-money credits."
      footer={{ text: "Already have an account?", href: "/login", link: "Log in" }}
    >
      <RegisterForm />
    </AuthCard>
  );
}
