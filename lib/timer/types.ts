export type TimerStatus = "idle" | "running" | "paused";

export type TimerState = {
  status: TimerStatus;
  /** Durata totale in ms. */
  durationMs: number;
  /** ms già trascorsi fino all'ultimo avvio (esclude il tratto in corso). */
  elapsedMs: number;
  /** Istante SERVER (epoch ms) dell'ultimo avvio; null se non è in corso. */
  startedAt: number | null;
  /** Incrementato a ogni modifica. */
  version: number;
};

export type TimerAction =
  | { type: "start" }
  | { type: "pause" }
  | { type: "reset" }
  | { type: "setDuration"; durationMs: number }
  | { type: "adjust"; deltaMs: number };

export const MIN_DURATION_MS = 1_000;
/** 99:59, il massimo che il display mm:ss riesce a mostrare. */
export const MAX_DURATION_MS = (99 * 60 + 59) * 1_000;
export const DEFAULT_DURATION_MS = 60_000;

export const DEFAULT_TIMER_STATE: TimerState = {
  status: "idle",
  durationMs: DEFAULT_DURATION_MS,
  elapsedMs: 0,
  startedAt: null,
  version: 0,
};
