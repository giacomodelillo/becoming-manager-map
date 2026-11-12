import { DEFAULT_TIMER_STATE, type TimerAction, type TimerState } from "./types";

export type ConnectionStatus = "connecting" | "online" | "offline";

export type TimerSnapshot = {
  state: TimerState;
  clients: number;
  connection: ConnectionStatus;
};

const SERVER_SNAPSHOT: TimerSnapshot = {
  state: DEFAULT_TIMER_STATE,
  clients: 0,
  connection: "connecting",
};

const PIN_KEY = "horizon:timer-pin";
const SYNC_EVERY_MS = 30_000;
const RECONNECT_AFTER_MS = 3_000;

function readPin() {
  try {
    return sessionStorage.getItem(PIN_KEY) ?? undefined;
  } catch {
    return undefined; // storage non disponibile
  }
}

function writePin(pin: string) {
  try {
    sessionStorage.setItem(PIN_KEY, pin);
  } catch {
    /* storage non disponibile */
  }
}

/**
 * Un'unica connessione al server per dispositivo, condivisa da tutti i
 * componenti (stage e dettaglio). Si apre al primo subscriber e si chiude
 * quando non ce ne sono più. Compatibile con useSyncExternalStore.
 */
class TimerClient {
  private snapshot: TimerSnapshot = SERVER_SNAPSHOT;
  private listeners = new Set<() => void>();
  private source: EventSource | null = null;
  private syncTimer: ReturnType<typeof setInterval> | null = null;
  /** Differenza orologio server - orologio locale, in ms. */
  private offset = 0;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    if (this.listeners.size === 1) this.connect();

    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) this.disconnect();
    };
  };

  getSnapshot = () => this.snapshot;
  getServerSnapshot = () => SERVER_SNAPSHOT;

  /** Ora corrente secondo l'orologio del server. */
  getServerNow = () => Date.now() + this.offset;

  /** Invia un comando. Se il server richiede un PIN lo chiede all'utente. */
  send = async (action: TimerAction) => {
    const post = (pin?: string) =>
      fetch("/api/timer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, pin }),
      });

    try {
      let res = await post(readPin());

      if (res.status === 401) {
        const entered = window.prompt("PIN per controllare il timer");
        if (!entered) return;
        res = await post(entered);
        if (res.status === 401) {
          window.alert("PIN errato");
          return;
        }
        writePin(entered);
      }
      // lo stato aggiornato arriva a tutti, anche a noi, via SSE
    } catch {
      this.set({ connection: "offline" });
    }
  };

  private set(patch: Partial<TimerSnapshot>) {
    this.snapshot = { ...this.snapshot, ...patch };
    this.listeners.forEach((listener) => listener());
  }

  private connect() {
    this.open();
    void this.syncClock();
    this.syncTimer = setInterval(() => void this.syncClock(), SYNC_EVERY_MS);
  }

  private disconnect() {
    this.source?.close();
    this.source = null;
    if (this.syncTimer) clearInterval(this.syncTimer);
    this.syncTimer = null;
    // nessun listener da avvisare: al prossimo subscribe si riparte da "connecting"
    this.snapshot = { ...this.snapshot, connection: "connecting" };
  }

  private open() {
    const source = new EventSource("/api/timer");
    this.source = source;

    source.onopen = () => this.set({ connection: "online" });

    source.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as {
          state: TimerState;
          clients: number;
        };
        this.set({
          state: msg.state,
          clients: msg.clients,
          connection: "online",
        });
      } catch {
        /* messaggio malformato: ignorato */
      }
    };

    source.onerror = () => {
      this.set({ connection: "offline" });
      // EventSource riprova da solo, a meno che la connessione sia chiusa del tutto
      if (source.readyState === EventSource.CLOSED && this.source === source) {
        this.source = null;
        setTimeout(() => {
          if (this.listeners.size > 0 && !this.source) this.open();
        }, RECONNECT_AFTER_MS);
      }
    };
  }

  /**
   * Stima l'offset tra orologio locale e orologio del server (NTP semplificato):
   * più richieste, vince quella con il round-trip più breve.
   */
  private async syncClock(samples = 5) {
    let best: { rtt: number; offset: number } | null = null;

    for (let i = 0; i < samples; i++) {
      try {
        const t0 = performance.now();
        const c0 = Date.now();
        const res = await fetch("/api/timer/time", { cache: "no-store" });
        const { now } = (await res.json()) as { now: number };
        const rtt = performance.now() - t0;

        if (!best || rtt < best.rtt) {
          best = { rtt, offset: now - (c0 + rtt / 2) };
        }
      } catch {
        /* rete assente: riprova al prossimo giro */
      }
    }

    if (best) this.offset = best.offset;
  }
}

export const timerClient = new TimerClient();
