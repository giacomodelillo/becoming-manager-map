"use client";

import { Fragment, type CSSProperties } from "react";
import { DoorOpen, Timer } from "lucide-react";
import { useFairData } from "@/lib/expo/data-store";
import { routeHasEdge } from "@/lib/expo/route";
import type { FairColumn, FairView, ZoneTone } from "@/lib/expo/types";
import { BoothBlock } from "./booth-block";
import { FlowLink } from "./flow-link";
import { useExpoRoute } from "./use-expo-route";

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

function Zone({
  col,
  index,
  ...map
}: { col: FairColumn; index: number } & FlowMapViewProps) {
  const { view, selectedId, route, stepIndex, currentBoothId, onOpen, asButtons } = map;
  // dall'alto in basso: "up" mostra l'ultimo booth in cima
  const visual = col.direction === "up" ? [...col.booths].reverse() : col.booths;

  return (
    <div
      className="expo-zone expo-tone"
      data-tone={toneOf(col, index)}
      style={{
        "--d": `${index * 120}ms`,
        justifyContent: col.direction === "up" ? "flex-end" : "flex-start",
      } as CSSProperties}
    >
      {col.label && <span className="expo-zone-label">{col.label}</span>}
      {visual.map((id, i) => {
        const company = view.byId.get(id);
        if (!company) return null;
        const step = route ? route.indexOf(id) : -1;
        const [from, to] =
          col.direction === "up" ? [visual[i], visual[i - 1]] : [visual[i - 1], visual[i]];
        return (
          <Fragment key={id}>
            {i > 0 && <FlowLink dir={col.direction} active={routeHasEdge(route, from, to)} />}
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

/** Schema squadrato: Timer in alto, zone con booth e frecce di flusso, Ingresso in basso. Solo grafica. */
export function FlowMapView(props: FlowMapViewProps) {
  const { view, route } = props;
  const { columns, timerLabel, entranceLabel } = view.layout;
  const rtl = view.layout.rtl === true;

  return (
    <div className="flex w-max flex-col items-start gap-10 p-12">
      <div className="expo-landmark">
        <Timer className="size-5" strokeWidth={1.5} aria-hidden />
        {timerLabel}
      </div>

      <div className={`flex items-stretch ${rtl ? "flex-row-reverse" : ""}`}>
        {columns.map((col, ci) => {
          const next = columns[ci + 1];
          const active = next
            ? routeHasEdge(route, col.booths[col.booths.length - 1], next.booths[0])
            : false;
          return (
            <Fragment key={col.id}>
              <Zone col={col} index={ci} {...props} />
              {next && (
                <div
                  className={`flex h-[72px] w-14 items-center justify-center ${
                    col.direction === "up" ? "mt-[17px] self-start" : "mb-[17px] self-end"
                  }`}
                >
                  <FlowLink dir={rtl ? "left" : "right"} active={active} />
                </div>
              )}
            </Fragment>
          );
        })}
      </div>

      <div className={`flex w-[162px] flex-col items-center ${rtl ? "self-end" : ""}`}>
        {columns[0].direction === "up" && <FlowLink dir="up" active={false} />}
        <div className="expo-landmark">
          <DoorOpen className="size-5" strokeWidth={1.5} aria-hidden />
          {entranceLabel}
        </div>
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
