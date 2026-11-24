"use client";

import { Suspense, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ShellProvider, useShell } from "./shell-context";
import { MainStage } from "./main-stage";
import { DetailPanel } from "./detail-panel";
import { FloatingToolbar } from "./floating-toolbar";
import { cn } from "@/lib/utils";
import { DetailBackdrop } from "./detail-backdrop";
import { DetailPeek } from "./detail-peek";

export type AppShellProps = {
  /** Stage: la sezione principale arrotondata */
  children: ReactNode;
  /** Slot parallelo @detail: il pannello di sinistra */
  detail: ReactNode;
};

export function AppShell(props: AppShellProps) {
  return (
    <Suspense fallback={null}>
      <AppShellInner {...props} />
    </Suspense>
  );
}

function AppShellInner({ children, detail }: AppShellProps) {
  const pathname = usePathname();

  return (
    <ShellProvider defaultDetailOpen={pathname !== "/"}>
      <TooltipProvider delay={150}>
        <ShellFrame detail={detail}>{children}</ShellFrame>
      </TooltipProvider>
    </ShellProvider>
  );
}

function ShellFrame({ children, detail }: AppShellProps) {
  const { detailOpen, sheetOpen } = useShell();

  return (
    <div
      className={cn(
        "bg-background text-foreground h-dvh w-full overflow-y-auto lg:overflow-hidden",
        // con il pannello aperto su mobile la pagina dietro non scorre
        sheetOpen && "max-lg:overflow-hidden",
      )}
    >
      <FloatingToolbar />

      {/* su desktop la riga ha l'altezza dello schermo (minmax(0,1fr)): senza, il pannello cresce
          oltre lo schermo e la parte in basso viene tagliata invece di scorrere */}
      <div
        data-detail={detailOpen ? "open" : "closed"}
        className="grid h-full grid-cols-1 lg:grid-cols-[0fr_1fr] lg:grid-rows-[minmax(0,1fr)] lg:transition-[grid-template-columns] lg:duration-300 lg:ease-in-out lg:data-[detail=open]:grid-cols-[1fr_1fr]"
      >
        <DetailPanel>{detail}</DetailPanel>
        <MainStage>{children}</MainStage>
      </div>

      <DetailBackdrop />
      <DetailPeek />
    </div>
  );
}
