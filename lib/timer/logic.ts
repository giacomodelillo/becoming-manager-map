import {
  MAX_DURATION_MS,
  MAX_SEGMENTS,
  MIN_DURATION_MS,
  type Segment,
  type TimerAction,
  type TimerState,
} from "./types";

export function clampDuration(ms: number) {
  return Math.min(MAX_DURATION_MS, Math.max(MIN_DURATION_MS, Math.round(ms)));
}

export function getTotalMs(segments: Segment[]) {
  return segments.reduce((sum, s) => sum + s.durationMs, 0);
}

/** ms trascorsi sull'intera sequenza all'istante `now` (orologio del server, come `startedAt`). */
export function getElapsedMs(state: TimerState, now: number) {
  if (state.status !== "running" || state.startedAt === null) {
    return state.elapsedMs;
  }
  return state.elapsedMs + Math.max(0, now - state.startedAt);
}

export type TimerPosition = {
  /** Fase corrente. */
  index: number;
  /** Dove inizia la fase corrente, in ms dall'inizio della sequenza. */
  segmentStartMs: number;
  /** ms già trascorsi nella fase corrente. */
  segmentElapsedMs: number;
  /** ms mancanti alla fine della fase corrente. */
  remainingMs: number;
  /** true quando l'intera sequenza è terminata. */
  finished: boolean;
};

/**
 * La fase corrente si ricava SOLO dal tempo trascorso: non servono timer sul server
 * e tutti i dispositivi arrivano allo stesso risultato.
 */
export function getPosition(state: TimerState, now: number): TimerPosition {
  const { segments } = state;
  const elapsed = Math.min(getElapsedMs(state, now), getTotalMs(segments));

  let start = 0;
  for (let i = 0; i < segments.length; i++) {
    const end = start + segments[i].durationMs;
    if (elapsed < end) {
      return {
        index: i,
        segmentStartMs: start,
        segmentElapsedMs: elapsed - start,
        remainingMs: end - elapsed,
        finished: false,
      };
    }
    start = end;
  }

  const last = segments.length - 1;
  const lastDuration = segments[last].durationMs;
  return {
    index: last,
    segmentStartMs: start - lastDuration,
    segmentElapsedMs: lastDuration,
    remainingMs: 0,
    finished: true,
  };
}

export function formatClock(ms: number) {
  const total = Math.round(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function segmentLabel(segment: Segment, index: number) {
  return segment.label || `Fase ${index + 1}`;
}

/** Sposta il timer a `target` ms dall'inizio, mantenendo se è in corso o fermo. */
function seek(state: TimerState, target: number, now: number): TimerState {
  if (state.status === "running") {
    return { ...state, elapsedMs: target, startedAt: now };
  }
  return {
    ...state,
    status: target === 0 ? "idle" : "paused",
    elapsedMs: target,
    startedAt: null,
  };
}

/** Funzione pura: usata dal server per applicare un comando allo stato. */
export function applyAction(
  state: TimerState,
  action: TimerAction,
  now: number,
): TimerState {
  const total = getTotalMs(state.segments);
  const elapsed = getElapsedMs(state, now);

  switch (action.type) {
    case "start": {
      const finished = elapsed >= total;
      // già in corso e non ancora terminato: niente da fare
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
        elapsedMs: Math.min(elapsed, total),
        startedAt: null,
      };
    }
    case "reset":
      return { ...state, status: "idle", elapsedMs: 0, startedAt: null };
    case "setSequence":
      return {
        ...state,
        segments: action.segments,
        status: "idle",
        elapsedMs: 0,
        startedAt: null,
      };
    case "adjust": {
      // cambia la durata della fase in corso, mai sotto il tempo già trascorso in essa
      const pos = getPosition(state, now);
      if (pos.finished) return state;
      const current = state.segments[pos.index];
      const durationMs = Math.max(
        clampDuration(current.durationMs + action.deltaMs),
        pos.segmentElapsedMs,
      );
      if (durationMs === current.durationMs) return state;
      return {
        ...state,
        segments: state.segments.map((s, i) =>
          i === pos.index ? { ...s, durationMs } : s,
        ),
      };
    }
    case "next": {
      const pos = getPosition(state, now);
      if (pos.finished || pos.index >= state.segments.length - 1) return state;
      const target = pos.segmentStartMs + state.segments[pos.index].durationMs;
      return seek(state, target, now);
    }
    case "previous": {
      const pos = getPosition(state, now);
      // entro i primi 2 s di una fase si torna alla precedente, altrimenti si riparte da capo
      const restart =
        pos.finished || pos.index === 0 || pos.segmentElapsedMs > 2_000;
      const target = restart
        ? pos.segmentStartMs
        : pos.segmentStartMs - state.segments[pos.index - 1].durationMs;
      return seek(state, target, now);
    }
    default:
      return state;
  }
}

/** Valida e normalizza le fasi arrivate da una richiesta HTTP. */
export function parseSegments(raw: unknown): Segment[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_SEGMENTS) {
    return null;
  }

  const out: Segment[] = [];
  for (let i = 0; i < raw.length; i++) {
    const item: unknown = raw[i];
    if (typeof item !== "object" || item === null) return null;
    const s = item as Record<string, unknown>;
    if (typeof s.durationMs !== "number" || !Number.isFinite(s.durationMs)) {
      return null;
    }
    out.push({
      id: typeof s.id === "string" && s.id ? s.id.slice(0, 32) : `s${i}`,
      label: typeof s.label === "string" ? s.label.trim().slice(0, 40) : "",
      durationMs: clampDuration(s.durationMs),
    });
  }
  return out;
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
    case "next":
      return { type: "next" };
    case "previous":
      return { type: "previous" };
    case "setSequence": {
      const segments = parseSegments(a.segments);
      return segments ? { type: "setSequence", segments } : null;
    }
    case "adjust":
      return typeof a.deltaMs === "number" && Number.isFinite(a.deltaMs)
        ? { type: "adjust", deltaMs: a.deltaMs }
        : null;
    default:
      return null;
  }
}
