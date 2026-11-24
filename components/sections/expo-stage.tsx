"use client";

import { Fragment } from "react";
import { useParams } from "next/navigation";
import { FlowMap } from "@/components/expo/flow-map";
import { FocusOnStep } from "@/components/expo/focus-on-step";
import { MapCanvas } from "@/components/expo/map-canvas";
import { OfflineBadge } from "@/components/expo/offline-badge";
import { StepControls } from "@/components/expo/step-controls";
import { StudentSync } from "@/components/expo/student-sync";
import { useIdleReset } from "@/components/expo/use-idle-reset";
import { useFairView } from "@/lib/expo/data-store";
import { layoutSignature } from "@/lib/expo/derive";
import { mapTextPx } from "@/lib/expo/display";

export function ExpoStage() {
  const { boothId } = useParams<{ boothId?: string }>();
  const view = useFairView();
  useIdleReset();

  const parsed = boothId ? Number(boothId) : NaN;
  const selectedId = Number.isInteger(parsed) ? parsed : null;

  return (
    <MapCanvas
      refitKey={layoutSignature(view)}
      minTextPx={mapTextPx(view?.display.mapSize ?? "fit")}
      overlay={
        <Fragment>
          <StepControls />
          <FocusOnStep />
          <StudentSync />
          <OfflineBadge />
        </Fragment>
      }
    >
      <FlowMap selectedId={selectedId} />
    </MapCanvas>
  );
}
