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
          <p className="text-sm text-[var(--paper)]/70">
            Tocca il numero da cui parte il tuo giro.
          </p>
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
      {/*<div role="group" aria-labelledby="student-title" className="grid grid-cols-5 gap-2 sm:grid-cols-6">
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
      </div>*/}
      <div
        role="group"
        aria-labelledby="student-title"
        className="flex items-center justify-between border-y border-white/20 py-3"
      >
        <button
          type="button"
          onClick={() => {
            const idx = boothIds.indexOf(start);
            if (idx > 0) selectStudent(boothIds[idx - 1]);
          }}
          disabled={boothIds.indexOf(start) <= 0}
          aria-label="Precedente"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white/80 transition active:scale-95 disabled:opacity-20"
        >
          ←
        </button>

        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[var(--gold)]">
            Postazione
          </span>
          <span className="expo-serif text-4xl text-white">
            {String(start).padStart(2, "0")}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            const idx = boothIds.indexOf(start);
            if (idx < boothIds.length - 1) selectStudent(boothIds[idx + 1]);
          }}
          disabled={boothIds.indexOf(start) >= boothIds.length - 1}
          aria-label="Successivo"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white/80 transition active:scale-95 disabled:opacity-20"
        >
          →
        </button>
      </div>
    </section>
  );
}
