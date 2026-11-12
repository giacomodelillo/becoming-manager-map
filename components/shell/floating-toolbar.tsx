"use client";

import { House, Maximize, Minimize, Timer } from "lucide-react";
import { useRouter } from "next/navigation";
import { ToolbarButton } from "./toolbar-button";
import { useShell } from "./shell-context";

export function FloatingToolbar() {
  const router = useRouter();
  const { detailOpen, setDetailOpen, toggleDetail } = useShell();

  return (
    <div className="bg-stage/80 border-foreground/5 fixed right-6 top-6 z-50 flex items-center gap-1 rounded-2xl border p-1.5 backdrop-blur">
      <ToolbarButton
        label="Home"
        icon={House}
        onClick={() => router.push("/")}
      />
      <ToolbarButton
        label="Timer"
        icon={Timer}
        onClick={() => {
          setDetailOpen(true);
          router.push("/timer");
        }}
      />
      <span className="bg-foreground/10 mx-0.5 h-5 w-px" />
      <ToolbarButton
        label={detailOpen ? "Nascondi dettaglio" : "Mostra dettaglio"}
        icon={detailOpen ? Maximize : Minimize}
        onClick={toggleDetail}
      />
    </div>
  );
}
