import { Coins, LogOut } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { logoutAction } from "@/features/auth/actions";
import { getWalletBalance } from "@/features/betting/queries";
import { formatCredits } from "@/features/betting/match";
import { getCurrentUser } from "@/lib/auth/dal";

export async function HeaderAccount() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <>
        <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          Log in
        </Link>
        <Link href="/register" className={buttonVariants({ size: "sm" })}>
          Sign up
        </Link>
      </>
    );
  }

  const balance = await getWalletBalance();

  return (
    <>
      {balance !== null && (
        <Link
          href="/my-bets"
          aria-label={`Wallet: ${formatCredits(balance)}`}
          className="hidden items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-display text-xs font-bold text-accent sm:inline-flex"
        >
          <Coins className="size-3.5" />
          {formatCredits(balance)}
        </Link>
      )}
      <Link
        href="/account"
        className="flex h-8 items-center gap-2 rounded-md pr-2 font-display text-xs font-bold hover:bg-secondary/60"
      >
        <span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground">
          {user.name.slice(0, 1).toUpperCase()}
        </span>
        <span className="hidden max-w-32 truncate md:inline">{user.name}</span>
      </Link>
      <form action={logoutAction}>
        <button type="submit" className={buttonVariants({ variant: "ghost", size: "sm", className: "px-2" })} aria-label="Log out">
          <LogOut className="size-4" />
        </button>
      </form>
    </>
  );
}
