"use client";

import { Fragment } from "react";
import { useParams } from "next/navigation";
import { FlowMap } from "@/components/expo/flow-map";
import { FocusOnStep } from "@/components/expo/focus-on-step";
import { MapCanvas } from "@/components/expo/map-canvas";
import { StepControls } from "@/components/expo/step-controls";
import { useIdleReset } from "@/components/expo/use-idle-reset";
import { layoutSignature } from "@/lib/expo/derive";
import { useFairView } from "@/lib/expo/data-store";

export function ExpoStage() {
  const { boothId } = useParams<{ boothId?: string }>();
  const view = useFairView();
  useIdleReset();

  const parsed = boothId ? Number(boothId) : NaN;
  const selectedId = Number.isInteger(parsed) ? parsed : null;

  return (
    <MapCanvas
      refitKey={layoutSignature(view)}
      overlay={
        <Fragment>
          <StepControls />
          <FocusOnStep />
        </Fragment>
      }
    >
      <FlowMap selectedId={selectedId} />
    </MapCanvas>
  );
}
