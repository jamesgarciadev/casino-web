import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { requireUser } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Account" };

export default function AccountPage() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <div>
        <p className="font-display text-[11px] font-bold uppercase tracking-[0.3em] text-primary">Profile</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold uppercase">My account</h1>
      </div>
      <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-card" />}>
        <AccountDetails />
      </Suspense>
      <Link
        href="/my-bets"
        className="flex items-center gap-1 font-display text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary"
      >
        Wallet and bet history <ArrowRight className="size-3.5" />
      </Link>
    </main>
  );
}

async function AccountDetails() {
  const user = await requireUser();

  const rows = [
    { label: "Name", value: user.name },
    { label: "Email", value: user.email },
    { label: "Member since", value: new Date(user.createdAt).toLocaleDateString("en", { dateStyle: "long" }) },
  ];

  return (
    <section className="divide-y divide-border rounded-xl border border-border bg-card">
      {rows.map((row) => (
        <div key={row.label} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-display text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{row.label}</span>
          <span className="text-sm font-semibold">{row.value}</span>
        </div>
      ))}
    </section>
  );
}
