import { DoorOpen, Timer } from "lucide-react";
import type { ReactNode } from "react";

function Row({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <li className="flex min-h-12 items-center gap-4 border-b border-white/15 py-2">
      <span className="flex size-6 shrink-0 items-center justify-center">{icon}</span>
      <span className="text-sm font-semibold">{label}</span>
    </li>
  );
}

/** Legenda della mappa, nello stile della legenda di riferimento: icona + etichetta tra due linee. */
export function MapLegend() {
  return (
    <section aria-labelledby="legend-title" className="space-y-3">
      <h2 id="legend-title" className="expo-eyebrow">
        Legenda
      </h2>
      <ul className="border-t border-white/15">
        <Row icon={<DoorOpen className="size-6 text-[var(--gold)]" strokeWidth={1.5} />} label="Ingresso" />
        <Row icon={<Timer className="size-6 text-[var(--gold)]" strokeWidth={1.5} />} label="Timer" />
        <Row icon={<span className="size-5 bg-[var(--gold)]" />} label="Passo corrente" />
        <Row icon={<span className="size-5 border-2 border-[var(--magenta)]" />} label="Passi del tuo percorso" />
        <Row icon={<span className="size-5 bg-white/30" />} label="Già visitato" />
      </ul>
    </section>
  );
}
