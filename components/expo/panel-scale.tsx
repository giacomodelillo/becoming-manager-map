"use client";

import type { ReactNode } from "react";
import { panelZoom } from "@/lib/expo/display";
import { useFairView } from "@/lib/expo/data-store";

/** Ingrandisce il contenuto del pannello dettaglio secondo la grandezza scelta in area riservata. */
export function PanelScale({ children, className }: { children: ReactNode; className?: string }) {
  const zoom = panelZoom(useFairView()?.display.panelSize ?? "standard");
  return (
    <div className={className} style={zoom === 1 ? undefined : { zoom }}>
      {children}
    </div>
  );
}
