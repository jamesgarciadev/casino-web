import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="font-display text-7xl font-extrabold text-primary">404</h1>
      <h2 className="mt-4 font-display text-xl font-bold uppercase">Page not found</h2>
      <p className="mt-2 text-sm text-muted-foreground">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <Link href="/" className={buttonVariants({ className: "mt-6" })}>
        Back to the arena
      </Link>
    </main>
  );
}
