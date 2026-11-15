"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFairView } from "@/lib/expo/data-store";
import { useExpoRoute } from "./use-expo-route";

/** Selettore touch 1..N: nessuna tastiera. Il numero scelto è il booth di partenza. */
export function StudentPicker() {
  const { start, selectStudent, clearStudent } = useExpoRoute();
  const boothIds = useFairView()?.boothIds ?? [];

  return (
    <section aria-labelledby="student-title" className="space-y-3">
      <div className="flex items-end justify-between gap-2">
        <div className="space-y-1">
          <p className="expo-eyebrow">Studente</p>
          <h2 id="student-title" className="expo-serif text-2xl">
            Il tuo numero
          </h2>
          <p className="text-sm text-[var(--paper)]/70">Tocca il numero da cui parte il tuo giro.</p>
        </div>
        {start !== null && (
          <Button
            type="button"
            variant="ghost"
            className="h-12 rounded-none px-4 text-[var(--paper)] hover:bg-white/10 hover:text-[var(--paper)]"
            onClick={clearStudent}
          >
            Azzera
          </Button>
        )}
      </div>
      <div role="group" aria-labelledby="student-title" className="grid grid-cols-5 gap-2 sm:grid-cols-6">
        {boothIds.map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={start === n}
            onClick={() => selectStudent(n)}
            className={cn(
              "expo-serif h-12 border text-xl transition active:translate-y-0.5",
              start === n
                ? "border-[var(--gold)] bg-[var(--gold)] text-[var(--ink)]"
                : "border-white/25 bg-white/5 active:bg-white/15",
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </section>
  );
}
