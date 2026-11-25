"use client";

import { Fragment, type CSSProperties } from "react";
import { DoorOpen, Timer } from "lucide-react";
import { useFairData } from "@/lib/expo/data-store";
import { routeHasEdge } from "@/lib/expo/route";
import type { FairColumn, FairView, ZoneTone } from "@/lib/expo/types";
import { BoothBlock } from "./booth-block";
import { FlowLink } from "./flow-link";
import { useExpoRoute } from "./use-expo-route";

const COL = 162; // larghezza di una zona
const GAP = 56; // spazio tra due colonne (qui stanno le frecce laterali)
const LANE = 40; // corsia sopra e sotto le colonne per le frecce che scavalcano una colonna

const TONES: ZoneTone[] = ["gold", "magenta", "gray"];
const toneOf = (col: FairColumn, index: number): ZoneTone => col.tone ?? TONES[index % TONES.length];

export type FlowMapViewProps = {
  view: FairView;
  selectedId: number | null;
  /** percorso dello studente (null = nessuno) */
  route: number[] | null;
  stepIndex: number;
  currentBoothId: number | null;
  onOpen: (boothId: number) => void;
  /** anteprima admin: i booth sono bottoni */
  asButtons?: boolean;
};

/** Booth di una colonna nell'ordine in cui scorrono le frecce. */
const arrowOrder = (col: FairColumn) => (col.arrows === col.direction ? col.booths : [...col.booths].reverse());

function Zone({ col, index, column, ...map }: { col: FairColumn; index: number; column: number } & FlowMapViewProps) {
  const { view, selectedId, route, stepIndex, currentBoothId, onOpen, asButtons } = map;
  // dall'alto in basso: "up" mostra l'ultimo booth in cima
  const visual = col.direction === "up" ? [...col.booths].reverse() : col.booths;
  const edge = (a: number, b: number) => routeHasEdge(route, a, b) || routeHasEdge(route, b, a);

  return (
    <div
      className="expo-zone expo-tone"
      data-tone={toneOf(col, index)}
      style={{
        "--d": `${index * 120}ms`,
        justifyContent: col.direction === "up" ? "flex-end" : "flex-start",
        gridColumn: column,
        gridRow: 3,
      } as CSSProperties}
    >
      {col.label && <span className="expo-zone-label">{col.label}</span>}
      {visual.map((id, i) => {
        const company = view.byId.get(id);
        if (!company) return null;
        const step = route ? route.indexOf(id) : -1;
        return (
          <Fragment key={id}>
            {i > 0 && <FlowLink dir={col.arrows} active={edge(visual[i - 1], id)} />}
            <BoothBlock
              company={company}
              selected={selectedId === id}
              step={step === -1 ? null : step}
              current={currentBoothId === id}
              visited={step !== -1 && step < stepIndex}
              delay={150 + (index * col.booths.length + col.booths.indexOf(id)) * 40}
              onOpen={onOpen}
              asButton={asButtons}
            />
          </Fragment>
        );
      })}
    </div>
  );
}

/** Freccia che scavalca una o più colonne, sopra o sotto: parte dal centro di `from` e arriva al centro di `to`. */
function Lane({ side, from, to, active }: { side: "top" | "bottom"; from: number; to: number; active: boolean }) {
  const lo = Math.min(from, to);
  const hi = Math.max(from, to);
  const w = (hi - lo) * (COL + GAP);
  const xa = from < to ? 0 : w;
  const xb = from < to ? w : 0;
  const top = side === "top";
  const line = top ? `M${xa} ${LANE} V10 H${xb} V${LANE}` : `M${xa} 5 V${LANE - 10} H${xb} V5`;
  const head = top
    ? `${xb - 6},${LANE - 10} ${xb},${LANE} ${xb + 6},${LANE - 10}`
    : `${xb - 6},15 ${xb},5 ${xb + 6},15`;

  return (
    <svg
      aria-hidden
      className="expo-link"
      data-active={active}
      width={w}
      height={LANE}
      viewBox={`0 0 ${w} ${LANE}`}
      style={{
        gridColumn: `${2 * lo + 1} / ${2 * hi + 2}`,
        gridRow: top ? 2 : 4,
        marginLeft: COL / 2,
        alignSelf: "start",
      }}
    >
      <path className="expo-link-line" pathLength={1} d={line} />
      <polyline className="expo-link-head" points={head} />
    </svg>
  );
}

/**
 * Schema della sala: Timer in alto a tutta larghezza, colonne con i booth, Ingresso in basso.
 * Colonne e frecce seguono `slot`, `arrows` e `flow` di expo.json.
 */
export function FlowMapView(props: FlowMapViewProps) {
  const { view, route } = props;
  const { columns, timerLabel, entranceLabel, flow, entranceSlot } = view.layout;
  const rtl = view.layout.rtl === true;
  const n = columns.length;
  const pos = (c: FairColumn) => (rtl ? n - 1 - c.slot : c.slot);
  const byId = new Map(columns.map((c) => [c.id, c]));
  const template = Array.from({ length: n * 2 - 1 }, (_, i) => `${i % 2 === 0 ? COL : GAP}px`).join(" ");
  const entrancePos = rtl ? n - 1 - entranceSlot : entranceSlot;

  return (
    <div
      className="grid w-max p-12"
      style={{ gridTemplateColumns: template, gridTemplateRows: `auto ${LANE}px auto ${LANE}px auto` }}
    >
      <div className="expo-landmark" style={{ gridColumn: "1 / -1", gridRow: 1 }}>
        <Timer className="size-5" strokeWidth={1.5} aria-hidden />
        {timerLabel}
      </div>

      {columns.map((col, ci) => (
        <Zone key={col.id} col={col} index={ci} column={2 * pos(col) + 1} {...props} />
      ))}

      {flow.slice(0, -1).map((id, i) => {
        const a = byId.get(id);
        const b = byId.get(flow[i + 1]);
        if (!a || !b) return null;
        const exitTop = a.arrows === "up"; // le frecce salgono: si esce dall'alto
        const pa = pos(a);
        const pb = pos(b);
        const outs = arrowOrder(a);
        const ins = arrowOrder(b);
        const active = routeHasEdge(route, outs[outs.length - 1], ins[0]);

        if (Math.abs(pa - pb) === 1) {
          return (
            <div
              key={`${id}>${b.id}`}
              className="flex h-[72px] items-center justify-center"
              style={{
                gridColumn: 2 * Math.min(pa, pb) + 2,
                gridRow: 3,
                alignSelf: exitTop ? "start" : "end",
                ...(exitTop ? { marginTop: 17 } : { marginBottom: 17 }),
              }}
            >
              <FlowLink dir={pb > pa ? "right" : "left"} active={active} />
            </div>
          );
        }
        return <Lane key={`${id}>${b.id}`} side={exitTop ? "top" : "bottom"} from={pa} to={pb} active={active} />;
      })}

      <div className="expo-landmark" style={{ gridColumn: 2 * entrancePos + 1, gridRow: 5 }}>
        <DoorOpen className="size-5" strokeWidth={1.5} aria-hidden />
        {entranceLabel}
      </div>
    </div>
  );
}

/** Mappa pubblica: dati dal server + percorso dello studente. */
export function FlowMap({ selectedId }: { selectedId: number | null }) {
  const { route, stepIndex, currentBoothId, openBooth } = useExpoRoute();
  const { view, status } = useFairData();

  if (!view) {
    return (
      <p className="p-12 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--gray)]">
        {status === "error" ? "Mappa non disponibile. Riprovo tra poco…" : "Caricamento mappa…"}
      </p>
    );
  }
  return (
    <FlowMapView
      view={view}
      selectedId={selectedId}
      route={route}
      stepIndex={stepIndex}
      currentBoothId={currentBoothId}
      onOpen={openBooth}
    />
  );
}
