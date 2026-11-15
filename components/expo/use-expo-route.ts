"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useShell } from "@/components/shell/shell-context";
import { boothIds } from "@/lib/expo/data";
import { buildStudentRoute } from "@/lib/expo/route";
import { expoStore, useExpoState } from "@/lib/expo/store";

/** Percorso dello studente + azioni di navigazione. Usato da stage e dettaglio. */
export function useExpoRoute() {
  const { start, stepIndex: rawStep } = useExpoState();
  const router = useRouter();
  const { openDetail, setDetailOpen } = useShell();

  const route = useMemo(
    () => (start === null ? null : buildStudentRoute(boothIds, start)),
    [start],
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

  const selectStudent = useCallback(
    (n: number) => {
      const r = buildStudentRoute(boothIds, n);
      if (!r) return;
      expoStore.selectStudent(n);
      visit(r[0], 0);
    },
    [visit],
  );

  const clearStudent = useCallback(() => {
    expoStore.clearStudent();
    router.push("/expo");
  }, [router]);

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
