"use client";

import { cn } from "@/lib/cn";

import { useLiveStatus } from "./live-matches";

const LABELS = { live: "Live updates on", connecting: "Connecting…", offline: "Refreshing every 10s" } as const;

/** Shows whether scores and odds are being pushed or polled. */
export function LiveStatus() {
  const status = useLiveStatus();

  return (
    <span role="status" className="inline-flex items-center gap-2 font-display text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
      <span
        className={cn(
          "size-2 rounded-full",
          status === "live" && "live-dot bg-live",
          status === "connecting" && "bg-accent",
          status === "offline" && "bg-muted-foreground",
        )}
      />
      {LABELS[status]}
    </span>
  );
}
