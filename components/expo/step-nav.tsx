"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCompany } from "@/lib/expo/data";
import { useExpoRoute } from "./use-expo-route";

/** Indietro / avanti tra i passi. `compact` = barra chiara sopra la mappa, altrimenti scura nel dettaglio. */
export function StepNav({ compact = false }: { compact?: boolean }) {
  const { route, stepIndex, currentBoothId, goToStep } = useExpoRoute();
  if (!route || currentBoothId === null) return null;

  const company = getCompany(currentBoothId);
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === route.length - 1;

  return (
    <div
      className={cn(
        "flex items-center gap-2 border p-2",
        compact
          ? "border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)] shadow-[4px_4px_0_var(--ink)]"
          : "border-white/25 bg-white/5 text-[var(--paper)]",
      )}
    >
      <Button
        type="button"
        variant="outline"
        className={cn(
          "size-12 shrink-0 rounded-none p-0 active:translate-y-0.5",
          compact
            ? "border-[var(--ink)] bg-transparent text-[var(--ink)] hover:bg-[var(--ink)]/10"
            : "border-white/30 bg-transparent text-[var(--paper)] hover:bg-white/10 hover:text-[var(--paper)]",
        )}
        disabled={isFirst}
        aria-label="Passo precedente"
        onClick={() => goToStep(stepIndex - 1)}
      >
        <ChevronLeft className="size-6" strokeWidth={1.5} />
      </Button>
      <div className="min-w-0 flex-1 text-center">
        <p
          className={cn(
            "text-[11px] font-semibold uppercase tracking-[0.18em]",
            compact ? "text-[var(--gray)]" : "text-[var(--gold)]",
          )}
        >
          {isLast ? `Ultimo passo (${stepIndex + 1}°)` : `${stepIndex + 1}° passo di ${route.length}`}
        </p>
        <p className="truncate text-base font-semibold">
          Booth {currentBoothId} · {company?.name}
        </p>
      </div>
      <Button
        type="button"
        className={cn(
          "size-12 shrink-0 rounded-none p-0 active:translate-y-0.5",
          compact
            ? "bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--ink)]/90"
            : "bg-[var(--gold)] text-[var(--ink)] hover:bg-[var(--gold)]/90",
        )}
        disabled={isLast}
        aria-label="Passo successivo"
        onClick={() => goToStep(stepIndex + 1)}
      >
        <ChevronRight className="size-6" strokeWidth={1.5} />
      </Button>
    </div>
  );
}
