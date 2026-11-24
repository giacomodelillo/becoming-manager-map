"use client";

import { useState } from "react";
import { ConnectionBadge } from "./connection-badge";
import { CountdownDisplay } from "./countdown-display";
import { PhaseInfo } from "./phase-info";
import { TimerControls } from "./timer-controls";
import { useRemainingSeconds, useTimerState } from "./use-timer";

/** Logo dell'evento: file SVG in public/. */
const LOGO_SRC = "/logo-evento.svg";

export function TimerPanel() {
  const timer = useTimerState();
  const { seconds, isFinished, index } = useRemainingSeconds(timer.state);
  // se il file non c'è, lo spazio sparisce invece di mostrare un'immagine rotta
  const [logoOk, setLogoOk] = useState(true);

  const running = timer.state.status === "running" && !isFinished;

  return (
    <div className="flex w-full flex-col items-center gap-8">
      {logoOk && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={LOGO_SRC}
          alt="Logo dell'evento"
          onError={() => setLogoOk(false)}
          className="h-14 w-auto max-w-[70%] object-contain sm:h-20 lg:h-28"
        />
      )}
      <PhaseInfo segments={timer.state.segments} index={index} />
      <CountdownDisplay seconds={seconds} isFinished={isFinished} />
      <TimerControls
        running={running}
        disabled={timer.connection !== "online"}
        showSkip={timer.state.segments.length > 1}
        onToggle={() => void (running ? timer.pause() : timer.start())}
        onReset={() => void timer.reset()}
        onPrevious={() => void timer.previous()}
        onNext={() => void timer.next()}
      />
      <ConnectionBadge connection={timer.connection} clients={timer.clients} />
    </div>
  );
}
