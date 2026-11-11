"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useShell } from "./shell-context";

export function DetailPanel({ children }: { children?: ReactNode }) {
  const { detailOpen } = useShell();

  return (
    <aside
      inert={!detailOpen}
      aria-hidden={!detailOpen}
      className={cn(
        "order-2 min-w-0 overflow-hidden lg:order-1",
        !detailOpen && "max-lg:hidden",
      )}
    >
      {/* larghezza fissa su lg: il testo non si "riflowa" durante l'animazione */}
      <div className="h-full overflow-y-auto px-6 pb-24 pt-6 lg:w-[50vw] lg:px-8">
        {children}
      </div>
    </aside>
  );
}
