"use client";

import { StepNav } from "./step-nav";

/** Barra passi sopra la mappa: serve su mobile, dove il pannello dettaglio parte chiuso. */
export function StepControls() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[calc(max(1rem,env(safe-area-inset-bottom))_+_4.5rem)] z-10 flex justify-center px-3 lg:bottom-4">
      <div className="pointer-events-auto w-full max-w-md">
        <StepNav compact />
      </div>
    </div>
  );
}
