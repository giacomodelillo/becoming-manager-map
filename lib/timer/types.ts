export type TimerStatus = "idle" | "running" | "paused";

/** Una fase della sequenza. Un timer singolo è una sequenza di una sola fase. */
export type Segment = {
  id: string;
  /** Nome mostrato sullo schermo; se vuoto si usa "Fase n". */
  label: string;
  durationMs: number;
};

export type TimerState = {
  status: TimerStatus;
  /** Fasi in ordine: partono una dopo l'altra in automatico. */
  segments: Segment[];
  /** ms trascorsi sull'INTERA sequenza fino all'ultimo avvio (esclude il tratto in corso). */
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
  | { type: "next" }
  | { type: "previous" }
  | { type: "setSequence"; segments: Segment[] }
  | { type: "adjust"; deltaMs: number };

export const MIN_DURATION_MS = 1_000;
/** 99:59, il massimo che il display mm:ss riesce a mostrare per una singola fase. */
export const MAX_DURATION_MS = (99 * 60 + 59) * 1_000;
export const DEFAULT_DURATION_MS = 60_000;
export const MAX_SEGMENTS = 30;

export const DEFAULT_TIMER_STATE: TimerState = {
  status: "idle",
  segments: [{ id: "main", label: "", durationMs: DEFAULT_DURATION_MS }],
  elapsedMs: 0,
  startedAt: null,
  version: 0,
};
