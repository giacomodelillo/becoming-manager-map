"use client";

import { useParams } from "next/navigation";
import { MapCanvas } from "@/components/expo/map-canvas";
import { useIdleReset } from "@/components/expo/use-idle-reset";

export function ExpoStage() {
  const { boothId } = useParams<{ boothId?: string }>();
  useIdleReset();

  const parsed = boothId ? Number(boothId) : NaN;
  return <MapCanvas selectedId={Number.isInteger(parsed) ? parsed : null} />;
}
