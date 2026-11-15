"use client";

import { useEffect, useRef } from "react";
import { useControls } from "react-zoom-pan-pinch";
import { useExpoState } from "@/lib/expo/store";

/** Centra la mappa sul booth richiesto dallo store (passo successivo/precedente, scelta studente). */
export function FocusOnStep() {
  const { focus } = useExpoState();
  const controls = useControls();
  const controlsRef = useRef(controls);
  useEffect(() => {
    controlsRef.current = controls;
  });

  // le richieste già presenti al montaggio non si rieseguono
  const seen = useRef(focus?.nonce ?? 0);

  useEffect(() => {
    if (!focus || focus.nonce === seen.current) return;
    seen.current = focus.nonce;
    const el = document.getElementById(`booth-${focus.boothId}`);
    if (el) controlsRef.current.zoomToElement(el, 1.1, 500);
  }, [focus]);

  return null;
}
