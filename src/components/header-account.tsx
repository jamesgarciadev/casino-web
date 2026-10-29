import Link from "next/link";

import { logoutAction } from "@/features/auth/actions";
import { getCurrentUser } from "@/lib/auth/dal";

export async function HeaderAccount() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <>
        <Link href="/login" className="btn btn-ghost">
          Log in
        </Link>
        <Link href="/register" className="btn btn-accent">
          Sign up
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        href="/account"
        className="flex h-10 items-center gap-2 rounded-lg bg-surface-3 pl-1 pr-3 text-sm font-semibold hover:bg-[#2a3347]"
      >
        <span className="grid size-8 place-items-center rounded-md bg-accent text-xs font-black text-accent-fg">
          {user.name.slice(0, 1).toUpperCase()}
        </span>
        <span className="hidden max-w-32 truncate sm:inline">{user.name}</span>
      </Link>
      <form action={logoutAction}>
        <button type="submit" className="btn btn-ghost px-3" aria-label="Log out">
          Exit
        </button>
      </form>
    </>
  );
}
