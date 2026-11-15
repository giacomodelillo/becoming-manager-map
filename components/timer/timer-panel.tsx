"use client";

import { ConnectionBadge } from "./connection-badge";
import { CountdownDisplay } from "./countdown-display";
import { PhaseInfo } from "./phase-info";
import { TimerControls } from "./timer-controls";
import { useRemainingSeconds, useTimerState } from "./use-timer";

export function TimerPanel() {
  const timer = useTimerState();
  const { seconds, isFinished, index } = useRemainingSeconds(timer.state);

  const running = timer.state.status === "running" && !isFinished;

  return (
    <div className="flex w-full flex-col items-center gap-8">
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
