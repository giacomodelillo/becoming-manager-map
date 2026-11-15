"use client";

import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useShell } from "./shell-context";
import { useMediaQuery } from "./use-media-query";
import { useSheetDrag } from "./use-sheet-drag";

/**
 * Un solo elemento, due layout (niente contenuto duplicato):
 * - da lg in su: colonna laterale della griglia
 * - sotto lg: pannello fisso che sale dal basso
 */
export function DetailPanel({ children }: { children?: ReactNode }) {
  const { detailOpen, sheetOpen, setSheetOpen } = useShell();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const ref = useRef<HTMLElement>(null);

  const close = () => setSheetOpen(false);
  const { offset, handlers } = useSheetDrag({ onClose: close });

  const open = isDesktop ? detailOpen : sheetOpen;

  // mobile: Esc chiude, e il focus entra nel pannello quando si apre
  useEffect(() => {
    if (isDesktop || !sheetOpen) return;
    ref.current?.focus({ preventScroll: true });

    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setSheetOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isDesktop, sheetOpen, setSheetOpen]);

  const onHandleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      close();
    }
  };

  return (
    <aside
      ref={ref}
      tabIndex={-1}
      inert={!open}
      aria-label="Dettagli"
      style={
        offset !== null
          ? { translate: `0 ${offset}px`, transition: "none" }
          : undefined
      }
      className={cn(
        "min-w-0 overflow-hidden outline-none lg:order-1",
        // mobile: pannello dal basso
        "max-lg:bg-background max-lg:border-foreground/10 max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:z-[70] max-lg:flex max-lg:h-[88dvh] max-lg:flex-col max-lg:rounded-t-3xl max-lg:border-t",
        "max-lg:transition-transform max-lg:duration-300 max-lg:ease-[cubic-bezier(0.32,0.72,0,1)]",
        sheetOpen ? "max-lg:translate-y-0" : "max-lg:translate-y-full",
      )}
    >
      {/* maniglia: trascina verso il basso o tocca per chiudere */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Chiudi i dettagli"
        onKeyDown={onHandleKeyDown}
        {...handlers}
        className="flex h-10 shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing lg:hidden"
      >
        <span className="bg-foreground/20 h-1 w-9 rounded-full" />
      </div>

      {/* larghezza fissa su lg: il testo non si "riflowa" durante l'animazione */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-2 pb-[calc(env(safe-area-inset-bottom)+4rem)] lg:h-full lg:w-[50vw] lg:flex-none lg:px-8 lg:pt-6 lg:pb-24">
        {children}
      </div>
    </aside>
  );
}
