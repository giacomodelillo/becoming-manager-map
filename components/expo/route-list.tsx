"use client";

import { cn } from "@/lib/utils";
import { useFairView } from "@/lib/expo/data-store";
import { useExpoRoute } from "./use-expo-route";

/** Elenco dei passi (1°, 2°, ...) del percorso studente; toccando un passo si salta lì. */
export function RouteList() {
  const { route, stepIndex, goToStep } = useExpoRoute();
  const view = useFairView();
  if (!route) return null;

  return (
    <section aria-labelledby="route-title" className="space-y-3">
      <div className="space-y-1">
        <p className="expo-eyebrow">Percorso</p>
        <h2 id="route-title" className="expo-serif text-2xl">
          I tuoi passi
        </h2>
      </div>
      <ol className="space-y-2">
        {route.map((id, i) => {
          const company = view?.byId.get(id);
          const current = i === stepIndex;
          return (
            <li key={id}>
              <button
                type="button"
                aria-current={current ? "step" : undefined}
                onClick={() => goToStep(i)}
                className={cn(
                  "flex min-h-12 w-full items-center gap-3 border px-3 py-2 text-left transition active:translate-y-0.5",
                  current
                    ? "border-[var(--gold)] bg-[var(--gold)] text-[var(--ink)]"
                    : i < stepIndex
                      ? "border-white/10 text-white/40"
                      : "border-white/20 bg-white/5",
                )}
              >
                <span className="expo-serif w-9 shrink-0 text-xl">{i + 1}°</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{company?.name}</span>
                  <span className="block text-xs opacity-70">Postazione {id}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
