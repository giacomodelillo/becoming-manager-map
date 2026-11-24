"use client";

import { useCallback, useEffect, useState } from "react";
import { Delete } from "lucide-react";
import { cn } from "@/lib/utils";
import { login } from "@/lib/expo/admin-api";
import { Eyebrow } from "./fields";

const MAX_LEN = 12;

/** Tastierino numerico a schermo (funzionano anche i tasti della tastiera). */
export function PinGate({ onSuccess }: { onSuccess: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const push = useCallback((digit: string) => {
    setError(null);
    setPin((p) => (p.length < MAX_LEN ? p + digit : p));
  }, []);

  const submit = useCallback(async () => {
    if (pin.length < 6 || busy) return;
    setBusy(true);
    const result = await login(pin);
    setBusy(false);
    if (result.ok) onSuccess();
    else {
      setError(result.message);
      setPin("");
    }
  }, [pin, busy, onSuccess]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) push(e.key);
      else if (e.key === "Backspace") setPin((p) => p.slice(0, -1));
      else if (e.key === "Enter") void submit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [push, submit]);

  const KEY =
    "expo-serif flex h-16 items-center justify-center border border-white/25 bg-white/5 text-2xl text-[var(--paper)] transition active:translate-y-0.5 active:bg-white/15";

  return (
    <div className="mx-auto flex max-w-xs flex-col items-center gap-6 pt-2">
      <div className="space-y-2 text-center">
        <Eyebrow>Area riservata</Eyebrow>
        <h1 className="expo-serif text-3xl">Inserisci il PIN</h1>
      </div>

      <div className="flex h-8 items-center gap-2" aria-label={`${pin.length} cifre inserite`}>
        {Array.from({ length: Math.max(6, pin.length) }).map((_, i) => (
          <span
            key={i}
            className={cn("size-3 border border-[var(--paper)]", i < pin.length && "bg-[var(--paper)]")}
          />
        ))}
      </div>

      <p role="alert" className="min-h-5 text-center text-sm font-semibold text-[#ff7aa6]">
        {error}
      </p>

      <div className="grid w-full grid-cols-3 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button key={d} type="button" className={KEY} onClick={() => push(d)}>
            {d}
          </button>
        ))}
        <button
          type="button"
          aria-label="Cancella"
          className={KEY}
          onClick={() => setPin((p) => p.slice(0, -1))}
        >
          <Delete className="size-6" strokeWidth={1.5} />
        </button>
        <button type="button" className={KEY} onClick={() => push("0")}>
          0
        </button>
        <button
          type="button"
          disabled={pin.length < 6 || busy}
          onClick={() => void submit()}
          className="flex h-16 items-center justify-center bg-[var(--gold)] text-sm font-semibold uppercase tracking-[0.18em] text-[var(--ink)] transition active:translate-y-0.5 disabled:opacity-40"
        >
          Entra
        </button>
      </div>
    </div>
  );
}
