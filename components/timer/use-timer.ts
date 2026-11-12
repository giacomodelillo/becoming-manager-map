"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { timerClient } from "@/lib/timer/client";
import { getRemainingMs } from "@/lib/timer/logic";
import type { TimerState } from "@/lib/timer/types";

export const timerActions = {
  start: () => timerClient.send({ type: "start" }),
  pause: () => timerClient.send({ type: "pause" }),
  reset: () => timerClient.send({ type: "reset" }),
  setDuration: (durationMs: number) =>
    timerClient.send({ type: "setDuration", durationMs }),
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

/** Secondi rimanenti, aggiornati mentre il timer è in corso. */
export function useRemainingSeconds(state: TimerState) {
  const [clock, setClock] = useState(0);

  useEffect(() => {
    if (state.status !== "running") return;
    const id = setInterval(() => setClock(timerClient.getServerNow()), 100);
    return () => clearInterval(id);
  }, [state.status, state.startedAt]);

  const remainingMs = getRemainingMs(state, clock);

  return {
    seconds: Math.ceil(remainingMs / 1000),
    isFinished: remainingMs === 0,
  };
}
