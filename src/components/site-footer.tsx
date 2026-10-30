import { Gamepad2, Zap } from "lucide-react";
import Link from "next/link";

const LINKS = [
  { href: "/matches", label: "All matches" },
  { href: "/my-bets", label: "My bets" },
  { href: "/login", label: "Log in" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-card/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-md bg-primary">
                <Zap className="size-5 text-primary-foreground" />
              </span>
              <span className="font-display text-lg font-extrabold">
                0DDS<span className="text-primary">.BET</span>
              </span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Esports odds and bet slips for CS2, Valorant, Dota 2, League of Legends and more.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-12 sm:grid-cols-3">
            <div>
              <h2 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">Betting</h2>
              <ul className="mt-4 space-y-2 text-sm">
                {LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-foreground/80 hover:text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">Games</h2>
              <ul className="mt-4 space-y-2 text-sm text-foreground/80">
                <li>Counter-Strike 2</li>
                <li>Valorant</li>
                <li>Dota 2</li>
                <li>League of Legends</li>
              </ul>
            </div>
            <div>
              <h2 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">Play safe</h2>
              <ul className="mt-4 space-y-2 text-sm text-foreground/80">
                <li>Play-money credits only</li>
                <li>18+ demo environment</li>
                <li>No real-money wagering</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p className="flex items-center gap-2">
            <Gamepad2 className="size-4 shrink-0" />
            0dds.bet is a demo. Balances and bets use virtual credits with no cash value, and odds are simulated.
          </p>
          <span className="font-display font-bold">18+ · PLAY RESPONSIBLY</span>
        </div>
      </div>
    </footer>
  );
}
