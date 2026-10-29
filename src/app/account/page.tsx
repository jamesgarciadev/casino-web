import type { Metadata } from "next";
import { Suspense } from "react";

import { requireUser } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Account" };

export default function AccountPage() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
      <h1 className="display text-3xl">My account</h1>
      <Suspense fallback={<div className="panel h-40 animate-pulse" />}>
        <AccountDetails />
      </Suspense>
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
    <section className="panel divide-y divide-border">
      {rows.map((row) => (
        <div key={row.label} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs font-bold uppercase tracking-wide text-muted">{row.label}</span>
          <span className="text-sm font-semibold">{row.value}</span>
        </div>
      ))}
    </section>
  );
}
