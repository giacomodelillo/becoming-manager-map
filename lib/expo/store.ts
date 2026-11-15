import { useSyncExternalStore } from "react";

export type ExpoState = {
  /** Numero di partenza dello studente (null = nessun percorso) */
  start: number | null;
  /** Indice del passo corrente nel percorso (0-based) */
  stepIndex: number;
  /** Richiesta di centrare la mappa su un booth; `nonce` cambia a ogni richiesta */
  focus: { boothId: number; nonce: number } | null;
};

const INITIAL: ExpoState = { start: null, stepIndex: 0, focus: null };

let state: ExpoState = INITIAL;
let nonce = 0;
const listeners = new Set<() => void>();

function set(next: ExpoState) {
  state = next;
  listeners.forEach((l) => l());
}

export const expoStore = {
  getState: (): ExpoState => state,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  selectStudent(start: number) {
    set({ ...state, start, stepIndex: 0 });
  },
  setStep(stepIndex: number) {
    if (stepIndex !== state.stepIndex) set({ ...state, stepIndex });
  },
  focusBooth(boothId: number) {
    nonce += 1;
    set({ ...state, focus: { boothId, nonce } });
  },
  clearStudent() {
    set({ ...state, start: null, stepIndex: 0 });
  },
  reset() {
    set(INITIAL);
  },
};

export function useExpoState(): ExpoState {
  return useSyncExternalStore(expoStore.subscribe, expoStore.getState, expoStore.getState);
}
