import { useSyncExternalStore } from "react";
import { deriveFairView } from "./derive";
import type { FairConfig, FairView } from "./types";

/** Dati della fiera nel browser: caricati dal server e aggiornati ogni POLL_MS. Condivisi tra stage e dettaglio. */
export type FairDataState = {
  status: "idle" | "ready" | "error";
  version: number;
  config: FairConfig | null;
  view: FairView | null;
};

const POLL_MS = 15_000;

let state: FairDataState = { status: "idle", version: 0, config: null, view: null };
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;
let inflight: Promise<void> | null = null;

function set(next: FairDataState) {
  state = next;
  listeners.forEach((l) => l());
}

/** Applica dati nuovi (dal server o dopo un salvataggio). Ignora se la versione è la stessa. */
export function applyRemote(version: number, config: FairConfig) {
  if (state.view && state.version === version) return;
  set({ status: "ready", version, config, view: deriveFairView(config) });
}

export function refreshFairData(): Promise<void> {
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch("/api/expo/data", { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const body = (await res.json()) as { version: number; config: FairConfig };
      applyRemote(body.version, body.config);
    } catch {
      if (!state.view) set({ ...state, status: "error" });
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    void refreshFairData();
    timer = setInterval(() => void refreshFairData(), POLL_MS);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

const getSnapshot = () => state;

/** Lettura immediata, fuori da React (es. dopo un refresh). */
export const getFairState = (): FairDataState => state;

export function useFairData(): FairDataState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Solo i dati derivati (booth numerati, layout). null finché non sono caricati. */
export function useFairView(): FairView | null {
  return useFairData().view;
}
