"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useShell } from "@/components/shell/shell-context";
import { useFairView } from "@/lib/expo/data-store";
import { buildStudentRoute } from "@/lib/expo/route";
import { expoStore, useExpoState } from "@/lib/expo/store";

/** Percorso dello studente + azioni di navigazione. Usato da stage e dettaglio. */
export function useExpoRoute() {
  const { start, stepIndex: rawStep } = useExpoState();
  const view = useFairView();
  const router = useRouter();
  const { openDetail, setDetailOpen } = useShell();

  const route = useMemo(
    () => (start === null || !view ? null : buildStudentRoute(view.boothIds, start)),
    [start, view],
  );
  const total = route?.length ?? 0;
  const stepIndex = route ? Math.min(Math.max(rawStep, 0), total - 1) : -1;
  const currentBoothId = route ? route[stepIndex] : null;

  // Navigazione tra schermate: solo setDetailOpen(true), il pannello mobile resta com'è
  const visit = useCallback(
    (boothId: number, index: number) => {
      expoStore.setStep(index);
      expoStore.focusBooth(boothId);
      setDetailOpen(true);
      router.push(`/expo/${boothId}`);
    },
    [router, setDetailOpen],
  );

  const goToStep = useCallback(
    (index: number) => {
      if (!route) return;
      const i = Math.min(Math.max(index, 0), route.length - 1);
      visit(route[i], i);
    },
    [route, visit],
  );

  // Scegliere il proprio numero imposta solo il percorso: nessuna azienda viene
  // selezionata, nessuna navigazione, il pannello dettaglio resta com'è.
  const selectStudent = useCallback(
    (n: number) => {
      if (!view || !view.boothIds.includes(n)) return;
      expoStore.selectStudent(n);
    },
    [view],
  );

  const clearStudent = useCallback(() => {
    expoStore.clearStudent();
  }, []);

  // Tap su un booth/azienda: la navigazione la fa il <Link>, qui stato e dettaglio
  const openBooth = useCallback(
    (boothId: number) => {
      if (route) {
        const i = route.indexOf(boothId);
        if (i !== -1) expoStore.setStep(i);
      }
      openDetail();
    },
    [route, openDetail],
  );

  return {
    start,
    route,
    total,
    stepIndex,
    currentBoothId,
    goToStep,
    selectStudent,
    clearStudent,
    openBooth,
  };
}
