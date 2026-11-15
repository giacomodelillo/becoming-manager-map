import { TimerPanel } from "@/components/timer/timer-panel";

export function TimerStage() {
  return (
    // @container: il display del timer dimensiona il testo in cqw rispetto a questa sezione.
    // Mobile: spazio sopra per la toolbar e sotto per la pillola "Dettagli".
    <section className="@container flex min-h-[calc(100dvh-1rem)] flex-col items-center justify-center px-6 pt-24 pb-28 lg:py-16">
      <TimerPanel />
    </section>
  );
}
