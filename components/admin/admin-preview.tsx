"use client";

import { useMemo } from "react";
import { FlowMapView } from "@/components/expo/flow-map";
import { MapCanvas } from "@/components/expo/map-canvas";
import { useShell } from "@/components/shell/shell-context";
import { adminStore, useAdminState } from "@/lib/expo/admin-store";
import { useFairView } from "@/lib/expo/data-store";
import { deriveFairView, layoutSignature } from "@/lib/expo/derive";

/**
 * Anteprima della mappa nello stage. Mostra la bozza in modifica;
 * prima dell'accesso con PIN mostra i dati pubblici. Toccando un booth si apre il suo modulo.
 */
export function AdminPreview() {
  const { openDetail } = useShell();
  const { draft, openKey } = useAdminState();
  const published = useFairView();

  const view = useMemo(() => {
    if (!draft) return published;
    try {
      return deriveFairView(draft);
    } catch {
      return published;
    }
  }, [draft, published]);

  // il numero del booth è la posizione dell'azienda nell'ordine globale
  const keys = useMemo(() => draft?.areas.flatMap((a) => a.companies.map((c) => c.key)) ?? [], [draft]);
  const selectedId = openKey && keys.includes(openKey) ? keys.indexOf(openKey) + 1 : null;

  const onOpen = (boothId: number) => {
    const key = keys[boothId - 1];
    if (!key) return;
    adminStore.setOpenKey(key);
    openDetail();
  };

  return (
    <div className="relative h-full w-full">
      <MapCanvas refitKey={layoutSignature(view)}>
        {view ? (
          <FlowMapView
            view={view}
            selectedId={selectedId}
            route={null}
            stepIndex={-1}
            currentBoothId={null}
            onOpen={onOpen}
            asButtons
          />
        ) : (
          <p className="p-12 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--gray)]">
            Caricamento mappa…
          </p>
        )}
      </MapCanvas>
      <p className="pointer-events-none absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-3 z-10 border border-[var(--ink)] bg-[var(--paper)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ink)] shadow-[3px_3px_0_var(--ink)]">
        Anteprima<span className="hidden sm:inline"> · tocca un booth per modificarlo</span>
      </p>
    </div>
  );
}
