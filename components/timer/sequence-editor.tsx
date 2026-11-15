"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatClock, getTotalMs } from "@/lib/timer/logic";
import { MAX_SEGMENTS, type Segment } from "@/lib/timer/types";
import { cn } from "@/lib/utils";
import { useTimerState } from "./use-timer";

// Math.random e non crypto.randomUUID: quest'ultimo non esiste in contesti non sicuri (http su IP di rete)
const newId = () => Math.random().toString(36).slice(2, 9);

const clamp = (n: number, max: number) =>
  Math.min(max, Math.max(0, Math.floor(Number.isFinite(n) ? n : 0)));

const toMs = (min: number, sec: number) =>
  (clamp(min, 99) * 60 + clamp(sec, 59)) * 1000;

const INPUT =
  "bg-foreground/5 border-foreground/10 focus:border-foreground/40 h-10 rounded-xl border px-3 text-base outline-none sm:h-9 sm:text-sm";

export function SequenceEditor() {
  const { state, connection, setSequence } = useTimerState();
  // null = nessuna modifica in corso: si mostra la sequenza attiva sul server
  const [draft, setDraft] = useState<Segment[] | null>(null);

  const rows = draft ?? state.segments;
  const disabled = connection !== "online";

  const update = (i: number, patch: Partial<Segment>) =>
    setDraft(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    setDraft(next);
  };

  const remove = (i: number) => {
    if (rows.length > 1) setDraft(rows.filter((_, j) => j !== i));
  };

  const add = () => {
    if (rows.length >= MAX_SEGMENTS) return;
    setDraft([...rows, { id: newId(), label: "", durationMs: 5 * 60_000 }]);
  };

  const apply = async () => {
    if (!draft) return;
    await setSequence(draft);
    setDraft(null);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-foreground/50 text-sm">Sequenza di timer</h3>

      <ol className="space-y-2">
        {rows.map((row, i) => {
          const min = Math.floor(row.durationMs / 60_000);
          const sec = Math.floor((row.durationMs % 60_000) / 1000);

          return (
            <li key={row.id} className="flex flex-wrap items-center gap-2">
              <div className="flex min-w-0 basis-full items-center gap-2 sm:basis-0 sm:flex-1">
                <span className="text-foreground/50 w-5 shrink-0 text-sm tabular-nums">
                  {i + 1}
                </span>
                <input
                  type="text"
                  value={row.label}
                  maxLength={40}
                  placeholder={`Fase ${i + 1}`}
                  aria-label={`Nome della fase ${i + 1}`}
                  onChange={(e) => update(i, { label: e.target.value })}
                  className={cn(INPUT, "min-w-0 flex-1")}
                />
              </div>
              <div className="flex items-center gap-2 max-sm:pl-7">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={99}
                  value={min}
                  aria-label={`Minuti della fase ${i + 1}`}
                  onChange={(e) =>
                    update(i, { durationMs: toMs(Number(e.target.value), sec) })
                  }
                  className={cn(INPUT, "w-16")}
                />
                <span className="text-foreground/50">:</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={59}
                  value={sec}
                  aria-label={`Secondi della fase ${i + 1}`}
                  onChange={(e) =>
                    update(i, { durationMs: toMs(min, Number(e.target.value)) })
                  }
                  className={cn(INPUT, "w-16")}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-10 sm:size-9"
                  aria-label="Sposta su"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                >
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-10 sm:size-9"
                  aria-label="Sposta giù"
                  disabled={i === rows.length - 1}
                  onClick={() => move(i, 1)}
                >
                  <ArrowDown className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-10 sm:size-9"
                  aria-label="Rimuovi la fase"
                  disabled={rows.length === 1}
                  onClick={() => remove(i)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          disabled={rows.length >= MAX_SEGMENTS}
          onClick={add}
        >
          <Plus className="size-4" />
          Aggiungi fase
        </Button>
        <Button
          variant="secondary"
          disabled={disabled || !draft}
          onClick={() => void apply()}
        >
          Applica
        </Button>
        {draft && (
          <Button variant="ghost" onClick={() => setDraft(null)}>
            Annulla
          </Button>
        )}
        <span className="text-foreground/50 ml-auto text-sm tabular-nums">
          Totale {formatClock(getTotalMs(rows))}
        </span>
      </div>

      <p className="text-foreground/50 text-sm">
        Le fasi partono una dopo l&apos;altra in automatico, su tutti i
        dispositivi. Applicare una sequenza azzera il timer.
      </p>
    </div>
  );
}
