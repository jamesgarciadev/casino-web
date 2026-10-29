import Link from "next/link";

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-surface-2 px-6 py-10 sm:px-10 sm:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 120% at 85% 20%, rgb(184 255 59 / 0.22), transparent 60%), radial-gradient(50% 90% at 100% 100%, rgb(255 106 43 / 0.18), transparent 60%)",
        }}
      />
      <div className="relative max-w-xl space-y-4">
        <span className="inline-block rounded-md bg-accent px-2 py-1 text-[11px] font-black uppercase text-accent-fg">
          Welcome offer
        </span>
        <h1 className="display text-4xl leading-none sm:text-5xl">
          Play bold.
          <br />
          <span className="text-accent">Win big.</span>
        </h1>
        <p className="max-w-md text-sm text-muted sm:text-base">
          Hundreds of slots, live dealer tables and daily jackpots. Create an account to get started.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/register" className="btn btn-accent h-12 px-6">
            Join now
          </Link>
          <Link href="/login" className="btn btn-ghost h-12 px-6">
            Log in
          </Link>
        </div>
      </div>
    </section>
  );
}
