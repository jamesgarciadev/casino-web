"use client";

import { useState, type ReactNode } from "react";

import { cn } from "@/lib/cn";

/** Briefly highlights its content whenever `value` changes after the first render (live scores and prices). */
export function Flash({ value, className, children }: { value: string | number; className?: string; children: ReactNode }) {
  const [initial] = useState(value);

  return (
    <span key={value} className={cn("rounded-sm", value !== initial && "flash", className)}>
      {children}
    </span>
  );
}
