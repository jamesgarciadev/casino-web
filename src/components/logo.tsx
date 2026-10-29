import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="Casino home">
      <span className="grid size-8 place-items-center rounded-lg bg-accent text-sm font-black text-accent-fg">C</span>
      <span className="display text-lg">
        Casino<span className="text-accent">.</span>
      </span>
    </Link>
  );
}
