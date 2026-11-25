"use client";

import { Maximize2, Minus, Plus } from "lucide-react";
import { useControls } from "react-zoom-pan-pinch";

const BTN =
  "flex size-10 lg:size-12 items-center justify-center border border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)] shadow-[3px_3px_0_var(--ink)] transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_var(--ink)]";

export function MapControls({ onFit }: { onFit: () => void }) {
  const { zoomIn, zoomOut } = useControls();
  return (
    <div className="absolute right-3 top-[calc(50%-36px)] z-10 flex -translate-y-1/2 flex-col gap-2.5 lg:top-1/2 lg:gap-3">
      <button
        type="button"
        aria-label="Ingrandisci"
        className={BTN}
        onClick={() => zoomIn(0.5)}
      >
        <Plus className="size-5 lg:size-6" strokeWidth={1.5} />
      </button>
      <button
        type="button"
        aria-label="Riduci"
        className={BTN}
        onClick={() => zoomOut(0.5)}
      >
        <Minus className="size-5 lg:size-6" strokeWidth={1.5} />
      </button>
      <button
        type="button"
        aria-label="Mostra tutta la mappa"
        className={BTN}
        onClick={onFit}
      >
        <Maximize2 className="size-4 lg:size-5" strokeWidth={1.5} />
      </button>
    </div>
  );
}
