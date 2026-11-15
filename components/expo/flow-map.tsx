"use client";

import { Fragment, type CSSProperties } from "react";
import { DoorOpen, Timer } from "lucide-react";
import { fairLayout, getCompany } from "@/lib/expo/data";
import { routeHasEdge } from "@/lib/expo/route";
import type { FairColumn, ZoneTone } from "@/lib/expo/types";
import { BoothBlock } from "./booth-block";
import { FlowLink } from "./flow-link";
import { useExpoRoute } from "./use-expo-route";

const TONES: ZoneTone[] = ["gold", "magenta", "gray"];
const toneOf = (col: FairColumn, index: number): ZoneTone => col.tone ?? TONES[index % TONES.length];

function Zone({
  col,
  index,
  selectedId,
}: {
  col: FairColumn;
  index: number;
  selectedId: number | null;
}) {
  const { route, stepIndex, currentBoothId, openBooth } = useExpoRoute();
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
        const company = getCompany(id);
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
              onOpen={openBooth}
            />
          </Fragment>
        );
      })}
    </div>
  );
}

/** Schema squadrato: Timer in alto, zone con booth e frecce di flusso, Ingresso in basso. */
export function FlowMap({ selectedId }: { selectedId: number | null }) {
  const { route } = useExpoRoute();
  const { columns, timerLabel, entranceLabel } = fairLayout;

  return (
    <div className="flex w-max flex-col items-start gap-10 p-12">
      <div className="expo-landmark">
        <Timer className="size-5" strokeWidth={1.5} aria-hidden />
        {timerLabel}
      </div>

      <div className="flex items-stretch">
        {columns.map((col, ci) => {
          const next = columns[ci + 1];
          const active = next
            ? routeHasEdge(route, col.booths[col.booths.length - 1], next.booths[0])
            : false;
          return (
            <Fragment key={col.id}>
              <Zone col={col} index={ci} selectedId={selectedId} />
              {next && (
                <div
                  className={`flex h-[72px] w-14 items-center justify-center ${
                    col.direction === "up" ? "mt-[17px] self-start" : "mb-[17px] self-end"
                  }`}
                >
                  <FlowLink dir="right" active={active} />
                </div>
              )}
            </Fragment>
          );
        })}
      </div>

      <div className="flex w-[162px] flex-col items-center">
        <FlowLink dir="up" active={false} />
        <div className="expo-landmark">
          <DoorOpen className="size-5" strokeWidth={1.5} aria-hidden />
          {entranceLabel}
        </div>
      </div>
    </div>
  );
}
