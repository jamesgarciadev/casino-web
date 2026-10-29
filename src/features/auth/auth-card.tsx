import Link from "next/link";
import type { ReactNode } from "react";

export function AuthCard({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string;
  subtitle: string;
  footer: { text: string; href: string; link: string };
  children: ReactNode;
}) {
  return (
    <main className="grid flex-1 place-items-center px-4 py-12">
      <div className="panel w-full max-w-md p-6 sm:p-8">
        <h1 className="display text-2xl">{title}</h1>
        <p className="mt-1 text-sm text-muted">{subtitle}</p>
        <div className="mt-6">{children}</div>
        <p className="mt-6 text-center text-sm text-muted">
          {footer.text}{" "}
          <Link href={footer.href} className="font-semibold text-accent hover:underline">
            {footer.link}
          </Link>
        </p>
      </div>
    </main>
  );
}
