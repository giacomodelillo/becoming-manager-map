"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { timerClient } from "@/lib/timer/client";
import { getPosition } from "@/lib/timer/logic";
import type { Segment, TimerState } from "@/lib/timer/types";

export const timerActions = {
  start: () => timerClient.send({ type: "start" }),
  pause: () => timerClient.send({ type: "pause" }),
  reset: () => timerClient.send({ type: "reset" }),
  next: () => timerClient.send({ type: "next" }),
  previous: () => timerClient.send({ type: "previous" }),
  setSequence: (segments: Segment[]) =>
    timerClient.send({ type: "setSequence", segments }),
  /** Timer singolo: sostituisce la sequenza con una sola fase. */
  setDuration: (durationMs: number) =>
    timerClient.send({
      type: "setSequence",
      segments: [{ id: "main", label: "", durationMs }],
    }),
  adjust: (deltaMs: number) => timerClient.send({ type: "adjust", deltaMs }),
};

/** Stato condiviso + azioni. Si può usare in più componenti: la connessione è una sola. */
export function useTimerState() {
  const snapshot = useSyncExternalStore(
    timerClient.subscribe,
    timerClient.getSnapshot,
    timerClient.getServerSnapshot,
  );
  return { ...snapshot, ...timerActions };
}

/** Secondi rimanenti nella fase corrente, aggiornati mentre il timer è in corso. */
export function useRemainingSeconds(state: TimerState) {
  const [clock, setClock] = useState(0);

  useEffect(() => {
    if (state.status !== "running") return;
    const id = setInterval(() => setClock(timerClient.getServerNow()), 100);
    return () => clearInterval(id);
  }, [state.status, state.startedAt]);

  const position = getPosition(state, clock);

  return {
    seconds: Math.ceil(position.remainingMs / 1000),
    /** true quando l'intera sequenza è terminata. */
    isFinished: position.finished,
    /** Indice della fase corrente. */
    index: position.index,
  };
}
