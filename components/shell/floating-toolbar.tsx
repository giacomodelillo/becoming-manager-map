"use client";

import { House, LayoutGrid, Maximize, Minimize, Timer } from "lucide-react";
import { useRouter } from "next/navigation";
import { ToolbarButton } from "./toolbar-button";
import { useShell } from "./shell-context";

export function FloatingToolbar() {
  const router = useRouter();
  const { detailOpen, setDetailOpen, toggleDetail } = useShell();

  return (
    <div className="bg-stage/80 border-foreground/5 fixed top-[max(1rem,env(safe-area-inset-top))] right-4 z-50 flex items-center gap-1 rounded-2xl border p-1.5 backdrop-blur lg:top-6 lg:right-6">
      <ToolbarButton
        label="Home"
        icon={House}
        onClick={() => router.push("/")}
      />
      <ToolbarButton
        label="Timer"
        icon={Timer}
        onClick={() => {
          // solo la colonna desktop: su mobile il pannello resta chiuso e il timer visibile
          setDetailOpen(true);
          router.push("/timer");
        }}
      />
      {/*<ToolbarButton
        label="Expo"
        icon={LayoutGrid}
        onClick={() => {
          setDetailOpen(true);
          router.push("/expo");
        }}
      />*/}

      {/* mostra/nascondi la colonna laterale: ha senso solo su desktop */}
      <div className="hidden items-center gap-1 lg:flex">
        <span className="bg-foreground/10 mx-0.5 h-5 w-px" />
        <ToolbarButton
          label={detailOpen ? "Nascondi dettaglio" : "Mostra dettaglio"}
          icon={detailOpen ? Maximize : Minimize}
          onClick={toggleDetail}
        />
      </div>
    </div>
  );
}
