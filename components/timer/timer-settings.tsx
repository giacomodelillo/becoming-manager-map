"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatClock } from "@/lib/timer/logic";
import { useTimerState } from "./use-timer";

const PRESETS_MIN = [1, 5, 10, 15, 30];

const ADJUSTMENTS = [
  { label: "−1 min", ms: -60_000 },
  { label: "−10 s", ms: -10_000 },
  { label: "+10 s", ms: 10_000 },
  { label: "+1 min", ms: 60_000 },
];

const STATUS_LABEL = {
  idle: "Fermo",
  running: "In corso",
  paused: "In pausa",
} as const;

const INPUT =
  "bg-foreground/5 border-foreground/10 focus:border-foreground/40 h-9 w-20 rounded-xl border px-3 text-sm outline-none";

export function TimerSettings() {
  const { state, clients, connection, setDuration, adjust } = useTimerState();
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const disabled = connection !== "online";

  const applyCustom = () => {
    const total = (Number(minutes) || 0) * 60 + (Number(seconds) || 0);
    if (total < 1) return;
    void setDuration(total * 1000);
    setMinutes("");
    setSeconds("");
  };

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <h3 className="text-foreground/50 text-sm">Imposta la durata</h3>
        <div className="flex flex-wrap gap-2">
          {PRESETS_MIN.map((m) => (
            <Button
              key={m}
              variant="outline"
              disabled={disabled}
              onClick={() => void setDuration(m * 60_000)}
            >
              {m} min
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={99}
            placeholder="min"
            aria-label="Minuti"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyCustom()}
            className={INPUT}
          />
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={59}
            placeholder="sec"
            aria-label="Secondi"
            value={seconds}
            onChange={(e) => setSeconds(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyCustom()}
            className={INPUT}
          />
          <Button variant="secondary" disabled={disabled} onClick={applyCustom}>
            Imposta
          </Button>
        </div>
        <p className="text-foreground/50 text-sm">
          Impostare una nuova durata azzera il timer.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-foreground/50 text-sm">Regola il tempo</h3>
        <div className="flex flex-wrap gap-2">
          {ADJUSTMENTS.map((a) => (
            <Button
              key={a.label}
              variant="outline"
              disabled={disabled}
              onClick={() => void adjust(a.ms)}
            >
              {a.label}
            </Button>
          ))}
        </div>
        <p className="text-foreground/50 text-sm">
          Cambia la durata anche mentre il timer è in corso.
        </p>
      </div>

      <table className="w-full">
        <tbody>
          {[
            ["Stato", STATUS_LABEL[state.status]],
            ["Durata", formatClock(state.durationMs)],
            ["Dispositivi collegati", String(clients)],
          ].map(([label, value]) => (
            <tr
              key={label}
              className="border-foreground/10 h-14 border-t tracking-tight last:border-b"
            >
              <td className="text-foreground/50 w-1/2 text-sm">{label}</td>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
