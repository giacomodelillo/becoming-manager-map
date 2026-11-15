"use client";

import { cn } from "@/lib/utils";
import { useShell } from "./shell-context";

/** Velo scuro dietro il pannello mobile: un tap lo chiude. Non esiste su desktop. */
export function DetailBackdrop() {
  const { sheetOpen, setSheetOpen } = useShell();

  return (
    <div
      aria-hidden
      onClick={() => setSheetOpen(false)}
      className={cn(
        "fixed inset-0 z-[60] touch-none bg-black/50 transition-opacity duration-300 lg:hidden",
        sheetOpen ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    />
  );
}
