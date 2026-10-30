import type { Metadata } from "next";

import { AuthCard } from "@/features/auth/auth-card";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to place bets and track your slips."
      footer={{ text: "New here?", href: "/register", link: "Create an account" }}
    >
      <LoginForm />
    </AuthCard>
  );
}
