import { useSyncExternalStore } from "react";
import type { FairConfig } from "./types";

/**
 * Stato dell'area riservata condiviso tra i due slot:
 * il dettaglio (impostazioni) scrive la bozza, lo stage (anteprima) la legge.
 */
export type AdminState = {
  draft: FairConfig | null;
  saved: FairConfig | null;
  version: number;
  /** Azienda aperta nel modulo (chiave), evidenziata nell'anteprima */
  openKey: string | null;
  /** Bozze precedenti, per "Annulla" */
  past: FairConfig[];
  /** Bozze annullate, per "Ripristina" */
  future: FairConfig[];
  lastEditAt: number;
};

/** push = nuovo punto di annullamento; coalesce = i testi scritti di seguito contano come uno; skip = nessuno */
export type HistoryMode = "push" | "coalesce" | "skip";

const MAX_HISTORY = 50;
const COALESCE_MS = 1000;

const EMPTY: AdminState = {
  draft: null,
  saved: null,
  version: 0,
  openKey: null,
  past: [],
  future: [],
  lastEditAt: 0,
};

let state: AdminState = EMPTY;
const listeners = new Set<() => void>();

function set(next: AdminState) {
  state = next;
  listeners.forEach((l) => l());
}

export const adminStore = {
  getState: (): AdminState => state,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  load(config: FairConfig, version: number) {
    set({ ...EMPTY, draft: config, saved: config, version });
  },
  setDraft(draft: FairConfig, mode: HistoryMode = "push") {
    if (!state.draft || draft === state.draft) return;
    const now = Date.now();
    const shouldPush = mode === "push" || (mode === "coalesce" && now - state.lastEditAt > COALESCE_MS);
    set({
      ...state,
      draft,
      past: shouldPush ? [...state.past, state.draft].slice(-MAX_HISTORY) : state.past,
      future: mode === "skip" ? state.future : [],
      lastEditAt: mode === "coalesce" ? now : 0,
    });
  },
  /** Salva la bozza attuale come punto di annullamento (es. all'inizio di un trascinamento). */
  snapshot() {
    if (!state.draft) return;
    set({ ...state, past: [...state.past, state.draft].slice(-MAX_HISTORY), future: [], lastEditAt: 0 });
  },
  undo() {
    if (!state.draft || state.past.length === 0) return;
    const previous = state.past[state.past.length - 1];
    set({
      ...state,
      draft: previous,
      past: state.past.slice(0, -1),
      future: [state.draft, ...state.future],
      lastEditAt: 0,
    });
  },
  redo() {
    if (!state.draft || state.future.length === 0) return;
    const [next, ...rest] = state.future;
    set({ ...state, draft: next, past: [...state.past, state.draft], future: rest, lastEditAt: 0 });
  },
  setOpenKey(openKey: string | null) {
    set({ ...state, openKey });
  },
  markSaved(config: FairConfig, version: number) {
    set({ ...state, draft: config, saved: config, version });
  },
  /** Torna all'ultima versione salvata (si può annullare). */
  discard() {
    if (!state.saved || !state.draft) return;
    set({
      ...state,
      draft: state.saved,
      openKey: null,
      past: [...state.past, state.draft].slice(-MAX_HISTORY),
      future: [],
      lastEditAt: 0,
    });
  },
  clear() {
    set(EMPTY);
  },
};

export function useAdminState(): AdminState {
  return useSyncExternalStore(adminStore.subscribe, adminStore.getState, adminStore.getState);
}

export function isDirty(s: AdminState): boolean {
  return s.draft !== null && s.saved !== null && JSON.stringify(s.draft) !== JSON.stringify(s.saved);
}
