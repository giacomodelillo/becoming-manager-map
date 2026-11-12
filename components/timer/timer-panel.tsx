"use client";

import { ConnectionBadge } from "./connection-badge";
import { CountdownDisplay } from "./countdown-display";
import { TimerControls } from "./timer-controls";
import { useRemainingSeconds, useTimerState } from "./use-timer";

export function TimerPanel() {
  const timer = useTimerState();
  const { seconds, isFinished } = useRemainingSeconds(timer.state);

  const running = timer.state.status === "running" && !isFinished;

  return (
    <div className="flex w-full flex-col items-center gap-10">
      <CountdownDisplay seconds={seconds} isFinished={isFinished} />
      <TimerControls
        running={running}
        disabled={timer.connection !== "online"}
        onToggle={() => void (running ? timer.pause() : timer.start())}
        onReset={() => void timer.reset()}
      />
      <ConnectionBadge connection={timer.connection} clients={timer.clients} />
    </div>
  );
}
