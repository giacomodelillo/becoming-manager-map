"use client";

import { WifiOff } from "lucide-react";
import { useFairData } from "@/lib/expo/data-store";

/** Segnala che si stanno usando gli ultimi dati salvati perché il server non risponde. */
export function OfflineBadge() {
  const { offline } = useFairData();
  if (!offline) return null;
  return (
    <p
      role="status"
      className="pointer-events-none absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-3 z-10 flex items-center gap-2 border border-[var(--ink)] bg-[var(--paper)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ink)] shadow-[3px_3px_0_var(--ink)]"
    >
      <WifiOff className="size-4" strokeWidth={1.5} aria-hidden />
      Dati non aggiornati
    </p>
  );
}
