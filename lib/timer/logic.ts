import {
  MAX_DURATION_MS,
  MIN_DURATION_MS,
  type TimerAction,
  type TimerState,
} from "./types";

export function clampDuration(ms: number) {
  return Math.min(MAX_DURATION_MS, Math.max(MIN_DURATION_MS, Math.round(ms)));
}

/** ms trascorsi all'istante `now` (stesso orologio di `startedAt`, cioè quello del server). */
export function getElapsedMs(state: TimerState, now: number) {
  if (state.status !== "running" || state.startedAt === null) {
    return state.elapsedMs;
  }
  return state.elapsedMs + Math.max(0, now - state.startedAt);
}

export function getRemainingMs(state: TimerState, now: number) {
  const remaining = state.durationMs - getElapsedMs(state, now);
  return Math.max(0, Math.min(state.durationMs, remaining));
}

export function formatClock(ms: number) {
  const total = Math.round(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/** Funzione pura: usata dal server per applicare un comando allo stato. */
export function applyAction(
  state: TimerState,
  action: TimerAction,
  now: number,
): TimerState {
  const elapsed = getElapsedMs(state, now);

  switch (action.type) {
    case "start": {
      const finished = elapsed >= state.durationMs;
      // già in corso e non ancora scaduto: niente da fare
      if (state.status === "running" && !finished) return state;
      return {
        ...state,
        status: "running",
        elapsedMs: finished ? 0 : elapsed,
        startedAt: now,
      };
    }
    case "pause": {
      if (state.status !== "running") return state;
      return {
        ...state,
        status: "paused",
        elapsedMs: Math.min(elapsed, state.durationMs),
        startedAt: null,
      };
    }
    case "reset":
      return { ...state, status: "idle", elapsedMs: 0, startedAt: null };
    case "setDuration":
      return {
        ...state,
        status: "idle",
        durationMs: clampDuration(action.durationMs),
        elapsedMs: 0,
        startedAt: null,
      };
    case "adjust": {
      // modifica la durata senza fermare il timer, mai sotto il tempo già trascorso
      const played = Math.min(elapsed, state.durationMs);
      const durationMs = Math.max(
        clampDuration(state.durationMs + action.deltaMs),
        played,
      );
      return { ...state, durationMs };
    }
    default:
      return state;
  }
}

/** Valida l'input di una richiesta HTTP. */
export function parseAction(raw: unknown): TimerAction | null {
  if (typeof raw !== "object" || raw === null) return null;
  const a = raw as Record<string, unknown>;

  switch (a.type) {
    case "start":
      return { type: "start" };
    case "pause":
      return { type: "pause" };
    case "reset":
      return { type: "reset" };
    case "setDuration":
      return typeof a.durationMs === "number" && Number.isFinite(a.durationMs)
        ? { type: "setDuration", durationMs: a.durationMs }
        : null;
    case "adjust":
      return typeof a.deltaMs === "number" && Number.isFinite(a.deltaMs)
        ? { type: "adjust", deltaMs: a.deltaMs }
        : null;
    default:
      return null;
  }
}
