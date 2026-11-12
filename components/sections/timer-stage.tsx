import { TimerPanel } from "@/components/timer/timer-panel";

export function TimerStage() {
  return (
    // @container: il display del timer dimensiona il testo in cqw rispetto a questa sezione
    <section className="@container flex min-h-[calc(100dvh-1rem)] flex-col items-center justify-center px-6 py-28">
      <TimerPanel />
    </section>
  );
}
