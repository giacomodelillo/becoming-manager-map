"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ShellProvider, useShell } from "./shell-context";
import { MainStage } from "./main-stage";
import { DetailPanel } from "./detail-panel";
import { FloatingToolbar } from "./floating-toolbar";

export type AppShellProps = {
  /** Stage: la sezione principale arrotondata */
  children: ReactNode;
  /** Slot parallelo @detail: il pannello di sinistra */
  detail: ReactNode;
};

export function AppShell({ children, detail }: AppShellProps) {
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
  const { detailOpen } = useShell();

  return (
    <div className="bg-background text-foreground h-dvh w-full overflow-y-auto lg:overflow-hidden">
      <FloatingToolbar />

      <div
        data-detail={detailOpen ? "open" : "closed"}
        className="grid h-full grid-cols-1 lg:grid-cols-[0fr_1fr] lg:transition-[grid-template-columns] lg:duration-300 lg:ease-in-out lg:data-[detail=open]:grid-cols-[1fr_1fr]"
      >
        <DetailPanel>{detail}</DetailPanel>
        <MainStage>{children}</MainStage>
      </div>
    </div>
  );
}
