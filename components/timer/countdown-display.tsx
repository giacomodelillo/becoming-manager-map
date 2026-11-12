"use client";

import NumberFlow from "@number-flow/react";
import { cn } from "@/lib/utils";

const TWO_DIGITS = { minimumIntegerDigits: 2 } as const;

export function CountdownDisplay({
  seconds,
  isFinished,
}: {
  seconds: number;
  isFinished: boolean;
}) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div
      role="timer"
      aria-live="off"
      className={cn(
        // cqw: la dimensione segue la larghezza dello stage, con o senza pannello dettaglio
        "font-display flex items-center justify-center text-[32cqw] leading-none tracking-tight transition-colors duration-300",
        isFinished && "animate-pulse text-[#ff3828]",
      )}
    >
      <NumberFlow value={minutes} format={TWO_DIGITS} />
      <span>:</span>
      <NumberFlow value={secs} format={TWO_DIGITS} />
    </div>
  );
}
