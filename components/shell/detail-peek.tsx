"use client";

import { useRef } from "react";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useShell } from "./shell-context";

const SWIPE_UP_PX = 16;

/** Pillola in basso che apre il pannello dettagli: tap oppure swipe verso l'alto. Solo mobile. */
export function DetailPeek() {
  const { sheetOpen, setSheetOpen } = useShell();
  const startY = useRef<number | null>(null);

  const reset = () => {
    startY.current = null;
  };

  return (
    <button
      type="button"
      aria-label="Mostra i dettagli"
      aria-expanded={sheetOpen}
      tabIndex={sheetOpen ? -1 : 0}
      onClick={() => setSheetOpen(true)}
      onPointerDown={(e) => {
        startY.current = e.clientY;
      }}
      onPointerMove={(e) => {
        if (
          startY.current !== null &&
          startY.current - e.clientY > SWIPE_UP_PX
        ) {
          reset();
          setSheetOpen(true);
        }
      }}
      onPointerUp={reset}
      onPointerCancel={reset}
      className={cn(
        "bg-background border-foreground/10 text-foreground/80 fixed left-1/2 z-30 flex h-11 -translate-x-1/2 touch-none items-center gap-1.5 rounded-full border px-4 text-sm font-medium  transition-[opacity,scale] duration-300 lg:hidden",
        "bottom-[max(1rem,env(safe-area-inset-bottom))]",
        sheetOpen && "pointer-events-none scale-95 opacity-0",
      )}
    >
      <ChevronUp className="size-4" />
      Dettagli
    </button>
  );
}
