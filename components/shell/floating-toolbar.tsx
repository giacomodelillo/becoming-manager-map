"use client";

import { Maximize, Minimize } from "lucide-react";
import { ToolbarButton } from "./toolbar-button";
import { useShell } from "./shell-context";

export function FloatingToolbar() {
  const { detailOpen, toggleDetail } = useShell();

  return (
    <div className="bg-stage/80 border-foreground/5 fixed right-6 top-6 z-50 flex items-center gap-1 rounded-2xl border p-1.5 backdrop-blur">
      <ToolbarButton
        label={detailOpen ? "Nascondi dettaglio" : "Mostra dettaglio"}
        icon={detailOpen ? Maximize : Minimize}
        onClick={toggleDetail}
      />
    </div>
  );
}
