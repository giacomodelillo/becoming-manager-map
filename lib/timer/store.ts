import { applyAction } from "./logic";
import { DEFAULT_TIMER_STATE, type TimerAction, type TimerState } from "./types";

export type TimerMessage = { state: TimerState; clients: number };

/**
 * Stato autorevole del timer, in memoria nel processo Node.
 * Funziona con un solo processo long-running (`next start` o `next dev`),
 * NON su piattaforme serverless.
 */
class TimerStore {
  private state: TimerState = DEFAULT_TIMER_STATE;
  private clients = 0;
  private listeners = new Set<() => void>();

  snapshot(): TimerMessage {
    return { state: this.state, clients: this.clients };
  }

  dispatch(action: TimerAction) {
    const next = applyAction(this.state, action, Date.now());
    if (next !== this.state) {
      this.state = { ...next, version: this.state.version + 1 };
      this.emit();
    }
    return this.state;
  }

  /** Registra un client SSE e lo notifica subito. Ritorna la funzione per rimuoverlo. */
  connect(listener: () => void) {
    this.listeners.add(listener);
    this.clients += 1;
    this.emit();

    return () => {
      if (!this.listeners.delete(listener)) return;
      this.clients -= 1;
      this.emit();
    };
  }

  private emit() {
    for (const listener of this.listeners) listener();
  }
}

// globalThis: in sviluppo (HMR) e tra route diverse il modulo può essere istanziato più volte.
const globalForTimer = globalThis as typeof globalThis & {
  __horizonTimerStore?: TimerStore;
};

export const timerStore = (globalForTimer.__horizonTimerStore ??=
  new TimerStore());
