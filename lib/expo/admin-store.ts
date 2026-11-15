import { useSyncExternalStore } from "react";
import type { FairConfig } from "./types";

/**
 * Stato dell'area riservata condiviso tra i due slot:
 * il dettaglio (impostazioni) scrive la bozza, lo stage (anteprima) la legge.
 */
export type AdminState = {
  /** Bozza in modifica (null finché non si è entrati con il PIN) */
  draft: FairConfig | null;
  /** Ultima versione salvata sul server */
  saved: FairConfig | null;
  version: number;
  /** Azienda aperta nel modulo (chiave), evidenziata nell'anteprima */
  openKey: string | null;
};

const EMPTY: AdminState = { draft: null, saved: null, version: 0, openKey: null };

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
    set({ draft: config, saved: config, version, openKey: null });
  },
  setDraft(draft: FairConfig) {
    set({ ...state, draft });
  },
  setOpenKey(openKey: string | null) {
    set({ ...state, openKey });
  },
  markSaved(config: FairConfig, version: number) {
    set({ ...state, draft: config, saved: config, version });
  },
  discard() {
    set({ ...state, draft: state.saved, openKey: null });
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
