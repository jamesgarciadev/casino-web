"use client";

import { Plus } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { topUpWalletAction } from "./actions";
import { formatCredits } from "./match";

export function TopUpButton() {
  const [pending, startTransition] = useTransition();

  const topUp = () =>
    startTransition(async () => {
      const result = await topUpWalletAction();

      if ("message" in result) {
        toast.error(result.message);
        return;
      }

      toast.success(`Topped up. Balance ${formatCredits(result.balance)}.`);
    });

  return (
    <Button variant="ember" size="lg" onClick={topUp} disabled={pending}>
      <Plus className="size-5" />
      {pending ? "Topping up…" : "Top up +500 CR"}
    </Button>
  );
}
