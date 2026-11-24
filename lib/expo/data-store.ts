import { useSyncExternalStore } from "react";
import { deriveFairView } from "./derive";
import { parseFairConfig } from "./validate";
import type { FairConfig, FairView } from "./types";

/**
 * Dati della fiera nel browser: caricati dal server, aggiornati ogni POLL_MS
 * e tenuti anche nel browser: se il server non risponde si usa l'ultimo dato valido.
 */
export type FairDataState = {
  status: "idle" | "ready" | "error";
  version: number;
  config: FairConfig | null;
  view: FairView | null;
  /** Vero se l'ultimo aggiornamento è fallito (o i dati vengono dalla copia locale) */
  offline: boolean;
};

const POLL_MS = 15_000;
const TIMEOUT_MS = 8_000;
const CACHE_KEY = "expo:data:v1";

let state: FairDataState = { status: "idle", version: 0, config: null, view: null, offline: false };
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;
let inflight: Promise<void> | null = null;

function set(next: FairDataState) {
  state = next;
  listeners.forEach((l) => l());
}

function writeCache(version: number, config: FairConfig) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ version, config }));
  } catch {
    /* archivio pieno o non disponibile */
  }
}

/** Prima dell'avvio: se c'è una copia locale valida la mostra subito, segnata come non aggiornata. */
function loadCache() {
  if (state.view) return;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as { version?: number; config?: unknown };
    const config = parseFairConfig(parsed.config);
    set({ status: "ready", version: Number(parsed.version) || 0, config, view: deriveFairView(config), offline: true });
  } catch {
    /* copia rovinata: si ignora */
  }
}

/** Applica dati nuovi (dal server o dopo un salvataggio). */
export function applyRemote(version: number, config: FairConfig) {
  if (state.view && state.version === version) {
    if (state.offline) set({ ...state, offline: false });
    writeCache(version, config);
    return;
  }
  set({ status: "ready", version, config, view: deriveFairView(config), offline: false });
  writeCache(version, config);
}

export function refreshFairData(): Promise<void> {
  if (inflight) return inflight;
  inflight = (async () => {
    const controller = new AbortController();
    const abort = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch("/api/expo/data", { cache: "no-store", signal: controller.signal });
      if (!res.ok) throw new Error(String(res.status));
      const body = (await res.json()) as { version: number; config: FairConfig };
      applyRemote(body.version, body.config);
    } catch {
      if (!state.view) set({ ...state, status: "error" });
      else if (!state.offline) set({ ...state, offline: true });
    } finally {
      clearTimeout(abort);
      inflight = null;
    }
  })();
  return inflight;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    loadCache();
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
