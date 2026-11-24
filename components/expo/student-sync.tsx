"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useFairView } from "@/lib/expo/data-store";
import { expoStore, readSavedStudent } from "@/lib/expo/store";

/**
 * Sul telefono: il numero arriva dal QR (/expo?s=3) oppure dal browser (se si ricarica la pagina).
 * Non apre nessuna azienda: imposta solo il percorso.
 */
export function StudentSync() {
  const view = useFairView();
  const fromUrl = useSearchParams().get("s");
  const done = useRef(false);

  useEffect(() => {
    if (!view || done.current) return;
    done.current = true;
    const fromQr = fromUrl ? Number(fromUrl) : NaN;
    if (Number.isInteger(fromQr) && view.boothIds.includes(fromQr)) {
      expoStore.selectStudent(fromQr);
      return;
    }
    const saved = readSavedStudent();
    if (saved !== null && view.boothIds.includes(saved) && expoStore.getState().start === null) {
      expoStore.selectStudent(saved);
    }
  }, [view, fromUrl]);

  return null;
}
