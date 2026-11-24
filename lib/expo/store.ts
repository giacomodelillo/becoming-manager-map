import { useSyncExternalStore } from "react";
import { KIOSK } from "./kiosk";

export type ExpoState = {
  /** Numero di partenza dello studente (null = nessun percorso) */
  start: number | null;
  /** Indice del passo corrente nel percorso (0-based) */
  stepIndex: number;
  /** Richiesta di centrare la mappa su un booth; `nonce` cambia a ogni richiesta */
  focus: { boothId: number; nonce: number } | null;
  /** Cresce a ogni reset: la mappa torna alla vista iniziale */
  viewNonce: number;
};

const STORAGE_KEY = "expo:student";
const INITIAL: ExpoState = { start: null, stepIndex: 0, focus: null, viewNonce: 0 };

let state: ExpoState = INITIAL;
let nonce = 0;
const listeners = new Set<() => void>();

function set(next: ExpoState) {
  state = next;
  listeners.forEach((l) => l());
}

/** Sul telefono il numero resta anche dopo un ricaricamento. Sul totem no: ogni studente riparte da zero. */
function persist(start: number | null) {
  if (KIOSK) return;
  try {
    if (start === null) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, String(start));
  } catch {
    /* archivio non disponibile: pazienza */
  }
}

export function readSavedStudent(): number | null {
  if (KIOSK) return null;
  try {
    const n = Number(localStorage.getItem(STORAGE_KEY));
    return Number.isInteger(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
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
    persist(start);
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
    persist(null);
  },
  reset() {
    set({ ...INITIAL, viewNonce: state.viewNonce + 1 });
    persist(null);
  },
};

export function useExpoState(): ExpoState {
  return useSyncExternalStore(expoStore.subscribe, expoStore.getState, () => INITIAL);
}
