import { formatClock, segmentLabel } from "@/lib/timer/logic";
import type { Segment } from "@/lib/timer/types";

/** Nome della fase in corso e anteprima della prossima. Visibile solo con più fasi. */
export function PhaseInfo({
  segments,
  index,
}: {
  segments: Segment[];
  index: number;
}) {
  if (segments.length < 2) return null;

  const current = segments[index];
  const next = segments[index + 1];

  return (
    <div className="space-y-1 text-center">
      <p className="text-2xl font-medium tracking-tight">
        {segmentLabel(current, index)}
      </p>
      <p className="text-foreground/50 text-sm">
        Fase {index + 1} di {segments.length}
        {next
          ? `, poi ${segmentLabel(next, index + 1)} (${formatClock(next.durationMs)})`
          : ", ultima fase"}
      </p>
    </div>
  );
}
